import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { LeadModel } from "../../../../lib/models/Lead";
import { SpinOfferModel } from "../../../../lib/models/SpinOffer";
import { SpinSessionModel } from "../../../../lib/models/SpinSession";
import { PaymentEventModel } from "../../../../lib/models/PaymentEvent";
import { getRazorpayClient, RAZORPAY_KEY_ID } from "../../../../lib/razorpay";
import { DEPOSIT_INR } from "../../../../lib/founders/prizes";
import { expireOffer } from "../../../../lib/founders/state";
import { logEvent } from "../../../../lib/founders/logger";

export async function POST(req: Request) {
  await connectToDatabase();

  let payload: { leadId?: string; paymentOption?: "FULL" | "DEPOSIT" };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  if (!payload.leadId || typeof payload.leadId !== "string") {
    return NextResponse.json(
      { ok: false, error: "Lead ID is required" },
      { status: 400 }
    );
  }

  const lead = await LeadModel.findById(payload.leadId).exec();
  if (!lead) {
    return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
  }

  const offer = await SpinOfferModel.findById(lead.offerId).exec();
  if (!offer) {
    return NextResponse.json({ ok: false, error: "Offer not found" }, { status: 404 });
  }

  if (offer.status !== "ACCEPTED" && offer.status !== "PAID") {
    return NextResponse.json(
      { ok: false, error: "Offer not accepted yet" },
      { status: 400 }
    );
  }

  const now = new Date();
  if (offer.status === "ACCEPTED" && offer.expiresAt && offer.expiresAt <= now) {
    const session = await SpinSessionModel.findOne({ sessionId: lead.sessionId }).exec();
    if (session) {
      await expireOffer(offer._id.toString(), session);
    }
    return NextResponse.json(
      { ok: false, error: "Offer expired. Please spin again tomorrow." },
      { status: 410 }
    );
  }

  if (lead.paymentStatus === "PAID") {
    return NextResponse.json({ ok: true, alreadyPaid: true });
  }

  const paymentOption = payload.paymentOption === "DEPOSIT" ? "DEPOSIT" : "FULL";
  const amountInr = paymentOption === "DEPOSIT" ? DEPOSIT_INR : lead.priceInr;

  if (!RAZORPAY_KEY_ID) {
    return NextResponse.json(
      { ok: false, error: "Payment configuration missing" },
      { status: 500 }
    );
  }

  if (lead.orderId && lead.paymentOption === paymentOption) {
    return NextResponse.json({
      ok: true,
      orderId: lead.orderId,
      amountInr,
      amountPaise: amountInr * 100,
      keyId: RAZORPAY_KEY_ID,
    });
  }

  let order;
  try {
    const client = getRazorpayClient();
    const receiptId = lead._id.toString().slice(-10);
    const receipt = `fs_${receiptId}_${Date.now().toString(36)}`.slice(0, 40);
    order = await client.orders.create({
      amount: amountInr * 100,
      currency: "INR",
      receipt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment error";
    return NextResponse.json(
      {
        ok: false,
        error:
          process.env.NODE_ENV === "production"
            ? "Payment provider unavailable"
            : message,
      },
      { status: 502 }
    );
  }

  lead.orderId = order.id;
  lead.paymentOption = paymentOption;
  lead.amountDueInr =
    paymentOption === "DEPOSIT" ? Math.max(0, lead.priceInr - DEPOSIT_INR) : 0;
  await lead.save();

  await PaymentEventModel.create({
    leadId: lead._id,
    offerId: lead.offerId,
    type: "ORDER_CREATED",
    orderId: order.id,
    amountInr,
    currency: "INR",
  });

  logEvent("ORDER_CREATED", {
    leadId: lead._id.toString(),
    orderId: order.id,
    amountInr,
  });

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    amountInr,
    amountPaise: amountInr * 100,
    keyId: RAZORPAY_KEY_ID,
  });
}
