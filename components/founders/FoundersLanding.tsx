"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, PlayCircle, ShieldCheck, Sparkles, Star } from "lucide-react";
import { MotionSection, fadeInUp } from "../ui/motion";
import SpinSection from "./SpinSection";

const vslUrl =
  process.env.NEXT_PUBLIC_FOUNDERS_VSL_URL ||
  "https://www.youtube.com/embed/ysz5S6PUM-U";

const demoCards = [
  {
    title: "SaaS Conversion Stack",
    detail:
      "Product flow that helps visitors understand value fast and start trials sooner.",
    href: "/work",
  },
  {
    title: "Creator Offer Page",
    detail:
      "Clear positioning + proof layout that makes premium offers easier to buy.",
    href: "/work",
  },
  {
    title: "Commerce Launch",
    detail:
      "Mobile-first pages that load fast and reduce drop-offs at checkout.",
    href: "/work",
  },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Founder, GrowthStack",
    quote:
      "We finally stopped overthinking. The daily checkpoints made it simple, and the site went live in five days.",
  },
  {
    name: "Rohan Mehta",
    role: "Founder, ByteCraft",
    quote:
      "Fixed scope removed the stress. We knew exactly what was happening each day, and nothing dragged.",
    highlight: true,
  },
  {
    name: "Maya Kulkarni",
    role: "Founder, Bloomly",
    quote:
      "It felt structured and calm. The site now matches our brand, and it is actually easy for people to contact us.",
  },
];

const faqs = [
  {
    q: "What is Founders Slot?",
    a: "A limited-capacity sprint reserved for founders who want priority delivery and founder pricing. We keep it capped so timelines stay real.",
  },
  {
    q: "What happens after I pay?",
    a: "You'll submit a short onboarding form. Then your Client Success Manager confirms the checklist and your kickoff starts within 24 hours.",
  },
  {
    q: "Do I need to get on a call?",
    a: "No. The sprint is designed to run cleanly over WhatsApp and a checklist. If you want a quick alignment call, you can opt in.",
  },
  {
    q: "What if the timer expires?",
    a: "The invite releases automatically so someone else can take the slot. You can spin again after reset.",
  },
  {
    q: "What if I do not have content ready?",
    a: "That's normal. We'll guide you through a simple checklist and help you assemble what's needed quickly.",
  },
];

const initialsFor = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export default function FoundersLanding() {
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
                Lock a priority build slot in minutes - without calls, back-and-forth, or scope chaos.
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                className="mt-4 text-base text-black/70 sm:text-lg"
              >
                A premium website built in a focused 5-day sprint. Spin to unlock your invite,
                choose the offer you want, and reserve delivery before today's slots close.
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
                  Verified founders only · 5-minute hold after you accept
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
              <p className="mt-3 text-sm text-black/70">
                See exactly how the 5-day sprint works - what we deliver each day, what you'll
                need, and what you'll get at launch.
              </p>
              <p className="mt-2 text-xs text-black/60">
                If you've been stuck "planning" a website for weeks, this explains how we ship
                without the usual agency delays.
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
              <a
                href={vslUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-prussian shadow-[0_6px_18px_-12px_rgba(0,0,0,0.2)] transition hover:bg-black/5"
              >
                <PlayCircle className="h-4 w-4 text-cerulean" aria-hidden />
                Watch the sprint walkthrough
              </a>
            </motion.div>
          </div>

          <motion.div variants={fadeInUp} className="grid gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/50">Examples</p>
              <h2 className="mt-3 text-2xl font-semibold text-prussian">
                Look and feel are important - but clarity and speed win.
              </h2>
              <p className="mt-2 text-sm text-black/70">
                These are real sprint-style builds: fast, clean, and designed to turn attention
                into enquiries.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {demoCards.map((demo) => (
                <div
                  key={demo.title}
                  className="rounded-2xl border border-black/10 bg-white/85 p-5 shadow-[0_10px_26px_-20px_rgba(0,0,0,0.2)]"
                >
                  <h3 className="text-lg font-semibold text-prussian">{demo.title}</h3>
                  <p className="mt-2 text-sm text-black/70">{demo.detail}</p>
                  <a
                    href={demo.href}
                    className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-prussian"
                  >
                    View demo
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </a>
                </div>
              ))}
            </div>
          </motion.div>

          <div id="spin" className="scroll-mt-32">
            <SpinSection />
          </div>

          <motion.div
            variants={fadeInUp}
            className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.25)]"
          >
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-black/50">
                5-Day Business Website Launch
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-prussian">
                What founders say
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {testimonials.map((item) => (
                  <div
                    key={item.name}
                    className={`rounded-2xl border border-black/10 p-4 text-sm text-black/70 shadow-[0_10px_26px_-20px_rgba(0,0,0,0.2)] ${
                      item.highlight ? "bg-cerulean/10" : "bg-white/80"
                    }`}
                  >
                    <div className="flex flex-wrap items-start gap-3">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-prussian/10 text-xs font-semibold text-prussian">
                          {initialsFor(item.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-prussian">{item.name}</p>
                          <p className="text-xs text-black/50">{item.role}</p>
                        </div>
                      </div>
                      <div className="flex w-full items-center gap-0.5 text-amber-500 sm:w-auto">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={`${item.name}-star-${index}`}
                            className="h-3.5 w-3.5 text-amber-500"
                            fill="currentColor"
                            aria-hidden
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-3 text-sm">{item.quote}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-black/60">
                Qualified enquiries started showing up within days - because the page was clearer.
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.25)]"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-black/50">
              Launch plan
            </p>
            <p className="mt-3 text-sm text-black/70">
              A predictable sprint. You'll always know what's happening next.
            </p>
            <ul className="mt-4 space-y-3 text-sm text-black/70">
              {[
                "Day 1: Goals, structure, and conversion map (what the page must answer).",
                "Day 2: Copy + layout draft (so you approve the message early).",
                "Day 3: Design + build in production (real preview link, not mockups).",
                "Day 4: Performance, SEO baseline, and final polish.",
                "Day 5: Launch, handoff, and 30-day support.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-cerulean" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
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
              Ready to stop postponing your website?
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-prussian">
              Unlock your invite and reserve a build slot while capacity is open.
            </h2>
            <p className="mt-3 text-sm text-black/70">
              Slots reset every 24 hours · Limited for delivery reliability
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
