import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/mongodb";
import { requireAdmin } from "../../../../../lib/sprint/adminApi";
import { SprintBookingModel } from "../../../../../lib/models/SprintBooking";
import { SprintUserModel } from "../../../../../lib/models/SprintUser";
import { SprintSlotModel } from "../../../../../lib/models/SprintSlot";
import { PaymentModel } from "../../../../../lib/models/Payment";
import { SprintIntakeModel } from "../../../../../lib/models/SprintIntake";
import { AdminAuditModel } from "../../../../../lib/models/AdminAudit";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const auth = requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const booking = await SprintBookingModel.findById(params.id).lean();
  if (!booking) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  const user = await SprintUserModel.findById(booking.userId).lean();
  const slot = await SprintSlotModel.findById(booking.slotId).lean();
  const payment = await PaymentModel.findOne({ bookingId: booking._id }).lean();
  const intake = await SprintIntakeModel.findOne({ bookingId: booking._id }).lean();
  const audit = await AdminAuditModel.find({ bookingId: booking._id }).sort({ createdAt: -1 }).lean();

  return NextResponse.json({
    ok: true,
    booking: {
      id: booking._id.toString(),
      bookingCode: booking.bookingCode,
      status: booking.status,
      priceTotal: booking.priceTotal,
      startFee: booking.startFee,
      balanceDue: booking.balanceDue,
      createdAt: booking.createdAt.toISOString(),
      intakeSubmittedAt: booking.intakeSubmittedAt?.toISOString(),
      draftSentAt: booking.draftSentAt?.toISOString(),
      approvedAt: booking.approvedAt?.toISOString(),
      completedAt: booking.completedAt?.toISOString(),
      notes: booking.notes,
    },
    user: user
      ? { id: user._id.toString(), email: user.email, phone: user.phone }
      : null,
    slot: slot
      ? {
          id: slot._id.toString(),
          startTime: slot.startTime.toISOString(),
          endTime: slot.endTime.toISOString(),
        }
      : null,
    payment: payment
      ? {
          orderId: payment.orderId,
          paymentId: payment.paymentId,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
        }
      : null,
    intake,
    audit: audit.map((item) => ({
      action: item.action,
      adminKey: item.adminKey,
      createdAt: item.createdAt.toISOString(),
      meta: item.meta,
    })),
  });
}
