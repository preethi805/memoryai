import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { ForgettingCurveChart } from "@/components/ForgettingCurveChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGamification } from "@/contexts/GamificationContext";
import {
  useCollections,
  useDailyActivity,
  useDashboardStats,
  useDueItems,
} from "@/hooks/useQueries";
import type { Collection, DailyActivity, MemoryItem } from "@/types";
import { Difficulty } from "@/types";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  Flame,
  Layers,
  Lightbulb,
  Plus,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedCounter({
  value,
  suffix = "",
}: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    const duration = 900;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      setDisplay(start);
      if (start >= end) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return (
    <>
      {display}
      {suffix}
    </>
  );
}

// ─── Circular Progress Ring ───────────────────────────────────────────────────

function CircularProgress({
  value,
  size = 96,
}: { value: number; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (value / 100) * circumference;
  const color = value >= 75 ? "#22c55e" : value >= 50 ? "#eab308" : "#ef4444";

  return (
    <svg
      width={size}
      height={size}
      className="rotate-[-90deg]"
      role="img"
      aria-label={`Memory retention: ${value}%`}
    >
      <title>{`Memory retention: ${value}%`}</title>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={6}
        className="text-muted/30"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeDasharray={`${strokeDash} ${circumference}`}
        strokeLinecap="round"
        style={{
          filter: `drop-shadow(0 0 6px ${color})`,
          transition: "stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </svg>
  );
}

// ─── Collection Progress Ring (small) ────────────────────────────────────────

function CollectionRing({ value, color }: { value: number; color: string }) {
  const r = 14;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <svg
      width={36}
      height={36}
      className="rotate-[-90deg] shrink-0"
      role="img"
      aria-label={`Progress: ${value}%`}
    >
      <title>{`Progress: ${value}%`}</title>
      <circle
        cx={18}
        cy={18}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        className="text-muted/30"
      />
      <circle
        cx={18}
        cy={18}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
    </svg>
  );
}

// ─── Floating Orb ─────────────────────────────────────────────────────────────

function FloatingOrb({
  className,
  delay = 0,
}: { className?: string; delay?: number }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      style={{ animation: `float 6s ease-in-out ${delay}s infinite` }}
    />
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

type StatVariant = "violet" | "cyan" | "amber" | "green";

const STAT_STYLES: Record<
  StatVariant,
  {
    border: string;
    bg: string;
    glow: string;
    iconBg: string;
    iconColor: string;
    textColor: string;
  }
> = {
  violet: {
    border: "border-[oklch(0.75_0.25_265/0.35)]",
    bg: "bg-[oklch(0.75_0.25_265/0.08)]",
    glow: "hover:shadow-[0_0_28px_0_oklch(0.75_0.25_265/0.35)]",
    iconBg: "bg-[oklch(0.75_0.25_265/0.15)]",
    iconColor: "text-[oklch(0.75_0.25_265)]",
    textColor: "text-[oklch(0.75_0.25_265)]",
  },
  cyan: {
    border: "border-[oklch(0.75_0.25_165/0.35)]",
    bg: "bg-[oklch(0.75_0.25_165/0.08)]",
    glow: "hover:shadow-[0_0_28px_0_oklch(0.75_0.25_165/0.35)]",
    iconBg: "bg-[oklch(0.75_0.25_165/0.15)]",
    iconColor: "text-[oklch(0.75_0.25_165)]",
    textColor: "text-[oklch(0.75_0.25_165)]",
  },
  amber: {
    border: "border-[oklch(0.75_0.18_55/0.4)]",
    bg: "bg-[oklch(0.75_0.18_55/0.08)]",
    glow: "hover:shadow-[0_0_28px_0_oklch(0.75_0.18_55/0.35)]",
    iconBg: "bg-[oklch(0.75_0.18_55/0.15)]",
    iconColor: "text-[oklch(0.75_0.18_55)]",
    textColor: "text-[oklch(0.75_0.18_55)]",
  },
  green: {
    border: "border-[oklch(0.72_0.2_145/0.35)]",
    bg: "bg-[oklch(0.72_0.2_145/0.08)]",
    glow: "hover:shadow-[0_0_28px_0_oklch(0.72_0.2_145/0.35)]",
    iconBg: "bg-[oklch(0.72_0.2_145/0.15)]",
    iconColor: "text-[oklch(0.72_0.2_145)]",
    textColor: "text-[oklch(0.72_0.2_145)]",
  },
};

function StatCard({
  icon: Icon,
  label,
  value,
  numericValue,
  suffix,
  subtitle,
  variant,
  ocid,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
  numericValue?: number;
  suffix?: string;
  subtitle?: string;
  variant: StatVariant;
  ocid?: string;
}) {
  const s = STAT_STYLES[variant];
  return (
    <motion.div
      data-ocid={ocid}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={`glass rounded-2xl p-5 border transition-smooth cursor-default ${s.border} ${s.bg} ${s.glow}`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            {label}
          </p>
          <p
            className={`text-3xl font-display font-bold tabular-nums counter-animate ${s.textColor}`}
          >
            {numericValue !== undefined ? (
              <AnimatedCounter value={numericValue} suffix={suffix ?? ""} />
            ) : (
              value
            )}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.iconBg} pulse-glow`}
        >
          <Icon className={`w-5 h-5 ${s.iconColor}`} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Area Chart ───────────────────────────────────────────────────────────────

function ActivityAreaChart({ data }: { data: DailyActivity[] }) {
  const chartData = data.slice(-30).map((d) => ({
    date: (() => {
      // dateKey is bigint YYYYMMDD → format for display
      const dk = String(d.dateKey);
      if (dk.length === 8) {
        const y = dk.slice(0, 4);
        const mo = dk.slice(4, 6);
        const day = dk.slice(6, 8);
        return new Date(`${y}-${mo}-${day}`).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }
      return dk;
    })(),
    reviews: Number(d.reviewCount),
    correct: Number(d.correctCount),
  }));

  return (
    <div style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 4, right: 12, left: -16, bottom: 0 }}
        >
          <defs>
            <linearGradient id="reviewGrad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="oklch(0.75 0.25 265)"
                stopOpacity={0.35}
              />
              <stop
                offset="95%"
                stopColor="oklch(0.75 0.25 265)"
                stopOpacity={0}
              />
            </linearGradient>
            <linearGradient id="correctGrad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="oklch(0.75 0.25 165)"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="oklch(0.75 0.25 165)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="oklch(var(--border))"
            strokeOpacity={0.3}
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
              background: "oklch(var(--card) / 0.9)",
              backdropFilter: "blur(12px)",
              border: "1px solid oklch(var(--border) / 0.3)",
              borderRadius: "10px",
              fontSize: "12px",
              color: "oklch(var(--foreground))",
            }}
            cursor={{
              stroke: "oklch(0.75 0.25 265)",
              strokeWidth: 1,
              strokeDasharray: "4 2",
            }}
          />
          <Area
            type="monotone"
            dataKey="reviews"
            stroke="oklch(0.75 0.25 265)"
            strokeWidth={2.5}
            fill="url(#reviewGrad)"
            dot={false}
            activeDot={{ r: 4, fill: "oklch(0.75 0.25 265)" }}
            name="Reviews"
          />
          <Area
            type="monotone"
            dataKey="correct"
            stroke="oklch(0.75 0.25 165)"
            strokeWidth={2}
            fill="url(#correctGrad)"
            dot={false}
            activeDot={{ r: 4, fill: "oklch(0.75 0.25 165)" }}
            name="Correct"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Collection accent colors ─────────────────────────────────────────────────

const COLLECTION_COLORS_CYCLE = [
  {
    border: "border-t-[oklch(0.75_0.25_265)]",
    ring: "#a855f7",
    ringColor: "oklch(0.75 0.25 265)",
  },
  {
    border: "border-t-[oklch(0.75_0.25_165)]",
    ring: "#06b6d4",
    ringColor: "oklch(0.75 0.25 165)",
  },
  {
    border: "border-t-[oklch(0.75_0.18_55)]",
    ring: "#f59e0b",
    ringColor: "oklch(0.75 0.18 55)",
  },
  {
    border: "border-t-[oklch(0.65_0.22_15)]",
    ring: "#f43f5e",
    ringColor: "oklch(0.65 0.22 15)",
  },
  {
    border: "border-t-[oklch(0.72_0.2_145)]",
    ring: "#10b981",
    ringColor: "oklch(0.72 0.2 145)",
  },
];

function CollectionCard({ col, idx }: { col: Collection; idx: number }) {
  const colors = COLLECTION_COLORS_CYCLE[idx % COLLECTION_COLORS_CYCLE.length];
  return (
    <motion.div
      data-ocid={`dashboard.collection.${idx + 1}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.08 }}
      whileHover={{ y: -3, scale: 1.02 }}
      className={`glass rounded-2xl p-4 border border-t-2 ${colors.border} flex-shrink-0 w-52 cursor-pointer transition-smooth hover:shadow-elevated`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold text-sm text-foreground truncate">
            {col.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {col.description}
          </p>
        </div>
        <CollectionRing value={0} color={colors.ring} />
      </div>
      <div className="flex items-center justify-between text-xs mt-2">
        <span className="text-muted-foreground">Collection</span>
        <span className="text-muted-foreground text-[10px]">
          {new Date(Number(col.createdAt) / 1_000_000).toLocaleDateString(
            "en-US",
            { month: "short", day: "numeric" },
          )}
        </span>
      </div>
    </motion.div>
  );
}

// ─── FSRS state badge ─────────────────────────────────────────────────────────

function StateBadge({ state }: { state: string }) {
  const map: Record<string, string> = {
    new: "border-[oklch(0.72_0.2_145/0.6)] text-[oklch(0.72_0.2_145)] bg-[oklch(0.72_0.2_145/0.08)]",
    learning:
      "border-[oklch(0.75_0.18_55/0.6)] text-[oklch(0.75_0.18_55)] bg-[oklch(0.75_0.18_55/0.08)]",
    relearning:
      "border-[oklch(0.65_0.22_15/0.6)] text-[oklch(0.65_0.22_15)] bg-[oklch(0.65_0.22_15/0.08)]",
    review:
      "border-[oklch(0.75_0.25_265/0.6)] text-[oklch(0.75_0.25_265)] bg-[oklch(0.75_0.25_265/0.08)]",
  };
  return (
    <Badge
      variant="outline"
      className={`text-[10px] px-1.5 py-0 font-medium ${map[state] ?? ""}`}
    >
      {state}
    </Badge>
  );
}

// ─── Due Item Card ────────────────────────────────────────────────────────────

function DueItemCard({
  item,
  collectionName,
  idx,
}: { item: MemoryItem; collectionName?: string; idx: number }) {
  return (
    <motion.div
      data-ocid={`dashboard.due_item.${idx + 1}`}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.07 }}
      className="glass rounded-xl p-4 border border-border/40 hover:border-primary/30 transition-smooth cursor-pointer group hover:shadow-[0_0_16px_0_oklch(0.75_0.25_265/0.2)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-200">
            {item.question}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {collectionName && (
              <span className="text-xs text-muted-foreground font-medium">
                {collectionName}
              </span>
            )}
            <span className="text-muted-foreground/50 text-xs">·</span>
            <StateBadge state={item.state} />
            {item.tags.slice(0, 1).map((tag) => (
              <span key={tag} className="text-xs text-muted-foreground">
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
    </motion.div>
  );
}

// ─── AI Insight Card ──────────────────────────────────────────────────────────

const AI_INSIGHTS = [
  {
    id: "time",
    icon: Timer,
    text: "Best study window: 9–11 AM based on your history",
    color: "text-[oklch(0.75_0.25_265)]",
    bg: "bg-[oklch(0.75_0.25_265/0.1)]",
  },
  {
    id: "speed",
    icon: TrendingUp,
    text: "Spaced repetition optimizes your review intervals automatically",
    color: "text-[oklch(0.72_0.2_145)]",
    bg: "bg-[oklch(0.72_0.2_145/0.1)]",
  },
  {
    id: "urgent",
    icon: Zap,
    text: "Consistent daily reviews improve long-term retention significantly",
    color: "text-[oklch(0.75_0.18_55)]",
    bg: "bg-[oklch(0.75_0.18_55/0.1)]",
  },
];

// ─── Skeleton keys ────────────────────────────────────────────────────────────

const STAT_KEYS = ["due", "total", "streak", "accuracy"] as const;
const DUE_KEYS = ["d1", "d2", "d3", "d4", "d5"] as const;

// ─── Main Dashboard Page ──────────────────────────────────────────────────────

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: dueItems, isLoading: itemsLoading } = useDueItems();
  const { data: collections } = useCollections();
  const { data: activity, isLoading: activityLoading } = useDailyActivity();
  const { progress } = useGamification();
  const hasShownToast = useRef(false);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const totalXp = progress ? Number(progress.totalXp) : 0;
  const level = progress ? Number(progress.level) : 1;
  const xpInLevel = totalXp % 500;
  const xpPercent = (xpInLevel / 500) * 100;

  const itemsDueToday = stats ? Number(stats.itemsDueToday) : 0;

  useEffect(() => {
    if (!hasShownToast.current && stats && itemsDueToday > 0) {
      hasShownToast.current = true;
      toast.warning(
        `You have ${itemsDueToday} overdue item${itemsDueToday !== 1 ? "s" : ""}`,
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
  }, [stats, itemsDueToday]);

  const collectionMap = Object.fromEntries(
    (collections ?? []).map((c) => [c.id.toString(), c.name]),
  );
  const retentionPercent = Math.round(stats?.accuracyPercent ?? 80);

  return (
    <div data-ocid="dashboard.page" className="pb-12 max-w-7xl mx-auto fade-in">
      {/* ── Hero Banner ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl mx-6 mt-6 mb-8">
        <div className="gradient-mesh absolute inset-0 opacity-90" />
        <div className="absolute inset-0 bg-[oklch(0.1_0.02_260/0.45)]" />
        <FloatingOrb
          className="w-72 h-72 bg-[oklch(0.75_0.25_265/0.3)] top-[-60px] right-[10%]"
          delay={0}
        />
        <FloatingOrb
          className="w-48 h-48 bg-[oklch(0.75_0.25_165/0.25)] bottom-[-20px] left-[15%]"
          delay={2}
        />
        <FloatingOrb
          className="w-32 h-32 bg-[oklch(0.65_0.22_15/0.2)] top-[20px] left-[40%]"
          delay={4}
        />
        <div className="relative z-10 px-8 py-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-white/80" />
              <span className="text-white/70 text-sm font-medium">{today}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white leading-tight mb-1">
              {greeting}, Memory Master!
            </h1>
            <p className="text-white/70 text-sm">
              Your second brain is ready — {itemsDueToday} cards waiting for
              review.
            </p>

            {/* XP Bar */}
            <div className="mt-5 max-w-xs">
              <div className="flex items-center justify-between text-xs text-white/70 mb-1.5">
                <span className="flex items-center gap-1">
                  <Award className="w-3 h-3" /> Level {level}
                </span>
                <span>{xpInLevel} / 500 XP</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPercent}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full rounded-full bg-white/90"
                  style={{ boxShadow: "0 0 8px rgba(255,255,255,0.6)" }}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div
            data-ocid="dashboard.quick_actions"
            className="flex gap-3 flex-wrap"
          >
            <Button
              asChild
              data-ocid="dashboard.start_study_button"
              className="glass-elevated border border-white/25 text-white hover:bg-white/20 bg-white/15 backdrop-blur-md gap-2 rounded-full"
            >
              <Link to="/study">
                <Zap className="w-4 h-4" />
                Start Session
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              data-ocid="dashboard.add_card_button"
              className="glass border border-white/25 text-white hover:bg-white/20 bg-transparent gap-2 rounded-full"
            >
              <Link to="/collections">
                <Plus className="w-4 h-4" />
                Add Card
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              data-ocid="dashboard.browse_button"
              className="glass border border-white/25 text-white hover:bg-white/20 bg-transparent gap-2 rounded-full"
            >
              <Link to="/collections">
                <Layers className="w-4 h-4" />
                Collections
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-8">
        {/* ── Stats Row ─────────────────────────────────────────────────────── */}
        <div
          data-ocid="dashboard.stats_section"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {statsLoading ? (
            STAT_KEYS.map((k) => (
              <div
                key={k}
                className="glass rounded-2xl p-5 border border-border/30"
              >
                <Skeleton className="h-3 w-20 mb-3" />
                <Skeleton className="h-8 w-14 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))
          ) : stats ? (
            <>
              <StatCard
                icon={BookOpen}
                label="Due Today"
                numericValue={Number(stats.itemsDueToday)}
                subtitle="cards to review"
                variant="violet"
                ocid="dashboard.stat_due"
              />
              <StatCard
                icon={Brain}
                label="Total Items"
                numericValue={Number(stats.totalItems)}
                subtitle="in your library"
                variant="cyan"
                ocid="dashboard.stat_total"
              />
              <StatCard
                icon={Flame}
                label="Study Streak"
                numericValue={Number(stats.studyStreak)}
                suffix="d 🔥"
                subtitle="keep it up!"
                variant="amber"
                ocid="dashboard.stat_streak"
              />
              <StatCard
                icon={TrendingUp}
                label="Accuracy"
                numericValue={Math.round(stats.accuracyPercent)}
                suffix="%"
                subtitle="last 7 days"
                variant="green"
                ocid="dashboard.stat_accuracy"
              />
            </>
          ) : null}
        </div>

        {/* ── Middle Row: Due Items + Memory Health + AI Insights ───────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Due items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[oklch(0.75_0.25_265)] pulse-glow inline-block" />
                Due for Review
              </h2>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-primary gap-1 text-xs"
              >
                <Link to="/study" data-ocid="dashboard.view_all_button">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>

            <div data-ocid="dashboard.due_items_list" className="space-y-2.5">
              {itemsLoading ? (
                DUE_KEYS.map((k) => (
                  <div
                    key={k}
                    className="glass rounded-xl p-4 border border-border/30"
                  >
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                  </div>
                ))
              ) : dueItems && dueItems.length === 0 ? (
                <div
                  data-ocid="dashboard.due_items_empty_state"
                  className="glass rounded-2xl border border-dashed border-border/40 p-8 text-center"
                >
                  <Award className="w-10 h-10 mx-auto text-accent mb-3" />
                  <p className="text-sm font-medium text-foreground">
                    All caught up!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    No cards due today. Come back tomorrow.
                  </p>
                </div>
              ) : (
                dueItems
                  ?.slice(0, 5)
                  .map((item, idx) => (
                    <DueItemCard
                      key={item.id.toString()}
                      item={item}
                      collectionName={
                        collectionMap[item.collectionId.toString()]
                      }
                      idx={idx}
                    />
                  ))
              )}
            </div>
          </div>

          {/* Right column: Memory Health + AI Insights */}
          <div className="space-y-4">
            {/* Memory Health */}
            <div className="glass rounded-2xl p-5 border border-border/30 text-center">
              <h3 className="font-display font-semibold text-sm text-foreground mb-4 flex items-center gap-2 justify-center">
                <Target className="w-4 h-4 text-primary" />
                Memory Health
              </h3>
              <div className="relative flex items-center justify-center mb-3">
                <CircularProgress value={retentionPercent} size={100} />
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-display font-bold text-foreground">
                    {retentionPercent}%
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    retention
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {retentionPercent >= 75
                  ? "Excellent retention rate!"
                  : retentionPercent >= 50
                    ? "Good — keep reviewing!"
                    : "Needs attention"}
              </p>
            </div>

            {/* AI Insights */}
            <div className="glass rounded-2xl p-5 border border-border/30">
              <h3 className="font-display font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-[oklch(0.75_0.18_55)]" />
                AI Insights
              </h3>
              <div className="space-y-2.5">
                {AI_INSIGHTS.map((insight, i) => (
                  <motion.div
                    key={insight.id}
                    data-ocid={`dashboard.ai_insight.${i + 1}`}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className={`flex items-start gap-2.5 rounded-xl p-2.5 ${insight.bg}`}
                  >
                    <div className={`shrink-0 mt-0.5 ${insight.color}`}>
                      <insight.icon className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">
                      {insight.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Collections Scroll ────────────────────────────────────────────── */}
        {collections && collections.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[oklch(0.75_0.25_165)] inline-block" />
                Your Collections
              </h2>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-primary gap-1 text-xs"
              >
                <Link
                  to="/collections"
                  data-ocid="dashboard.collections_view_all_button"
                >
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
            <div
              data-ocid="dashboard.collections_list"
              className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
            >
              {collections.map((col, idx) => (
                <CollectionCard key={col.id.toString()} col={col} idx={idx} />
              ))}
            </div>
          </div>
        )}

        {/* ── Activity Area Chart ───────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[oklch(0.72_0.2_145)] inline-block" />
                Reviews Over Time
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Last 30 days — total reviews vs correct answers
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 rounded-full bg-[oklch(0.75_0.25_265)] inline-block" />
                Reviews
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 rounded-full bg-[oklch(0.75_0.25_165)] inline-block" />
                Correct
              </span>
            </div>
          </div>
          <motion.div
            data-ocid="dashboard.activity_chart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-5 border border-border/30"
          >
            {activityLoading ? (
              <Skeleton className="h-[220px] w-full rounded-xl" />
            ) : activity && activity.length > 0 ? (
              <ActivityAreaChart data={activity} />
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                No activity data yet. Start studying to see your progress!
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Bottom Row: Heatmap + Forgetting Curve ────────────────────────── */}
        {activity && activity.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Heatmap */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3 glass rounded-2xl border border-border/30 overflow-hidden"
            >
              <div className="px-5 pt-5 pb-2">
                <h3 className="font-display font-semibold text-sm text-foreground flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[oklch(0.72_0.18_85)] inline-block" />
                  Study Activity
                </h3>
                <ActivityHeatmap data={activity} />
              </div>
            </motion.div>

            {/* Forgetting Curve */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 glass rounded-2xl border border-border/30 overflow-hidden"
            >
              <div className="px-5 pt-5 pb-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-display font-semibold text-sm text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[oklch(0.75_0.18_55)] inline-block" />
                    Forgetting Curve
                  </h3>
                  <span className="text-[10px] text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">
                    Ebbinghaus Model
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Memory retention over time without review
                </p>
                <ForgettingCurveChart />
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
