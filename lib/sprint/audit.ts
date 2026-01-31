import { AdminAuditModel } from "../models/AdminAudit";

export async function logAdminAction({
  adminKey,
  action,
  bookingId,
  meta,
}: {
  adminKey: string;
  action: string;
  bookingId?: string;
  meta?: Record<string, unknown>;
}) {
  await AdminAuditModel.create({
    adminKey,
    action,
    bookingId,
    meta,
  });
}
