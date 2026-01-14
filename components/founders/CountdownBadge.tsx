"use client";

import { useEffect, useState } from "react";

function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function CountdownBadge({
  expiresAt,
  onExpire,
}: {
  expiresAt: string;
  onExpire?: () => void;
}) {
  const [remaining, setRemaining] = useState(() => {
    return new Date(expiresAt).getTime() - Date.now();
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const next = new Date(expiresAt).getTime() - Date.now();
      setRemaining(next);
      if (next <= 0) {
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  const danger = remaining <= 60 * 1000;

  return (
    <div
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
      style={{
        color: danger ? "#DC2626" : "#F59E0B",
        backgroundColor: danger ? "#FEF2F2" : "#FFFBEB",
      }}
    >
      Offer expires in {formatCountdown(remaining)}
    </div>
  );
}
