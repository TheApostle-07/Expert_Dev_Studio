import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { AuditModel } from "../../../../lib/models/Audit";

export async function POST(req: Request) {
  await connectToDatabase();

  let payload: { auditId?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  if (!payload.auditId || typeof payload.auditId !== "string") {
    return NextResponse.json(
      { ok: false, error: "Audit ID is required" },
      { status: 400 }
    );
  }

  const audit = await AuditModel.findById(payload.auditId).exec();
  if (!audit) {
    return NextResponse.json({ ok: false, error: "Audit not found" }, { status: 404 });
  }

  if (audit.status !== "DONE") {
    return NextResponse.json(
      { ok: false, error: "Audit not ready yet" },
      { status: 400 }
    );
  }

  if (!audit.isUnlocked) {
    return NextResponse.json(
      { ok: false, error: "Report not unlocked" },
      { status: 403 }
    );
  }

  const snapshot = {
    savedAt: new Date(),
    url: audit.urlNormalized,
    label: audit.label,
    scoreOverall: audit.scoreOverall,
    preview: audit.preview,
  };

  audit.snapshot = snapshot;
  audit.snapshotSavedAt = snapshot.savedAt;
  await audit.save();

  return NextResponse.json({ ok: true, snapshotSavedAt: audit.snapshotSavedAt });
}
