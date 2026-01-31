import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { getSessionUserId } from "../../../../lib/sprint/auth";
import { SprintBookingModel } from "../../../../lib/models/SprintBooking";
import { SprintSlotModel } from "../../../../lib/models/SprintSlot";

export async function GET(req: Request) {
  await connectToDatabase();
  const userId = getSessionUserId();
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const bookingId = searchParams.get("bookingId");
  const booking = bookingId
    ? await SprintBookingModel.findById(bookingId).lean()
    : await SprintBookingModel.findOne({ userId }).sort({ createdAt: -1 }).lean();
  if (!booking || booking.userId.toString() !== userId) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
  if (
    booking.status === "CONFIRMED" &&
    !booking.intakeSubmittedAt &&
    new Date(booking.createdAt).getTime() + 24 * 60 * 60 * 1000 < Date.now()
  ) {
    await SprintBookingModel.updateOne(
      { _id: booking._id },
      { $set: { status: "STALE" } }
    ).exec();
  }
  const slot = await SprintSlotModel.findById(booking.slotId).lean();
  return NextResponse.json({
    ok: true,
    booking: {
      id: booking._id.toString(),
      bookingCode: booking.bookingCode,
      status: booking.status,
      slotStart: slot?.startTime?.toISOString(),
      slotEnd: slot?.endTime?.toISOString(),
      intakeSubmittedAt: booking.intakeSubmittedAt?.toISOString(),
    },
  });
}
