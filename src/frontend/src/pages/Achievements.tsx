import { Skeleton } from "@/components/ui/skeleton";
import { useGamification } from "@/contexts/GamificationContext";
import { cn } from "@/lib/utils";
import type { Badge, XpEvent } from "@/types";
import {
  Brain,
  Calendar,
  CheckCircle2,
  CreditCard,
  Flame,
  Lock,
  Shield,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

// ─── Badge icon map ────────────────────────────────────────────────────────────

const BADGE_ICON_MAP: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  card: CreditCard,
  fire: Flame,
  flame: Flame,
  shield: Shield,
  calendar: Calendar,
  trophy: Trophy,
  star: Star,
  lightning: Zap,
  brain: Brain,
  hundred: Trophy,
  crown: Trophy,
};

// ─── XP Level thresholds ──────────────────────────────────────────────────────

const LEVEL_THRESHOLDS = [
  0, 500, 1000, 1600, 2400, 3400, 4600, 6000, 7600, 9400,
];
const LEVEL_TITLES = [
  "",
  "Memory Seedling",
  "Recall Cadet",
  "Memory Master",
  "Brain Knight",
  "Synapse Sage",
  "Neural Wizard",
  "Cortex Champion",
  "Hippocampus Hero",
  "Memory Legend",
  "Transcendent Mind",
];

// ─── Daily challenges (static goals since backend doesn't track them) ─────────

const DAILY_CHALLENGES = [
  {
    id: "dc1",
    label: "Review 10 cards",
    xp: 50,
    progress: 0,
    total: 10,
    icon: "📚",
  },
  {
    id: "dc2",
    label: "Get 3 Easy ratings",
    xp: 30,
    progress: 0,
    total: 3,
    icon: "⭐",
  },
  {
    id: "dc3",
    label: "Maintain streak",
    xp: 20,
    progress: 0,
    total: 1,
    icon: "🔥",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts) / 1_000_000; // nanoseconds → ms
  const d = new Date(ms);
  const now = Date.now();
  const diff = now - ms;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function isUnlocked(badge: Badge): boolean {
  return badge.unlockedAt !== undefined;
}

// ─── Badge Card ───────────────────────────────────────────────────────────────

function BadgeCard({ badge, index }: { badge: Badge; index: number }) {
  const unlocked = isUnlocked(badge);
  const Icon = BADGE_ICON_MAP[badge.iconKey] ?? Trophy;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      data-ocid={`achievements.badge.item.${index + 1}`}
      className={cn(
        "relative flex flex-col items-center gap-3 p-5 rounded-2xl text-center transition-smooth",
        "glass hover-lift cursor-default",
        unlocked ? "border border-primary/30" : "opacity-60",
      )}
    >
      <div
        className={cn(
          "relative w-16 h-16 rounded-2xl flex items-center justify-center text-3xl",
          unlocked ? "pulse-glow" : "bg-muted",
          !unlocked && "grayscale",
        )}
        style={
          unlocked
            ? {
                background:
                  "linear-gradient(135deg, oklch(0.4 0.22 265 / 0.3), oklch(0.4 0.22 165 / 0.3))",
                border: "1px solid oklch(0.75 0.28 265 / 0.4)",
              }
            : {}
        }
      >
        <Icon
          className={cn(
            "w-8 h-8",
            unlocked ? "text-primary" : "text-muted-foreground",
          )}
        />
        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/60 backdrop-blur-[2px]">
            <Lock className="w-5 h-5 text-muted-foreground/60" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p
          className={cn(
            "font-display font-semibold text-sm leading-tight",
            unlocked ? "gradient-text-violet" : "text-muted-foreground",
          )}
        >
          {badge.name}
        </p>
        <p className="text-xs text-muted-foreground leading-snug">
          {badge.description}
        </p>
      </div>

      {unlocked && badge.unlockedAt !== undefined && (
        <span className="text-[10px] text-primary/70 font-medium">
          ✓ {formatTimestamp(badge.unlockedAt)}
        </span>
      )}

      {unlocked && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            boxShadow:
              "0 0 20px 0 oklch(0.75 0.28 265 / 0.15), 0 0 40px 0 oklch(0.7 0.28 165 / 0.08)",
          }}
        />
      )}
    </motion.div>
  );
}

// ─── XP Event Row ─────────────────────────────────────────────────────────────

function XpEventRow({ event, index }: { event: XpEvent; index: number }) {
  const amount = Number(event.amount);
  const color =
    amount >= 50
      ? "text-yellow-500 dark:text-yellow-400"
      : amount >= 20
        ? "text-primary"
        : amount >= 10
          ? "text-cyan-500 dark:text-cyan-400"
          : "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      data-ocid={`achievements.xp_event.item.${index + 1}`}
      className="flex items-center gap-3 p-3 rounded-xl glass"
    >
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.75 0.28 265), oklch(0.7 0.28 165))",
        }}
      />
      <span className="flex-1 text-sm text-foreground leading-tight min-w-0 truncate">
        {event.reason}
      </span>
      <span
        className={cn(
          "font-display font-bold text-sm shrink-0 tabular-nums",
          color,
        )}
      >
        +{amount} XP
      </span>
      <span className="text-[11px] text-muted-foreground shrink-0">
        {formatTimestamp(event.earnedAt)}
      </span>
    </motion.div>
  );
}

// ─── Level Roadmap ────────────────────────────────────────────────────────────

function LevelRoadmap({ currentLevel }: { currentLevel: number }) {
  const levels = Array.from({ length: 10 }, (_, i) => i + 1);
  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-2 scrollbar-hide">
      {levels.map((lvl, i) => {
        const isCurrent = lvl === currentLevel;
        const isPast = lvl < currentLevel;
        return (
          <div key={lvl} className="flex items-center shrink-0">
            <div
              className="flex flex-col items-center gap-1"
              data-ocid={`achievements.level_node.${lvl}`}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-sm transition-smooth",
                  isCurrent
                    ? "pulse-glow text-white"
                    : isPast
                      ? "text-primary/80 border border-primary/40"
                      : "text-muted-foreground border border-border bg-muted/40",
                )}
                style={
                  isCurrent
                    ? {
                        background:
                          "linear-gradient(135deg, oklch(0.75 0.28 265), oklch(0.7 0.28 165))",
                      }
                    : isPast
                      ? { background: "oklch(0.45 0.2 265 / 0.15)" }
                      : {}
                }
              >
                {lvl}
              </div>
              <span className="text-[9px] text-muted-foreground text-center leading-none max-w-[60px] truncate">
                {LEVEL_THRESHOLDS[i] !== undefined
                  ? `${LEVEL_THRESHOLDS[i]} XP`
                  : ""}
              </span>
            </div>
            {i < 9 && (
              <div
                className={cn(
                  "h-0.5 w-8 mx-1 rounded-full transition-smooth",
                  isPast ? "bg-primary/50" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Daily Challenge Card ─────────────────────────────────────────────────────

function DailyChallenge({
  challenge,
  index,
}: { challenge: (typeof DAILY_CHALLENGES)[number]; index: number }) {
  const pct = Math.min(100, (challenge.progress / challenge.total) * 100);
  const done = challenge.progress >= challenge.total;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.1 }}
      data-ocid={`achievements.challenge.item.${index + 1}`}
      className={cn(
        "flex flex-col gap-3 p-4 rounded-2xl glass transition-smooth hover-lift",
        done && "border border-primary/40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-hidden>
            {challenge.icon}
          </span>
          <div>
            <p className="font-display font-semibold text-sm leading-tight">
              {challenge.label}
            </p>
            <p className="text-xs text-muted-foreground">
              +{challenge.xp} XP reward
            </p>
          </div>
        </div>
        {done && (
          <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        )}
      </div>
      <div className="space-y-1">
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
            className="h-full rounded-full"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.75 0.28 265), oklch(0.7 0.28 165))",
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>
            {challenge.progress} / {challenge.total}
          </span>
          <span>{Math.round(pct)}%</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Achievements Page ───────────────────────────────────────────────────

export function AchievementsPage() {
  const { progress, badges, xpEvents, isLoading } = useGamification();

  const totalXp = progress ? Number(progress.totalXp) : 0;
  const level = progress ? Number(progress.level) : 1;
  const levelTitle =
    LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length - 1)] ?? "Memory Legend";
  const xpInLevel = totalXp - (level - 1) * 500;
  const xpForNextLevel = 500;
  const progressPct = Math.min(100, (xpInLevel / xpForNextLevel) * 100);
  const xpToNext = Math.max(0, level * 500 - totalXp);
  const unlockedCount = badges.filter(isUnlocked).length;

  if (isLoading) {
    return (
      <div
        data-ocid="achievements.page"
        className="p-6 max-w-6xl mx-auto space-y-6"
      >
        <Skeleton className="h-48 w-full rounded-3xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {["b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8"].map((k) => (
            <Skeleton key={k} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      data-ocid="achievements.page"
      className="p-6 space-y-8 max-w-6xl mx-auto"
    >
      {/* ── Hero Banner ──────────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        data-ocid="achievements.hero"
        className="relative rounded-3xl overflow-hidden"
      >
        <div
          className="absolute inset-0 gradient-mesh opacity-80"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at 30% 50%, oklch(0.75 0.3 265 / 0.4) 0%, transparent 60%), radial-gradient(ellipse 50% 60% at 80% 30%, oklch(0.7 0.3 165 / 0.3) 0%, transparent 60%)",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div
            className="w-24 h-24 rounded-3xl flex flex-col items-center justify-center shrink-0 float-animate"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.2 0.1 265 / 0.8), oklch(0.15 0.08 200 / 0.8))",
              border: "1px solid oklch(0.8 0.3 265 / 0.4)",
              boxShadow: "0 0 40px 0 oklch(0.75 0.28 265 / 0.5)",
            }}
          >
            <span className="font-display font-black text-4xl text-white leading-none">
              {level}
            </span>
            <span className="text-[10px] text-white/70 uppercase tracking-widest font-medium">
              Level
            </span>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h1 className="font-display font-black text-3xl md:text-4xl text-white leading-tight">
                {levelTitle}
              </h1>
              <p className="text-white/70 text-sm mt-1">
                {unlockedCount} / {badges.length} badges unlocked ·{" "}
                {totalXp.toLocaleString()} total XP
              </p>
            </div>

            <div className="space-y-2 max-w-md">
              <div className="flex justify-between text-xs text-white/80 font-medium">
                <span>
                  {xpInLevel} / {xpForNextLevel} XP to Level {level + 1}
                </span>
                <span>{xpToNext} XP remaining</span>
              </div>
              <div className="h-3 rounded-full bg-white/20 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, oklch(0.9 0.15 85), oklch(0.85 0.2 40))",
                  }}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              {[
                { label: "Total XP", value: totalXp.toLocaleString() },
                { label: "Current Level", value: `Lv. ${level}` },
                { label: "Badges", value: `${unlockedCount}/${badges.length}` },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="px-3 py-1.5 rounded-xl text-center"
                  style={{
                    background: "oklch(1 0 0 / 0.1)",
                    border: "1px solid oklch(1 0 0 / 0.15)",
                  }}
                >
                  <p className="font-display font-bold text-white text-base leading-none">
                    {stat.value}
                  </p>
                  <p className="text-white/60 text-[10px] mt-0.5">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Three column: badges + xp events + challenges ──────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Badge Grid */}
        <section
          data-ocid="achievements.badges_section"
          className="xl:col-span-2 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg">Badges</h2>
            <span className="text-sm text-muted-foreground">
              {unlockedCount} unlocked
            </span>
          </div>
          {badges.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center text-muted-foreground text-sm">
              No badges available yet. Keep studying to earn them!
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {badges.map((badge, i) => (
                <BadgeCard key={badge.id} badge={badge} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* Right column */}
        <div className="space-y-6">
          {/* Daily Challenges */}
          <section
            data-ocid="achievements.challenges_section"
            className="space-y-3"
          >
            <h2 className="font-display font-bold text-lg">Daily Challenges</h2>
            {DAILY_CHALLENGES.map((ch, i) => (
              <DailyChallenge key={ch.id} challenge={ch} index={i} />
            ))}
          </section>

          {/* Recent XP Events */}
          <section
            data-ocid="achievements.xp_events_section"
            className="space-y-3"
          >
            <h2 className="font-display font-bold text-lg">Recent XP</h2>
            {xpEvents.length === 0 ? (
              <div className="glass rounded-xl p-4 text-center text-xs text-muted-foreground">
                No XP events yet. Start reviewing cards!
              </div>
            ) : (
              <AnimatePresence>
                <div className="space-y-2">
                  {xpEvents.slice(0, 10).map((ev, i) => (
                    <XpEventRow key={ev.id.toString()} event={ev} index={i} />
                  ))}
                </div>
              </AnimatePresence>
            )}
          </section>
        </div>
      </div>

      {/* ── Level Roadmap ──────────────────────────────────────────────────── */}
      <section data-ocid="achievements.level_roadmap" className="space-y-4">
        <h2 className="font-display font-bold text-lg">Level Roadmap</h2>
        <div className="glass-elevated rounded-2xl p-6">
          <LevelRoadmap currentLevel={level} />
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((lvl) => (
              <div
                key={lvl}
                className={cn(
                  "text-center px-2 py-1.5 rounded-lg text-xs transition-smooth",
                  lvl === level
                    ? "font-display font-bold gradient-text-violet border border-primary/30 bg-primary/10"
                    : lvl < level
                      ? "text-muted-foreground/70"
                      : "text-muted-foreground/40",
                )}
              >
                <span className="block font-medium">{LEVEL_TITLES[lvl]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
