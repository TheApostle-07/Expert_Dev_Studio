// app/work/[slug]/page.tsx
"use client";

import { notFound } from "next/navigation";
import { CASES } from "../../../components/work/case-data";
import { MotionSection, fadeInUp } from "../../../components/ui/motion";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  Target,
  Flag,
  Wrench,
  CalendarClock,
  Users,
  Tag,
  Code2,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

// Local view model with optional deep fields so TS stays happy even if a case
// omits some of them. Your `case-data.ts` can provide any subset of these.
type CaseItem = {
  slug: string;
  title: string;
  category: string;
  lede?: string;
  cover: string;
  previewMp4?: string;
  siteUrl?: string;
  metrics: { k: string; v: string }[];
  tech?: string[];
  timeline?: string | { kickoff?: string; launch?: string; weeks?: string | number };
  services?: string[];
  roles?: string[];
  problem?: string;
  goals?: string[];
  scope?: string[];
  resultsSummary?: string;
  testimonial?: { quote: string; person?: string; name?: string; role?: string; img?: string };
  gallery?: Array<{ src: string; alt?: string; type?: "image" | "video" }>;
  // NEW optional, rendered in a right-hand sidebar card next to Outcome
  outcomeKpis?: Array<{ metric: string; before?: string; after?: string; delta?: string }>;
  outcomeVitals?: Array<{ k: string; v: string }>; // e.g., LCP 1.2s
  experiments?: string[]; // A/B tests, rollouts
  learnings?: string[];   // crisp bullet takeaways
  risks?: string[];
  nextSteps?: string[];
  links?: Array<{ label: string; href: string }>; // additional resources
  outcomeWins?: string[];
  instrumentation?: string[];
  accessibility?: string[];
};

export default function CaseStudyPage({ params }: { params: { slug: string } }) {
  const item = CASES.find((c: any) => c.slug === params.slug) as CaseItem | undefined;
  if (!item) return notFound();

  return (
    <article aria-labelledby="cs-title" className="relative">
      {/* ambient */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-10rem] top-[-6rem] h-64 w-64 rounded-full bg-cerulean/10 blur-3xl" />
        <div className="absolute right-[-10rem] bottom-[-6rem] h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* HERO */}
        <MotionSection amount={0.25} className="text-center pt-8 sm:pt-10">
          <motion.span
            variants={fadeInUp}
            className="mx-auto inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs text-black/70 backdrop-blur"
          >
            {item.category}
          </motion.span>

          <motion.h1
            id="cs-title"
            variants={fadeInUp}
            className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            {item.title}
          </motion.h1>

          {item.lede && (
            <motion.p
              variants={fadeInUp}
              className="mx-auto mt-3 max-w-2xl text-sm text-black/70"
            >
              {item.lede}
            </motion.p>
          )}

          <motion.div
            variants={fadeInUp}
            className="mx-auto mt-5 flex items-center justify-center gap-3"
          >
            {item.siteUrl && (
              <a
                href={item.siteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-black/5"
              >
                View site <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-black ring-2 ring-black/5 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)]"
              style={{ background: "linear-gradient(135deg,#FCA311 0%,#FFD56A 100%)" }}
            >
              Start a project <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* subtle divider */}
          <motion.div
            variants={fadeInUp}
            aria-hidden
            className="mx-auto mt-6 h-[3px] w-24 rounded-full bg-gradient-to-r from-cerulean/0 via-cerulean/70 to-cerulean/0"
          />
        </MotionSection>

        {/* MEDIA BANNER */}
        <MotionSection
          amount={0.2}
          className="mt-8 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm"
        >
          <motion.div variants={fadeInUp} className="relative">
            <img
              src={item.cover}
              alt={`${item.title} cover`}
              className="block h-auto w-full object-cover"
              style={{ aspectRatio: "16 / 9" }}
            />
            {item.previewMp4 && (
              <video
                className="absolute inset-0 hidden h-full w-full object-cover sm:block"
                muted
                playsInline
                loop
                autoPlay
                preload="none"
                poster={item.cover}
              >
                <source src={item.previewMp4} type="video/mp4" />
              </video>
            )}
          </motion.div>
        </MotionSection>

        {/* CONTENT GRID */}
        <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:gap-y-8 lg:items-start">
          {/* LEFT: Narrative */}
          <div className="lg:col-span-8 space-y-6">
            {/* Highlights (metrics) */}
            {item.metrics?.length ? (
              <MotionSection amount={0.2}>
                <motion.div
                  variants={fadeInUp}
                  className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-md hover:border-black/20"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Sparkles className="h-4 w-4 text-cerulean" /> Highlights
                  </div>
                  <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {item.metrics.map((m) => (
                      <li
                        key={`${m.k}-${m.v}`}
                        className="flex items-center justify-between rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
                      >
                        <span className="text-black/60">{m.k}</span>
                        <span className="font-medium">{m.v}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </MotionSection>
            ) : null}

            {/* Brief: Problem + Goals */}
            {(item.problem || item.goals?.length) && (
              <MotionSection amount={0.2}>
                <div className="grid gap-6 md:grid-cols-2">
                  {item.problem && (
                    <motion.div
                      variants={fadeInUp}
                      className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-md hover:border-black/20"
                    >
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Flag className="h-4 w-4 text-black" /> Problem
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-black/80">
                        {item.problem}
                      </p>
                    </motion.div>
                  )}

                  {item.goals?.length ? (
                    <motion.div
                      variants={fadeInUp}
                      className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-md hover:border-black/20"
                    >
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Target className="h-4 w-4 text-cerulean" /> Goals
                      </div>
                      <ul className="mt-3 space-y-2 text-sm text-black/80">
                        {item.goals.map((g, i) => (
                          <li key={`${g}-${i}`} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cerulean" />
                            <span>{g}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ) : null}
                </div>
              </MotionSection>
            )}

            {/* Scope / Approach */}
            {item.scope?.length ? (
              <MotionSection amount={0.2}>
                <motion.div
                  variants={fadeInUp}
                  className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-md hover:border-black/20"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Wrench className="h-4 w-4 text-prussian" /> Scope delivered
                  </div>
                  <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {item.scope.map((s, i) => (
                      <li
                        key={`${s}-${i}`}
                        className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-black/80"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </MotionSection>
            ) : null}

            {/* Outcome narrative */}
            {(item.resultsSummary || item.tech?.length) && (
              <MotionSection amount={0.2}>
                <motion.div
                  variants={fadeInUp}
                  className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-md hover:border-black/20"
                >
                  <div className="text-sm font-semibold">Outcome</div>
                  <p className="mt-3 text-sm leading-relaxed text-black/80">
                    {item.resultsSummary ||
                      "We aligned messaging, kept pages lean, and tuned Core Web Vitals for real‑world devices. Analytics and events shipped on day one so the team could measure impact confidently."}
                  </p>
                  {/* Outcome enrichments */}
                  {item.outcomeWins?.length ? (
                    <div className="mt-4">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <TrendingUp className="h-4 w-4 text-cerulean" />
                        Key wins
                      </div>
                      <ul className="mt-2 space-y-1.5 text-sm text-black/80">
                        {item.outcomeWins.map((w, i) => (
                          <li
                            key={`${w}-${i}`}
                            className="flex items-start gap-2 rounded-md px-2 py-1 transition-colors hover:bg-black/5"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cerulean" />
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {item.tech?.length ? (
                    <>
                      <div className="mt-4 flex items-center gap-2 text-sm font-semibold">
                        <Code2 className="h-4 w-4 text-black" />
                        Tech
                      </div>
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {item.tech.map((t) => (
                          <li
                            key={t}
                            className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs text-black/80"
                          >
                            {t}
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}

                  {item.instrumentation?.length ? (
                    <div className="mt-4">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Sparkles className="h-4 w-4 text-prussian" />
                        Instrumentation
                      </div>
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {item.instrumentation.map((t, i) => (
                          <li
                            key={`${t}-${i}`}
                            className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs text-black/80 transition-colors hover:bg-black/5"
                          >
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {item.accessibility?.length ? (
                    <div className="mt-4">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <CheckCircle2 className="h-4 w-4 text-prussian" />
                        Accessibility & SEO
                      </div>
                      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-black/80">
                        {item.accessibility.map((a, i) => (
                          <li key={`${a}-${i}`} className="rounded-md px-1 transition-colors hover:bg-black/5">
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </motion.div>
              </MotionSection>
            )}

            {/* Gallery */}
            {item.gallery?.length ? (
              <MotionSection amount={0.2}>
                <motion.div variants={fadeInUp}>
                  <div className="text-sm font-semibold">Screens &amp; moments</div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {item.gallery.map((g, i) => (
                      <div
                        key={`${g.src}-${i}`}
                        className="relative overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm"
                      >
                        {g.type === "video" ? (
                          <video
                            className="h-full w-full"
                            muted
                            playsInline
                            loop
                            autoPlay
                            preload="none"
                          >
                            <source src={g.src} />
                          </video>
                        ) : (
                          <img
                            src={g.src}
                            alt={g.alt || `${item.title} screen ${i + 1}`}
                            className="block h-full w-full object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </MotionSection>
            ) : null}
          </div>

          {/* RIGHT: Sidebar meta */}
          <div className="lg:col-span-4 space-y-6">
            <MotionSection amount={0.2}>
              <motion.aside
                variants={fadeInUp}
                className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-md hover:border-black/20"
              >
                <div className="text-sm font-semibold">Project details</div>

                <dl className="mt-3 space-y-2">
                  {(item.timeline || item.category) && (
                    <div className="flex items-center justify-between gap-3 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm">
                      <dt className="flex items-center gap-2 text-black/60">
                        <CalendarClock className="h-4 w-4" />
                        Timeline
                      </dt>
                      <dd className="font-medium">
                        {typeof item.timeline === "string"
                          ? item.timeline
                          : item.timeline?.weeks
                            ? `${item.timeline.weeks} weeks`
                            : item.timeline?.kickoff && item.timeline?.launch
                              ? `${item.timeline.kickoff} → ${item.timeline.launch}`
                              : "6–8 weeks"}
                      </dd>
                    </div>
                  )}

                  {item.services?.length ? (
                    <div className="rounded-lg border border-black/10 bg-white px-3 py-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Tag className="h-4 w-4" /> Services
                      </div>
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {item.services.map((s, i) => (
                          <li
                            key={`${s}-${i}`}
                            className="rounded-full border border-black/10 bg-white px-2 py-0.5 text-[11px] text-black/70"
                          >
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {item.roles?.length ? (
                    <div className="rounded-lg border border-black/10 bg-white px-3 py-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Users className="h-4 w-4" /> Roles
                      </div>
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {item.roles.map((r, i) => (
                          <li
                            key={`${r}-${i}`}
                            className="rounded-full border border-black/10 bg-white px-2 py-0.5 text-[11px] text-black/70"
                          >
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </dl>

                {item.siteUrl && (
                  <a
                    href={item.siteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-black/5"
                  >
                    View site <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </motion.aside>
            </MotionSection>

            {/* Outcome details block */}
            {(item.outcomeKpis?.length || item.outcomeVitals?.length || item.experiments?.length || item.learnings?.length || item.risks?.length || item.links?.length) && (
              <MotionSection amount={0.2}>
                <motion.aside
                  variants={fadeInUp}
                  className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-md hover:border-black/20 min-h-[32rem] lg:min-h-[36rem]"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <TrendingUp className="h-4 w-4 text-cerulean" /> Outcome details
                  </div>

                  {/* KPI table */}
                  {item.outcomeKpis?.length ? (
                    <div className="mt-3 overflow-hidden rounded-lg border border-black/10">
                      <div className="grid grid-cols-3 bg-black/5 text-[11px] font-medium text-black/70">
                        <div className="px-3 py-1.5">Metric</div>
                        <div className="px-3 py-1.5 text-center">Before</div>
                        <div className="px-3 py-1.5 text-center">After / Δ</div>
                      </div>
                      <ul className="divide-y divide-black/10 text-sm">
                        {item.outcomeKpis.map((row, i) => (
                          <li key={`${row.metric}-${i}`} className="grid grid-cols-3 items-center hover:bg-black/5">
                            <div className="px-3 py-2 text-black/80">{row.metric}</div>
                            <div className="px-3 py-2 text-center text-black/60">{row.before ?? "—"}</div>
                            <div className="px-3 py-2 text-center font-medium">
                              {row.after ?? row.delta ?? "—"}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {/* Web Vitals / key numbers */}
                  {item.outcomeVitals?.length ? (
                    <div className="mt-4">
                      <div className="text-sm font-medium">Core Web Vitals</div>
                      <ul className="mt-2 grid grid-cols-1 gap-2">
                        {item.outcomeVitals.map((v, i) => (
                          <li
                            key={`${v.k}-${v.v}-${i}`}
                            className="grid grid-cols-[1fr_auto] items-center gap-x-2 gap-y-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
                          >
                            <span
                              className="leading-snug text-black/60 pr-2"
                              title={v.k}
                            >
                              {v.k}
                            </span>
                            <div className="shrink-0">
                              {(() => {
                                const val = String(v.v ?? "").toLowerCase();
                                if (["enabled", "on", "true", "yes"].includes(val)) {
                                  return (
                                    <span
                                      aria-label="Enabled"
                                      className="whitespace-nowrap inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200"
                                    >
                                      Enabled
                                    </span>
                                  );
                                }
                                if (["disabled", "off", "false", "no"].includes(val)) {
                                  return (
                                    <span
                                      aria-label="Disabled"
                                      className="whitespace-nowrap inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-200"
                                    >
                                      Disabled
                                    </span>
                                  );
                                }
                                return (
                                  <span className="whitespace-nowrap font-medium tabular-nums text-black">
                                    {v.v}
                                  </span>
                                );
                              })()}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {/* Experiments */}
                  {item.experiments?.length ? (
                    <div className="mt-4">
                      <div className="text-sm font-medium">Experiments</div>
                      <ul className="mt-2 space-y-1.5 text-sm text-black/80">
                        {item.experiments.map((e, i) => (
                          <li key={`${e}-${i}`} className="flex items-start gap-2 rounded-md px-2 py-1 hover:bg-black/5">
                            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-cerulean" />
                            <span>{e}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {/* Learnings */}
                  {item.learnings?.length ? (
                    <div className="mt-4">
                      <div className="text-sm font-medium">What we learned</div>
                      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-black/80">
                        {item.learnings.map((l, i) => (
                          <li key={`${l}-${i}`}>{l}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {/* Risks & mitigations */}
                  {item.risks?.length ? (
                    <div className="mt-4">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <ShieldCheck className="h-4 w-4 text-prussian" />
                        Risks & mitigations
                      </div>
                      <ul className="mt-2 space-y-1.5 text-sm text-black/80">
                        {item.risks.map((r, i) => (
                          <li key={`${r}-${i}`} className="flex items-start gap-2 rounded-md px-2 py-1 hover:bg-black/5">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cerulean" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}


                  {/* Links */}
                  {item.links?.length ? (
                    <div className="mt-4">
                      <div className="text-sm font-medium">Resources</div>
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {item.links.map((lnk, i) => (
                          <li key={`${lnk.label}-${i}`}>
                            <a
                              href={lnk.href}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-medium text-black hover:bg-black/5"
                            >
                              {lnk.label}
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </motion.aside>
              </MotionSection>
            )}

          </div>
        </div>

        {/* CTA */}
        <MotionSection amount={0.25} className="mt-12">
          {/* full-width divider aligned with grid */}
          <motion.div variants={fadeInUp} aria-hidden className="w-full border-t border-black/10" />
          {/* centered CTA copy */}
          <div className="mx-auto max-w-2xl pt-8 text-center">
            <motion.h2 variants={fadeInUp} className="font-display text-2xl font-semibold">
              Want results like these—without the chaos?
            </motion.h2>
            <motion.p variants={fadeInUp} className="mx-auto mt-2 max-w-2xl text-sm text-black/70">
              Book a 15-minute discovery call. If there’s a fit, your first sprint starts this week.
            </motion.p>
            <motion.div variants={fadeInUp} className="mt-5 flex justify-center">
              <Link
                href="/contact"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-black ring-2 ring-black/5 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)] transition-opacity hover:opacity-95"
                style={{ background: "linear-gradient(135deg,#FCA311 0%,#FFD56A 100%)" }}
              >
                Get your website built
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </MotionSection>
      </div>
    </article>
  );
}