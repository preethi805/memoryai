import { useGamification } from "@/contexts/GamificationContext";
import { cn } from "@/lib/utils";

interface XpLevelBadgeProps {
  className?: string;
  showXp?: boolean;
}

export function XpLevelBadge({ className, showXp = false }: XpLevelBadgeProps) {
  const { progress } = useGamification();
  const level = progress ? Number(progress.level) : 1;
  const totalXp = progress ? Number(progress.totalXp) : 0;

  // XP thresholds per level (500 XP per level)
  const xpForCurrentLevel = (level - 1) * 500;
  const xpForNextLevel = level * 500;
  const progressPct = Math.min(
    100,
    ((totalXp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) *
      100,
  );

  return (
    <div
      data-ocid="xp_level_badge"
      className={cn("flex items-center gap-2 select-none", className)}
    >
      {/* Level orb */}
      <div
        className="relative flex items-center justify-center w-8 h-8 rounded-full shrink-0 pulse-glow"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.75 0.28 265), oklch(0.7 0.28 165))",
        }}
      >
        <span className="font-display font-bold text-xs text-white leading-none">
          {level}
        </span>
        {/* Ring */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <circle
            cx="16"
            cy="16"
            r="14"
            fill="none"
            stroke="white"
            strokeOpacity="0.2"
            strokeWidth="2"
          />
          <circle
            cx="16"
            cy="16"
            r="14"
            fill="none"
            stroke="white"
            strokeOpacity="0.8"
            strokeWidth="2"
            strokeDasharray={`${2 * Math.PI * 14}`}
            strokeDashoffset={`${2 * Math.PI * 14 * (1 - progressPct / 100)}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
      </div>

      {showXp && (
        <div className="flex flex-col leading-none">
          <span className="font-display font-bold text-xs gradient-text-violet">
            Lv. {level}
          </span>
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {totalXp.toLocaleString()} XP
          </span>
        </div>
      )}
    </div>
  );
}
