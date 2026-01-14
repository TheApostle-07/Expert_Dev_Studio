"use client";

import { useState } from "react";

type OnboardingFormProps = {
  leadId: string;
};

export default function OnboardingForm({ leadId }: OnboardingFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [goals, setGoals] = useState("");
  const [timeline, setTimeline] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus("idle");
    setMessage(null);
    try {
      const res = await fetch("/api/onboarding/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          name,
          email,
          phone,
          company,
          website,
          goals,
          timeline,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setStatus("error");
        setMessage(data.error || "Submission failed.");
        return;
      }
      setStatus("success");
      setMessage("Details received. Our client success team will reach out soon.");
    } catch {
      setStatus("error");
      setMessage("Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-black/10 bg-white/90 p-6 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.25)]"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-black/50">
            Onboarding
          </p>
          <h3 className="mt-2 text-lg font-semibold text-prussian">
            Tell us about your project
          </h3>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-black/50">
            Full name
          </label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 focus:outline-none focus:ring-2 focus:ring-cerulean/30"
            placeholder="Your name"
            required
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-black/50">
            Work email
          </label>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 focus:outline-none focus:ring-2 focus:ring-cerulean/30"
            placeholder="name@company.com"
            required
            type="email"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-black/50">
            Phone
          </label>
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 focus:outline-none focus:ring-2 focus:ring-cerulean/30"
            placeholder="+91"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-black/50">
            Company
          </label>
          <input
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 focus:outline-none focus:ring-2 focus:ring-cerulean/30"
            placeholder="Brand name"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-black/50">
            Website
          </label>
          <input
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 focus:outline-none focus:ring-2 focus:ring-cerulean/30"
            placeholder="https://"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-black/50">
            Timeline
          </label>
          <input
            value={timeline}
            onChange={(event) => setTimeline(event.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 focus:outline-none focus:ring-2 focus:ring-cerulean/30"
            placeholder="Launch target"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="text-xs uppercase tracking-[0.2em] text-black/50">
          Goals
        </label>
        <textarea
          value={goals}
          onChange={(event) => setGoals(event.target.value)}
          className="mt-2 min-h-[120px] w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 focus:outline-none focus:ring-2 focus:ring-cerulean/30"
          placeholder="Share what success looks like."
        />
      </div>

      {message ? (
        <p
          className="mt-4 rounded-xl border border-black/10 px-4 py-3 text-sm"
          style={{
            backgroundColor: status === "success" ? "#F0FDF4" : "#FEF2F2",
            color: status === "success" ? "#16A34A" : "#DC2626",
          }}
        >
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-prussian px-6 py-3 text-sm font-semibold text-white transition hover:bg-prussian/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Submitting..." : "Submit onboarding"}
      </button>
    </form>
  );
}
