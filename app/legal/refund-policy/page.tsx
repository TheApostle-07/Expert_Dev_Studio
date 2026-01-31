export const metadata = {
  title: "Refund Policy · ExpertDevStudio",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-transparent text-black">
      <div className="page-shell pb-16 pt-24 sm:pt-28 md:pt-32">
        <div className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.25)]">
          <p className="text-xs uppercase tracking-[0.3em] text-black/50">Legal</p>
          <h1 className="mt-2 text-2xl font-semibold text-prussian">Refund policy</h1>
          <div className="mt-4 space-y-3 text-sm text-black/70">
            <p>
              The ₹999 start fee reserves your slot and begins production. Once work begins,
              the start fee is non-refundable.
            </p>
            <p>
              If ExpertDevStudio misses the 48-hour delivery window after intake submission,
              the ₹999 start fee is fully refunded.
            </p>
            <p>
              One reschedule is permitted with at least 12 hours’ notice. Additional reschedules
              are subject to slot availability.
            </p>
            <p>
              No guaranteed leads are promised. We guarantee a conversion-focused structure and
              delivery within the sprint window.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
