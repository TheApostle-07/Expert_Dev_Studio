export default function ScoreCard({
  label,
  score,
  icon,
  accentColor,
  ideal = 85,
}: {
  label: string;
  score: number;
  icon?: React.ReactNode;
  accentColor?: string;
  ideal?: number;
}) {
  const accent = accentColor || "#003459";
  const meetsIdeal = score >= ideal;
  const comparisonColor = meetsIdeal ? "#16A34A" : "#DC2626";
  const comparisonText = meetsIdeal ? "Above ideal" : "Below ideal";
  const delta = Math.round(score - ideal);
  const deltaText = `${delta >= 0 ? "+" : ""}${delta}`;
  let priorityLabel = "Critical";
  let priorityColor = "#DC2626";
  let priorityBg = "#FEF2F2";
  if (score >= 80) {
    priorityLabel = "Low";
    priorityColor = "#16A34A";
    priorityBg = "#F0FDF4";
  } else if (score >= 65) {
    priorityLabel = "Medium";
    priorityColor = "#2563EB";
    priorityBg = "#EFF6FF";
  } else if (score >= 40) {
    priorityLabel = "High";
    priorityColor = "#F59E0B";
    priorityBg = "#FFFBEB";
  }
  let statusLabel = "DANGER";
  let statusColor = "#DC2626";
  let statusBg = "#FEF2F2";
  let actionText = "Immediate fixes recommended to reduce risk.";
  const supportText = "Recommended next step: recheck after updates.";
  if (score >= 80) {
    statusLabel = "AMAZING";
    statusColor = "#16A34A";
    statusBg = "#F0FDF4";
    actionText = "Maintain performance and prevent regressions.";
  } else if (score >= 65) {
    statusLabel = "GOOD";
    statusColor = "#2563EB";
    statusBg = "#EFF6FF";
    actionText = "Polish key touchpoints to reach ideal.";
  } else if (score >= 40) {
    statusLabel = "WARNING";
    statusColor = "#F59E0B";
    statusBg = "#FFFBEB";
    actionText = "Focus on key improvements to lift this score.";
  }

  return (
    <div className="flex h-full min-h-[300px] flex-col gap-3 rounded-2xl border border-black/10 bg-white/95 p-4 shadow-[0_12px_30px_-20px_rgba(0,0,0,0.2)]">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.22em] text-black/45">{label}</p>
        {icon ? (
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-full"
            style={{
              color: accent,
              backgroundColor: `${accent}14`,
              boxShadow: `0 0 20px ${accent}55`,
            }}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <div className="flex h-full flex-col gap-3">
        <div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-prussian">{score}</span>
            <span className="text-sm text-black/45">/ 100</span>
          </div>
          <div className="mt-2 grid grid-cols-2 justify-items-center gap-2 text-xs font-semibold">
            <span
              className="inline-flex w-full max-w-[140px] min-w-0 items-center justify-center rounded-full px-2.5 py-1 text-center leading-snug break-words whitespace-normal"
              style={{
                color: comparisonColor,
                backgroundColor: meetsIdeal ? "#F0FDF4" : "#FEF2F2",
              }}
            >
              Delta {deltaText}
            </span>
            <span
              className="inline-flex w-full max-w-[140px] min-w-0 items-center justify-center rounded-full px-2.5 py-1 text-center leading-snug break-words whitespace-normal"
              style={{ color: priorityColor, backgroundColor: priorityBg }}
            >
              Priority {priorityLabel}
            </span>
          </div>
        </div>
        <div className="flex-1">
          <div className="grid gap-2 text-xs text-black/60">
            <div className="flex items-center justify-between">
              <span className="uppercase tracking-[0.2em] text-black/40">Status</span>
              <span
                className="min-w-0 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-snug break-words whitespace-normal text-center"
                style={{ color: statusColor, backgroundColor: statusBg }}
              >
                {statusLabel}
              </span>
            </div>
            <div className="grid gap-2 text-[11px] leading-snug text-black/55">
              <div className="flex min-h-[32px] items-start gap-2">
                <span
                  className="mt-1 h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: statusColor }}
                />
                <span>{actionText}</span>
              </div>
              <div className="flex min-h-[32px] items-start gap-2">
                <span
                  className="mt-1 h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: statusColor }}
                />
                <span>{supportText}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-auto pt-3">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-black/40">
            <span>Actual</span>
            <span>Ideal {ideal}</span>
          </div>
          <div className="relative mt-2 h-2 rounded-full bg-black/10">
            <div
              className="h-2 rounded-full"
              style={{
                width: `${Math.max(0, Math.min(100, score))}%`,
                backgroundColor: comparisonColor,
                boxShadow: `0 0 14px ${comparisonColor}66`,
              }}
            />
            <div
              className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 rounded-full"
              style={{
                left: `${Math.max(0, Math.min(100, ideal))}%`,
                backgroundColor: "rgba(0,52,89,0.5)",
              }}
            />
          </div>
          <p className="mt-2 text-xs font-semibold leading-none" style={{ color: comparisonColor }}>
            {comparisonText}
          </p>
        </div>
      </div>
    </div>
  );
}
