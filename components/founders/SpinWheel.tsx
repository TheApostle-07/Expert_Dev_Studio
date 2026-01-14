"use client";

import { motion } from "../ui/motion";
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

  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute -top-3 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 rounded-sm bg-white shadow-[0_6px_12px_-8px_rgba(0,0,0,0.4)]" />
      <motion.div
        animate={{ rotate: rotation }}
        transition={{ duration: 2.8, ease: [0.2, 0.8, 0.2, 1] }}
        className={`h-64 w-64 rounded-full border border-black/10 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.4)] ${
          disabled ? "opacity-70" : ""
        }`}
        style={{
          background: `conic-gradient(${gradientStops})`,
        }}
      >
        <div className="flex h-full w-full items-center justify-center rounded-full border-[12px] border-white/70 bg-white/80 text-center text-xs font-semibold text-white/80">
          <div className="rounded-full bg-white px-3 py-2 text-[10px] uppercase tracking-[0.35em] text-prussian shadow-sm">
            Founder
          </div>
        </div>
      </motion.div>
      <div className="absolute bottom-6 text-[11px] uppercase tracking-[0.28em] text-black/45">
        Spin to reveal
      </div>
    </div>
  );
}
