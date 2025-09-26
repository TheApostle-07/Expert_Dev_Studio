"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fadeInUp, MotionSection } from "../../components/ui/motion";
import {
  ShieldCheck,
  FileText,
  Gavel,
  Handshake,
  Receipt,
  Globe,
  ShieldAlert,
  Lock,
  Mail,
  Phone,
  Printer,
  ArrowUpRight,
} from "lucide-react";

// —— Public, environment‑driven knobs with sane fallbacks ————————————————
const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@expertdev.studio";
const CONTACT_PHONE =
  process.env.NEXT_PUBLIC_CONTACT_PHONE || "+91 95103 94742";
const OFFICE_ADDRESS =
  process.env.NEXT_PUBLIC_OFFICE_ADDRESS ||
  "Dubai Design District (d3), Building 1, Dubai, UAE";
const GOVERNING_LAW =
  process.env.NEXT_PUBLIC_TOS_GOVERNING_LAW || "United Arab Emirates";
const VENUE = process.env.NEXT_PUBLIC_TOS_VENUE || "Dubai, UAE";

const SECTIONS = [
  { id: "intro", label: "Overview" },
  { id: "acceptance", label: "Acceptance of terms" },
  { id: "scope", label: "Scope of services" },
  { id: "proposals", label: "Proposals & SOWs" },
  { id: "fees", label: "Fees & payments" },
  { id: "taxes", label: "Taxes" },
  { id: "ip", label: "Intellectual property" },
  { id: "client-materials", label: "Client materials" },
  { id: "oss", label: "Open‑source software" },
  { id: "confidentiality", label: "Confidentiality" },
  { id: "publicity", label: "Publicity" },
  { id: "compliance", label: "Compliance & privacy" },
  { id: "warranties", label: "Warranties & disclaimers" },
  { id: "liability", label: "Limitation of liability" },
  { id: "indemnity", label: "Indemnification" },
  { id: "third-party", label: "Third‑party services" },
  { id: "acceptable-use", label: "Acceptable use" },
  { id: "termination", label: "Term & termination" },
  { id: "force-majeure", label: "Force majeure" },
  { id: "governing-law", label: "Governing law & disputes" },
  { id: "changes", label: "Changes to these terms" },
  { id: "contact", label: "Contact" },
] as const;

export default function TermsPage() {
  // Stable "Last updated" — fix hydration by pinning locale & timezone
  const UPDATED_ISO = process.env.NEXT_PUBLIC_TOS_LAST_UPDATED || "2025-08-30";
  const updated = new Date(`${UPDATED_ISO}T00:00:00Z`);
  const updatedText = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "2-digit",
  }).format(updated);

  // Active section highlight (scroll spy) — match Privacy page behavior
  const [activeId, setActiveId] = useState<(typeof SECTIONS)[number]["id"]>("intro");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibles = entries.filter((e) => e.isIntersecting);
        if (visibles.length) {
          const topmost = visibles.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
          const id = (topmost.target as HTMLElement).id;
          if (id) setActiveId(id as (typeof SECTIONS)[number]["id"]);
        }
      },
      { root: null, rootMargin: "0px 0px -60% 0px", threshold: 0.2 }
    );

    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* HERO */}
      <section
        className="hero--flat relative border-b border-black/5 bg-transparent"
        aria-labelledby="terms-title"
      >
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <MotionSection amount={0.25} className="pt-24 pb-16 sm:pt-28 sm:pb-20 md:pt-32 md:pb-24">
            <motion.span
              variants={fadeInUp}
              className="mx-auto flex w-max items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs font-medium text-black/80 shadow-sm backdrop-blur"
            >
              <span aria-hidden className="h-2 w-2 rounded-full bg-cerulean"></span>
              Legal & Terms
            </motion.span>

            <motion.h1
              id="terms-title"
              variants={fadeInUp}
              className="mt-6 mx-auto max-w-5xl text-center font-display text-6xl font-bold tracking-[-0.02em] leading-[1.06] sm:text-7xl"
            >
              <span className="block text-richblack">Terms of Service</span>
              <span className="block text-cerulean">Clear, Calm & Fair</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mt-5 mx-auto max-w-3xl text-center text-base leading-8 tracking-[0.01em] text-black/70 sm:text-lg"
            >
              These are the rules for using our website and working with Expert Dev Studio—written plainly so you know exactly what to expect.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="mt-4 flex flex-col items-center gap-2 text-xs text-black/60 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3"
            >
              <span className="inline-flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                <span>Last updated:</span>
                <time dateTime={updated.toISOString()} suppressHydrationWarning>
                  {updatedText}
                </time>
              </span>
              <span aria-hidden className="hidden select-none sm:inline">•</span>
              <button
                onClick={() => window.print()}
                className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black shadow-sm hover:bg-black/5 sm:mt-0 print:hidden"
              >
                <Printer className="h-3.5 w-3.5" />
                Print
              </button>
            </motion.div>
          </MotionSection>
        </div>
      </section>

      {/* CONTENT */}
      <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Sticky quick‑nav on lg+ */}
          <aside className="lg:col-span-3">
            <div className="sticky top-20 hidden lg:block print:hidden">
              <nav aria-label="On this page" className="space-y-2">
                {SECTIONS.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    aria-current={activeId === s.id ? "true" : undefined}
                    className={`block rounded-lg border px-3 py-2 text-xs transition ${
                      activeId === s.id
                        ? "bg-prussian text-white border-prussian"
                        : "bg-white text-black/70 border-black/10 hover:bg-black/5"
                    }`}
                  >
                    {s.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main col */}
          <div className="lg:col-span-9">
            <MotionSection amount={0.2} className="space-y-10">
              {/* OVERVIEW */}
              <motion.section id="intro" variants={fadeInUp} className="scroll-mt-28">
                <h2 className="font-display text-2xl font-semibold">Overview</h2>
                <p className="mt-2 text-sm leading-relaxed text-black/70">
                  These Terms of Service ("Terms") govern your access to and use of the website
                  and services provided by Expert Dev Studio ("we", "us"). By accessing our site
                  or engaging our services, you agree to these Terms. If you are entering into
                  these Terms on behalf of a company, you represent that you have authority to
                  bind that company.
                </p>
              </motion.section>

              {/* ACCEPTANCE */}
              <motion.section id="acceptance" variants={fadeInUp} className="scroll-mt-28">
                <h2 className="font-display text-2xl font-semibold">Acceptance of terms</h2>
                <p className="mt-2 text-sm text-black/70">
                  You must be at least 18 years old (or the age of majority in your jurisdiction)
                  and capable of forming a binding contract. If you do not agree to these Terms,
                  do not use the site or services.
                </p>
              </motion.section>

              {/* SCOPE */}
              <motion.section id="scope" variants={fadeInUp} className="scroll-mt-28">
                <h2 className="font-display text-2xl font-semibold">Scope of services</h2>
                <p className="mt-2 text-sm text-black/70">
                  We offer product, design, and engineering services including websites, web apps,
                  and related deliverables. The specific scope, timeline, and deliverables for a
                  project are defined in a written proposal or statement of work ("SOW").
                </p>
              </motion.section>

              {/* PROPOSALS & SOWS */}
              <motion.section id="proposals" variants={fadeInUp} className="scroll-mt-28">
                <h2 className="font-display text-2xl font-semibold">Proposals &amp; SOWs</h2>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-black/70">
                  <li>Quotes are valid for the period stated (or 30 days if unspecified).</li>
                  <li>Work begins after written acceptance and initial payment (if applicable).</li>
                  <li>Change requests may affect scope, fees, and timeline; we’ll confirm impacts in writing.</li>
                </ul>
              </motion.section>

              {/* FEES */}
              <motion.section id="fees" variants={fadeInUp} className="scroll-mt-28">
                <h2 className="font-display text-2xl font-semibold">Fees &amp; payments</h2>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-black/70">
                  <li>Unless otherwise stated, invoices are due within 7 days.</li>
                  <li>Late payments may pause work and may incur interest as permitted by law.</li>
                  <li>Upfront deposits, milestones, or retainers will be specified in the SOW.</li>
                  <li>International payments are accepted; bank, card, or gateway fees are your responsibility.</li>
                </ul>
              </motion.section>

              {/* TAXES */}
              <motion.section id="taxes" variants={fadeInUp} className="scroll-mt-28">
                <h2 className="font-display text-2xl font-semibold">Taxes</h2>
                <p className="mt-2 text-sm text-black/70">
                  Fees are exclusive of taxes unless stated. You are responsible for applicable
                  taxes, duties, and levies (excluding our income taxes).
                </p>
              </motion.section>

              {/* IP */}
              <motion.section id="ip" variants={fadeInUp} className="scroll-mt-28">
                <h2 className="font-display text-2xl font-semibold">Intellectual property</h2>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-black/70">
                  <li>
                    <span className="font-medium">Pre‑existing materials</span>: Each party retains ownership of
                    its pre‑existing IP. We grant you a license to use ours solely to the extent
                    needed for the deliverables.
                  </li>
                  <li>
                    <span className="font-medium">Deliverables</span>: Upon full payment, you receive a worldwide,
                    perpetual license to use, display, and operate the deliverables for your
                    business. If your SOW states IP assignment, we’ll assign ownership on receipt
                    of final payment.
                  </li>
                  <li>
                    <span className="font-medium">Tools &amp; libraries</span>: Our internal tools, templates, and
                    know‑how aren’t transferred, but we may use them to produce deliverables.
                  </li>
                </ul>
              </motion.section>

              {/* CLIENT MATERIALS */}
              <motion.section id="client-materials" variants={fadeInUp} className="scroll-mt-28">
                <h2 className="font-display text-2xl font-semibold">Client materials</h2>
                <p className="mt-2 text-sm text-black/70">
                  You represent that you have the necessary rights to all materials you provide to
                  us, and you grant us a limited license to use them to deliver the project.
                </p>
              </motion.section>

              {/* OSS */}
              <motion.section id="oss" variants={fadeInUp} className="scroll-mt-28">
                <h2 className="font-display text-2xl font-semibold">Open‑source software</h2>
                <p className="mt-2 text-sm text-black/70">
                  Deliverables may include open‑source components governed by their respective
                  licenses. Where practical, we will document key licenses and obligations.
                </p>
              </motion.section>

              {/* CONFIDENTIALITY */}
              <motion.section id="confidentiality" variants={fadeInUp} className="scroll-mt-28">
                <h2 className="font-display text-2xl font-semibold">Confidentiality</h2>
                <p className="mt-2 text-sm text-black/70">
                  Non‑public information disclosed by either party should be treated as
                  confidential and used only for performing the project, except where disclosure is
                  required by law. We are happy to sign a mutual NDA upon request.
                </p>
              </motion.section>

              {/* PUBLICITY */}
              <motion.section id="publicity" variants={fadeInUp} className="scroll-mt-28">
                <h2 className="font-display text-2xl font-semibold">Publicity</h2>
                <p className="mt-2 text-sm text-black/70">
                  With your permission, we may reference your name, logo, and project outcomes in
                  our portfolio and marketing. If you prefer not to be referenced, let us know and
                  we’ll honour it.
                </p>
              </motion.section>

              {/* COMPLIANCE & PRIVACY */}
              <motion.section id="compliance" variants={fadeInUp} className="scroll-mt-28">
                <h2 className="font-display text-2xl font-semibold">Compliance &amp; privacy</h2>
                <p className="mt-2 text-sm text-black/70">
                  We aim for privacy‑respecting implementations. If processing personal data on
                  your behalf, we can execute a data processing addendum (DPA). Please also see
                  our Privacy Policy for details on how we handle personal data.
                </p>
              </motion.section>

              {/* WARRANTIES */}
              <motion.section id="warranties" variants={fadeInUp} className="scroll-mt-28">
                <h2 className="font-display text-2xl font-semibold">Warranties &amp; disclaimers</h2>
                <p className="mt-2 text-sm text-black/70">
                  We provide services with reasonable skill and care. EXCEPT AS EXPRESSLY STATED,
                  THE SERVICES AND SITE ARE PROVIDED “AS IS” WITHOUT WARRANTIES OF ANY KIND,
                  WHETHER EXPRESS, IMPLIED, OR STATUTORY (INCLUDING MERCHANTABILITY, FITNESS FOR A
                  PARTICULAR PURPOSE, AND NON‑INFRINGEMENT).
                </p>
              </motion.section>

              {/* LIABILITY */}
              <motion.section id="liability" variants={fadeInUp} className="scroll-mt-28">
                <h2 className="font-display text-2xl font-semibold">Limitation of liability</h2>
                <p className="mt-2 text-sm text-black/70">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEITHER PARTY WILL BE LIABLE FOR ANY
                  INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS
                  OF PROFITS, REVENUE, DATA, OR GOODWILL. OUR AGGREGATE LIABILITY UNDER THESE
                  TERMS IS LIMITED TO THE AMOUNTS PAID BY YOU FOR THE SERVICES GIVING RISE TO THE
                  CLAIM IN THE 3 MONTHS PRECEDING THE EVENT.
                </p>
              </motion.section>

              {/* INDEMNITY */}
              <motion.section id="indemnity" variants={fadeInUp} className="scroll-mt-28">
                <h2 className="font-display text-2xl font-semibold">Indemnification</h2>
                <p className="mt-2 text-sm text-black/70">
                  Each party will defend and indemnify the other from third‑party claims to the
                  extent arising from the indemnifying party’s breach of these Terms or
                  infringement of third‑party rights, subject to prompt notice and reasonable
                  cooperation.
                </p>
              </motion.section>

              {/* THIRD‑PARTY */}
              <motion.section id="third-party" variants={fadeInUp} className="scroll-mt-28">
                <h2 className="font-display text-2xl font-semibold">Third‑party services</h2>
                <p className="mt-2 text-sm text-black/70">
                  We may integrate or rely on third‑party services (e.g., hosting, analytics,
                  payments). Your use of them may be subject to their terms and privacy policies.
                </p>
              </motion.section>

              {/* ACCEPTABLE USE */}
              <motion.section id="acceptable-use" variants={fadeInUp} className="scroll-mt-28">
                <h2 className="font-display text-2xl font-semibold">Acceptable use</h2>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-black/70">
                  <li>No unlawful, harmful, or abusive activities using the site or deliverables.</li>
                  <li>No attempts to breach security, reverse engineer, or disrupt service.</li>
                  <li>Respect IP rights, privacy, and applicable laws.</li>
                </ul>
              </motion.section>

              {/* TERMINATION */}
              <motion.section id="termination" variants={fadeInUp} className="scroll-mt-28">
                <h2 className="font-display text-2xl font-semibold">Term &amp; termination</h2>
                <p className="mt-2 text-sm text-black/70">
                  Either party may terminate an SOW for material breach not cured within 10 days of
                  written notice. Upon termination, you will pay for work performed up to the
                  effective date. Rights intended to survive (e.g., IP, payment, confidentiality)
                  will survive.
                </p>
              </motion.section>

              {/* FORCE MAJEURE */}
              <motion.section id="force-majeure" variants={fadeInUp} className="scroll-mt-28">
                <h2 className="font-display text-2xl font-semibold">Force majeure</h2>
                <p className="mt-2 text-sm text-black/70">
                  Neither party is liable for delays or failures due to events beyond reasonable
                  control (e.g., natural disasters, outages, war, governmental actions), provided
                  reasonable mitigation efforts are taken.
                </p>
              </motion.section>

              {/* GOVERNING LAW */}
              <motion.section id="governing-law" variants={fadeInUp} className="scroll-mt-28">
                <h2 className="font-display text-2xl font-semibold">Governing law &amp; disputes</h2>
                <p className="mt-2 text-sm text-black/70">
                  These Terms are governed by the laws of {GOVERNING_LAW}, without regard to
                  conflict‑of‑laws principles. The exclusive venue for disputes is the courts of
                  {" "}
                  {VENUE}. The U.N. Convention on Contracts for the International Sale of Goods
                  does not apply.
                </p>
              </motion.section>

              {/* CHANGES */}
              <motion.section id="changes" variants={fadeInUp} className="scroll-mt-28">
                <h2 className="font-display text-2xl font-semibold">Changes to these terms</h2>
                <p className="mt-2 text-sm text-black/70">
                  We may update these Terms from time to time. Changes become effective when
                  posted. If the changes are material, we will provide a more prominent notice.
                </p>
              </motion.section>

              {/* CONTACT */}
              <motion.section id="contact" variants={fadeInUp} className="scroll-mt-28">
                <h2 className="font-display text-2xl font-semibold">Contact</h2>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-black/10 bg-white p-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-cerulean" />
                      <div className="text-sm font-semibold">Email</div>
                    </div>
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="mt-1 block text-sm text-prussian underline decoration-black/20 underline-offset-2"
                    >
                      {CONTACT_EMAIL}
                    </a>
                  </div>
                  <div className="rounded-2xl border border-black/10 bg-white p-4">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-cerulean" />
                      <div className="text-sm font-semibold">Phone</div>
                    </div>
                    <a
                      href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`}
                      className="mt-1 block text-sm text-black/70"
                    >
                      {CONTACT_PHONE}
                    </a>
                  </div>
                  <div className="rounded-2xl border border-black/10 bg-white p-4 sm:col-span-2">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-cerulean" />
                      <div className="text-sm font-semibold">Address</div>
                    </div>
                    <p className="mt-1 text-sm text-black/70">{OFFICE_ADDRESS}</p>
                  </div>
                </div>

                <a
                  href="/contact"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#FCA311_0%,#FFD56A_100%)] px-4 py-2 text-sm font-semibold text-black shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)] ring-2 ring-black/5 hover:opacity-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cerulean/50 print:hidden"
                >
                  Talk to us
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </motion.section>
            </MotionSection>
          </div>
        </div>
      </section>

      {/* SEO: structured data */}
      <style jsx global>{`
        html:focus-within{scroll-behavior:smooth}
        @media (prefers-reduced-motion: reduce){
          html:focus-within{scroll-behavior:auto}
        }
      `}</style>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Terms of Service",
            url: "https://expertdev.studio/terms",
            about: "Terms governing the use of Expert Dev Studio website and services",
            dateModified: updated.toISOString(),
            publisher: {
              "@type": "Organization",
              name: "Expert Dev Studio",
            },
          }),
        }}
      />
    </>
  );
}
