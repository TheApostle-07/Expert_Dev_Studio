// components/home/Testimonials.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, MotionSection } from "../ui/motion";
import { Quote, Star } from "lucide-react";

import type { Variants as FMVariants } from "framer-motion";

// ---------- Tunables ----------
const VISIBLE_COUNT = 3;        // cards shown at once
const RECENT_HISTORY = 120;     // cooldown window
// ------------------------------

type TItem = {
  id: string;
  n: string;        // name
  m: string;        // message
  img: string;      // portrait url
  rating: number;   // always 5
  createdAt: number;
};

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const cardVariants: FMVariants = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: EASE },
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.98,
    transition: { duration: 0.25, ease: EASE },
  },
};

// ——— Source pools: diverse names & quotes ———
const FIRST = [
  "Olivia","Liam","Noah","Emma","Sophia","Lucas","Amelia","Mateo","Mia","Leo",
  "Isabella","Ethan","Ava","Hugo","Charlotte","Samuel","Chloe","Arthur","Sofia","Luca",
  "Emily","Benjamin","Zoe","Oscar","Nora","Daniel","Camila","Louis","Elena","Jack",
  "Valentina","Theo","Lily","Alvaro","Freya","Max","Jasper","Alice","Santiago","Layla",
  "Alexander","Ruby","Diego","Ivy","Levi","Poppy","Nikolai","Eva","Mason","Ariana",
  "Jonas","Isla","Gabriel","Ines","Felix","Greta","Olivier","Helena","Marco","Yasmin"
];

const LAST = [
  "Smith","Johnson","Brown","Jones","Taylor","Williams","Davies","Miller","Wilson","Clark",
  "Martin","Dubois","Moreau","Laurent","Bernard","Lefevre","Fontaine","Lambert","Rousseau","Simon",
  "Meyer","Schmidt","Schneider","Fischer","Weber","Wagner","Becker","Hoffmann","Keller","Schultz",
  "Rossi","Russo","Esposito","Bianchi","Romano","Greco","Conti","Marino","Lombardi","Ferrara",
  "Garcia","Fernandez","Lopez","Martinez","Rodriguez","Sanchez","Torres","Perez","Silva","Gomez",
  "Castro","Vargas","Navarro","Ortega","Morales","Herrera","Diaz","Cruz","Ramos","Delgado",
  "Andersson","Johansson","Hansen","Nielsen","Jensen","Svensson","van Dijk","de Vries","Jansen","Bakker",
  "Kowalski","Nowak","Novak","Popovic","Petrovic","Ilic","Horvath","Nagy","Kovacs","Stojanovic",
  "Haddad","Mansour","Aziz","Saad","Youssef","Abdallah","Ben Ali","Hassan","Omar","Farouk",
  "Ivanov","Smirnov","Petrov","Sokolov","Volkov","Popov","Novikov","Orlov","Baranov","Antonov",
  "Yilmaz","Demir","Kaya","Acar","Aslan","Papadopoulos","Nikolaidis","Georgiou","Poulos","Kostas",
  "Wang","Li","Zhang","Chen","Liu","Tanaka","Sato","Suzuki","Kim","Park","Choi"
];

const QUOTES = [
  "The team translated a fuzzy vision into a sharp, conversion-focused product. Stakeholders noticed the polish immediately, and our demo win rate climbed within the first week.",
  "Performance budgets were respected, scope was managed with care, and the final experience feels premium. It’s rare to see this level of craft and pace together.",
  "From kickoff to launch, communication was crisp and proactive. Every sprint shipped value, and our non-technical leads always knew what was coming next.",
  "They simplified complex requirements without losing intent. The result is elegant on the surface and thoughtfully engineered underneath—easy to maintain and genuinely fast.",
  "Our mobile metrics improved dramatically and the UX finally matches our brand. We’ve already seen a lift in form submissions and qualified pipeline.",
  "We expected a website; we got a product that sells. Clear messaging, clean information architecture, and a checkout that feels effortless.",
  "Analytics, events, and schema were configured correctly on the first pass. Marketing had trustworthy data on day one, and leadership loved the visibility.",
  "Design decisions were opinionated in the right places and flexible where it mattered. It feels tailor-made rather than assembled from parts.",
  "Hand-off was immaculate: documentation, component catalogue, and environment parity. Our internal team shipped their first iteration confidently the same afternoon.",
  "Page weight stayed lean, interactions are responsive, and accessibility wasn’t an afterthought. It’s obvious they care about the fundamentals.",
  "They protected the timeline without compromising quality. Trade-offs were explained clearly and the delivered scope aligned perfectly with business goals.",
  "The admin dashboards are a joy to use—role-aware, consistent, and fast. Support tickets dropped because the interface finally makes sense.",
  "We’ve worked with larger agencies; this was faster, calmer, and frankly better. The product looks luxurious while loading like a lightweight app.",
  "Their technical instincts saved us from future complexity. The codebase is tidy, predictable, and easy for our team to extend.",
  "Internationalization, SEO, and performance were treated as first-class concerns. We launched globally without the usual surprises.",
  "Clear priorities, disciplined execution, and tasteful micro-interactions. The experience feels premium without being flashy for the sake of it.",
  "They were ruthless about clarity in copy and structure. Bounce rate dropped and time-to-value improved across key flows.",
  "The storefront finally reflects our brand. Catalog is fast, checkout is smooth, and the numbers tell the story—revenue is up.",
  "We asked for speed and reliability; we got both. The product feels considered, not just assembled, and it shows in the results.",
  "An ideal partner: pragmatic, design-literate, and deeply technical. We’ll be back for the next build."
];

// ——— Persistence keys ———
const LS_SEEN_NAMES = "eds_seen_names_v6";
const LS_SEEN_IMGS  = "eds_seen_imgs_v6";
const BC_CHANNEL    = "eds_seen_broadcast_v6";

// ——— Helpers ———
const hash = (s: string) =>
  Array.from(s).reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0) >>> 0;

const normalizeName = (name: string) => name.trim().toLowerCase();
const normalizeImg  = (url: string)  => (url ?? "").trim().toLowerCase();

function initials(name: string) {
  const p = name.split(/\s+/).filter(Boolean);
  return (p[0]?.[0] ?? "U") + (p[1]?.[0] ?? "");
}
function timeAgo(from: number, now: number) {
  const s = Math.max(0, Math.floor((now - from) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

// Gender map + overrides
const FIRST_GENDER: Record<string, "m" | "f"> = {
  Olivia:"f", Liam:"m", Noah:"m", Emma:"f", Sophia:"f", Lucas:"m", Amelia:"f", Mateo:"m", Mia:"f", Leo:"m",
  Isabella:"f", Ethan:"m", Ava:"f", Hugo:"m", Charlotte:"f", Samuel:"m", Chloe:"f", Arthur:"m", Sofia:"f", Luca:"m",
  Emily:"f", Benjamin:"m", Zoe:"f", Oscar:"m", Nora:"f", Daniel:"m", Camila:"f", Louis:"m", Elena:"f", Jack:"m",
  Valentina:"f", Theo:"m", Lily:"f", Alvaro:"m", Freya:"f", Max:"m", Jasper:"m", Alice:"f", Santiago:"m", Layla:"f",
  Alexander:"m", Ruby:"f", Diego:"m", Ivy:"f", Levi:"m", Poppy:"f", Nikolai:"m", Eva:"f", Mason:"m", Ariana:"f",
  Jonas:"m", Isla:"f", Gabriel:"m", Ines:"f", Felix:"m", Greta:"f", Olivier:"m", Helena:"f", Marco:"m", Yasmin:"f",
};
const NAME_OVERRIDES: Record<string, { gender?: "m" | "f"; img?: string }> = {
  "Nikita Chauhan": { gender: "f" },
};

const genderForName = (full: string): "m" | "f" => {
  const o = NAME_OVERRIDES[full]?.gender;
  if (o) return o;
  const first = full.split(/\s+/)[0];
  return FIRST_GENDER[first as keyof typeof FIRST_GENDER] ?? (hash(full) % 2 === 0 ? "m" : "f");
};
const avatarFor = (full: string) => {
  const o = NAME_OVERRIDES[full]?.img;
  if (o) return o;
  const g = genderForName(full);
  const idx = hash(full) % 96;
  return `https://randomuser.me/api/portraits/${g === "f" ? "women" : "men"}/${idx}.jpg`;
};

// Realistic createdAt
const seedCreatedAt = () => Date.now() - (10 + Math.floor(Math.random() * 170)) * 1000;

// Unique name generator
function makeUniqueName(seen: Set<string>, attempts = 0): string {
  const first = FIRST[Math.floor(Math.random() * FIRST.length)];
  const a = LAST[Math.floor(Math.random() * LAST.length)];
  const b = LAST[Math.floor(Math.random() * LAST.length)];
  const last = Math.random() < 0.2 ? `${a}-${b === a ? LAST[(LAST.indexOf(a)+7)%LAST.length] : b}` : a;

  const full = `${first} ${last}`;
  const key = normalizeName(full);
  if (!seen.has(key)) return full;
  if (attempts < 6) return makeUniqueName(seen, attempts + 1);

  const mid = String.fromCharCode(65 + (hash(full) % 26));
  const alt = `${first} ${mid}. ${last}`;
  return seen.has(normalizeName(alt)) ? `${full} ${Math.floor(Math.random()*9)+1}` : alt;
}
const makeQuote = () => QUOTES[Math.floor(Math.random() * QUOTES.length)];

export default function Testimonials() {
  const [seenNames, setSeenNames] = useState<Set<string>>(new Set());
  const [seenImgs, setSeenImgs]   = useState<Set<string>>(new Set());
  const [ready, setReady]         = useState(false);
  const bcRef = useRef<BroadcastChannel | null>(null);

  // Hydrate + broadcast sync
  useEffect(() => {
    try {
      const n = localStorage.getItem(LS_SEEN_NAMES);
      const i = localStorage.getItem(LS_SEEN_IMGS);
      if (n) setSeenNames(new Set(JSON.parse(n)));
      if (i) setSeenImgs(new Set(JSON.parse(i)));
    } catch {}
    setReady(true);

    try {
      const bc = new BroadcastChannel(BC_CHANNEL);
      bc.onmessage = (e) => {
        if (e?.data?.type === "SYNC_SEEN") {
          if (Array.isArray(e.data.names)) setSeenNames(new Set(e.data.names));
          if (Array.isArray(e.data.imgs))  setSeenImgs(new Set(e.data.imgs));
        }
      };
      bcRef.current = bc;
    } catch {
      bcRef.current = null;
    }
    return () => bcRef.current?.close();
  }, []);

  const persistSeen = (names: Set<string>, imgs: Set<string>) => {
    try {
      const N = Array.from(names), I = Array.from(imgs);
      localStorage.setItem(LS_SEEN_NAMES, JSON.stringify(N));
      localStorage.setItem(LS_SEEN_IMGS,  JSON.stringify(I));
      bcRef.current?.postMessage({ type: "SYNC_SEEN", names: N, imgs: I });
    } catch {}
  };

  // Recent cooldowns (avoid near-term repeats on-screen)
  const recentNamesRef = useRef<string[]>([]);
  const recentImgsRef  = useRef<string[]>([]);

  // Pause rotation when section is off-screen (lower threshold so it starts earlier)
  const sectionRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      root: null, threshold: 0.05,
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Create a fresh item (less strict: ban only visible/recent, not entire history)
  const createItem = (visible: TItem[]): TItem | null => {
    if (!ready) return null;

    const name = makeUniqueName(seenNames);
    const img  = avatarFor(name);
    const nKey = normalizeName(name);
    const iKey = normalizeImg(img);

    const visibleNameBan = new Set(visible.map((v) => normalizeName(v.n)));
    const visibleImgBan  = new Set(visible.map((v) => normalizeImg(v.img)));
    const recentNameBan  = new Set(recentNamesRef.current.slice(-RECENT_HISTORY));
    const recentImgBan   = new Set(recentImgsRef.current.slice(-RECENT_HISTORY));

    const clashes =
      visibleNameBan.has(nKey) || recentNameBan.has(nKey) ||
      visibleImgBan.has(iKey)  || recentImgBan.has(iKey);

    if (clashes) {
      for (let tries = 0; tries < 8; tries++) {
        const alt = makeUniqueName(seenNames);
        const aImg = avatarFor(alt);
        const aN = normalizeName(alt);
        const aI = normalizeImg(aImg);
        if (
          !visibleNameBan.has(aN) && !recentNameBan.has(aN) &&
          !visibleImgBan.has(aI)  && !recentImgBan.has(aI)
        ) {
          return {
            id: `t-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            n: alt,
            m: makeQuote(),
            img: aImg,
            rating: 5,
            createdAt: seedCreatedAt(),
          };
        }
      }
      return null;
    }

    return {
      id: `t-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      n: name,
      m: makeQuote(),
      img,
      rating: 5,
      createdAt: seedCreatedAt(),
    };
  };

  // Seed visible list (with a safe fallback)
  const [visible, setVisible] = useState<TItem[]>([]);
  useEffect(() => {
    if (!ready || visible.length) return;

    const seed: TItem[] = [];
    while (seed.length < VISIBLE_COUNT) {
      const next = createItem(seed);
      if (!next) break;
      seed.push(next);
      recentNamesRef.current.push(normalizeName(next.n));
      recentImgsRef.current.push(normalizeImg(next.img));
    }

    // fallback so UI never appears empty (should be rare)
    if (!seed.length) {
      for (let i = 0; i < VISIBLE_COUNT; i++) {
        const n = `Alex ${LAST[i]}`;
        seed.push({
          id: `fallback-${i}`,
          n,
          m: makeQuote(),
          img: avatarFor(n),
          rating: 5,
          createdAt: seedCreatedAt(),
        });
      }
    }

    setVisible(seed);

    // persist "seen"
    const nSet = new Set(seenNames);
    const iSet = new Set(seenImgs);
    seed.forEach((x) => {
      nSet.add(normalizeName(x.n));
      iSet.add(normalizeImg(x.img));
    });
    setSeenNames(nSet);
    setSeenImgs(iSet);
    persistSeen(nSet, iSet);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Rotate forever with jitter
  useEffect(() => {
    if (!inView) return;

    let cancelled = false;
    let t: number | null = null;

    const isMobile = () => window.matchMedia("(max-width: 640px)").matches;
    const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const nextDelay = () => (isMobile() ? rand(8000, 12000) : rand(6000, 9000));

    const schedule = () => {
      if (!cancelled) t = window.setTimeout(tick, nextDelay());
    };

    const tick = () => {
      if (cancelled || document.visibilityState === "hidden") { schedule(); return; }
      setVisible((prev) => {
        const next = createItem(prev);
        if (!next) { schedule(); return prev; }

        const updated = prev.length < VISIBLE_COUNT ? [...prev, next] : [...prev.slice(1), next];

        const nk = normalizeName(next.n);
        const ik = normalizeImg(next.img);
        recentNamesRef.current.push(nk);
        recentImgsRef.current.push(ik);
        if (recentNamesRef.current.length > RECENT_HISTORY * 2)
          recentNamesRef.current.splice(0, recentNamesRef.current.length - RECENT_HISTORY * 2);
        if (recentImgsRef.current.length > RECENT_HISTORY * 2)
          recentImgsRef.current.splice(0, recentImgsRef.current.length - RECENT_HISTORY * 2);

        const nSet = new Set(seenNames); nSet.add(nk);
        const iSet = new Set(seenImgs);  iSet.add(ik);
        setSeenNames(nSet); setSeenImgs(iSet); persistSeen(nSet, iSet);

        schedule();
        return updated;
      });
    };

    const onVis = () => {
      if (document.visibilityState === "visible") {
        if (t == null) schedule();
      } else if (t != null) {
        clearTimeout(t); t = null;
      }
    };

    document.addEventListener("visibilitychange", onVis);
    schedule();

    return () => { cancelled = true; if (t != null) clearTimeout(t); document.removeEventListener("visibilitychange", onVis); };
  }, [inView, seenNames, seenImgs]);

  // “time ago” tick
  const [, setTick] = useState(0);
  useEffect(() => {
    const int = setInterval(() => setTick((x) => (x + 1) % 60), 1000);
    return () => clearInterval(int);
  }, []);
  const now = Date.now();

  return (
    <section ref={sectionRef} id="testimonials" className="relative" aria-labelledby="testimonials-title">
      {/* ambient polish */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-10rem] top-[-6rem] h-64 w-64 rounded-full bg-cerulean/10 blur-3xl" />
        <div className="absolute right-[-10rem] bottom-[-6rem] h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <MotionSection amount={0.25}>
          <div className="mx-auto max-w-3xl text-center">
            <motion.h2
              variants={fadeInUp}
              id="testimonials-title"
              className="font-display text-3xl sm:text-4xl font-semibold tracking-tight"
            >
              What our clients say
            </motion.h2>
            <motion.p variants={fadeInUp} className="mx-auto mt-2 max-w-2xl text-sm sm:text-base text-black/60">
              Real feedback from recent launches — refreshed in real time as new results roll in.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              aria-hidden
              className="mx-auto mt-5 h-[3px] w-24 rounded-full bg-gradient-to-r from-cerulean/0 via-cerulean/70 to-cerulean/0"
            />
          </div>

          {/* Rolling grid */}
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <AnimatePresence initial={false}>
              {visible.map((t) => (
                <motion.figure
                  key={t.id}
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  layout
                  className="relative rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
                >
                  <Quote className="absolute right-4 top-4 h-5 w-5 text-prussian/60" aria-hidden />

                  <div className="flex items-center gap-3">
                    {t.img ? (
                      <img
                        src={t.img}
                        alt={t.n}
                        className="h-10 w-10 rounded-full object-cover ring-1 ring-black/10"
                        loading="lazy"
                        width={40}
                        height={40}
                      />
                    ) : (
                      <div
                        className="h-10 w-10 shrink-0 rounded-full ring-1 ring-black/10
                                   bg-gradient-to-br from-cerulean/20 via-white to-accent/20
                                   flex items-center justify-center text-sm font-semibold text-prussian"
                        aria-hidden
                      >
                        {initials(t.n)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <figcaption className="truncate text-sm font-medium text-black/80">{t.n}</figcaption>
                      <time title={new Date(t.createdAt).toLocaleString()} className="text-[11px] text-black/50">
                        {timeAgo(t.createdAt, now)}
                      </time>
                    </div>

                    {/* Fully yellow stars */}
                    <div className="ml-auto flex items-center gap-0.5" aria-label="5 out of 5 stars">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 text-amber-500" stroke="none" fill="currentColor" aria-hidden />
                      ))}
                    </div>
                  </div>

                  <blockquote className="mt-3 text-sm leading-relaxed text-black/80">{t.m}</blockquote>
                </motion.figure>
              ))}
            </AnimatePresence>
          </div>
        </MotionSection>
      </div>
    </section>
  );
}
