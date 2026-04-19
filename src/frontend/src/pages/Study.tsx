import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDueItems, useSubmitReview } from "@/hooks/useQueries";
import type { MemoryItem, Rating } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const RATING_CONFIG = [
  {
    rating: "Again" as Rating,
    label: "Again",
    key: "1",
    hint: "Forgot completely — interval reset",
    colorClass: "text-red-400",
    borderClass: "border-red-500/40",
    hoverClass: "hover:bg-red-500/15 hover:border-red-500/70",
    multiplier: 0.1,
  },
  {
    rating: "Hard" as Rating,
    label: "Hard",
    key: "2",
    hint: "Struggled but recalled — small boost",
    colorClass: "text-orange-400",
    borderClass: "border-orange-500/40",
    hoverClass: "hover:bg-orange-500/15 hover:border-orange-500/70",
    multiplier: 0.6,
  },
  {
    rating: "Good" as Rating,
    label: "Good",
    key: "3",
    hint: "Recalled with some effort — normal interval",
    colorClass: "text-emerald-400",
    borderClass: "border-emerald-500/40",
    hoverClass: "hover:bg-emerald-500/15 hover:border-emerald-500/70",
    multiplier: 1.0,
  },
  {
    rating: "Easy" as Rating,
    label: "Easy",
    key: "4",
    hint: "Instant recall — large interval boost",
    colorClass: "text-sky-400",
    borderClass: "border-sky-500/40",
    hoverClass: "hover:bg-sky-500/15 hover:border-sky-500/70",
    multiplier: 2.5,
  },
] as const;

function getNextReviewEstimate(stability: number, multiplier: number): string {
  const days = Math.max(1, Math.round(stability * multiplier));
  if (days === 1) return "tomorrow";
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.round(days / 7)}w`;
  return `${Math.round(days / 30)}mo`;
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function StudySkeleton() {
  return (
    <div
      data-ocid="study.loading_state"
      className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto px-4 py-10"
    >
      <Skeleton className="h-1.5 w-full rounded-full" />
      <div className="flex items-center justify-between w-full mt-2">
        <Skeleton className="h-5 w-28 rounded" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
      <Skeleton className="h-14 w-full rounded-xl" />
      <div className="grid grid-cols-4 gap-3 w-full">
        {(["sk-1", "sk-2", "sk-3", "sk-4"] as const).map((k) => (
          <Skeleton key={k} className="h-16 w-full rounded-xl" />
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
      <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-5xl">
        ✨
      </div>
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">
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

interface SessionCompleteProps {
  reviewed: number;
  correct: number;
  elapsed: number;
  onRestart: () => void;
}

function SessionComplete({
  reviewed,
  correct,
  elapsed,
  onRestart,
}: SessionCompleteProps) {
  const navigate = useNavigate();
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const accuracy = reviewed > 0 ? Math.round((correct / reviewed) * 100) : 0;

  const stats = [
    { label: "Reviewed", value: String(reviewed), sub: "cards" },
    { label: "Accuracy", value: `${accuracy}%`, sub: `${correct} correct` },
    {
      label: "Time",
      value: `${minutes}m ${seconds}s`,
      sub: "focused study",
    },
  ];

  return (
    <motion.div
      data-ocid="study.complete_panel"
      className="flex flex-col items-center gap-8 w-full max-w-xl mx-auto px-4 py-16 text-center"
      initial={{ opacity: 0, scale: 0.93 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="w-24 h-24 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-5xl">
        🎉
      </div>
      <div>
        <h2 className="text-3xl font-display font-bold text-foreground">
          Session Complete!
        </h2>
        <p className="text-muted-foreground mt-2">
          Your memory pathways are strengthening.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full">
        {stats.map(({ label, value, sub }) => (
          <div
            key={`stat-${label}`}
            className="bg-card border border-border rounded-xl p-4"
          >
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
              {label}
            </p>
            <p className="text-2xl font-display font-bold text-foreground">
              {value}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

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
          className="flex-1"
          onClick={() => navigate({ to: "/" })}
        >
          Back to Dashboard
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Flash Card ───────────────────────────────────────────────────────────────

interface FlashCardProps {
  item: MemoryItem;
  isFlipped: boolean;
  onFlip: () => void;
}

function FlashCard({ item, isFlipped, onFlip }: FlashCardProps) {
  const stateColor =
    item.state === "New"
      ? "text-emerald-400 border-emerald-500/30"
      : item.state === "Learning"
        ? "text-orange-400 border-orange-500/30"
        : "text-sky-400 border-sky-500/30";

  return (
    <button
      type="button"
      data-ocid="study.card"
      className="relative w-full cursor-pointer select-none text-left"
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
        {/* ── Question face ── */}
        <div
          className="w-full min-h-[260px] bg-card border border-border rounded-2xl p-8 flex flex-col items-center justify-center gap-5 shadow-elevated"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`text-[10px] uppercase tracking-widest ${stateColor}`}
            >
              {item.state}
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

        {/* ── Answer face ── */}
        <div
          className="absolute inset-0 w-full min-h-[260px] bg-card border border-primary/25 rounded-2xl p-8 flex flex-col items-center justify-center gap-5 shadow-elevated"
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

interface RatingButtonsProps {
  item: MemoryItem;
  onRate: (rating: Rating) => void;
  disabled: boolean;
}

function RatingButtons({ item, onRate, disabled }: RatingButtonsProps) {
  const [hovered, setHovered] = useState<Rating | null>(null);

  const hint = hovered ? RATING_CONFIG.find((r) => r.rating === hovered) : null;

  return (
    <motion.div
      className="w-full flex flex-col gap-3"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Hover hint row */}
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
            multiplier,
          }) => (
            <button
              key={`rate-${rating}`}
              type="button"
              data-ocid={`study.rate_${rating.toLowerCase()}_button`}
              disabled={disabled}
              onClick={() => onRate(rating)}
              onMouseEnter={() => setHovered(rating)}
              onMouseLeave={() => setHovered(null)}
              className={[
                "flex flex-col items-center gap-2 rounded-xl border px-2 py-3.5",
                "bg-card transition-smooth cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                borderClass,
                hoverClass,
              ].join(" ")}
            >
              <span
                className={`text-base font-display font-bold ${colorClass}`}
              >
                {label}
              </span>
              <div className="flex flex-col items-center gap-0.5">
                <kbd className="text-[10px] text-muted-foreground font-mono bg-muted rounded px-1.5 py-0.5 border border-border">
                  {key}
                </kbd>
                <span className="text-[10px] text-muted-foreground">
                  {getNextReviewEstimate(item.fsrs.stability, multiplier)}
                </span>
              </div>
            </button>
          ),
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Study Page ──────────────────────────────────────────────────────────

export function StudyPage() {
  const { data: dueItems, isLoading } = useDueItems();
  const submitReview = useSubmitReview();
  const navigate = useNavigate();

  const [queue, setQueue] = useState<MemoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  // Seed queue once items load
  useEffect(() => {
    if (dueItems && dueItems.length > 0 && queue.length === 0) {
      setQueue([...dueItems]);
      startTimeRef.current = Date.now();
    }
  }, [dueItems, queue.length]);

  const currentItem = queue[currentIndex] ?? null;
  const totalCards = queue.length;
  const progress = totalCards > 0 ? (reviewedCount / totalCards) * 100 : 0;

  const correctCount = useMemo(
    () => ratings.filter((r) => r === "Good" || r === "Easy").length,
    [ratings],
  );

  const handleFlip = useCallback(() => {
    setIsFlipped((f) => !f);
  }, []);

  const handleRate = useCallback(
    async (rating: Rating) => {
      if (!currentItem) return;
      await submitReview.mutateAsync({ itemId: currentItem.id, rating });
      setRatings((prev) => [...prev, rating]);
      setReviewedCount((c) => c + 1);
      const nextIndex = currentIndex + 1;
      if (nextIndex >= totalCards) {
        setSessionDone(true);
      } else {
        setCurrentIndex(nextIndex);
        setIsFlipped(false);
      }
    },
    [currentItem, currentIndex, totalCards, submitReview],
  );

  const handleRestart = useCallback(() => {
    if (!dueItems) return;
    setQueue([...dueItems]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setRatings([]);
    setReviewedCount(0);
    setSessionDone(false);
    startTimeRef.current = Date.now();
  }, [dueItems]);

  // Keyboard shortcuts
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
        if (e.key === "1") handleRate("Again");
        else if (e.key === "2") handleRate("Hard");
        else if (e.key === "3") handleRate("Good");
        else if (e.key === "4") handleRate("Easy");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isFlipped, sessionDone, handleFlip, handleRate]);

  const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="min-h-full bg-background flex flex-col items-center justify-center">
        <StudySkeleton />
      </div>
    );
  }

  // ── Empty ──
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

  // ── Session Complete ──
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
          onRestart={handleRestart}
        />
      </div>
    );
  }

  // ── Active Study ──
  return (
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
            className="text-sm text-muted-foreground hover:text-foreground transition-smooth flex items-center gap-1"
          >
            ← Dashboard
          </button>
          <span
            data-ocid="study.card_counter"
            className="text-sm text-muted-foreground"
          >
            <span className="text-foreground font-semibold font-display">
              {reviewedCount}
            </span>{" "}
            / {totalCards} reviewed
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div
        data-ocid="study.progress_bar"
        className="w-full h-1.5 bg-muted"
        role="progressbar"
        tabIndex={-1}
        aria-valuenow={reviewedCount}
        aria-valuemin={0}
        aria-valuemax={totalCards}
      >
        <motion.div
          className="h-full bg-primary rounded-r-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        />
      </div>

      {/* Study area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl flex flex-col gap-5">
          {/* Card header row */}
          <div className="flex items-center justify-between px-1">
            <span className="text-sm text-muted-foreground">
              Card{" "}
              <span className="text-foreground font-semibold font-display">
                {currentIndex + 1}
              </span>{" "}
              of {totalCards}
            </span>
            {currentItem && (
              <Badge
                variant="outline"
                className="text-xs text-muted-foreground"
              >
                Rep #{currentItem.fsrs.reps + 1}
              </Badge>
            )}
          </div>

          {/* Flash card with slide-in animation */}
          <AnimatePresence mode="wait">
            {currentItem && (
              <motion.div
                key={`card-${currentItem.id}`}
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -32 }}
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

          {/* Reveal / Rating */}
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
                  className="w-full py-6 text-base font-display font-semibold rounded-xl"
                  onClick={handleFlip}
                >
                  Reveal Answer
                  <span className="ml-2 text-xs opacity-60 font-mono border border-primary-foreground/20 rounded px-1.5 py-0.5">
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

          {/* Keyboard hint */}
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
  );
}
