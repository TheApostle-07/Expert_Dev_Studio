import { notFound } from "next/navigation";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { connectToDatabase } from "../../lib/mongodb";
import { LeadModel } from "../../lib/models/Lead";
import OnboardingForm from "../../components/founders/OnboardingForm";

export const metadata = {
  title: "Slot booked",
};

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: { lead?: string };
}) {
  if (!searchParams.lead) {
    notFound();
  }

  await connectToDatabase();
  const lead = await LeadModel.findById(searchParams.lead).lean();
  if (!lead) {
    notFound();
  }

  const paid = lead.paymentStatus !== "UNPAID";
  const persona = parseInt(lead._id.toString().slice(-1), 16) % 2 === 0
    ? { name: "Aanya", title: "Client Success Manager" }
    : { name: "Aarav", title: "Client Success Manager" };

  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || process.env.WHATSAPP_NUMBER || "";
  const whatsappMessage = `Hi ${persona.name}, I booked the Founder Slot website today. Lead ID: ${lead._id.toString()}. Please share the onboarding checklist.`;
  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
    : null;

  return (
    <div className="min-h-screen bg-transparent text-black">
      <div className="page-shell pb-16 pt-24 sm:pt-28 md:pt-32">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.25)]">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cerulean/10 text-cerulean">
                  <CheckCircle2 className="h-6 w-6" aria-hidden />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-black/50">
                    Slot booked
                  </p>
                  <h1 className="mt-2 text-2xl font-semibold text-prussian">
                    {paid ? "Payment confirmed." : "Payment pending."}
                  </h1>
                </div>
              </div>
              <p className="mt-4 text-sm text-black/70">
                Lead ID: <span className="font-semibold text-prussian">{lead._id.toString()}</span>
              </p>
              <p className="mt-1 text-sm text-black/70">
                Offer: {lead.prizeLabel} · ₹{lead.priceInr.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.25)]">
              <p className="text-xs uppercase tracking-[0.3em] text-black/50">
                What happens next
              </p>
              <div className="mt-4 grid gap-4 text-sm text-black/70">
                {[
                  "Day 1: Content + layout draft",
                  "Day 3: Preview link",
                  "Day 5: Live + handover",
                  "30 days support",
                ].map((step) => (
                  <div
                    key={step}
                    className="rounded-xl border border-black/10 bg-white px-4 py-3"
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.25)]">
              <p className="text-xs uppercase tracking-[0.3em] text-black/50">
                Client Success Manager
              </p>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-prussian text-white text-lg font-semibold">
                  {persona.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-prussian">{persona.name}</p>
                  <p className="text-xs text-black/50">{persona.title}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-black/70">
                Your client success manager is ready to share the onboarding checklist and
                guide the sprint.
              </p>
              {whatsappLink ? (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-prussian px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-prussian/90"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  WhatsApp {persona.name}
                </a>
              ) : (
                <p className="mt-4 text-xs text-black/50">
                  Add WHATSAPP_NUMBER to enable the direct handoff link.
                </p>
              )}
            </div>

            {paid ? (
              <OnboardingForm leadId={lead._id.toString()} />
            ) : (
              <div className="rounded-2xl border border-black/10 bg-white/90 p-5 text-sm text-black/70 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.25)]">
                Complete payment to unlock onboarding.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
