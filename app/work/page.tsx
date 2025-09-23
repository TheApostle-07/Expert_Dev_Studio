"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MotionSection, fadeInUp } from "../../components/ui/motion";
import {
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  GaugeCircle,
  CheckCircle2,
  Eye,
  Sparkles,
  Layers3,
  ShoppingCart,
  LayoutDashboard,
} from "lucide-react";

const cardMotion = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.2 } },
};

type Tag = "Landing" | "Authority" | "Storefront" | "SaaS" | "Dashboard";

type Project = {
  slug: string;
  title: string;
  tag: Tag;
  blurb: string;
  cover?: string;      // static image (poster)
  preview?: string;    // .mp4/.webm/.gif (autoplay loop)
  site?: string;       // external URL
  caseStudy?: string;  // internal URL
  metrics?: Array<[string, string]>;
};

const PROJECTS: Project[] = [
  {
    slug: "aurora-finance",
    title: "Aurora Finance",
    tag: "SaaS",
    blurb: "Conversion-first marketing site for a fintech SaaS. Clear value prop, razor-fast loads.",
    cover: "/work/aurora-cover.jpg",
    preview: "/work/aurora-preview.mp4",
    site: "https://example.com/",
    caseStudy: "/work/aurora-finance",
    metrics: [["LCP", "1.2s"], ["+conv", "32%"], ["CLS", "0.00"]],
  },
  {
    slug: "atelier-studio",
    title: "Atelier Studio",
    tag: "Authority",
    blurb: "Elegant 5‑page authority site with blog & lead magnet. Built to rank and convert.",
    cover: "/work/atelier-cover.jpg",
    preview: "/work/atelier-preview.mp4",
    site: "https://example.com/",
    caseStudy: "/work/atelier-studio",
    metrics: [["Organic", "+41%"], ["Bounce", "−18%"], ["Forms", "+2.2×"]],
  },
  {
    slug: "swiftcart",
    title: "SwiftCart",
    tag: "Storefront",
    blurb: "Perf‑tuned D2C storefront with Razorpay checkout. Premium visuals, lightweight code.",
    cover: "/work/swiftcart-cover.jpg",
    preview: "/work/swiftcart-preview.mp4",
    site: "https://example.com/",
    caseStudy: "/work/swiftcart",
    metrics: [["LCP", "1.4s"], ["CR", "+19%"], ["AOV", "+12%"]],
  },
  {
    slug: "quartz-analytics",
    title: "Quartz Analytics",
    tag: "Dashboard",
    blurb: "Role‑based admin with clean data flows. Accessible components and dark‑mode ready.",
    cover: "/work/quartz-cover.jpg",
    preview: "/work/quartz-preview.mp4",
    site: "https://example.com/",
    caseStudy: "/work/quartz-analytics",
    metrics: [["Tickets", "−34%"], ["NPS", "9.1"], ["Uptime", "99.9%"]],
  },
  {
    slug: "lift-landing",
    title: "Lift",
    tag: "Landing",
    blurb: "Crisp landing sprint. Message clarity, proof, and single, unmistakable CTA.",
    cover: "/work/lift-cover.jpg",
    preview: "/work/lift-preview.mp4",
    site: "https://example.com/",
    caseStudy: "/work/lift",
    metrics: [["TTFB", "70ms"], ["Leads", "+2.8×"]],
  },
  {
    slug: "northbound",
    title: "Northbound",
    tag: "Authority",
    blurb: "International site with schema & editorial system. Calm, luxurious UI.",
    cover: "/work/northbound-cover.jpg",
    preview: "/work/northbound-preview.mp4",
    site: "https://example.com/",
    caseStudy: "/work/northbound",
    metrics: [["SEO", "Foundations"], ["CWV", "Green"], ["Forms", "+63%"]],
  },
  {
    slug: "vista-ops",
    title: "Vista Ops",
    tag: "Dashboard",
    blurb: "Operational dashboard with real‑time insights and sensible defaults.",
    cover: "/work/vista-cover.jpg",
    preview: "/work/vista-preview.mp4",
    site: "https://example.com/",
    caseStudy: "/work/vista-ops",
    metrics: [["Errors", "−47%"], ["TTI", "1.1s"]],
  },
  {
    slug: "ember-outlet",
    title: "Ember Outlet",
    tag: "Storefront",
    blurb: "Catalog that feels like an app. Smooth filters, fast product pages.",
    cover: "/work/ember-cover.jpg",
    preview: "/work/ember-preview.mp4",
    site: "https://example.com/",
    caseStudy: "/work/ember-outlet",
    metrics: [["FCP", "0.9s"], ["CR", "+23%"]],
  },
  {
    slug: "signal-landing",
    title: "Signal",
    tag: "Landing",
    blurb: "A/B‑tested hero & proof band. Designed to sell the story in seconds.",
    cover: "/work/signal-cover.jpg",
    preview: "/work/signal-preview.mp4",
    site: "https://example.com/",
    caseStudy: "/work/signal",
    metrics: [["LCP", "1.0s"], ["Signups", "+38%"]],
  },
  {
    slug: "atlas-pay",
    title: "Atlas Pay",
    tag: "SaaS",
    blurb: "Demo-led funnel for a B2B payments platform. Opinionated IA, crisp value prop, zero fluff.",
    cover: "/work/atlas-pay-cover.jpg",
    preview: "/work/atlas-pay-preview.mp4",
    site: "https://example.com/",
    caseStudy: "/work/atlas-pay",
    metrics: [["LCP", "1.1s"], ["Demos", "+28%"], ["CLS", "0.01"]],
  },
  {
    slug: "harbor-health",
    title: "Harbor Health",
    tag: "Authority",
    blurb: "Bookings-first clinic site with FAQ schema and location pages. Built to rank locally.",
    cover: "/work/harbor-health-cover.jpg",
    preview: "/work/harbor-health-preview.mp4",
    site: "https://example.com/",
    caseStudy: "/work/harbor-health",
    metrics: [["Organic", "+24%"], ["Bounce", "−22%"], ["Bookings", "+18%"]],
  },
  {
    slug: "nova-learning",
    title: "Nova Learning",
    tag: "SaaS",
    blurb: "Lean SaaS marketing site with fast docs and contextual CTAs. Designed for self-serve trials.",
    cover: "/work/nova-learning-cover.jpg",
    preview: "/work/nova-learning-preview.mp4",
    site: "https://example.com/",
    caseStudy: "/work/nova-learning",
    metrics: [["Signups", "+35%"], ["LCP", "1.2s"], ["CLS", "0.02"]],
  },
  {
    slug: "cinder-crm",
    title: "Cinder CRM",
    tag: "Dashboard",
    blurb: "Role-aware admin with bulk actions and instant search. Dark-mode ready and accessible.",
    cover: "/work/cinder-crm-cover.jpg",
    preview: "/work/cinder-crm-preview.mp4",
    site: "https://example.com/",
    caseStudy: "/work/cinder-crm",
    metrics: [["TTI", "0.9s"], ["Tickets", "−31%"], ["NPS", "9.3"]],
  },
  {
    slug: "glacier-logistics",
    title: "Glacier Logistics",
    tag: "Dashboard",
    blurb: "Realtime fleet view with sensible defaults and clear incident flows.",
    cover: "/work/glacier-logistics-cover.jpg",
    preview: "/work/glacier-logistics-preview.mp4",
    site: "https://example.com/",
    caseStudy: "/work/glacier-logistics",
    metrics: [["Errors", "−54%"], ["LCP", "1.3s"], ["Uptime", "99.98%"]],
  },
  {
    slug: "riviera-bank",
    title: "Riviera Bank",
    tag: "Authority",
    blurb: "A11y-first website for a regional bank. Calm UI, compliant components, CWV in the green.",
    cover: "/work/riviera-bank-cover.jpg",
    preview: "/work/riviera-bank-preview.mp4",
    site: "https://example.com/",
    caseStudy: "/work/riviera-bank",
    metrics: [["A11y", "WCAG AA"], ["CWV", "Green"], ["Forms", "+29%"]],
  },
  {
    slug: "cobalt-commerce",
    title: "Cobalt Commerce",
    tag: "Storefront",
    blurb: "Perf-tuned storefront with Stripe, multicurrency, and fast product detail pages.",
    cover: "/work/cobalt-commerce-cover.jpg",
    preview: "/work/cobalt-commerce-preview.mp4",
    site: "https://example.com/",
    caseStudy: "/work/cobalt-commerce",
    metrics: [["CR", "+22%"], ["LCP", "1.2s"], ["AOV", "+8%"]],
  },
  {
    slug: "beacon-labs",
    title: "Beacon Labs",
    tag: "Landing",
    blurb: "Campaign landing page with A/B-tested hero and proof. Built to convert paid traffic.",
    cover: "/work/beacon-labs-cover.jpg",
    preview: "/work/beacon-labs-preview.mp4",
    site: "https://example.com/",
    caseStudy: "/work/beacon-labs",
    metrics: [["TTFB", "58ms"], ["CPL", "−27%"], ["Leads", "+2.1×"]],
  },
  {
    slug: "nimbus-ai",
    title: "Nimbus AI",
    tag: "SaaS",
    blurb: "AI assistant docs + marketing site with gated demos and usage-based pricing.",
    cover: "/work/nimbus-ai-cover.jpg",
    preview: "/work/nimbus-ai-preview.mp4",
    site: "https://example.com/",
    caseStudy: "/work/nimbus-ai",
    metrics: [["LCP", "1.0s"], ["Signups", "+42%"], ["CLS", "0.01"]],
  }
];

const FILTERS: Array<"All" | Tag> = ["All", "Landing", "Authority", "Storefront", "SaaS", "Dashboard"];

export default function WorkPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const filtered = useMemo(() => {
    if (filter === "All") return PROJECTS;
    return PROJECTS.filter((p) => p.tag === filter);
  }, [filter]);

  return (
    <>
      {/* HERO */}
      <section
        id="hero"
        className="relative isolate bg-white border-0 ring-0 outline-none shadow-none scroll-mt-28 sm:scroll-mt-32"
        aria-labelledby="work-hero-title"
        style={{ backgroundColor: "#ffffff", boxShadow: "none", border: 0, outline: "none" }}
      >
        <div className="relative z-10 mx-auto w-full max-w-none px-6 sm:px-8 lg:px-12">
          <MotionSection amount={0.3} className="pt-24 pb-16 sm:pt-28 sm:pb-20 md:pt-32 md:pb-24 text-center">
            {/* Eyebrow */}
            <motion.span
              variants={fadeInUp}
              className="relative z-10 inline-flex items-center gap-2 mx-auto rounded-full px-3 py-1 text-xs font-medium text-prussian bg-cerulean/10 shadow-sm"
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-cerulean" aria-hidden />
              Selected work · Real results
            </motion.span>

            {/* Title */}
            <motion.h1
              id="work-hero-title"
              variants={fadeInUp}
              className="mx-auto mt-3 sm:mt-4 max-w-5xl font-display text-4xl font-semibold leading-[1.08] tracking-[-0.02em] sm:text-5xl md:text-6xl xl:text-7xl [text-wrap:balance]"
              style={{ overflow: "visible" }}
            >
              <>
                Luxury in look.
                <span className="relative z-10 block mt-2 bg-transparent text-cerulean">Relentless on performance.</span>
              </>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={fadeInUp}
              className="mt-5 mx-auto max-w-3xl text-center text-base sm:text-lg leading-8 tracking-[0.01em] text-black/70 [text-wrap:balance]"
            >
              We build websites and apps that sell the story quickly and load instantly. Here are a few we can talk about.
            </motion.p>

            {/* Filters */}
            <motion.div variants={fadeInUp} className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-2">
              {FILTERS.map((f) => {
                const active = f === filter;
                return (
                  <button
                    type="button"
                    key={f}
                    onClick={() => setFilter(f)}
                    aria-pressed={active}
                    className={[
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      active
                        ? "border-cerulean/30 bg-cerulean/10 text-prussian"
                        : "border-black/10 bg-white text-black/70 hover:bg-black/5",
                    ].join(" ")}
                  >
                    {f}
                  </button>
                );
              })}
            </motion.div>
          </MotionSection>
        </div>
      </section>

      {/* GRID */}
      <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="work-grid-title">
        <MotionSection amount={0.25}>
          <motion.h2
            variants={fadeInUp}
            id="work-grid-title"
            className="font-display text-center text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Case studies
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-2 mx-auto max-w-2xl text-center text-sm text-black/70">
            GIF/Video previews play on hover · Images are lightweight and optimized · Every build ships with analytics and SEO basics.
          </motion.p>

          <div className="mt-8 grid auto-rows-fr gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-black/10 bg-white p-8 text-center text-sm text-black/60">
                No projects match this filter yet.
              </div>
            ) : (
              <AnimatePresence mode="popLayout" initial={false}>
                {filtered.map((p) => (
                  <ProjectCard key={p.slug} p={p} />
                ))}
              </AnimatePresence>
            )}
          </div>
        </MotionSection>
      </section>

      {/* CTA */}
      <section className="border-t border-black/5 bg-white/70" aria-labelledby="cta-title">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <MotionSection amount={0.25} className="text-center">
            <motion.h2 variants={fadeInUp} id="cta-title" className="font-display text-2xl font-semibold text-center">
              Want results like these—without the chaos?
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-2 max-w-2xl text-sm text-black/70 mx-auto text-center">
              Book a 15‑minute discovery call. If there’s a fit, your first sprint starts this week.
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

      {/* JSON-LD: Portfolio Collection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Expert Dev Studio · Work",
            hasPart: PROJECTS.map((p) => ({
              "@type": "CreativeWork",
              name: p.title,
              about: p.tag,
              url: p.caseStudy || p.site || "https://expertdev.studio/work",
            })),
          }),
        }}
      />
    </>
  );
}

function ProjectCard({ p }: { p: Project }) {
  return (
    <motion.article
      layout
      {...cardMotion}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={{ y: -4, transition: { duration: 0.18 } }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm"
      aria-labelledby={`proj-${p.slug}`}
    >
      {/* Media (fixed aspect for consistent heights) */}
      <div className="relative aspect-[16/9] w-full">
        {p.cover ? (
          <img
            src={p.cover}
            alt={`${p.title} cover`}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-cerulean/15 via-white to-accent/15" />
        )}

        {p.preview && (
          <video
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            src={p.preview}
            muted
            playsInline
            autoPlay
            loop
            preload="metadata"
            poster={p.cover}
          />
        )}

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0) 40%, rgba(255,255,255,0.6) 75%, rgba(255,255,255,0.9) 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 id={`proj-${p.slug}`} className="text-base font-semibold tracking-tight">
              {p.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-black/70">{p.blurb}</p>
          </div>
          <span className="inline-flex shrink-0 items-center rounded-full border border-black/10 bg-white px-2 py-1 text-[11px] font-medium text-prussian">
            {p.tag}
          </span>
        </div>

        {/* Metrics */}
        {p.metrics && p.metrics.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2 text-[11px]">
            {p.metrics.map(([k, v]) => (
              <li
                key={k + v}
                className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-2 py-1 text-black/70"
              >
                <GaugeCircle className="h-3.5 w-3.5 text-cerulean" aria-hidden />
                <span className="font-medium text-black">{v}</span>
                <span className="text-black/50">{k}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Actions */}
        <div className="mt-auto pt-4 flex items-center gap-2">
          <a
            href={p.site || "#"}
            target="_blank"
            rel="noreferrer"
            className={[
              "inline-flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-medium",
              p.site ? "hover:bg-black/5 text-black" : "pointer-events-none text-black/40",
            ].join(" ")}
          >
            View site
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <a
            href={p.caseStudy || "#"}
            className={[
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold",
              p.caseStudy
                ? "text-white shadow-[0_8px_24px_-12px_rgba(0,126,167,0.6)] bg-[linear-gradient(90deg,#0A6F95_0%,#007EA7_45%,#003459_100%)] hover:bg-[linear-gradient(90deg,#0C88B4_0%,#009BC4_45%,#074A77_100%)]"
                : "pointer-events-none border border-black/10 bg-white text-black/40",
            ].join(" ")}
          >
            Case study
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </motion.article>
  );
}
