"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

type ScoreChartProps = {
  scores: {
    seo: number;
    funnel: number;
    copy: number;
    speed: number;
  };
  ideal?: number;
};

const chartData = (scores: ScoreChartProps["scores"], ideal: number) => [
  { metric: "SEO", actual: scores.seo, ideal },
  { metric: "Funnel", actual: scores.funnel, ideal },
  { metric: "Copy", actual: scores.copy, ideal },
  { metric: "Speed", actual: scores.speed, ideal },
];

export default function ScoreChart({ scores, ideal = 85 }: ScoreChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData(scores, ideal)}>
          <PolarGrid stroke="rgba(0,52,89,0.15)" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: "#003459", fontSize: 12, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            domain={[0, 100]}
            tick={{ fill: "rgba(0,52,89,0.45)", fontSize: 11 }}
            axisLine={false}
          />
          <Radar
            name="Ideal"
            dataKey="ideal"
            stroke="#003459"
            fill="rgba(0,52,89,0.05)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
          <Radar
            name="Your site"
            dataKey="actual"
            stroke="#007EA7"
            fill="rgba(0,126,167,0.2)"
            strokeWidth={2}
            dot={{ r: 3, fill: "#003459" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
