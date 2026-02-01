import { Code2 } from "lucide-react";
import { LeadCatcherModalLauncher } from "./LeadCatcherModal";

export default function LeadCatcherHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/85 backdrop-blur">
      <div className="page-shell flex min-h-[4.5rem] items-center justify-between gap-4">
        <a href="/" className="inline-flex items-center gap-2" aria-label="Expert Dev Studio home">
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg
                       bg-[linear-gradient(135deg,#003459_0%,#007EA7_60%,#FCA311_100%)]
                       text-white shadow-[0_4px_12px_-6px_rgba(0,0,0,0.25)]"
          >
            <Code2 className="h-4 w-4" aria-hidden />
          </span>
          <span className="font-display text-sm font-semibold tracking-tight">Expert Dev Studio</span>
        </a>

        <nav className="hidden items-center gap-6 text-sm text-black/70 md:flex" aria-label="Lead Catcher OS">
          <a href="#demo" className="hover:text-black">Demo</a>
          <a href="#pricing" className="hover:text-black">Pricing</a>
          <a href="#faq" className="hover:text-black">FAQ</a>
        </nav>

        <LeadCatcherModalLauncher
          label="Get Demo + Pricing"
          className="inline-flex items-center gap-2 rounded-xl bg-prussian px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_24px_-12px_rgba(0,126,167,0.6)] transition hover:bg-prussian/90"
        />
      </div>
      <div
        aria-hidden
        className="h-[2px] w-full bg-[linear-gradient(90deg,#007EA7_0%,#FCA311_50%,#003459_100%)]"
      />
    </header>
  );
}
