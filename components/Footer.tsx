// components/Footer.tsx
import { Mail, Github, Linkedin, Twitter, ArrowRight, ArrowUp, Code2 } from "lucide-react";

const NAV_PRIMARY = [
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const NAV_LEGAL = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative mt-24 border-t border-black/5 bg-white/85 backdrop-blur"
      aria-label="Footer"
    >
      {/* Accent hairline */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cerulean/60 to-transparent"
      />

      {/* Ambient brand glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-8rem] bottom-[-6rem] h-56 w-56 rounded-full bg-cerulean/10 blur-3xl" />
        <div className="absolute right-[-10rem] top-[-6rem] h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top area */}
        <div className="grid gap-10 py-14 md:grid-cols-12 justify-items-center text-center md:justify-items-stretch md:text-left">
          {/* Brand */}
          <div className="md:col-span-5 lg:col-span-5 flex flex-col items-center md:items-start">
            <a href="/" className="inline-flex items-center gap-2" aria-label="Expert Dev Studio home">
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg
                           bg-[linear-gradient(135deg,#003459_0%,#007EA7_60%,#FCA311_100%)]
                           text-white shadow-[0_4px_12px_-6px_rgba(0,0,0,0.25)]"
              >
                <Code2 className="h-4 w-4" aria-hidden />
              </span>
              <span className="font-display text-base font-semibold tracking-tight">
                Expert Dev Studio
              </span>
            </a>

            <p className="mt-4 max-w-md text-sm leading-relaxed text-black/70 text-center md:text-left">
              Elegant by design. <span className="text-cerulean">Ruthless</span> on performance.
              We build conversion-focused websites and apps that look premium and load fast on every device.
            </p>

            {/* Socials */}
            <ul className="mt-5 flex items-center justify-center gap-3 md:justify-start" aria-label="Social links">
              <li>
                <a
                  href="mailto:hello@expertdev.studio"
                  className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-prussian transition hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cerulean/50"
                  aria-label="Email"
                >
                  <Mail className="h-4 w-4" aria-hidden />
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-prussian transition hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cerulean/50"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" aria-hidden />
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-prussian transition hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cerulean/50"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" aria-hidden />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-prussian transition hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cerulean/50"
                  aria-label="GitHub"
                >
                  <Github className="h-4 w-4" aria-hidden />
                </a>
              </li>
            </ul>
          </div>

          {/* Navigation */}
          <nav className="md:col-span-4 lg:col-span-4 text-center md:text-left" aria-labelledby="footer-nav-heading">
            <h3 id="footer-nav-heading" className="text-xs font-semibold uppercase tracking-wider text-black/60">
              Navigate
            </h3>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-sm justify-items-center md:justify-items-start">
              {NAV_PRIMARY.map((item) => (
                <li key={item.href}>
                  <a
                    className="rounded px-1 text-black/70 transition hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-cerulean/40"
                    href={item.href}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            <h3 className="mt-7 text-xs font-semibold uppercase tracking-wider text-black/60">
              Legal
            </h3>
            <ul className="mt-3 space-y-2 text-sm md:text-left">
              {NAV_LEGAL.map((item) => (
                <li key={item.href}>
                  <a
                    className="rounded px-1 text-black/70 transition hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-cerulean/40"
                    href={item.href}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Primary CTA (fixed layering so label never disappears) */}
       {/* Primary CTA */}
<div className="md:col-span-3 lg:col-span-3 mx-auto max-w-md text-center md:text-left">
  <h3 className="font-display text-lg font-semibold tracking-tight text-black text-center md:text-left">
    Get your website built
  </h3>

  <p className="mt-3 text-sm leading-relaxed text-black/70 text-center md:text-left">
    Book a 15-minute discovery call. We’ll align on outcomes, scope, and timeline-if there’s a fit,
    your first sprint for <span className="font-medium">your business</span> starts this week.
  </p>

  <a
    href="/contact"
    aria-label="Get your website built"
    className="group mt-4 inline-flex w-full min-h-[48px] items-center justify-center gap-2
               rounded-xl px-5 py-3 text-sm font-semibold tracking-tight text-black
               shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)]
               ring-2 ring-black/5 transition hover:opacity-95
               focus:outline-none focus-visible:ring-4 focus-visible:ring-cerulean/50"
    // Gradient fallback so label is ALWAYS readable
    style={{ background: "linear-gradient(135deg,#FCA311 0%,#FFD56A 100%)" }}
  >
    <span className="relative z-[1]">Get your website built</span>
    <ArrowRight
      className="h-4 w-4 transform-gpu transition-transform duration-200
                 motion-safe:group-hover:translate-x-1"
      aria-hidden
    />
  </a>

  <p className="mt-3 text-xs text-black/60 text-center md:text-left">
    Prefer email?{" "}
    <a
      className="underline decoration-black/20 underline-offset-2 hover:text-black"
      href="mailto:hello@expertdev.studio"
    >
      hello@expertdev.studio
    </a>
  </p>
</div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-black/5 py-6 text-sm text-black/60 text-center md:flex-row md:text-left">
          <div>© {year} Expert Dev Studio</div>
          <div className="text-center">
            Build fast. <span className="text-cerulean">Ship beautiful.</span>
          </div>
          <div className="relative flex items-center gap-4 md:gap-6">
            <span className="hidden md:inline">Made with care - performance first.</span>
            <a
              href="#top"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-prussian transition hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cerulean/50"
              aria-label="Back to top"
              title="Back to top"
            >
              <ArrowUp className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}