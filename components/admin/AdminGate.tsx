"use client";

import { useState } from "react";

export default function AdminGate({ redirectTo }: { redirectTo: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "Invalid password");
        setLoading(false);
        return;
      }
      window.location.href = redirectTo;
    } catch {
      setError("Unable to verify. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-24 max-w-md rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_18px_40px_-30px_rgba(0,0,0,0.3)]">
      <p className="text-xs uppercase tracking-[0.3em] text-black/50">Admin Gate</p>
      <h1 className="mt-3 text-2xl font-semibold text-prussian">Enter password</h1>
      <p className="mt-2 text-sm text-black/60">
        This area is restricted. Enter the admin password to continue.
      </p>
      <div className="mt-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cerulean/40"
          placeholder="Admin password"
        />
      </div>
      {error ? (
        <div className="mt-3 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      ) : null}
      <button
        type="button"
        onClick={submit}
        disabled={loading || !password}
        className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-prussian px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-prussian/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Checking..." : "Unlock admin"}
      </button>
    </div>
  );
}
