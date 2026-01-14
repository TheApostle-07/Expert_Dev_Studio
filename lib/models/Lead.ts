import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const LeadSchema = new Schema(
  {
    offerId: { type: Schema.Types.ObjectId, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    fingerprintHash: { type: String, required: true, index: true },
    prizeLabel: { type: String, required: true },
    priceInr: { type: Number, required: true },
    anchorPriceInr: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["UNPAID", "DEPOSIT_PAID", "PAID"],
      default: "UNPAID",
    },
    paymentOption: { type: String, enum: ["FULL", "DEPOSIT"] },
    amountPaidInr: { type: Number, default: 0 },
    amountDueInr: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["NEW", "ONBOARDING", "IN_PROGRESS", "DELIVERED"],
      default: "NEW",
    },
    acceptedAt: { type: Date },
    expiresAt: { type: Date },
    orderId: { type: String },
    paymentId: { type: String },
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    company: { type: String },
    website: { type: String },
    goals: { type: String },
    timeline: { type: String },
    notes: { type: String },
    onboardingSubmittedAt: { type: Date },
  },
  { timestamps: true, collection: "founder_leads" }
);

LeadSchema.index({ paymentStatus: 1, createdAt: -1 });
LeadSchema.index({ status: 1, createdAt: -1 });
LeadSchema.index({ orderId: 1 });

export type LeadDocument = InferSchemaType<typeof LeadSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const LeadModel: Model<LeadDocument> =
  mongoose.models.FounderLead || mongoose.model("FounderLead", LeadSchema);
