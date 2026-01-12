import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { AuditModel } from "../../../../lib/models/Audit";
import { CouponReservationModel } from "../../../../lib/models/CouponReservation";
import { getRazorpayClient, RAZORPAY_KEY_ID } from "../../../../lib/razorpay";

export async function POST(req: Request) {
  await connectToDatabase();

  let payload: { auditId?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  if (!payload.auditId || typeof payload.auditId !== "string") {
    return NextResponse.json(
      { ok: false, error: "Audit ID is required" },
      { status: 400 }
    );
  }

  const audit = await AuditModel.findById(payload.auditId).exec();
  if (!audit) {
    return NextResponse.json({ ok: false, error: "Audit not found" }, { status: 404 });
  }

  if (audit.isUnlocked) {
    return NextResponse.json({ ok: true, alreadyUnlocked: true });
  }

  let amountInr = audit.basePriceInr;
  let reservationId = audit.couponReservationId;

  if (reservationId) {
    const reservation = await CouponReservationModel.findById(reservationId).exec();
    if (!reservation || reservation.status !== "RESERVED") {
      return NextResponse.json(
        { ok: false, error: "Coupon quote expired, please re-apply" },
        { status: 400 }
      );
    }
    if (reservation.expiresAt <= new Date()) {
      return NextResponse.json(
        { ok: false, error: "Coupon quote expired, please re-apply" },
        { status: 400 }
      );
    }
    amountInr = reservation.quotedPriceInr;
  } else if (audit.finalPriceInr) {
    amountInr = audit.finalPriceInr;
  }

  if (amountInr < 1) {
    return NextResponse.json(
      { ok: false, error: "Amount must be at least 1 INR" },
      { status: 400 }
    );
  }

  if (!RAZORPAY_KEY_ID) {
    return NextResponse.json(
      { ok: false, error: "Payment configuration missing" },
      { status: 500 }
    );
  }

  if (audit.razorpayOrderId) {
    return NextResponse.json({
      ok: true,
      orderId: audit.razorpayOrderId,
      amountInr,
      amountPaise: amountInr * 100,
      keyId: RAZORPAY_KEY_ID,
    });
  }

  let order;
  try {
    const client = getRazorpayClient();
    const receiptId = audit._id.toString().slice(-10);
    const receiptTime = Date.now().toString(36);
    const receipt = `wr_${receiptId}_${receiptTime}`;
    order = await client.orders.create({
      amount: amountInr * 100,
      currency: "INR",
      receipt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const details =
      typeof error === "object" && error && "error" in error && error.error
        ? (error.error as { description?: string }).description
        : undefined;
    console.error("Razorpay order create failed:", message, details);
    return NextResponse.json(
      {
        ok: false,
        error:
          process.env.NODE_ENV === "production"
            ? "Payment provider unavailable"
            : `Payment provider unavailable: ${details || message}`,
      },
      { status: 502 }
    );
  }

  audit.razorpayOrderId = order.id;
  audit.finalPriceInr = amountInr;
  await audit.save();

  if (reservationId) {
    await CouponReservationModel.updateOne(
      { _id: reservationId },
      { $set: { razorpayOrderId: order.id } }
    ).exec();
  }

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    amountInr,
    amountPaise: amountInr * 100,
    keyId: RAZORPAY_KEY_ID,
  });
}
