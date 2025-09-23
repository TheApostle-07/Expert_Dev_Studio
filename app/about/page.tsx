"use client";

import { motion } from "framer-motion";
import { MotionSection, fadeInUp } from "../../components/ui/motion";
import {
  Sparkles,
  ShieldCheck,
  Rocket,
  HeartHandshake,
  Timer,
  Wrench,
  ArrowRight,
  Quote,
} from "lucide-react";

export default function AboutPage() {
  return (
    <>
      {/* HERO */}
      <section
        id="hero"
        className="relative isolate bg-white border-0 ring-0 outline-none shadow-none scroll-mt-28 sm:scroll-mt-32"
        aria-labelledby="about-hero-title"
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
              About Expert Dev Studio
            </motion.span>

            {/* Title */}
            <motion.h1
              id="about-hero-title"
              variants={fadeInUp}
              className="mt-3 sm:mt-4 mx-auto max-w-5xl font-display text-4xl font-semibold leading-[1.08] tracking-[-0.02em] sm:text-5xl md:text-6xl xl:text-7xl [text-wrap:balance]"
              style={{ overflow: "visible" }}
            >
              Built for clarity, engineered for speed.
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={fadeInUp}
              className="mt-5 mx-auto max-w-3xl text-center text-base sm:text-lg leading-8 tracking-[0.01em] text-black/70 [text-wrap:balance]"
            >
              We design and ship conversion‑focused websites and web apps that look luxury and load fast. Our
              process is calm, opinionated where it matters, and relentlessly practical—so your brand wins on
              every device.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeInUp} className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {/* Primary: premium gradient */}
              <a
                href="/contact"
                aria-label="Start a project"
                className="group relative inline-flex min-w-[180px] items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white bg-[linear-gradient(135deg,#FCA311_0%,#FFD56A_100%)] transition-colors hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cerulean/50 focus-visible:ring-offset-white no-underline hover:no-underline"
              >
                <Sparkles className="h-4 w-4" aria-hidden />
                Start a project
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>

              {/* Secondary: refined outline with animated arrow */}
              <a
                href="/work"
                className="group inline-flex min-w-[180px] items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-medium text-black border border-black/10 shadow-sm transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-prussian/30 no-underline hover:no-underline"
              >
                See recent work
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1 group-focus-visible:translate-x-1" aria-hidden />
              </a>
            </motion.div>
          </MotionSection>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="principles-title">
        <MotionSection amount={0.25}>
          <motion.h2 variants={fadeInUp} id="principles-title" className="font-display text-center text-2xl font-semibold">
            Principles we won’t compromise
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-2 mx-auto max-w-2xl text-center text-sm text-black/70">
            These shape every decision—from scope and design to implementation and hand‑off.
          </motion.p>

          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: ShieldCheck,
                title: "Clarity first",
                desc: "Messaging, IA, and UX patterns that reduce friction and boost conversion.",
              },
              {
                icon: Rocket,
                title: "Performance by default",
                desc: "Lean pages, disciplined assets, and fast Time‑to‑Value on mobile.",
              },
              {
                icon: Wrench,
                title: "Engineering craft",
                desc: "Predictable codebases and clean hand‑offs your team can build on.",
              },
              {
                icon: HeartHandshake,
                title: "Partner mindset",
                desc: "Transparent scope, proactive comms, and disciplined sprints.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <motion.article
                key={title}
                variants={fadeInUp}
                whileHover={{ y: -3, transition: { duration: 0.18 } }}
                className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-prussian/10">
                    <Icon className="h-4 w-4 text-prussian" />
                  </span>
                  <h3 className="text-base font-semibold">{title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-black/70">{desc}</p>
              </motion.article>
            ))}
          </div>

          {/* small trust row */}
          <motion.dl variants={fadeInUp} className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["< 1.5s", "Mobile LCP"],
              ["99.9%", "Uptime across sites"],
              ["A/B ready", "Analytics & events"],
              ["Global", "Clients"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-black/10 bg-white p-4">
                <dt className="text-xs uppercase tracking-wide text-black/50">{v}</dt>
                <dd className="mt-1 text-base font-medium">{k}</dd>
              </div>
            ))}
          </motion.dl>
        </MotionSection>
      </section>

      {/* PROCESS */}
      <section className="border-y border-black/5 bg-white/60" aria-labelledby="process-title">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <MotionSection amount={0.2}>
            <motion.h2 variants={fadeInUp} id="process-title" className="font-display text-center text-2xl font-semibold">
              A calm, fast process
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-2 mx-auto max-w-2xl text-center text-sm text-black/70">
              Scope with intent. Ship value weekly. No drama.
            </motion.p>

            <ol className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
              {[
                ["01", "Discovery", "Goals, audience, constraints. Rapid alignment."],
                ["02", "Messaging", "Sharp value prop, IA, and wire flows."],
                ["03", "Design", "Elegant UI built on reusable patterns."],
                ["04", "Build", "Clean components, accessible and fast."],
                ["05", "Launch", "Analytics, QA, and smooth hand‑off."],
              ].map(([num, title, desc]) => (
                <motion.li
                  key={num}
                  variants={fadeInUp}
                  className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm"
                >
                  <div className="text-xs font-semibold tracking-wider text-black/50">{num}</div>
                  <div className="mt-1 text-base font-semibold">{title}</div>
                  <p className="mt-2 text-sm text-black/70">{desc}</p>
                </motion.li>
              ))}
            </ol>
          </MotionSection>
        </div>
      </section>

      {/* FOUNDER */}
      <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="founder-title">
        <MotionSection amount={0.25}>
          <div className="mx-auto max-w-4xl">
            <motion.h2 variants={fadeInUp} id="founder-title" className="font-display text-center text-2xl font-semibold">
              From the founder’s desk
            </motion.h2>

            <motion.div
              variants={fadeInUp}
              className="mt-6 rounded-2xl border border-black/10 bg-white p-6 shadow-sm md:p-8"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-1 ring-black/10">
                  {/* Prefer a local /public/rufus.jpg if you add one; fallback to generated avatar */}
                  <img
                    src="/img/rufusbright.jpeg"
                    alt="Rufus Bright"
                    className="h-full w-full object-cover"
                    loading="lazy"
                    width={56}
                    height={56}
                  />
                </div>

                <div className="min-w-0">
                  <div className="text-sm font-semibold">Rufus Bright</div>
                  <div className="text-xs text-black/60">Founder, Expert Dev Studio</div>
                </div>

                <ShieldCheck className="ml-auto h-5 w-5 text-prussian/70" aria-hidden />
              </div>

              <blockquote className="mt-4 text-[15px] leading-relaxed text-black/80">
                <p>
                  “We built this studio for founders who value momentum. Our promise is simple: elegant interfaces,
                  ruthless performance, and honest scope. We’ll help you say less, say it better, and ship faster.”
                </p>
                <p className="mt-3">
                  If that resonates, I’d love to understand your goals and sketch the shortest path to launch.”
                </p>
              </blockquote>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <a
                  href="/contact"
                  aria-label="Talk to us"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-black shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)] ring-2 ring-black/5 focus:outline-none focus-visible:ring-4 focus-visible:ring-cerulean/50"
                  style={{ background: "linear-gradient(135deg,#FCA311 0%,#FFD56A 100%)" }}
                >
                  Talk to us
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </a>
                <div className="text-xs text-black/60">Typically replies within 1 business day.</div>
              </div>
            </motion.div>
          </div>
        </MotionSection>
      </section>

      {/* CTA */}
      <section className="border-t border-black/5 bg-white/70" aria-labelledby="about-cta-title">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <MotionSection amount={0.25} className="text-center">
            <motion.h2 variants={fadeInUp} id="about-cta-title" className="font-display text-2xl font-semibold text-center">
              Ready to move fast—without the mess?
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-2 max-w-2xl text-sm text-black/70 mx-auto text-center">
              Book a 15‑minute discovery call. If there’s a fit, your first sprint starts this week.
            </motion.p>
            <motion.div variants={fadeInUp} className="mt-4 flex justify-center">
              <a
                href="/contact"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-black shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)] ring-2 ring-black/5 hover:opacity-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-cerulean/50"
                style={{ background: "linear-gradient(135deg,#FCA311 0%,#FFD56A 100%)" }}
              >
                Get your website built
                <ArrowRight className="h-4 w-4" />
              </a>
            </motion.div>
          </MotionSection>
        </div>
      </section>
    </>
  );
}
