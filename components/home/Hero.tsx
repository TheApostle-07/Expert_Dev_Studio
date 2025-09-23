// components/home/Hero.tsx
"use client";

import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, fadeInUp, MotionSection } from "../ui/motion";
import { hero } from "./data";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative isolate bg-white border-0 ring-0 outline-none shadow-none scroll-mt-28 sm:scroll-mt-32"
      aria-labelledby="hero-title"
      style={{ backgroundColor: "#ffffff", boxShadow: "none", border: 0, outline: "none" }}
    >
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
        <MotionSection amount={0.3} className="pt-24 pb-16 sm:pt-28 sm:pb-20 md:pt-32 md:pb-24 text-center">
          {/* Eyebrow */}
          <motion.span
            variants={fadeInUp}
            className="relative z-10 inline-flex items-center gap-2 mx-auto rounded-full px-3 py-1 text-xs font-medium text-prussian bg-cerulean/10 shadow-sm"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-cerulean" aria-hidden />
            Fast Builds, Real Results
          </motion.span>

          {/* Title */}
          <motion.h1
            id="hero-title"
            variants={fadeInUp}
            className="mt-3 sm:mt-4 mx-auto max-w-5xl font-display text-4xl font-semibold leading-[1.08] tracking-[-0.02em] sm:text-5xl md:text-6xl xl:text-7xl [text-wrap:balance]"
            style={{ overflow: 'visible' }}
          >
            <>
              Websites That Earn Trust and Drive Sales.
              <span className="relative z-10 block mt-2 bg-transparent text-cerulean"> Built Fast, Built Right.</span>
            </>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={fadeInUp}
            className="mt-5 mx-auto max-w-3xl text-center text-base sm:text-lg leading-8 tracking-[0.01em] text-black/70 [text-wrap:balance]"
          >
            Get a premium site that loads quick, reads clearly, and makes it easy for visitors to say yes. We plan fast, ship in focused sprints, and hand you analytics you can act on.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeInUp}
            className="mt-6 sm:mt-7 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
            {/* Primary: premium gradient, centered contents, strong focus */}
            <a
              href={hero.ctas[0].href}
              className="group relative inline-flex min-w-[180px] items-center justify-center gap-2
                         rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm
                         bg-[linear-gradient(90deg,#0A6F95_0%,#007EA7_45%,#003459_100%)]
                         transition-colors
                         hover:bg-[linear-gradient(90deg,#0C88B4_0%,#009BC4_45%,#074A77_100%)]
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                         focus-visible:ring-accent focus-visible:ring-offset-white no-underline hover:no-underline"
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              Book a 15 minute call
            </a>

            {/* Secondary: refined outline with animated arrow */}
            <a
              href={hero.ctas[1].href}
              aria-label="View packages"
              className="group inline-flex min-w-[180px] items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-medium text-black border border-black/10 shadow-sm transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-prussian/30 no-underline hover:no-underline"
            >
              View packages
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1 group-focus-visible:translate-x-1"
                aria-hidden
              />
            </a>
          </motion.div>

          {/* Trust row */}
          <motion.dl
            variants={fadeInUp}
            className="mt-8 grid grid-cols-2 sm:grid-cols-4 items-stretch gap-3 sm:gap-4 lg:gap-6"
          >
            {hero.trust.map(([k, v]) => (
              <div
                key={k}
                className="flex h-full flex-col justify-between rounded-2xl bg-white p-4 text-center border border-black/10 shadow-sm"
              >
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
  );
}
