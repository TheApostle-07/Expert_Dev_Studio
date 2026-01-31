import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const SprintIntakeSchema = new Schema(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "SprintBooking", unique: true },
    brandName: { type: String, required: true },
    offerHeadline: { type: String, required: true },
    packagesPricing: { type: String, required: true },
    whatsappNumber: { type: String, required: true },
    benefits: [{ type: String, required: true }],
    testimonials: { type: String },
    brandColors: { type: String },
    links: { type: String },
  },
  { timestamps: true, collection: "sprint_intakes" }
);

SprintIntakeSchema.index({ bookingId: 1 }, { unique: true });

export type SprintIntakeDocument = InferSchemaType<typeof SprintIntakeSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const SprintIntakeModel: Model<SprintIntakeDocument> =
  mongoose.models.SprintIntake || mongoose.model("SprintIntake", SprintIntakeSchema);
