import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../../lib/mongodb";
import { LeadModel } from "../../../../../../lib/models/Lead";
import { requireAdminToken } from "../../../../../../lib/founders/admin";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = requireAdminToken(req);
  if (auth instanceof NextResponse) return auth;

  await connectToDatabase();

  let payload: { status?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  if (!payload.status || typeof payload.status !== "string") {
    return NextResponse.json(
      { ok: false, error: "Status is required" },
      { status: 400 }
    );
  }

  const lead = await LeadModel.findByIdAndUpdate(
    params.id,
    { $set: { status: payload.status } },
    { new: true }
  ).exec();

  if (!lead) {
    return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, status: lead.status });
}
