import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { otpVerifySchema } from "../../../../lib/sprint/validation";
import { OtpCodeModel } from "../../../../lib/models/OtpCode";
import { SprintUserModel } from "../../../../lib/models/SprintUser";
import { createSessionToken } from "../../../../lib/sprint/auth";
import { normalizeEmail, hashValue } from "../../../../lib/sprint/utils";

export async function POST(req: Request) {
  await connectToDatabase();
  const payload = await req.json().catch(() => null);
  const parsed = otpVerifySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const email = normalizeEmail(parsed.data.email);
  const codeHash = hashValue(parsed.data.code);
  const now = new Date();

  const otp = await OtpCodeModel.findOne({ email, expiresAt: { $gt: now } }).exec();
  if (!otp) {
    return NextResponse.json({ ok: false, error: "Code expired" }, { status: 400 });
  }

  if (otp.codeHash !== codeHash) {
    otp.attempts += 1;
    await otp.save();
    return NextResponse.json({ ok: false, error: "Invalid code" }, { status: 400 });
  }

  await OtpCodeModel.deleteMany({ email }).exec();
  const user =
    (await SprintUserModel.findOne({ email }).exec()) ||
    (await SprintUserModel.create({ email }));

  const token = createSessionToken(user._id.toString());
  const res = NextResponse.json({ ok: true, userId: user._id.toString() });
  res.cookies.set("eds_sprint_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
