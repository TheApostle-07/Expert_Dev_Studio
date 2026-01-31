import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../../lib/mongodb";
import { requireAdmin } from "../../../../../../lib/sprint/adminApi";
import { rescheduleSchema } from "../../../../../../lib/sprint/validation";
import { SprintBookingModel } from "../../../../../../lib/models/SprintBooking";
import { SprintSlotModel } from "../../../../../../lib/models/SprintSlot";
import { logAdminAction } from "../../../../../../lib/sprint/audit";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const auth = requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const payload = await req.json().catch(() => null);
  const parsed = rescheduleSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const booking = await SprintBookingModel.findById(params.id).exec();
  if (!booking) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  const slot = await SprintSlotModel.findById(parsed.data.slotId).lean();
  if (!slot || !slot.isActive) {
    return NextResponse.json({ ok: false, error: "Slot unavailable" }, { status: 409 });
  }

  const conflict = await SprintBookingModel.findOne({ slotId: parsed.data.slotId }).lean();
  if (conflict) {
    return NextResponse.json({ ok: false, error: "Slot already booked" }, { status: 409 });
  }

  booking.slotId = parsed.data.slotId as any;
  booking.status = "RESCHEDULED";
  await booking.save();
  await logAdminAction({
    adminKey: "admin",
    action: "RESCHEDULE",
    bookingId: booking._id.toString(),
    meta: { slotId: parsed.data.slotId },
  });
  return NextResponse.json({ ok: true });
}
