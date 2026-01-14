import { NextResponse } from "next/server";

export function requireAdminToken(req: Request): { ok: true } | NextResponse {
  const token = process.env.ADMIN_TOKEN;
  if (!token) {
    return NextResponse.json({ ok: false, error: "Admin disabled" }, { status: 404 });
  }

  const header = req.headers.get("authorization") || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const provided =
    bearer ||
    req.headers.get("x-admin-token") ||
    req.headers.get("x-admin-secret") ||
    "";

  if (!provided || provided !== token) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  return { ok: true };
}
