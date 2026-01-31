import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { getSessionUserId } from "../../../../lib/sprint/auth";
import { SprintUserModel } from "../../../../lib/models/SprintUser";
import { SprintBookingModel } from "../../../../lib/models/SprintBooking";
import { SprintSlotModel } from "../../../../lib/models/SprintSlot";

export async function GET() {
  await connectToDatabase();
  const userId = getSessionUserId();
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });
  const user = await SprintUserModel.findById(userId).lean();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const booking = await SprintBookingModel.findOne({ userId })
    .sort({ createdAt: -1 })
    .lean();
  let slot = null;
  if (booking?.slotId) {
    slot = await SprintSlotModel.findById(booking.slotId).lean();
  }
  return NextResponse.json({
    ok: true,
    user: { id: user._id.toString(), email: user.email, phone: user.phone },
    booking: booking
      ? {
          id: booking._id.toString(),
          bookingCode: booking.bookingCode,
          status: booking.status,
          slotId: booking.slotId.toString(),
          slotStart: slot?.startTime?.toISOString(),
          slotEnd: slot?.endTime?.toISOString(),
          intakeSubmittedAt: booking.intakeSubmittedAt?.toISOString(),
        }
      : null,
  });
}
