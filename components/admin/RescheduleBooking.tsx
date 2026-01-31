"use client";

import { useEffect, useState } from "react";

type Slot = { id: string; startTime: string };

export default function RescheduleBooking({ bookingId }: { bookingId: string }) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selected, setSelected] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/sprint/slots")
      .then((res) => res.json())
      .then((data) => setSlots(data.slots || []))
      .catch(() => setSlots([]));
  }, []);

  const reschedule = async () => {
    if (!selected) return;
    setLoading(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/sprint-bookings/${bookingId}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: selected }),
      });
      const data = await res.json();
      if (!data.ok) {
        setNotice(data.error || "Unable to reschedule.");
        return;
      }
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 rounded-2xl border border-black/10 bg-white px-4 py-4 text-sm text-black/70">
      <p className="text-xs uppercase tracking-[0.3em] text-black/50">Reschedule</p>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-xs"
      >
        <option value="">Select slot</option>
        {slots.map((slot) => (
          <option key={slot.id} value={slot.id}>
            {new Intl.DateTimeFormat("en-IN", {
              timeZone: "Asia/Kolkata",
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(slot.startTime))}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={reschedule}
        disabled={!selected || loading}
        className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-prussian shadow-sm transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Reschedule slot
      </button>
      {notice ? (
        <div className="mt-2 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {notice}
        </div>
      ) : null}
    </div>
  );
}
