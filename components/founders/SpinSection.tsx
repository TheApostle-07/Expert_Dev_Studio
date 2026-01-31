"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, RefreshCw } from "lucide-react";
import SpinWheel from "./SpinWheel";
import ScratchCard from "./ScratchCard";
import CountdownBadge from "./CountdownBadge";
import PaymentButtons from "./PaymentButtons";
import { ANCHOR_PRICE_INR, PRIZES } from "../../lib/founders/prizes";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (payload: unknown) => void) => void;
    };
  }
}

type OfferPayload = {
  offerId: string;
  prizeLabel: string;
  priceInr: number;
  anchorPriceInr: number;
  bonusLabel?: string;
  segmentIndex?: number;
  attemptNumber?: number;
};

type ActiveOfferPayload = OfferPayload & {
  expiresAt: string;
  leadId?: string;
};

type Notice = { type: "error" | "info" | "success"; message: string };

export default function SpinSection() {
  const [loading, setLoading] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(0);
  const [offer, setOffer] = useState<OfferPayload | null>(null);
  const [activeOffer, setActiveOffer] = useState<ActiveOfferPayload | null>(null);
  const [rotation, setRotation] = useState(0);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [extraSpinsRemaining, setExtraSpinsRemaining] = useState(0);
  const [spinPack, setSpinPack] = useState<{ priceInr: number; spins: number } | null>(
    null
  );
  const [packNotice, setPackNotice] = useState<Notice | null>(null);
  const [packLoading, setPackLoading] = useState(false);
  const [packScriptReady, setPackScriptReady] = useState(false);
  const packAttemptRef = useRef(0);
  const packCompletedRef = useRef(false);
  const useScratch = process.env.NEXT_PUBLIC_FOUNDERS_SCRATCH === "true";

  const effectiveRemaining = Math.max(attemptsRemaining, extraSpinsRemaining);
  const attemptsLabel = useMemo(() => {
    if (effectiveRemaining <= 0) return "No spins left today";
    if (extraSpinsRemaining > 0) {
      return `${effectiveRemaining} spins left (+${extraSpinsRemaining} bonus)`;
    }
    return effectiveRemaining === 1 ? "1 spin left" : `${effectiveRemaining} spins left`;
  }, [effectiveRemaining, extraSpinsRemaining]);
  const spinAgainLabel =
    effectiveRemaining === 1
      ? "Spin again (1 chance left)"
      : `Spin again (${effectiveRemaining} chances left)`;
  const resolvedSpinPack = spinPack ?? { priceInr: 9, spins: 3 };

  const noticeStyle = (type: Notice["type"]) => ({
    backgroundColor:
      type === "error" ? "#FEF2F2" : type === "success" ? "#F0FDF4" : "#EFF6FF",
    color: type === "error" ? "#DC2626" : type === "success" ? "#16A34A" : "#2563EB",
  });

  const fetchStart = async () => {
    try {
      const res = await fetch("/api/spin/start", { method: "POST" });
      const data = await res.json();
      if (!data.ok) {
        setNotice({ type: "error", message: data.error || "Unable to start spins." });
        return;
      }
      setAttemptsRemaining(data.attemptsRemaining ?? 0);
      setActiveOffer(data.activeOffer || null);
      setExtraSpinsRemaining(data.extraSpinsRemaining ?? 0);
      setSpinPack(data.spinPack || null);
      setOffer(null);
      setPackNotice(null);
    } catch {
      setNotice({ type: "error", message: "Unable to start spins. Please retry." });
    }
  };

  useEffect(() => {
    fetchStart();
  }, []);

  useEffect(() => {
    if (window.Razorpay) {
      setPackScriptReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setPackScriptReady(true);
    script.onerror = () => setPackScriptReady(false);
    document.body.appendChild(script);
  }, []);

  const ensureRazorpay = async () => {
    if (window.Razorpay) {
      setPackScriptReady(true);
      return true;
    }
    return new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        setPackScriptReady(true);
        resolve(true);
      };
      script.onerror = () => {
        setPackScriptReady(false);
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const spin = async () => {
    setNotice(null);
    setPackNotice(null);
    setLoading(true);
    try {
      const res = await fetch("/api/spin/roll", { method: "POST" });
      const data = await res.json();
      if (!data.ok) {
        setNotice({ type: "error", message: data.error || "Spin unavailable." });
        if (data.activeOffer) {
          setActiveOffer(data.activeOffer);
        }
        return;
      }
      setOffer(data.offer);
      setActiveOffer(null);
      setAttemptsRemaining(data.attemptsRemaining ?? 0);
      setExtraSpinsRemaining(data.extraSpinsRemaining ?? 0);
      const index = data.offer?.segmentIndex ?? 0;
      const angle = 360 / PRIZES.length;
      const target = 360 * 4 + (PRIZES.length - index) * angle + angle / 2;
      setRotation((prev) => prev + target);
    } catch {
      setNotice({ type: "error", message: "Spin failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const acceptOffer = async () => {
    if (!offer?.offerId) return;
    setLoading(true);
    setNotice(null);
    setPackNotice(null);
    try {
      const res = await fetch("/api/spin/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId: offer.offerId }),
      });
      const data = await res.json();
      if (!data.ok) {
        setNotice({ type: "error", message: data.error || "Unable to accept offer." });
        return;
      }
      setActiveOffer({
        offerId: data.offerId,
        prizeLabel: offer.prizeLabel,
        priceInr: offer.priceInr,
        anchorPriceInr: offer.anchorPriceInr,
        bonusLabel: offer.bonusLabel,
        expiresAt: data.expiresAt,
        leadId: data.leadId,
      });
      setOffer(null);
      setNotice({ type: "success", message: "Invite held for 5 minutes." });
    } catch {
      setNotice({ type: "error", message: "Unable to accept offer." });
    } finally {
      setLoading(false);
    }
  };

  const purchaseSpinPack = async () => {
    if (packLoading) return;
    setPackNotice(null);
    setPackLoading(true);
    const attemptId = ++packAttemptRef.current;
    packCompletedRef.current = false;
    try {
      const res = await fetch("/api/spin/purchase", { method: "POST" });
      const data = await res.json();
      if (!data.ok) {
        setPackNotice({
          type: "error",
          message: data.error || "Unable to start spin purchase.",
        });
        setPackLoading(false);
        return;
      }

      const ready = packScriptReady || (await ensureRazorpay());
      if (!ready || !window.Razorpay) {
        setPackNotice({
          type: "error",
          message: "Payment gateway unavailable. Refresh and try again.",
        });
        setPackLoading(false);
        return;
      }

      const orderId = data.orderId as string;
      const spins =
        typeof data.spins === "number" ? data.spins : resolvedSpinPack.spins;
      const razorpay = new window.Razorpay({
        key: data.keyId,
        amount: data.amountPaise,
        currency: "INR",
        name: "Expert Dev Studio",
        description: spins ? `Spin pack (${spins} spins)` : "Spin pack",
        order_id: orderId,
        handler: async () => {
          if (attemptId !== packAttemptRef.current) return;
          packCompletedRef.current = true;
          try {
            const verifyRes = await fetch("/api/spin/verify-pack", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId }),
            });
            const verify = await verifyRes.json();
            if (!verify.ok) {
              setPackNotice({
                type: "info",
                message:
                  verify.error ||
                  "Payment received. Spins will appear after verification.",
              });
              return;
            }
            const nextAttempts = Number(verify.attemptsRemaining ?? 0);
            const nextExtra = Number(verify.extraSpinsRemaining ?? 0);
            setAttemptsRemaining(Number.isFinite(nextAttempts) ? nextAttempts : 0);
            setExtraSpinsRemaining(Number.isFinite(nextExtra) ? nextExtra : 0);
            fetchStart();
            setPackNotice({
              type: "success",
              message: "Spins added. You can spin now.",
            });
          } catch {
            setPackNotice({
              type: "info",
              message: "Payment received. Refresh to see your spins.",
            });
          } finally {
            setPackLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            if (attemptId !== packAttemptRef.current || packCompletedRef.current) return;
            setPackLoading(false);
            setPackNotice({
              type: "info",
              message: "Payment window closed. You can retry anytime.",
            });
          },
        },
        notes: spins
          ? { type: "spin_pack", spins: String(spins) }
          : { type: "spin_pack" },
      });
      razorpay.on("payment.failed", (payload: unknown) => {
        if (attemptId !== packAttemptRef.current || packCompletedRef.current) return;
        const reason =
          typeof payload === "object" && payload !== null
            ? (payload as { error?: { description?: string; reason?: string; code?: string } })
                .error?.description ||
              (payload as { error?: { description?: string; reason?: string; code?: string } })
                .error?.reason ||
              (payload as { error?: { description?: string; reason?: string; code?: string } })
                .error?.code
            : null;
        setPackLoading(false);
        setPackNotice({
          type: "error",
          message: reason ? `Payment failed: ${reason}` : "Payment failed. Please try again.",
        });
      });
      razorpay.open();
    } catch {
      setPackLoading(false);
      setPackNotice({ type: "error", message: "Payment failed. Please try again." });
    }
  };

  return (
    <div className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.25)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-black/50">
            Founders Slot
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-prussian">
            Unlock your invite. Then decide: accept it, or use your final spin.
          </h2>
          <p className="mt-2 text-sm text-black/70">
            Spin to unlock your invite. If you accept an offer, it's held for 5 minutes
            so you can check out securely.
          </p>
        </div>
        <div className="text-right text-xs text-black/60">
          <p className="uppercase tracking-[0.3em] text-black/40">Attempts</p>
          <p className="mt-1 font-semibold text-prussian">{attemptsLabel}</p>
          <p className="mt-1 text-[11px] text-black/50">2 per 24 hours</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-black/10 bg-white/80 p-5 shadow-[0_10px_30px_-24px_rgba(0,0,0,0.18)]">
          {useScratch ? (
            <ScratchCard onReveal={spin} />
          ) : (
            <SpinWheel rotation={rotation} disabled={loading} />
          )}
          {notice ? (
            <div
              className="mt-4 rounded-xl border border-black/10 px-4 py-3 text-sm"
              style={noticeStyle(notice.type)}
            >
              {notice.message}
            </div>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={spin}
              disabled={
                loading ||
                effectiveRemaining <= 0 ||
                Boolean(activeOffer)
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-prussian px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-prussian/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              Spin to reveal your invite
            </button>
          </div>
          <p className="mt-3 text-center text-xs text-black/60">
            You'll see the founder pricing you unlocked. You can Accept it immediately,
            or Spin again if you still have a chance left.
          </p>
          {effectiveRemaining <= 0 && !activeOffer ? (
            <div className="mt-4 rounded-xl border border-black/10 bg-amber-50 px-4 py-3 text-xs text-amber-700">
              <p>
                No spins left today. Grab extra spins below or come back after reset - we
                keep this limited so delivery stays reliable.
              </p>
              <div className="mt-3 rounded-lg border border-amber-200 bg-white/90 px-3 py-3 text-[11px] text-amber-900">
                <p>
                  If you're out of spins, you can buy {resolvedSpinPack.spins} spins for ₹
                  {resolvedSpinPack.priceInr.toLocaleString("en-IN")}.
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={purchaseSpinPack}
                    disabled={packLoading}
                    className="inline-flex items-center justify-center rounded-lg bg-prussian px-3 py-2 text-[11px] font-semibold text-white shadow-sm transition hover:bg-prussian/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Buy spins for ₹{resolvedSpinPack.priceInr.toLocaleString("en-IN")}
                  </button>
                </div>
                {packNotice ? (
                  <div
                    className="mt-2 rounded-lg border border-black/10 px-3 py-2 text-[11px]"
                    style={noticeStyle(packNotice.type)}
                  >
                    {packNotice.message}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-black/10 bg-white/80 p-5 shadow-[0_10px_30px_-24px_rgba(0,0,0,0.18)]">
          {!offer && !activeOffer ? (
            <div className="flex h-full flex-col justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-black/50">
                  Your invite
                </p>
                <p className="mt-3 text-sm text-black/70">
                  Spin to unlock your invite. You'll see the founder pricing you unlocked,
                  and can Accept it immediately or Spin again if you still have a chance left.
                </p>
              </div>
              <div className="rounded-xl border border-black/10 bg-white px-4 py-3 text-xs text-black/60">
                Anchor price:{" "}
                <span className="font-semibold text-prussian">
                  ₹{ANCHOR_PRICE_INR.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          ) : null}

          {offer ? (
            <div className="flex h-full flex-col gap-4">
              <div className="rounded-2xl border border-black/10 bg-white px-4 py-4">
                <p className="text-xs uppercase tracking-[0.3em] text-black/50">
                  Your invite is unlocked
                </p>
                <p className="mt-2 text-xs text-black/60">
                  Anchor price: ₹{offer.anchorPriceInr.toLocaleString("en-IN")}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-prussian">
                  5-Day Business Website Launch
                </h3>
                <p className="mt-2 text-sm text-black/70">
                  A focused sprint for founders who want a site live, not another endless revision cycle.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                  <span className="text-black/50 line-through">
                    ₹{offer.anchorPriceInr.toLocaleString("en-IN")}
                  </span>
                  <span className="text-lg font-semibold text-cerulean">
                    ₹{offer.priceInr.toLocaleString("en-IN")}
                  </span>
                  {offer.bonusLabel ? (
                    <span className="rounded-full bg-cerulean/10 px-3 py-1 text-xs font-semibold text-cerulean">
                      {offer.bonusLabel}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-black/60">
                  Invite: {offer.prizeLabel}
                </p>
                <div className="mt-4 rounded-xl border border-black/10 bg-white/85 px-3 py-3 text-xs text-black/70">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-black/40">
                    What you get
                  </p>
                  <ul className="mt-2 space-y-2">
                    {[
                      "A premium, mobile-first website that's easy to understand in 5 seconds.",
                      'Clear sections that answer: "What do you do, who is it for, and how do I buy/contact you?"',
                      "WhatsApp/contact capture that routes enquiries cleanly.",
                      "Speed + performance baseline so the site feels instant.",
                    ].map((item) => (
                      <li key={item} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-cerulean" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={acceptOffer}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-prussian px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-prussian/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                  Accept offer (hold for 5:00)
                </button>
                {effectiveRemaining > 0 ? (
                  <button
                    type="button"
                    onClick={spin}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-prussian shadow-[0_6px_18px_-12px_rgba(0,0,0,0.25)] transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {spinAgainLabel}
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          {activeOffer ? (
            <div className="flex h-full flex-col gap-4">
              <div className="rounded-2xl border border-black/10 bg-white px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs uppercase tracking-[0.3em] text-black/50">
                    Invite held
                  </p>
                  <CountdownBadge
                    expiresAt={activeOffer.expiresAt}
                    onExpire={() => fetchStart()}
                  />
                </div>
                <p className="mt-2 text-xs text-black/60">
                  Your pricing is held for 5 minutes. This keeps founder slots fair and prevents endless re-spins.
                </p>
                <h3 className="mt-2 text-xl font-semibold text-prussian">
                  5-Day Business Website Launch
                </h3>
                <p className="mt-1 text-xs text-black/60">
                  Invite: {activeOffer.prizeLabel}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  <span className="text-black/50 line-through">
                    ₹{activeOffer.anchorPriceInr.toLocaleString("en-IN")}
                  </span>
                  <span className="text-lg font-semibold text-cerulean">
                    ₹{activeOffer.priceInr.toLocaleString("en-IN")}
                  </span>
                  {activeOffer.bonusLabel ? (
                    <span className="rounded-full bg-cerulean/10 px-3 py-1 text-xs font-semibold text-cerulean">
                      {activeOffer.bonusLabel}
                    </span>
                  ) : null}
                </div>
              </div>
              {activeOffer.leadId ? (
                <PaymentButtons
                  leadId={activeOffer.leadId}
                  priceInr={activeOffer.priceInr}
                  expiresAt={activeOffer.expiresAt}
                />
              ) : (
                <p className="text-sm text-black/70">
                  Please refresh to continue payment.
                </p>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
