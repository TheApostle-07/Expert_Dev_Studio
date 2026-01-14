import { getRequestIp } from "../rateLimit";
import { sha256 } from "../security/hash";

export function fingerprintFromRequest(req: Request): string {
  const ua = req.headers.get("user-agent") || "unknown";
  const lang = req.headers.get("accept-language") || "unknown";
  const ip = getRequestIp(req);
  return sha256([ua, lang, ip].join("|"));
}
