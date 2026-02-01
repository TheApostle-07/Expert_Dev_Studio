import { leadCatcherOSCopy } from "../../../content/leadcatcheros";

export default function LeadCatcherThanksPage({
  searchParams,
}: {
  searchParams: { leadId?: string; businessType?: string; city?: string };
}) {
  const leadId = searchParams.leadId;
  const businessType = searchParams.businessType || "";
  const city = searchParams.city || "";
  const whatsappNumber = process.env.WHATSAPP_NUMBER || "";
  const prefill = leadCatcherOSCopy.whatsappPrefill
    .replace("{leadId}", leadId || "LCOS-XXXXXX")
    .replace("{businessType}", businessType || "")
    .replace("{city}", city || "");

  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(prefill)}`
    : "#";

  return (
    <div className="bg-transparent text-black">
      <main className="page-shell pb-24 pt-24">
        <section className="mx-auto max-w-2xl rounded-3xl border border-black/10 bg-white/90 p-8 text-center shadow-[0_20px_60px_-35px_rgba(0,0,0,0.3)]">
          <p className="text-xs uppercase tracking-[0.3em] text-black/50">Lead Catcher OS</p>
          <h1 className="mt-3 text-3xl font-semibold text-prussian">Thanks — we got your request.</h1>
          <p className="mt-3 text-sm text-black/70">
            We’ll message you on WhatsApp with the demo + next steps shortly.
          </p>
          {leadId ? (
            <div className="mt-5 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black/70">
              Lead ID: <span className="font-semibold text-prussian">{leadId}</span>
            </div>
          ) : null}

          <div className="mt-6 text-left text-sm text-black/70">
            <p className="font-semibold text-prussian">Next steps</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>We’ll WhatsApp you with demo + pricing.</li>
              <li>If urgent, message us now.</li>
            </ul>
          </div>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={whatsappLink}
              className="inline-flex items-center justify-center rounded-full bg-prussian px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] transition hover:bg-prussian/90"
            >
              Message on WhatsApp
            </a>
            <a
              href="/lead-catcher-os"
              className="inline-flex items-center justify-center rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-prussian hover:bg-black/5"
            >
              Back to Lead Catcher OS
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
