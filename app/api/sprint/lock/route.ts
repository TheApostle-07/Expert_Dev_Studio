import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { lockSchema } from "../../../../lib/sprint/validation";
import { getSessionUserId } from "../../../../lib/sprint/auth";
import { SlotLockModel } from "../../../../lib/models/SlotLock";
import { SprintBookingModel } from "../../../../lib/models/SprintBooking";
import { SLOT_LOCK_TTL_MS } from "../../../../lib/sprint/constants";

export async function POST(req: Request) {
  await connectToDatabase();
  const userId = getSessionUserId();
  if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const payload = await req.json().catch(() => null);
  const parsed = lockSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + SLOT_LOCK_TTL_MS);

  const existingBooking = await SprintBookingModel.findOne({ slotId: parsed.data.slotId }).lean();
  if (existingBooking) {
    return NextResponse.json({ ok: false, error: "Slot already booked" }, { status: 409 });
  }

  try {
    const lock = await SlotLockModel.findOneAndUpdate(
      { slotId: parsed.data.slotId, $or: [{ expiresAt: { $lte: now } }, { expiresAt: { $exists: false } }] },
      { $set: { slotId: parsed.data.slotId, userId, expiresAt } },
      { upsert: true, new: true }
    ).exec();

    if (!lock) {
      return NextResponse.json({ ok: false, error: "Slot locked" }, { status: 409 });
    }

    return NextResponse.json({
      ok: true,
      expiresAt: lock.expiresAt.toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lock error";
    if (message.includes("E11000")) {
      return NextResponse.json({ ok: false, error: "Slot locked" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: "Unable to lock slot" }, { status: 500 });
  }
}
