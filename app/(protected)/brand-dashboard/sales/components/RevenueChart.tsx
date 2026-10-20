"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type RevenuePoint = {
  label: string;
  revenue: number;
};

export function RevenueChart({
  title,
  data,
}: {
  title: string;
  data: RevenuePoint[];
}) {
  return (
    <div className="rounded-3xl border border-theme-ink/10 bg-theme-base/40 p-5">
      <h3 className="text-lg font-black">{title}</h3>

      <div className="mt-5 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            {/* Grid */}
            <CartesianGrid
              stroke="var(--palette-white-8)"
              strokeDasharray="3 3"
            />

            {/* X Axis */}
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "var(--palette-text-email-subtle)" }}
              axisLine={{ stroke: "color-mix(in srgb, var(--theme-ink) 10%, transparent)" }}
              tickLine={false}
            />

            {/* Y Axis */}
            <YAxis
              tick={{ fontSize: 12, fill: "var(--palette-text-email-subtle)" }}
              axisLine={{ stroke: "color-mix(in srgb, var(--theme-ink) 10%, transparent)" }}
              tickLine={false}
            />

            {/* Tooltip */}
            <Tooltip
              formatter={(value) => [
                `R${Number(value).toFixed(2)}`,
                "Revenue",
              ]}
              contentStyle={{
                background: "var(--palette-surface-chart-tooltip)",
                border: "1px solid color-mix(in srgb, var(--theme-ink) 10%, transparent)",
                borderRadius: "12px",
                color: "var(--theme-ink)",
              }}
              cursor={{ fill: "color-mix(in srgb, var(--theme-ink) 5%, transparent)" }}
            />

            {/* Bars */}
            <Bar
              dataKey="revenue"
              radius={[10, 10, 0, 0]}
              fill="var(--palette-revenue-fill)" // green
              stroke="var(--palette-success-strong)"
              strokeWidth={1}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}