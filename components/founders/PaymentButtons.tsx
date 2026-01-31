"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ArrowUpRight, Lock, RotateCw, ShieldCheck } from "lucide-react";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (payload: unknown) => void) => void;
    };
  }
}

type PaymentButtonsProps = {
  leadId: string;
  priceInr: number;
  expiresAt: string;
  onError?: (message: string) => void;
};

export default function PaymentButtons({
  leadId,
  priceInr,
  expiresAt,
  onError,
}: PaymentButtonsProps) {
  const [scriptReady, setScriptReady] = useState(false);
  const [loadingOption, setLoadingOption] = useState<"FULL" | "DEPOSIT" | null>(
    null
  );
  const [lastOption, setLastOption] = useState<"FULL" | "DEPOSIT" | null>(null);
  const [status, setStatus] = useState<{ type: "error" | "info"; message: string } | null>(
    null
  );
  const attemptRef = useRef(0);
  const completedRef = useRef(false);

  const statusStyles = useMemo(() => {
    if (!status) return null;
    return status.type === "error"
      ? { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-100" }
      : { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100" };
  }, [status]);

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

  const ensureScript = async () => {
    if (window.Razorpay) {
      setScriptReady(true);
      return true;
    }
    return new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        setScriptReady(true);
        resolve(true);
      };
      script.onerror = () => {
        setScriptReady(false);
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const setStatusMessage = (type: "error" | "info", message: string) => {
    setStatus({ type, message });
    onError?.(message);
  };

  const startPayment = async (option: "FULL" | "DEPOSIT") => {
    if (new Date(expiresAt).getTime() <= Date.now()) {
      setStatusMessage("error", "Offer expired. Spin again to unlock a new invite.");
      return;
    }
    setLastOption(option);
    setLoadingOption(option);
    setStatus(null);
    const attemptId = ++attemptRef.current;
    completedRef.current = false;
    try {
      const res = await fetch("/api/pay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, paymentOption: option }),
      });
      const data = await res.json();
      if (!data.ok) {
        setStatusMessage("error", data.error || "Payment unavailable. Try again.");
        return;
      }
      if (data.alreadyPaid) {
        window.location.href = `/thank-you?lead=${leadId}`;
        return;
      }
      if (!scriptReady || !window.Razorpay) {
        const loaded = await ensureScript();
        if (!loaded || !window.Razorpay) {
          setStatusMessage("error", "Payment gateway unavailable. Refresh and try again.");
          return;
        }
      }
      const razorpay = new window.Razorpay({
        key: data.keyId,
        amount: data.amountPaise,
        currency: "INR",
        name: "Expert Dev Studio",
        description: "Founder Slot",
        order_id: data.orderId,
        handler: () => {
          if (attemptId !== attemptRef.current) return;
          completedRef.current = true;
          window.location.href = `/thank-you?lead=${leadId}`;
        },
        modal: {
          ondismiss: () => {
            if (attemptId !== attemptRef.current || completedRef.current) return;
            setLoadingOption(null);
            setStatusMessage("info", "Payment window closed. You can retry anytime.");
          },
        },
        notes: { leadId, paymentOption: option },
      });
      razorpay.on("payment.failed", () => {
        if (attemptId !== attemptRef.current || completedRef.current) return;
        setLoadingOption(null);
        setStatusMessage("error", "Payment failed. Please try again.");
      });
      razorpay.open();
    } catch {
      setStatusMessage("error", "Payment failed. Please try again.");
    } finally {
      setLoadingOption(null);
    }
  };

  const retryPayment = () => {
    if (!lastOption) return;
    startPayment(lastOption);
  };

  return (
    <div className="grid gap-3">
      <button
        type="button"
        onClick={() => startPayment("FULL")}
        disabled={loadingOption !== null}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-prussian px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-prussian/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Lock className="h-4 w-4" aria-hidden />
        Pay full — ₹{priceInr.toLocaleString("en-IN")}
      </button>
      <button
        type="button"
        onClick={() => startPayment("DEPOSIT")}
        disabled={loadingOption !== null}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-prussian shadow-[0_6px_18px_-12px_rgba(0,0,0,0.25)] transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Pay ₹9,999 to lock slot
      </button>
      <div className="flex flex-wrap items-center gap-2 text-xs text-black/60">
        <ShieldCheck className="h-4 w-4 text-cerulean" aria-hidden />
        Razorpay secured · GST invoice · 30-day support
      </div>
      {status && statusStyles ? (
        <div className={`rounded-xl border px-4 py-4 text-sm ${statusStyles.bg} ${statusStyles.border}`}>
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-[0_8px_20px_-14px_rgba(0,0,0,0.25)]">
              <AlertTriangle className={`h-4.5 w-4.5 ${statusStyles.text}`} aria-hidden />
            </span>
            <div>
              <p className={`font-semibold ${statusStyles.text}`}>{status.message}</p>
              <p className="mt-1 text-xs text-black/60">
                You can retry with the same payment option or return to spin for a new offer.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {lastOption ? (
              <button
                type="button"
                onClick={retryPayment}
                className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-prussian shadow-sm transition hover:bg-black/5"
              >
                <RotateCw className="h-3.5 w-3.5 text-cerulean" aria-hidden />
                Retry payment
              </button>
            ) : null}
            <a
              href="/founders#spin"
              className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-prussian shadow-sm transition hover:bg-black/5"
            >
              <ArrowUpRight className="h-3.5 w-3.5 text-cerulean" aria-hidden />
              Back to spin
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
