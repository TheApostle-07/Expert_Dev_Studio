"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Lock } from "lucide-react";
import Paywall from "./Paywall";

type PaywallModalProps = {
  auditId: string;
  basePriceInr: number;
  finalPriceInr?: number | null;
  isUnlocked: boolean;
  paidAt?: string | null;
  leadName?: string | null;
  leadEmail?: string | null;
  leadPhone?: string | null;
  leadConsentAt?: string | null;
};

export default function PaywallModal({
  auditId,
  basePriceInr,
  finalPriceInr,
  isUnlocked,
  paidAt,
  leadName,
  leadEmail,
  leadPhone,
  leadConsentAt,
}: PaywallModalProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const priceInr = finalPriceInr ?? basePriceInr;

  useEffect(() => {
    setMounted(true);
    const handler = () => setOpen(true);
    window.addEventListener("open-paywall-modal", handler);
    return () => window.removeEventListener("open-paywall-modal", handler);
  }, []);

  return (
    <>
      <div className="rounded-2xl border border-black/10 bg-white/95 p-6 text-black shadow-[0_18px_46px_-30px_rgba(0,0,0,0.25)]">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-prussian text-white shadow-[0_10px_30px_-20px_rgba(0,52,89,0.45)]">
            <Lock className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-black/50">
              Unlock full report
            </p>
            <p className="mt-1 text-sm text-black/70">
              Get the complete audit breakdown, prioritized fixes, and conversion
              opportunities.
            </p>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-3">
          <span className="text-xs uppercase tracking-[0.2em] text-black/50">Price</span>
          <span className="text-2xl font-semibold text-prussian">₹{priceInr}</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={isUnlocked}
          className="mt-4 w-full rounded-xl bg-prussian px-4 py-3 text-sm font-semibold text-white transition hover:bg-prussian/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUnlocked ? "Report unlocked" : `Unlock full report — ₹${priceInr}`}
        </button>
      </div>

      {mounted && open
        ? createPortal(
            <div
              className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4 animate-fade-in"
              onClick={() => setOpen(false)}
            >
              <div
                className="w-full max-w-xl animate-fade-in"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="mb-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-white/30 bg-white/80 px-3 py-1 text-xs font-semibold text-prussian shadow-sm"
                  >
                    Close
                  </button>
                </div>
                <Paywall
                  auditId={auditId}
                  basePriceInr={basePriceInr}
                  finalPriceInr={finalPriceInr}
                  isUnlocked={isUnlocked}
                  paidAt={paidAt}
                  leadName={leadName}
                  leadEmail={leadEmail}
                  leadPhone={leadPhone}
                  leadConsentAt={leadConsentAt}
                  inlineLeadForm
                />
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
