import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const AdminAuditSchema = new Schema(
  {
    adminKey: { type: String, required: true },
    action: { type: String, required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "SprintBooking" },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true, collection: "admin_audit" }
);

AdminAuditSchema.index({ createdAt: -1 });

export type AdminAuditDocument = InferSchemaType<typeof AdminAuditSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const AdminAuditModel: Model<AdminAuditDocument> =
  mongoose.models.AdminAudit || mongoose.model("AdminAudit", AdminAuditSchema);
