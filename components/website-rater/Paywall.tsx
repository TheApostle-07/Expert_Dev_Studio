"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AlertTriangle, BadgeCheck, CheckCircle2, Lock, Ticket, UserRound } from "lucide-react";

type PaywallProps = {
  auditId: string;
  basePriceInr: number;
  finalPriceInr?: number | null;
  isUnlocked: boolean;
  paidAt?: string | null;
  leadName?: string | null;
  leadEmail?: string | null;
  leadPhone?: string | null;
  leadConsentAt?: string | null;
  inlineLeadForm?: boolean;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (payload: unknown) => void) => void;
    };
  }
}

export default function Paywall({
  auditId,
  basePriceInr,
  finalPriceInr,
  isUnlocked,
  paidAt,
  leadName,
  leadEmail,
  leadPhone,
  leadConsentAt,
  inlineLeadForm = false,
}: PaywallProps) {
  const router = useRouter();
  const [couponCode, setCouponCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [leadMessage, setLeadMessage] = useState<string | null>(null);
  const [leadStatus, setLeadStatus] = useState<"idle" | "error" | "success">("idle");
  const [loading, setLoading] = useState(false);
  const [priceInr, setPriceInr] = useState(finalPriceInr ?? basePriceInr);
  const [scriptReady, setScriptReady] = useState(false);
  const [unlocked, setUnlocked] = useState(isUnlocked);
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(Boolean(paidAt));
  const [modalPrompted, setModalPrompted] = useState(false);
  const [name, setName] = useState(leadName ?? "");
  const [email, setEmail] = useState(leadEmail ?? "");
  const [phone, setPhone] = useState(leadPhone ?? "");
  const [consent, setConsent] = useState(Boolean(leadConsentAt));
  const [paymentFeedback, setPaymentFeedback] = useState<{
    status: "error" | "info";
    message: string;
  } | null>(null);
  const [leadSaved, setLeadSaved] = useState(
    Boolean(leadName && leadEmail && leadConsentAt)
  );

  const discounted = priceInr < basePriceInr;
  const needsDetails = (paymentComplete || priceInr === 0) && !leadSaved;
  const showSuccessStep = (paymentComplete || priceInr === 0) && !leadSaved;
  const paidAmountInr = paymentComplete ? priceInr : priceInr;

  useEffect(() => {
    setMounted(true);
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

  useEffect(() => {
    setPriceInr(finalPriceInr ?? basePriceInr);
    setUnlocked(isUnlocked);
  }, [finalPriceInr, basePriceInr, isUnlocked]);

  useEffect(() => {
    setName(leadName ?? "");
    setEmail(leadEmail ?? "");
    setPhone(leadPhone ?? "");
    setConsent(Boolean(leadConsentAt));
    setLeadSaved(Boolean(leadName && leadEmail && leadConsentAt));
  }, [leadName, leadEmail, leadPhone, leadConsentAt]);

  useEffect(() => {
    setPaymentComplete(Boolean(paidAt));
  }, [paidAt]);

  useEffect(() => {
    if (paymentComplete) {
      setPaymentFeedback(null);
    }
    if (paymentComplete && !leadSaved && !modalPrompted) {
      if (inlineLeadForm) {
        setModalPrompted(true);
      } else {
        setShowLeadModal(true);
        setModalPrompted(true);
      }
    }
  }, [paymentComplete, leadSaved, modalPrompted]);

  const handleLeadChange = () => {
    if (leadSaved) {
      setLeadSaved(false);
    }
  };

  const openLeadForm = () => {
    if (inlineLeadForm) {
      if (!showSuccessStep) {
        setShowLeadModal(true);
      }
      setModalPrompted(true);
      return;
    }
    setShowLeadModal(true);
    setModalPrompted(true);
  };

  const saveLead = async (autoContinue: boolean) => {
    setLeadMessage(null);
    setLeadStatus("idle");
    if (!name.trim() || !email.trim()) {
      setLeadMessage("Please add your name and email.");
      setLeadStatus("error");
      return;
    }
    if (!consent) {
      setLeadMessage("Please confirm you want to receive the report.");
      setLeadStatus("error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/website-rater/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditId,
          name,
          email,
          phone,
          consent,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setLeadMessage(data.error || "Failed to save details.");
        setLeadStatus("error");
        return;
      }
      setLeadSaved(true);
      setLeadMessage("Details saved. You can unlock the full report now.");
      setLeadStatus("success");
      if (data.unlocked) {
        setUnlocked(true);
        router.refresh();
      }
      if (autoContinue) {
        if (priceInr > 0 && !paymentComplete) {
          setLeadMessage("Payment is required before unlocking.");
          setLeadStatus("error");
          return;
        }
        setShowLeadModal(false);
        router.refresh();
      }
    } catch {
      setLeadMessage("Failed to save details.");
      setLeadStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setMessage("Enter a coupon code.");
      return;
    }
    setLoading(true);
    setMessage(null);
    setPaymentFeedback(null);
    try {
      const res = await fetch("/api/website-rater/apply-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditId, couponCode }),
      });
      const data = await res.json();
      if (!data.ok) {
        setMessage(data.error || "Failed to apply coupon.");
        return;
      }
      setPriceInr(data.quotedPriceInr ?? priceInr);
      setCouponApplied(true);
      setMessage(data.message || "Coupon applied.");
      if (data.unlocked) {
        setUnlocked(true);
        router.refresh();
      }
    } catch {
      setMessage("Failed to apply coupon.");
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    const res = await fetch("/api/website-rater/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auditId, ...response }),
    });
    const data = await res.json();
    if (data.ok) {
      setMessage("Payment received. Add your details to unlock the full report.");
      setPaymentComplete(true);
      setPaymentFeedback(null);
      if (!leadSaved) {
        openLeadForm();
      } else {
        router.refresh();
      }
    } else {
      setPaymentFeedback({
        status: "error",
        message: data.error || "Payment verification failed. Please try again.",
      });
    }
  };

  const startCheckout = async () => {
    setLoading(true);
    setMessage(null);
    setPaymentFeedback(null);
    try {
      const res = await fetch("/api/website-rater/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditId }),
      });
      const data = await res.json();
      if (!data.ok) {
        setPaymentFeedback({
          status: "error",
          message: data.error || "Unable to start payment. Please try again.",
        });
        return;
      }
      if (data.alreadyUnlocked) {
        setUnlocked(true);
        router.refresh();
        return;
      }
      if (!scriptReady || !window.Razorpay) {
        setPaymentFeedback({
          status: "error",
          message: "Payment SDK is still loading. Please try again.",
        });
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amountPaise,
        currency: "INR",
        name: "Expert Dev Studio",
        description: "Website Rater Full Report",
        order_id: data.orderId,
        handler: (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          void verifyPayment(response);
        },
        modal: {
          ondismiss: () => {
            setPaymentFeedback({
              status: "info",
              message: "Payment not completed. You can try again anytime.",
            });
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (payload: { error?: { description?: string } }) => {
        setPaymentFeedback({
          status: "error",
          message: payload?.error?.description || "Payment failed. Please try again.",
        });
      });
      razorpay.open();
    } catch {
      setPaymentFeedback({
        status: "error",
        message: "Failed to start checkout. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    if (priceInr === 0 && !leadSaved) {
      openLeadForm();
      return;
    }
    if (paymentComplete && !leadSaved) {
      openLeadForm();
      return;
    }
    if (paymentComplete && leadSaved) {
      router.refresh();
      return;
    }
    await startCheckout();
  };

  const leadForm = (options?: { showClose?: boolean; showSecondary?: boolean }) => (
    <div className="w-full rounded-2xl border border-black/10 bg-white p-6 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.35)]">
      <div className="relative text-center">
        <div>
          <h4 className="text-lg font-semibold text-prussian">Send me the report</h4>
          <p className="mt-1 text-sm text-black/60">
            We will email your full report and receipt.
          </p>
        </div>
        {options?.showClose !== false ? (
          <button
            type="button"
            onClick={() => setShowLeadModal(false)}
            className="absolute right-0 top-0 text-sm text-[#64748B] hover:text-black/70"
          >
            Close
          </button>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3">
        <input
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            handleLeadChange();
          }}
          placeholder="Full name"
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-cerulean/30"
        />
        <input
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            handleLeadChange();
          }}
          placeholder="Work email"
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-cerulean/30"
        />
        <input
          value={phone}
          onChange={(event) => {
            setPhone(event.target.value);
            handleLeadChange();
          }}
          placeholder="Phone (optional)"
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-cerulean/30"
        />
        <label className="flex w-full items-center justify-center gap-2 text-xs text-black/60">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => {
              setConsent(event.target.checked);
              handleLeadChange();
            }}
            className="h-4 w-4 rounded border-black/20 text-cerulean focus:ring-cerulean/30"
          />
          <span className="text-center">
            Send me the report and updates. See the{" "}
            <Link href="/privacy" className="text-prussian underline-offset-4 hover:underline">
              privacy policy
            </Link>
            .
          </span>
        </label>
      </div>

      {leadMessage ? (
        <p
          className={`mt-3 text-center text-xs ${
            leadStatus === "success" ? "text-[#16A34A]" : "text-[#DC2626]"
          }`}
        >
          {leadMessage}
        </p>
      ) : null}

      <div className="mt-5 grid gap-2">
        <button
          type="button"
          onClick={() => void saveLead(true)}
          disabled={loading}
          className="w-full rounded-xl bg-prussian px-4 py-2 text-sm font-semibold text-white transition hover:bg-prussian/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Save & continue
        </button>
        {options?.showSecondary !== false ? (
          <button
            type="button"
            onClick={() => void saveLead(false)}
            disabled={loading}
            className="w-full rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold text-prussian transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Save for later
          </button>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-black/10 bg-white/95 p-6 text-black shadow-[0_18px_46px_-30px_rgba(0,0,0,0.25)]">
      {!showSuccessStep ? (
        <>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-white"
                style={{
                  backgroundColor: "#003459",
                  boxShadow: "0 0 28px rgba(0,52,89,0.45)",
                }}
              >
                <Lock className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-prussian">Unlock full report</h3>
                <p className="mt-1 text-sm text-black/70">
                  Get the complete audit breakdown, prioritized fixes, and conversion
                  opportunities.
                </p>
              </div>
            </div>
            {unlocked ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#16A34A]/10 px-2.5 py-1 text-xs font-semibold text-[#16A34A]">
                <BadgeCheck className="h-4 w-4" aria-hidden />
                Unlocked
              </span>
            ) : null}
          </div>

          <div className="mt-6 grid gap-4 rounded-xl border border-black/10 bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-black/50">Price</span>
              <div className="text-right">
                {discounted ? (
                  <div className="text-xs text-black/40 line-through">₹{basePriceInr}</div>
                ) : null}
                <div
                  className={`text-2xl font-semibold ${
                    discounted ? "text-[#16A34A]" : "text-prussian"
                  }`}
                >
                  ₹{priceInr}
                </div>
              </div>
            </div>
            {discounted ? (
              <p className="text-xs text-[#16A34A]">Coupon applied successfully.</p>
            ) : null}
          </div>
        </>
      ) : null}

      {paymentFeedback && !showSuccessStep ? (
        <div
          className="mt-4 rounded-xl border px-4 py-3 text-sm"
          style={{
            borderColor: paymentFeedback.status === "error" ? "#DC2626" : "#F59E0B",
            backgroundColor: paymentFeedback.status === "error" ? "#FEF2F2" : "#FFFBEB",
            color: paymentFeedback.status === "error" ? "#991B1B" : "#92400E",
          }}
        >
          <div className="flex items-start gap-2">
            <AlertTriangle
              className="mt-0.5 h-4 w-4"
              style={{
                color: paymentFeedback.status === "error" ? "#DC2626" : "#F59E0B",
              }}
              aria-hidden
            />
            <span>{paymentFeedback.message}</span>
          </div>
        </div>
      ) : null}

      {showSuccessStep ? (
        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-[#16A34A]/20 bg-[#F0FDF4] p-4 text-sm text-[#166534]">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#16A34A]/15 text-[#16A34A]">
                <CheckCircle2 className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#16A34A]">
                  Payment received
                </p>
                <p className="mt-1 text-base font-semibold text-[#166534]">
                  ₹{paidAmountInr} paid successfully
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs text-[#166534]/80">
              Add your details below to unlock the full report.
            </p>
          </div>
          {leadForm({ showClose: false, showSecondary: false })}
        </div>
      ) : null}

      {!showSuccessStep ? (
        <button
          type="button"
          onClick={handleUnlock}
          disabled={loading || unlocked}
          className="mt-4 w-full rounded-xl bg-prussian px-4 py-3 text-sm font-semibold text-white transition hover:bg-prussian/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {unlocked
            ? "Report unlocked"
            : needsDetails
              ? "Add details to unlock"
              : `Unlock full report — ₹${priceInr}`}
        </button>
      ) : null}

      {!showSuccessStep ? (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowCoupon((prev) => !prev)}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-black/50"
          >
            <Ticket className="h-4 w-4 text-prussian/60" aria-hidden />
            {showCoupon ? "Hide coupon" : "Have a coupon?"}
          </button>
          {showCoupon ? (
            <div className="mt-3">
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value)}
                  placeholder="Enter coupon code"
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-cerulean/30"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={loading}
                  className="rounded-lg border border-black/10 px-4 py-2 text-sm font-semibold text-prussian transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Apply
                </button>
              </div>
              {couponApplied ? (
                <p className="mt-2 text-xs text-black/60">Coupon applied.</p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {message && !paymentComplete ? (
        <p className="mt-3 text-xs text-black/60">{message}</p>
      ) : null}

      {mounted && showLeadModal
        ? inlineLeadForm
          ? showSuccessStep
            ? null
            : <div className="mt-6">{leadForm({ showClose: true, showSecondary: true })}</div>
          : createPortal(
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
                <div className="w-full max-w-md">
                  {leadForm({ showClose: true, showSecondary: true })}
                </div>
              </div>,
              document.body
            )
        : null}
    </div>
  );
}
