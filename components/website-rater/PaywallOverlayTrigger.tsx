"use client";

export default function PaywallOverlayTrigger({
  label = "Unlock to view full report",
}: {
  label?: string;
}) {
  return (
    <div
      className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-white/35"
      onClick={() => {
        window.dispatchEvent(new CustomEvent("open-paywall-modal"));
      }}
    >
      <button
        type="button"
        className="pointer-events-none rounded-full border border-black/10 bg-white/90 px-4 py-2 text-xs font-semibold text-prussian shadow-[0_12px_30px_-20px_rgba(0,0,0,0.25)]"
      >
        {label}
      </button>
    </div>
  );
}
