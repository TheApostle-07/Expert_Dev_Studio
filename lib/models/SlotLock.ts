import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const SlotLockSchema = new Schema(
  {
    slotId: { type: Schema.Types.ObjectId, ref: "SprintSlot", index: true, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "SprintUser", index: true, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true, collection: "slot_locks" }
);

SlotLockSchema.index({ slotId: 1 }, { unique: true });
SlotLockSchema.index({ slotId: 1, expiresAt: 1 });
SlotLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type SlotLockDocument = InferSchemaType<typeof SlotLockSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const SlotLockModel: Model<SlotLockDocument> =
  mongoose.models.SlotLock || mongoose.model("SlotLock", SlotLockSchema);
