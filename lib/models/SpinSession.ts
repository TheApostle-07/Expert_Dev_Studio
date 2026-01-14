import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const SpinSessionSchema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    fingerprintHash: { type: String, required: true, index: true },
    attemptsUsed: { type: Number, default: 0 },
    windowStart: { type: Date, required: true },
    windowEnd: { type: Date, required: true },
    cooldownUntil: { type: Date },
    lastSpinAt: { type: Date },
    activeOfferId: { type: Schema.Types.ObjectId },
  },
  { timestamps: true, collection: "spin_sessions" }
);

SpinSessionSchema.index({ fingerprintHash: 1, windowEnd: 1 });

export type SpinSessionDocument = InferSchemaType<typeof SpinSessionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const SpinSessionModel: Model<SpinSessionDocument> =
  mongoose.models.SpinSession ||
  mongoose.model("SpinSession", SpinSessionSchema);
