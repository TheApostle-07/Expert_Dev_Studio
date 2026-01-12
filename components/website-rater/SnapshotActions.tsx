"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SnapshotActions({
  auditId,
  snapshotSavedAt,
}: {
  auditId: string;
  snapshotSavedAt?: string | null;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/website-rater/snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditId }),
      });
      const data = await res.json();
      if (!data.ok) {
        setMessage(data.error || "Failed to save snapshot.");
        return;
      }
      setMessage("Snapshot saved.");
      router.refresh();
    } catch {
      setMessage("Failed to save snapshot.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-2">
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold text-prussian transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {snapshotSavedAt ? "Update snapshot" : "Save snapshot"}
      </button>
      {snapshotSavedAt ? (
        <p className="text-xs text-black/50">Saved {new Date(snapshotSavedAt).toLocaleString()}</p>
      ) : null}
      {message ? <p className="text-xs text-black/60">{message}</p> : null}
    </div>
  );
}
