import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const RateLimitSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    action: { type: String, required: true },
    ipHash: { type: String, required: true },
    count: { type: Number, default: 0 },
    windowStart: { type: Date, required: true },
    windowEnd: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "rate_limits" }
);

RateLimitSchema.index({ windowEnd: 1 }, { expireAfterSeconds: 0 });

export type RateLimitDocument = InferSchemaType<typeof RateLimitSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const RateLimitModel: Model<RateLimitDocument> =
  mongoose.models.RateLimit || mongoose.model("RateLimit", RateLimitSchema);
