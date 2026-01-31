"use client";

import { useState } from "react";

export default function SprintBookingActions({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const updateStatus = async (status: string) => {
    setLoading(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/sprint-bookings/${bookingId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!data.ok) {
        setNotice(data.error || "Unable to update status.");
        return;
      }
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  const refund = async () => {
    setLoading(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/sprint-bookings/${bookingId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Admin refund" }),
      });
      const data = await res.json();
      if (!data.ok) {
        setNotice(data.error || "Unable to refund.");
        return;
      }
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 grid gap-2">
      {["DRAFT_SENT", "CLIENT_APPROVED", "COMPLETED"].map((status) => (
        <button
          key={status}
          type="button"
          onClick={() => updateStatus(status)}
          disabled={loading}
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-prussian shadow-sm transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Mark {status.replace("_", " ")}
        </button>
      ))}
      <button
        type="button"
        onClick={refund}
        disabled={loading}
        className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-prussian shadow-sm transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Issue refund
      </button>
      {notice ? (
        <div className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {notice}
        </div>
      ) : null}
    </div>
  );
}
