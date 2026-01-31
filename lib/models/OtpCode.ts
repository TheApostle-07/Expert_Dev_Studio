import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const OtpCodeSchema = new Schema(
  {
    email: { type: String, required: true, index: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    ipHash: { type: String, required: true },
  },
  { timestamps: true, collection: "otp_codes" }
);

OtpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpCodeSchema.index({ email: 1, expiresAt: 1 });

export type OtpCodeDocument = InferSchemaType<typeof OtpCodeSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const OtpCodeModel: Model<OtpCodeDocument> =
  mongoose.models.OtpCode || mongoose.model("OtpCode", OtpCodeSchema);
