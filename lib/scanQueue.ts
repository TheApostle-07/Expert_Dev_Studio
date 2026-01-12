import { AuditModel } from "./models/Audit";
import { runQuickAudit, AnalyzerError } from "./analyzer";

type ScanWorkerState = {
  started?: boolean;
  active?: number;
  timer?: NodeJS.Timeout;
};

const globalState = globalThis as typeof globalThis & {
  __scanWorkerState?: ScanWorkerState;
};

const MAX_CONCURRENCY = Number.parseInt(
  process.env.SCAN_WORKER_CONCURRENCY || "2",
  10
);
const POLL_MS = Number.parseInt(process.env.SCAN_WORKER_POLL_MS || "1500", 10);
const MAX_RETRIES = Number.parseInt(process.env.SCAN_MAX_RETRIES || "2", 10);
const STUCK_AFTER_MS = Number.parseInt(
  process.env.SCAN_STUCK_AFTER_MS || "60000",
  10
);

export function ensureScanWorker() {
  if (!globalState.__scanWorkerState) {
    globalState.__scanWorkerState = { active: 0 };
  }
  const state = globalState.__scanWorkerState;
  if (state.started) return;
  state.started = true;

  state.timer = setInterval(() => {
    void tick();
  }, POLL_MS);
}

async function tick() {
  const state = globalState.__scanWorkerState;
  if (!state) return;

  while ((state.active || 0) < MAX_CONCURRENCY) {
    const now = new Date();
    const stuckBefore = new Date(now.getTime() - STUCK_AFTER_MS);
    const audit = await AuditModel.findOneAndUpdate(
      {
        scanAttempts: { $lt: MAX_RETRIES },
        $or: [
          { status: "QUEUED" },
          { status: "RUNNING", scanStartedAt: { $lte: stuckBefore } },
        ],
      },
      {
        $set: { status: "RUNNING", scanStartedAt: now },
        $inc: { scanAttempts: 1 },
      },
      { sort: { createdAt: 1 }, new: true }
    ).exec();

    if (!audit) break;
    state.active = (state.active || 0) + 1;

    void runAudit(audit._id.toString())
      .catch(() => null)
      .finally(() => {
        state.active = Math.max(0, (state.active || 1) - 1);
      });
  }
}

async function runAudit(auditId: string) {
  const audit = await AuditModel.findById(auditId).exec();
  if (!audit) return;

  try {
    const result = await runQuickAudit(audit.urlRaw);
    audit.status = "DONE";
    audit.scoreOverall = result.scoreOverall;
    audit.label = result.label;
    audit.preview = result.preview;
    audit.urlNormalized = result.normalizedUrl;
    audit.host = result.host;
    audit.scanCompletedAt = new Date();
    audit.scanError = undefined;
    await audit.save();
  } catch (error) {
    const message =
      error instanceof AnalyzerError ? error.message : "Failed to scan URL";
    const retryable =
      error instanceof AnalyzerError &&
      (error.code === "TIMEOUT" || error.code === "NETWORK_ERROR");
    audit.scanError = message;
    audit.scanCompletedAt = new Date();
    if (retryable && audit.scanAttempts < MAX_RETRIES) {
      audit.status = "QUEUED";
    } else {
      audit.status = "FAILED";
    }
    await audit.save();
  }
}
