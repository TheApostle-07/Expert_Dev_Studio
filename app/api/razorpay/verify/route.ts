import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { verifySchema } from "../../../../lib/sprint/validation";
import { verifyRazorpaySignature } from "../../../../lib/razorpay";
import { PaymentModel } from "../../../../lib/models/Payment";
import { SprintBookingModel } from "../../../../lib/models/SprintBooking";
import { enqueueIntakeNudges } from "../../../../lib/sprint/notifications";

export async function POST(req: Request) {
  await connectToDatabase();
  const payload = await req.json().catch(() => null);
  const parsed = verifySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const valid = verifyRazorpaySignature({
    orderId: parsed.data.razorpay_order_id,
    paymentId: parsed.data.razorpay_payment_id,
    signature: parsed.data.razorpay_signature,
  });
  if (!valid) {
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 400 });
  }

  const payment = await PaymentModel.findOne({ orderId: parsed.data.razorpay_order_id }).exec();
  if (!payment) {
    return NextResponse.json({ ok: false, error: "Payment not found" }, { status: 404 });
  }
  if (payment.status !== "captured") {
    payment.status = "captured";
    payment.paymentId = parsed.data.razorpay_payment_id;
    payment.signature = parsed.data.razorpay_signature;
    await payment.save();
  }

  const booking = await SprintBookingModel.findById(parsed.data.bookingId).exec();
  if (!booking) {
    return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });
  }
  if (booking.status !== "CONFIRMED") {
    booking.status = "CONFIRMED";
    await booking.save();
    await enqueueIntakeNudges({
      userId: booking.userId.toString(),
      bookingId: booking._id.toString(),
      baseTime: new Date(),
    });
  }

  return NextResponse.json({ ok: true });
}
