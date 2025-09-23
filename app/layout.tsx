// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FomoToasts from "../components/FomoToasts";

export const metadata: Metadata = {
  title: {
    default: "Expert Dev Studio",
    template: "%s · Expert Dev Studio",
  },
  description:
    "Elegant by design. Ruthless on performance. Conversion-focused websites and apps.",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    type: "website",
    title: "Expert Dev Studio",
    description:
      "Elegant by design. Ruthless on performance. Conversion-focused websites and apps.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Expert Dev Studio",
    description:
      "Elegant by design. Ruthless on performance. Conversion-focused websites and apps.",
    images: ["/og-image.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&family=Poppins:wght@500;600;700&display=swap"
          rel="stylesheet"
        />

        <link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css"
/>

        {/* Base fonts */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root { color-scheme: light; --header-h: 80px; }
              html, body { height: 100%; }
              body { font-family: Montserrat, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
              h1,h2,h3,.font-display { font-family: Poppins, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
            `,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Fallback styles when Tailwind is unavailable */
              :root{
                --richblack:#00171F;
                --prussian:#003459;
                --cerulean:#007EA7;
                --platinum:#E5E5E5;
                --accent:#FCA311;
              }
              /* Basic container + spacing + helpers */
              .container{max-width:1200px;margin-left:auto;margin-right:auto;padding-left:1rem;padding-right:1rem}
              .mx-auto{margin-left:auto;margin-right:auto}
              .px-4{padding-left:1rem;padding-right:1rem}
              .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
              /* Typography + base colors */
              body{color:var(--richblack);background:#ffffff;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
              a{color:var(--prussian);text-decoration:none}
              a:hover{text-decoration:underline}
              /* General rounded + shadow feel for cards/images that expect Tailwind */
              .rounded-full{border-radius:9999px}
              .shadow-soft{box-shadow:0 10px 30px -15px rgba(0,0,0,.15)}

              /* --- Blend surfaces with background & soften UI --- */
              :root{
                --tw-ring-color: rgba(0,23,31,0.08);
                --surface: rgba(255,255,255,0.96);
                --surface-strong: rgba(255,255,255,0.985);
                --surface-border: rgba(0,23,31,0.06);
                --surface-shadow: 0 6px 24px -18px rgba(0,23,31,0.14), 0 1px 2px rgba(0,23,31,0.05);
              }

              /* Responsive page shell: adaptive gutters & max width */
              :root { --page-max: 1200px; --page-gutter: clamp(16px, 4vw, 40px); }
              .page-shell {
                width: min(var(--page-max), calc(100% - 2*var(--page-gutter)));
                margin-left: auto;
                margin-right: auto;
                padding-left: var(--page-gutter);
                padding-right: var(--page-gutter);
              }
              @media (min-width: 1536px) {
                :root { --page-gutter: clamp(24px, 5vw, 56px); --page-max: 1280px; }
              }

              /* Unified hairline border tone */

              /* Soft surface system: apply ONLY to cards/panels/tiles */
              .card,
              [class~="card"],
              [class*="card"],
              .panel,
              [class~="panel"],
              [class*="panel"],
              .tile,
              [class~="tile"],
              [class*="tile"] {
                background-color: var(--surface) !important;
                border: 1px solid var(--surface-border) !important;
                box-shadow: var(--surface-shadow) !important;
                background-clip: padding-box;
                transition: box-shadow .25s ease, transform .25s ease, background-color .2s ease, border-color .2s ease;
                backdrop-filter: saturate(115%) blur(1.5px);
                -webkit-backdrop-filter: saturate(115%) blur(1.5px);
              }

              /* Slight hover lift for cards/panels only */
              .card:hover,
              [class*="card"]:hover,
              .panel:hover,
              [class*="panel"]:hover,
              .tile:hover,
              [class*="tile"]:hover {
                box-shadow: 0 10px 32px -18px rgba(0,23,31,0.18), 0 2px 6px rgba(0,23,31,0.06) !important;
                transform: translateY(-1px);
              }

              /* If any component relies on ring-1 for outline, keep it hairline only */
              [class*="ring-1"], .ring-1 { box-shadow: none !important; }

              /* Remove any legacy decorative blob/blur backgrounds if still present */
              [class*="blur-3xl"][class*="bg-cerulean"],
              [class*="blur-3xl"][class*="bg-accent"],
              [class*="blur-3xl"][class*="bg-amber"],
              [class*="blur-3xl"][class*="bg-sky"],
              [class*="blur-3xl"][class*="from-"],
              [class*="blur-3xl"][class*="to-"] { display:none !important; }

              /* Make the hero perfectly flat and seamless with the page */
              .hero--flat,
              .hero--flat *,
              .hero--flat::before,
              .hero--flat::after,
              .hero--flat *::before,
              .hero--flat *::after {
                background-color: #ffffff !important;
                background-image: none !important;
                box-shadow: none !important;
                border-color: rgba(0,23,31,0.06) !important;
                filter: none !important;
                -webkit-backdrop-filter: none !important;
                backdrop-filter: none !important;
                mix-blend-mode: normal !important;
                mask: none !important;
                -webkit-mask: none !important;
                outline: none !important;
              }
              /* Hide any absolute-positioned decorative layers inside the hero (blobs, grids, tints) */
              .hero--flat .absolute:not(.hero-overlay) { display: none !important; }
            `,
          }}
        />
        {/* Security hardening + privacy: purge/block sensitive keys and transparently encrypt EDS lists in localStorage */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  try {
    // -------- Settings --------
    // Keys we never want in storage at all (removed + writes ignored)
    const BLOCK_KEYS = [/^admin_jwt$/i, /^__clerk_environment$/i];

    // Keys we DO allow but want to store encrypted (names, avatars, images etc)
    const SENSITIVE_PATTERNS = [
      /^eds_.*seen.*(names|images|avatars)/i,
      /^eds_fomo_.*(names|images|avatars)/i,
      /^eds_seen_testimonial_.*(names|images)/i
    ];

    const shouldBlock = (k) => BLOCK_KEYS.some((r) => r.test(String(k)));
    const shouldEncrypt = (k) => SENSITIVE_PATTERNS.some((r) => r.test(String(k)));

    // Pepper (optional) – you can set NEXT_PUBLIC_LOCAL_ENC_PEPPER in env to rotate
    const PEPPER = (${JSON.stringify(process.env.NEXT_PUBLIC_LOCAL_ENC_PEPPER || "")} || "eds_pepper_dev") + "@" + (location.hostname || "local");
    const ENC_PREFIX = "enc:v1:";

    // -------- Lightweight sync "encryption" (obfuscation) --------
    // Note: This is designed for privacy against casual inspection (DevTools), not strong cryptography.
    const hashStr = (s) => {
      let h = 2166136261 >>> 0; // FNV-1a
      for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619) >>> 0;
      }
      return h >>> 0;
    };
    const keyFromPepper = (() => {
      const h = hashStr(PEPPER);
      const bytes = new Uint8Array(32);
      for (let i = 0; i < bytes.length; i++) bytes[i] = (h >>> ((i % 4) * 8)) & 0xff;
      return bytes;
    })();

    const textToBytes = (t) => {
      const arr = new Uint8Array(t.length);
      for (let i = 0; i < t.length; i++) arr[i] = t.charCodeAt(i) & 0xff;
      return arr;
    };
    const bytesToText = (b) => {
      let s = "";
      for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
      return s;
    };
    const b64encode = (bytes) => {
      let bin = "";
      for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      return btoa(bin);
    };
    const b64decode = (str) => {
      const bin = atob(str);
      const out = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i) & 0xff;
      return out;
    };

    const xorBytes = (data, key) => {
      const out = new Uint8Array(data.length);
      for (let i = 0; i < data.length; i++) out[i] = data[i] ^ key[i % key.length];
      return out;
    };

    const encryptString = (plain) => {
      try {
        const pt = textToBytes(String(plain));
        const ct = xorBytes(pt, keyFromPepper);
        return ENC_PREFIX + b64encode(ct);
      } catch {
        return ENC_PREFIX + btoa(unescape(encodeURIComponent(String(plain))));
      }
    };
    const decryptString = (enc) => {
      try {
        if (!enc || typeof enc !== "string") return enc;
        if (!enc.startsWith(ENC_PREFIX)) return enc;
        const raw = enc.slice(ENC_PREFIX.length);
        const ct = b64decode(raw);
        const pt = xorBytes(ct, keyFromPepper);
        return bytesToText(pt);
      } catch {
        try {
          return decodeURIComponent(escape(atob(String(enc).slice(ENC_PREFIX.length))));
        } catch {
          return "";
        }
      }
    };

    // -------- Purge blocked keys immediately --------
    try {
      const toRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && shouldBlock(key)) toRemove.push(key);
      }
      toRemove.forEach((k) => localStorage.removeItem(k));
    } catch {}

    // -------- Patch getItem / setItem to transparently enc/dec sensitive keys --------
    const _getItem = localStorage.getItem.bind(localStorage);
    const _setItem = localStorage.setItem.bind(localStorage);
    const _removeItem = localStorage.removeItem.bind(localStorage);

    localStorage.setItem = (k, v) => {
      try {
        if (shouldBlock(k)) return; // ignore
        if (shouldEncrypt(k) && typeof v === "string" && !String(v).startsWith(ENC_PREFIX)) {
          v = encryptString(v);
        }
      } catch {}
      return _setItem(k, v);
    };

    localStorage.getItem = (k) => {
      const v = _getItem(k);
      try {
        if (shouldEncrypt(k) && typeof v === "string" && String(v).startsWith(ENC_PREFIX)) {
          return decryptString(v);
        }
      } catch {}
      return v;
    };

    localStorage.removeItem = (k) => {
      if (shouldBlock(k)) return;
      return _removeItem(k);
    };

    // -------- One-time migration of existing plaintext sensitive values --------
    try {
      const toEncrypt = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        if (shouldEncrypt(key)) {
          const val = _getItem(key);
          if (typeof val === "string" && !val.startsWith(ENC_PREFIX)) {
            toEncrypt.push([key, val]);
          }
        }
      }
      toEncrypt.forEach(([k, v]) => {
        try {
          _setItem(k, encryptString(v));
        } catch {}
      });
    } catch {}

  } catch {}
})();`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function(){
              try {
                // Detect if Tailwind utilities exist (compiled CSS)
                var el = document.createElement('div');
                el.className = 'hidden';
                document.body ? document.body.appendChild(el) : document.documentElement.appendChild(el);
                var hasTailwind = getComputedStyle(el).display === 'none';
                el.remove();
                if (hasTailwind) return; // compiled Tailwind is present

                // Provide the same theme tokens for CDN mode
                window.tailwind = {
                  config: {
                    theme: {
                      extend: {
                        colors: {
                          richblack: '#00171F',
                          prussian:  '#003459',
                          cerulean:  '#007EA7',
                          platinum:  '#E5E5E5',
                          accent:    '#FCA311'
                        }
                      }
                    }
                  }
                };
                // Load Tailwind Play CDN as a fallback only
                var s = document.createElement('script');
                s.src = 'https://cdn.tailwindcss.com';
                s.crossOrigin = 'anonymous';
                s.referrerPolicy = 'no-referrer';
                document.head.appendChild(s);
              } catch(e){}
            })();
            `,
          }}
        />
      </head>

      <body
        className="min-h-dvh text-richblack antialiased"
        style={{
          minHeight: "100dvh",
          background: "#ffffff",
          color: "#00171F",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale"
        }}
      >

        {/* Anchor for "Back to top" */}
        <div id="top" className="sr-only" />

        {/* Header component with bottom hairline */}
        <div id="site-header" className="relative z-20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
          <Header />
        </div>
        {/* Dynamically measure header height and expose as CSS var */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try {
        const el = document.getElementById('site-header');
        const setH = () => { if (!el) return; const h = el.offsetHeight; document.documentElement.style.setProperty('--header-h', h + 'px'); };
        setH();
        window.addEventListener('resize', setH, { passive: true });
        window.addEventListener('load', setH);
      } catch (e) {} })();`
          }}
        />
        {/* Page content */}
        <main
          className="page-shell"
          style={{ paddingTop: "var(--header-h)" }}
        >
          {children}
        </main>

        {/* Footer */}
        <Footer />

        {/* Global FOMO popups */}
        <FomoToasts position="bottom-right" />
      </body>
    </html>
  );
}