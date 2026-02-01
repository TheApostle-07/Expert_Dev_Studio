import {
  BarChart3,
  CreditCard,
  MessageCircle,
  ScrollText,
  FileSpreadsheet,
  Sparkles,
} from "lucide-react";
import LeadCatcherModal, {
  LeadCatcherModalLauncher,
} from "../../components/leadcatcher/LeadCatcherModal";
import ProofDialog from "../../components/leadcatcher/ProofDialog";
import { leadCatcherOSCopy } from "../../content/leadcatcheros";
import { testimonials, proofAssets } from "../../content/testimonials";
import { leadCatcherFaq } from "../../content/faq";

const featureIcons: Record<string, JSX.Element> = {
  sparkles: <Sparkles className="h-4 w-4 text-cerulean" aria-hidden />,
  message: <MessageCircle className="h-4 w-4 text-cerulean" aria-hidden />,
  sheet: <FileSpreadsheet className="h-4 w-4 text-cerulean" aria-hidden />,
  card: <CreditCard className="h-4 w-4 text-cerulean" aria-hidden />,
  script: <ScrollText className="h-4 w-4 text-cerulean" aria-hidden />,
  track: <BarChart3 className="h-4 w-4 text-cerulean" aria-hidden />,
};

export default function LeadCatcherOSPage() {
  return (
    <div className="bg-transparent text-black">
      <main className="page-shell pb-24 pt-24">
        <section className="relative overflow-hidden rounded-[32px] border border-black/10 bg-white/80 p-8 text-center shadow-[0_30px_80px_-45px_rgba(0,0,0,0.4)] sm:p-12">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(90deg,rgba(0,126,167,0.18),rgba(252,163,17,0.18),rgba(0,52,89,0.18))]" />
            <div className="absolute left-[-6rem] top-[-6rem] h-44 w-44 rounded-full bg-cerulean/15 blur-3xl" />
            <div className="absolute right-[-7rem] bottom-[-7rem] h-52 w-52 rounded-full bg-accent/18 blur-3xl" />
            <div className="absolute left-1/2 top-16 h-28 w-28 -translate-x-1/2 rounded-full bg-prussian/10 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-black/60 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.25)]">
              Ultimate Business Solution
            </span>
            <h1 className="mt-9 text-4xl font-semibold text-prussian sm:text-5xl">
              {leadCatcherOSCopy.hero.title}
            </h1>
            <p className="mt-4 mx-auto max-w-2xl text-base text-black/70">
              {leadCatcherOSCopy.hero.subhead}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <LeadCatcherModalLauncher
                label={leadCatcherOSCopy.hero.primaryCta}
                className="inline-flex items-center justify-center rounded-full bg-prussian px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] transition hover:bg-prussian/90"
              />
              <a
                href="#what-you-get"
                className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-prussian shadow-[0_10px_30px_-22px_rgba(0,0,0,0.2)] hover:bg-black/5"
              >
                {leadCatcherOSCopy.hero.secondaryCta}
              </a>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {leadCatcherOSCopy.hero.metrics.map((metric) => (
                <span
                  key={metric}
                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-black/70 shadow-[0_10px_20px_-16px_rgba(0,0,0,0.2)]"
                >
                  {metric}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto mt-10 w-full max-w-3xl rounded-3xl border border-black/10 bg-white/95 p-6 text-center shadow-[0_18px_50px_-30px_rgba(0,0,0,0.25)]">
            <p className="text-xs uppercase tracking-[0.3em] text-black/40">Promise</p>
            <h2 className="mt-3 text-2xl font-semibold text-prussian">
              A WhatsApp-first funnel that turns interest into action.
            </h2>
            <p className="mt-3 text-sm text-black/70">
              Launch in 48 hours and start capturing higher-intent leads with clear positioning, trust, and follow-through.
            </p>
            <div className="mt-6 grid gap-3 text-sm text-black/70 md:grid-cols-3">
              <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.2)]">
                Faster launch: <span className="font-semibold text-prussian">48 hours</span>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.2)]">
                Investment: <span className="font-semibold text-prussian">₹50,000</span> all-inclusive
              </div>
              <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.2)]">
                Outcome: More qualified WhatsApp inquiries
              </div>
            </div>
          </div>
        </section>

        <section id="what-you-get" className="relative mt-24 pt-6 text-center">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cerulean/40 to-transparent" />
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/50">What you get</p>
            <h2 className="mt-3 text-2xl font-semibold text-prussian">
              A system built to close faster
            </h2>
            <p className="mt-2 text-sm text-black/70">
              Everything your prospects need to trust you and take the next step.
            </p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {leadCatcherOSCopy.whatYouGet.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-black/10 bg-white/95 px-4 py-4 shadow-[0_14px_45px_-26px_rgba(0,0,0,0.3)] transition hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-prussian">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-cerulean/10">
                    {featureIcons[item.icon]}
                  </span>
                  {item.title}
                </div>
                <p className="mt-3 text-sm text-black/70">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="rounded-3xl border border-black/10 bg-white/90 p-8 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.3)]">
            <p className="text-xs uppercase tracking-[0.3em] text-black/50">How it works</p>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {leadCatcherOSCopy.steps.map((step, index) => (
                <div key={step.title} className="rounded-2xl border border-black/10 bg-white px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.3em] text-cerulean">
                    Step {index + 1}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-prussian">{step.title}</h3>
                  <p className="mt-2 text-sm text-black/70">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="demo" className="relative mt-20 text-center">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/35 to-transparent" />
          <div className="flex flex-col items-center gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/50">Proof</p>
              <h2 className="mt-3 text-2xl font-semibold text-prussian">
                Proof that builds confidence
              </h2>
              <p className="mt-2 text-sm text-black/70">
                Honest, minimal proof that signals quality without fluff.
              </p>
            </div>
            <ProofDialog testimonials={testimonials} proofAssets={proofAssets} />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {testimonials.map((item) => (
              <div
                key={item.name}
                className="rounded-2xl border border-black/10 bg-white/95 px-4 py-4 shadow-[0_14px_45px_-26px_rgba(0,0,0,0.3)]"
              >
                <p className="text-sm text-black/70">“{item.quote}”</p>
                <div className="mt-3 text-xs text-black/60">
                  <span className="font-semibold text-prussian">{item.name}</span> · {item.role} · {item.city}
                </div>
                {item.verified ? (
                  <span className="mt-2 inline-flex rounded-full bg-cerulean/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-cerulean">
                    Verified
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="relative mt-20">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cerulean/40 to-transparent" />
          <div className="rounded-3xl border border-black/10 bg-white/90 p-8 text-center shadow-[0_22px_65px_-38px_rgba(0,0,0,0.35)]">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-black/50">Pricing</p>
                <h2 className="mt-3 text-3xl font-semibold text-prussian">{leadCatcherOSCopy.pricing.price}</h2>
                <p className="mt-2 text-sm text-black/70">{leadCatcherOSCopy.pricing.headline}</p>
              </div>
              <LeadCatcherModalLauncher
                label="Get Demo + Pricing"
                className="inline-flex items-center justify-center rounded-full bg-prussian px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] transition hover:bg-prussian/90"
              />
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {leadCatcherOSCopy.pricing.inclusions.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black/70 shadow-[0_12px_30px_-24px_rgba(0,0,0,0.25)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="grid gap-4 md:grid-cols-2">
            {leadCatcherOSCopy.guarantee.map((item) => (
              <div key={item} className="rounded-2xl border border-black/10 bg-white px-4 py-4 text-sm text-black/70">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="relative mt-20 text-center">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-prussian/35 to-transparent" />
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/50">FAQ</p>
            <h2 className="mt-3 text-2xl font-semibold text-prussian">Answers, upfront</h2>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {leadCatcherFaq.map((item) => (
              <details key={item.question} className="rounded-2xl border border-black/10 bg-white px-4 py-4">
                <summary className="cursor-pointer text-sm font-semibold text-prussian">
                  {item.question}
                </summary>
                <p className="mt-3 text-sm text-black/70">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-20 rounded-3xl border border-black/10 bg-white/90 p-8 text-center shadow-[0_20px_60px_-35px_rgba(0,0,0,0.3)]">
          <h2 className="text-2xl font-semibold text-prussian">{leadCatcherOSCopy.finalCta.headline}</h2>
          <p className="mt-3 text-sm text-black/70">{leadCatcherOSCopy.finalCta.subhead}</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LeadCatcherModalLauncher
              label="Get Demo + Pricing"
              className="inline-flex items-center justify-center rounded-full bg-prussian px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] transition hover:bg-prussian/90"
            />
            <a
              href={`https://wa.me/${process.env.WHATSAPP_NUMBER || ""}?text=Lead%20Catcher%20OS%20—%20Interested%20in%20the%20demo.`}
              className="inline-flex items-center justify-center rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-prussian hover:bg-black/5"
            >
              WhatsApp us
            </a>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-4 z-40 mx-auto flex max-w-sm justify-center px-4 md:hidden">
        <LeadCatcherModalLauncher
          label="Get Demo + Pricing"
          className="w-full rounded-full bg-prussian px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)]"
        />
      </div>

      <LeadCatcherModal />
    </div>
  );
}
