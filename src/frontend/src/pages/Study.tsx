import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDashboardStats,
  useDueItems,
  useSubmitReview,
} from "@/hooks/useQueries";
import { Difficulty } from "@/types";
import type { MemoryItem } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ─── Rating Config ────────────────────────────────────────────────────────────

type Rating = "Again" | "Hard" | "Good" | "Easy";

const RATING_CONFIG = [
  {
    rating: "Again" as Rating,
    label: "Again",
    key: "1",
    hint: "Forgot completely — interval reset",
    colorClass: "text-red-400",
    borderClass: "border-red-500/40",
    hoverClass: "hover:border-red-500/80",
    glowClass: "shadow-[0_0_24px_0_oklch(0.55_0.22_25/0.5)]",
    gradientFrom: "from-red-500/20",
    gradientTo: "to-red-900/10",
    xp: 5,
    multiplier: 0.1,
    emoji: "😰",
  },
  {
    rating: "Hard" as Rating,
    label: "Hard",
    key: "2",
    hint: "Struggled but recalled — small boost",
    colorClass: "text-orange-400",
    borderClass: "border-orange-500/40",
    hoverClass: "hover:border-orange-500/80",
    glowClass: "shadow-[0_0_24px_0_oklch(0.7_0.18_40/0.5)]",
    gradientFrom: "from-orange-500/20",
    gradientTo: "to-orange-900/10",
    xp: 10,
    multiplier: 0.6,
    emoji: "😅",
  },
  {
    rating: "Good" as Rating,
    label: "Good",
    key: "3",
    hint: "Recalled with some effort — normal interval",
    colorClass: "text-emerald-400",
    borderClass: "border-emerald-500/40",
    hoverClass: "hover:border-emerald-500/80",
    glowClass: "shadow-[0_0_24px_0_oklch(0.65_0.2_145/0.5)]",
    gradientFrom: "from-emerald-500/20",
    gradientTo: "to-emerald-900/10",
    xp: 15,
    multiplier: 1.0,
    emoji: "😊",
  },
  {
    rating: "Easy" as Rating,
    label: "Easy",
    key: "4",
    hint: "Instant recall — large interval boost",
    colorClass: "text-sky-400",
    borderClass: "border-sky-500/40",
    hoverClass: "hover:border-sky-500/80",
    glowClass: "shadow-[0_0_24px_0_oklch(0.75_0.18_190/0.5)]",
    gradientFrom: "from-sky-500/20",
    gradientTo: "to-sky-900/10",
    xp: 20,
    multiplier: 2.5,
    emoji: "🚀",
  },
] as const;

type DifficultyFilter = "all" | "new" | "review" | "hard";

const DIFFICULTY_LABELS: Record<DifficultyFilter, string> = {
  all: "All Cards",
  new: "New Only",
  review: "Due for Review",
  hard: "Hard Cards",
};

function filterItems(
  items: MemoryItem[],
  filter: DifficultyFilter,
): MemoryItem[] {
  switch (filter) {
    case "new":
      return items.filter((i) => i.state === Difficulty.new_);
    case "review":
      return items.filter((i) => i.state === Difficulty.review);
    case "hard":
      return items.filter((i) => i.fsrs.difficulty >= 0.5);
    default:
      return items;
  }
}

function getStateConfig(state: Difficulty | string) {
  switch (state) {
    case Difficulty.new_:
      return {
        label: "New",
        cardGrad: "from-violet-500/20 via-card to-violet-900/10",
        borderColor: "border-violet-500/50",
        glowColor: "shadow-[0_0_30px_0_oklch(0.75_0.25_265/0.3)]",
        badgeClass: "text-violet-400 border-violet-500/40 bg-violet-500/10",
      };
    case Difficulty.learning:
      return {
        label: "Learning",
        cardGrad: "from-amber-500/20 via-card to-amber-900/10",
        borderColor: "border-amber-500/50",
        glowColor: "shadow-[0_0_30px_0_oklch(0.7_0.18_85/0.3)]",
        badgeClass: "text-amber-400 border-amber-500/40 bg-amber-500/10",
      };
    case Difficulty.relearning:
      return {
        label: "Relearning",
        cardGrad: "from-red-500/20 via-card to-red-900/10",
        borderColor: "border-red-500/50",
        glowColor: "shadow-[0_0_30px_0_oklch(0.55_0.22_25/0.3)]",
        badgeClass: "text-red-400 border-red-500/40 bg-red-500/10",
      };
    default:
      return {
        label: "Review",
        cardGrad: "from-sky-500/20 via-card to-sky-900/10",
        borderColor: "border-sky-500/50",
        glowColor: "shadow-[0_0_30px_0_oklch(0.75_0.15_190/0.3)]",
        badgeClass: "text-sky-400 border-sky-500/40 bg-sky-500/10",
      };
  }
}

function getNextReviewEstimate(stability: number, multiplier: number): string {
  const days = Math.max(1, Math.round(stability * multiplier));
  if (days === 1) return "tomorrow";
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.round(days / 7)}w`;
  return `${Math.round(days / 30)}mo`;
}

// ─── XP Gain Effect ───────────────────────────────────────────────────────────

interface XpPopup {
  id: number;
  xp: number;
  x: number;
  color: string;
}

function XpGainEffect({ popups }: { popups: XpPopup[] }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-50" aria-hidden>
      <AnimatePresence>
        {popups.map((p) => (
          <motion.div
            key={p.id}
            className="absolute font-display font-black text-2xl select-none"
            style={{ left: p.x, top: "55%", color: p.color }}
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ opacity: 0, y: -90, scale: 1.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          >
            +{p.xp} XP
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Confetti Canvas ──────────────────────────────────────────────────────────

function ConfettiBurst({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = [
      "#a78bfa",
      "#34d399",
      "#38bdf8",
      "#fb923c",
      "#f472b6",
      "#facc15",
    ];
    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      life: number;
      rotation: number;
      rotSpeed: number;
    }[] = [];

    for (let i = 0; i < 160; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height * 0.45,
        vx: (Math.random() - 0.5) * 14,
        vy: -(Math.random() * 16 + 6),
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        life: 1,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.3,
      });
    }

    let animId: number;
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        p.vy += 0.4;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.life -= 0.012;
        if (p.life <= 0) continue;
        alive = true;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
        ctx.restore();
      }
      if (alive) animId = requestAnimationFrame(draw);
    }
    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      aria-hidden
    />
  );
}

// ─── Difficulty Filter Bar ────────────────────────────────────────────────────

function DifficultyFilterBar({
  value,
  onChange,
  counts,
}: {
  value: DifficultyFilter;
  onChange: (v: DifficultyFilter) => void;
  counts: Record<DifficultyFilter, number>;
}) {
  const filters: DifficultyFilter[] = ["all", "new", "review", "hard"];
  return (
    <motion.div
      className="flex gap-2 flex-wrap justify-center"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {filters.map((f) => (
        <button
          key={f}
          type="button"
          data-ocid={`study.filter.${f}`}
          onClick={() => onChange(f)}
          className={[
            "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-smooth border",
            value === f
              ? "bg-primary text-primary-foreground border-primary shadow-glow-sm"
              : "glass border-border text-muted-foreground hover:text-foreground hover:border-primary/40",
          ].join(" ")}
        >
          {DIFFICULTY_LABELS[f]}
          <span
            className={[
              "text-[10px] font-mono px-1.5 py-0.5 rounded-full",
              value === f
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-muted text-muted-foreground",
            ].join(" ")}
          >
            {counts[f]}
          </span>
        </button>
      ))}
    </motion.div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function StudySkeleton() {
  return (
    <div
      data-ocid="study.loading_state"
      className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto px-4 py-10"
    >
      <Skeleton className="h-2 w-full rounded-full" />
      <div className="flex items-center justify-between w-full mt-2">
        <Skeleton className="h-5 w-28 rounded" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-72 w-full rounded-2xl" />
      <Skeleton className="h-14 w-full rounded-xl" />
      <div className="grid grid-cols-4 gap-3 w-full">
        {(["sk-1", "sk-2", "sk-3", "sk-4"] as const).map((k) => (
          <Skeleton key={k} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  const navigate = useNavigate();
  return (
    <motion.div
      data-ocid="study.empty_state"
      className="flex flex-col items-center gap-6 max-w-md mx-auto px-4 py-20 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="w-28 h-28 rounded-full glass-elevated border-2 border-primary/30 flex items-center justify-center text-6xl glow-primary"
        animate={{ y: [0, -10, 0] }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        ✨
      </motion.div>
      <div>
        <h2 className="text-2xl font-display font-bold gradient-text-violet">
          All caught up!
        </h2>
        <p className="text-muted-foreground mt-2 leading-relaxed">
          No cards are due for review right now. Come back later or expand your
          collections.
        </p>
      </div>
      <div className="flex gap-3">
        <Button
          data-ocid="study.empty_add_cards_button"
          onClick={() => navigate({ to: "/collections" })}
          className="glow-primary"
        >
          Add Cards
        </Button>
        <Button
          data-ocid="study.empty_dashboard_button"
          variant="outline"
          onClick={() => navigate({ to: "/" })}
        >
          Dashboard
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Session Complete ─────────────────────────────────────────────────────────

function SessionComplete({
  reviewed,
  correct,
  elapsed,
  streak,
  totalXp,
  onRestart,
}: {
  reviewed: number;
  correct: number;
  elapsed: number;
  streak: number;
  totalXp: number;
  onRestart: () => void;
}) {
  const navigate = useNavigate();
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const accuracy = reviewed > 0 ? Math.round((correct / reviewed) * 100) : 0;
  const isStreakMilestone = streak >= 7;
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isStreakMilestone) {
      const t = setTimeout(() => setShowConfetti(true), 400);
      return () => clearTimeout(t);
    }
  }, [isStreakMilestone]);

  const level = Math.floor(totalXp / 100) + 1;
  const levelXp = totalXp % 100;

  const stats = [
    { label: "Reviewed", value: String(reviewed), sub: "cards", icon: "🧠" },
    {
      label: "Accuracy",
      value: `${accuracy}%`,
      sub: `${correct} correct`,
      icon: "🎯",
    },
    {
      label: "Time",
      value: `${minutes}m ${seconds}s`,
      sub: "focused study",
      icon: "⏱️",
    },
  ];

  return (
    <>
      <ConfettiBurst active={showConfetti} />
      <motion.div
        data-ocid="study.complete_panel"
        className="flex flex-col items-center gap-8 w-full max-w-xl mx-auto px-4 py-12 text-center"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.div
          className="w-28 h-28 rounded-full bg-gradient-to-br from-violet-500/30 to-cyan-500/30 border-2 border-primary/40 flex items-center justify-center text-6xl glow-violet pulse-glow"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        >
          🎉
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl font-display font-black gradient-text-violet">
            Session Complete!
          </h2>
          <p className="text-muted-foreground mt-2">
            Your memory pathways are growing stronger.
          </p>
        </motion.div>

        <motion.div
          className="flex items-center gap-3 glass-elevated rounded-2xl px-5 py-3 border border-primary/30 glow-primary"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-2xl">⚡</span>
          <div className="text-left">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              XP Earned
            </p>
            <p className="text-2xl font-display font-black gradient-text-violet counter-animate">
              +{totalXp}
            </p>
          </div>
          <div className="w-px h-8 bg-border mx-1" />
          <div className="text-left">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              Level
            </p>
            <p className="text-2xl font-display font-black text-foreground">
              {level}
            </p>
          </div>
        </motion.div>

        <motion.div
          className="w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Level {level}</span>
            <span>{levelXp}/100 XP</span>
          </div>
          <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
              style={{ boxShadow: "0 0 10px oklch(0.75 0.25 265 / 0.6)" }}
              initial={{ width: 0 }}
              animate={{ width: `${levelXp}%` }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-4 w-full">
          {stats.map(({ label, value, sub, icon }, i) => (
            <motion.div
              key={`stat-${label}`}
              className="glass rounded-2xl p-4 border border-border hover:border-primary/30 transition-smooth"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
            >
              <div className="text-2xl mb-1">{icon}</div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
                {label}
              </p>
              <p className="text-xl font-display font-bold text-foreground counter-animate">
                {value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </motion.div>
          ))}
        </div>

        {isStreakMilestone && (
          <motion.div
            className="flex items-center gap-3 glass-elevated rounded-2xl px-5 py-3 border-2 border-amber-500/60 shadow-[0_0_24px_0_oklch(0.7_0.18_85/0.4)]"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.65, type: "spring", stiffness: 180 }}
          >
            <span className="text-3xl">🔥</span>
            <div className="text-left">
              <p className="text-xs text-amber-400 uppercase tracking-widest font-medium">
                Badge Unlocked
              </p>
              <p className="text-lg font-display font-bold text-foreground">
                Week Warrior!
              </p>
              <p className="text-xs text-muted-foreground">
                {streak}-day streak — keep it up!
              </p>
            </div>
          </motion.div>
        )}

        <div className="flex gap-3 w-full">
          <Button
            data-ocid="study.complete_restart_button"
            variant="outline"
            className="flex-1"
            onClick={onRestart}
          >
            Study More
          </Button>
          <Button
            data-ocid="study.complete_dashboard_button"
            className="flex-1 glow-primary"
            onClick={() => navigate({ to: "/" })}
          >
            Back to Dashboard
          </Button>
        </div>
      </motion.div>
    </>
  );
}

// ─── Flash Card ───────────────────────────────────────────────────────────────

function FlashCard({
  item,
  isFlipped,
  onFlip,
}: { item: MemoryItem; isFlipped: boolean; onFlip: () => void }) {
  const stateConf = getStateConfig(item.state);

  return (
    <button
      type="button"
      data-ocid="study.card"
      className="relative w-full cursor-pointer select-none text-left group"
      style={{ perspective: "1400px" }}
      onClick={onFlip}
      aria-label={
        isFlipped
          ? "Answer card — click to flip back"
          : "Question card — click to reveal answer"
      }
    >
      <motion.div
        className="relative w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.52, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Question face */}
        <div
          className={[
            "w-full min-h-[280px] rounded-2xl p-8 flex flex-col items-center justify-center gap-5",
            "glass-elevated border-2 transition-smooth",
            `bg-gradient-to-br ${stateConf.cardGrad}`,
            stateConf.borderColor,
            stateConf.glowColor,
            "group-hover:scale-[1.01] group-hover:shadow-elevated",
          ].join(" ")}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <Badge
              variant="outline"
              className={`text-[10px] uppercase tracking-widest border ${stateConf.badgeClass}`}
            >
              {stateConf.label}
            </Badge>
            {item.tags.slice(0, 2).map((tag) => (
              <Badge
                key={`q-tag-${tag}`}
                variant="outline"
                className="text-[10px] text-muted-foreground"
              >
                #{tag}
              </Badge>
            ))}
          </div>
          <p className="text-xl font-display font-semibold text-foreground text-center leading-relaxed max-w-lg">
            {item.question}
          </p>
          <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
            <span className="opacity-60">Tap or press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-xs font-mono">
              Space
            </kbd>
            <span className="opacity-60">to reveal</span>
          </p>
        </div>

        {/* Answer face */}
        <div
          className={[
            "absolute inset-0 w-full min-h-[280px] rounded-2xl p-8 flex flex-col items-center justify-center gap-5",
            "glass-elevated border-2 bg-gradient-to-br from-primary/15 via-card to-primary/5",
            "border-primary/50 shadow-[0_0_30px_0_oklch(var(--primary)/0.35)]",
          ].join(" ")}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <Badge className="text-[10px] uppercase tracking-widest bg-primary/20 text-primary border-primary/30 border">
            Answer
          </Badge>
          <p className="text-lg text-foreground text-center leading-relaxed max-w-lg">
            {item.answer}
          </p>
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-center">
              {item.tags.map((tag) => (
                <Badge
                  key={`a-tag-${tag}`}
                  variant="outline"
                  className="text-xs text-muted-foreground"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </button>
  );
}

// ─── Rating Buttons ───────────────────────────────────────────────────────────

function RatingButtons({
  item,
  onRate,
  disabled,
}: {
  item: MemoryItem;
  onRate: (rating: Rating, xp: number) => void;
  disabled: boolean;
}) {
  const [hovered, setHovered] = useState<Rating | null>(null);
  const hint = hovered ? RATING_CONFIG.find((r) => r.rating === hovered) : null;

  return (
    <motion.div
      className="w-full flex flex-col gap-3"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="h-6 text-center">
        <AnimatePresence mode="wait">
          {hint && (
            <motion.p
              key={hint.rating}
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
            >
              {hint.hint}
              <span className="text-foreground font-medium">
                {" "}
                — review{" "}
                {getNextReviewEstimate(item.fsrs.stability, hint.multiplier)}
              </span>
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-4 gap-3" data-ocid="study.rating_buttons">
        {RATING_CONFIG.map(
          ({
            rating,
            label,
            key,
            colorClass,
            borderClass,
            hoverClass,
            glowClass,
            gradientFrom,
            gradientTo,
            xp,
            multiplier,
            emoji,
          }) => (
            <motion.button
              key={`rate-${rating}`}
              type="button"
              data-ocid={`study.rate_${rating.toLowerCase()}_button`}
              disabled={disabled}
              onClick={() => onRate(rating, xp)}
              onMouseEnter={() => setHovered(rating)}
              onMouseLeave={() => setHovered(null)}
              whileHover={{ scale: 1.06, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className={[
                "flex flex-col items-center gap-2 rounded-2xl border-2 px-2 py-4",
                "glass transition-smooth cursor-pointer relative overflow-hidden",
                `bg-gradient-to-b ${gradientFrom} ${gradientTo}`,
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
                borderClass,
                hoverClass,
              ].join(" ")}
            >
              <AnimatePresence>
                {hovered === rating && (
                  <motion.span
                    className={`absolute top-1.5 right-2 text-[10px] font-bold font-mono ${colorClass}`}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.15 }}
                  >
                    +{xp}XP
                  </motion.span>
                )}
              </AnimatePresence>
              <span className="text-xl">{emoji}</span>
              <span
                className={`text-base font-display font-black ${colorClass}`}
              >
                {label}
              </span>
              <div className="flex flex-col items-center gap-0.5">
                <kbd
                  className={`text-[10px] font-mono rounded px-1.5 py-0.5 border ${colorClass} border-current/30 bg-current/5`}
                >
                  {key}
                </kbd>
                <span className="text-[10px] text-muted-foreground">
                  {getNextReviewEstimate(item.fsrs.stability, multiplier)}
                </span>
              </div>
              {hovered === rating && (
                <motion.div
                  className={`absolute inset-0 rounded-2xl pointer-events-none ${glowClass}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </motion.button>
          ),
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Study Page ──────────────────────────────────────────────────────────

export function StudyPage() {
  const { data: dueItems, isLoading } = useDueItems();
  const { data: stats } = useDashboardStats();
  const submitReview = useSubmitReview();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<DifficultyFilter>("all");
  const [filterApplied, setFilterApplied] = useState(false);

  const [queue, setQueue] = useState<MemoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);
  const [totalXp, setTotalXp] = useState(0);
  const [xpPopups, setXpPopups] = useState<XpPopup[]>([]);
  const popupIdRef = useRef(0);
  const startTimeRef = useRef<number>(Date.now());

  const filterCounts = useMemo<Record<DifficultyFilter, number>>(() => {
    const all = dueItems ?? [];
    return {
      all: all.length,
      new: all.filter((i) => i.state === Difficulty.new_).length,
      review: all.filter((i) => i.state === Difficulty.review).length,
      hard: all.filter((i) => i.fsrs.difficulty >= 0.5).length,
    };
  }, [dueItems]);

  const startSession = useCallback(() => {
    if (!dueItems) return;
    const filtered = filterItems(dueItems, filter);
    setQueue([...filtered]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setRatings([]);
    setReviewedCount(0);
    setSessionDone(false);
    setTotalXp(0);
    setFilterApplied(true);
    startTimeRef.current = Date.now();
  }, [dueItems, filter]);

  useEffect(() => {
    if (
      dueItems &&
      dueItems.length > 0 &&
      queue.length === 0 &&
      !filterApplied
    ) {
      setQueue([...dueItems]);
      startTimeRef.current = Date.now();
    }
  }, [dueItems, queue.length, filterApplied]);

  const currentItem = queue[currentIndex] ?? null;
  const totalCards = queue.length;
  const progress = totalCards > 0 ? (reviewedCount / totalCards) * 100 : 0;
  const streak = stats ? Number(stats.studyStreak) : 0;

  const correctCount = useMemo(
    () => ratings.filter((r) => r === "Good" || r === "Easy").length,
    [ratings],
  );

  const handleFlip = useCallback(() => setIsFlipped((f) => !f), []);

  const spawnXpPopup = useCallback((xp: number) => {
    const id = ++popupIdRef.current;
    const x = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
    const colorMap: Record<number, string> = {
      5: "#f87171",
      10: "#fb923c",
      15: "#34d399",
      20: "#38bdf8",
    };
    const color = colorMap[xp] ?? "#a78bfa";
    setXpPopups((prev) => [...prev, { id, xp, x, color }]);
    setTimeout(() => {
      setXpPopups((prev) => prev.filter((p) => p.id !== id));
    }, 1200);
  }, []);

  const handleRate = useCallback(
    async (rating: Rating, xp: number) => {
      if (!currentItem) return;
      try {
        await submitReview.mutateAsync({ itemId: currentItem.id, rating });
        setRatings((prev) => [...prev, rating]);
        setReviewedCount((c) => c + 1);
        setTotalXp((t) => t + xp);
        spawnXpPopup(xp);
        const nextIndex = currentIndex + 1;
        if (nextIndex >= totalCards) {
          setSessionDone(true);
        } else {
          setCurrentIndex(nextIndex);
          setIsFlipped(false);
        }
      } catch {
        // submitReview failed — still advance to next card
        const nextIndex = currentIndex + 1;
        if (nextIndex >= totalCards) {
          setSessionDone(true);
        } else {
          setCurrentIndex(nextIndex);
          setIsFlipped(false);
        }
      }
    },
    [currentItem, currentIndex, totalCards, submitReview, spawnXpPopup],
  );

  const handleRestart = useCallback(() => {
    if (!dueItems) return;
    const filtered = filterItems(dueItems, filter);
    setQueue([...filtered]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setRatings([]);
    setReviewedCount(0);
    setSessionDone(false);
    setTotalXp(0);
    startTimeRef.current = Date.now();
  }, [dueItems, filter]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (sessionDone) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.key === " " || e.key === "Enter") && !isFlipped) {
        e.preventDefault();
        handleFlip();
      }
      if (isFlipped) {
        const ratingXpMap: Record<string, { rating: Rating; xp: number }> = {
          "1": { rating: "Again", xp: 5 },
          "2": { rating: "Hard", xp: 10 },
          "3": { rating: "Good", xp: 15 },
          "4": { rating: "Easy", xp: 20 },
        };
        const mapped = ratingXpMap[e.key];
        if (mapped) handleRate(mapped.rating, mapped.xp);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isFlipped, sessionDone, handleFlip, handleRate]);

  const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);

  if (isLoading) {
    return (
      <div className="min-h-full bg-background flex flex-col items-center justify-center">
        <StudySkeleton />
      </div>
    );
  }

  if (!dueItems || dueItems.length === 0) {
    return (
      <div
        data-ocid="study.page"
        className="min-h-full bg-background flex flex-col items-center justify-center"
      >
        <EmptyState />
      </div>
    );
  }

  if (sessionDone) {
    return (
      <div
        data-ocid="study.page"
        className="min-h-full bg-background flex flex-col items-center justify-center"
      >
        <SessionComplete
          reviewed={reviewedCount}
          correct={correctCount}
          elapsed={elapsedSeconds}
          streak={streak}
          totalXp={totalXp}
          onRestart={handleRestart}
        />
      </div>
    );
  }

  if (filterApplied && queue.length === 0) {
    return (
      <div
        data-ocid="study.page"
        className="min-h-full bg-background flex flex-col items-center justify-center gap-6 px-4"
      >
        <div className="text-center">
          <p className="text-5xl mb-3">🔍</p>
          <h2 className="text-xl font-display font-bold text-foreground">
            No cards match this filter
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Try a different difficulty category
          </p>
        </div>
        <DifficultyFilterBar
          value={filter}
          onChange={setFilter}
          counts={filterCounts}
        />
        <Button
          data-ocid="study.filter_start_button"
          onClick={startSession}
          className="glow-primary"
        >
          Start Session
        </Button>
      </div>
    );
  }

  return (
    <>
      <XpGainEffect popups={xpPopups} />
      <div
        data-ocid="study.page"
        className="min-h-full bg-background flex flex-col"
      >
        {/* Top bar */}
        <div className="bg-card border-b border-border px-5 py-3 shadow-subtle">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button
              type="button"
              data-ocid="study.back_button"
              onClick={() => navigate({ to: "/" })}
              className="text-sm text-muted-foreground hover:text-foreground transition-smooth flex items-center gap-1.5"
            >
              ← Dashboard
            </button>
            <div className="flex items-center gap-3">
              <motion.span
                key={totalXp}
                className="text-xs font-mono font-bold text-primary flex items-center gap-1"
                initial={{ scale: 1.4, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                ⚡ {totalXp} XP
              </motion.span>
              <span
                data-ocid="study.card_counter"
                className="text-sm text-muted-foreground"
              >
                <span className="text-foreground font-semibold font-display">
                  {reviewedCount}
                </span>{" "}
                / {totalCards}
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div
          data-ocid="study.progress_bar"
          className="w-full h-2 bg-muted"
          role="progressbar"
          tabIndex={-1}
          aria-valuenow={reviewedCount}
          aria-valuemin={0}
          aria-valuemax={totalCards}
        >
          <motion.div
            className="h-full rounded-r-full"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.75 0.25 265) 0%, oklch(0.75 0.25 165) 100%)",
              boxShadow:
                "0 0 12px oklch(0.75 0.25 265 / 0.6), 0 0 4px oklch(0.75 0.25 165 / 0.8)",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Study area */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-2xl flex flex-col gap-5">
            {!filterApplied && (
              <DifficultyFilterBar
                value={filter}
                onChange={setFilter}
                counts={filterCounts}
              />
            )}

            <div className="flex items-center justify-between px-1">
              <span className="text-sm text-muted-foreground">
                Card{" "}
                <span className="text-foreground font-semibold font-display">
                  {currentIndex + 1}
                </span>{" "}
                of {totalCards}
              </span>
              <div className="flex items-center gap-2">
                {!filterApplied && (
                  <button
                    type="button"
                    data-ocid="study.apply_filter_button"
                    onClick={startSession}
                    className="text-xs text-primary hover:text-primary/80 transition-smooth underline underline-offset-2"
                  >
                    Apply filter
                  </button>
                )}
                {currentItem && (
                  <Badge
                    variant="outline"
                    className="text-xs text-muted-foreground"
                  >
                    Reps:{" "}
                    {currentItem.fsrs.retrievability !== undefined
                      ? `${Math.round(currentItem.fsrs.retrievability * 100)}% ret.`
                      : "new"}
                  </Badge>
                )}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {currentItem && (
                <motion.div
                  key={`card-${currentItem.id.toString()}`}
                  initial={{ opacity: 0, x: 36 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -36 }}
                  transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                >
                  <FlashCard
                    item={currentItem}
                    isFlipped={isFlipped}
                    onFlip={handleFlip}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {!isFlipped ? (
                <motion.div
                  key="reveal"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22 }}
                >
                  <Button
                    data-ocid="study.reveal_button"
                    className="w-full py-6 text-base font-display font-semibold rounded-xl glow-primary"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.45 0.2 265), oklch(0.55 0.2 210))",
                    }}
                    onClick={handleFlip}
                  >
                    Reveal Answer
                    <span className="ml-2 text-xs opacity-70 font-mono border border-current/20 rounded px-1.5 py-0.5">
                      Space
                    </span>
                  </Button>
                </motion.div>
              ) : (
                currentItem && (
                  <motion.div
                    key="rating"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.22 }}
                  >
                    <RatingButtons
                      item={currentItem}
                      onRate={handleRate}
                      disabled={submitReview.isPending}
                    />
                  </motion.div>
                )
              )}
            </AnimatePresence>

            {isFlipped && (
              <p
                data-ocid="study.keyboard_hint"
                className="text-center text-xs text-muted-foreground"
              >
                Press{" "}
                {(["1", "2", "3", "4"] as const).map((k) => (
                  <kbd
                    key={`kbd-${k}`}
                    className="mx-0.5 font-mono bg-muted px-1.5 py-0.5 rounded text-[10px] border border-border"
                  >
                    {k}
                  </kbd>
                ))}{" "}
                to rate
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
