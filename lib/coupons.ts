import mongoose, { type ClientSession } from "mongoose";
import { AuditModel, type AuditDocument } from "./models/Audit";
import { CouponModel, type CouponDocument } from "./models/Coupon";
import {
  CouponReservationModel,
  type CouponReservationDocument,
} from "./models/CouponReservation";
import {
  CouponRedemptionModel,
  type CouponRedemptionDocument,
} from "./models/CouponRedemption";
import { buildFullReportFromPreview } from "./analyzer";

const RESERVATION_TTL_MINUTES = Number.parseInt(
  process.env.COUPON_RESERVATION_TTL_MINUTES || "15",
  10
);

export class CouponError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function isTransactionUnsupported(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const message = "message" in error ? String(error.message) : "";
  return message.includes("Transaction numbers") || message.includes("replica set");
}

async function withOptionalTransaction<T>(
  fn: (session?: ClientSession) => Promise<T>
): Promise<T> {
  const session = await mongoose.startSession();
  try {
    let result: T | undefined;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result as T;
  } catch (error) {
    if (isTransactionUnsupported(error)) {
      return fn(undefined);
    }
    throw error;
  } finally {
    await session.endSession();
  }
}

function computeTieredPrice(coupon: CouponDocument, nextUsageNumber: number) {
  const bucketSize = coupon.bucketSize || 100;
  const bucketIndex = Math.floor((nextUsageNumber - 1) / bucketSize);
  const cap = coupon.cap ?? 999;
  const priceFromBucket = coupon.prices?.[bucketIndex];
  const price = Math.min(priceFromBucket ?? cap, cap);
  return { bucketIndex, price };
}

async function buildFullReportForAudit(audit: AuditDocument) {
  if (audit.fullReport) {
    return audit.fullReport;
  }
  if (!audit.preview || audit.scoreOverall == null || !audit.label) {
    return {
      summary: {
        headline: "Website Rater — Full Report",
        scoreOverall: audit.scoreOverall || 0,
        label: audit.label || "DANGER",
        analyzedUrl: audit.urlNormalized,
        htmlKb: audit.preview?.notes?.htmlKb ?? 0,
      },
      sections: [],
      nextSteps: [],
    };
  }
  return buildFullReportFromPreview({
    preview: audit.preview,
    scoreOverall: audit.scoreOverall,
    label: audit.label,
    url: audit.urlNormalized,
  });
}

async function consumeReservation(options: {
  audit: AuditDocument;
  coupon: CouponDocument;
  reservation: CouponReservationDocument;
  paymentId?: string;
  session?: ClientSession;
}) {
  const { audit, coupon, reservation, paymentId, session } = options;
  const now = new Date();
  const hasLead = Boolean(audit.leadName && audit.leadEmail && audit.leadConsentAt);

  const existingRedemption = await CouponRedemptionModel.findOne({
    auditId: audit._id,
  })
    .session(session || null)
    .exec();

  let redemption: CouponRedemptionDocument | null = existingRedemption;

  if (!existingRedemption) {
    try {
      const created = await CouponRedemptionModel.create(
        [
          {
            couponCode: coupon.code,
            couponId: coupon._id,
            auditId: audit._id,
            userId: audit.userId,
            ipHash: audit.ipHash,
            usageNumber: reservation.usageNumber,
            bucketIndex: reservation.bucketIndex,
            priceAppliedInr: reservation.quotedPriceInr,
            razorpayPaymentId: paymentId,
          },
        ],
        { session }
      );
      redemption = created[0];
      await CouponModel.updateOne(
        { _id: coupon._id },
        { $inc: { usedCount: 1 } },
        { session }
      ).exec();
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (!message.includes("E11000")) {
        throw error;
      }
      redemption = await CouponRedemptionModel.findOne({ auditId: audit._id })
        .session(session || null)
        .exec();
    }
  }

  await CouponReservationModel.updateOne(
    { _id: reservation._id },
    {
      $set: {
        status: "CONSUMED",
        razorpayPaymentId: paymentId,
      },
    },
    { session }
  ).exec();

  if (paymentId) {
    audit.razorpayPaymentId = paymentId;
  }
  audit.paidAt = audit.paidAt || now;
  audit.couponRedemptionId = redemption?._id;

  if (audit.isUnlocked || hasLead) {
    audit.isUnlocked = true;
    audit.fullReport = await buildFullReportForAudit(audit);
  }
  await audit.save({ session });
}

export async function applyCoupon(options: {
  auditId: string;
  couponCode: string;
  userId?: string;
  ipHash: string;
}) {
  const normalizedCode = options.couponCode.trim().toUpperCase();
  if (!normalizedCode) {
    throw new CouponError("INVALID_COUPON", "Coupon code is required", 400);
  }

  return withOptionalTransaction(async (session) => {
    const now = new Date();
    const audit = await AuditModel.findById(options.auditId)
      .session(session || null)
      .exec();

    if (!audit) {
      throw new CouponError("NOT_FOUND", "Audit not found", 404);
    }

    if (audit.isUnlocked) {
      return {
        quotedPriceInr: audit.finalPriceInr ?? audit.basePriceInr,
        unlocked: true,
        message: "Report already unlocked",
      };
    }

    if (audit.couponReservationId) {
      const existingReservation = await CouponReservationModel.findById(
        audit.couponReservationId
      )
        .session(session || null)
        .exec();

      if (
        existingReservation &&
        existingReservation.status === "RESERVED" &&
        existingReservation.expiresAt > now
      ) {
        return {
          quotedPriceInr: existingReservation.quotedPriceInr,
          unlocked: false,
          message: "Existing coupon quote applied",
        };
      }

      if (
        existingReservation &&
        existingReservation.status === "RESERVED" &&
        existingReservation.expiresAt <= now
      ) {
        await CouponReservationModel.updateOne(
          { _id: existingReservation._id },
          { $set: { status: "EXPIRED" } },
          { session }
        ).exec();
      }
    }

    const coupon = await CouponModel.findOne({ code: normalizedCode })
      .session(session || null)
      .exec();

    if (!coupon || !coupon.active) {
      throw new CouponError("INVALID_COUPON", "Coupon not found or inactive", 400);
    }

    if (coupon.startsAt && coupon.startsAt > now) {
      throw new CouponError("COUPON_NOT_STARTED", "Coupon not active yet", 400);
    }

    if (coupon.endsAt && coupon.endsAt < now) {
      throw new CouponError("COUPON_EXPIRED", "Coupon has expired", 400);
    }

    if (coupon.type !== "TIERED_PRICE" && coupon.totalLimit) {
      if (coupon.usedCount >= coupon.totalLimit) {
        throw new CouponError("COUPON_LIMIT", "Coupon limit reached", 400);
      }
    }

    if (coupon.perUserLimit && options.userId) {
      const usedByUser = await CouponRedemptionModel.countDocuments({
        couponId: coupon._id,
        userId: options.userId,
      })
        .session(session || null)
        .exec();

      if (usedByUser >= coupon.perUserLimit) {
        throw new CouponError("COUPON_USER_LIMIT", "Coupon usage limit reached", 400);
      }
    }

    const activeReservationsCount = await CouponReservationModel.countDocuments({
      couponId: coupon._id,
      status: "RESERVED",
      expiresAt: { $gt: now },
    })
      .session(session || null)
      .exec();

    const nextUsageNumber = coupon.usedCount + activeReservationsCount + 1;
    let bucketIndex = 0;
    let price = audit.basePriceInr;
    const hasLead = Boolean(audit.leadName && audit.leadEmail && audit.leadConsentAt);

    if (coupon.type === "TIERED_PRICE") {
      const tiered = computeTieredPrice(coupon, nextUsageNumber);
      bucketIndex = tiered.bucketIndex;
      price = tiered.price;
    } else if (coupon.type === "PERCENT_OFF") {
      const percent = coupon.percentOff ?? 0;
      price = Math.max(0, audit.basePriceInr - (audit.basePriceInr * percent) / 100);
    } else if (coupon.type === "FLAT_OFF") {
      const flatOff = coupon.flatOffInr ?? 0;
      price = Math.max(0, audit.basePriceInr - flatOff);
    } else if (coupon.type === "FREE_UNLOCK") {
      price = 0;
    }

    const quotedPriceInr = Math.max(0, Math.round(price));
    const expiresAt = new Date(now.getTime() + RESERVATION_TTL_MINUTES * 60 * 1000);

    const reservation = await CouponReservationModel.create(
      [
        {
          couponCode: coupon.code,
          couponId: coupon._id,
          auditId: audit._id,
          userId: audit.userId || options.userId,
          ipHash: options.ipHash,
          usageNumber: nextUsageNumber,
          bucketIndex,
          quotedPriceInr,
          status: "RESERVED",
          expiresAt,
        },
      ],
      { session }
    );

    const createdReservation = reservation[0];

    audit.couponReservationId = createdReservation._id;
    audit.couponCodeApplied = coupon.code;
    audit.finalPriceInr = quotedPriceInr;
    await audit.save({ session });

    if (quotedPriceInr === 0 && hasLead) {
      await consumeReservation({
        audit,
        coupon,
        reservation: createdReservation,
        session,
      });
      return {
        quotedPriceInr,
        unlocked: true,
        message: "Coupon applied. Full report unlocked.",
      };
    }

    return {
      quotedPriceInr,
      unlocked: false,
      message:
        quotedPriceInr === 0
          ? "Coupon applied. Add your details to unlock."
          : "Coupon applied. Complete payment to unlock.",
    };
  });
}

export async function consumeReservationForPayment(options: {
  auditId: string;
  paymentId: string;
  orderId: string;
}) {
  return withOptionalTransaction(async (session) => {
    const now = new Date();
    const audit = await AuditModel.findById(options.auditId)
      .session(session || null)
      .exec();

    if (!audit) {
      throw new CouponError("NOT_FOUND", "Audit not found", 404);
    }

    if (audit.isUnlocked || audit.razorpayPaymentId) {
      return { alreadyUnlocked: true };
    }

    if (audit.razorpayOrderId !== options.orderId) {
      throw new CouponError("ORDER_MISMATCH", "Order ID does not match", 400);
    }

    let reservation: CouponReservationDocument | null = null;
    if (audit.couponReservationId) {
      reservation = await CouponReservationModel.findById(audit.couponReservationId)
        .session(session || null)
        .exec();
      if (!reservation) {
        throw new CouponError(
          "QUOTE_EXPIRED",
          "Coupon quote expired, please re-apply",
          400
        );
      }
    }

    if (reservation) {
      if (reservation.status !== "RESERVED") {
        throw new CouponError("RESERVATION_INVALID", "Coupon reservation is not active", 400);
      }
      if (reservation.razorpayOrderId && reservation.razorpayOrderId !== options.orderId) {
        throw new CouponError("ORDER_MISMATCH", "Order ID does not match", 400);
      }
      if (reservation.expiresAt <= now) {
        await CouponReservationModel.updateOne(
          { _id: reservation._id },
          { $set: { status: "EXPIRED" } },
          { session }
        ).exec();
        throw new CouponError(
          "QUOTE_EXPIRED",
          "Coupon quote expired, please re-apply",
          400
        );
      }
    }

    if (!reservation) {
      audit.paidAt = now;
      audit.razorpayPaymentId = options.paymentId;
      audit.finalPriceInr = audit.finalPriceInr ?? audit.basePriceInr;
      if (audit.isUnlocked || (audit.leadName && audit.leadEmail && audit.leadConsentAt)) {
        audit.isUnlocked = true;
        audit.fullReport = await buildFullReportForAudit(audit);
      }
      await audit.save({ session });
      return { alreadyUnlocked: false };
    }

    const coupon = await CouponModel.findById(reservation.couponId)
      .session(session || null)
      .exec();

    if (!coupon) {
      throw new CouponError("COUPON_MISSING", "Coupon missing for reservation", 400);
    }

    await consumeReservation({
      audit,
      coupon,
      reservation,
      paymentId: options.paymentId,
      session,
    });

    return { alreadyUnlocked: false };
  });
}

export async function finalizeUnlockAfterLead(auditId: string) {
  return withOptionalTransaction(async (session) => {
    const now = new Date();
    const audit = await AuditModel.findById(auditId)
      .session(session || null)
      .exec();

    if (!audit) {
      throw new CouponError("NOT_FOUND", "Audit not found", 404);
    }

    const hasLead = Boolean(audit.leadName && audit.leadEmail && audit.leadConsentAt);
    if (!hasLead) {
      return { unlocked: false };
    }

    if (audit.isUnlocked) {
      return { unlocked: true };
    }

    if (audit.razorpayPaymentId || audit.paidAt) {
      audit.isUnlocked = true;
      audit.fullReport = await buildFullReportForAudit(audit);
      await audit.save({ session });
      return { unlocked: true };
    }

    if (audit.couponReservationId) {
      const reservation = await CouponReservationModel.findById(audit.couponReservationId)
        .session(session || null)
        .exec();

      if (reservation) {
        if (reservation.expiresAt <= now) {
          await CouponReservationModel.updateOne(
            { _id: reservation._id },
            { $set: { status: "EXPIRED" } },
            { session }
          ).exec();
          return { unlocked: false };
        }

        if (reservation.status === "RESERVED" && reservation.quotedPriceInr === 0) {
          const coupon = await CouponModel.findById(reservation.couponId)
            .session(session || null)
            .exec();

          if (!coupon) {
            throw new CouponError("COUPON_MISSING", "Coupon missing for reservation", 400);
          }

          await consumeReservation({ audit, coupon, reservation, session });
          return { unlocked: true };
        }
      }
    }

    return { unlocked: false };
  });
}
