"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, RefreshCw } from "lucide-react";
import SpinWheel from "./SpinWheel";
import ScratchCard from "./ScratchCard";
import CountdownBadge from "./CountdownBadge";
import PaymentButtons from "./PaymentButtons";
import { PRIZES } from "../../lib/founders/prizes";

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
  const [slotsLeftToday, setSlotsLeftToday] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState<string | null>(null);
  const [offer, setOffer] = useState<OfferPayload | null>(null);
  const [activeOffer, setActiveOffer] = useState<ActiveOfferPayload | null>(null);
  const [rotation, setRotation] = useState(0);
  const [notice, setNotice] = useState<Notice | null>(null);
  const useScratch = process.env.NEXT_PUBLIC_FOUNDERS_SCRATCH === "true";

  const attemptsLabel = useMemo(() => {
    if (attemptsRemaining <= 0) return "No spins left today";
    return attemptsRemaining === 1 ? "1 spin left today" : `${attemptsRemaining} spins left`;
  }, [attemptsRemaining]);

  const fetchStart = async () => {
    try {
      const res = await fetch("/api/spin/start", { method: "POST" });
      const data = await res.json();
      if (!data.ok) {
        setNotice({ type: "error", message: data.error || "Unable to start spins." });
        return;
      }
      setAttemptsRemaining(data.attemptsRemaining ?? 0);
      setSlotsLeftToday(data.slotsLeftToday ?? 0);
      setCooldownUntil(data.cooldownUntil ? new Date(data.cooldownUntil).toISOString() : null);
      setActiveOffer(data.activeOffer || null);
      setOffer(null);
    } catch {
      setNotice({ type: "error", message: "Unable to start spins. Please retry." });
    }
  };

  useEffect(() => {
    fetchStart();
  }, []);

  const spin = async () => {
    setNotice(null);
    setLoading(true);
    try {
      const res = await fetch("/api/spin/roll", { method: "POST" });
      const data = await res.json();
      if (!data.ok) {
        setNotice({ type: "error", message: data.error || "Spin unavailable." });
        if (data.activeOffer) {
          setActiveOffer(data.activeOffer);
        }
        if (data.cooldownUntil) {
          setCooldownUntil(new Date(data.cooldownUntil).toISOString());
        }
        return;
      }
      setOffer(data.offer);
      setActiveOffer(null);
      setAttemptsRemaining(data.attemptsRemaining ?? 0);
      setSlotsLeftToday(data.slotsLeftToday ?? 0);
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
      setNotice({ type: "success", message: "Offer locked for 5 minutes." });
    } catch {
      setNotice({ type: "error", message: "Unable to accept offer." });
    } finally {
      setLoading(false);
    }
  };

  const showCooldown = cooldownUntil && new Date(cooldownUntil).getTime() > Date.now();

  return (
    <div className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.25)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-black/50">
            Founders Slot
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-prussian">
            Spin to unlock your invite
          </h2>
          <p className="mt-2 text-sm text-black/70">
            Two attempts every 24 hours. Accept to lock your price for five minutes.
          </p>
        </div>
        <div className="text-right text-xs text-black/60">
          <p className="uppercase tracking-[0.3em] text-black/40">Attempts</p>
          <p className="mt-1 font-semibold text-prussian">{attemptsLabel}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-black/10 bg-white/80 p-5 shadow-[0_10px_30px_-24px_rgba(0,0,0,0.18)]">
          {useScratch ? (
            <ScratchCard onReveal={spin} />
          ) : (
            <SpinWheel rotation={rotation} disabled={loading || showCooldown} />
          )}
          {notice ? (
            <div
              className="mt-4 rounded-xl border border-black/10 px-4 py-3 text-sm"
              style={{
                backgroundColor:
                  notice.type === "error"
                    ? "#FEF2F2"
                    : notice.type === "success"
                      ? "#F0FDF4"
                      : "#EFF6FF",
                color:
                  notice.type === "error"
                    ? "#DC2626"
                    : notice.type === "success"
                      ? "#16A34A"
                      : "#2563EB",
              }}
            >
              {notice.message}
            </div>
          ) : null}
          {showCooldown ? (
            <div className="mt-4 rounded-xl border border-black/10 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Cooldown active. Spins reopen{" "}
              {cooldownUntil ? new Date(cooldownUntil).toLocaleString() : "soon"}.
            </div>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={spin}
              disabled={
                loading ||
                showCooldown ||
                attemptsRemaining <= 0 ||
                slotsLeftToday <= 0 ||
                Boolean(activeOffer)
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-prussian px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-prussian/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              Spin now
            </button>
            {slotsLeftToday <= 0 ? (
              <span className="text-xs text-black/60">
                Slots are filled for today. Try again tomorrow.
              </span>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white/80 p-5 shadow-[0_10px_30px_-24px_rgba(0,0,0,0.18)]">
          {!offer && !activeOffer ? (
            <div className="flex h-full flex-col justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-black/50">
                  Spin result
                </p>
                <p className="mt-3 text-sm text-black/70">
                  Spin the wheel to reveal your founders offer. You can accept or
                  spin again if you still have a chance left.
                </p>
              </div>
              <div className="rounded-xl border border-black/10 bg-white px-4 py-3 text-xs text-black/60">
                Anchor price: <span className="font-semibold text-prussian">₹49,999</span>
              </div>
            </div>
          ) : null}

          {offer ? (
            <div className="flex h-full flex-col gap-4">
              <div className="rounded-2xl border border-black/10 bg-white px-4 py-4">
                <p className="text-xs uppercase tracking-[0.3em] text-black/50">
                  Your offer
                </p>
                <h3 className="mt-2 text-xl font-semibold text-prussian">
                  {offer.prizeLabel}
                </h3>
                <p className="mt-2 text-sm text-black/70">
                  Lock this founders price now. Offer expires if not accepted.
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
              </div>
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={acceptOffer}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-prussian px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-prussian/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                  Accept offer
                </button>
                {attemptsRemaining > 0 ? (
                  <button
                    type="button"
                    onClick={spin}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-prussian shadow-[0_6px_18px_-12px_rgba(0,0,0,0.25)] transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Spin again ({attemptsRemaining} left)
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
                    Offer locked
                  </p>
                  <CountdownBadge
                    expiresAt={activeOffer.expiresAt}
                    onExpire={() => fetchStart()}
                  />
                </div>
                <h3 className="mt-2 text-xl font-semibold text-prussian">
                  {activeOffer.prizeLabel}
                </h3>
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
                  onError={(message) => setNotice({ type: "error", message })}
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
