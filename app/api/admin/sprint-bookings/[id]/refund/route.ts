import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../../lib/mongodb";
import { requireAdmin } from "../../../../../../lib/sprint/adminApi";
import { SprintBookingModel } from "../../../../../../lib/models/SprintBooking";
import { PaymentModel } from "../../../../../../lib/models/Payment";
import { logAdminAction } from "../../../../../../lib/sprint/audit";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const auth = requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const payload = await req.json().catch(() => null);
  const reason = payload?.reason as string | undefined;

  const booking = await SprintBookingModel.findById(params.id).exec();
  if (!booking) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  booking.status = "REFUND_REQUESTED";
  await booking.save();

  const payment = await PaymentModel.findOne({ bookingId: booking._id }).exec();
  if (payment) {
    payment.status = "refunded";
    await payment.save();
  }

  booking.status = "REFUNDED";
  await booking.save();

  await logAdminAction({
    adminKey: "admin",
    action: "REFUND",
    bookingId: booking._id.toString(),
    meta: { reason },
  });
  return NextResponse.json({ ok: true });
}
