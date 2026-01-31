import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "eds_admin_gate";

const getSecret = () => process.env.ADMIN_GATE_PASSWORD || "";

const hashPassword = (value: string) =>
  crypto.createHash("sha256").update(value).digest("hex");

export function isAdminGateEnabled() {
  return Boolean(getSecret());
}

export function checkAdminGate() {
  const secret = getSecret();
  if (!secret) return false;
  const jar = cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  return token === hashPassword(secret);
}

export function setAdminGateCookie() {
  const secret = getSecret();
  if (!secret) return;
  const jar = cookies();
  jar.set(COOKIE_NAME, hashPassword(secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 60 * 60 * 24 * 30,
  });
}
