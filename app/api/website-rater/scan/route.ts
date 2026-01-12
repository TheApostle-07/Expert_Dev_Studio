import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { AuditModel } from "../../../../lib/models/Audit";
import { guardUrl } from "../../../../lib/security/urlGuard";
import { enforceRateLimit } from "../../../../lib/rateLimit";
import { ensureScanWorker } from "../../../../lib/scanQueue";

const SCAN_LIMIT = 10;
const SCAN_WINDOW_MS = 60 * 60 * 1000;
const SCAN_RECENT_WINDOW_MS = Number.parseInt(
  process.env.SCAN_RECENT_WINDOW_MS || "600000",
  10
);

export async function POST(req: Request) {
  await connectToDatabase();

  const rate = await enforceRateLimit({
    req,
    action: "scan",
    limit: SCAN_LIMIT,
    windowMs: SCAN_WINDOW_MS,
  });

  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false, error: "Rate limit exceeded. Try again later." },
      { status: 429 }
    );
  }

  let payload: { url?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  if (!payload.url || typeof payload.url !== "string") {
    return NextResponse.json(
      { ok: false, error: "URL is required" },
      { status: 400 }
    );
  }

  const rawUrl = payload.url.trim();
  if (!rawUrl) {
    return NextResponse.json(
      { ok: false, error: "URL is required" },
      { status: 400 }
    );
  }

  let normalized: { normalizedUrl: string; host: string };
  try {
    normalized = await guardUrl(rawUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid URL";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  const basePriceInr = Number.parseInt(
    process.env.AUDIT_FULL_PRICE_INR || "199",
    10
  );

  const reuseAfter = new Date(Date.now() - SCAN_RECENT_WINDOW_MS);
  const cached = await AuditModel.findOne({
    urlNormalized: normalized.normalizedUrl,
    status: "DONE",
    createdAt: { $gte: reuseAfter },
    preview: { $exists: true },
  })
    .sort({ createdAt: -1 })
    .lean();

  if (cached && cached.preview && cached.scoreOverall != null && cached.label) {
    const cachedAudit = await AuditModel.create({
      ipHash: rate.ipHash,
      urlRaw: rawUrl,
      urlNormalized: normalized.normalizedUrl,
      host: normalized.host,
      status: "DONE",
      scanStartedAt: new Date(),
      scanCompletedAt: new Date(),
      scoreOverall: cached.scoreOverall,
      label: cached.label,
      preview: cached.preview,
      basePriceInr,
      currency: "INR",
      isUnlocked: false,
    });

    return NextResponse.json({
      ok: true,
      auditId: cachedAudit._id.toString(),
      status: cachedAudit.status,
      cached: true,
    });
  }

  const audit = await AuditModel.create({
    ipHash: rate.ipHash,
    urlRaw: rawUrl,
    urlNormalized: normalized.normalizedUrl,
    host: normalized.host,
    status: "QUEUED",
    basePriceInr,
    currency: "INR",
    isUnlocked: false,
  });

  ensureScanWorker();

  return NextResponse.json({
    ok: true,
    auditId: audit._id.toString(),
    status: audit.status,
  });
}
