import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const CouponReservationSchema = new Schema(
  {
    couponCode: { type: String, required: true },
    couponId: { type: Schema.Types.ObjectId, required: true },
    auditId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: String },
    ipHash: { type: String, required: true },
    usageNumber: { type: Number, required: true },
    bucketIndex: { type: Number, required: true },
    quotedPriceInr: { type: Number, required: true },
    status: {
      type: String,
      enum: ["RESERVED", "CONSUMED", "EXPIRED", "CANCELLED"],
      default: "RESERVED",
    },
    expiresAt: { type: Date, required: true },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "coupon_reservations" }
);

CouponReservationSchema.index(
  { auditId: 1 },
  { unique: true, partialFilterExpression: { status: "RESERVED" } }
);
CouponReservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
CouponReservationSchema.index({ couponId: 1, status: 1, createdAt: -1 });

export type CouponReservationDocument =
  InferSchemaType<typeof CouponReservationSchema> & {
    _id: mongoose.Types.ObjectId;
  };

export const CouponReservationModel: Model<CouponReservationDocument> =
  mongoose.models.CouponReservation ||
  mongoose.model("CouponReservation", CouponReservationSchema);
