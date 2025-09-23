"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { BadgeCheck, ChevronRight } from "lucide-react";

// —— Tunables ————————————————————————————————————————————————
const AUTO_DISMISS_MS = 5200;
const COLD_START_MS   = 4500;
const DESKTOP_RANGE: [number, number] = [12000, 20000];
const MOBILE_RANGE: [number, number]  = [16000, 26000];
const MAX_RECENT      = 150;
// TTL-based storage (v2) so we never exhaust pools
const LS_SEEN_NAMES   = "eds_fomo_seen_names_v2";     // Map<name, lastSeenEpochMs>
const LS_SEEN_AVATARS = "eds_fomo_seen_avatars_v2";   // Map<url,  lastSeenEpochMs>

// Items expire from “seen” after these windows (prevents exhaustion)
const NAME_TTL_MS     = 1000 * 60 * 60 * 24 * 21;     // 21 days
const AVATAR_TTL_MS   = 1000 * 60 * 60 * 24 * 7;      // 7 days (avatars are finite)
// Absolute caps for the persisted maps (oldest entries pruned on write)
const MAX_SEEN_NAMES  = 8000;
const MAX_SEEN_AVATAR = 2000;
const BC_CHANNEL      = "eds_fomo_seen_broadcast_v1";
const MAX_STACK       = 1;
const MAX_RECENT_AVATARS = 700;
// —— Encryption utilities (AES‑GCM via Web Crypto) ——————————————————
// Goal: deter casual inspection of localStorage. Note: client-side
// "encryption" is ultimately obfuscation because the key ships to the browser.
// For true secrecy, store sensitive data server-side.
const te = new TextEncoder();
const td = new TextDecoder();

const ENC_PREFIX = "enc:v1:";

function bytesToB64(arr: Uint8Array): string {
  // Avoid spread on Uint8Array to support older TS targets without downlevelIteration
  let s = "";
  for (let i = 0; i < arr.length; i++) {
    s += String.fromCharCode(arr[i]);
  }
  return btoa(s);
}
function b64ToBytes(str: string): Uint8Array {
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

let aesKeyPromise: Promise<CryptoKey> | null = null;
function toArrayBuffer(u8: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(u8.byteLength);
  copy.set(u8);
  return copy.buffer; // guaranteed ArrayBuffer
}
function getKey(): Promise<CryptoKey> {
  if (aesKeyPromise) return aesKeyPromise;
  aesKeyPromise = (async () => {
    const secret =
      (process.env.NEXT_PUBLIC_FOMO_SECRET || "eds-default-fomo-secret") +
      "|" +
      (typeof window !== "undefined" ? window.location.origin : "server");
    const salt = toArrayBuffer(te.encode("eds_fomo_salt_v1"));
    const baseKey = await crypto.subtle.importKey("raw", toArrayBuffer(te.encode(secret)), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: 120_000, hash: "SHA-256" },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  })();
  return aesKeyPromise;
}

async function encryptObj(obj: unknown): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const pt = te.encode(JSON.stringify(obj ?? {}));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv: toArrayBuffer(iv) }, key, toArrayBuffer(pt));
  return ENC_PREFIX + bytesToB64(iv) + ":" + bytesToB64(new Uint8Array(ct));
}

async function decryptObj<T = any>(blob: string): Promise<T | null> {
  try {
    if (!blob || !blob.startsWith(ENC_PREFIX)) return null;
    const [, ivB64, ctB64] = blob.split(":");
    const key = await getKey();
    const iv = b64ToBytes(ivB64);
    const ct = b64ToBytes(ctB64);
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: toArrayBuffer(iv) }, key, toArrayBuffer(ct));
    return JSON.parse(td.decode(new Uint8Array(pt)));
  } catch {
    return null;
  }
}
// ————————————————————————————————————————————————————————————————
// —— TTL helpers for localStorage maps ————————————————————————
async function readTTLMap(key: string, ttlMs: number): Promise<Map<string, number>> {
  const now = Date.now();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Map();
    // Try decrypt first; if it fails, fall back to legacy plaintext.
    let obj: any = await decryptObj(raw);
    if (!obj) {
      try { obj = JSON.parse(raw); } catch { obj = {}; }
    }
    if (Array.isArray(obj)) {
      const m = new Map<string, number>();
      obj.forEach((k: string) => m.set(k, now));
      // Upgrade legacy array to encrypted map
      await writeTTLMap(key, m, key === LS_SEEN_NAMES ? MAX_SEEN_NAMES : MAX_SEEN_AVATAR);
      return m;
    }
    const m = new Map<string, number>(Object.entries(obj as Record<string, number> || {}));
    // TTL prune
    for (const [k, ts] of Array.from(m.entries())) {
      if (typeof ts !== "number" || now - ts > ttlMs) m.delete(k);
    }
    // Upgrade legacy plaintext to encrypted
    if (!raw.startsWith(ENC_PREFIX)) {
      await writeTTLMap(key, m, key === LS_SEEN_NAMES ? MAX_SEEN_NAMES : MAX_SEEN_AVATAR);
    }
    return m;
  } catch {
    return new Map();
  }
}

async function writeTTLMap(key: string, map: Map<string, number>, maxSize: number): Promise<void> {
  const entries = Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, maxSize);
  const obj: Record<string, number> = {};
  entries.forEach(([k, ts]) => (obj[k] = ts));
  try {
    const blob = await encryptObj(obj);
    localStorage.setItem(key, blob);
  } catch {}
}

function ttlHas(map: Map<string, number>, key: string): boolean {
  return map.has(key);
}

function ttlAdd(map: Map<string, number>, key: string) {
  map.set(key, Date.now());
}
// ————————————————————————————————————————————————————————————————
// ——————————————————————————————————————————————————————————————

type Toast = {
  id: string;
  name: string;
  img: string;
  pkgCode: "L0" | "L1" | "L2" | "L3";
  pkgName: string;
};

const PACKAGES = [
  { code: "L0", name: "Landing Sprint" },
  { code: "L1", name: "Authority Site" },
  { code: "L2", name: "Storefront" },
  { code: "L3", name: "Custom Build" },
] as const;

const FIRST = ["Olivia","Liam","Noah","Emma","Sophia","Lucas","Amelia","Mateo","Mia","Leo","Isabella","Ethan","Ava","Hugo","Charlotte","Samuel","Chloe","Arthur","Sofia","Luca","Emily","Benjamin","Zoe","Oscar","Nora","Daniel","Camila","Louis","Elena","Jack","Valentina","Theo","Lily","Alvaro","Freya","Max","Jasper","Alice","Santiago","Layla","Alexander","Ruby","Diego","Ivy","Levi","Poppy","Nikolai","Eva","Mason","Ariana","Jonas","Isla","Gabriel","Ines","Felix","Greta","Olivier","Helena","Marco","Yasmin"];
const LAST  = ["Smith","Johnson","Brown","Jones","Taylor","Williams","Miller","Wilson","Clark","Martin","Dubois","Laurent","Rousseau","Meyer","Schmidt","Fischer","Weber","Wagner","Bianchi","Romano","Garcia","Fernandez","Lopez","Rodriguez","Sanchez","Torres","Perez","Silva","Gomez","Navarro","Andersson","Hansen","Nielsen","Svensson","van Dijk","de Vries","Jansen","Bakker","Kowalski","Nowak","Novak","Petrovic","Horvath","Nagy","Kovacs","Ivanov","Smirnov","Yilmaz","Demir","Kaya","Wang","Li","Zhang","Chen","Liu","Tanaka","Sato","Suzuki","Kim","Park"];


const FIRST_GENDER: Record<string, "m"|"f"> = { Olivia:"f", Liam:"m", Noah:"m", Emma:"f", Sophia:"f", Lucas:"m", Amelia:"f", Mateo:"m", Mia:"f", Leo:"m", Isabella:"f", Ethan:"m", Ava:"f", Hugo:"m", Charlotte:"f", Samuel:"m", Chloe:"f", Arthur:"m", Sofia:"f", Luca:"m", Emily:"f", Benjamin:"m", Zoe:"f", Oscar:"m", Nora:"f", Daniel:"m", Camila:"f", Louis:"m", Elena:"f", Jack:"m", Valentina:"f", Theo:"m", Lily:"f", Alvaro:"m", Freya:"f", Max:"m", Jasper:"m", Alice:"f", Santiago:"m", Layla:"f", Alexander:"m", Ruby:"f", Diego:"m", Ivy:"f", Levi:"m", Poppy:"f", Nikolai:"m", Eva:"f", Mason:"m", Ariana:"f", Jonas:"m", Isla:"f", Gabriel:"m", Ines:"f", Felix:"m", Greta:"f", Olivier:"m", Helena:"f", Marco:"m", Yasmin:"f" };

const FIRST_GENDER_LC: Record<string, "m" | "f"> = {};
Object.entries(FIRST_GENDER).forEach(([k, v]) => {
  FIRST_GENDER_LC[k.toLowerCase()] = v;
});

const hash = (s: string) => Array.from(s).reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0) >>> 0;
const normalize = (s: string) => s.trim().toLowerCase();
const normalizeImg = (u: string) => (u || "").trim().toLowerCase();
const LS_GENDER_OVERRIDES = "eds_fomo_gender_overrides_v1";
const NAME_GENDER_OVERRIDES: Record<string, "m" | "f"> = {
  // Add any known individuals here to force-correct gender
  "Nikita Chauhan": "f",
};
let genderOverridesCache: Record<string, "m" | "f"> | null = null;
async function loadGenderOverrides(): Promise<void> {
  try {
    const raw = localStorage.getItem(LS_GENDER_OVERRIDES);
    if (!raw) { genderOverridesCache = {}; return; }
    const dec = await decryptObj<Record<string, "m" | "f">>(raw);
    if (dec) { genderOverridesCache = dec; return; }
    // legacy plaintext
    genderOverridesCache = JSON.parse(raw);
    // upgrade to encrypted, fire-and-forget
    try { localStorage.setItem(LS_GENDER_OVERRIDES, await encryptObj(genderOverridesCache)); } catch {}
  } catch { genderOverridesCache = {}; }
}
function writeGenderOverride(name: string, g: "m" | "f") {
  try {
    const cache = (genderOverridesCache ||= {});
    cache[name] = g;
    // fire-and-forget persist (encrypted)
    (async () => {
      try {
        const blob = await encryptObj(cache);
        localStorage.setItem(LS_GENDER_OVERRIDES, blob);
      } catch {}
    })();
  } catch {}
}
function heuristicGenderGuess(fullName: string): "m" | "f" {
  const first = fullName.split(" ")[0]?.toLowerCase() || "";
  // Lightweight, language-agnostic hints + a few common suffix rules.
  const rules: Array<[RegExp, "m" | "f"]> = [
    [/a$|ia$|ta$|na$|la$|ra$|ya$|za$/i, "f"],
    [/ette$|elle$|ine$|ika$/i, "f"],
    [/son$|ton$|us$|o$|an$|en$|yn$|ias$|ian$|ko$|mir$/i, "m"],
  ];
  for (const [re, g] of rules) if (re.test(first)) return g;
  // final stable fallback
  return (hash(fullName) % 2 === 0) ? "m" : "f";
}
const genderFor = (name: string): "m" | "f" => {
  // 1) explicit per-person override
  if (NAME_GENDER_OVERRIDES[name]) return NAME_GENDER_OVERRIDES[name];
  // 2) common first-name map (case-insensitive)
  const firstLc = name.split(" ")[0]?.toLowerCase() ?? "";
  const mapped = FIRST_GENDER_LC[firstLc];
  if (mapped) return mapped;
  // 3) persisted guess for this exact full name
  const cache = genderOverridesCache || {};
  if (cache[name]) return cache[name];
  // 4) heuristic + persist so the same name is consistent next time
  const g = heuristicGenderGuess(name);
  writeGenderOverride(name, g);
  return g;
};
const avatarFor = (name: string) => {
  const g = genderFor(name);
  const h = hash(name);
  // RandomUser has 0–99 per gender bucket; we pick a deterministic index
  return `https://randomuser.me/api/portraits/${g === "f" ? "women" : "men"}/${h % 100}.jpg`;
};

function makeUniqueName(seen: Set<string>, tries = 0): string {
  const first = FIRST[Math.floor(Math.random()*FIRST.length)];
  const lastA = LAST[Math.floor(Math.random()*LAST.length)];
  const last = Math.random()<0.18 ? `${lastA}-${LAST[(LAST.indexOf(lastA)+7)%LAST.length]}` : lastA;
  const full = `${first} ${last}`; const key = normalize(full);
  if (!seen.has(key)) return full;
  if (tries<6) return makeUniqueName(seen, tries+1);
  const middle = String.fromCharCode(65 + (hash(full)%26));
  const withM = `${first} ${middle}. ${last}`;
  return seen.has(normalize(withM)) ? `${full} ${Math.floor(Math.random()*9)+1}` : withM;
}
const pickPackage = () => PACKAGES[Math.floor(Math.random()*PACKAGES.length)];
const rangeRand = ([min,max]:[number,number]) => Math.floor(Math.random()*(max-min+1))+min;

const toastVariants = (isTop:boolean, isRight:boolean): Variants => ({
  initial:{opacity:0, y:isTop?-12:12, x:isRight?12:-12, scale:0.98},
  animate:{opacity:1, y:0, x:0, scale:1, transition:{duration:0.28, ease:"easeOut"}},
  exit:{opacity:0, y:isTop?-12:12, x:isRight?12:-12, scale:0.98, transition:{duration:0.2}},
});

type Position = "bottom-right"|"bottom-left"|"top-right"|"top-left";

export default function FomoToasts({ position="bottom-right" }: { position?: Position }) {
  const [stack, setStack] = useState<Toast[]>([]);
  const [ready, setReady] = useState(false);
  const [seenNames, setSeenNames] = useState<Map<string, number>>(new Map());
  const [seenAvatars, setSeenAvatars] = useState<Map<string, number>>(new Map());
  const recentRef = useRef<string[]>([]);
  const recentAvatarRef = useRef<string[]>([]);
  const bcRef = useRef<BroadcastChannel|null>(null);

  // — visualViewport offsets (fixes iOS cropping) —
  const [vv, setVv] = useState({ top:0, right:0, bottom:0, left:0 });
  useEffect(() => {
    const calc = () => {
      const v = (window as any).visualViewport;
      if (!v) { setVv({top:0,right:0,bottom:0,left:0}); return; }
      const top = Math.max(0, Math.round(v.offsetTop));
      const left = Math.max(0, Math.round(v.offsetLeft));
      const right = Math.max(0, Math.round(window.innerWidth - v.width - v.offsetLeft));
      const bottom = Math.max(0, Math.round(window.innerHeight - v.height - v.offsetTop));
      setVv({ top, right, bottom, left });
    };
    calc();
    const v = (window as any).visualViewport;
    v?.addEventListener("resize", calc);
    v?.addEventListener("scroll", calc);
    window.addEventListener("orientationchange", calc);
    window.addEventListener("resize", calc);
    return () => {
      v?.removeEventListener("resize", calc);
      v?.removeEventListener("scroll", calc);
      window.removeEventListener("orientationchange", calc);
      window.removeEventListener("resize", calc);
    };
  }, []);

  // Hydrate seen names + avatars + broadcast
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [names, avatars] = await Promise.all([
          readTTLMap(LS_SEEN_NAMES, NAME_TTL_MS),
          readTTLMap(LS_SEEN_AVATARS, AVATAR_TTL_MS),
        ]);
        if (!cancelled) {
          setSeenNames(names);
          setSeenAvatars(avatars);
        }
      } catch {}
      await loadGenderOverrides();
      if (!cancelled) setReady(true);

      try {
        const bc = new BroadcastChannel(BC_CHANNEL);
        bc.onmessage = (e) => {
          (async () => {
            const now = Date.now();
            if (e?.data?.type === "SYNC_SEEN_ENC") {
              const namesObj = await decryptObj<Record<string, number>>(e.data.namesEnc);
              const avatarsObj = await decryptObj<Record<string, number>>(e.data.avatarsEnc);
              if (namesObj) {
                const merged = await readTTLMap(LS_SEEN_NAMES, NAME_TTL_MS);
                for (const [k, ts] of Object.entries(namesObj)) {
                  merged.set(k, Math.max(ts as number, merged.get(k) ?? 0));
                }
                if (!cancelled) setSeenNames(merged);
              }
              if (avatarsObj) {
                const mergedA = await readTTLMap(LS_SEEN_AVATARS, AVATAR_TTL_MS);
                for (const [k, ts] of Object.entries(avatarsObj)) {
                  mergedA.set(k, Math.max(ts as number, mergedA.get(k) ?? 0));
                }
                if (!cancelled) setSeenAvatars(mergedA);
              }
            } else if (e?.data?.type === "SYNC_SEEN") {
              // Back-compat with old tabs (plaintext)
              const { names, avatars } = e.data || {};
              if (names && typeof names === "object") {
                const merged = await readTTLMap(LS_SEEN_NAMES, NAME_TTL_MS);
                for (const [k, ts] of Object.entries(names as Record<string, number>)) {
                  merged.set(k, Math.max(ts as number, merged.get(k) ?? 0));
                }
                if (!cancelled) setSeenNames(merged);
              }
              if (avatars && typeof avatars === "object") {
                const mergedA = await readTTLMap(LS_SEEN_AVATARS, AVATAR_TTL_MS);
                for (const [k, ts] of Object.entries(avatars as Record<string, number>)) {
                  mergedA.set(k, Math.max(ts as number, mergedA.get(k) ?? 0));
                }
                if (!cancelled) setSeenAvatars(mergedA);
              }
            }
          })();
        };
        bcRef.current = bc;
      } catch {
        bcRef.current = null;
      }
    })();
    return () => {
      cancelled = true;
      bcRef.current?.close();
    };
  }, []);

  const persist = async (names: Map<string, number>, avatars: Map<string, number>) => {
    await writeTTLMap(LS_SEEN_NAMES, names, MAX_SEEN_NAMES);
    await writeTTLMap(LS_SEEN_AVATARS, avatars, MAX_SEEN_AVATAR);
    try {
      const namesObj = Object.fromEntries(names);
      const avatarsObj = Object.fromEntries(avatars);
      const namesEnc = await encryptObj(namesObj);
      const avatarsEnc = await encryptObj(avatarsObj);
      bcRef.current?.postMessage({ type: "SYNC_SEEN_ENC", namesEnc, avatarsEnc });
    } catch {}
  };

  const createToast = (visible: Toast[]): Toast | null => {
    if (!ready) return null;

    const visibleNameBan = new Set(visible.map(v => normalize(v.name)));
    const visibleAvatarBan = new Set(visible.map(v => normalizeImg(v.img)));
    const recentNameBan = new Set(recentRef.current.slice(-MAX_RECENT));
    const recentAvatarBan = new Set(recentAvatarRef.current.slice(-MAX_RECENT_AVATARS));

    let tries = 0;
    while (tries < 10) {
      const name = makeUniqueName(seenNames instanceof Map ? new Set(seenNames.keys()) : seenNames);
      const nKey = normalize(name);
      if (visibleNameBan.has(nKey) || recentNameBan.has(nKey) || ttlHas(seenNames, nKey)) { tries++; continue; }

      const img = avatarFor(name);
      const iKey = normalizeImg(img);
      if (visibleAvatarBan.has(iKey) || recentAvatarBan.has(iKey) || ttlHas(seenAvatars, iKey)) { tries++; continue; }

      // Accept this pair and persist
      recentRef.current.push(nKey);
      if (recentRef.current.length > MAX_RECENT * 2)
        recentRef.current.splice(0, recentRef.current.length - MAX_RECENT * 2);

      recentAvatarRef.current.push(iKey);
      if (recentAvatarRef.current.length > MAX_RECENT_AVATARS * 2)
        recentAvatarRef.current.splice(0, recentAvatarRef.current.length - MAX_RECENT_AVATARS * 2);

      const nextNames = new Map(seenNames); ttlAdd(nextNames, nKey); setSeenNames(nextNames);
      const nextAvatars = new Map(seenAvatars); ttlAdd(nextAvatars, iKey); setSeenAvatars(nextAvatars);
      persist(nextNames, nextAvatars);

      const pkg = pickPackage();
      return { id: `fomo-${Date.now()}-${Math.random().toString(36).slice(2)}`, name, img, pkgCode: pkg.code, pkgName: pkg.name };
    }
    return null;
  };

  // Scheduler
  useEffect(() => {
    let t:number|null = null; let cancelled = false;
    const isMobile = () => window.matchMedia("(max-width: 640px)").matches;
    const nextDelay = () => (isMobile()? rangeRand(MOBILE_RANGE) : rangeRand(DESKTOP_RANGE));
    const schedule = (d:number) => { if (!cancelled) t = window.setTimeout(tick, d); };
    const tick = () => {
      if (cancelled) return;
      if (document.visibilityState === "hidden") { schedule(nextDelay()); return; }
      const toast = createToast(stack);
      if (toast) {
        setStack(prev => [...prev, toast].slice(-MAX_STACK));
        window.setTimeout(() => setStack(prev => prev.filter(x => x.id !== toast.id)), AUTO_DISMISS_MS);
      }
      schedule(nextDelay());
    };
    schedule(COLD_START_MS);
    const onVis = () => { if (document.visibilityState === "visible" && t==null) schedule(nextDelay()); };
    document.addEventListener("visibilitychange", onVis);
    return () => { cancelled = true; if (t!=null) clearTimeout(t); document.removeEventListener("visibilitychange", onVis); };
  }, [ready, seenNames, seenAvatars, stack]);

  // Position using safe-area + visualViewport offsets
  const isTop = position.startsWith("top");
  const isRight = position.endsWith("right");
  const GAP = "clamp(12px, 2.4vw, 24px)";

  const insetStyle: CSSProperties = isTop
    ? (isRight
        ? { top: `calc(${GAP} + env(safe-area-inset-top) + ${vv.top}px)`,    right: `calc(${GAP} + env(safe-area-inset-right) + ${vv.right}px)` }
        : { top: `calc(${GAP} + env(safe-area-inset-top) + ${vv.top}px)`,    left:  `calc(${GAP} + env(safe-area-inset-left) + ${vv.left}px)`  })
    : (isRight
        ? { bottom:`calc(${GAP} + env(safe-area-inset-bottom) + ${vv.bottom}px)`, right:`calc(${GAP} + env(safe-area-inset-right) + ${vv.right}px)` }
        : { bottom:`calc(${GAP} + env(safe-area-inset-bottom) + ${vv.bottom}px)`, left: `calc(${GAP} + env(safe-area-inset-left) + ${vv.left}px)`  });

  return (
    <div className="pointer-events-none fixed z-[80] space-y-3" style={insetStyle} aria-live="polite" aria-atomic="true">
      <AnimatePresence>
        {stack.map((t) => (
          <motion.div
            key={t.id}
            variants={toastVariants(isTop, isRight)}
            initial="initial" animate="animate" exit="exit"
            className="pointer-events-auto flex w-[min(92vw,22rem)] items-center gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/90 to-white/90 px-3.5 py-3 pr-3.5 shadow-[0_12px_28px_-12px_rgba(2,25,36,.18),0_2px_6px_rgba(2,25,36,.06)] backdrop-blur-sm sm:w-auto sm:max-w-sm"
            style={{
              maxWidth: `calc(100vw - ${GAP} - ${isRight ? "env(safe-area-inset-right)" : "env(safe-area-inset-left)"} - ${(isRight?vv.right:vv.left)}px)`,
            }}
            role="status"
          >
            <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/30 to-green-300/20 p-[2px] ring-1 ring-emerald-300/60">
              <img
                src={t.img}
                alt={t.name}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-white"
                width={36}
                height={36}
                loading="lazy"
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  const g = genderFor(t.name) === "f" ? "women" : "men";
                  const currentAlt = Number(el.dataset.alt || "0");
                  const nextAlt = (currentAlt + 1) % 100; // cycle 0..99
                  el.dataset.alt = String(nextAlt);
                  el.src = `https://randomuser.me/api/portraits/${g}/${(hash(t.name) + nextAlt) % 100}.jpg`;
                }}
              />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-green-50 text-green-600 ring-1 ring-green-200">
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                </span>
                <span className="truncate text-sm font-semibold text-black">{t.name}</span>
              </div>
              <p className="truncate text-xs leading-4 mt-0.5 text-black/70">
                just purchased <span className="font-semibold text-black/80">{t.pkgCode} · {t.pkgName}</span>
              </p>
            </div>
            <a
              href="/#packages"
              aria-label="View package details"
              className="group ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white no-underline hover:no-underline shadow-sm ring-1 ring-emerald-700/10 transition hover:bg-emerald-700 active:translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              View
              <ChevronRight className="h-3.5 w-3.5 -mr-0.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </a>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}