import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const PaymentSchema = new Schema(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "SprintBooking", index: true },
    provider: { type: String, default: "razorpay" },
    orderId: { type: String, unique: true, required: true },
    paymentId: { type: String, unique: true, sparse: true },
    signature: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["created", "captured", "failed", "refunded"],
      default: "created",
    },
    rawPayload: { type: Schema.Types.Mixed },
  },
  { timestamps: true, collection: "sprint_payments" }
);

PaymentSchema.index({ orderId: 1 }, { unique: true });
PaymentSchema.index({ paymentId: 1 }, { unique: true, sparse: true });

export type PaymentDocument = InferSchemaType<typeof PaymentSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const PaymentModel: Model<PaymentDocument> =
  mongoose.models.SprintPayment || mongoose.model("SprintPayment", PaymentSchema);
