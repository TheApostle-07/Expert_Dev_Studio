const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI missing");
  process.exit(1);
}

const SprintSlotSchema = new mongoose.Schema(
  {
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    capacity: { type: Number, default: 1 },
  },
  { timestamps: true, collection: "sprint_slots" }
);

const SprintSlot =
  mongoose.models.SprintSlot || mongoose.model("SprintSlot", SprintSlotSchema);

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Kolkata",
  weekday: "short",
});

const formatDateIST = (d) => dateFormatter.format(d);
const weekdayIST = (d) => weekdayFormatter.format(d);

async function main() {
  await mongoose.connect(MONGODB_URI);

  const slotsPerDay = ["11:00", "15:00", "18:00"];
  const now = new Date();
  const days = 14;
  const toInsert = [];

  for (let i = 0; i < days; i += 1) {
    const day = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const weekday = weekdayIST(day);
    if (weekday === "Sun") continue;
    const dateStr = formatDateIST(day);
    for (const time of slotsPerDay) {
      const start = new Date(`${dateStr}T${time}:00+05:30`);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      toInsert.push({ startTime: start, endTime: end });
    }
  }

  for (const slot of toInsert) {
    const exists = await SprintSlot.findOne({ startTime: slot.startTime }).lean();
    if (!exists) {
      await SprintSlot.create({
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
