import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { SPRINT_STATUSES } from "../sprint/constants";

const SprintBookingSchema = new Schema(
  {
    bookingCode: { type: String, unique: true, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "SprintUser", index: true, required: true },
    slotId: { type: Schema.Types.ObjectId, ref: "SprintSlot", unique: true, required: true },
    status: { type: String, enum: SPRINT_STATUSES, default: "CREATED" },
    priceTotal: { type: Number, default: 9999 },
    startFee: { type: Number, default: 999 },
    balanceDue: { type: Number, default: 9000 },
    intakeSubmittedAt: { type: Date },
    draftSentAt: { type: Date },
    approvedAt: { type: Date },
    completedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true, collection: "sprint_bookings" }
);

SprintBookingSchema.index({ bookingCode: 1 }, { unique: true });
SprintBookingSchema.index({ slotId: 1 }, { unique: true });
SprintBookingSchema.index({ status: 1, createdAt: -1 });

export type SprintBookingDocument = InferSchemaType<typeof SprintBookingSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const SprintBookingModel: Model<SprintBookingDocument> =
  mongoose.models.SprintBooking ||
  mongoose.model("SprintBooking", SprintBookingSchema);
