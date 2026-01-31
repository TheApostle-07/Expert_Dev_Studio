import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const NotificationQueueSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "SprintUser" },
    bookingId: { type: Schema.Types.ObjectId, ref: "SprintBooking" },
    channel: { type: String, enum: ["email", "whatsapp", "internal"], required: true },
    payload: { type: Schema.Types.Mixed },
    status: {
      type: String,
      enum: ["queued", "sent", "failed", "cancelled"],
      default: "queued",
    },
    scheduledAt: { type: Date, index: true, required: true },
  },
  { timestamps: true, collection: "notification_queue" }
);

NotificationQueueSchema.index({ scheduledAt: 1 });

export type NotificationQueueDocument = InferSchemaType<typeof NotificationQueueSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const NotificationQueueModel: Model<NotificationQueueDocument> =
  mongoose.models.NotificationQueue ||
  mongoose.model("NotificationQueue", NotificationQueueSchema);
