// components/home/Services.tsx
"use client";

import { motion, fadeInUp, MotionSection } from "../ui/motion";
import { services } from "./data";
import { ArrowRight } from "lucide-react";

export default function Services() {
  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="relative"
    >
      {/* ambient background polish */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-10rem] top-[-8rem] h-64 w-64 rounded-full bg-cerulean/10 blur-3xl" />
        <div className="absolute right-[-10rem] bottom-[-6rem] h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <MotionSection amount={0.25}>
          {/* Title */}
          <motion.h2
            variants={fadeInUp}
            id="services-title"
            className="font-display text-center text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            What we do best
          </motion.h2>

          {/* Subcopy */}
          <motion.p
            variants={fadeInUp}
            className="mt-2 mx-auto max-w-2xl text-center text-sm text-black/70"
          >
            Focused, high-impact builds that move the needle-no bloat, no fluff.
          </motion.p>

          {/* Cards */}
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {services.map(({ t, d, Icon }) => (
              <motion.article
                key={t}
                variants={fadeInUp}
                whileHover={{ y: -4, transition: { duration: 0.18 } }}
                className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition will-change-transform hover:shadow-lg"
              >
                {/* subtle gradient edge on hover */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    maskImage:
                      "linear-gradient(to bottom, black, rgba(0,0,0,.8) 40%, rgba(0,0,0,.35) 70%, transparent)",
                  }}
                >
                  <div className="absolute -inset-[1px] rounded-2xl bg-[linear-gradient(135deg,#007EA7_0%,#FCA311_50%,#003459_100%)] opacity-[.12]" />
                </div>

                {/* Header row */}
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cerulean/15 via-cerulean/10 to-accent/15 ring-1 ring-cerulean/20">
                    <Icon className="h-4 w-4 text-prussian" aria-hidden />
                  </span>
                  <h3 className="text-base font-semibold tracking-tight">{t}</h3>
                </div>

                {/* Description */}
                <p className="mt-3 text-sm leading-relaxed text-black/70">{d}</p>

                {/* Learn more */}
                <a
                  href="/services"
                  className="group mt-4 inline-flex items-center gap-2 text-sm font-medium text-prussian transition-colors no-underline hover:no-underline hover:text-cerulean focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cerulean/30"
                  aria-label={`Learn more about ${t}`}
                >
                  Learn more
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1 group-focus-visible:translate-x-1" aria-hidden />
                </a>
              </motion.article>
            ))}
          </div>
        </MotionSection>
      </div>
    </section>
  );
}