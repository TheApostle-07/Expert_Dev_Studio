import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { AuditModel } from "../../../../lib/models/Audit";
import { CouponError, consumeReservationForPayment } from "../../../../lib/coupons";
import { verifyRazorpaySignature } from "../../../../lib/razorpay";

export async function POST(req: Request) {
  await connectToDatabase();

  let payload: {
    auditId?: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  };

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const { auditId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload;
  if (
    !auditId ||
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    typeof auditId !== "string" ||
    typeof razorpay_order_id !== "string" ||
    typeof razorpay_payment_id !== "string" ||
    typeof razorpay_signature !== "string"
  ) {
    return NextResponse.json(
      { ok: false, error: "Missing payment verification fields" },
      { status: 400 }
    );
  }

  const audit = await AuditModel.findById(auditId).exec();
  if (!audit) {
    return NextResponse.json({ ok: false, error: "Audit not found" }, { status: 404 });
  }

  if (audit.isUnlocked || audit.razorpayPaymentId) {
    return NextResponse.json({ ok: true, alreadyUnlocked: true });
  }

  const existingPayment = await AuditModel.findOne({
    razorpayPaymentId: razorpay_payment_id,
  }).exec();

  if (existingPayment && existingPayment._id.toString() !== auditId) {
    return NextResponse.json(
      { ok: false, error: "Payment already applied" },
      { status: 409 }
    );
  }

  if (audit.razorpayOrderId !== razorpay_order_id) {
    return NextResponse.json(
      { ok: false, error: "Order ID does not match" },
      { status: 400 }
    );
  }

  let signatureValid = false;
  try {
    signatureValid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Payment configuration missing" },
      { status: 500 }
    );
  }

  if (!signatureValid) {
    return NextResponse.json(
      { ok: false, error: "Invalid payment signature" },
      { status: 400 }
    );
  }

  try {
    const result = await consumeReservationForPayment({
      auditId,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });

    return NextResponse.json({ ok: true, alreadyUnlocked: result.alreadyUnlocked });
  } catch (error) {
    if (error instanceof CouponError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { ok: false, error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
