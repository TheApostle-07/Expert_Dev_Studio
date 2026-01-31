import { ArrowRight, CheckCircle2, Clock, ShieldCheck, Sparkles } from "lucide-react";

export const metadata = {
  title: "48H Lead Catcher Sprint · ExpertDevStudio",
  description:
    "Stop losing leads in DMs. Convert IG traffic into WhatsApp leads in 48 hours.",
};

const faqs = [
  {
    q: "What exactly do you deliver in 48 hours?",
    a: "A conversion-focused Lead Catcher page that routes IG traffic into WhatsApp, with crisp copy, trust sections, and a clear CTA.",
  },
  {
    q: "What happens after I pay the ₹999 start fee?",
    a: "You’ll lock your slot, complete a short intake, and get your first draft within 24 hours.",
  },
  {
    q: "Is the remaining ₹9,000 mandatory?",
    a: "It’s due only after you approve the first draft layout. If you choose not to proceed, you can stop there.",
  },
  {
    q: "Can I reschedule?",
    a: "Yes, one reschedule is included if requested at least 12 hours before your slot.",
  },
];

export default function LeadCatcherSprintPage() {
  return (
    <div className="min-h-screen bg-transparent text-black">
      <div className="page-shell pb-20 pt-24 sm:pt-28 md:pt-32">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-cerulean/10 px-3 py-1 text-xs font-semibold text-prussian">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              48H Lead Catcher Sprint
            </div>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-prussian sm:text-5xl">
              Stop losing leads in DMs. Convert IG traffic into WhatsApp leads.
            </h1>
            <p className="mt-4 text-base text-black/70 sm:text-lg">
              A 48-hour conversion sprint built for founders who want a lead-ready landing page,
              fast. First draft in 24h. Go-live within 48h after intake.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="/lead-catcher-sprint/book"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-prussian px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-prussian/90"
              >
                Book Slot ₹999
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
              <a
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-prussian shadow-[0_6px_18px_-12px_rgba(0,0,0,0.25)] transition hover:bg-black/5"
              >
                View pricing
              </a>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-xs text-black/60">
              {[
                "Mobile LCP < 1.5s",
                "Razorpay-ready",
                "SEO-ready",
              ].map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-black/10 bg-white/80 px-3 py-1 font-semibold"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.25)]">
            <p className="text-xs uppercase tracking-[0.3em] text-black/50">
              Outcome
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-prussian">
              A lead-ready page that converts IG traffic in 1 tap.
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-black/70">
              {[
                "Headline + offer stack that stops the scroll.",
                "WhatsApp CTA with friction-free funnel.",
                "Proof + trust sections tuned for conversion.",
                "Designed for mobile speed & clarity.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-cerulean" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 rounded-2xl border border-black/10 bg-white px-4 py-4 text-sm text-black/70">
              <div className="flex items-center gap-2 text-xs font-semibold text-black/50">
                <Clock className="h-4 w-4 text-cerulean" />
                Delivery SLA
              </div>
              <p className="mt-2">
                Draft in 24h. Go-live within 48h after intake submission.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "Value",
              text: "Stop losing leads in DMs. Convert IG clicks into structured WhatsApp enquiries.",
            },
            {
              title: "What you get",
              text: "Single-page lead catcher, copy-first structure, WhatsApp CTA, and launch checklist.",
            },
            {
              title: "Process",
              text: "Book slot → submit intake → draft in 24h → go-live in 48h.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-black/10 bg-white/85 p-5 shadow-[0_10px_26px_-20px_rgba(0,0,0,0.2)]"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-black/50">
                {card.title}
              </p>
              <p className="mt-3 text-sm text-black/70">{card.text}</p>
            </div>
          ))}
        </section>

        <section id="pricing" className="mt-16 rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.25)]">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/50">Pricing</p>
              <h2 className="mt-3 text-2xl font-semibold text-prussian">
                ₹9,999 total. Start with ₹999 today.
              </h2>
              <p className="mt-2 text-sm text-black/70">
                ₹999 reserves your slot and starts the sprint. The remaining ₹9,000 is due only
                after you approve the first draft layout.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-black/70">
                {[
                  "Dedicated sprint delivery",
                  "WhatsApp-ready funnel",
                  "Conversion copy + layout",
                  "Launch checklist & handoff",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-cerulean" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white px-5 py-5">
              <div className="text-xs uppercase tracking-[0.3em] text-black/50">Today</div>
              <div className="mt-2 text-3xl font-semibold text-prussian">₹999</div>
              <div className="mt-1 text-xs text-black/60">
                Start fee to reserve slot
              </div>
              <div className="mt-4 rounded-xl border border-black/10 bg-cerulean/5 px-4 py-3 text-xs text-black/70">
                Balance ₹9,000 due after draft approval.
              </div>
              <a
                href="/lead-catcher-sprint/book"
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-prussian px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-prussian/90"
              >
                Book Slot ₹999
              </a>
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.25)]">
            <p className="text-xs uppercase tracking-[0.3em] text-black/50">Guarantees</p>
            <div className="mt-4 space-y-3 text-sm text-black/70">
              <div className="flex gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-cerulean" />
                <span>Refund ₹999 if we miss the 48h deadline after intake submission.</span>
              </div>
              <div className="flex gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-cerulean" />
                <span>No guaranteed leads — but guaranteed conversion-focused structure + delivery.</span>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.25)]">
            <p className="text-xs uppercase tracking-[0.3em] text-black/50">Policies</p>
            <ul className="mt-4 space-y-2 text-sm text-black/70">
              <li>₹999 start fee is non-refundable once work begins.</li>
              <li>One reschedule allowed with 12h notice.</li>
              <li>No-show after slot confirmation may forfeit slot priority.</li>
            </ul>
            <a
              href="/legal/refund-policy"
              className="mt-3 inline-flex items-center text-xs font-semibold text-prussian"
            >
              Read refund policy →
            </a>
          </div>
        </section>

        <section className="mt-16">
          <p className="text-xs uppercase tracking-[0.3em] text-black/50">FAQ</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {faqs.map((item) => (
              <div
                key={item.q}
                className="rounded-2xl border border-black/10 bg-white/85 p-4 text-sm text-black/70 shadow-[0_8px_22px_-18px_rgba(0,0,0,0.18)]"
              >
                <p className="font-semibold text-prussian">{item.q}</p>
                <p className="mt-2">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-3xl border border-black/10 bg-white/90 p-6 text-center shadow-[0_18px_50px_-30px_rgba(0,0,0,0.25)]">
          <p className="text-xs uppercase tracking-[0.3em] text-black/50">Ready?</p>
          <h2 className="mt-3 text-3xl font-semibold text-prussian">
            Book your 48H Lead Catcher Sprint today.
          </h2>
          <p className="mt-2 text-sm text-black/70">
            Slots are limited to keep delivery tight.
          </p>
          <a
            href="/lead-catcher-sprint/book"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-prussian px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-prussian/90"
          >
            Book Slot ₹999
            <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/10 bg-white/90 px-4 py-3 text-sm shadow-[0_-10px_30px_-20px_rgba(0,0,0,0.3)] backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-prussian">Book Slot ₹999</span>
          <a
            href="/lead-catcher-sprint/book"
            className="inline-flex items-center justify-center rounded-lg bg-prussian px-4 py-2 text-xs font-semibold text-white"
          >
            Book now
          </a>
        </div>
      </div>
    </div>
  );
}
