import { RateLimitModel } from "./models/RateLimit";
import { sha256 } from "./security/hash";

const DEFAULT_UNKNOWN_IP = "0.0.0.0";

type RateLimitResult = {
  allowed: boolean;
  ipHash: string;
  remaining: number;
  resetAt: Date | null;
};

export function getRequestIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  return realIp?.trim() || DEFAULT_UNKNOWN_IP;
}

export async function enforceRateLimit(options: {
  req: Request;
  action: "scan" | "coupon";
  limit: number;
  windowMs: number;
}): Promise<RateLimitResult> {
  const ip = getRequestIp(options.req);
  const ipHash = sha256(ip);
  const now = new Date();
  const windowEnd = new Date(now.getTime() + options.windowMs);
  const key = `${options.action}:${ipHash}`;

  const expiredExpr = {
    $or: [
      { $lte: ["$windowEnd", now] },
      { $not: ["$windowEnd"] },
    ],
  };

  const doc = await RateLimitModel.findOneAndUpdate(
    {
      key,
      $or: [
        { windowEnd: { $lte: now } },
        { windowEnd: { $exists: false } },
        { count: { $lt: options.limit } },
      ],
    },
    [
      {
        $set: {
          key: { $ifNull: ["$key", key] },
          action: { $ifNull: ["$action", options.action] },
          ipHash: { $ifNull: ["$ipHash", ipHash] },
          windowStart: { $cond: [expiredExpr, now, "$windowStart"] },
          windowEnd: { $cond: [expiredExpr, windowEnd, "$windowEnd"] },
          count: {
            $cond: [expiredExpr, 1, { $add: ["$count", 1] }],
          },
        },
      },
    ],
    { new: true, upsert: true, updatePipeline: true }
  ).exec();

  if (!doc) {
    const existing = await RateLimitModel.findOne({ key }).exec();
    return {
      allowed: false,
      ipHash,
      remaining: 0,
      resetAt: existing?.windowEnd ?? null,
    };
  }

  const remaining = Math.max(0, options.limit - doc.count);

  return {
    allowed: doc.count <= options.limit,
    ipHash,
    remaining,
    resetAt: doc.windowEnd,
  };
}
