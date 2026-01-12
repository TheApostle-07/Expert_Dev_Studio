// components/Header.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles, Code2 } from "lucide-react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/tools/website-rater", label: "Website Rater" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [elevated, setElevated] = useState(false);
  const pathname = usePathname();

  // subtle elevation when scrolled
  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close mobile sheet on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header
      role="banner"
      className={`fixed inset-x-0 top-0 z-50 w-full transition-shadow ${
        elevated ? "shadow-[0_8px_30px_-20px_rgba(0,0,0,0.25)]" : ""
      }`}
    >
      {/* vivid top gradient bar with soft edge mask */}
      <div
        aria-hidden
        className="pointer-events-none h-2 md:h-2.5 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
      >
        <div className="h-full w-full bg-[linear-gradient(90deg,#007EA7_0%,#FCA311_50%,#003459_100%)]" />
      </div>

      {/* glass header layer */}
      <div className="border-b border-black/5 bg-white/85 backdrop-blur-sm">
        <div className="container mx-auto flex min-h-[4rem] items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8">
          {/* Brand */}
          <a href="/" className="inline-flex items-center gap-2" aria-label="Expert Dev Studio home">
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-md
                         bg-[linear-gradient(135deg,#003459_0%,#007EA7_60%,#FCA311_100%)]
                         text-white shadow-[0_4px_12px_-6px_rgba(0,0,0,0.25)]"
            >
              <Code2 className="h-4 w-4" aria-hidden />
            </span>
            <span className="font-display text-sm font-semibold tracking-tight">
              Expert Dev Studio
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-4 md:flex lg:gap-6" aria-label="Primary">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <a
                  key={l.href}
                  href={l.href}
                  className={`group relative whitespace-nowrap text-sm no-underline hover:no-underline focus:no-underline transition ${
                    active ? "text-prussian" : "text-black/70 hover:text-black"
                  }`}
                >
                  {l.label}
                  <span
                    className={`pointer-events-none absolute -bottom-1 left-0 h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-cerulean to-accent transition-transform duration-300 ease-out ${
                      active ? "scale-x-100" : "group-hover:scale-x-100"
                    }`}
                    aria-hidden
                  />
                </a>
              );
            })}
            <a
              href="/contact"
              className="relative inline-flex items-center gap-2 rounded-xl whitespace-nowrap
                         px-3 py-2 text-xs font-semibold text-white
                         bg-[linear-gradient(90deg,#0A6F95_0%,#007EA7_40%,#003459_100%)]
                         shadow-[0_8px_24px_-12px_rgba(0,126,167,0.6)]
                         no-underline hover:no-underline transition-colors
                         hover:bg-[linear-gradient(90deg,#0C88B4_0%,#009BC4_40%,#074A77_100%)]
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                         focus-visible:ring-accent focus-visible:ring-offset-white
                         lg:px-4 lg:py-2.5 lg:text-sm"
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              Get Quote
            </a>
          </nav>

          {/* Mobile toggle */}
          <button
            aria-label="Toggle Menu"
            className="md:hidden rounded-lg border border-black/10 p-2"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile panel */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="md:hidden overflow-hidden border-t border-black/5 bg-white/95 backdrop-blur"
            >
              <div className="container mx-auto px-4 py-3 sm:px-6 lg:px-8">
                <nav className="grid gap-2" aria-label="Mobile">
                  {links.map((l) => {
                    const active = pathname === l.href;
                    return (
                      <a
                        key={l.href}
                        href={l.href}
                        className={`rounded-lg px-3 py-2 text-sm no-underline hover:no-underline transition ${
                          active ? "bg-cerulean/10 text-prussian" : "text-black/80 hover:bg-black/5"
                        }`}
                      >
                        {l.label}
                      </a>
                    );
                  })}
                  <a
                    href="/contact"
                    className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl
                               px-4 py-2.5 text-sm font-semibold text-white
                               bg-[linear-gradient(90deg,#0A6F95_0%,#007EA7_40%,#003459_100%)]
                               shadow-[0_8px_24px_-12px_rgba(0,126,167,0.6)]
                               no-underline hover:no-underline transition-colors
                               hover:bg-[linear-gradient(90deg,#0C88B4_0%,#009BC4_40%,#074A77_100%)]
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                               focus-visible:ring-accent focus-visible:ring-offset-white"
                  >
                    <Sparkles className="h-4 w-4" aria-hidden />
                    Get Quote
                  </a>
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
