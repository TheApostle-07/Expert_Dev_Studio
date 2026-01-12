import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const AuditSchema = new Schema(
  {
    userId: { type: String },
    ipHash: { type: String, required: true, index: true },
    urlRaw: { type: String, required: true },
    urlNormalized: { type: String, required: true },
    host: { type: String, required: true },
    status: {
      type: String,
      enum: ["QUEUED", "RUNNING", "DONE", "FAILED"],
      default: "QUEUED",
    },
    scanStartedAt: { type: Date },
    scanCompletedAt: { type: Date },
    scanError: { type: String },
    scanAttempts: { type: Number, default: 0 },
    scoreOverall: { type: Number, min: 0, max: 100 },
    label: {
      type: String,
      enum: ["DANGER", "WARNING", "GOOD", "AMAZING"],
    },
    preview: { type: Schema.Types.Mixed },
    fullReport: { type: Schema.Types.Mixed },
    isUnlocked: { type: Boolean, default: false },
    currency: { type: String, default: "INR" },
    basePriceInr: { type: Number, required: true },
    finalPriceInr: { type: Number },
    couponCodeApplied: { type: String },
    couponReservationId: { type: Schema.Types.ObjectId },
    couponRedemptionId: { type: Schema.Types.ObjectId },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    paidAt: { type: Date },
    leadName: { type: String },
    leadEmail: { type: String },
    leadPhone: { type: String },
    leadConsentAt: { type: Date },
    leadCapturedAt: { type: Date },
    snapshot: { type: Schema.Types.Mixed },
    snapshotSavedAt: { type: Date },
  },
  { timestamps: true, collection: "audits" }
);

AuditSchema.index({ ipHash: 1, createdAt: -1 });
AuditSchema.index({ urlNormalized: 1, createdAt: -1 });
AuditSchema.index({ razorpayPaymentId: 1 }, { unique: true, sparse: true });

export type AuditDocument = InferSchemaType<typeof AuditSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const AuditModel: Model<AuditDocument> =
  mongoose.models.Audit || mongoose.model("Audit", AuditSchema);
