import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { orderSchema } from "../../../../lib/sprint/validation";
import { getSessionUserId } from "../../../../lib/sprint/auth";
import { SlotLockModel } from "../../../../lib/models/SlotLock";
import { SprintBookingModel } from "../../../../lib/models/SprintBooking";
import { SprintSlotModel } from "../../../../lib/models/SprintSlot";
import { PaymentModel } from "../../../../lib/models/Payment";
import { generateBookingCode } from "../../../../lib/sprint/utils";
import { getRazorpayClient, RAZORPAY_KEY_ID } from "../../../../lib/razorpay";
import { SPRINT_START_FEE, SPRINT_PRICE_TOTAL, SPRINT_BALANCE_DUE } from "../../../../lib/sprint/constants";

export async function POST(req: Request) {
  await connectToDatabase();
  const userId = getSessionUserId();
  if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const payload = await req.json().catch(() => null);
  const parsed = orderSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  if (!RAZORPAY_KEY_ID) {
    return NextResponse.json({ ok: false, error: "Payment configuration missing" }, { status: 500 });
  }

  const now = new Date();
  const lock = await SlotLockModel.findOne({
    slotId: parsed.data.slotId,
    userId,
    expiresAt: { $gt: now },
  }).lean();
  if (!lock) {
    return NextResponse.json({ ok: false, error: "Slot lock expired" }, { status: 409 });
  }

  const slot = await SprintSlotModel.findById(parsed.data.slotId).lean();
  if (!slot || !slot.isActive) {
    return NextResponse.json({ ok: false, error: "Slot unavailable" }, { status: 409 });
  }

  const existingBooking = await SprintBookingModel.findOne({ slotId: parsed.data.slotId }).lean();
  if (existingBooking) {
    return NextResponse.json({ ok: false, error: "Slot already booked" }, { status: 409 });
  }

  let booking = await SprintBookingModel.findOne({ userId, slotId: parsed.data.slotId }).exec();
  if (!booking) {
    booking = await SprintBookingModel.create({
      bookingCode: generateBookingCode(),
      userId,
      slotId: parsed.data.slotId,
      status: "LOCKED",
      priceTotal: SPRINT_PRICE_TOTAL,
      startFee: SPRINT_START_FEE,
      balanceDue: SPRINT_BALANCE_DUE,
    });
  }

  const existingPayment = await PaymentModel.findOne({ bookingId: booking._id, status: "created" }).lean();
  if (existingPayment) {
    return NextResponse.json({
      ok: true,
      bookingId: booking._id.toString(),
      bookingCode: booking.bookingCode,
      orderId: existingPayment.orderId,
      amount: existingPayment.amount,
      keyId: RAZORPAY_KEY_ID,
    });
  }

  let order;
  try {
    const client = getRazorpayClient();
    order = await client.orders.create({
      amount: SPRINT_START_FEE * 100,
      currency: "INR",
      receipt: `sprint_${booking._id.toString().slice(-6)}_${Date.now()}`.slice(0, 40),
      notes: {
        bookingId: booking._id.toString(),
        bookingCode: booking.bookingCode,
        type: "lead_catcher_sprint",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment error";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }

  await PaymentModel.create({
    bookingId: booking._id,
    orderId: order.id,
    amount: SPRINT_START_FEE,
    currency: "INR",
    status: "created",
    rawPayload: order,
  });
  booking.status = "ORDER_CREATED";
  await booking.save();

  return NextResponse.json({
    ok: true,
    bookingId: booking._id.toString(),
    bookingCode: booking.bookingCode,
    orderId: order.id,
    amount: SPRINT_START_FEE,
    keyId: RAZORPAY_KEY_ID,
  });
}
