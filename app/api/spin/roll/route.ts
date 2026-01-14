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
  getActiveOffer,
  getSlotsLeftToday,
} from "../../../../lib/founders/state";
import { SESSION_COOKIE, SPIN_ATTEMPTS_PER_WINDOW } from "../../../../lib/founders/config";
import { SpinOfferModel } from "../../../../lib/models/SpinOffer";
import { SpinSessionModel } from "../../../../lib/models/SpinSession";
import { ANCHOR_PRICE_INR, selectPrize } from "../../../../lib/founders/prizes";
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
  if (session.cooldownUntil && session.cooldownUntil > now) {
    return NextResponse.json(
      {
        ok: false,
        error: "Spin attempts locked. Try again later.",
        cooldownUntil: session.cooldownUntil,
      },
      { status: 429 }
    );
  }

  const activeOffer = await getActiveOffer(sessionId);
  if (activeOffer) {
    return NextResponse.json(
      {
        ok: false,
        error: "Offer already accepted. Complete payment before spinning again.",
        activeOffer: {
          offerId: activeOffer._id.toString(),
          prizeLabel: activeOffer.prizeLabel,
          priceInr: activeOffer.priceInr,
          anchorPriceInr: activeOffer.anchorPriceInr,
          bonusLabel: activeOffer.bonusLabel,
          expiresAt: activeOffer.expiresAt,
          leadId: activeOffer.leadId?.toString(),
        },
      },
      { status: 409 }
    );
  }

  const attemptsByFingerprint = await countAttemptsByFingerprint(fingerprintHash);
  if (attemptsByFingerprint >= SPIN_ATTEMPTS_PER_WINDOW) {
    return NextResponse.json(
      { ok: false, error: "Spin limit reached for today." },
      { status: 429 }
    );
  }

  const slotsLeftToday = await getSlotsLeftToday();
  if (slotsLeftToday <= 0) {
    return NextResponse.json(
      { ok: false, error: "Today’s founder slots are full. Try again tomorrow." },
      { status: 409 }
    );
  }

  const updatedSession = await SpinSessionModel.findOneAndUpdate(
    {
      sessionId,
      windowEnd: { $gt: now },
      attemptsUsed: { $lt: SPIN_ATTEMPTS_PER_WINDOW },
    },
    { $inc: { attemptsUsed: 1 }, $set: { lastSpinAt: now } },
    { new: true }
  ).exec();

  if (!updatedSession) {
    return NextResponse.json(
      { ok: false, error: "Spin limit reached for today." },
      { status: 429 }
    );
  }

  const { prize, index } = selectPrize(slotsLeftToday);

  const offer = await SpinOfferModel.create({
    sessionId,
    fingerprintHash,
    attemptNumber: updatedSession.attemptsUsed,
    prizeCode: prize.code,
    prizeLabel: prize.label,
    priceInr: prize.priceInr,
    anchorPriceInr: ANCHOR_PRICE_INR,
    bonusLabel: prize.bonusLabel,
  });

  const attemptsRemaining = Math.max(
    0,
    SPIN_ATTEMPTS_PER_WINDOW - updatedSession.attemptsUsed
  );

  logEvent("ROLL", {
    sessionId,
    offerId: offer._id.toString(),
    prize: prize.code,
    attemptsRemaining,
  });

  const res = NextResponse.json({
    ok: true,
    offer: {
      offerId: offer._id.toString(),
      prizeLabel: offer.prizeLabel,
      priceInr: offer.priceInr,
      anchorPriceInr: offer.anchorPriceInr,
      bonusLabel: offer.bonusLabel,
      segmentIndex: index,
      attemptNumber: offer.attemptNumber,
    },
    attemptsRemaining,
    slotsLeftToday,
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
