import crypto from "crypto";
import { SESSION_COOKIE, SPIN_WINDOW_MS, SPIN_ATTEMPTS_PER_WINDOW } from "./config";
import { SpinSessionModel } from "../models/SpinSession";

export function getSessionId(req: Request): string | null {
  const cookie = req.headers.get("cookie");
  if (!cookie) return null;
  const parts = cookie.split(";").map((item) => item.trim());
  const match = parts.find((item) => item.startsWith(`${SESSION_COOKIE}=`));
  if (!match) return null;
  return match.split("=")[1] || null;
}

export function createSessionId(): string {
  return crypto.randomBytes(16).toString("hex");
}

export async function ensureSpinSession(options: {
  sessionId: string;
  fingerprintHash: string;
}) {
  const now = new Date();
  const windowStart = new Date(now.getTime());
  const windowEnd = new Date(now.getTime() + SPIN_WINDOW_MS);

  const session = await SpinSessionModel.findOneAndUpdate(
    { sessionId: options.sessionId },
    {
      $setOnInsert: {
        sessionId: options.sessionId,
        fingerprintHash: options.fingerprintHash,
        attemptsUsed: 0,
        windowStart,
        windowEnd,
      },
    },
    { new: true, upsert: true }
  ).exec();

  if (!session) {
    throw new Error("Failed to initialize session");
  }

  if (session.windowEnd <= now) {
    session.windowStart = now;
    session.windowEnd = new Date(now.getTime() + SPIN_WINDOW_MS);
    session.attemptsUsed = 0;
    await session.save();
  }

  const attemptsRemaining = Math.max(0, SPIN_ATTEMPTS_PER_WINDOW - session.attemptsUsed);

  return { session, attemptsRemaining };
}
