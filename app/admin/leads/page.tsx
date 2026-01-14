import { notFound } from "next/navigation";
import { connectToDatabase } from "../../../lib/mongodb";
import { LeadModel } from "../../../lib/models/Lead";
import { PaymentEventModel } from "../../../lib/models/PaymentEvent";
import AdminLeadsTable from "../../../components/founders/AdminLeadsTable";

export const metadata = {
  title: "Admin · Leads",
};

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: { token?: string; status?: string };
}) {
  const token = process.env.ADMIN_TOKEN;
  if (!token || !searchParams.token || searchParams.token !== token) {
    notFound();
  }

  await connectToDatabase();
  const filter = searchParams.status ? { status: searchParams.status } : {};
  const leads = await LeadModel.find(filter).sort({ createdAt: -1 }).lean();
  const leadIds = leads.map((lead) => lead._id);
  const events = await PaymentEventModel.find({ leadId: { $in: leadIds } })
    .sort({ createdAt: -1 })
    .lean();

  const grouped = new Map<string, typeof events>();
  for (const event of events) {
    const key = event.leadId.toString();
    const list = grouped.get(key) || [];
    list.push(event);
    grouped.set(key, list);
  }

  const statusFilters = ["ALL", "NEW", "ONBOARDING", "IN_PROGRESS", "DELIVERED"];

  return (
    <div className="min-h-screen bg-transparent text-black">
      <div className="page-shell pb-16 pt-24 sm:pt-28 md:pt-32">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/50">Admin</p>
            <h1 className="mt-2 text-2xl font-semibold text-prussian">Founder leads</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {statusFilters.map((item) => {
              const href =
                item === "ALL"
                  ? `/admin/leads?token=${searchParams.token}`
                  : `/admin/leads?token=${searchParams.token}&status=${item}`;
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
        <AdminLeadsTable
          token={searchParams.token}
          leads={leads.map((lead) => ({
            id: lead._id.toString(),
            name: lead.name,
            email: lead.email,
            prizeLabel: lead.prizeLabel,
            paymentStatus: lead.paymentStatus,
            status: lead.status,
            priceInr: lead.priceInr,
            amountPaidInr: lead.amountPaidInr,
            createdAt: lead.createdAt.toISOString(),
            acceptedAt: lead.acceptedAt?.toISOString(),
            expiresAt: lead.expiresAt?.toISOString(),
            notes: lead.notes,
            events: grouped.get(lead._id.toString())?.map((event) => ({
              type: event.type,
              orderId: event.orderId,
              paymentId: event.paymentId,
              amountInr: event.amountInr,
              createdAt: event.createdAt.toISOString(),
            })),
          }))}
        />
      </div>
    </div>
  );
}
