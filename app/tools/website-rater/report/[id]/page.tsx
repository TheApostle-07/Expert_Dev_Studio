import Link from "next/link";
import { notFound } from "next/navigation";
import { connectToDatabase } from "../../../../../lib/mongodb";
import { AuditModel } from "../../../../../lib/models/Audit";
import ScoreCard from "../../../../../components/website-rater/ScoreCard";
import PaywallModal from "../../../../../components/website-rater/PaywallModal";
import PaywallOverlayTrigger from "../../../../../components/website-rater/PaywallOverlayTrigger";
import ScanStatusWatcher from "../../../../../components/website-rater/ScanStatusWatcher";
import SnapshotActions from "../../../../../components/website-rater/SnapshotActions";
import ScoreChart from "../../../../../components/website-rater/ScoreChart";
import ScoreComparisonBars from "../../../../../components/website-rater/ScoreComparisonBars";
import { LABEL_STYLES, type Label } from "../../../../../lib/scoring";
import {
  AlertTriangle,
  Gauge,
  Search,
  Sparkles,
  Target,
  ThumbsUp,
  Type,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";

export default async function WebsiteRaterReport({
  params,
}: {
  params: { id: string };
}) {
  await connectToDatabase();
  const audit = await AuditModel.findById(params.id).lean();

  if (!audit) {
    notFound();
  }

  const preview = (audit.preview || {}) as {
    miniScores?: { seo: number; funnel: number; copy: number; speed: number };
    criticalIssues?: string[];
    quickWins?: string[];
    notes?: { analyzedUrl?: string; htmlKb?: number; logoUrl?: string };
  };

  const label = (audit.label || "WARNING") as Label;
  const labelStyle = LABEL_STYLES[label];
  const VerdictIcon = {
    DANGER: ShieldAlert,
    WARNING: AlertTriangle,
    GOOD: ThumbsUp,
    AMAZING: Sparkles,
  }[label];

  const analyzedUrl = preview.notes?.analyzedUrl || audit.urlNormalized;
  const logoUrl = preview.notes?.logoUrl;
  const lockedPreview = {
    miniScores: { seo: 72, funnel: 64, copy: 61, speed: 58 },
    criticalIssues: [
      "Unlock to reveal the top conversion blockers.",
      "Detailed performance signals are hidden until unlocked.",
      "Priority fixes appear after full report unlock.",
    ],
    quickWins: [
      "Unlock to see quick wins tailored to this page.",
      "We surface the fastest wins after payment.",
      "Actionable improvements are shown after unlock.",
    ],
    notes: { analyzedUrl },
  };
  const displayPreview = audit.isUnlocked ? preview : lockedPreview;
  const miniScores = displayPreview.miniScores || {
    seo: 0,
    funnel: 0,
    copy: 0,
    speed: 0,
  };
  const statusNotice =
    audit.status === "QUEUED"
      ? {
          title: "Scan queued",
          message: "We are preparing your scan. This page will refresh automatically.",
          color: "#2563EB",
          bg: "#EFF6FF",
        }
      : audit.status === "RUNNING"
        ? {
            title: "Scanning now",
            message: "We are analyzing your page. This usually takes under a minute.",
            color: "#F59E0B",
            bg: "#FFFBEB",
          }
        : audit.status === "FAILED"
          ? {
              title: "Scan failed",
              message: audit.scanError || "We could not complete this scan. Please try again.",
              color: "#DC2626",
              bg: "#FEF2F2",
            }
          : null;

  return (
    <div className="min-h-screen bg-transparent text-black">
      <div className="page-shell pb-16 pt-24 sm:pt-28 md:pt-32">
        <Link href="/tools/website-rater" className="reveal text-sm text-black/60">
          ← Back to Website Rater
        </Link>

        <div className="mt-8 grid gap-8">
          <div className="space-y-8">
            {audit.status !== "DONE" && audit.status !== "FAILED" ? (
              <ScanStatusWatcher
                auditId={audit._id.toString()}
                status={audit.status}
              />
            ) : null}
            {statusNotice ? (
              <div
                className="rounded-2xl border border-black/10 bg-white/90 p-4 text-sm text-black/70 shadow-[0_12px_32px_-24px_rgba(0,0,0,0.2)]"
                style={{ backgroundColor: statusNotice.bg }}
              >
                <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                  <span
                    className="inline-flex h-2 w-2 rounded-full"
                    style={{ backgroundColor: statusNotice.color }}
                  />
                  <span style={{ color: statusNotice.color }}>
                    {statusNotice.title}
                  </span>
                </div>
                <p className="mt-2 text-sm text-black/65">
                  {statusNotice.message}
                </p>
              </div>
            ) : null}
            <div className="reveal reveal-delay-1 overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_18px_50px_-28px_rgba(0,0,0,0.28)]">
              <div className="relative">
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${labelStyle.bg} 0%, #ffffff 60%)`,
                  }}
                />
                <div
                  className="absolute -right-16 -top-16 h-44 w-44 rounded-full"
                  style={{ backgroundColor: `${labelStyle.badge}1A` }}
                />
                <div className="relative px-5 py-6 md:px-8 md:py-8">
                  <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <span
                        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-none"
                        style={{
                          color: labelStyle.badge,
                          backgroundColor: labelStyle.bg,
                        }}
                      >
                        {label}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-black/10 px-3 py-1 text-[11px] font-semibold leading-none text-black/55">
                        Live scan
                      </span>
                    </div>
                    <div
                      className="mt-4 flex h-20 w-20 items-center justify-center rounded-full border border-black/5 bg-white"
                      style={{
                        boxShadow: `0 0 30px ${labelStyle.badge}55`,
                      }}
                    >
                      <VerdictIcon
                        className="h-8 w-8"
                        style={{ color: labelStyle.badge }}
                        aria-hidden
                      />
                    </div>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs text-black/60">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-black/10 bg-white">
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt="Site logo"
                            className="h-3.5 w-3.5 rounded-full object-contain"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: labelStyle.badge }}
                          />
                        )}
                      </span>
                      <span className="max-w-[360px] truncate">
                        {analyzedUrl}
                      </span>
                    </div>
                    <h1
                      className="mt-4 text-4xl font-semibold md:text-5xl"
                      style={{ color: labelStyle.badge }}
                    >
                      {label}
                    </h1>
                    <div className="mt-3">
                      <div className="rounded-xl border border-black/10 bg-white/80 px-6 py-3 text-center shadow-sm backdrop-blur">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-black/40">
                          Score
                        </p>
                        <p
                          className="mt-1 text-3xl font-semibold leading-none"
                          style={{ color: labelStyle.badge }}
                        >
                          {audit.scoreOverall ?? "--"}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-black/70">
                      Instant scan highlights risk level and conversion readiness.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              {!audit.isUnlocked ? <PaywallOverlayTrigger /> : null}
              <div
                className={`reveal reveal-delay-2 grid gap-6 xl:grid-cols-[1.2fr_0.8fr] ${
                  audit.isUnlocked ? "" : "blur-[4px] opacity-80"
                }`}
              >
                <div className="rounded-2xl border border-black/10 bg-white/95 p-6 shadow-[0_14px_34px_-24px_rgba(0,0,0,0.22)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-black/50">
                        Performance map
                      </p>
                        <h3 className="mt-2 text-lg font-semibold text-prussian">
                          Where your site stands
                        </h3>
                      </div>
                      <span className="text-xs text-black/50">0–100</span>
                    </div>
                    <div className="mt-4 grid gap-6">
                      <ScoreChart scores={miniScores} ideal={85} />
                      <div className="flex flex-wrap items-center gap-4 text-xs text-black/60">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#007EA7]" />
                          Your site
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#003459]/20" />
                          Ideal (85)
                        </span>
                      </div>
                      <div className="rounded-xl border border-black/10 bg-white p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs uppercase tracking-[0.2em] text-black/50">
                            Benchmark comparison
                          </p>
                          <span className="text-xs text-black/50">Actual vs Ideal</span>
                        </div>
                        <div className="mt-3">
                          <ScoreComparisonBars scores={miniScores} ideal={85} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <ScoreCard
                      label="SEO"
                      score={miniScores.seo}
                      icon={<Search className="h-4 w-4" aria-hidden />}
                      accentColor="#007EA7"
                      ideal={85}
                    />
                    <ScoreCard
                      label="Funnel"
                      score={miniScores.funnel}
                      icon={<Target className="h-4 w-4" aria-hidden />}
                      accentColor="#FCA311"
                      ideal={85}
                    />
                    <ScoreCard
                      label="Copy"
                      score={miniScores.copy}
                      icon={<Type className="h-4 w-4" aria-hidden />}
                      accentColor="#003459"
                      ideal={85}
                    />
                    <ScoreCard
                      label="Speed"
                      score={miniScores.speed}
                      icon={<Gauge className="h-4 w-4" aria-hidden />}
                      accentColor="#16A34A"
                      ideal={85}
                    />
                  </div>
                </div>

              <div
                className={`reveal reveal-delay-3 mt-4 grid gap-6 md:grid-cols-2 ${
                  audit.isUnlocked ? "" : "blur-[4px] opacity-80"
                }`}
              >
                  <div className="rounded-2xl border border-black/10 bg-white/95 p-5 shadow-[0_10px_30px_-22px_rgba(0,0,0,0.2)]">
                    <div className="flex flex-col items-center gap-2 text-center text-sm font-semibold text-prussian sm:flex-row sm:items-center sm:text-left">
                      <AlertTriangle className="h-5 w-5 text-[#DC2626]" aria-hidden />
                      Top issues
                    </div>
                    <ul className="mt-4 space-y-3 text-sm text-black/70">
                      {(displayPreview.criticalIssues || []).map((issue, index) => (
                        <li key={`${issue}-${index}`} className="flex gap-3">
                          <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#DC2626]/10 text-xs font-semibold text-[#DC2626]">
                            {index + 1}
                          </span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-black/10 bg-white/95 p-5 shadow-[0_10px_30px_-22px_rgba(0,0,0,0.2)]">
                    <div className="flex flex-col items-center gap-2 text-center text-sm font-semibold text-prussian sm:flex-row sm:items-center sm:text-left">
                      <Sparkles className="h-5 w-5 text-[#16A34A]" aria-hidden />
                      Quick wins
                    </div>
                    <ul className="mt-4 space-y-3 text-sm text-black/70">
                      {(displayPreview.quickWins || []).map((win, index) => (
                        <li key={`${win}-${index}`} className="flex gap-3">
                          <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#16A34A]/10 text-xs font-semibold text-[#16A34A]">
                            {index + 1}
                          </span>
                          <span>{win}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

            {audit.isUnlocked && audit.fullReport ? (
              <div className="space-y-6">
                <div className="rounded-2xl border border-black/10 bg-white/90 p-6 shadow-[0_10px_30px_-22px_rgba(0,0,0,0.2)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-prussian">Full report</h2>
                    <a
                      href={`/api/website-rater/report/${audit._id.toString()}/download`}
                      className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-prussian transition hover:bg-black/5"
                    >
                      Download report
                    </a>
                  </div>
                  <p className="mt-2 text-sm text-black/70">
                    {audit.fullReport.summary?.headline}
                  </p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-black/10 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-black/50">
                        Overall score
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-prussian">
                        {audit.fullReport.summary?.scoreOverall}
                      </p>
                    </div>
                    <div className="rounded-xl border border-black/10 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-black/50">
                        HTML size
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-prussian">
                        {audit.fullReport.summary?.htmlKb} KB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  {(audit.fullReport.sections || []).map((section: {
                    title: string;
                    score: number;
                    findings: string[];
                    recommendations: string[];
                  }) => {
                    const score = section.score ?? 0;
                    let color = "#DC2626";
                    let bg = "#FEF2F2";
                    if (score >= 80) {
                      color = "#16A34A";
                      bg = "#F0FDF4";
                    } else if (score >= 65) {
                      color = "#2563EB";
                      bg = "#EFF6FF";
                    } else if (score >= 40) {
                      color = "#F59E0B";
                      bg = "#FFFBEB";
                    }
                    return (
                      <details
                        key={section.title}
                        className="group rounded-2xl border border-black/10 border-l-4 bg-white/95 p-6 shadow-[0_10px_30px_-22px_rgba(0,0,0,0.2)]"
                        style={{ borderLeftColor: color }}
                      >
                        <summary className="flex cursor-pointer items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold"
                              style={{ color, backgroundColor: bg }}
                            >
                              {score}
                            </span>
                            <div>
                              <h3 className="text-base font-semibold" style={{ color }}>
                                {section.title}
                              </h3>
                              <p className="text-xs text-black/50">
                                <span className="group-open:hidden">
                                  Tap to view recommendations
                                </span>
                                <span className="hidden group-open:inline">
                                  Hide recommendations
                                </span>
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-black/40" aria-hidden />
                        </summary>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-black/50">
                              Findings
                            </p>
                            <ul className="mt-3 space-y-2 text-sm text-black/70">
                              {section.findings.map((item, index) => (
                                <li key={`${section.title}-finding-${index}`}>
                                  • {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-black/50">
                              Recommendations
                            </p>
                            <ul className="mt-3 space-y-2 text-sm text-black/70">
                              {section.recommendations.map((item, index) => (
                                <li key={`${section.title}-rec-${index}`}>
                                  • {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </details>
                    );
                  })}
                </div>

                <div className="rounded-2xl border border-black/10 bg-white/90 p-6 shadow-[0_10px_30px_-22px_rgba(0,0,0,0.2)]">
                  <h3 className="text-sm font-semibold text-prussian">Next steps</h3>
                  <ul className="mt-4 space-y-2 text-sm text-black/70">
                    {(audit.fullReport.nextSteps || []).map((step: string) => (
                      <li key={step}>• {step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            {audit.isUnlocked ? (
              <div className="rounded-2xl border border-black/10 bg-white/95 p-5 shadow-[0_10px_30px_-22px_rgba(0,0,0,0.2)]">
                <p className="text-xs uppercase tracking-[0.3em] text-black/50">
                  Snapshot
                </p>
                <p className="mt-3 text-sm text-black/70">
                  HTML size: {preview.notes?.htmlKb ?? 0} KB
                </p>
                <p className="mt-1 text-sm text-black/70">
                  URL: {preview.notes?.analyzedUrl || audit.urlNormalized}
                </p>
                <SnapshotActions
                  auditId={audit._id.toString()}
                  snapshotSavedAt={audit.snapshotSavedAt?.toISOString?.()}
                />
              </div>
            ) : null}
          </div>

          {!audit.isUnlocked ? (
            <div className="reveal reveal-delay-2 space-y-6">
              <PaywallModal
                auditId={audit._id.toString()}
                basePriceInr={audit.basePriceInr}
                finalPriceInr={audit.finalPriceInr}
                isUnlocked={audit.isUnlocked}
                paidAt={audit.paidAt?.toISOString?.()}
                leadName={audit.leadName}
                leadEmail={audit.leadEmail}
                leadPhone={audit.leadPhone}
                leadConsentAt={audit.leadConsentAt?.toISOString?.()}
              />
              <div className="rounded-2xl border border-black/10 bg-white/95 p-5 shadow-[0_10px_30px_-22px_rgba(0,0,0,0.2)]">
                <p className="text-xs uppercase tracking-[0.3em] text-black/50">
                  Snapshot
                </p>
                <p className="mt-3 text-sm text-black/70">
                  Unlock the report to view and save snapshot details.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
