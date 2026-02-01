export default function LeadCatcherFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-black/5 bg-white/90">
      <div className="page-shell flex flex-col items-center justify-between gap-3 py-8 text-sm text-black/60 md:flex-row">
        <div>© {year} Expert Dev Studio</div>
        <div className="text-center">Premium, conversion-first builds.</div>
        <a
          className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/60 hover:bg-black/5"
          href="mailto:hello@expertdev.studio"
        >
          hello@expertdev.studio
        </a>
      </div>
    </footer>
  );
}
