import { NextResponse } from "next/server";
import { checkAdminGate, isAdminGateEnabled } from "./adminGate";

export function requireAdmin() {
  if (!isAdminGateEnabled()) {
    return NextResponse.json({ ok: false, error: "Admin disabled" }, { status: 404 });
  }
  if (!checkAdminGate()) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return { ok: true };
}
