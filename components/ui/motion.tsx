// components/ui/motion.ts
"use client";
import { Variants, motion as fmMotion } from "framer-motion";

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export const stagger = (delay = 0.1): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: delay } },
});

/** Wrapper that triggers once when visible */
export function MotionSection({
  className = "",
  amount = 0.3,
  children,
}: {
  className?: string;
  amount?: number;
  children: React.ReactNode;
}) {
  return (
    <fmMotion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={stagger(0.05)}
    >
      {children}
    </fmMotion.div>
  );
}

// Re-export framer-motion's motion as `motion`
export const motion = fmMotion;