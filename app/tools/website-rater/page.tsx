import Link from "next/link";

export const metadata = {
  title: "Website Rater",
  description: "Instant conversion-focused website diagnostics.",
};

export default function WebsiteRaterLanding() {
  return (
    <div className="min-h-screen bg-transparent text-black">
      <div className="page-shell pb-16 pt-24 sm:pt-28 md:pt-32">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="reveal text-xs uppercase tracking-[0.4em] text-black/50">
              Tools · Website Rater
            </p>
            <h1 className="reveal reveal-delay-1 mt-4 text-4xl font-semibold leading-tight text-prussian md:text-5xl">
              See why your website feels slow, quiet, or invisible — in 60 seconds.
            </h1>
            <p className="reveal reveal-delay-2 mt-6 text-lg text-black/70">
              Website Rater scans your landing page for SEO, funnel clarity, copy strength,
              and speed signals. Get an instant verdict and a premium action plan.
            </p>
            <div className="reveal reveal-delay-3 mt-8 flex flex-wrap gap-3">
              <Link
                href="/tools/website-rater/start"
                className="rounded-full bg-prussian px-6 py-3 text-sm font-semibold text-white transition hover:bg-prussian/90"
              >
                Start a scan
              </Link>
              <Link
                href="/work"
                className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-black/80 transition hover:bg-black/5"
              >
                See studio work
              </Link>
            </div>
          </div>
          <div className="reveal reveal-delay-2 rounded-3xl border border-black/10 bg-white/80 p-8 shadow-[0_12px_36px_-24px_rgba(0,0,0,0.2)]">
            <div className="rounded-2xl border border-black/10 bg-white p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-black/50">
                What you get
              </p>
              <ul className="mt-5 space-y-3 text-sm text-black/70">
                <li>Verdict label with calibrated score bands.</li>
                <li>Top 3 critical issues slowing conversions.</li>
                <li>Top 3 quick wins you can ship today.</li>
                <li>Full report with prioritized recommendations.</li>
              </ul>
            </div>
            <div className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-black/50">Best for</p>
              <p className="mt-3 text-sm text-black/70">
                Founders, growth teams, and agencies who want signal fast without a long audit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
