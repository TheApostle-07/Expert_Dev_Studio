import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { fingerprintFromRequest } from "../../../../lib/founders/fingerprint";
import {
  createSessionId,
  ensureSpinSession,
  getSessionId,
} from "../../../../lib/founders/session";
import {
  countAttemptsByFingerprint,
  expireOffer,
  getActiveOffer,
  getSlotsLeftToday,
} from "../../../../lib/founders/state";
import { SPIN_ATTEMPTS_PER_WINDOW, SESSION_COOKIE } from "../../../../lib/founders/config";
import { SpinOfferModel } from "../../../../lib/models/SpinOffer";
import { logEvent } from "../../../../lib/founders/logger";

export async function POST(req: Request) {
  await connectToDatabase();

  const fingerprintHash = fingerprintFromRequest(req);
  let sessionId = getSessionId(req);
  const isNewSession = !sessionId;
  if (!sessionId) {
    sessionId = createSessionId();
  }

  const { session } = await ensureSpinSession({ sessionId, fingerprintHash });
  if (session.fingerprintHash !== fingerprintHash) {
    session.fingerprintHash = fingerprintHash;
    await session.save();
  }

  const now = new Date();
  const expiredOffer = await SpinOfferModel.findOne({
    sessionId,
    status: "ACCEPTED",
    expiresAt: { $lte: now },
  })
    .sort({ acceptedAt: -1 })
    .exec();

  if (expiredOffer) {
    await expireOffer(expiredOffer._id.toString(), session);
  }

  const activeOffer = await getActiveOffer(sessionId);
  const slotsLeftToday = await getSlotsLeftToday();

  const attemptsByFingerprint = await countAttemptsByFingerprint(fingerprintHash);
  const remainingBySession = Math.max(
    0,
    SPIN_ATTEMPTS_PER_WINDOW - session.attemptsUsed
  );
  const remainingByFingerprint = Math.max(
    0,
    SPIN_ATTEMPTS_PER_WINDOW - attemptsByFingerprint
  );
  let attemptsRemaining = Math.min(remainingBySession, remainingByFingerprint);

  if (session.cooldownUntil && session.cooldownUntil > now) {
    attemptsRemaining = 0;
  }

  logEvent("SPIN_START", {
    sessionId,
    attemptsRemaining,
    slotsLeftToday,
  });

  const res = NextResponse.json({
    ok: true,
    attemptsRemaining,
    cooldownUntil: session.cooldownUntil,
    slotsLeftToday,
    activeOffer: activeOffer
      ? {
          offerId: activeOffer._id.toString(),
          prizeLabel: activeOffer.prizeLabel,
          priceInr: activeOffer.priceInr,
          anchorPriceInr: activeOffer.anchorPriceInr,
          bonusLabel: activeOffer.bonusLabel,
          expiresAt: activeOffer.expiresAt,
          leadId: activeOffer.leadId?.toString(),
        }
      : null,
  });

  if (isNewSession) {
    res.cookies.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return res;
}
