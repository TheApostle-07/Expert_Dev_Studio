import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import {
  ensureSpinSession,
  getSessionId,
} from "../../../../lib/founders/session";
import { countAttemptsByFingerprint } from "../../../../lib/founders/state";
import { fingerprintFromRequest } from "../../../../lib/founders/fingerprint";
import { SESSION_COOKIE, SPIN_ATTEMPTS_PER_WINDOW } from "../../../../lib/founders/config";
import { SpinPurchaseModel } from "../../../../lib/models/SpinPurchase";
import { SpinSessionModel } from "../../../../lib/models/SpinSession";
import { getRazorpayClient, verifyRazorpaySignature } from "../../../../lib/razorpay";
import { logEvent } from "../../../../lib/founders/logger";

export async function POST(req: Request) {
  await connectToDatabase();

  let payload: {
    orderId?: string;
    paymentId?: string;
    signature?: string;
    sessionId?: string;
    fingerprintHash?: string;
  };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  if (!payload.orderId || typeof payload.orderId !== "string") {
    return NextResponse.json(
      { ok: false, error: "Order ID is required" },
      { status: 400 }
    );
  }

  const sessionId = getSessionId(req);
  const fingerprintHash = fingerprintFromRequest(req);
  const purchase = await SpinPurchaseModel.findOne({ orderId: payload.orderId }).exec();
  if (!purchase) {
    return NextResponse.json(
      { ok: false, error: "Purchase not found" },
      { status: 404 }
    );
  }

  const hasSignedPayment =
    typeof payload.paymentId === "string" && typeof payload.signature === "string";
  const matchedProvided =
    (payload.sessionId && payload.sessionId === purchase.sessionId) ||
    (payload.fingerprintHash && payload.fingerprintHash === purchase.fingerprintHash);
  if (
    sessionId &&
    purchase.sessionId !== sessionId &&
    purchase.fingerprintHash !== fingerprintHash &&
    !hasSignedPayment &&
    !matchedProvided
  ) {
    return NextResponse.json(
      { ok: false, error: "Purchase session mismatch" },
      { status: 403 }
    );
  }

  const { session } = await ensureSpinSession({
    sessionId: purchase.sessionId,
    fingerprintHash: purchase.fingerprintHash,
  });

  if (purchase.status === "PAID") {
    const attemptsByFingerprint = await countAttemptsByFingerprint(purchase.fingerprintHash);
    const remainingBySession = Math.max(
      0,
      SPIN_ATTEMPTS_PER_WINDOW - session.attemptsUsed
    );
    const remainingByFingerprint = Math.max(
      0,
      SPIN_ATTEMPTS_PER_WINDOW - attemptsByFingerprint
    );
    const baseRemaining = Math.min(remainingBySession, remainingByFingerprint);
    const extraSpinsRemaining = session.extraSpinsRemaining || 0;
    const attemptsRemaining = baseRemaining + extraSpinsRemaining;

    const res = NextResponse.json({
      ok: true,
      attemptsRemaining,
      extraSpinsRemaining,
    });
    res.cookies.set(SESSION_COOKIE, purchase.sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  }

  let isPaid = false;
  let paymentId: string | undefined = undefined;
  if (payload.paymentId && payload.signature) {
    const ok = verifyRazorpaySignature({
      orderId: payload.orderId,
      paymentId: payload.paymentId,
      signature: payload.signature,
    });
    if (!ok) {
      return NextResponse.json({ ok: false, error: "Invalid payment signature" }, { status: 400 });
    }
    isPaid = true;
    paymentId = payload.paymentId;
  } else {
    let order;
    try {
      const client = getRazorpayClient();
      order = await client.orders.fetch(payload.orderId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Payment error";
      return NextResponse.json(
        {
          ok: false,
          error:
            process.env.NODE_ENV === "production"
              ? "Payment verification unavailable"
              : message,
        },
        { status: 502 }
      );
    }
    isPaid =
      order?.status === "paid" || (typeof order?.amount_paid === "number" && order.amount_paid > 0);
  }

  if (!isPaid) {
    return NextResponse.json({ ok: false, error: "Payment not verified yet." });
  }

  const updateResult = await SpinPurchaseModel.updateOne(
    { orderId: payload.orderId, status: "PENDING" },
    { $set: { status: "PAID", paidAt: new Date(), paymentId } }
  ).exec();

  if (updateResult.modifiedCount > 0) {
    await SpinSessionModel.updateOne(
      { sessionId: purchase.sessionId },
      { $inc: { extraSpinsRemaining: purchase.packSpins } }
    ).exec();
  }

  const updatedSession = await SpinSessionModel.findOne({ sessionId: purchase.sessionId }).exec();
  const attemptsByFingerprint = await countAttemptsByFingerprint(purchase.fingerprintHash);
  const remainingBySession = Math.max(
    0,
    SPIN_ATTEMPTS_PER_WINDOW - (updatedSession?.attemptsUsed || 0)
  );
  const remainingByFingerprint = Math.max(
    0,
    SPIN_ATTEMPTS_PER_WINDOW - attemptsByFingerprint
  );
  const baseRemaining = Math.min(remainingBySession, remainingByFingerprint);
  const extraSpinsRemaining = updatedSession?.extraSpinsRemaining || 0;
  const attemptsRemaining = baseRemaining + extraSpinsRemaining;

  logEvent("SPIN_PACK_VERIFIED", {
    sessionId: purchase.sessionId,
    orderId: payload.orderId,
    paymentId,
  });

    const res = NextResponse.json({
      ok: true,
      attemptsRemaining,
      extraSpinsRemaining,
    });
    res.cookies.set(SESSION_COOKIE, purchase.sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
