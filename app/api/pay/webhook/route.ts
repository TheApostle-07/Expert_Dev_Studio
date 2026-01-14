import crypto from "crypto";
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { LeadModel } from "../../../../lib/models/Lead";
import { SpinOfferModel } from "../../../../lib/models/SpinOffer";
import { PaymentEventModel } from "../../../../lib/models/PaymentEvent";
import { logEvent } from "../../../../lib/founders/logger";

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
    return NextResponse.json(
      { ok: false, error: "Webhook secret missing" },
      { status: 500 }
    );
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

  const event = payload.event as string | undefined;
  const paymentEntity = (payload as {
    payload?: { payment?: { entity?: Record<string, unknown> } };
  })?.payload?.payment?.entity;

  if (!paymentEntity) {
    return NextResponse.json({ ok: true });
  }

  const orderId = paymentEntity.order_id as string | undefined;
  const paymentId = paymentEntity.id as string | undefined;
  const amountPaise = paymentEntity.amount as number | undefined;
  const amountInr = amountPaise ? Math.round(amountPaise / 100) : undefined;
  const eventId = (payload as { id?: string }).id;

  if (!orderId || !paymentId) {
    return NextResponse.json({ ok: true });
  }

  const orFilters = [{ paymentId }];
  if (eventId) {
    orFilters.push({ eventId });
  }
  const existingEvent = await PaymentEventModel.findOne({ $or: orFilters }).exec();
  if (existingEvent) {
    return NextResponse.json({ ok: true });
  }

  const lead = await LeadModel.findOne({ orderId }).exec();
  if (!lead) {
    logEvent("WEBHOOK_UNKNOWN_ORDER", { orderId, paymentId });
    return NextResponse.json({ ok: true });
  }

  const isPaidEvent = event === "payment.captured" || event === "order.paid";
  if (isPaidEvent) {
    lead.paymentId = paymentId;
    lead.amountPaidInr = amountInr || lead.amountPaidInr;
    lead.paymentStatus = lead.paymentOption === "DEPOSIT" ? "DEPOSIT_PAID" : "PAID";
    lead.status = "ONBOARDING";
    await lead.save();

    await SpinOfferModel.updateOne(
      { _id: lead.offerId },
      { $set: { status: "PAID" } }
    ).exec();

    logEvent("WEBHOOK_PAID", {
      leadId: lead._id.toString(),
      orderId,
      paymentId,
    });
  }

  await PaymentEventModel.create({
    leadId: lead._id,
    offerId: lead.offerId,
    type: isPaidEvent ? "WEBHOOK_PAID" : event || "WEBHOOK_OTHER",
    orderId,
    paymentId,
    eventId,
    amountInr,
  });

  return NextResponse.json({ ok: true });
}
