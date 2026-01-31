import crypto from "crypto";
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { WebhookEventModel } from "../../../../lib/models/WebhookEvent";
import { PaymentModel } from "../../../../lib/models/Payment";
import { SprintBookingModel } from "../../../../lib/models/SprintBooking";
import { enqueueIntakeNudges } from "../../../../lib/sprint/notifications";

function verifySignature(rawBody: string, signature: string, secret: string) {
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== signatureBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

export async function POST(req: Request) {
  await connectToDatabase();
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "Webhook secret missing" }, { status: 500 });
  }

  const signature = req.headers.get("x-razorpay-signature") || "";
  const rawBody = await req.text();
  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 400 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const eventId = (payload as { id?: string }).id;
  const eventType = payload.event as string | undefined;
  if (eventId) {
    const exists = await WebhookEventModel.findOne({ eventId }).lean();
    if (exists) return NextResponse.json({ ok: true });
  }

  const paymentEntity = (payload as {
    payload?: { payment?: { entity?: Record<string, unknown> } };
  })?.payload?.payment?.entity;
  const orderId = paymentEntity?.order_id as string | undefined;
  const paymentId = paymentEntity?.id as string | undefined;

  if (!orderId) {
    return NextResponse.json({ ok: true });
  }

  if (eventType === "payment.captured" || eventType === "order.paid") {
    const payment = await PaymentModel.findOne({ orderId }).exec();
    if (payment) {
      payment.status = "captured";
      if (paymentId) payment.paymentId = paymentId;
      payment.rawPayload = paymentEntity;
      await payment.save();
      if (payment.bookingId) {
        const booking = await SprintBookingModel.findById(payment.bookingId).exec();
        if (booking && booking.status !== "CONFIRMED") {
          booking.status = "CONFIRMED";
          await booking.save();
          await enqueueIntakeNudges({
            userId: booking.userId.toString(),
            bookingId: booking._id.toString(),
            baseTime: new Date(),
          });
        }
      }
    }
  }

  if (eventId) {
    await WebhookEventModel.create({
      eventId,
      type: eventType || "unknown",
      payload,
    });
  }

  return NextResponse.json({ ok: true });
}
