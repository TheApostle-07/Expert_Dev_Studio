"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import type { Testimonial } from "../../content/testimonials";

export default function ProofDialog({
  testimonials,
  proofAssets,
}: {
  testimonials: Testimonial[];
  proofAssets: { title: string; description: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-5 py-2 text-xs font-semibold text-prussian shadow-[0_10px_26px_-20px_rgba(0,0,0,0.25)] hover:bg-black/5"
      >
        See more proof
      </button>
      {open ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-6">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="lcos-proof-title"
            className="relative z-[121] w-full max-w-3xl rounded-3xl border border-black/10 bg-white p-6 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.35)]"
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-black/50">Proof</p>
                <h3 id="lcos-proof-title" className="mt-2 text-xl font-semibold text-prussian">
                  Testimonials & assets
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-black/10 px-4 py-1 text-xs text-black/60 hover:bg-black/5"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 text-center">
              {testimonials.map((item) => (
                <div
                  key={`${item.name}-${item.city}`}
                  className="rounded-2xl border border-black/10 bg-white px-4 py-4"
                >
                  <div className="mb-3 flex justify-center gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                    ))}
                  </div>
                  <p className="text-sm text-black/70">“{item.quote}”</p>
                  <div className="mt-3 text-xs text-black/60">
                    <span className="font-semibold text-prussian">{item.name}</span> · {item.role} · {item.city}
                  </div>
                  <span className="mt-2 inline-flex rounded-full bg-cerulean/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-cerulean">
                    Verified
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3 text-center">
              {proofAssets.map((asset) => (
                <div
                  key={asset.title}
                  className="rounded-2xl border border-dashed border-black/10 bg-black/5 px-4 py-4 text-xs text-black/60"
                >
                  <p className="text-sm font-semibold text-prussian">{asset.title}</p>
                  <p className="mt-2">{asset.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
