"use client";

import { motion } from "framer-motion";
import { PRIZES } from "../../lib/founders/prizes";

const SEGMENT_COLORS = ["#007EA7", "#0F6A86", "#FCA311", "#003459", "#0A6F95"];

export default function SpinWheel({
  rotation,
  disabled,
}: {
  rotation: number;
  disabled?: boolean;
}) {
  const segments = PRIZES.length;
  const gradientStops = PRIZES.map((_, index) => {
    const color = SEGMENT_COLORS[index % SEGMENT_COLORS.length];
    const start = Math.round((index / segments) * 100);
    const end = Math.round(((index + 1) / segments) * 100);
    return `${color} ${start}% ${end}%`;
  }).join(", ");
  const pocketLines =
    "repeating-conic-gradient(from 0deg, rgba(255,255,255,0.55) 0deg 1.2deg, rgba(255,255,255,0) 1.2deg 12deg)";

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="pointer-events-none absolute -top-5 left-1/2 z-20 -translate-x-1/2">
        <div className="relative h-7 w-7">
          <div className="absolute inset-0 rotate-45 rounded-sm border border-black/10 bg-white shadow-[0_10px_24px_-12px_rgba(0,0,0,0.45)]" />
          <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_0_4px_rgba(252,163,17,0.25)]" />
        </div>
      </div>

      <div className="relative h-72 w-72">
        <div className="absolute inset-0 rounded-full bg-white/70 shadow-[0_24px_60px_-35px_rgba(0,0,0,0.45)] ring-1 ring-black/10" />
        <div className="absolute inset-[10px] rounded-full bg-white/60 ring-1 ring-black/10 shadow-[inset_0_10px_24px_-18px_rgba(0,0,0,0.35)]" />
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: 2.8, ease: [0.2, 0.8, 0.2, 1] }}
          className={`absolute inset-[14px] rounded-full border border-white/70 shadow-[inset_0_0_0_6px_rgba(255,255,255,0.6)] ${
            disabled ? "opacity-70" : ""
          }`}
          style={{
            backgroundImage: `${pocketLines}, conic-gradient(${gradientStops})`,
          }}
        >
          <div className="absolute inset-5 rounded-full bg-white/85 ring-1 ring-black/10 shadow-[inset_0_10px_24px_-18px_rgba(0,0,0,0.35)]" />
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-white/90 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-prussian shadow-sm ring-1 ring-black/5 text-center">
            Founder
          </div>
        </div>
      </div>

      <div className="mt-3 text-[11px] uppercase tracking-[0.22em] text-black/45">
        Spin to reveal
      </div>
    </div>
  );
}
