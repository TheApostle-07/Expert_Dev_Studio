import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { AuditModel } from "../../../../lib/models/Audit";
import { finalizeUnlockAfterLead, CouponError } from "../../../../lib/coupons";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(req: Request) {
  await connectToDatabase();

  let payload: {
    auditId?: string;
    name?: string;
    email?: string;
    phone?: string;
    consent?: boolean;
  };

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const { auditId, name, email, phone, consent } = payload;

  if (!auditId || typeof auditId !== "string") {
    return NextResponse.json(
      { ok: false, error: "Audit ID is required" },
      { status: 400 }
    );
  }

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json(
      { ok: false, error: "Name is required" },
      { status: 400 }
    );
  }

  if (!email || typeof email !== "string" || !isValidEmail(email.trim())) {
    return NextResponse.json(
      { ok: false, error: "Valid email is required" },
      { status: 400 }
    );
  }

  if (phone && typeof phone !== "string") {
    return NextResponse.json(
      { ok: false, error: "Invalid phone number" },
      { status: 400 }
    );
  }

  if (!consent) {
    return NextResponse.json(
      { ok: false, error: "Consent is required" },
      { status: 400 }
    );
  }

  const audit = await AuditModel.findById(auditId).exec();
  if (!audit) {
    return NextResponse.json({ ok: false, error: "Audit not found" }, { status: 404 });
  }

  audit.leadName = name.trim();
  audit.leadEmail = email.trim().toLowerCase();
  audit.leadPhone = phone?.trim() || undefined;
  audit.leadConsentAt = new Date();
  audit.leadCapturedAt = new Date();
  await audit.save();

  try {
    const result = await finalizeUnlockAfterLead(auditId);
    return NextResponse.json({ ok: true, unlocked: result.unlocked });
  } catch (error) {
    if (error instanceof CouponError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    return NextResponse.json({ ok: false, error: "Failed to unlock report" }, { status: 500 });
  }
}
