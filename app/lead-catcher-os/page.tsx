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
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="text-center lg:text-left">
            <p className="text-xs uppercase tracking-[0.3em] text-black/50">Product</p>
            <h1 className="mt-3 text-4xl font-semibold text-prussian sm:text-5xl">
              {leadCatcherOSCopy.hero.title}
            </h1>
            <p className="mt-4 mx-auto max-w-xl text-base text-black/70 lg:mx-0">
              {leadCatcherOSCopy.hero.subhead}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <LeadCatcherModalLauncher
                label={leadCatcherOSCopy.hero.primaryCta}
                className="inline-flex items-center justify-center rounded-full bg-prussian px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] transition hover:bg-prussian/90"
              />
              <a
                href="#what-you-get"
                className="inline-flex items-center justify-center rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-prussian hover:bg-black/5"
              >
                {leadCatcherOSCopy.hero.secondaryCta}
              </a>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
              {leadCatcherOSCopy.hero.metrics.map((metric) => (
                <span
                  key={metric}
                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-black/70"
                >
                  {metric}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.25)]">
            <p className="text-xs uppercase tracking-[0.3em] text-black/40">Promise</p>
            <h2 className="mt-3 text-2xl font-semibold text-prussian">
              A WhatsApp-first funnel installed fast.
            </h2>
            <p className="mt-3 text-sm text-black/70">
              Live in 48 hours after intake. Clean structure, premium visuals, and conversion-first messaging.
            </p>
            <div className="mt-6 grid gap-3 text-sm text-black/70">
              <div className="rounded-2xl border border-black/10 bg-white px-4 py-3">
                Install timeline: <span className="font-semibold text-prussian">48 hours</span>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white px-4 py-3">
                Price: <span className="font-semibold text-prussian">₹50,000</span> all-inclusive
              </div>
              <div className="rounded-2xl border border-black/10 bg-white px-4 py-3">
                Lead source: WhatsApp-first conversion path
              </div>
            </div>
          </div>
        </section>

        <section id="what-you-get" className="mt-20">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/50">What you get</p>
              <h2 className="mt-3 text-2xl font-semibold text-prussian">A full conversion system</h2>
              <p className="mt-2 text-sm text-black/70">
                Everything needed to turn WhatsApp interest into qualified leads.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {leadCatcherOSCopy.whatYouGet.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-black/10 bg-white px-4 py-4 shadow-[0_12px_40px_-24px_rgba(0,0,0,0.25)]"
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

        <section id="demo" className="mt-20">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/50">Proof</p>
              <h2 className="mt-3 text-2xl font-semibold text-prussian">Believable, minimal proof</h2>
              <p className="mt-2 text-sm text-black/70">
                We keep proof honest and focused on structure, clarity, and outcomes.
              </p>
            </div>
            <ProofDialog testimonials={testimonials} proofAssets={proofAssets} />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {testimonials.map((item) => (
              <div key={item.name} className="rounded-2xl border border-black/10 bg-white px-4 py-4">
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

        <section id="pricing" className="mt-20">
          <div className="rounded-3xl border border-black/10 bg-white/90 p-8 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.3)]">
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
                <div key={item} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black/70">
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

        <section id="faq" className="mt-20">
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
