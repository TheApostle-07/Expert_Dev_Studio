import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { SprintSlotModel } from "../../../../lib/models/SprintSlot";
import { SlotLockModel } from "../../../../lib/models/SlotLock";
import { SprintBookingModel } from "../../../../lib/models/SprintBooking";

export async function GET() {
  await connectToDatabase();
  const now = new Date();
  const slots = await SprintSlotModel.find({
    isActive: true,
    startTime: { $gte: now },
  })
    .sort({ startTime: 1 })
    .limit(20)
    .lean();

  const slotIds = slots.map((slot) => slot._id);
  const bookings = await SprintBookingModel.find({ slotId: { $in: slotIds } })
    .select("slotId")
    .lean();
  const locks = await SlotLockModel.find({
    slotId: { $in: slotIds },
    expiresAt: { $gt: now },
  })
    .select("slotId")
    .lean();

  const bookedSet = new Set(bookings.map((b) => b.slotId.toString()));
  const lockSet = new Set(locks.map((l) => l.slotId.toString()));

  const available = slots.filter(
    (slot) => !bookedSet.has(slot._id.toString()) && !lockSet.has(slot._id.toString())
  );

  return NextResponse.json({
    ok: true,
    slots: available.slice(0, 10).map((slot) => ({
      id: slot._id.toString(),
      startTime: slot.startTime.toISOString(),
      endTime: slot.endTime.toISOString(),
    })),
  });
}
