import { notFound } from "next/navigation";
import { connectToDatabase } from "../../../../lib/mongodb";
import { checkAdminGate, isAdminGateEnabled } from "../../../../lib/sprint/adminGate";
import AdminGate from "../../../../components/admin/AdminGate";
import { SprintBookingModel } from "../../../../lib/models/SprintBooking";
import { SprintSlotModel } from "../../../../lib/models/SprintSlot";
import { SprintUserModel } from "../../../../lib/models/SprintUser";
import { SprintIntakeModel } from "../../../../lib/models/SprintIntake";
import { PaymentModel } from "../../../../lib/models/Payment";
import { AdminAuditModel } from "../../../../lib/models/AdminAudit";
import SprintBookingActions from "../../../../components/admin/SprintBookingActions";
import RescheduleBooking from "../../../../components/admin/RescheduleBooking";

export const metadata = {
  title: "Admin · Sprint Booking",
};

export default async function SprintBookingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  if (!isAdminGateEnabled()) notFound();
  if (!checkAdminGate()) {
    return <AdminGate redirectTo={`/admin/sprint-bookings/${params.id}`} />;
  }

  await connectToDatabase();
  const booking = await SprintBookingModel.findById(params.id).lean();
  if (!booking) notFound();
  const slot = await SprintSlotModel.findById(booking.slotId).lean();
  const user = await SprintUserModel.findById(booking.userId).lean();
  const intake = await SprintIntakeModel.findOne({ bookingId: booking._id }).lean();
  const payment = await PaymentModel.findOne({ bookingId: booking._id }).lean();
  const audit = await AdminAuditModel.find({ bookingId: booking._id }).sort({ createdAt: -1 }).lean();

  return (
    <div className="min-h-screen bg-transparent text-black">
      <div className="page-shell pb-16 pt-24 sm:pt-28 md:pt-32">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.25)]">
            <p className="text-xs uppercase tracking-[0.3em] text-black/50">Booking</p>
            <h1 className="mt-2 text-2xl font-semibold text-prussian">{booking.bookingCode}</h1>
            <p className="mt-1 text-xs text-black/60">Status: {booking.status}</p>

            <div className="mt-4 grid gap-3 text-sm text-black/70">
              <p>Start fee: ₹{booking.startFee}</p>
              <p>Balance due: ₹{booking.balanceDue}</p>
              <p>
                Slot:{" "}
                {slot
                  ? new Intl.DateTimeFormat("en-IN", {
                      timeZone: "Asia/Kolkata",
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(slot.startTime))
                  : "—"}
              </p>
              <p>User: {user?.email || "—"}</p>
            </div>

            <SprintBookingActions bookingId={booking._id.toString()} />
          </div>

          <div className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.25)]">
            <p className="text-xs uppercase tracking-[0.3em] text-black/50">Payment</p>
            <div className="mt-3 text-sm text-black/70">
              <p>Order: {payment?.orderId || "—"}</p>
              <p>Payment: {payment?.paymentId || "—"}</p>
              <p>Status: {payment?.status || "—"}</p>
            </div>
            <RescheduleBooking bookingId={booking._id.toString()} />
            <div className="mt-6 text-xs text-black/60">
              Refunds update status and payment records; coordinate with finance if needed.
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-black/10 bg-white/90 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-black/50">Intake</p>
            {intake ? (
              <div className="mt-3 space-y-2 text-sm text-black/70">
                <p>Brand: {intake.brandName}</p>
                <p>Headline: {intake.offerHeadline}</p>
                <p>Pricing: {intake.packagesPricing}</p>
                <p>WhatsApp: {intake.whatsappNumber}</p>
                <p>Benefits: {intake.benefits?.join(", ")}</p>
                {intake.testimonials ? <p>Testimonials: {intake.testimonials}</p> : null}
                {intake.brandColors ? <p>Brand colors: {intake.brandColors}</p> : null}
                {intake.links ? <p>Links: {intake.links}</p> : null}
              </div>
            ) : (
              <p className="mt-3 text-sm text-black/60">No intake yet.</p>
            )}
          </div>
          <div className="rounded-3xl border border-black/10 bg-white/90 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-black/50">Audit log</p>
            <div className="mt-3 space-y-2 text-xs text-black/60">
              {audit.map((entry) => (
                <div key={entry._id.toString()} className="rounded-lg border border-black/10 bg-white px-3 py-2">
                  <p className="font-semibold text-prussian">{entry.action}</p>
                  <p>{entry.createdAt.toISOString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
