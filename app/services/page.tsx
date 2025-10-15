"use client";

import { motion } from "framer-motion";
import { useEffect, useState, type ElementType } from "react";
import { MotionSection, fadeInUp } from "../../components/ui/motion";
import {
  Layers3,
  CheckCircle2,
  ShoppingCart,
  LayoutDashboard,
  GaugeCircle,
  Wrench,
  Rocket,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  Search,
  MoveRight,
  Sparkles,
} from "lucide-react";

// --- Currency override + formatting helpers ---
type Currency = "INR" | "USD" | "EUR" | "GBP" | "AED" | "AUD" | "CAD" | "SGD";
type PkgCode = "L0" | "L1" | "L2" | "L3";
const DEFAULT_CURRENCY: Currency = "INR";
const SUPPORTED: Currency[] = ["INR","USD","EUR","GBP","AED","AUD","CAD","SGD"];

function getOverrideCurrency(): Currency | null {
  try {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const q = url.searchParams.get("ccy");
      if (q) {
        const up = q.toUpperCase();
        if (SUPPORTED.includes(up as Currency)) return up as Currency;
      }
    }
    if (typeof localStorage !== "undefined") {
      const forced = localStorage.getItem("force_ccy");
      if (forced) {
        const up = forced.toUpperCase();
        if (SUPPORTED.includes(up as Currency)) return up as Currency;
      }
    }
  } catch {}
  return null;
}

function detectCurrency(): Currency {
  try {
    // Manual override via URL (?ccy=INR) or localStorage ('force_ccy')
    const override = getOverrideCurrency();
    if (override) return override;

    // Prefer time zone (more reliable on iOS Safari) then language region
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const lang =
      typeof navigator !== "undefined" && (navigator.languages?.[0] || navigator.language)
        ? (navigator.languages?.[0] || navigator.language)
        : "en-IN";
    const region = (lang.split("-")[1] || "").toUpperCase();

    const tzLower = tz.toLowerCase();
    if (tzLower.includes("kolkata") || tzLower.includes("calcutta")) return "INR";
    if (tzLower.includes("dubai") || tzLower.includes("muscat") || tzLower.includes("abu_dhabi")) return "AED";
    if (tzLower.includes("london")) return "GBP";
    if (tzLower.includes("singapore")) return "SGD";
    if (tzLower.includes("sydney") || tzLower.includes("melbourne")) return "AUD";
    if (tzLower.includes("toronto") || tzLower.includes("vancouver")) return "CAD";
    if (tzLower.includes("berlin") || tzLower.includes("paris") || tzLower.includes("madrid") || tzLower.includes("rome")) return "EUR";

    switch (region) {
      case "IN": return "INR";
      case "AE": return "AED";
      case "GB": return "GBP";
      case "SG": return "SGD";
      case "AU": return "AUD";
      case "CA": return "CAD";
      case "IE": case "DE": case "FR": case "ES": case "IT": case "NL": case "PT": case "AT": case "BE": case "FI": case "GR": case "SK": case "SI": case "LV": case "LT": case "EE": case "CY": case "MT":
        return "EUR";
      default: return DEFAULT_CURRENCY; // prefer INR by default
    }
  } catch {
    return DEFAULT_CURRENCY; // safe fallback
  }
}

const PRICE_TABLE: Record<PkgCode, Record<Currency, string>> = {
  L0: {
    INR: "₹36,500",
    USD: "$399",
    EUR: "€359",
    GBP: "£289",
    AED: "AED 1,299",
    AUD: "A$529",
    CAD: "CA$479",
    SGD: "S$479",
  },
  L1: {
    INR: "₹75,500",
    USD: "$849",
    EUR: "€739",
    GBP: "£799",
    AED: "AED 3,499",
    AUD: "A$1,399",
    CAD: "CA$1,299",
    SGD: "S$1,299",
  },
  L2: {
    INR: "₹1,75,500",
    USD: "$1,999",
    EUR: "€1,699",
    GBP: "from £1,499",
    AED: "from AED 6,650",
    AUD: "from A$2,699",
    CAD: "from CA$2,499",
    SGD: "from S$2,499",
  },
  L3: {
    INR: "₹4,50,500",
    USD: "$4,999",
    EUR: "€4,399",
    GBP: "from £3,400",
    AED: "from AED 15,500",
    AUD: "from A$6,400",
    CAD: "from CA$5,900",
    SGD: "from S$5,900",
  },
};

function priceFor(code: PkgCode, cur: Currency): string {
  return PRICE_TABLE[code][cur] ?? PRICE_TABLE[code].INR;
}

// --- Services data + polished card ---
interface ServiceItem {
  code?: PkgCode;
  title: string;
  bullets: string[];
  href: string;         // enquiry link
  buyHref?: string;     // optional direct purchase link
  Icon: ElementType;
  badge?: string;
}

const SERVICES: ServiceItem[] = [
  {
    code: "L0",
    title: "L0 · Landing Sprint",
    bullets: [
      "1 page",
      "Hero + proof + CTA",
      "Analytics",
      "7 days",
    ],
    href: "/contact?interest=L0",
    buyHref: "https://rzp.io/rzp/S886sKK",
    Icon: Layers3,
    badge: "Fastest launch",
  },
  {
    code: "L1",
    title: "L1 · Authority Site",
    bullets: [
      "3–5 pages",
      "Blog & SEO basics",
      "Lead magnet",
      "2 weeks",
    ],
    href: "/contact?interest=L1",
    buyHref: "https://rzp.io/rzp/dqyI8Hm",
    Icon: CheckCircle2,
    badge: "Most popular",
  },
  {
    code: "L2",
    title: "L2 · Storefront",
    bullets: [
      "Catalog",
      "Razorpay",
      "Speed tuned",
      "Schema",
    ],
    href: "/contact?interest=L2",
    buyHref: "https://rzp.io/rzp/u1wMNWQ",
    Icon: ShoppingCart,
  },
  {
    code: "L3",
    title: "L3 · Custom Build",
    badge: "Flagship",
    bullets: [
      "Bespoke scope",
      "Integrations & auth",
      "Roadmap partnership",
      "Priority support",
    ],
    href: "/contact?interest=L3",
    buyHref: "https://rzp.io/rzp/92mA2qyb",
    Icon: Rocket,
  },
  {
    title: "Dashboards & Admins",
    bullets: [
      "Role‑based UIs",
      "Clean data flows",
      "Accessible, maintainable components",
    ],
    href: "/contact?interest=dashboards",
    Icon: LayoutDashboard,
  },
  {
    title: "Performance Tuning",
    bullets: [
      "Core Web Vitals wins",
      "Asset budgets & smart caching",
      "Edge/CDN strategy",
    ],
    href: "/contact?interest=performance",
    Icon: GaugeCircle,
  },
  {
    title: "Maintenance & Growth",
    bullets: [
      "Retainers with response SLOs",
      "A/B tests, analytics, SEO",
      "Quarterly growth roadmap",
    ],
    href: "/contact?interest=maintenance",
    Icon: Wrench,
    badge: "Retainer",
  },
  {
    title: "Content & SEO",
    bullets: [
      "Keyword strategy & IA",
      "Editorial system in your CMS",
      "On‑page SEO & schema",
    ],
    href: "/contact?interest=seo",
    Icon: Search,
  },
  {
    title: "Migration & Replatforming",
    bullets: [
      "Technical audit & plan",
      "Zero‑downtime migration",
      "Performance & SEO safeguards",
    ],
    href: "/contact?interest=migration",
    Icon: MoveRight,
  },
];

function ServiceCard({
  item,
  price,
  onBlockedPayment,
}: {
  item: ServiceItem;
  price?: string;
  onBlockedPayment?: (url: string) => void;
}) {
  const { Icon } = item;
  return (
    <motion.article
      variants={fadeInUp}
      whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.18 } }}
      className="group relative"
    >
      {/* Gradient border frame */}
      <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-cerulean/30 via-prussian/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden />
      <div className="rounded-2xl border border-black/10 bg-white/85 backdrop-blur-sm p-6 shadow-[0_4px_22px_-10px_rgba(0,0,0,0.18)] transition-all duration-300 group-hover:shadow-[0_18px_40px_-18px_rgba(0,0,0,0.25)] flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[linear-gradient(135deg,rgba(0,126,167,0.15),rgba(0,52,89,0.15))] ring-1 ring-cerulean/20">
              <Icon className="h-5 w-5 text-prussian" aria-hidden />
            </span>
            <h3 className="text-base font-semibold tracking-tight">{item.title}</h3>
          </div>
          {item.badge ? (
            <span className="whitespace-nowrap rounded-full bg-prussian/10 px-2.5 py-1 text-xs font-medium text-prussian/90 ring-1 ring-prussian/15">
              {item.badge}
            </span>
          ) : null}
        </div>

        {/* Price (if any) */}
        {price ? (
          <div className="mt-2 inline-flex items-center rounded-full bg-cerulean/10 px-2.5 py-1 text-sm font-semibold text-prussian ring-1 ring-cerulean/20" suppressHydrationWarning>
            {price}
          </div>
        ) : null}

        {/* Bullets */}
        <ul className="mt-4 space-y-2.5 text-sm leading-[1.6] text-black/75">
          {item.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-cerulean shrink-0" aria-hidden />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="mt-auto pt-5 flex w-full flex-wrap items-center justify-center gap-3 border-t border-black/5">
          <a
            href={item.href}
            aria-label={`Enquire about ${item.title}`}
            className="inline-flex w-full max-w-[260px] justify-center items-center gap-2 rounded-full bg-[linear-gradient(90deg,#0A6F95_0%,#007EA7_45%,#003459_100%)] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_36px_-14px_rgba(0,126,167,0.60)] ring-1 ring-cerulean/25 transition-[transform,box-shadow] hover:shadow-[0_22px_46px_-20px_rgba(0,126,167,0.70)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cerulean/50"
          >
            <Sparkles className="h-4 w-4 text-white" aria-hidden />
            Enquire
          </a>
        </div>
      </div>
    </motion.article>
  );
}

export default function ServicesPage() {
  // Auto-detect currency; allow explicit overrides (?ccy=... or localStorage 'force_ccy')
  const [ccy, setCcy] = useState<Currency>(detectCurrency());
  useEffect(() => {
    const override = getOverrideCurrency();
    setCcy(override || detectCurrency());
  }, []);
  const [payNotice, setPayNotice] = useState<{ url: string } | null>(null);
  return (
    <>
      {/* HERO */}
      <section
        id="hero"
        className="relative isolate bg-transparent border-0 ring-0 outline-none shadow-none scroll-mt-28 sm:scroll-mt-32"
        aria-labelledby="services-hero-title"
        style={{ boxShadow: "none", border: 0, outline: "none" }}
      >
        {/* Soft hero wash to blend with premium background */}
        <div
          aria-hidden
          className="hero-overlay absolute inset-0 -z-10 pointer-events-none [mask-image:radial-gradient(120%_120%_at_50%_28%,_black_72%,_rgba(0,0,0,0.6)_86%,_transparent_100%)] [-webkit-mask-image:radial-gradient(120%_120%_at_50%_28%,_black_72%,_rgba(0,0,0,0.6)_86%,_transparent_100%)]"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/75 via-white/45 to-transparent backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-[radial-gradient(1200px_460px_at_50%_6%,rgba(255,255,255,0.4),rgba(255,255,255,0.2),transparent_70%)]" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-none px-6 sm:px-8 lg:px-12">
          <MotionSection amount={0.3} className="pt-24 pb-16 sm:pt-28 sm:pb-20 md:pt-32 md:pb-24 text-center">
            {/* Eyebrow */}
            <motion.span
              variants={fadeInUp}
              className="relative z-10 inline-flex items-center gap-2 mx-auto rounded-full px-3 py-1 text-xs font-medium text-prussian bg-cerulean/10 shadow-sm"
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-cerulean" aria-hidden />
              <span className="whitespace-nowrap">
                From <span className="font-semibold">Idea</span> to <span className="font-semibold">Live</span> in weeks
              </span>
            </motion.span>

            {/* Title */}
            <motion.h1
              id="services-hero-title"
              variants={fadeInUp}
              className="mt-3 sm:mt-4 mx-auto max-w-5xl font-display text-4xl font-semibold leading-[1.08] tracking-[-0.02em] sm:text-5xl md:text-6xl xl:text-7xl [text-wrap:balance]"
              style={{ overflow: "visible" }}
            >
              <>
                Highest-converting websites
                <span className="relative z-10 block mt-2 bg-transparent text-cerulean">for coaches creators</span>
              </>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={fadeInUp}
              className="mt-5 mx-auto max-w-3xl text-center text-base sm:text-lg leading-8 tracking-[0.01em] text-black/70 [text-wrap:balance]"
            >
              We craft modern websites that load in a blink, build trust, and turn traffic into paid clients - no fluff, just outcomes.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeInUp} className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {/* Primary: premium gradient */}
              <a
                href="/contact"
                aria-label="Get your website built"
                className="group relative inline-flex min-w-[180px] items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white bg-[linear-gradient(90deg,#0A6F95_0%,#007EA7_45%,#003459_100%)] transition-colors hover:bg-[linear-gradient(90deg,#0C88B4_0%,#009BC4_45%,#074A77_100%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent focus-visible:ring-offset-white no-underline hover:no-underline"
              >
                <Sparkles className="h-4 w-4" aria-hidden />
                Get your website built
              </a>

              {/* Secondary: refined outline with animated arrow */}
              <a
                href="/#packages"
                aria-label="See packages and pricing"
                className="group inline-flex min-w-[180px] items-center justify-center gap-2 rounded-xl bg-white/80 backdrop-blur-sm px-6 py-3 text-sm font-medium text-black border border-black/10 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)] transition-colors hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-prussian/30 no-underline hover:no-underline"
              >
                See packages &amp; pricing
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1 group-focus-visible:translate-x-1" aria-hidden />
              </a>
            </motion.div>

            {/* Trust row */}
            <motion.dl variants={fadeInUp} className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ["< 1.5s", "MOBILE LCP"],
                ["Clean UX", "MODERN PATTERNS"],
                ["SEO ready", "SCHEMA + META"],
                ["Razorpay", "NATIVE CHECKOUT"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl border border-black/10 bg-white/80 backdrop-blur-sm p-4 text-center shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)]">
                  <div className="flex items-center justify-center gap-2 text-prussian">
                    <CheckCircle2 className="h-4 w-4" aria-hidden />
                    <dt className="text-xs uppercase tracking-wide text-black/60">{v}</dt>
                  </div>
                  <dd className="mt-1 text-base font-semibold">{k}</dd>
                </div>
              ))}
            </motion.dl>
          </MotionSection>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="what-we-do-title">
        <MotionSection amount={0.25}>
          <motion.h2
            variants={fadeInUp}
            id="what-we-do-title"
            className="font-display text-center text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Services that move the needle
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-2 max-w-2xl text-center text-sm text-black/70"
          >
            Choose a starting point. We ship outcomes, not busywork.
          </motion.p>

          <motion.div variants={fadeInUp} className="mx-auto mt-4 flex justify-center">
            <div
              role="group"
              aria-label="Select currency"
              className="inline-flex items-center gap-1 rounded-xl bg-white/80 backdrop-blur-sm p-1 ring-1 ring-black/10 shadow-[0_6px_18px_-10px_rgba(0,0,0,0.15)]"
            >
              {(["INR","USD","EUR"] as Currency[]).map((cur) => (
                <button
                  key={cur}
                  type="button"
                  onClick={() => {
                    setCcy(cur);
                    try { localStorage.setItem("force_ccy", cur); } catch {}
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    ccy === cur
                      ? "text-white shadow-[0_12px_30px_-12px_rgba(0,126,167,0.55)] ring-1 ring-cerulean/30"
                      : "text-black/70 hover:text-black"
                  }`}
                  style={
                    ccy === cur
                      ? { background: "linear-gradient(135deg,#0A6F95 0%,#007EA7 50%,#003459 100%)" }
                      : {}
                  }
                >
                  {cur}
                </button>
              ))}
            </div>
          </motion.div>

          <div className="mt-8 grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((item) => (
              <ServiceCard
                key={item.title}
                item={item}
                price={item.code ? priceFor(item.code, ccy) : undefined}
                onBlockedPayment={(url) => setPayNotice({ url })}
              />
            ))}
          </div>
        </MotionSection>
      </section>

      {/* PROCESS */}
      <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="process-title">
        <MotionSection amount={0.25}>
          <motion.h2
            variants={fadeInUp}
            id="process-title"
            className="font-display text-center text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            A calm, fast process
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-2 max-w-2xl text-center text-sm text-black/70"
          >
            We do the heavy lift; you approve the key moves. Weekly demos, zero surprises.
          </motion.p>

          <div className="mt-6 grid gap-4 md:grid-cols-5">
            {[
              ["01", "Discovery", "Goals, audience, constraints → rapid alignment."],
              ["02", "Messaging", "Sharper value prop, IA, and user flows."],
              ["03", "Design", "Elegant UI on reusable components."],
              ["04", "Build", "Clean code. Accessible, maintainable, fast."],
              ["05", "Launch", "QA, analytics, handoff + playbook."],
            ].map(([step, title, desc]) => (
              <motion.div
                key={step}
                variants={fadeInUp}
                className="rounded-2xl border border-black/10 bg-white/80 backdrop-blur-sm p-5 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)]"
              >
                <div className="text-xs font-semibold tracking-wide text-black/50">{step}</div>
                <div className="mt-1 text-sm font-semibold">{title}</div>
                <p className="mt-1 text-sm text-black/70">{desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.dl variants={fadeInUp} className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["< 1.5s", "Mobile LCP"],
              ["99.9%", "Uptime sites"],
              ["A/B ready", "Analytics & events"],
              ["Global", "Clients"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-black/10 bg-white/80 backdrop-blur-sm p-4 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)]">
                <dt className="text-xs uppercase tracking-wide text-black/50">{v}</dt>
                <dd className="mt-1 text-base font-medium">{k}</dd>
              </div>
            ))}
          </motion.dl>
        </MotionSection>
      </section>

      {/* PRICING SUMMARY */}
      <section className="relative isolate bg-transparent" aria-labelledby="pricing-title">
        {/* ambient background polish */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(140%_120%_at_50%_30%,_black_70%,_rgba(0,0,0,0.6)_86%,_transparent_100%)] [-webkit-mask-image:radial-gradient(140%_120%_at_50%_30%,_black_70%,_rgba(0,0,0,0.6)_86%,_transparent_100%)]">
          <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/25 to-transparent" />
          <div className="absolute left-[-12rem] top-[-6rem] h-64 w-64 rounded-full bg-cerulean/10 blur-3xl" />
          <div className="absolute right-[-10rem] bottom-[-6rem] h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <MotionSection amount={0.25}>
            <motion.h2
              variants={fadeInUp}
              id="pricing-title"
              className="font-display text-center text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Transparent pricing. No surprise invoices.
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mx-auto mt-2 max-w-2xl text-center text-sm text-black/70"
            >
              Prices auto localize. See what’s included in each package.
            </motion.p>

            <motion.div variants={fadeInUp} className="mt-6 flex justify-center">
              <a
                href="/#packages"
                aria-label="Compare website packages and pricing"
                className="group relative inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-12px_rgba(0,126,167,0.55)] ring-1 ring-cerulean/30 focus:outline-none focus-visible:ring-4 focus-visible:ring-cerulean/50"
                style={{ background: "linear-gradient(135deg,#0A6F95 0%,#007EA7 50%,#003459 100%)" }}
              >
                {/* Glow ring on hover */}
                <span
                  className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100 ring-2 ring-cerulean/50"
                  aria-hidden
                />
                {/* Shine sweep */}
                <span
                  className="pointer-events-none absolute -left-1/4 top-0 h-full w-1/3 -skew-x-12 bg-white/20 blur-md transition-transform duration-500 group-hover:translate-x-[220%]"
                  aria-hidden
                />
                Compare packages
                <Rocket className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
              </a>
            </motion.div>
          </MotionSection>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="faq-title">
        <MotionSection amount={0.2}>
          <motion.h2 variants={fadeInUp} id="faq-title" className="font-display text-center text-2xl font-semibold">
            Frequently asked
          </motion.h2>
          <motion.p variants={fadeInUp} className="mx-auto mt-2 max-w-2xl text-center text-sm text-black/70">
            Simple, honest answers. If you need deeper detail, just ask.
          </motion.p>

          <div className="mt-6 space-y-3">
            {[
              {
                q: "How fast can we start?",
                a: "Discovery calls are available this week. If there’s a fit, we start within 5–10 days.",
              },
              {
                q: "What do I get in a sprint?",
                a: "A clear goal, prioritized scope, design + build on proven patterns, QA, analytics/events, and a clean handoff. No surprises.",
              },
              {
                q: "Can you plug into our existing stack?",
                a: "Yes. We integrate with your tools and workflows—or start greenfield—whichever gets results faster.",
              },
              {
                q: "Do you support us after launch?",
                a: "Absolutely. Retainers with response time SLOs, quarterly roadmaps, and growth work (A/B, SEO, performance).",
              },
            ].map(({ q, a }) => (
              <motion.details
                key={q}
                variants={fadeInUp}
                className="group rounded-2xl border border-black/10 bg-white/80 backdrop-blur-sm p-4 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)] open:shadow-[0_10px_30px_-12px_rgba(0,0,0,0.12)]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-prussian" aria-hidden />
                    <span className="text-sm font-semibold">{q}</span>
                  </div>
                  <span className="text-xs text-black/50 group-open:hidden">Show</span>
                  <span className="text-xs text-black/50 hidden group-open:inline">Hide</span>
                </summary>
                <p className="mt-2 text-sm text-black/70">{a}</p>
              </motion.details>
            ))}
          </div>
        </MotionSection>
      </section>

      {/* CTA */}
      <section className="relative isolate bg-transparent" aria-labelledby="cta-title">
        {/* ambient background polish */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(140%_120%_at_50%_40%,_black_70%,_rgba(0,0,0,0.6)_86%,_transparent_100%)] [-webkit-mask-image:radial-gradient(140%_120%_at_50%_40%,_black_70%,_rgba(0,0,0,0.6)_86%,_transparent_100%)]"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/45 via-white/20 to-transparent" />
          <div className="absolute left-[-10rem] top-[-6rem] h-56 w-56 rounded-full bg-cerulean/10 blur-3xl" />
          <div className="absolute right-[-8rem] bottom-[-6rem] h-56 w-56 rounded-full bg-accent/15 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <MotionSection amount={0.25} className="text-center">
            <motion.h2 variants={fadeInUp} id="cta-title" className="font-display text-2xl font-semibold">
              Ready for a site that sells?
            </motion.h2>
            <motion.p variants={fadeInUp} className="mx-auto mt-2 max-w-2xl text-sm text-black/70">
              Book a 15 minute discovery call. If there’s a fit, we start within days and ship value in week one.
            </motion.p>
            <motion.div variants={fadeInUp} className="mt-4 flex justify-center">
              <a
                href="/contact"
                aria-label="Get your website built"
                className="group inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-black shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)] ring-2 ring-black/5 focus:outline-none focus-visible:ring-4 focus-visible:ring-cerulean/50"
                style={{ background: "linear-gradient(135deg,#FCA311 0%,#FFD56A 100%)" }}
              >
                Get your website built
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </motion.div>
          </MotionSection>
        </div>
      </section>

      {/* Payment Notice Modal */}
      {payNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full shadow-lg">
            <h3 className="text-lg font-semibold">Complete your payment in your browser</h3>
            <p className="mt-1 text-sm text-black/70">
              For security, payments work only in your device’s default browser.
            </p>
            <ul className="mt-3 text-xs text-black/60 space-y-1">
              <li><strong>iOS:</strong> Tap the Share icon and choose <em>Open in Safari</em>.</li>
              <li><strong>Android:</strong> Tap the ⋮ menu and choose <em>Open in Chrome</em>.</li>
            </ul>
            <div className="mt-4 grid gap-2">
              {/* ...buttons... */}
            </div>
          </div>
        </div>
      )}

      {/* JSON‑LD: Service + FAQ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            serviceType: "Web design and development",
            provider: { "@type": "Organization", name: "Expert Dev Studio" },
            areaServed: "Global",
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: "Website packages",
              itemListElement: [
                { "@type": "Offer", name: "Landing Page Sprint (L0)" },
                { "@type": "Offer", name: "Authority Site (L1)" },
                { "@type": "Offer", name: "Storefront (L2)" },
              ],
            },
            mainEntityOfPage: { "@type": "WebPage", "@id": "https://expertdev.studio/services" },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "How fast can we start?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Discovery calls are usually available this week. If there’s a fit, your first sprint starts within 5–10 days.",
                },
              },
              {
                "@type": "Question",
                name: "What’s included in a sprint?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Clear goals, a prioritized scope, design and build on agreed patterns, QA, analytics/events, and a clean hand-off.",
                },
              },
              {
                "@type": "Question",
                name: "Do you work with existing stacks?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Yes. We’re comfortable integrating into established systems or starting greenfield-whichever moves the needle faster.",
                },
              },
              {
                "@type": "Question",
                name: "Can you support us after launch?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Absolutely. We offer retainers with response‑time SLOs, quarterly roadmaps, and growth work (A/B, SEO, performance).",
                },
              },
            ],
          }),
        }}
      />
    </>
  );
}
