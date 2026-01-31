import mongoose from "mongoose";
import { SprintSlotModel } from "../lib/models/SprintSlot";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI missing");
  process.exit(1);
}

const formatDate = (d: Date) => d.toISOString().slice(0, 10);

async function main() {
  await mongoose.connect(MONGODB_URI);

  const slotsPerDay = ["11:00", "15:00", "18:00"];
  const now = new Date();
  const days = 14;
  const toInsert: { startTime: Date; endTime: Date }[] = [];

  for (let i = 0; i < days; i += 1) {
    const day = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const weekday = day.getUTCDay();
    // 0 = Sunday
    if (weekday === 0) continue;
    const dateStr = formatDate(day);
    for (const time of slotsPerDay) {
      const start = new Date(`${dateStr}T${time}:00+05:30`);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      toInsert.push({ startTime: start, endTime: end });
    }
  }

  for (const slot of toInsert) {
    const exists = await SprintSlotModel.findOne({ startTime: slot.startTime }).lean();
    if (!exists) {
      await SprintSlotModel.create({
        startTime: slot.startTime,
        endTime: slot.endTime,
        isActive: true,
        capacity: 1,
      });
    }
  }

  console.log("Seed complete");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
