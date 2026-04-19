import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Ebbinghaus forgetting curve data: retention(t) = 100 * e^(-t/stability)
function generateForgettingCurve(stability = 5) {
  return Array.from({ length: 20 }, (_, i) => {
    const days = i * 4;
    const retention = Math.round(100 * Math.exp(-days / (stability * 7)));
    return { day: days, retention };
  });
}

const CURVES = [
  { stability: 3, label: "New", color: "oklch(var(--chart-4))" },
  { stability: 7, label: "Learning", color: "oklch(var(--chart-2))" },
  { stability: 15, label: "Stable", color: "oklch(var(--chart-1))" },
];

interface ForgettingCurveChartProps {
  showAxes?: boolean;
}

export function ForgettingCurveChart({
  showAxes = false,
}: ForgettingCurveChartProps) {
  const data = generateForgettingCurve(15);

  return (
    <div>
      {showAxes && (
        <div className="flex items-center gap-4 mb-4">
          {CURVES.map((c) => (
            <div
              key={c.label}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <span
                className="w-3 h-0.5 rounded"
                style={{ background: c.color }}
              />
              {c.label}
            </div>
          ))}
        </div>
      )}
      <ResponsiveContainer width="100%" height={showAxes ? 180 : 140}>
        <LineChart data={data}>
          {showAxes && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(var(--border))"
            />
          )}
          {showAxes && (
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: "oklch(var(--muted-foreground))" }}
              label={{
                value: "Days",
                position: "insideBottom",
                offset: -2,
                fontSize: 10,
                fill: "oklch(var(--muted-foreground))",
              }}
            />
          )}
          {showAxes && (
            <YAxis
              tick={{ fontSize: 10, fill: "oklch(var(--muted-foreground))" }}
              unit="%"
            />
          )}
          <Tooltip
            contentStyle={{
              background: "oklch(var(--card))",
              border: "1px solid oklch(var(--border))",
              borderRadius: "8px",
              fontSize: 12,
              color: "oklch(var(--foreground))",
            }}
            labelStyle={{ color: "oklch(var(--foreground))" }}
            itemStyle={{ color: "oklch(var(--chart-1))" }}
            formatter={(v: number) => [`${v}%`, "Retention"]}
            labelFormatter={(l) => `Day ${l}`}
          />
          <Line
            type="monotone"
            dataKey="retention"
            stroke="oklch(var(--chart-1))"
            strokeWidth={2.5}
            dot={false}
            strokeLinecap="round"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
