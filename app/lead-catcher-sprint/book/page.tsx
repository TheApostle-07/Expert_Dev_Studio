"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, Lock, RefreshCw } from "lucide-react";

type Slot = { id: string; startTime: string; endTime: string };

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (payload: unknown) => void) => void;
    };
  }
}

export default function LeadCatcherBookPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [authed, setAuthed] = useState(false);
  const [booking, setBooking] = useState<any | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  const grouped = useMemo(() => {
    const fmt = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    return slots.reduce<Record<string, Slot[]>>((acc, slot) => {
      const key = fmt.format(new Date(slot.startTime));
      acc[key] = acc[key] || [];
      acc[key].push(slot);
      return acc;
    }, {});
  }, [slots]);

  useEffect(() => {
    fetch("/api/sprint/slots")
      .then((res) => res.json())
      .then((data) => setSlots(data.slots || []))
      .catch(() => setSlots([]));
    fetch("/api/sprint/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.ok) {
          setAuthed(true);
          setBooking(data.booking || null);
        }
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (window.Razorpay) {
      setScriptReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setScriptReady(true);
    script.onerror = () => setScriptReady(false);
    document.body.appendChild(script);
  }, []);

  const requestOtp = async () => {
    setLoading(true);
    setNotice(null);
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.ok) {
        setNotice(data.error || "Unable to send OTP.");
        return;
      }
      setNotice("OTP sent. Check your email.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setNotice(null);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp }),
      });
      const data = await res.json();
      if (!data.ok) {
        setNotice(data.error || "Invalid code.");
        return;
      }
      setAuthed(true);
      setNotice("Verified. Continue to select a slot.");
    } finally {
      setLoading(false);
    }
  };

  const startPayment = async () => {
    if (!selected) {
      setNotice("Select a slot first.");
      return;
    }
    setLoading(true);
    setNotice(null);
    try {
      const lockRes = await fetch("/api/sprint/lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: selected.id }),
      });
      const lock = await lockRes.json();
      if (!lock.ok) {
        setNotice(lock.error || "Slot unavailable. Please pick another slot.");
        return;
      }

      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: selected.id }),
      });
      const order = await orderRes.json();
      if (!order.ok) {
        setNotice(order.error || "Unable to create order.");
        return;
      }

      if (!scriptReady || !window.Razorpay) {
        setNotice("Payment gateway unavailable. Refresh and try again.");
        return;
      }

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount * 100,
        currency: "INR",
        name: "Expert Dev Studio",
        description: "48H Lead Catcher Sprint",
        order_id: order.orderId,
        handler: async (response?: any) => {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingId: order.bookingId,
              razorpay_order_id: response?.razorpay_order_id,
              razorpay_payment_id: response?.razorpay_payment_id,
              razorpay_signature: response?.razorpay_signature,
            }),
          });
          const verify = await verifyRes.json();
          if (verify.ok) {
            window.location.href = `/lead-catcher-sprint/thanks?booking=${order.bookingId}`;
          } else {
            setNotice(verify.error || "Payment captured. Refresh to confirm booking.");
          }
        },
        modal: {
          ondismiss: () => setNotice("Payment window closed. You can retry."),
        },
      });
      razorpay.on("payment.failed", () => {
        setNotice("Payment failed. Please try again.");
      });
      razorpay.open();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-black">
      <div className="page-shell pb-16 pt-24 sm:pt-28 md:pt-32">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.25)]">
            <p className="text-xs uppercase tracking-[0.3em] text-black/50">Book slot</p>
            <h1 className="mt-2 text-2xl font-semibold text-prussian">Choose a slot</h1>
            <p className="mt-2 text-sm text-black/70">
              Next 10 available slots (Asia/Kolkata).
            </p>

            {!authed ? (
              <div className="mt-6 rounded-2xl border border-black/10 bg-white px-4 py-4">
                <p className="text-sm font-semibold text-prussian">Verify your email</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cerulean/40"
                    placeholder="you@company.com"
                  />
                  <button
                    type="button"
                    onClick={requestOtp}
                    disabled={loading || !email}
                    className="rounded-xl bg-prussian px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-prussian/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Send OTP
                  </button>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cerulean/40"
                    placeholder="Enter OTP"
                  />
                  <button
                    type="button"
                    onClick={verifyOtp}
                    disabled={loading || otp.length < 4}
                    className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-prussian shadow-[0_6px_18px_-12px_rgba(0,0,0,0.25)] transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Verify
                  </button>
                </div>
              </div>
            ) : null}

            {authed ? (
              <div className="mt-6 grid gap-4">
                {Object.entries(grouped).map(([day, daySlots]) => (
                  <div key={day} className="rounded-2xl border border-black/10 bg-white px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-black/40">{day}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {daySlots.map((slot) => {
                        const time = new Intl.DateTimeFormat("en-IN", {
                          timeZone: "Asia/Kolkata",
                          hour: "numeric",
                          minute: "2-digit",
                        }).format(new Date(slot.startTime));
                        const active = selected?.id === slot.id;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setSelected(slot)}
                            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                              active
                                ? "bg-cerulean/10 text-cerulean"
                                : "border border-black/10 text-black/70 hover:bg-black/5"
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.25)]">
            <p className="text-xs uppercase tracking-[0.3em] text-black/50">Summary</p>
            <h2 className="mt-2 text-xl font-semibold text-prussian">48H Lead Catcher Sprint</h2>
            <div className="mt-4 rounded-2xl border border-black/10 bg-white px-4 py-4 text-sm text-black/70">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-cerulean" />
                <span>Draft in 24h, go-live in 48h</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-cerulean" />
                <span>₹999 start fee today</span>
              </div>
            </div>
            <div className="mt-4 text-sm text-black/60">
              {selected ? (
                <span>
                  Selected slot:{" "}
                  <strong className="text-prussian">
                    {new Intl.DateTimeFormat("en-IN", {
                      timeZone: "Asia/Kolkata",
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(selected.startTime))}
                  </strong>
                </span>
              ) : (
                "Select a slot to continue."
              )}
            </div>
            {notice ? (
              <div className="mt-3 rounded-lg border border-black/10 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                {notice}
              </div>
            ) : null}
            <button
              type="button"
              onClick={startPayment}
              disabled={!authed || !selected || loading}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-prussian px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-prussian/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Lock className="h-4 w-4" />
              Continue to Pay ₹999
            </button>
            {booking ? (
              <a
                href="/lead-catcher-sprint/thanks"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-prussian shadow-[0_6px_18px_-12px_rgba(0,0,0,0.25)] transition hover:bg-black/5"
              >
                <RefreshCw className="h-4 w-4" />
                View my booking
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
