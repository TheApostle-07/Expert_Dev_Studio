import { notFound } from "next/navigation";
import { connectToDatabase } from "../../../lib/mongodb";
import { checkAdminGate, isAdminGateEnabled } from "../../../lib/sprint/adminGate";
import AdminGate from "../../../components/admin/AdminGate";
import { SprintBookingModel } from "../../../lib/models/SprintBooking";
import { SprintSlotModel } from "../../../lib/models/SprintSlot";
import { SprintUserModel } from "../../../lib/models/SprintUser";

export const metadata = {
  title: "Admin · Sprint Bookings",
};

export default async function SprintBookingsPage({
  searchParams,
}: {
  searchParams: { status?: string; intake?: string };
}) {
  if (!isAdminGateEnabled()) notFound();
  if (!checkAdminGate()) {
    return <AdminGate redirectTo="/admin/sprint-bookings" />;
  }

  await connectToDatabase();
  const filter: Record<string, unknown> = {};
  if (searchParams.status && searchParams.status !== "ALL") {
    filter.status = searchParams.status;
  }

  const bookings = await SprintBookingModel.find(filter).sort({ createdAt: -1 }).lean();
  const slotIds = bookings.map((b) => b.slotId);
  const userIds = bookings.map((b) => b.userId);
  const slots = await SprintSlotModel.find({ _id: { $in: slotIds } }).lean();
  const users = await SprintUserModel.find({ _id: { $in: userIds } }).lean();
  const slotMap = new Map(slots.map((s) => [s._id.toString(), s]));
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));
  const statusFilters = ["ALL", "CONFIRMED", "INTAKE_SUBMITTED", "DRAFT_SENT", "CLIENT_APPROVED", "COMPLETED"];

  return (
    <div className="min-h-screen bg-transparent text-black">
      <div className="page-shell pb-16 pt-24 sm:pt-28 md:pt-32">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/50">Admin</p>
            <h1 className="mt-2 text-2xl font-semibold text-prussian">Sprint bookings</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {statusFilters.map((item) => {
              const href =
                item === "ALL"
                  ? `/admin/sprint-bookings`
                  : `/admin/sprint-bookings?status=${item}`;
              const active = (searchParams.status || "ALL") === item;
              return (
                <a
                  key={item}
                  href={href}
                  className={`rounded-full px-3 py-1 font-semibold ${
                    active
                      ? "bg-cerulean/10 text-cerulean"
                      : "border border-black/10 text-black/60"
                  }`}
                >
                  {item}
                </a>
              );
            })}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white/90">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_0.6fr] gap-4 border-b border-black/5 px-4 py-3 text-xs font-semibold text-black/50">
            <span>Booking</span>
            <span>User</span>
            <span>Slot</span>
            <span>Status</span>
            <span></span>
          </div>
          {bookings.map((booking) => {
            const user = userMap.get(booking.userId.toString());
            const slot = slotMap.get(booking.slotId.toString());
            return (
              <div
                key={booking._id.toString()}
                className="grid grid-cols-[1.4fr_1fr_1fr_1fr_0.6fr] gap-4 px-4 py-3 text-sm text-black/70 border-b border-black/5"
              >
                <div>
                  <p className="font-semibold text-prussian">{booking.bookingCode}</p>
                  <p className="text-xs text-black/50">
                    {new Date(booking.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="text-xs">
                  <p>{user?.email || "—"}</p>
                </div>
                <div className="text-xs">
                  {slot ? (
                    <p>
                      {new Intl.DateTimeFormat("en-IN", {
                        timeZone: "Asia/Kolkata",
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(slot.startTime))}
                    </p>
                  ) : (
                    "—"
                  )}
                </div>
                <div className="text-xs font-semibold text-prussian">{booking.status}</div>
                <div>
                  <a
                    href={`/admin/sprint-bookings/${booking._id.toString()}`}
                    className="text-xs font-semibold text-prussian"
                  >
                    View →
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
