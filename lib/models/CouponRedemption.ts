import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const CouponRedemptionSchema = new Schema(
  {
    couponCode: { type: String, required: true },
    couponId: { type: Schema.Types.ObjectId, required: true },
    auditId: { type: Schema.Types.ObjectId, required: true, unique: true },
    userId: { type: String },
    ipHash: { type: String, required: true },
    usageNumber: { type: Number, required: true },
    bucketIndex: { type: Number, required: true },
    priceAppliedInr: { type: Number, required: true },
    razorpayPaymentId: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "coupon_redemptions" }
);

CouponRedemptionSchema.index({ auditId: 1 }, { unique: true });
CouponRedemptionSchema.index({ couponId: 1, createdAt: -1 });
CouponRedemptionSchema.index({ razorpayPaymentId: 1 }, { unique: true, sparse: true });

export type CouponRedemptionDocument =
  InferSchemaType<typeof CouponRedemptionSchema> & {
    _id: mongoose.Types.ObjectId;
  };

export const CouponRedemptionModel: Model<CouponRedemptionDocument> =
  mongoose.models.CouponRedemption ||
  mongoose.model("CouponRedemption", CouponRedemptionSchema);
