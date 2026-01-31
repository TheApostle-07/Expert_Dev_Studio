import { NotificationQueueModel } from "../models/NotificationQueue";

export async function enqueueIntakeNudges({
  userId,
  bookingId,
  baseTime,
}: {
  userId: string;
  bookingId: string;
  baseTime: Date;
}) {
  const offsets = [60, 12 * 60, 24 * 60];
  const jobs = offsets.map((minutes) => ({
    userId,
    bookingId,
    channel: "whatsapp" as const,
    payload: { type: "INTAKE_NUDGE", minutes },
    status: "queued" as const,
    scheduledAt: new Date(baseTime.getTime() + minutes * 60 * 1000),
  }));
  await NotificationQueueModel.insertMany(jobs);
}
