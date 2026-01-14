"use client";

import { useEffect, useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";

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

  const startPayment = async (option: "FULL" | "DEPOSIT") => {
    if (new Date(expiresAt).getTime() <= Date.now()) {
      onError?.("Offer expired. Please spin again tomorrow.");
      return;
    }
    setLoadingOption(option);
    try {
      const res = await fetch("/api/pay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, paymentOption: option }),
      });
      const data = await res.json();
      if (!data.ok) {
        onError?.(data.error || "Payment unavailable. Try again.");
        return;
      }
      if (data.alreadyPaid) {
        window.location.href = `/thank-you?lead=${leadId}`;
        return;
      }
      if (!scriptReady || !window.Razorpay) {
        onError?.("Payment gateway unavailable. Refresh and try again.");
        return;
      }
      const razorpay = new window.Razorpay({
        key: data.keyId,
        amount: data.amountPaise,
        currency: "INR",
        name: "Expert Dev Studio",
        description: "Founder Slot",
        order_id: data.orderId,
        handler: () => {
          window.location.href = `/thank-you?lead=${leadId}`;
        },
        notes: { leadId, paymentOption: option },
      });
      razorpay.on("payment.failed", () => {
        onError?.("Payment failed. Please try again.");
      });
      razorpay.open();
    } catch {
      onError?.("Payment failed. Please try again.");
    } finally {
      setLoadingOption(null);
    }
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
    </div>
  );
}
