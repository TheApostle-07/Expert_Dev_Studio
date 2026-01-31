import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const SprintSlotSchema = new Schema(
  {
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    capacity: { type: Number, default: 1 },
  },
  { timestamps: true, collection: "sprint_slots" }
);

SprintSlotSchema.index({ startTime: 1, isActive: 1 });

export type SprintSlotDocument = InferSchemaType<typeof SprintSlotSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const SprintSlotModel: Model<SprintSlotDocument> =
  mongoose.models.SprintSlot || mongoose.model("SprintSlot", SprintSlotSchema);
