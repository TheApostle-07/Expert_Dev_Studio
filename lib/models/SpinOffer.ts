import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const SpinOfferSchema = new Schema(
  {
    sessionId: { type: String, required: true, index: true },
    fingerprintHash: { type: String, required: true, index: true },
    attemptNumber: { type: Number, required: true },
    prizeCode: { type: String, required: true },
    prizeLabel: { type: String, required: true },
    priceInr: { type: Number, required: true },
    anchorPriceInr: { type: Number, required: true },
    bonusLabel: { type: String },
    status: {
      type: String,
      enum: ["ROLLED", "ACCEPTED", "EXPIRED", "PAID", "DECLINED"],
      default: "ROLLED",
    },
    acceptedAt: { type: Date },
    expiresAt: { type: Date },
    leadId: { type: Schema.Types.ObjectId },
  },
  { timestamps: true, collection: "spin_offers" }
);

SpinOfferSchema.index({ status: 1, createdAt: -1 });
SpinOfferSchema.index({ acceptedAt: -1 });

export type SpinOfferDocument = InferSchemaType<typeof SpinOfferSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const SpinOfferModel: Model<SpinOfferDocument> =
  mongoose.models.SpinOffer || mongoose.model("SpinOffer", SpinOfferSchema);
