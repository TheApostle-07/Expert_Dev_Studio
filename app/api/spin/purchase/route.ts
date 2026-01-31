import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { fingerprintFromRequest } from "../../../../lib/founders/fingerprint";
import {
  createSessionId,
  ensureSpinSession,
  getSessionId,
} from "../../../../lib/founders/session";
import {
  SESSION_COOKIE,
  SPIN_PACK_PRICE_INR,
  SPIN_PACK_SPINS,
} from "../../../../lib/founders/config";
import { getActiveOffer } from "../../../../lib/founders/state";
import { getRazorpayClient, RAZORPAY_KEY_ID } from "../../../../lib/razorpay";
import { SpinPurchaseModel } from "../../../../lib/models/SpinPurchase";
import { logEvent } from "../../../../lib/founders/logger";

export async function POST(req: Request) {
  await connectToDatabase();

  const fingerprintHash = fingerprintFromRequest(req);
  let sessionId = getSessionId(req);
  const isNewSession = !sessionId;
  if (!sessionId) {
    sessionId = createSessionId();
  }

  await ensureSpinSession({ sessionId, fingerprintHash });

  const activeOffer = await getActiveOffer(sessionId);
  if (activeOffer) {
    return NextResponse.json(
      { ok: false, error: "Offer already locked. Complete payment before purchasing spins." },
      { status: 409 }
    );
  }

  if (!RAZORPAY_KEY_ID) {
    return NextResponse.json(
      { ok: false, error: "Payment configuration missing" },
      { status: 500 }
    );
  }

  let order;
  try {
    const client = getRazorpayClient();
    const receipt = `spin_${sessionId.slice(0, 8)}_${Date.now().toString(36)}`.slice(0, 40);
    order = await client.orders.create({
      amount: SPIN_PACK_PRICE_INR * 100,
      currency: "INR",
      receipt,
      notes: {
        type: "spin_pack",
        spins: `${SPIN_PACK_SPINS}`,
      },
    });
  } catch (error) {
    const payload = error as {
      error?: { description?: string; reason?: string; code?: string };
      message?: string;
      statusCode?: number;
    };
    const message =
      payload?.error?.description ||
      payload?.error?.reason ||
      payload?.message ||
      (error instanceof Error ? error.message : "Payment error");
    logEvent("SPIN_PACK_ORDER_FAILED", {
      sessionId,
      message,
      code: payload?.error?.code,
      statusCode: payload?.statusCode,
    });
    return NextResponse.json(
      {
        ok: false,
        error: message || "Payment provider unavailable",
      },
      { status: 502 }
    );
  }

  await SpinPurchaseModel.create({
    sessionId,
    fingerprintHash,
    packSpins: SPIN_PACK_SPINS,
    amountInr: SPIN_PACK_PRICE_INR,
    orderId: order.id,
  });

  logEvent("SPIN_PACK_ORDER", {
    sessionId,
    orderId: order.id,
    amountInr: SPIN_PACK_PRICE_INR,
  });

  const res = NextResponse.json({
    ok: true,
    orderId: order.id,
    amountInr: SPIN_PACK_PRICE_INR,
    amountPaise: SPIN_PACK_PRICE_INR * 100,
    keyId: RAZORPAY_KEY_ID,
    spins: SPIN_PACK_SPINS,
  });

  if (isNewSession) {
    res.cookies.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return res;
}
