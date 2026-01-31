import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const SpinPurchaseSchema = new Schema(
  {
    sessionId: { type: String, required: true, index: true },
    fingerprintHash: { type: String, required: true, index: true },
    packSpins: { type: Number, required: true },
    amountInr: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },
    orderId: { type: String, required: true, unique: true },
    paymentId: { type: String },
    paidAt: { type: Date },
  },
  { timestamps: true, collection: "spin_purchases" }
);

SpinPurchaseSchema.index({ sessionId: 1, createdAt: -1 });
SpinPurchaseSchema.index({ fingerprintHash: 1, createdAt: -1 });

export type SpinPurchaseDocument = InferSchemaType<typeof SpinPurchaseSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const SpinPurchaseModel: Model<SpinPurchaseDocument> =
  mongoose.models.SpinPurchase ||
  mongoose.model("SpinPurchase", SpinPurchaseSchema);
