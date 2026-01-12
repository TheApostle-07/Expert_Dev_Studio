import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    type: {
      type: String,
      enum: ["FREE_UNLOCK", "PERCENT_OFF", "FLAT_OFF", "TIERED_PRICE"],
      required: true,
    },
    active: { type: Boolean, default: true },
    startsAt: { type: Date },
    endsAt: { type: Date },
    totalLimit: { type: Number },
    perUserLimit: { type: Number },
    percentOff: { type: Number },
    flatOffInr: { type: Number },
    bucketSize: { type: Number, default: 100 },
    prices: { type: [Number], default: [] },
    cap: { type: Number, default: 999 },
    usedCount: { type: Number, default: 0 },
  },
  { timestamps: true, collection: "coupons" }
);

CouponSchema.index({ code: 1 }, { unique: true });

export type CouponDocument = InferSchemaType<typeof CouponSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const CouponModel: Model<CouponDocument> =
  mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);
