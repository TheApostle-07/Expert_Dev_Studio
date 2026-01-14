import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { LeadModel } from "../../../../lib/models/Lead";
import { PaymentEventModel } from "../../../../lib/models/PaymentEvent";
import { requireAdminToken } from "../../../../lib/founders/admin";

export async function GET(req: Request) {
  const auth = requireAdminToken(req);
  if (auth instanceof NextResponse) return auth;

  await connectToDatabase();

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const filter = status ? { status } : {};

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

  return NextResponse.json({
    ok: true,
    leads: leads.map((lead) => ({
      ...lead,
      id: lead._id.toString(),
      events: grouped.get(lead._id.toString()) || [],
    })),
  });
}
