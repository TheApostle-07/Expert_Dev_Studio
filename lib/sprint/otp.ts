import crypto from "crypto";
import { Resend } from "resend";
import { OTP_TTL_MS } from "./constants";
import { hashValue, normalizeEmail } from "./utils";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export function generateOtp() {
  const code = `${Math.floor(100000 + Math.random() * 900000)}`;
  const codeHash = hashValue(code);
  return { code, codeHash };
}

type OtpSendResult = { delivered: boolean; devCode?: string; error?: string };

export async function sendOtpEmail(email: string, code: string): Promise<OtpSendResult> {
  const from = process.env.OTP_EMAIL_FROM || "ExpertDevStudio <hello@expertdev.studio>";
  const subject = "Your ExpertDevStudio login code";
  const html = `
    <div style="font-family:Arial,sans-serif;">
      <h2 style="margin:0 0 12px;">Your verification code</h2>
      <p style="margin:0 0 8px;">Use this code to continue your booking:</p>
      <p style="font-size:24px;letter-spacing:4px;"><strong>${code}</strong></p>
      <p style="margin:16px 0 0;color:#555;">This code expires in ${Math.round(OTP_TTL_MS / 60000)} minutes.</p>
    </div>
  `;
  if (!resend) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV OTP] ${normalizeEmail(email)} -> ${code}`);
      return { delivered: true, devCode: code };
    }
    return { delivered: false, error: "Email provider not configured." };
  }
  await resend.emails.send({
    from,
    to: [email],
    subject,
    html,
  });
  return { delivered: true };
}
