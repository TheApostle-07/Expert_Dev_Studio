"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ScanStatusWatcher({
  auditId,
  status,
}: {
  auditId: string;
  status: string;
}) {
  const router = useRouter();

  useEffect(() => {
    if (status === "DONE" || status === "FAILED") return;

    let active = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/website-rater/report/${auditId}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!active) return;
        if (data?.audit?.status === "DONE" || data?.audit?.status === "FAILED") {
          router.refresh();
        }
      } catch {
        // Ignore polling errors; next tick will retry.
      }
    }, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [auditId, status, router]);

  return null;
}
