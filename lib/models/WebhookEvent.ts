import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const WebhookEventSchema = new Schema(
  {
    provider: { type: String, default: "razorpay" },
    eventId: { type: String, unique: true, required: true },
    type: { type: String, required: true },
    payload: { type: Schema.Types.Mixed },
  },
  { timestamps: true, collection: "webhook_events" }
);

WebhookEventSchema.index({ eventId: 1 }, { unique: true });

export type WebhookEventDocument = InferSchemaType<typeof WebhookEventSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const WebhookEventModel: Model<WebhookEventDocument> =
  mongoose.models.WebhookEvent || mongoose.model("WebhookEvent", WebhookEventSchema);
