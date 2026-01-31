import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const SprintUserSchema = new Schema(
  {
    email: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
  },
  { timestamps: true, collection: "sprint_users" }
);

SprintUserSchema.index({ email: 1 }, { unique: true, sparse: true });
SprintUserSchema.index({ phone: 1 }, { unique: true, sparse: true });

export type SprintUserDocument = InferSchemaType<typeof SprintUserSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const SprintUserModel: Model<SprintUserDocument> =
  mongoose.models.SprintUser || mongoose.model("SprintUser", SprintUserSchema);
