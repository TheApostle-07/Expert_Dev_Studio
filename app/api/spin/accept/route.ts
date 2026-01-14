import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { fingerprintFromRequest } from "../../../../lib/founders/fingerprint";
import { createSessionId, getSessionId } from "../../../../lib/founders/session";
import { OFFER_EXPIRY_MS, SESSION_COOKIE } from "../../../../lib/founders/config";
import { SpinOfferModel } from "../../../../lib/models/SpinOffer";
import { LeadModel } from "../../../../lib/models/Lead";
import { SpinSessionModel } from "../../../../lib/models/SpinSession";
import { getSlotsLeftToday } from "../../../../lib/founders/state";
import { logEvent } from "../../../../lib/founders/logger";

export async function POST(req: Request) {
  await connectToDatabase();

  let payload: { offerId?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  if (!payload.offerId || typeof payload.offerId !== "string") {
    return NextResponse.json(
      { ok: false, error: "Offer ID is required" },
      { status: 400 }
    );
  }

  const fingerprintHash = fingerprintFromRequest(req);
  let sessionId = getSessionId(req);
  const isNewSession = !sessionId;
  if (!sessionId) {
    sessionId = createSessionId();
  }

  const offer = await SpinOfferModel.findById(payload.offerId).exec();
  if (!offer || offer.sessionId !== sessionId) {
    return NextResponse.json({ ok: false, error: "Offer not found" }, { status: 404 });
  }

  if (offer.status === "ACCEPTED" || offer.status === "PAID") {
    const existingLead = await LeadModel.findOne({ offerId: offer._id }).exec();
    return NextResponse.json({
      ok: true,
      offerId: offer._id.toString(),
      leadId: existingLead?._id?.toString(),
      expiresAt: offer.expiresAt,
      priceInr: offer.priceInr,
      anchorPriceInr: offer.anchorPriceInr,
      bonusLabel: offer.bonusLabel,
    });
  }

  if (offer.status !== "ROLLED") {
    return NextResponse.json(
      { ok: false, error: "Offer can no longer be accepted" },
      { status: 400 }
    );
  }

  const activeOffer = await SpinOfferModel.findOne({
    sessionId,
    status: "ACCEPTED",
    expiresAt: { $gt: new Date() },
  }).exec();
  if (activeOffer) {
    return NextResponse.json(
      { ok: false, error: "Existing offer already locked." },
      { status: 409 }
    );
  }

  const slotsLeftToday = await getSlotsLeftToday();
  if (slotsLeftToday <= 0) {
    return NextResponse.json(
      { ok: false, error: "Today’s founder slots are full. Try again tomorrow." },
      { status: 409 }
    );
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + OFFER_EXPIRY_MS);

  const updated = await SpinOfferModel.findOneAndUpdate(
    { _id: offer._id, status: "ROLLED" },
    { $set: { status: "ACCEPTED", acceptedAt: now, expiresAt } },
    { new: true }
  ).exec();

  if (!updated) {
    return NextResponse.json(
      { ok: false, error: "Offer could not be accepted" },
      { status: 409 }
    );
  }

  const lead =
    (await LeadModel.findOne({ offerId: updated._id }).exec()) ||
    (await LeadModel.create({
      offerId: updated._id,
      sessionId,
      fingerprintHash,
      prizeLabel: updated.prizeLabel,
      priceInr: updated.priceInr,
      anchorPriceInr: updated.anchorPriceInr,
      acceptedAt: now,
      expiresAt,
      amountDueInr: updated.priceInr,
    }));

  await SpinOfferModel.updateOne(
    { _id: updated._id },
    { $set: { leadId: lead._id } }
  ).exec();

  await SpinSessionModel.updateOne(
    { sessionId },
    { $set: { activeOfferId: updated._id } }
  ).exec();

  logEvent("ACCEPT", {
    sessionId,
    offerId: updated._id.toString(),
    leadId: lead._id.toString(),
  });

  const res = NextResponse.json({
    ok: true,
    offerId: updated._id.toString(),
    leadId: lead._id.toString(),
    expiresAt: updated.expiresAt,
    priceInr: updated.priceInr,
    anchorPriceInr: updated.anchorPriceInr,
    bonusLabel: updated.bonusLabel,
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
