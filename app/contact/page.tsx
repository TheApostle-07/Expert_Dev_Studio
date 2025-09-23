// app/contact/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp, MotionSection } from "../../components/ui/motion";
import {
  ArrowRight,
  CalendarClock,
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Send,
  CheckCircle2,
  AlertCircle,
  BadgeCheck,
  X,
} from "lucide-react";

// Brand logos via Devicon (CSS classes). See: https://devicon.dev
type Devicon = { label: string; className: string; url?: string };
const DEVICONS: Devicon[] = [
  { label: "React", className: "devicon-react-original colored" },
  { label: "Tailwind CSS", className: "devicon-tailwindcss-plain colored" },
  { label: "Node.js", className: "devicon-nodejs-plain colored" },
  { label: "Vercel", className: "devicon-vercel-original" },
  { label: "Cloudflare", className: "devicon-cloudflare-plain colored" },
  { label: "PostgreSQL", className: "devicon-postgresql-plain colored" },
  { label: "Prisma", className: "devicon-prisma-original" },
  { label: "Figma", className: "devicon-figma-plain colored" },
  { label: "MongoDB", className: "devicon-mongodb-plain colored" },
  { label: "Firebase", className: "devicon-firebase-plain colored" },
  { label: "Docker", className: "devicon-docker-plain colored" },
  { label: "Nginx", className: "devicon-nginx-original colored" }
];

/** —— Env-driven knobs ———————————————————————————————— */
const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@expertdev.studio";

/* Your number */
const CONTACT_PHONE =
  process.env.NEXT_PUBLIC_CONTACT_PHONE || "+91 95103 94742";

/* Real Dubai location (precise & recognizable) */
const OFFICE_ADDRESS =
  process.env.NEXT_PUBLIC_OFFICE_ADDRESS ||
  "Dubai Design District (d3), Building 1, Dubai, UAE";

const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ||
  "https://calendly.com/rufusbright595/30min"; // ← replace with your real link

const MAP_EMBED_URL = process.env.NEXT_PUBLIC_MAP_EMBED_URL || "";
const SHEETS_URL =
  process.env.NEXT_PUBLIC_GSHEET_WEBAPP_URL ||
  process.env.NEXT_PUBLIC_SHEET_ENDPOINT ||
  "";

/** UI state */
type FormState = "idle" | "loading" | "success" | "error";

export default function ContactPage() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string | null>(null);
  // Calendly loader state
  const [calLoaded, setCalLoaded] = useState(false);
  const [calSlow, setCalSlow] = useState(false);
  const statusRef = useRef<HTMLDivElement | null>(null);

  // Auto-dismiss success/error banners after a short delay
  useEffect(() => {
    if (state === "success" || state === "error") {
      // Scroll the banner into view for visibility/accessibility
      statusRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      // Focus so screen readers announce it
      statusRef.current?.focus();

      const t = setTimeout(() => {
        // Return to idle after 10s so the UI feels calm
        setState("idle");
      }, 10000);
      return () => clearTimeout(t);
    }
  }, [state]);
  useEffect(() => {
    const t = setTimeout(() => setCalSlow(true), 4000); // show hint if slow
    return () => clearTimeout(t);
  }, []);

  /** Map (no key needed). Use full embed URL if provided. */
  const mapSrc = useMemo(() => {
    if (MAP_EMBED_URL) return MAP_EMBED_URL;
    const q = encodeURIComponent(OFFICE_ADDRESS);
    // zoom a touch closer for d3
    return `https://www.google.com/maps?q=${q}&hl=en&z=15&output=embed`;
  }, []);

  /** Calendly theming */
  const calendlySrc = useMemo(() => {
    const u = new URL(CALENDLY_URL);
    u.searchParams.set("hide_event_type_details", "1");
    u.searchParams.set("background_color", "ffffff");
    u.searchParams.set("text_color", "0b1220");
    u.searchParams.set("primary_color", "007EA7");
    return u.toString();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setError(null);

    const fd = new FormData(e.currentTarget);

    // Honeypot
    if (fd.get("website")) {
      setState("success");
      return;
    }

    const payload = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      company: String(fd.get("company") || ""),
      budget: String(fd.get("budget") || ""),
      message: String(fd.get("message") || ""),
      source: "contact-page",
    };

    try {
      if (!SHEETS_URL) {
        throw new Error(
          "Missing NEXT_PUBLIC_GSHEET_WEBAPP_URL. Set it to your Google Apps Script Web App URL (ends with /exec)."
        );
      }

      // Light meta for the sheet
      const meta = {
        createdAt: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        page: typeof location !== "undefined" ? location.href : "",
        referrer: typeof document !== "undefined" ? document.referrer || "" : "",
      };

      const body = { ...payload, ...meta };

      // Use x-www-form-urlencoded to remain a "simple" CORS request (no preflight).
      const form = new URLSearchParams();
      Object.entries(body).forEach(([k, v]) => form.append(k, String(v)));

      let res: Response | undefined;
      let resText = "";

      try {
        res = await fetch(SHEETS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
          body: form.toString(),
          mode: "cors",
          credentials: "omit",
        });
        // Try to read text for better error messages (ignored if opaque).
        resText = await res.text().catch(() => "");
      } catch (netErr) {
        // Network/CORS error while attempting normal CORS mode
      }

      // If we couldn't read a successful response, try an opaque fallback.
      // Many Apps Script deployments accept the POST but don't include CORS headers,
      // so we can't read the response. In that case, we re‑send in `no-cors` mode
      // and optimistically assume success.
      if (!res || !res.ok) {
        try {
          await fetch(SHEETS_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=UTF-8" },
            body: form.toString(),
            mode: "no-cors",
            credentials: "omit",
            // Note: response will be opaque; we can't read it, but the Sheet will receive it.
          });

          setState("success");
          (e.target as HTMLFormElement).reset();
          return;
        } catch (opaqueErr) {
          // Fall through to error handler below with best diagnostics we have.
          throw new Error(
            `Sheet POST failed${
              res ? ` (HTTP ${res.status})` : ""
            }${resText ? `: ${resText.slice(0, 180)}` : ""}`
          );
        }
      }

      // Success path (readable response)
      setState("success");
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      console.error(err);
      setState("error");
      setError(
        "Could not reach the Google Sheet. Check your Apps Script Web App deployment (access: Anyone, execute as: Me) and NEXT_PUBLIC_GSHEET_WEBAPP_URL (must end with /exec)."
      );
    }
  }

  return (
    <>
      {/* HERO */}
      <section
        id="contact-top"
        className="relative isolate bg-white border-0 ring-0 outline-none shadow-none scroll-mt-28 sm:scroll-mt-32"
        aria-labelledby="contact-hero-title"
      >
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
          <MotionSection amount={0.25} className="pt-24 pb-16 sm:pt-28 sm:pb-20 md:pt-32 md:pb-24 text-center">
            <motion.span
              variants={fadeInUp}
              className="relative z-10 inline-flex items-center gap-2 mx-auto rounded-full px-3 py-1 text-xs font-medium text-prussian bg-cerulean/10 shadow-sm"
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-cerulean" aria-hidden />
              <span className="whitespace-nowrap">
                <span className="font-semibold">Get</span> a <span className="font-semibold">Clear Plan</span> within <span className="font-semibold">1 Business Day</span>.
              </span>
            </motion.span>

            <motion.h1
              id="contact-hero-title"
              variants={fadeInUp}
              className="mt-3 sm:mt-4 mx-auto max-w-5xl font-display text-4xl font-semibold leading-[1.08] tracking-[-0.02em] sm:text-5xl md:text-6xl xl:text-7xl [text-wrap:balance]"
              style={{ overflow: 'visible' }}
            >
              <>
                Tell Us Your Goal
                <span className="relative z-10 block mt-2 bg-transparent text-cerulean">We’ll Map the Fastest Path</span>
              </>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mt-5 mx-auto max-w-3xl text-center text-base sm:text-lg leading-8 tracking-[0.01em] text-black/70 [text-wrap:balance]"
            >
              Tell us about your goals. We’ll respond within 1 business day with
              next steps and a clear path to ship.
            </motion.p>
          </MotionSection>
        </div>
      </section>

      {/* CONTENT GRID — even rhythm */}
      <section className="container mx-auto px-4 pt-12 pb-0 sm:px-6 sm:pt-12 sm:pb-0 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left: Contact form */}
          <div className="lg:col-span-7">
            <MotionSection amount={0.2}>
              <motion.h2 variants={fadeInUp} className="font-display text-2xl font-semibold text-center sm:text-left">
                Send a message
              </motion.h2>
              <motion.p variants={fadeInUp} className="mt-2 text-sm text-black/70 text-center sm:text-left">
                Prefer email? Write to{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-medium text-prussian underline decoration-black/20 underline-offset-2"
                >
                  {CONTACT_EMAIL}
                </a>
                .
              </motion.p>

              <motion.form
                variants={fadeInUp}
                onSubmit={onSubmit}
                className={`mt-6 space-y-4 rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:p-6 relative ${state === "loading" ? "pointer-events-none" : ""} ${state === "success" ? "ring-1 ring-emerald-300" : state === "error" ? "ring-1 ring-rose-300" : ""}`}
                aria-busy={state === "loading"}
                acceptCharset="UTF-8"
                noValidate
              >
                {/* Status banner at the top of the form for immediate feedback */}
                {(state === "success" || state === "error") && (
                  <motion.div
                    id="form-status"
                    role="status"
                    aria-live="assertive"
                    ref={statusRef}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={`mb-3 rounded-xl border px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm ${state === "success" ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}
                    tabIndex={-1}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full ring-1 ${state === "success" ? "bg-emerald-100 ring-emerald-200" : "bg-rose-100 ring-rose-200"}`}
                      >
                        {state === "success" ? (
                          <BadgeCheck className="h-4 w-4 text-emerald-700" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-rose-700" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">
                          {state === "success" ? "Message sent - Thank you!" : "We couldn’t send your message."}
                        </p>
                        <p className="mt-0.5 text-xs text-black/70">
                          {state === "success"
                            ? "We’ll reply within 1 business day. You can also book a call now."
                            : (error ?? "Please try again in a moment or email us directly.")}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {state === "success" ? (
                            <a
                              href={calendlySrc}
                              className="inline-flex items-center gap-1 rounded-md bg-emerald-600/90 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                            >
                              Book a call
                              <ArrowRight className="h-3.5 w-3.5" />
                            </a>
                          ) : (
                            <a
                              href={`mailto:${CONTACT_EMAIL}`}
                              className="inline-flex items-center gap-1 rounded-md border border-rose-300 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-800 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                            >
                              Email us
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => setState("idle")}
                            className="inline-flex items-center gap-1 rounded-md border border-black/10 bg-white px-2.5 py-1.5 text-xs font-medium text-black/70 hover:bg-black/5"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                {/* Honeypot */}
                <input type="text" name="website" tabIndex={-1} aria-hidden="true" className="hidden" />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-1 block text-xs font-medium text-black/70">
                      Full name *
                    </label>
                    <input
                      required
                      id="name"
                      name="name"
                      placeholder="Jane Doe"
                      className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-black/40 focus:border-cerulean/40 focus:ring-2 focus:ring-cerulean/30"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="mb-1 block text-xs font-medium text-black/70">
                      Work email *
                    </label>
                    <input
                      required
                      type="email"
                      id="email"
                      name="email"
                      placeholder="jane@company.com"
                      className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-black/40 focus:border-cerulean/40 focus:ring-2 focus:ring-cerulean/30"
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="mb-1 block text-xs font-medium text-black/70">
                      Company (optional)
                    </label>
                    <input
                      id="company"
                      name="company"
                      placeholder="Acme Inc."
                      className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-black/40 focus:border-cerulean/40 focus:ring-2 focus:ring-cerulean/30"
                    />
                  </div>

                  <div>
                    <label htmlFor="budget" className="mb-1 block text-xs font-medium text-black/70">
                      Budget (approx.)
                    </label>
                    <select
                      id="budget"
                      name="budget"
                      className="w-full appearance-none rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-cerulean/40 focus:ring-2 focus:ring-cerulean/30"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Choose a range
                      </option>
                      <option>Under ₹50k</option>
                      <option>₹50k–₹1L</option>
                      <option>₹1L–₹3L</option>
                      <option>₹3L+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="mb-1 block text-xs font-medium text-black/70">
                    Project details *
                  </label>
                  <textarea
                    required
                    id="message"
                    name="message"
                    rows={6}
                    placeholder="A few lines on goals, deadlines, and must-haves…"
                    className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-black/40 focus:border-cerulean/40 focus:ring-2 focus:ring-cerulean/30"
                  />
                </div>

                <div className="flex flex-col items-center gap-1.5 text-center sm:flex-row sm:items-center sm:justify-start sm:gap-3 sm:text-left">
                  <button
                    type="submit"
                    disabled={state === "loading"}
                    className="group inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-black shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)] ring-2 ring-black/5 focus:outline-none focus-visible:ring-4 focus-visible:ring-cerulean/50"
                    style={{ background: "linear-gradient(135deg,#FCA311 0%,#FFD56A 100%)" }}
                  >
                    {state === "loading" ? (
                      <>
                        Sending… <Send className="h-4 w-4 animate-pulse" />
                      </>
                    ) : (
                      <>
                        Send message
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                  <p className="text-xs leading-tight text-black/60 text-center sm:text-left">We reply within 1 business day.</p>
                </div>

                {/* Dim & lock the form while sending (visible overlay) */}
                {state === "loading" && (
                  <div className="absolute inset-0 z-20 grid place-items-center rounded-2xl bg-white/70 backdrop-blur-sm">
                    <div className="flex flex-col items-center">
                      <div className="h-10 w-10 animate-spin rounded-full border-2 border-black/20 border-t-cerulean" aria-label="Sending" />
                      <p className="mt-3 text-xs text-black/70">Sending your message…</p>
                    </div>
                  </div>
                )}
              </motion.form>

              {/* Extras to balance the column and add clarity */}
              <motion.div variants={fadeInUp} className="mt-6 grid gap-4 sm:grid-cols-2">
                {/* What we cover card */}
                <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                  <h3 className="text-sm font-semibold">What we can cover on the call</h3>
                  <ul className="mt-2 space-y-2 text-xs text-black/70">
                    <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-cerulean" /><span>Outcomes, audience, and success criteria.</span></li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-cerulean" /><span>Scope options (L0–L3) and realistic timelines.</span></li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-cerulean" /><span>Budget guidance and fastest path to value.</span></li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-cerulean" /><span>Risks, integrations, and analytics/tracking.</span></li>
                  </ul>
                </div>

                {/* Working style card */}
                <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                  <h3 className="text-sm font-semibold">How we work</h3>
                  <ul className="mt-2 space-y-2 text-xs text-black/70">
                    <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-cerulean" /><span>Weekly sprints, transparent scope, calm comms.</span></li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-cerulean" /><span>Clean, predictable codebases with documentation.</span></li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-cerulean" /><span>Performance budgets & accessibility considered from day one.</span></li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-cerulean" /><span>NDA-friendly, global clients, timezone overlap.</span></li>
                  </ul>
                </div>
              </motion.div>

              {/* FAQ accordion */}
              <motion.div variants={fadeInUp} className="mt-4 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold">Common questions</h3>
                <div className="mt-2 divide-y divide-black/5">
                  <details className="group py-2" open>
                    <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-medium text-black/80">
                      What happens after I submit the form?
                      <span className="ml-3 text-black/40 group-open:rotate-180 transition">▾</span>
                    </summary>
                    <p className="mt-2 text-xs text-black/70">You’ll get a confirmation email and we’ll reply within one business day with next steps. If there’s a fit, we’ll suggest a short discovery call.</p>
                  </details>

                  <details className="group py-2">
                    <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-medium text-black/80">
                      Do you sign NDAs and work with existing teams?
                      <span className="ml-3 text-black/40 group-open:rotate-180 transition">▾</span>
                    </summary>
                    <p className="mt-2 text-xs text-black/70">Yes. We’re NDA‑friendly and comfortable collaborating with product, design, and engineering teams. Clear ownership and calm comms by default.</p>
                  </details>

                  <details className="group py-2">
                    <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-medium text-black/80">
                      What does pricing look like?
                      <span className="ml-3 text-black/40 group-open:rotate-180 transition">▾</span>
                    </summary>
                    <p className="mt-2 text-xs text-black/70">Packages L0–L3 cover most needs (see pricing on the Services page). For custom work, we’ll shape a lean scope first so you only pay for what moves the needle.</p>
                  </details>
                </div>
              </motion.div>

              {/* Results + Stack + Logos to enrich the column */}
              <motion.div variants={fadeInUp} className="mt-6 grid gap-4">
                {/* Recent results */}
                <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                  <h3 className="text-sm font-semibold">Recent results</h3>
                  <ul className="mt-2 space-y-2 text-xs text-black/70">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-cerulean" />
                      <span>
                        Mobile LCP cut from <span className="font-medium">3.8s → 1.1s</span> for a B2B site.
                        <span className="ml-2 inline-flex items-center rounded-full border border-black/10 bg-cerulean/10 px-2 py-0.5 text-[10px] text-prussian">Core Web Vitals pass</span>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-cerulean" />
                      <span>
                        Sign‑up conversion up <span className="font-medium">+38%</span> after clearer value prop and faster forms.
                        <span className="ml-2 inline-flex items-center rounded-full border border-black/10 bg-cerulean/10 px-2 py-0.5 text-[10px] text-prussian">CRO</span>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-cerulean" />
                      <span>
                        Checkout drop‑off reduced <span className="font-medium">−24%</span> with streamlined steps & events.
                        <span className="ml-2 inline-flex items-center rounded-full border border-black/10 bg-cerulean/10 px-2 py-0.5 text-[10px] text-prussian">Storefront</span>
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Preferred stack */}
                <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                  <h3 className="text-sm font-semibold">Preferred stack</h3>
                  <p className="mt-2 text-xs text-black/60">Modern, proven tools. No bloat.</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[
                      "Next.js","React","TypeScript","Tailwind CSS","Framer Motion","Zod",
                      "Vercel","Cloudflare","AWS","Stripe","Razorpay","Shopify",
                      "Sanity","Contentful","Postgres","Supabase","PlanetScale","Prisma"
                    ].map((t) => (
                      <span key={t} className="inline-flex items-center rounded-lg border border-black/10 bg-white px-2.5 py-1 text-[11px] text-black/70">{t}</span>
                    ))}
                  </div>
                </div>

                {/* Social proof logos */}
                <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                  <h3 className="text-sm font-semibold">We build with</h3>
                  <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {DEVICONS.map((icon) => (
                      <div
                        key={icon.label}
                        title={icon.label}
                        aria-label={icon.label}
                        className="group flex h-16 items-center justify-center rounded-xl border border-black/10 bg-white/90 shadow-sm transition-all duration-200 will-change-transform hover:scale-[1.06] hover:brightness-110 hover:shadow-md"
                      >
                        {icon.url ? (
                          <a
                            href={icon.url}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={icon.label}
                            className="outline-none focus-visible:ring-2 focus-visible:ring-cerulean/40 rounded-md"
                          >
                            <i className={`${icon.className} text-[32px] sm:text-[36px] transition-transform duration-200 group-hover:scale-[1.08]`} />
                          </a>
                        ) : (
                          <i className={`${icon.className} text-[32px] sm:text-[36px] transition-transform duration-200 group-hover:scale-[1.08]`} />
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="sr-only">
                    Technology logos for the tools we commonly use. They are not client endorsements.
                  </p>
                </div>
              </motion.div>
            </MotionSection>
          </div>

          {/* Right: Quick contact, Calendly, Map */}
          <div className="lg:col-span-5">
            <MotionSection amount={0.25} className="space-y-6">
              {/* Quick contact cards */}
              <motion.div variants={fadeInUp} className="grid gap-4 sm:grid-cols-2">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="group flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-prussian/10">
                    <Mail className="h-4 w-4 text-prussian" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">Email</div>
                    <div className="truncate text-xs text-black/70">{CONTACT_EMAIL}</div>
                  </div>
                </a>

                <a
                  href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`}
                  className="group flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
                    <Phone className="h-4 w-4 text-black" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold">Phone</div>
                    <div className="text-xs text-black/70">{CONTACT_PHONE}</div>
                  </div>
                </a>

                <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cerulean/10">
                    <Clock className="h-4 w-4 text-cerulean" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold">Hours</div>
                    <div className="text-xs text-black/70">Mon–Fri · 10:00–18:00 GST</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cerulean/10">
                    <MapPin className="h-4 w-4 text-cerulean" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold">Location</div>
                    <div className="text-xs text-black/70">{OFFICE_ADDRESS}</div>
                  </div>
                </div>
              </motion.div>

              {/* Calendly — a bit shorter so map can grow */}
              <motion.div
                variants={fadeInUp}
                className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm"
              >
                <div className="flex items-center justify-between gap-4 border-b border-black/10 p-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-prussian/10">
                      <CalendarClock className="h-4 w-4 text-prussian" />
                    </span>
                    <h3 className="font-display text-base font-semibold">Book a 15-minute call</h3>
                  </div>
                  <a
                    href={calendlySrc}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-prussian underline decoration-black/20 underline-offset-2 hover:text-black"
                  >
                    Open Calendly
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
                <div className="relative min-h-[380px] sm:min-h-[420px] lg:min-h-[440px]">
                  {/* Aspect ratio shim so layout is stable while Calendly loads */}
                  <div className="pt-[95%] sm:pt-[68%] lg:pt-[52%]" />

                  {/* Loader overlay */}
                  <div
                    className={`absolute inset-0 flex flex-col items-center justify-center bg-white transition-opacity duration-300 ${calLoaded ? "opacity-0 pointer-events-none" : "opacity-100"}`}
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-black/20 border-t-cerulean" aria-label="Loading Calendly" />
                    <p className="mt-3 text-xs text-black/60">Loading scheduler…</p>
                    {calSlow && (
                      <a
                        href={calendlySrc}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-prussian underline decoration-black/20 underline-offset-2 hover:text-black"
                      >
                        Open in a new tab
                        <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Calendly iframe */}
                  <iframe
                    src={calendlySrc}
                    title="Schedule with Expert Dev Studio"
                    className="absolute inset-0 h-full w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    onLoad={() => setCalLoaded(true)}
                  />
                </div>
              </motion.div>

              {/* Map — bigger on desktop to use the empty space */}
              <motion.div
                variants={fadeInUp}
                className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm"
              >
                <div className="flex items-center gap-2 border-b border-black/10 p-4">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
                    <MapPin className="h-4 w-4 text-black" />
                  </span>
                  <h3 className="font-display text-base font-semibold">Find us on the map</h3>
                </div>

                <div className="relative min-h-[420px] sm:min-h-[480px] lg:min-h-[600px]">
                  {/* taller aspect ratios at larger breakpoints */}
                  <div className="pt-[82%] sm:pt-[70%] lg:pt-[68%] xl:pt-[64%]" />
                  <iframe
                    src={mapSrc}
                    title={`Map: ${OFFICE_ADDRESS}`}
                    className="absolute inset-0 h-full w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-2 text-xs text-black/70">
                    <MessageSquare className="h-4 w-4 text-black/60" />
                    Having trouble?{" "}
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="font-medium text-prussian underline decoration-black/20 underline-offset-2"
                    >
                      Email us
                    </a>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      OFFICE_ADDRESS
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-prussian underline decoration-black/20 underline-offset-2 hover:text-black"
                  >
                    Open in Maps
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </motion.div>
            </MotionSection>
          </div>
        </div>

        {/* FULL-WIDTH TRUST ROW */}
        <MotionSection amount={0.25} className="mt-10 pb-12 sm:mt-12 sm:pb-12">
          <motion.dl variants={fadeInUp} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["< 1 day", "Response time"],
              ["99.9%", "Uptime sites"],
              ["NDA-friendly", "Process"],
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

      {/* CTA */}
      <section className="border-t border-black/5 bg-white/70" aria-labelledby="cta-mini">
        <div className="container mx-auto px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
          <MotionSection amount={0.25} className="text-center">
            <motion.h2 id="cta-mini" variants={fadeInUp} className="font-display text-2xl font-semibold text-center">
              Ready when you are.
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-2 max-w-2xl text-sm text-black/70 mx-auto text-center">
              Share a few details and we’ll tailor the next steps to your goals.
            </motion.p>
            <motion.div variants={fadeInUp} className="mt-4 flex justify-center">
              <a
                href={calendlySrc}
                className="group inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-black shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)] ring-2 ring-black/5 hover:opacity-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-cerulean/50"
                style={{ background: "linear-gradient(135deg,#FCA311 0%,#FFD56A 100%)" }}
              >
                Book discovery call
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </motion.div>
          </MotionSection>
        </div>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Expert Dev Studio",
            url: "https://expertdev.studio",
            contactPoint: [
              {
                "@type": "ContactPoint",
                contactType: "sales",
                email: CONTACT_EMAIL,
                telephone: CONTACT_PHONE,
                areaServed: "AE",
                availableLanguage: ["en", "ar"],
              },
            ],
            address: {
              "@type": "PostalAddress",
              streetAddress: OFFICE_ADDRESS,
              addressCountry: "AE",
            },
          }),
        }}
      />
    </>
  );
}