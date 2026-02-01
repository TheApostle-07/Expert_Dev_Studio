import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "../../../lib/mongodb";
import { consumeRateLimit } from "../../../lib/sprint/rateLimit";
import { getClientIp } from "../../../lib/sprint/request";

const LeadSchema = z.object({
  fullName: z.string().min(2).max(120),
  phone: z.string().min(8).max(24),
  email: z.string().email().optional().or(z.literal("")),
  businessType: z.enum(["coach", "clinic", "salon", "tuition", "real-estate", "other"]),
  city: z.string().min(2).max(80),
  message: z.string().max(800).optional().or(z.literal("")),
  honeypot: z.string().optional().or(z.literal("")),
  utm: z
    .object({
      utm_source: z.string().optional(),
      utm_medium: z.string().optional(),
      utm_campaign: z.string().optional(),
      utm_content: z.string().optional(),
      utm_term: z.string().optional(),
    })
    .optional(),
  pageUrl: z.string().max(300).optional().or(z.literal("")),
  referrer: z.string().max(300).optional().or(z.literal("")),
  userAgent: z.string().max(200).optional().or(z.literal("")),
});

const normalizePhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.length > 10 && value.startsWith("+")) return `+${digits}`;
  return digits;
};

const generateLeadId = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `LCOS-${out}`;
};

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  const parsed = LeadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid submission." }, { status: 400 });
  }

  if (parsed.data.honeypot && parsed.data.honeypot.trim().length > 0) {
    return NextResponse.json({ ok: false, error: "Invalid submission." }, { status: 400 });
  }

  await connectToDatabase();
  const ip = getClientIp(req);
  const rate = await consumeRateLimit({
    key: `lead:${ip}`,
    action: "lead_catcher_os",
    ip,
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const leadId = generateLeadId();
  const createdAt = new Date().toISOString();
  const normalizedPhone = normalizePhone(parsed.data.phone);
  if (normalizedPhone.length < 10) {
    return NextResponse.json({ ok: false, error: "Invalid phone number." }, { status: 400 });
  }

  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const webhookSecret = process.env.LEAD_WEBHOOK_SECRET;
  if (!webhookUrl || !webhookSecret) {
    return NextResponse.json(
      { ok: false, error: "Lead capture is unavailable." },
      { status: 500 }
    );
  }

  const sheetPayload = {
    leadId,
    createdAt,
    fullName: parsed.data.fullName,
    phone: normalizedPhone,
    email: parsed.data.email || "",
    businessType: parsed.data.businessType,
    city: parsed.data.city,
    message: parsed.data.message || "",
    pageUrl: parsed.data.pageUrl || "",
    referrer: parsed.data.referrer || "",
    utm_source: parsed.data.utm?.utm_source || "",
    utm_medium: parsed.data.utm?.utm_medium || "",
    utm_campaign: parsed.data.utm?.utm_campaign || "",
    utm_content: parsed.data.utm?.utm_content || "",
    utm_term: parsed.data.utm?.utm_term || "",
    userAgent: parsed.data.userAgent || req.headers.get("user-agent") || "",
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Lead-Secret": webhookSecret,
      },
      body: JSON.stringify(sheetPayload),
    });

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: "Unable to save your request. Please retry." },
        { status: 502 }
      );
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: "Network error. Please retry." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, leadId });
}
