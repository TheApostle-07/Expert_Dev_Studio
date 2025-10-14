// components/home/Packages.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, fadeInUp, MotionSection } from "../ui/motion";
import { packages } from "./data";
import { ArrowRight, CheckCircle2, Crown } from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────────
   Currency + locale detection (client-side)
   - Prefers device time zone & UTC offset (actual location) over language
   - Maps region -> currency; robust INR handling (Asia/Kolkata + Asia/Calcutta)
   - Converts from INR base using static rates (tunable)
   - Optional manual override via localStorage: localStorage.setItem('force_ccy','INR')
   ------------------------------------------------------------------------ */

type Currency = "INR" | "USD" | "EUR";


// friendly static FX (approx.; adjust anytime)
// value = INR per 1 unit of currency
const INR_PER_UNIT: Record<Currency, number> = {
  INR: 1,
  USD: 88,  // tuned so INR→USD rounding aligns to set price points
  EUR: 102, // tuned so INR→EUR rounding aligns to set price points
};

const DEFAULT_CURRENCY: Currency = "INR";
const INR_LOCALE = "en-IN";
const CURRENCIES: Currency[] = ["INR", "USD", "EUR"];

function getOverrideCurrency(): Currency | null {
  try {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const q = url.searchParams.get("ccy");
      if (q) {
        const upper = q.toUpperCase();
        if (upper in INR_PER_UNIT) return upper as Currency;
      }
    }
    if (typeof localStorage !== "undefined") {
      // explicit override takes precedence
      const forced = localStorage.getItem("force_ccy");
      if (forced) {
        const upper = forced.toUpperCase();
        if (upper in INR_PER_UNIT) return upper as Currency;
      }
      // fall back to last detected (helps smooth SSR geo mismatches)
      const last = localStorage.getItem("last_ccy");
      if (last) {
        const upper = last.toUpperCase();
        if (upper in INR_PER_UNIT) return upper as Currency;
      }
    }
  } catch {}
  return null;
}

// Try extract a region code from locale strings like en-US / fr_FR / pt-BR
function getRegionFromLocales(): string | null {
  const pick = (loc: string) => {
    const match = loc.replace("_", "-").split("-")[1];
    return match ? match.toUpperCase() : null;
  };
  if (typeof navigator !== "undefined") {
    for (const l of navigator.languages ?? []) {
      const r = pick(l);
      if (r) return r;
    }
    const r2 = pick(navigator.language || "");
    if (r2) return r2;
  }
  return null;
}

// minimal tz→country hints for when language has no region
const TZ_HINTS: Record<string, string> = {
  // India (+ legacy alias some Android builds expose)
  "Asia/Kolkata": "IN",
  "Asia/Calcutta": "IN",

  // US common
  "America/New_York": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Los_Angeles": "US",

  // Europe
  "Europe/London": "GB",
  "Europe/Paris": "FR",
  "Europe/Berlin": "DE",
  "Europe/Madrid": "ES",
  "Europe/Rome": "IT",
  "Europe/Amsterdam": "NL",
  "Europe/Stockholm": "SE",
  "Europe/Copenhagen": "DK",
  "Europe/Oslo": "NO",

  // APAC
  "Asia/Tokyo": "JP",
  "Asia/Dubai": "AE",
  "Asia/Singapore": "SG",
  "Australia/Sydney": "AU",

  // Canada
  "America/Toronto": "CA",
};

function detectCurrency(): { currency: Currency; locale: string } {
  // Manual override via URL (?ccy=INR|USD|EUR) or localStorage ('force_ccy')
  const override = getOverrideCurrency();
  if (override) {
    const locale =
      (typeof navigator !== "undefined" && (navigator.languages?.[0] || navigator.language)) ||
      INR_LOCALE;
    return { currency: override, locale };
  }

  // Default to INR and best-available locale for formatting
  const locale =
    (typeof navigator !== "undefined" && (navigator.languages?.[0] || navigator.language)) ||
    INR_LOCALE;
  return { currency: DEFAULT_CURRENCY, locale };
}

function convertINR(amountINR: number, currency: Currency) {
  const perUnit = INR_PER_UNIT[currency] || INR_PER_UNIT.USD;
  // Convert INR -> CCY
  const value = amountINR / perUnit;
  // Friendly rounding (no decimals for these price points)
  return Math.round(value);
}

function fmtCurrency(value: number, currency: Currency, locale: string) {
  const useLocale = currency === "INR" ? INR_LOCALE : locale;
  return new Intl.NumberFormat(useLocale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/* Base prices (authoritative) in INR.
   Keys must match the package title via slugify() below. */
const BASE_INR: Record<
  string,
  { inr: number; from?: boolean }
> = {
  "l0-landing-sprint": { inr: 36500 },
  "l1-authority-site": { inr: 75500 },
  "l2-storefront": { inr: 175500 },
  "l3-custom-build": { inr: 450500 },
  "custom-build": { inr: 450500 },
};

// Exact price overrides per currency (takes precedence over FX conversion)
const PRICE_OVERRIDES: Record<string, Partial<Record<Currency, number>>> = {
  "l0-landing-sprint": { USD: 399, EUR: 359 },
  "l1-authority-site": { USD: 849, EUR: 739 },
  "l2-storefront": { USD: 1999, EUR: 1699 },
  "l3-custom-build": { USD: 4999, EUR: 4399 },
  "custom-build": { USD: 4999, EUR: 4399 },
};

function useLocalizedPricing() {
  const [{ currency, locale }, setLoc] = useState(() => detectCurrency());
  useEffect(() => {
    const det = detectCurrency();
    setLoc(det);
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("last_ccy", det.currency);
      }
    } catch {}
  }, []);

  const setCurrency = (ccy: Currency) => {
    setLoc((prev) => ({ ...prev, currency: ccy }));
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("force_ccy", ccy);
      }
    } catch {}
  };

  return { currency, locale, setCurrency };
}

export default function Packages() {
  const { currency, locale, setCurrency } = useLocalizedPricing();

  const rendered = useMemo(() => {
    // Precompute a display fn to avoid recreating in each card
    const display = (slug: string) => {
      const base = BASE_INR[slug];
      if (!base) return "Contact";

      // Prefer exact per-currency overrides for perfect parity
      const override = PRICE_OVERRIDES[slug]?.[currency];
      if (override) {
        const price = fmtCurrency(override, currency, locale);
        return price; // no "from" prefix; parity across currencies
      }

      // Fallback: convert from INR base
      const v = convertINR(base.inr, currency);
      const price = fmtCurrency(v, currency, locale);
      return price; // no "from" prefix (we removed from flags in BASE_INR)
    };
    return { display };
  }, [currency, locale]);

  return (
    <section
      id="packages"
      className="relative isolate bg-transparent"
      aria-labelledby="packages-title"
    >
      {/* ambient background polish */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(140%_120%_at_50%_18%,_black_70%,_rgba(0,0,0,0.6)_86%,_transparent_100%)] [-webkit-mask-image:radial-gradient(140%_120%_at_50%_18%,_black_70%,_rgba(0,0,0,0.6)_86%,_transparent_100%)]">
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/25 to-transparent" />
        <div className="absolute left-[-12rem] top-[-8rem] h-72 w-72 rounded-full bg-cerulean/10 blur-3xl" />
        <div className="absolute right-[-10rem] bottom-[-6rem] h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <MotionSection amount={0.25}>
          {/* Heading */}
          <motion.h2
            variants={fadeInUp}
            id="packages-title"
            className="font-display text-center text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Transparent packages
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="mt-2 mx-auto max-w-2xl text-center text-sm text-black/70"
          >
            Pick a plan or ask for custom - either way, we ship fast.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="mt-3 flex justify-center"
            aria-label="Currency selector"
          >
            <div
              role="tablist"
              aria-label="Select currency"
              className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white/70 p-1 backdrop-blur"
            >
              {CURRENCIES.map((ccy) => {
                const active = currency === ccy;
                return (
                  <button
                    key={ccy}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-pressed={active}
                    onClick={() => setCurrency(ccy)}
                    className={[
                      "px-3.5 py-1.5 text-xs font-semibold rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-prussian/30",
                      active
                        ? "text-white shadow [text-shadow:0_1px_0_rgba(0,0,0,0.15)] bg-[linear-gradient(90deg,#0A6F95_0%,#007EA7_45%,#003459_100%)]"
                        : "text-black/70 hover:bg-black/5",
                    ].join(" ")}
                  >
                    {ccy}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Cards */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {packages.map((p) => {
              const isFeatured = Boolean(p.accent);
              const id = `plan-${slugify(p.title)}`;

              // Derive price from title slug; fallback safely
              const slug = slugify(p.title);
              const isFlagship = slug === "l3-custom-build";
              const priceText = rendered.display(slug);

              return (
                <motion.article
                  key={p.title}
                  variants={fadeInUp}
                  whileHover={{ y: -4, transition: { duration: 0.18 } }}
                  className={[
                    "relative overflow-hidden rounded-2xl border bg-white p-6 flex h-full flex-col shadow-sm transition will-change-transform group",
                    "border-black/10 hover:shadow-md",
                    isFeatured ? "ring-1 ring-cerulean/40 hover:shadow-lg" : "",
                    isFlagship ? "ring-2 ring-accent/60 border-transparent shadow-[0_24px_64px_-20px_rgba(252,163,17,0.45)]" : "",
                  ].join(" ")}
                  aria-labelledby={id}
                >
                  {/* gradient edge for featured */}
                  {isFeatured && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:opacity-100"
                      style={{
                        maskImage:
                          "linear-gradient(to bottom, black, rgba(0,0,0,.85) 40%, rgba(0,0,0,.4) 70%, transparent)",
                      }}
                    >
                      <div className="absolute -inset-[1px] rounded-2xl bg-[linear-gradient(135deg,#007EA7_0%,#FCA311_50%,#003459_100%)] opacity-[.10]" />
                    </div>
                  )}

                  {isFlagship && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0"
                      style={{
                        maskImage:
                          "linear-gradient(to bottom, black, rgba(0,0,0,.85) 40%, rgba(0,0,0,.4) 70%, transparent)",
                      }}
                    >
                      <div className="absolute -inset-[1px] rounded-2xl bg-[linear-gradient(135deg,#FCA311_0%,#FF9800_50%,#FCA311_100%)] opacity-[.12]" />
                    </div>
                  )}

                  {/* badge for featured */}
                  {isFeatured && (
                    <span className="absolute sm:right-4 sm:top-4 right-3 top-3 inline-flex items-center rounded-full border border-black/10 bg-white/80 px-2 py-1 text-[11px] font-medium text-prussian backdrop-blur">
                      Most popular
                    </span>
                  )}

                  {isFlagship && (
                    <span className="absolute sm:right-4 sm:top-4 right-3 top-3 inline-flex items-center gap-1 rounded-full border border-black/10 bg-white/90 px-2 py-1 text-[11px] font-semibold text-accent backdrop-blur">
                      <Crown className="h-3.5 w-3.5" aria-hidden /> Flagship
                    </span>
                  )}

                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 id={id} className="text-base font-semibold tracking-tight">
                        {p.title}
                      </h3>
                      {/* suppressHydrationWarning avoids a mismatch flash when locale differs SSR/CSR */}
                      <div
                        suppressHydrationWarning
                        className="mt-1 text-2xl font-semibold [font-variant-numeric:tabular-nums]"
                      >
                        {priceText}
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="mt-4 space-y-2 text-sm text-black/70">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <CheckCircle2 className={`h-4 w-4 ${isFlagship ? "text-accent" : "text-cerulean"}`} aria-hidden />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-auto pt-6">
                    <a
                      href="/contact"
                      className={[
                        "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                        isFeatured
                          ? "text-white shadow-[0_8px_24px_-12px_rgba(0,126,167,0.6)] bg-[linear-gradient(90deg,#0A6F95_0%,#007EA7_45%,#003459_100%)] hover:bg-[linear-gradient(90deg,#0C88B4_0%,#009BC4_45%,#074A77_100%)] focus-visible:ring-accent focus-visible:ring-offset-white"
                          : isFlagship
                          ? "text-white shadow-[0_8px_24px_-12px_rgba(252,163,17,0.6)] bg-[linear-gradient(90deg,#FCA311_0%,#FF9800_50%,#FCA311_100%)] hover:bg-[linear-gradient(90deg,#FF9800_0%,#FCA311_50%,#FF9800_100%)] focus-visible:ring-accent focus-visible:ring-offset-white ring-1 ring-[#F59E0B]/30"
                          : "text-black border border-black/10 bg-white hover:bg-black/5 focus-visible:ring-prussian/30",
                      ].join(" ")}
                      aria-label={`Enquire about ${p.title}`}
                    >
                      Enquire
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </a>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </MotionSection>
      </div>
    </section>
  );
}

/** tiny helper to create stable IDs */
function slugify(s: string) {
  return s.toLowerCase().replace(/[^\w]+/g, "-").replace(/(^-|-$)/g, "");
}
