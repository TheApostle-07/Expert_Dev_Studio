import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { requireAdmin } from "../../../../lib/sprint/adminApi";
import { SprintBookingModel } from "../../../../lib/models/SprintBooking";
import { SprintSlotModel } from "../../../../lib/models/SprintSlot";
import { SprintUserModel } from "../../../../lib/models/SprintUser";
import { SprintIntakeModel } from "../../../../lib/models/SprintIntake";

export async function GET(req: Request) {
  await connectToDatabase();
  const auth = requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const intake = searchParams.get("intake");

  const filter: Record<string, unknown> = {};
  if (status && status !== "ALL") filter.status = status;
  if (start || end) {
    filter.createdAt = {
      ...(start ? { $gte: new Date(start) } : {}),
      ...(end ? { $lte: new Date(end) } : {}),
    };
  }

  const bookings = await SprintBookingModel.find(filter)
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  const slotIds = bookings.map((b) => b.slotId);
  const userIds = bookings.map((b) => b.userId);
  const slots = await SprintSlotModel.find({ _id: { $in: slotIds } }).lean();
  const users = await SprintUserModel.find({ _id: { $in: userIds } }).lean();
  const intakes = await SprintIntakeModel.find({ bookingId: { $in: bookings.map((b) => b._id) } }).lean();

  const slotMap = new Map(slots.map((s) => [s._id.toString(), s]));
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));
  const intakeSet = new Set(intakes.map((i) => i.bookingId.toString()));

  const list = bookings
    .filter((b) => (intake ? (intake === "yes" ? intakeSet.has(b._id.toString()) : !intakeSet.has(b._id.toString())) : true))
    .map((booking) => {
      const slot = slotMap.get(booking.slotId.toString());
      const user = userMap.get(booking.userId.toString());
      return {
        id: booking._id.toString(),
        bookingCode: booking.bookingCode,
        status: booking.status,
        slotStart: slot?.startTime?.toISOString(),
        slotEnd: slot?.endTime?.toISOString(),
        email: user?.email,
        createdAt: booking.createdAt.toISOString(),
        intakeSubmittedAt: booking.intakeSubmittedAt?.toISOString(),
      };
    });

  return NextResponse.json({ ok: true, bookings: list });
}
