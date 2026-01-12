"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

const GREEN = "#16A34A";
const RED = "#DC2626";

type TooltipPayload = {
  payload?: {
    actual?: number;
    ideal?: number;
  };
};

function ComparisonTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload || {};
  const actual = typeof data.actual === "number" ? data.actual : 0;
  const ideal = typeof data.ideal === "number" ? data.ideal : 0;
  const color = actual >= ideal ? GREEN : RED;

  return (
    <div className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs text-black shadow-[0_12px_30px_-20px_rgba(0,0,0,0.2)]">
      <p className="text-[11px] uppercase tracking-[0.2em] text-black/50">
        {label}
      </p>
      <p className="mt-1 font-semibold" style={{ color }}>
        Actual {actual}
      </p>
      <p className="text-black/50">Ideal {ideal}</p>
    </div>
  );
}

type ScoreComparisonBarsProps = {
  scores: {
    seo: number;
    funnel: number;
    copy: number;
    speed: number;
  };
  ideal?: number;
};

const buildData = (scores: ScoreComparisonBarsProps["scores"], ideal: number) => [
  { metric: "SEO", actual: scores.seo, ideal },
  { metric: "Funnel", actual: scores.funnel, ideal },
  { metric: "Copy", actual: scores.copy, ideal },
  { metric: "Speed", actual: scores.speed, ideal },
];

export default function ScoreComparisonBars({ scores, ideal = 85 }: ScoreComparisonBarsProps) {
  const data = buildData(scores, ideal);

  return (
    <div className="w-full">
      <div className="hidden h-56 md:block">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            barSize={18}
            barGap={8}
            margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
          >
            <CartesianGrid stroke="rgba(0,52,89,0.08)" vertical={false} />
            <XAxis
              dataKey="metric"
              tick={{ fill: "#003459", fontSize: 12, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "rgba(0,52,89,0.45)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip cursor={{ fill: "rgba(0,52,89,0.05)" }} content={<ComparisonTooltip />} />
            <Bar dataKey="ideal" fill="rgba(0,52,89,0.12)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="actual" radius={[6, 6, 0, 0]}>
              {data.map((entry) => (
                <Cell
                  key={`cell-${entry.metric}`}
                  fill={entry.actual >= entry.ideal ? GREEN : RED}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="h-64 md:hidden">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            barSize={14}
            barGap={6}
            margin={{ top: 0, right: 16, left: 24, bottom: 0 }}
          >
            <CartesianGrid stroke="rgba(0,52,89,0.08)" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fill: "rgba(0,52,89,0.45)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="metric"
              tick={{ fill: "#003459", fontSize: 12, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              width={54}
            />
            <Tooltip cursor={{ fill: "rgba(0,52,89,0.05)" }} content={<ComparisonTooltip />} />
            <Bar dataKey="ideal" fill="rgba(0,52,89,0.12)" radius={[0, 6, 6, 0]} />
            <Bar dataKey="actual" radius={[0, 6, 6, 0]}>
              {data.map((entry) => (
                <Cell
                  key={`cell-mobile-${entry.metric}`}
                  fill={entry.actual >= entry.ideal ? GREEN : RED}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
