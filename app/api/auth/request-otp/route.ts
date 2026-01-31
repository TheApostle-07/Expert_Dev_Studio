import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { otpRequestSchema } from "../../../../lib/sprint/validation";
import { generateOtp, sendOtpEmail } from "../../../../lib/sprint/otp";
import { OtpCodeModel } from "../../../../lib/models/OtpCode";
import { OTP_TTL_MS, OTP_MAX_PER_WINDOW, OTP_WINDOW_MS } from "../../../../lib/sprint/constants";
import { consumeRateLimit } from "../../../../lib/sprint/rateLimit";
import { getClientIp } from "../../../../lib/sprint/request";
import { normalizeEmail, hashValue } from "../../../../lib/sprint/utils";

export async function POST(req: Request) {
  await connectToDatabase();
  const payload = await req.json().catch(() => null);
  const parsed = otpRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const email = normalizeEmail(parsed.data.email);
  const ip = getClientIp(req);
  const limit = await consumeRateLimit({
    key: `otp:${email}`,
    action: "otp_request",
    ip,
    limit: OTP_MAX_PER_WINDOW,
    windowMs: OTP_WINDOW_MS,
  });
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });
  }

  const { code, codeHash } = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await OtpCodeModel.deleteMany({ email }).exec();
  await OtpCodeModel.create({
    email,
    codeHash,
    expiresAt,
    ipHash: hashValue(ip),
  });

  await sendOtpEmail(email, code);
  return NextResponse.json({ ok: true });
}
