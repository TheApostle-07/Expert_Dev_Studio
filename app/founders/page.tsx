import { ArrowRight, CheckCircle2, PlayCircle, ShieldCheck, Sparkles } from "lucide-react";
import { MotionSection, motion, fadeInUp } from "../../components/ui/motion";
import SpinSection from "../../components/founders/SpinSection";

const vslUrl =
  process.env.NEXT_PUBLIC_FOUNDERS_VSL_URL ||
  "https://www.youtube.com/embed/ysz5S6PUM-U";

const demoCards = [
  {
    title: "SaaS Conversion Stack",
    detail: "Product-led flow with faster trial activation.",
  },
  {
    title: "Creator Offer Page",
    detail: "High-clarity landing page for premium services.",
  },
  {
    title: "Commerce Launch",
    detail: "Lean checkout and fast mobile load time.",
  },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Founder, GrowthStack",
    quote:
      "We shipped in days, not weeks. The conversion lift landed immediately and our pipeline stayed clean.",
  },
  {
    name: "Rohan Mehta",
    role: "Founder, ByteCraft",
    quote:
      "₹50k project delivered in one sprint. The experience feels premium and runs lightning fast.",
    highlight: true,
  },
  {
    name: "Maya Kulkarni",
    role: "Founder, Bloomly",
    quote:
      "Communication was crisp, and the finished site reads like a sales page instead of a brochure.",
  },
];

const faqs = [
  {
    q: "What is the Founder Slot offer?",
    a: "Founder Slot is a limited-capacity build package with priority delivery and founder pricing.",
  },
  {
    q: "What happens after I pay?",
    a: "You submit onboarding details, we schedule kickoff, and the build begins within 24 hours.",
  },
  {
    q: "What if the timer expires?",
    a: "The offer releases automatically and your session enters a 24-hour cooldown.",
  },
];

export const metadata = {
  title: "Founders Slot",
  description: "Spin to unlock founder pricing and reserve a delivery slot.",
};

export default function FoundersPage() {
  return (
    <div className="min-h-screen bg-transparent text-black">
      <div className="page-shell pb-16 pt-24 sm:pt-28 md:pt-32">
        <MotionSection amount={0.25} className="grid gap-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <motion.p
                variants={fadeInUp}
                className="inline-flex items-center gap-2 rounded-full bg-cerulean/10 px-3 py-1 text-xs font-semibold text-prussian"
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Founders Slot
              </motion.p>
              <motion.h1
                variants={fadeInUp}
                className="mt-4 text-4xl font-semibold leading-tight text-prussian sm:text-5xl"
              >
                Secure a priority build slot and founder pricing in minutes.
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                className="mt-4 text-base text-black/70 sm:text-lg"
              >
                A premium site in a focused sprint. Spin the wheel to unlock your invite,
                accept your offer, and lock delivery before today’s slots close.
              </motion.p>
              <motion.div
                variants={fadeInUp}
                className="mt-6 flex flex-wrap items-center gap-3"
              >
                <a
                  href="#spin"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-prussian px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-prussian/90"
                >
                  Spin to unlock your invite
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
                <div className="inline-flex items-center gap-2 text-xs text-black/60">
                  <ShieldCheck className="h-4 w-4 text-cerulean" aria-hidden />
                  Verified founders only · 5-minute hold
                </div>
              </motion.div>
            </div>
            <motion.div
              variants={fadeInUp}
              className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.25)]"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-black/50">
                Video sales letter
              </p>
              <div className="mt-4 overflow-hidden rounded-2xl border border-black/10 bg-black/5">
                <div className="relative aspect-video w-full">
                  <iframe
                    src={vslUrl}
                    title="Founders Slot VSL"
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-black/60">
                <PlayCircle className="h-4 w-4 text-cerulean" aria-hidden />
                Watch how founders ship in 5 days with our sprint system.
              </div>
            </motion.div>
          </div>

          <motion.div
            variants={fadeInUp}
            className="grid gap-4 sm:grid-cols-3"
          >
            {demoCards.map((demo) => (
              <div
                key={demo.title}
                className="rounded-2xl border border-black/10 bg-white/85 p-5 shadow-[0_10px_26px_-20px_rgba(0,0,0,0.2)]"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-black/50">
                  Demo
                </p>
                <h3 className="mt-3 text-lg font-semibold text-prussian">
                  {demo.title}
                </h3>
                <p className="mt-2 text-sm text-black/70">{demo.detail}</p>
              </div>
            ))}
          </motion.div>

          <div id="spin" className="scroll-mt-32">
            <SpinSection />
          </div>

          <motion.div
            variants={fadeInUp}
            className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]"
          >
            <div className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.25)]">
              <p className="text-xs uppercase tracking-[0.3em] text-black/50">
                Proof
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-prussian">
                Founders trust us to deliver fast and premium.
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {testimonials.map((item) => (
                  <div
                    key={item.name}
                    className={`rounded-2xl border border-black/10 p-4 text-sm text-black/70 shadow-[0_10px_26px_-20px_rgba(0,0,0,0.2)] ${
                      item.highlight ? "bg-cerulean/10" : "bg-white/80"
                    }`}
                  >
                    <p className="font-semibold text-prussian">{item.name}</p>
                    <p className="text-xs text-black/50">{item.role}</p>
                    <p className="mt-3">{item.quote}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.25)]">
              <p className="text-xs uppercase tracking-[0.3em] text-black/50">
                What you get
              </p>
              <ul className="mt-4 space-y-3 text-sm text-black/70">
                {[
                  "Dedicated sprint team and rapid delivery.",
                  "Conversion-focused copy and layout.",
                  "Performance tuned for mobile speed.",
                  "Launch checklist with 30-day support.",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-cerulean" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.25)]"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-black/50">FAQ</p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
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
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="rounded-3xl border border-black/10 bg-white/90 p-6 text-center shadow-[0_18px_50px_-30px_rgba(0,0,0,0.25)]"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-black/50">
              Ready to move?
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-prussian">
              Spin now to unlock your founders slot.
            </h2>
            <p className="mt-3 text-sm text-black/70">
              Founders slots reset every 24 hours. Reserve yours while capacity is open.
            </p>
            <a
              href="#spin"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-prussian px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-prussian/90"
            >
              Spin to unlock your invite
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          </motion.div>
        </MotionSection>
      </div>
    </div>
  );
}
