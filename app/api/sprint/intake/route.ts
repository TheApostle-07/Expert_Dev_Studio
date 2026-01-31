import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { intakeSchema } from "../../../../lib/sprint/validation";
import { getSessionUserId } from "../../../../lib/sprint/auth";
import { SprintBookingModel } from "../../../../lib/models/SprintBooking";
import { SprintIntakeModel } from "../../../../lib/models/SprintIntake";

export async function POST(req: Request) {
  await connectToDatabase();
  const userId = getSessionUserId();
  if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const payload = await req.json().catch(() => null);
  const parsed = intakeSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const booking = await SprintBookingModel.findById(parsed.data.bookingId).exec();
  if (!booking || booking.userId.toString() !== userId) {
    return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });
  }
  if (booking.status !== "CONFIRMED" && booking.status !== "INTAKE_SUBMITTED") {
    return NextResponse.json({ ok: false, error: "Booking not confirmed" }, { status: 409 });
  }

  await SprintIntakeModel.findOneAndUpdate(
    { bookingId: booking._id },
    {
      $set: {
        brandName: parsed.data.brandName,
        offerHeadline: parsed.data.offerHeadline,
        packagesPricing: parsed.data.packagesPricing,
        whatsappNumber: parsed.data.whatsappNumber,
        benefits: parsed.data.benefits,
        testimonials: parsed.data.testimonials || undefined,
        brandColors: parsed.data.brandColors || undefined,
        links: parsed.data.links || undefined,
      },
    },
    { upsert: true, new: true }
  ).exec();

  booking.status = "INTAKE_SUBMITTED";
  booking.intakeSubmittedAt = new Date();
  await booking.save();

  return NextResponse.json({ ok: true });
}
