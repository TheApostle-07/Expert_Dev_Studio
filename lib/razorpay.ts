import Razorpay from "razorpay";
import crypto from "crypto";

const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export function getRazorpayClient() {
  if (!KEY_ID || !KEY_SECRET) {
    throw new Error("Missing Razorpay credentials");
  }
  return new Razorpay({
    key_id: KEY_ID,
    key_secret: KEY_SECRET,
  });
}

export function verifyRazorpaySignature(options: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!KEY_SECRET) {
    throw new Error("Missing Razorpay credentials");
  }
  const payload = `${options.orderId}|${options.paymentId}`;
  const expected = crypto
    .createHmac("sha256", KEY_SECRET)
    .update(payload)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(options.signature);
  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

export const RAZORPAY_KEY_ID = KEY_ID;
