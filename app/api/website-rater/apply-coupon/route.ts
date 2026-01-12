import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { enforceRateLimit } from "../../../../lib/rateLimit";
import { applyCoupon, CouponError } from "../../../../lib/coupons";

const COUPON_LIMIT = 30;
const COUPON_WINDOW_MS = 60 * 60 * 1000;

export async function POST(req: Request) {
  await connectToDatabase();

  const rate = await enforceRateLimit({
    req,
    action: "coupon",
    limit: COUPON_LIMIT,
    windowMs: COUPON_WINDOW_MS,
  });

  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false, error: "Rate limit exceeded. Try again later." },
      { status: 429 }
    );
  }

  let payload: { auditId?: string; couponCode?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  if (
    !payload.auditId ||
    !payload.couponCode ||
    typeof payload.auditId !== "string" ||
    typeof payload.couponCode !== "string"
  ) {
    return NextResponse.json(
      { ok: false, error: "Audit ID and coupon code are required" },
      { status: 400 }
    );
  }

  try {
    const result = await applyCoupon({
      auditId: payload.auditId,
      couponCode: payload.couponCode,
      ipHash: rate.ipHash,
    });

    return NextResponse.json({
      ok: true,
      quotedPriceInr: result.quotedPriceInr,
      unlocked: result.unlocked,
      message: result.message,
    });
  } catch (error) {
    if (error instanceof CouponError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { ok: false, error: "Failed to apply coupon" },
      { status: 500 }
    );
  }
}
