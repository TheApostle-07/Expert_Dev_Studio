// components/home/CTA.tsx
"use client";
import { motion, fadeInUp, MotionSection } from "../ui/motion";
import { ArrowRight } from "lucide-react";
import { cta } from "./data";

export default function CTA() {
  return (
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
        <MotionSection amount={0.35}>
          <motion.h2
            variants={fadeInUp}
            id="cta-title"
            className="font-display text-2xl font-semibold text-center"
          >
            {cta.title}
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="mt-2 mx-auto max-w-2xl text-center text-sm text-black/70"
          >
            {cta.desc}
          </motion.p>

          {/* Single, centered CTA */}
          <motion.div variants={fadeInUp} className="mt-8 flex items-center justify-center">
            <a
              href={cta.secondary.href} // "#services"
              className="group relative inline-flex min-w-[200px] items-center justify-center gap-2
                         rounded-xl px-6 py-3 text-sm font-semibold text-white
                         bg-[linear-gradient(90deg,#0A6F95_0%,#007EA7_45%,#003459_100%)]
                         shadow-[0_10px_24px_-14px_rgba(0,126,167,0.45)]
                         transition-colors
                         hover:bg-[linear-gradient(90deg,#0C88B4_0%,#009BC4_45%,#074A77_100%)]
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                         focus-visible:ring-accent focus-visible:ring-offset-white"
            >
              Explore Services
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          </motion.div>
        </MotionSection>
      </div>
    </section>
  );
}
