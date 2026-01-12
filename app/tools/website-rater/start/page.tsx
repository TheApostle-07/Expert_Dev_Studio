"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function WebsiteRaterStart() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a website URL.");
      return;
    }
    if (/\s/.test(trimmed)) {
      setError("URLs cannot contain spaces.");
      return;
    }
    if (!trimmed.includes(".")) {
      setError("Please enter a valid website address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/website-rater/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "Failed to scan URL.");
        return;
      }

      router.push(`/tools/website-rater/report/${data.auditId}`);
    } catch {
      setError("Failed to scan URL.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-black">
      <div className="page-shell pb-16 pt-24 sm:pt-28 md:pt-32">
        <Link href="/tools/website-rater" className="reveal text-sm text-black/60">
          ← Back to Website Rater
        </Link>
        <div className="mt-8 flex min-h-[calc(100vh-260px)] items-center justify-center">
          <div className="w-full max-w-2xl">
            <div className="reveal rounded-3xl border border-black/10 bg-white/85 p-8 text-center shadow-[0_20px_60px_-40px_rgba(0,0,0,0.35)] backdrop-blur">
              <p className="text-xs uppercase tracking-[0.4em] text-black/45">
                Website Rater
              </p>
              <h1 className="mt-4 text-3xl font-semibold text-prussian md:text-4xl">
                Paste your homepage URL
              </h1>
              <p className="mt-3 text-black/70">
                We scan SEO, funnel clarity, copy strength, and speed signals in minutes.
              </p>
              <form
                onSubmit={handleSubmit}
                className="mt-6 grid gap-3 text-left sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <input
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://yourdomain.com"
                  inputMode="url"
                  autoComplete="url"
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-cerulean/30"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-prussian px-5 py-3 text-sm font-semibold text-white transition hover:bg-prussian/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {loading ? "Scanning..." : "Run quick scan"}
                </button>
              </form>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-black/55">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
                  Secure HTTPS only
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#2563EB]" />
                  Fast on-page scan
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
                  Actionable report
                </span>
              </div>
              {error ? (
                <p className="mt-4 text-sm text-red-600">{error}</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
