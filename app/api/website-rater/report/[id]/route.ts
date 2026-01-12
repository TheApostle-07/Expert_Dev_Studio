import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/mongodb";
import { AuditModel } from "../../../../../lib/models/Audit";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();

  const audit = await AuditModel.findById(params.id).exec();
  if (!audit) {
    return NextResponse.json({ ok: false, error: "Audit not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    audit: {
      id: audit._id.toString(),
      status: audit.status,
      scoreOverall: audit.scoreOverall,
      label: audit.label,
      preview: audit.isUnlocked ? audit.preview : null,
      fullReport: audit.isUnlocked ? audit.fullReport : null,
      isUnlocked: audit.isUnlocked,
      currency: audit.currency,
      basePriceInr: audit.basePriceInr,
      finalPriceInr: audit.finalPriceInr,
      couponCodeApplied: audit.couponCodeApplied,
      couponReservationId: audit.couponReservationId,
      paidAt: audit.paidAt,
    },
  });
}
