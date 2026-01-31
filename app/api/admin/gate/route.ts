import { NextResponse } from "next/server";
import { setAdminGateCookie, isAdminGateEnabled } from "../../../../lib/sprint/adminGate";

export async function POST(req: Request) {
  if (!isAdminGateEnabled()) {
    return NextResponse.json({ ok: false, error: "Admin disabled" }, { status: 404 });
  }
  const payload = await req.json().catch(() => null);
  const password = payload?.password as string | undefined;
  if (!password || password !== process.env.ADMIN_GATE_PASSWORD) {
    return NextResponse.json({ ok: false, error: "Invalid password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  setAdminGateCookie();
  return res;
}
