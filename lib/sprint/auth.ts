import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "eds_sprint_session";

const getSecret = () => process.env.SESSION_SECRET || process.env.ADMIN_GATE_PASSWORD || "";

export function createSessionToken(userId: string) {
  const secret = getSecret();
  const payload = `${userId}`;
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export function verifySessionToken(token?: string | null) {
  if (!token) return null;
  const secret = getSecret();
  if (!secret) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  if (expected !== signature) return null;
  return payload;
}

export function setSessionCookie(userId: string) {
  const token = createSessionToken(userId);
  const jar = cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookie() {
  const jar = cookies();
  jar.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function getSessionUserId() {
  const jar = cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  return verifySessionToken(token);
}
