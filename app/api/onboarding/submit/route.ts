import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { LeadModel } from "../../../../lib/models/Lead";
import { logEvent } from "../../../../lib/founders/logger";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(req: Request) {
  await connectToDatabase();

  let payload: {
    leadId?: string;
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    website?: string;
    goals?: string;
    timeline?: string;
  };

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  if (!payload.leadId || typeof payload.leadId !== "string") {
    return NextResponse.json(
      { ok: false, error: "Lead ID is required" },
      { status: 400 }
    );
  }

  if (!payload.name || payload.name.trim().length < 2) {
    return NextResponse.json(
      { ok: false, error: "Full name is required" },
      { status: 400 }
    );
  }

  if (!payload.email || !isValidEmail(payload.email.trim())) {
    return NextResponse.json(
      { ok: false, error: "Valid email is required" },
      { status: 400 }
    );
  }

  const lead = await LeadModel.findById(payload.leadId).exec();
  if (!lead) {
    return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
  }

  lead.name = payload.name.trim();
  lead.email = payload.email.trim().toLowerCase();
  lead.phone = payload.phone?.trim() || undefined;
  lead.company = payload.company?.trim() || undefined;
  lead.website = payload.website?.trim() || undefined;
  lead.goals = payload.goals?.trim() || undefined;
  lead.timeline = payload.timeline?.trim() || undefined;
  lead.onboardingSubmittedAt = new Date();
  if (lead.status === "NEW") {
    lead.status = "ONBOARDING";
  }
  await lead.save();

  logEvent("ONBOARDING_SUBMITTED", { leadId: lead._id.toString() });

  return NextResponse.json({ ok: true });
}
