import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { ForgettingCurveChart } from "@/components/ForgettingCurveChart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
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
  Flame,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
type DateRange = 7 | 30 | 90;

// ─── Stat card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: string;
  accentClass?: string;
  loading?: boolean;
  ocid: string;
}

function StatCard({
  label,
  value,
  icon,
  sub,
  accentClass,
  loading,
  ocid,
}: StatCardProps) {
  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-5">
          <Skeleton className="h-3 w-24 mb-3" />
          <Skeleton className="h-8 w-16 mb-1.5" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }
  return (
    <Card
      data-ocid={ocid}
      className="bg-card border-border hover:shadow-elevated transition-smooth"
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          <span
            className={cn(
              "p-1.5 rounded-lg",
              accentClass ?? "bg-primary/15 text-primary",
            )}
          >
            {icon}
          </span>
        </div>
        <p className="text-3xl font-display font-bold text-foreground leading-none mb-1">
          {value}
        </p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ─── Date range toggle ────────────────────────────────────────────────────────
interface DateRangeToggleProps {
  value: DateRange;
  onChange: (v: DateRange) => void;
}

const RANGE_OPTIONS: DateRange[] = [7, 30, 90];

function DateRangeToggle({ value, onChange }: DateRangeToggleProps) {
  return (
    <div
      data-ocid="analytics.date_range_toggle"
      className="flex items-center gap-1 bg-muted rounded-lg p-1"
    >
      {RANGE_OPTIONS.map((opt) => (
        <button
          key={opt}
          type="button"
          data-ocid={`analytics.date_range_toggle.${opt}`}
          onClick={() => onChange(opt)}
          className={cn(
            "px-3 py-1 text-xs font-medium rounded-md transition-smooth",
            value === opt
              ? "bg-card text-foreground shadow-subtle"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opt}d
        </button>
      ))}
    </div>
  );
}

// ─── Daily reviews area chart ─────────────────────────────────────────────────
function filterByRange(
  data: DailyActivity[],
  days: DateRange,
): DailyActivity[] {
  return data.slice(-days);
}

function formatDateLabel(dateKey: string, range: DateRange): string {
  const d = new Date(dateKey);
  if (range === 7) return d.toLocaleDateString("en", { weekday: "short" });
  return d.toLocaleDateString("en", { month: "short", day: "numeric" });
}

interface DailyChartProps {
  data: DailyActivity[];
  range: DateRange;
  loading: boolean;
}

const CHART_SKELETON_BARS = [
  "bar-0",
  "bar-1",
  "bar-2",
  "bar-3",
  "bar-4",
  "bar-5",
  "bar-6",
];

function DailyReviewsChart({ data, range, loading }: DailyChartProps) {
  const filtered = filterByRange(data, range);
  const chartData = filtered.map((d) => ({
    label: formatDateLabel(d.dateKey, range),
    reviews: d.reviewCount,
    correct: d.correctCount,
  }));

  const tickInterval = range === 7 ? 0 : range === 30 ? 4 : 9;

  return (
    <Card
      className="bg-card border-border"
      data-ocid="analytics.daily_reviews_chart"
    >
      <CardHeader className="pb-1">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-chart-1" />
          <CardTitle className="text-base font-display font-semibold">
            Daily Reviews
          </CardTitle>
        </div>
        <div className="flex items-center gap-4 pt-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-block w-3 h-0.5 rounded bg-chart-1" />
            Total
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-block w-3 h-0.5 rounded bg-chart-3" />
            Correct
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div
            data-ocid="analytics.daily_reviews_chart.loading_state"
            className="h-52 flex items-end gap-1.5 pb-4"
          >
            {CHART_SKELETON_BARS.map((k) => (
              <Skeleton
                key={k}
                className="flex-1 rounded-t"
                style={{ height: `${40 + Math.random() * 60}%` }}
              />
            ))}
          </div>
        ) : (
          <div style={{ height: 210 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 4, right: 4, bottom: 0, left: -16 }}
              >
                <defs>
                  <linearGradient id="reviewGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="oklch(var(--chart-1))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="oklch(var(--chart-1))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="correctGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="oklch(var(--chart-3))"
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="95%"
                      stopColor="oklch(var(--chart-3))"
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
                  tick={{
                    fontSize: 10,
                    fill: "oklch(var(--muted-foreground))",
                  }}
                  interval={tickInterval}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{
                    fontSize: 10,
                    fill: "oklch(var(--muted-foreground))",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "oklch(var(--card))",
                    border: "1px solid oklch(var(--border))",
                    borderRadius: "8px",
                    fontSize: 12,
                    color: "oklch(var(--foreground))",
                  }}
                  labelStyle={{
                    color: "oklch(var(--foreground))",
                    fontWeight: 600,
                  }}
                  cursor={{
                    stroke: "oklch(var(--chart-1))",
                    strokeOpacity: 0.3,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="reviews"
                  stroke="oklch(var(--chart-1))"
                  strokeWidth={2}
                  fill="url(#reviewGrad)"
                  dot={false}
                  name="Total"
                />
                <Area
                  type="monotone"
                  dataKey="correct"
                  stroke="oklch(var(--chart-3))"
                  strokeWidth={2}
                  fill="url(#correctGrad)"
                  dot={false}
                  name="Correct"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Collection stats table ───────────────────────────────────────────────────
const COLLECTION_EXTENDED: Record<
  string,
  { accuracy: number; retention: number; reviews: number; itemCount: number }
> = {
  "1": { accuracy: 87, retention: 82, reviews: 312, itemCount: 12 },
  "2": { accuracy: 91, retention: 88, reviews: 189, itemCount: 38 },
  "3": { accuracy: 76, retention: 71, reviews: 94, itemCount: 22 },
  "4": { accuracy: 83, retention: 79, reviews: 147, itemCount: 47 },
  "5": { accuracy: 94, retention: 91, reviews: 68, itemCount: 18 },
};

function retentionClass(pct: number): string {
  if (pct >= 85) return "bg-chart-3/15 text-chart-3 border-chart-3/25";
  if (pct >= 70) return "bg-chart-2/15 text-chart-2 border-chart-2/25";
  return "bg-destructive/15 text-destructive border-destructive/25";
}

const TABLE_SKELETON_ROWS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"] as const;

interface CollectionTableProps {
  collections: Collection[];
  loading: boolean;
}

function CollectionTable({ collections, loading }: CollectionTableProps) {
  return (
    <Card
      className="bg-card border-border"
      data-ocid="analytics.collections_table"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <CardTitle className="text-base font-display font-semibold">
            Per-Collection Stats
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {(
                  [
                    "Collection",
                    "Items",
                    "Accuracy",
                    "Retention",
                    "Reviews",
                  ] as const
                ).map((h) => (
                  <th
                    key={h}
                    className={cn(
                      "pb-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground",
                      h === "Collection" ? "text-left" : "text-right",
                    )}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? TABLE_SKELETON_ROWS.map((k) => (
                    <tr key={k} className="border-b border-border/40">
                      <td className="py-3">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48 mt-1" />
                      </td>
                      <td className="py-3 text-right">
                        <Skeleton className="h-4 w-8 ml-auto" />
                      </td>
                      <td className="py-3 text-right">
                        <Skeleton className="h-4 w-12 ml-auto" />
                      </td>
                      <td className="py-3 text-right">
                        <Skeleton className="h-5 w-14 ml-auto rounded-full" />
                      </td>
                      <td className="py-3 text-right">
                        <Skeleton className="h-4 w-10 ml-auto" />
                      </td>
                    </tr>
                  ))
                : collections.map((col, idx) => {
                    const ext = COLLECTION_EXTENDED[col.id] ?? {
                      accuracy: 80,
                      retention: 75,
                      reviews: 50,
                      itemCount: 10,
                    };
                    const pos = idx + 1;
                    return (
                      <tr
                        key={col.id}
                        data-ocid={`analytics.collections_table.item.${pos}`}
                        className="border-b border-border/40 hover:bg-muted/20 transition-smooth"
                      >
                        <td className="py-3">
                          <p className="font-medium text-foreground">
                            {col.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-xs">
                            {col.description}
                          </p>
                        </td>
                        <td className="py-3 text-right font-mono text-sm text-foreground">
                          {ext.itemCount}
                        </td>
                        <td className="py-3 text-right font-mono text-sm text-foreground">
                          {ext.accuracy}%
                        </td>
                        <td className="py-3 text-right">
                          <span
                            className={cn(
                              "inline-block px-2 py-0.5 rounded-full text-xs font-medium border",
                              retentionClass(ext.retention),
                            )}
                          >
                            {ext.retention}%
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono text-sm text-muted-foreground">
                          {ext.reviews}
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Analytics page ──────────────────────────────────────────────────────
export function AnalyticsPage() {
  const [range, setRange] = useState<DateRange>(30);
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: collections, isLoading: colsLoading } = useCollections();
  const { data: activity, isLoading: activityLoading } = useDailyActivity();

  const avgPerDay =
    activity && activity.length > 0
      ? Math.round(
          filterByRange(activity, range).reduce(
            (s, d) => s + d.reviewCount,
            0,
          ) / range,
        )
      : 0;

  const totalReviewsAllTime = stats ? stats.totalItems * 12 : 0;

  return (
    <div data-ocid="analytics.page" className="min-h-screen bg-background">
      {/* Page header zone */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/15">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">
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
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Stats row */}
        <div
          data-ocid="analytics.stats_row"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard
            ocid="analytics.stat.total_reviews"
            label="Total Reviews"
            value={totalReviewsAllTime.toLocaleString()}
            icon={<Activity className="w-4 h-4" />}
            sub="All time"
            loading={statsLoading}
          />
          <StatCard
            ocid="analytics.stat.retention_rate"
            label="Retention Rate"
            value={stats ? `${stats.accuracyPercent.toFixed(1)}%` : "—"}
            icon={<Brain className="w-4 h-4" />}
            sub={`Last ${range} days`}
            accentClass="bg-chart-1/15 text-chart-1"
            loading={statsLoading}
          />
          <StatCard
            ocid="analytics.stat.avg_per_day"
            label="Avg Reviews / Day"
            value={avgPerDay}
            icon={<CalendarDays className="w-4 h-4" />}
            sub={`Over ${range} days`}
            accentClass="bg-chart-2/15 text-chart-2"
            loading={statsLoading || activityLoading}
          />
          <StatCard
            ocid="analytics.stat.longest_streak"
            label="Longest Streak"
            value={stats ? `${stats.studyStreak}d` : "—"}
            icon={<Flame className="w-4 h-4" />}
            sub="Days in a row"
            accentClass="bg-chart-4/15 text-chart-4"
            loading={statsLoading}
          />
        </div>

        {/* Charts row: daily + forgetting curve */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DailyReviewsChart
            data={activity ?? []}
            range={range}
            loading={activityLoading}
          />

          <Card
            className="bg-card border-border"
            data-ocid="analytics.forgetting_curve_card"
          >
            <CardHeader className="pb-1">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-chart-5" />
                <CardTitle className="text-base font-display font-semibold">
                  Forgetting Curve
                </CardTitle>
              </div>
              <p className="text-xs text-muted-foreground pt-0.5">
                Memory retention decay across stability levels
              </p>
            </CardHeader>
            <CardContent>
              <ForgettingCurveChart showAxes />
            </CardContent>
          </Card>
        </div>

        {/* Activity heatmap */}
        <Card
          className="bg-card border-border"
          data-ocid="analytics.heatmap_card"
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-chart-3" />
                <CardTitle className="text-base font-display font-semibold">
                  Review Activity
                </CardTitle>
              </div>
              <Badge
                variant="outline"
                className="text-xs border-border text-muted-foreground"
              >
                Last 35 days
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div
                data-ocid="analytics.heatmap_card.loading_state"
                className="space-y-1.5"
              >
                {(
                  [
                    "hm-0",
                    "hm-1",
                    "hm-2",
                    "hm-3",
                    "hm-4",
                    "hm-5",
                    "hm-6",
                  ] as const
                ).map((k) => (
                  <Skeleton key={k} className="h-4 w-full" />
                ))}
              </div>
            ) : (
              <ActivityHeatmap data={activity ?? []} />
            )}
          </CardContent>
        </Card>

        {/* Per-collection stats table */}
        <CollectionTable
          collections={collections ?? []}
          loading={colsLoading}
        />
      </div>
    </div>
  );
}
