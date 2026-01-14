import { COOLDOWN_MS, SPIN_WINDOW_MS, DAILY_SLOTS } from "./config";
import { SpinOfferModel } from "../models/SpinOffer";
import { SpinSessionDocument } from "../models/SpinSession";

export function getDayWindowUtc(now: Date) {
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

export async function getSlotsLeftToday() {
  const now = new Date();
  const { start, end } = getDayWindowUtc(now);
  const used = await SpinOfferModel.countDocuments({
    status: { $in: ["ACCEPTED", "PAID"] },
    acceptedAt: { $gte: start, $lt: end },
    $or: [{ status: "PAID" }, { expiresAt: { $gt: now } }],
  }).exec();
  return Math.max(0, DAILY_SLOTS - used);
}

export async function countAttemptsByFingerprint(fingerprintHash: string) {
  const since = new Date(Date.now() - SPIN_WINDOW_MS);
  return SpinOfferModel.countDocuments({
    fingerprintHash,
    createdAt: { $gte: since },
  }).exec();
}

export async function getActiveOffer(sessionId: string) {
  const now = new Date();
  return SpinOfferModel.findOne({
    sessionId,
    status: "ACCEPTED",
    expiresAt: { $gt: now },
  })
    .sort({ acceptedAt: -1 })
    .exec();
}

export async function expireOffer(
  offerId: string,
  session: SpinSessionDocument
) {
  const now = new Date();
  await SpinOfferModel.updateOne(
    { _id: offerId },
    { $set: { status: "EXPIRED" } }
  ).exec();
  session.cooldownUntil = new Date(now.getTime() + COOLDOWN_MS);
  session.activeOfferId = undefined;
  await session.save();
}
