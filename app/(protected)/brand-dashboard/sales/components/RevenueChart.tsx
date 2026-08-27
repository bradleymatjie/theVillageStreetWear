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
    <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
      <h3 className="text-lg font-black">{title}</h3>

      <div className="mt-5 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            {/* Grid */}
            <CartesianGrid
              stroke="rgba(255,255,255,0.08)"
              strokeDasharray="3 3"
            />

            {/* X Axis */}
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
            />

            {/* Y Axis */}
            <YAxis
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
            />

            {/* Tooltip */}
            <Tooltip
              formatter={(value) => [
                `R${Number(value).toFixed(2)}`,
                "Revenue",
              ]}
              contentStyle={{
                background: "#0A0A0A",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                color: "#fff",
              }}
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
            />

            {/* Bars */}
            <Bar
              dataKey="revenue"
              radius={[10, 10, 0, 0]}
              fill="#22C55E" // green
              stroke="#16A34A"
              strokeWidth={1}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}