import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../../lib/mongodb";
import { requireAdmin } from "../../../../../../lib/sprint/adminApi";
import { adminStatusSchema } from "../../../../../../lib/sprint/validation";
import { SprintBookingModel } from "../../../../../../lib/models/SprintBooking";
import { logAdminAction } from "../../../../../../lib/sprint/audit";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const auth = requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const payload = await req.json().catch(() => null);
  const parsed = adminStatusSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const booking = await SprintBookingModel.findById(params.id).exec();
  if (!booking) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  booking.status = parsed.data.status;
  if (parsed.data.notes) booking.notes = parsed.data.notes;
  if (parsed.data.status === "DRAFT_SENT") booking.draftSentAt = new Date();
  if (parsed.data.status === "CLIENT_APPROVED") booking.approvedAt = new Date();
  if (parsed.data.status === "COMPLETED") booking.completedAt = new Date();
  await booking.save();
  await logAdminAction({
    adminKey: "admin",
    action: `STATUS_${parsed.data.status}`,
    bookingId: booking._id.toString(),
    meta: { notes: parsed.data.notes },
  });
  return NextResponse.json({ ok: true });
}
