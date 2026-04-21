import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { ForgettingCurveChart } from "@/components/ForgettingCurveChart";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCollectionStats,
  useCollections,
  useDailyActivity,
  useDashboardStats,
} from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import type { Collection, DailyActivity } from "@/types";
import {
  Activity,
  BarChart3,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock,
  Flame,
  MapPin,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

type DateRange = 7 | 30 | 90;

// ─── Static data for charts not backed by real data ──────────────────────────

const CARD_STATE_DATA = [
  { state: "New", count: 0, fullMark: 100 },
  { state: "Learning", count: 0, fullMark: 100 },
  { state: "Review", count: 0, fullMark: 100 },
  { state: "Relearning", count: 0, fullMark: 100 },
];

const STUDY_TIME_DATA = [
  { hour: "6am", quality: 62 },
  { hour: "8am", quality: 85 },
  { hour: "9am", quality: 90 },
  { hour: "10am", quality: 88 },
  { hour: "12pm", quality: 74 },
  { hour: "2pm", quality: 66 },
  { hour: "4pm", quality: 79 },
  { hour: "8pm", quality: 93 },
  { hour: "10pm", quality: 70 },
];

const TIME_COLORS = STUDY_TIME_DATA.map((d) => {
  if (d.quality >= 88) return "oklch(0.75 0.25 265)";
  if (d.quality >= 78) return "oklch(0.65 0.18 190)";
  if (d.quality >= 68) return "oklch(0.72 0.15 85)";
  return "oklch(0.6 0.14 40)";
});

// ─── Shared tooltip style ─────────────────────────────────────────────────────

const tooltipStyle = {
  background: "oklch(var(--card))",
  border: "1px solid oklch(var(--border))",
  borderRadius: "10px",
  fontSize: 12,
  color: "oklch(var(--foreground))",
  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
};

// ─── Glass section wrapper ────────────────────────────────────────────────────

function GlassCard({
  children,
  className,
  ocid,
}: { children: React.ReactNode; className?: string; ocid?: string }) {
  return (
    <div
      data-ocid={ocid}
      className={cn("glass rounded-2xl p-5 hover-lift", className)}
    >
      {children}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionTitle({
  icon,
  title,
  subtitle,
}: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className="p-1.5 rounded-lg bg-primary/15 text-primary">
        {icon}
      </span>
      <div>
        <h3 className="text-sm font-display font-semibold text-foreground leading-none">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  sub,
  glowClass,
  iconBg,
  loading,
  ocid,
  trend,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: string;
  glowClass?: string;
  iconBg?: string;
  loading?: boolean;
  ocid: string;
  trend?: string;
}) {
  if (loading) {
    return (
      <div className="glass rounded-2xl p-5">
        <Skeleton className="h-3 w-24 mb-3" />
        <Skeleton className="h-8 w-16 mb-1.5" />
        <Skeleton className="h-3 w-20" />
      </div>
    );
  }
  return (
    <div
      data-ocid={ocid}
      className={cn(
        "glass rounded-2xl p-5 relative overflow-hidden hover-lift",
        glowClass,
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
          {label}
        </p>
        <span
          className={cn(
            "p-2 rounded-xl",
            iconBg ?? "bg-primary/15 text-primary",
          )}
        >
          {icon}
        </span>
      </div>
      <p className="text-3xl font-display font-bold gradient-text-violet leading-none mb-1">
        {value}
      </p>
      <div className="flex items-center gap-2 mt-1.5">
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        {trend && (
          <span className="text-xs font-medium text-chart-3 bg-chart-3/10 px-1.5 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-primary/5 blur-xl pointer-events-none" />
    </div>
  );
}

// ─── Date range toggle ────────────────────────────────────────────────────────

const RANGE_OPTIONS: DateRange[] = [7, 30, 90];

function DateRangeToggle({
  value,
  onChange,
}: { value: DateRange; onChange: (v: DateRange) => void }) {
  return (
    <div
      data-ocid="analytics.date_range_toggle"
      className="flex items-center gap-1 glass rounded-xl p-1"
    >
      {RANGE_OPTIONS.map((opt) => (
        <button
          key={opt}
          type="button"
          data-ocid={`analytics.date_range_toggle.${opt}`}
          onClick={() => onChange(opt)}
          className={cn(
            "px-3 py-1.5 text-xs font-semibold rounded-lg transition-smooth",
            value === opt
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opt}d
        </button>
      ))}
    </div>
  );
}

// ─── Helper to parse bigint YYYYMMDD dateKey ──────────────────────────────────

function dateKeyToLabel(dateKey: bigint, range: DateRange): string {
  const dk = String(dateKey);
  if (dk.length === 8) {
    const y = dk.slice(0, 4);
    const m = dk.slice(4, 6);
    const d = dk.slice(6, 8);
    const date = new Date(`${y}-${m}-${d}`);
    if (range === 7) return date.toLocaleDateString("en", { weekday: "short" });
    return date.toLocaleDateString("en", { month: "short", day: "numeric" });
  }
  return dk;
}

function filterByRange(
  data: DailyActivity[],
  days: DateRange,
): DailyActivity[] {
  return data.slice(-days);
}

// ─── Retention Trend ─────────────────────────────────────────────────────────

function RetentionTrendChart({
  data,
  range,
  loading,
}: { data: DailyActivity[]; range: DateRange; loading: boolean }) {
  const filtered = filterByRange(data, range);
  const chartData = filtered.map((d) => ({
    label: dateKeyToLabel(d.dateKey, range),
    reviews: Number(d.reviewCount),
    retention:
      Number(d.reviewCount) > 0
        ? Math.round((Number(d.correctCount) / Number(d.reviewCount)) * 100)
        : 0,
  }));
  const tickInterval = range === 7 ? 0 : range === 30 ? 4 : 9;

  return (
    <GlassCard ocid="analytics.daily_reviews_chart">
      <SectionTitle
        icon={<TrendingUp className="w-4 h-4" />}
        title="Retention Trend"
        subtitle="Daily reviews vs recall accuracy"
      />
      <div className="flex items-center gap-5 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="inline-block w-3 h-0.5 rounded bg-chart-1" />
          Reviews
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="inline-block w-3 h-0.5 rounded bg-chart-3" />
          Retention %
        </div>
      </div>
      {loading ? (
        <div
          data-ocid="analytics.daily_reviews_chart.loading_state"
          className="h-48 flex items-end gap-1.5 pb-4"
        >
          {["a", "b", "c", "d", "e", "f", "g"].map((k) => (
            <Skeleton
              key={k}
              className="flex-1 rounded-t"
              style={{ height: "60%" }}
            />
          ))}
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
          No activity data yet. Start reviewing cards!
        </div>
      ) : (
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 4, right: 4, bottom: 0, left: -18 }}
            >
              <defs>
                <linearGradient id="retReviewGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="oklch(0.65 0.18 190)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor="oklch(0.65 0.18 190)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="retRateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="oklch(0.5 0.12 145)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="oklch(0.5 0.12 145)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "oklch(var(--muted-foreground))" }}
                interval={tickInterval}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 10, fill: "oklch(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "oklch(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{
                  color: "oklch(var(--foreground))",
                  fontWeight: 600,
                }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="reviews"
                stroke="oklch(0.65 0.18 190)"
                strokeWidth={2}
                fill="url(#retReviewGrad)"
                dot={false}
                name="Reviews"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="retention"
                stroke="oklch(0.5 0.12 145)"
                strokeWidth={2}
                fill="url(#retRateGrad)"
                dot={false}
                name="Retention %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </GlassCard>
  );
}

// ─── Learning Velocity ────────────────────────────────────────────────────────

function LearningVelocityChart({ data }: { data: DailyActivity[] }) {
  // Aggregate reviews by week
  const weeklyData: { week: string; mastered: number }[] = [];
  if (data.length > 0) {
    const sorted = [...data].sort((a, b) => (a.dateKey < b.dateKey ? -1 : 1));
    let weekStart = 0;
    for (let i = 0; i < sorted.length; i += 7) {
      const chunk = sorted.slice(i, i + 7);
      const mastered = chunk.reduce(
        (sum, d) => sum + Math.floor(Number(d.correctCount) * 0.4),
        0,
      );
      weeklyData.push({ week: `Wk ${weekStart + 1}`, mastered });
      weekStart++;
    }
  }

  return (
    <GlassCard ocid="analytics.learning_velocity_chart" className="glow-violet">
      <SectionTitle
        icon={<Zap className="w-4 h-4" />}
        title="Learning Velocity"
        subtitle="Cards mastered per week"
      />
      {weeklyData.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
          No data yet. Start reviewing cards to see velocity!
        </div>
      ) : (
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyData}
              margin={{ top: 4, right: 4, bottom: 0, left: -18 }}
            >
              <defs>
                <linearGradient id="velGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="oklch(0.75 0.25 265)"
                    stopOpacity={0.9}
                  />
                  <stop
                    offset="95%"
                    stopColor="oklch(0.55 0.2 165)"
                    stopOpacity={0.7}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10, fill: "oklch(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "oklch(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{
                  color: "oklch(var(--foreground))",
                  fontWeight: 600,
                }}
                cursor={{ fill: "oklch(var(--primary) / 0.06)" }}
              />
              <Bar
                dataKey="mastered"
                fill="url(#velGrad)"
                radius={[6, 6, 0, 0]}
                name="Cards Mastered"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </GlassCard>
  );
}

// ─── Forgetting Pattern radar ─────────────────────────────────────────────────

function ForgettingPatternChart() {
  return (
    <GlassCard ocid="analytics.forgetting_pattern_chart" className="glow-cyan">
      <SectionTitle
        icon={<Brain className="w-4 h-4" />}
        title="Forgetting Pattern"
        subtitle="Card state distribution across study modes"
      />
      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={CARD_STATE_DATA}
            margin={{ top: 8, right: 16, bottom: 8, left: 16 }}
          >
            <defs>
              <linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="oklch(0.75 0.25 165)"
                  stopOpacity={0.35}
                />
                <stop
                  offset="95%"
                  stopColor="oklch(0.55 0.2 265)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <PolarGrid stroke="oklch(var(--border))" />
            <PolarAngleAxis
              dataKey="state"
              tick={{ fontSize: 10, fill: "oklch(var(--muted-foreground))" }}
            />
            <Radar
              name="Count"
              dataKey="count"
              stroke="oklch(0.75 0.25 165)"
              strokeWidth={2}
              fill="url(#radarFill)"
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{
                color: "oklch(var(--foreground))",
                fontWeight: 600,
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

// ─── Knowledge Map (per-collection radar) ────────────────────────────────────

function KnowledgeMapChart({ collections }: { collections: Collection[] }) {
  // We'll show collection names vs their index position
  const mapData = collections.slice(0, 6).map((c) => ({
    subject: c.name.length > 10 ? `${c.name.slice(0, 10)}…` : c.name,
    score: 75, // placeholder until stats load
    fullMark: 100,
  }));

  if (mapData.length === 0) {
    return (
      <GlassCard ocid="analytics.knowledge_map_chart">
        <SectionTitle
          icon={<MapPin className="w-4 h-4" />}
          title="Knowledge Map"
          subtitle="Retention rate across collections"
        />
        <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
          Create collections to see your knowledge map.
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard ocid="analytics.knowledge_map_chart">
      <SectionTitle
        icon={<MapPin className="w-4 h-4" />}
        title="Knowledge Map"
        subtitle="Retention rate across collections"
      />
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={mapData}
            margin={{ top: 8, right: 24, bottom: 8, left: 24 }}
          >
            <defs>
              <linearGradient id="kmFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="oklch(0.75 0.25 265)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="oklch(0.55 0.2 85)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <PolarGrid stroke="oklch(var(--border))" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 10, fill: "oklch(var(--muted-foreground))" }}
            />
            <Radar
              name="Retention"
              dataKey="score"
              stroke="oklch(0.75 0.25 265)"
              strokeWidth={2}
              fill="url(#kmFill)"
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{
                color: "oklch(var(--foreground))",
                fontWeight: 600,
              }}
              formatter={(v: number) => [`${v}%`, "Retention"]}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

// ─── Optimal Study Time ───────────────────────────────────────────────────────

function OptimalStudyTimeChart() {
  return (
    <GlassCard ocid="analytics.study_time_chart">
      <SectionTitle
        icon={<Clock className="w-4 h-4" />}
        title="Optimal Study Windows"
        subtitle="Review quality score by hour of day"
      />
      <div className="flex items-center gap-4 mb-3">
        {[
          { color: "bg-chart-5", label: "Peak (88+)" },
          { color: "bg-chart-1", label: "Good (78+)" },
          { color: "bg-chart-2", label: "Moderate" },
        ].map((leg) => (
          <div
            key={leg.label}
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <span
              className={cn("inline-block w-2.5 h-2.5 rounded-full", leg.color)}
            />
            {leg.label}
          </div>
        ))}
      </div>
      <div style={{ height: 185 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={STUDY_TIME_DATA}
            layout="vertical"
            margin={{ top: 0, right: 30, bottom: 0, left: 12 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(var(--border))"
              horizontal={false}
            />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "oklch(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}%`}
            />
            <YAxis
              dataKey="hour"
              type="category"
              tick={{ fontSize: 10, fill: "oklch(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{
                color: "oklch(var(--foreground))",
                fontWeight: 600,
              }}
              formatter={(v: number) => [`${v}%`, "Quality Score"]}
              cursor={{ fill: "oklch(var(--primary) / 0.06)" }}
            />
            <Bar dataKey="quality" radius={[0, 6, 6, 0]} name="Quality">
              {STUDY_TIME_DATA.map((entry, index) => (
                <Cell key={`cell-${entry.hour}`} fill={TIME_COLORS[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

// ─── Per-Collection Stats Card ────────────────────────────────────────────────

function CollectionRing({ pct, color }: { pct: number; color: string }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg
      width={56}
      height={56}
      viewBox="0 0 56 56"
      aria-label={`${pct}% retention`}
      role="img"
    >
      <title>{pct}% retention</title>
      <circle
        cx={28}
        cy={28}
        r={r}
        fill="none"
        stroke="oklch(var(--border))"
        strokeWidth={4}
      />
      <circle
        cx={28}
        cy={28}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
      />
      <text
        x={28}
        y={32}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill="oklch(var(--foreground))"
      >
        {pct}%
      </text>
    </svg>
  );
}

function CollectionStatCard({
  collection,
  idx,
}: { collection: Collection; idx: number }) {
  const { data: stats } = useCollectionStats(collection.id);
  const retentionPct = stats ? Math.round(stats.retentionRate * 100) : 0;
  const accuracyPct = stats ? Math.round(stats.averageAccuracy) : 0;
  const totalItems = stats ? Number(stats.totalItems) : 0;

  const RING_COLORS = [
    "oklch(0.65 0.18 190)",
    "oklch(0.72 0.15 85)",
    "oklch(0.65 0.18 40)",
    "oklch(0.78 0.15 260)",
    "oklch(0.5 0.12 145)",
  ];
  const color = RING_COLORS[idx % RING_COLORS.length];
  const retClass =
    retentionPct >= 85
      ? "bg-chart-3/15 text-chart-3 border-chart-3/30"
      : retentionPct >= 70
        ? "bg-chart-2/15 text-chart-2 border-chart-2/30"
        : "bg-destructive/15 text-destructive border-destructive/30";

  return (
    <div
      data-ocid={`analytics.collections_table.item.${idx + 1}`}
      className="glass rounded-xl p-4 hover-lift transition-smooth"
    >
      <p className="font-display font-semibold text-foreground text-sm truncate">
        {collection.name}
      </p>
      <p className="text-xs text-muted-foreground truncate mt-0.5 mb-3">
        {collection.description}
      </p>
      <div className="flex items-center gap-3">
        <CollectionRing pct={retentionPct} color={color} />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-full border",
                retClass,
              )}
            >
              {retentionPct}% retention
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="font-mono font-medium text-foreground">
              {accuracyPct}%
            </span>{" "}
            accuracy · {totalItems} cards
          </p>
        </div>
      </div>
    </div>
  );
}

function CollectionCards({
  collections,
  loading,
}: { collections: Collection[]; loading: boolean }) {
  return (
    <GlassCard ocid="analytics.collections_table">
      <SectionTitle
        icon={<BookOpen className="w-4 h-4" />}
        title="Per-Collection Stats"
        subtitle="Performance breakdown by deck"
      />
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"].map((k) => (
            <div key={k} className="glass rounded-xl p-4 space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-36" />
              <div className="flex items-center gap-3 mt-2">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : collections.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No collections yet. Create some to track per-collection analytics.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {collections.map((col, idx) => (
            <CollectionStatCard
              key={col.id.toString()}
              collection={col}
              idx={idx}
            />
          ))}
        </div>
      )}
    </GlassCard>
  );
}

// ─── Main Analytics Page ──────────────────────────────────────────────────────

export function AnalyticsPage() {
  const [range, setRange] = useState<DateRange>(30);
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: collections, isLoading: colsLoading } = useCollections();
  const { data: activity, isLoading: activityLoading } = useDailyActivity();

  const avgPerDay =
    activity && activity.length > 0
      ? Math.round(
          filterByRange(activity, range).reduce(
            (s, d) => s + Number(d.reviewCount),
            0,
          ) / range,
        )
      : 0;

  const totalReviews = activity
    ? activity.reduce((s, d) => s + Number(d.reviewCount), 0)
    : 0;

  return (
    <div data-ocid="analytics.page" className="min-h-screen bg-background">
      {/* Page header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/15 glow-violet">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold gradient-text-violet">
                Analytics
              </h1>
              <p className="text-xs text-muted-foreground">
                Track your study progress and memory health
              </p>
            </div>
          </div>
          <DateRangeToggle value={range} onChange={setRange} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Hero stat cards */}
        <div
          data-ocid="analytics.stats_row"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard
            ocid="analytics.stat.total_reviews"
            label="Total Reviews"
            value={totalReviews.toLocaleString()}
            icon={<Activity className="w-4 h-4" />}
            sub="All time"
            loading={activityLoading}
          />
          <StatCard
            ocid="analytics.stat.retention_rate"
            label="Retention Rate"
            value={stats ? `${stats.accuracyPercent.toFixed(1)}%` : "—"}
            icon={<Brain className="w-4 h-4" />}
            sub={`Last ${range} days`}
            iconBg="bg-chart-1/15 text-chart-1"
            loading={statsLoading}
          />
          <StatCard
            ocid="analytics.stat.avg_per_day"
            label="Avg / Day"
            value={avgPerDay}
            icon={<CalendarDays className="w-4 h-4" />}
            sub={`Over ${range} days`}
            iconBg="bg-chart-2/15 text-chart-2"
            loading={statsLoading || activityLoading}
          />
          <StatCard
            ocid="analytics.stat.longest_streak"
            label="Study Streak"
            value={stats ? `${Number(stats.studyStreak)}d` : "—"}
            icon={<Flame className="w-4 h-4" />}
            sub="Days in a row"
            iconBg="bg-chart-4/15 text-chart-4"
            glowClass="glow-violet"
            trend="🔥 On fire"
            loading={statsLoading}
          />
        </div>

        {/* Row: Retention Trend + Learning Velocity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RetentionTrendChart
            data={activity ?? []}
            range={range}
            loading={activityLoading}
          />
          <LearningVelocityChart data={activity ?? []} />
        </div>

        {/* Row: Forgetting Pattern + Knowledge Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ForgettingPatternChart />
          <KnowledgeMapChart collections={collections ?? []} />
        </div>

        {/* Forgetting Curve */}
        <GlassCard ocid="analytics.forgetting_curve_card">
          <SectionTitle
            icon={<Brain className="w-4 h-4" />}
            title="Forgetting Curve"
            subtitle="Memory retention decay across stability levels"
          />
          <ForgettingCurveChart showAxes />
        </GlassCard>

        {/* Row: Activity Heatmap + Study Time */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GlassCard ocid="analytics.heatmap_card">
            <div className="flex items-center justify-between mb-4">
              <SectionTitle
                icon={<CheckCircle2 className="w-4 h-4" />}
                title="Review Activity"
              />
              <Badge
                variant="outline"
                className="text-xs border-border text-muted-foreground"
              >
                Last 35 days
              </Badge>
            </div>
            {activityLoading ? (
              <div
                data-ocid="analytics.heatmap_card.loading_state"
                className="space-y-1.5"
              >
                {["hm-0", "hm-1", "hm-2", "hm-3", "hm-4", "hm-5", "hm-6"].map(
                  (k) => (
                    <Skeleton key={k} className="h-4 w-full" />
                  ),
                )}
              </div>
            ) : (
              <ActivityHeatmap data={activity ?? []} />
            )}
          </GlassCard>

          <OptimalStudyTimeChart />
        </div>

        {/* Per-collection glass cards */}
        <CollectionCards
          collections={collections ?? []}
          loading={colsLoading}
        />

        {/* Insight callout */}
        <div className="glass-elevated rounded-2xl p-5 flex items-start gap-4 glow-violet">
          <div className="p-2.5 rounded-xl bg-primary/15 shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-display font-semibold text-foreground mb-1">
              AI Insight
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your spaced repetition schedule adapts to your performance. Cards
              rated <span className="text-foreground font-medium">Easy</span>{" "}
              get longer intervals, while{" "}
              <span className="text-foreground font-medium">Again</span> cards
              are reviewed sooner. Keep your daily review streak to maximize
              retention and minimize forgetting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
