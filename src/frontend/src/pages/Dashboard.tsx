import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { ForgettingCurveChart } from "@/components/ForgettingCurveChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCollections,
  useDailyActivity,
  useDashboardStats,
  useDueItems,
} from "@/hooks/useQueries";
import type { DailyActivity } from "@/types";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  Flame,
  Plus,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  accent,
  amber,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subtitle?: string;
  accent?: boolean;
  amber?: boolean;
}) {
  const bgClass = accent
    ? "border-primary/40 bg-primary/10"
    : amber
      ? "border-accent/40 bg-accent/10"
      : "border-border";
  const iconBg = accent ? "bg-primary/20" : amber ? "bg-accent/20" : "bg-muted";
  const iconColor = accent
    ? "text-primary"
    : amber
      ? "text-accent"
      : "text-muted-foreground";
  const valueColor = accent
    ? "text-primary"
    : amber
      ? "text-accent"
      : "text-foreground";

  return (
    <Card
      className={`${bgClass} shadow-subtle transition-smooth hover:shadow-elevated`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              {label}
            </p>
            <p
              className={`text-3xl font-display font-bold tabular-nums ${valueColor}`}
            >
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {subtitle}
              </p>
            )}
          </div>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
          >
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Activity Line Chart ──────────────────────────────────────────────────────

interface ChartDataPoint {
  date: string;
  reviews: number;
  correct: number;
}

function ActivityLineChart({ data }: { data: DailyActivity[] }) {
  const chartData: ChartDataPoint[] = data.slice(-30).map((d) => ({
    date: new Date(d.dateKey).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    reviews: d.reviewCount,
    correct: d.correctCount,
  }));

  return (
    <div style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 4, right: 12, left: -16, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="oklch(var(--border))"
            strokeOpacity={0.5}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "oklch(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: "oklch(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "oklch(var(--card))",
              border: "1px solid oklch(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
              color: "oklch(var(--foreground))",
            }}
            cursor={{
              stroke: "oklch(var(--primary))",
              strokeWidth: 1,
              strokeDasharray: "4 2",
            }}
          />
          <Line
            type="monotone"
            dataKey="reviews"
            stroke="oklch(var(--primary))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "oklch(var(--primary))" }}
            name="Reviews"
          />
          <Line
            type="monotone"
            dataKey="correct"
            stroke="oklch(var(--accent))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "oklch(var(--accent))" }}
            name="Correct"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Difficulty badge styling ─────────────────────────────────────────────────

function difficultyBadgeClass(state: string) {
  switch (state) {
    case "New":
      return "border-[oklch(var(--chart-3))] text-[oklch(var(--chart-3))]";
    case "Learning":
      return "border-[oklch(var(--chart-2))] text-[oklch(var(--chart-2))]";
    case "Relearning":
      return "border-[oklch(var(--chart-4))] text-[oklch(var(--chart-4))]";
    default:
      return "border-[oklch(var(--chart-1))] text-[oklch(var(--chart-1))]";
  }
}

// ─── Skeleton loaders ─────────────────────────────────────────────────────────

const STAT_KEYS = ["due", "total", "streak", "accuracy"] as const;
const DUE_KEYS = ["d1", "d2", "d3", "d4", "d5"] as const;

// ─── Main Page ────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: dueItems, isLoading: itemsLoading } = useDueItems();
  const { data: collections } = useCollections();
  const { data: activity, isLoading: activityLoading } = useDailyActivity();

  const hasShownToast = useRef(false);

  // Show overdue toast once when stats arrive
  useEffect(() => {
    if (!hasShownToast.current && stats && stats.itemsDueToday > 0) {
      hasShownToast.current = true;
      toast.warning(
        `You have ${stats.itemsDueToday} overdue item${stats.itemsDueToday !== 1 ? "s" : ""}`,
        {
          description: "Start a study session to get back on track.",
          action: {
            label: "Study now",
            onClick: () => {
              window.location.href = "/study";
            },
          },
          duration: 6000,
        },
      );
    }
  }, [stats]);

  // Build a collection lookup map
  const collectionMap = Object.fromEntries(
    (collections ?? []).map((c) => [c.id, c.name]),
  );

  const overdue = stats?.itemsDueToday ?? 0;

  return (
    <div
      data-ocid="dashboard.page"
      className="p-6 space-y-8 max-w-7xl mx-auto fade-in"
    >
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground leading-tight">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your memory training at a glance
          </p>
        </div>

        {/* Quick actions */}
        <div
          data-ocid="dashboard.quick_actions"
          className="flex gap-3 shrink-0"
        >
          <Button
            variant="outline"
            asChild
            data-ocid="dashboard.add_card_button"
            className="gap-2"
          >
            <Link to="/collections">
              <Plus className="w-4 h-4" />
              Add Card
            </Link>
          </Button>
          <Button
            asChild
            data-ocid="dashboard.start_study_button"
            className="gap-2"
          >
            <Link to="/study">
              <Zap className="w-4 h-4" />
              Start Session
            </Link>
          </Button>
        </div>
      </div>

      {/* Overdue banner */}
      {!statsLoading && overdue > 0 && (
        <div
          data-ocid="dashboard.overdue_banner"
          className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-3"
        >
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-destructive shrink-0" />
            <p className="text-sm font-medium text-foreground">
              You have{" "}
              <span className="text-destructive font-bold">{overdue}</span>{" "}
              overdue {overdue === 1 ? "item" : "items"} waiting for review
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            asChild
            data-ocid="dashboard.overdue_study_button"
          >
            <Link to="/study">Review now</Link>
          </Button>
        </div>
      )}

      {/* Stats row */}
      <div
        data-ocid="dashboard.stats_section"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statsLoading ? (
          STAT_KEYS.map((k) => (
            <Card key={k} className="border-border">
              <CardContent className="p-5">
                <Skeleton className="h-3 w-20 mb-3" />
                <Skeleton className="h-8 w-14 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))
        ) : stats ? (
          <>
            <StatCard
              icon={BookOpen}
              label="Due Today"
              value={stats.itemsDueToday}
              subtitle="cards to review"
              accent
              data-ocid="dashboard.stat_due"
            />
            <StatCard
              icon={Brain}
              label="Total Items"
              value={stats.totalItems}
              subtitle="in your library"
            />
            <StatCard
              icon={Flame}
              label="Study Streak"
              value={`${stats.studyStreak}d 🔥`}
              subtitle="keep it up!"
              amber
            />
            <StatCard
              icon={TrendingUp}
              label="Accuracy"
              value={`${stats.accuracyPercent.toFixed(0)}%`}
              subtitle="last 7 days"
            />
          </>
        ) : null}
      </div>

      {/* Middle row: due items + forgetting curve */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Due items mini-list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-foreground">
              Due for Review
            </h2>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-primary gap-1"
            >
              <Link to="/study" data-ocid="dashboard.view_all_button">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>

          <div data-ocid="dashboard.due_items_list" className="space-y-2">
            {itemsLoading ? (
              DUE_KEYS.map((k) => (
                <Card key={k} className="border-border">
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : dueItems && dueItems.length === 0 ? (
              <Card
                data-ocid="dashboard.due_items_empty_state"
                className="border-border border-dashed"
              >
                <CardContent className="p-8 text-center">
                  <Award className="w-8 h-8 mx-auto text-accent mb-2" />
                  <p className="text-sm font-medium text-foreground">
                    All caught up!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    No cards due today. Come back tomorrow.
                  </p>
                </CardContent>
              </Card>
            ) : (
              dueItems?.slice(0, 5).map((item, idx) => (
                <Card
                  key={item.id}
                  data-ocid={`dashboard.due_item.${idx + 1}`}
                  className="border-border shadow-subtle hover:shadow-elevated transition-smooth cursor-pointer group"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-200">
                          {item.question}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {collectionMap[item.collectionId] && (
                            <span className="text-xs text-muted-foreground font-medium">
                              {collectionMap[item.collectionId]}
                            </span>
                          )}
                          <span className="text-muted-foreground text-xs">
                            ·
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs px-1.5 py-0 ${difficultyBadgeClass(item.state)}`}
                          >
                            {item.state}
                          </Badge>
                          {item.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs text-muted-foreground"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[10px] text-muted-foreground leading-none mb-0.5">
                          Stability
                        </p>
                        <p className="text-sm font-display font-bold text-foreground tabular-nums">
                          {item.fsrs.stability.toFixed(1)}d
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Forgetting curve */}
        <div className="space-y-4">
          <h2 className="font-display font-semibold text-foreground">
            Forgetting Curve
          </h2>
          <Card className="border-border shadow-subtle">
            <CardContent className="p-4">
              <ForgettingCurveChart />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reviews line chart — 30 days */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-semibold text-foreground">
              Reviews Over Time
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Last 30 days — total reviews vs correct answers
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 rounded-full bg-primary inline-block" />
              Reviews
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 rounded-full bg-accent inline-block" />
              Correct
            </span>
          </div>
        </div>

        <Card
          data-ocid="dashboard.activity_chart"
          className="border-border shadow-subtle"
        >
          <CardContent className="p-5">
            {activityLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-[220px] w-full rounded-lg" />
              </div>
            ) : activity ? (
              <ActivityLineChart data={activity} />
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Activity heatmap */}
      {activity && (
        <div className="space-y-4">
          <h2 className="font-display font-semibold text-foreground">
            Study Activity
          </h2>
          <Card className="border-border shadow-subtle">
            <CardContent className="p-5">
              <ActivityHeatmap data={activity} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
