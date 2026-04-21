import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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
      <ResponsiveContainer width="100%" height={showAxes ? 180 : 150}>
        <AreaChart
          data={data}
          margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="oklch(0.75 0.18 55)"
                stopOpacity={0.4}
              />
              <stop
                offset="95%"
                stopColor="oklch(0.75 0.18 55)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          {showAxes && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(var(--border))"
              strokeOpacity={0.4}
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
              background: "oklch(var(--card) / 0.85)",
              backdropFilter: "blur(12px)",
              border: "1px solid oklch(var(--border) / 0.3)",
              borderRadius: "10px",
              fontSize: 12,
              color: "oklch(var(--foreground))",
            }}
            formatter={(v: number) => [`${v}%`, "Retention"]}
            labelFormatter={(l) => `Day ${l}`}
          />
          <Area
            type="monotone"
            dataKey="retention"
            stroke="oklch(0.75 0.18 55)"
            strokeWidth={2.5}
            fill="url(#curveGrad)"
            dot={false}
            strokeLinecap="round"
            activeDot={{
              r: 4,
              fill: "oklch(0.75 0.18 55)",
              filter: "drop-shadow(0 0 4px oklch(0.75 0.18 55))",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
