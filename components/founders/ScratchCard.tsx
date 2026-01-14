"use client";

import { useState } from "react";

export default function ScratchCard({
  onReveal,
}: {
  onReveal?: () => void;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-white/90 p-6 text-center shadow-[0_14px_32px_-24px_rgba(0,0,0,0.2)]">
      <p className="text-xs uppercase tracking-[0.3em] text-black/50">Scratch Card</p>
      <p className="mt-2 text-sm text-black/70">
        Reveal your founder invite with a single scratch.
      </p>
      <div className="mt-5 rounded-2xl border border-dashed border-black/10 bg-prussian/5 px-6 py-8 text-sm font-semibold text-prussian">
        {revealed ? "Invite unlocked" : "Scratch to reveal"}
      </div>
      <button
        type="button"
        className="mt-5 inline-flex items-center justify-center rounded-xl bg-prussian px-6 py-3 text-sm font-semibold text-white transition hover:bg-prussian/90"
        onClick={() => {
          setRevealed(true);
          onReveal?.();
        }}
      >
        {revealed ? "Revealed" : "Reveal now"}
      </button>
    </div>
  );
}
