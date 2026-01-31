"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";

export default function LeadCatcherIntakePage() {
  const [booking, setBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState({
    brandName: "",
    offerHeadline: "",
    packagesPricing: "",
    whatsappNumber: "",
    benefits: ["", "", ""],
    testimonials: "",
    brandColors: "",
    links: "",
  });

  useEffect(() => {
    fetch("/api/sprint/booking")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setBooking(data?.booking || null))
      .catch(() => setBooking(null));
  }, []);

  const canSubmit = useMemo(() => {
    return (
      form.brandName &&
      form.offerHeadline &&
      form.packagesPricing &&
      form.whatsappNumber &&
      form.benefits.filter(Boolean).length >= 1
    );
  }, [form]);

  const updateBenefit = (index: number, value: string) => {
    setForm((prev) => {
      const next = [...prev.benefits];
      next[index] = value;
      return { ...prev, benefits: next };
    });
  };

  const submit = async () => {
    if (!booking?.id) return;
    setLoading(true);
    setNotice(null);
    try {
      const res = await fetch("/api/sprint/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          brandName: form.brandName,
          offerHeadline: form.offerHeadline,
          packagesPricing: form.packagesPricing,
          whatsappNumber: form.whatsappNumber,
          benefits: form.benefits.filter(Boolean),
          testimonials: form.testimonials || undefined,
          brandColors: form.brandColors || undefined,
          links: form.links || undefined,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setNotice(data.error || "Unable to submit intake.");
        return;
      }
      window.location.href = "/lead-catcher-sprint/thanks";
    } finally {
      setLoading(false);
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-transparent text-black">
        <div className="page-shell pb-16 pt-24 sm:pt-28 md:pt-32">
          <div className="rounded-3xl border border-black/10 bg-white/90 p-6 text-sm text-black/70">
            Please verify your booking before submitting intake.
          </div>
        </div>
      </div>
    );
  }

  if (booking.status !== "CONFIRMED" && booking.status !== "INTAKE_SUBMITTED") {
    return (
      <div className="min-h-screen bg-transparent text-black">
        <div className="page-shell pb-16 pt-24 sm:pt-28 md:pt-32">
          <div className="rounded-3xl border border-black/10 bg-white/90 p-6 text-sm text-black/70">
            Your booking is not confirmed yet. Complete payment to unlock intake.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-black">
      <div className="page-shell pb-16 pt-24 sm:pt-28 md:pt-32">
        <div className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.25)]">
          <p className="text-xs uppercase tracking-[0.3em] text-black/50">Intake</p>
          <h1 className="mt-2 text-2xl font-semibold text-prussian">
            48H Lead Catcher Sprint intake
          </h1>
          <p className="mt-2 text-sm text-black/70">
            Share the essentials so we can start the sprint immediately.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <input
              value={form.brandName}
              onChange={(e) => setForm({ ...form, brandName: e.target.value })}
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cerulean/40"
              placeholder="Brand name"
            />
            <input
              value={form.offerHeadline}
              onChange={(e) => setForm({ ...form, offerHeadline: e.target.value })}
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cerulean/40"
              placeholder="Offer headline"
            />
            <input
              value={form.packagesPricing}
              onChange={(e) => setForm({ ...form, packagesPricing: e.target.value })}
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cerulean/40"
              placeholder="Packages + pricing"
            />
            <input
              value={form.whatsappNumber}
              onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cerulean/40"
              placeholder="WhatsApp number"
            />
          </div>

          <div className="mt-6 grid gap-3">
            {form.benefits.map((item, index) => (
              <input
                key={`benefit-${index}`}
                value={item}
                onChange={(e) => updateBenefit(index, e.target.value)}
                className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cerulean/40"
                placeholder={`Benefit ${index + 1}`}
              />
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <textarea
              value={form.testimonials}
              onChange={(e) => setForm({ ...form, testimonials: e.target.value })}
              className="min-h-[120px] w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cerulean/40"
              placeholder="Testimonials (optional)"
            />
            <div className="grid gap-4">
              <input
                value={form.brandColors}
                onChange={(e) => setForm({ ...form, brandColors: e.target.value })}
                className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cerulean/40"
                placeholder="Brand colors (optional)"
              />
              <input
                value={form.links}
                onChange={(e) => setForm({ ...form, links: e.target.value })}
                className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cerulean/40"
                placeholder="Links (IG, website)"
              />
            </div>
          </div>

          {notice ? (
            <div className="mt-4 rounded-xl border border-black/10 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              {notice}
            </div>
          ) : null}

          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit || loading}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-prussian px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-prussian/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCircle2 className="h-4 w-4" />
            Submit intake
          </button>
        </div>
      </div>
    </div>
  );
}
