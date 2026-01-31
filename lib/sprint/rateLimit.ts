import { RateLimitModel } from "../models/RateLimit";
import { hashValue } from "./utils";

export async function consumeRateLimit({
  key,
  action,
  ip,
  limit,
  windowMs,
}: {
  key: string;
  action: string;
  ip: string;
  limit: number;
  windowMs: number;
}) {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + windowMs);
  const ipHash = hashValue(ip || "unknown");
  const record = await RateLimitModel.findOneAndUpdate(
    { key, action },
    {
      $setOnInsert: { windowStart: now, windowEnd, ipHash },
      $inc: { count: 1 },
    },
    { new: true, upsert: true }
  ).exec();

  const allowed = record.count <= limit;
  return { allowed, remaining: Math.max(0, limit - record.count) };
}
