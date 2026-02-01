"use client";

import { useEffect, useMemo, useState } from "react";
import { leadCatcherBusinessTypes, leadCatcherOSCopy } from "../../content/leadcatcheros";

const UTM_STORAGE_KEY = "lcos_utm";
const UTM_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const BUSINESS_LABELS: Record<string, string> = {
  coach: "Coach",
  clinic: "Clinic",
  salon: "Salon",
  tuition: "Tuition",
  "real-estate": "Real Estate",
  other: "Other",
};

type UTMState = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  expiresAt?: number;
};

const sanitizeText = (value: string) => value.replace(/[\n\r\t]+/g, " ").trim();

const getUtmParams = () => {
  if (typeof window === "undefined") return {} as UTMState;
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || undefined,
    utm_medium: params.get("utm_medium") || undefined,
    utm_campaign: params.get("utm_campaign") || undefined,
    utm_content: params.get("utm_content") || undefined,
    utm_term: params.get("utm_term") || undefined,
  } as UTMState;
};

const loadStoredUtm = (): UTMState => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as UTMState;
    if (!parsed.expiresAt || parsed.expiresAt < Date.now()) {
      window.localStorage.removeItem(UTM_STORAGE_KEY);
      return {};
    }
    return parsed;
  } catch {
    return {};
  }
};

const storeUtm = (utm: UTMState) => {
  if (typeof window === "undefined") return;
  const hasAny = Object.values(utm).some((value) => value);
  if (!hasAny) return;
  const payload = { ...utm, expiresAt: Date.now() + UTM_TTL_MS };
  window.localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(payload));
};

const normalizePhone = (value: string) => value.replace(/\D/g, "");

export function LeadCatcherModalLauncher({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const onClick = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("lcos-open"));
    }
  };
  return (
    <button type="button" onClick={onClick} className={className}>
      {label}
    </button>
  );
}

export default function LeadCatcherModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [businessType, setBusinessType] = useState("coach");
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("lcos-open", handler);
    return () => window.removeEventListener("lcos-open", handler);
  }, []);

  useEffect(() => {
    const utm = getUtmParams();
    if (Object.values(utm).some(Boolean)) {
      storeUtm(utm);
    }
  }, []);

  const utmSnapshot = useMemo(() => ({ ...loadStoredUtm(), ...getUtmParams() }), [open]);

  const close = () => {
    setOpen(false);
    setNotice(null);
  };

  const validate = () => {
    if (!fullName.trim()) return "Full name is required.";
    if (!phone.trim()) return "Phone number is required.";
    const digits = normalizePhone(phone);
    if (digits.length < 10) return "Enter a valid phone number.";
    if (!city.trim()) return "City is required.";
    if (!businessType) return "Select your business type.";
    return null;
  };

  const submit = async () => {
    if (loading) return;
    setNotice(null);
    const error = validate();
    if (error) {
      setNotice(error);
      return;
    }
    if (honeypot.trim()) {
      setNotice("Submission blocked.");
      return;
    }

    setLoading(true);
    try {
      const { expiresAt, ...utmClean } = utmSnapshot;
      const payload = {
        fullName: sanitizeText(fullName),
        phone: phone.trim(),
        email: email.trim(),
        businessType,
        city: sanitizeText(city),
        message: sanitizeText(message),
        honeypot,
        utm: utmClean,
        pageUrl: window.location.href,
        referrer: document.referrer || "",
        userAgent: navigator.userAgent.slice(0, 180),
      };

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) {
        setNotice(data.error || "Unable to submit. Please try again.");
        return;
      }
      window.location.href = `/lead-catcher-os/thanks?leadId=${data.leadId}`;
    } catch {
      setNotice("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div aria-hidden={!open}>
      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
            onClick={close}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="leadcatcher-modal-title"
            className="relative z-[101] w-full max-w-lg rounded-3xl border border-black/10 bg-white p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-black/50">Lead Catcher OS</p>
                <h2 id="leadcatcher-modal-title" className="mt-2 text-xl font-semibold text-prussian">
                  Get Demo + Pricing
                </h2>
                <p className="mt-2 text-sm text-black/70">
                  Share a few details. We’ll message you on WhatsApp with the demo + next steps.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/60 hover:bg-black/5"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-black/60">
                  Full name
                </label>
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cerulean/40"
                  placeholder="Your name"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-black/60">
                  WhatsApp number
                </label>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cerulean/40"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-black/60">
                  Email (optional)
                </label>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cerulean/40"
                  placeholder="you@company.com"
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black/60">
                    Business type
                  </label>
                  <select
                    value={businessType}
                    onChange={(event) => setBusinessType(event.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cerulean/40"
                  >
                    {leadCatcherBusinessTypes.map((type) => (
                      <option key={type} value={type}>
                        {BUSINESS_LABELS[type] || type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-black/60">
                    City
                  </label>
                  <input
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cerulean/40"
                    placeholder="City"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-black/60">
                  Message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="min-h-[90px] w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cerulean/40"
                  placeholder="Tell us about your offer or target audience."
                />
              </div>

              <input
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <p className="text-xs text-black/60">
                By submitting, you agree to be contacted on WhatsApp/email.
              </p>

              {notice ? (
                <div className="rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm text-black/70">
                  {notice}
                </div>
              ) : null}

              <button
                type="button"
                onClick={submit}
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-xl bg-prussian px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] transition hover:bg-prussian/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Submitting…" : leadCatcherOSCopy.hero.primaryCta}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
