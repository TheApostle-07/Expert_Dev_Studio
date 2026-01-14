import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const PaymentEventSchema = new Schema(
  {
    leadId: { type: Schema.Types.ObjectId, required: true, index: true },
    offerId: { type: Schema.Types.ObjectId, index: true },
    type: { type: String, required: true },
    orderId: { type: String },
    paymentId: { type: String },
    eventId: { type: String },
    amountInr: { type: Number },
    currency: { type: String, default: "INR" },
    note: { type: String },
  },
  { timestamps: true, collection: "payment_events" }
);

PaymentEventSchema.index({ orderId: 1 });
PaymentEventSchema.index({ paymentId: 1 });
PaymentEventSchema.index({ eventId: 1 });

export type PaymentEventDocument = InferSchemaType<typeof PaymentEventSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const PaymentEventModel: Model<PaymentEventDocument> =
  mongoose.models.PaymentEvent || mongoose.model("PaymentEvent", PaymentEventSchema);
