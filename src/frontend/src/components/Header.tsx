import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGamification } from "@/contexts/GamificationContext";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardStats } from "@/hooks/useQueries";
import { useTheme } from "@/hooks/useTheme";
import {
  Brain,
  Flame,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Star,
  Sun,
  Zap,
} from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

const XP_PER_LEVEL = 500;

export function Header({ onMenuClick }: HeaderProps) {
  const { isAuthenticated, login, logout } = useAuth();
  const { data: stats } = useDashboardStats();
  const { theme, toggleTheme } = useTheme();
  const { progress } = useGamification();

  const xpIntoLevel = progress ? Number(progress.totalXp) % XP_PER_LEVEL : 0;
  const xpPercent = Math.round((xpIntoLevel / XP_PER_LEVEL) * 100);

  return (
    <header
      data-ocid="header"
      className="h-16 sticky top-0 z-20 flex items-center justify-between px-4 gap-4"
      style={{
        background: "oklch(var(--card) / 0.65)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid oklch(var(--border) / 0.15)",
        boxShadow: "0 1px 32px 0 oklch(var(--glow-violet) / 0.08)",
      }}
    >
      {/* Left: hamburger (mobile) + brand */}
      <div className="flex items-center gap-3 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          data-ocid="header.menu_button"
          onClick={onMenuClick}
          className="md:hidden shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Brand name visible on desktop alongside sidebar logo */}
        <div className="hidden md:flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(var(--neon-violet) / 0.9), oklch(var(--neon-cyan) / 0.7))",
              boxShadow: "0 0 12px 0 oklch(var(--glow-violet) / 0.5)",
            }}
          >
            <Brain className="w-3.5 h-3.5 text-black" />
          </div>
          <span className="gradient-text-violet font-display font-bold text-lg tracking-tight">
            MemoryAI
          </span>
        </div>
      </div>

      {/* Center: streak badge */}
      <div className="flex items-center gap-3 flex-1 justify-center">
        {stats && (
          <div
            data-ocid="header.streak_badge"
            className="pulse-glow flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-display font-semibold"
            style={{
              background: "oklch(var(--accent) / 0.12)",
              border: "1px solid oklch(var(--accent) / 0.35)",
              color: "oklch(var(--accent) / 1)",
            }}
          >
            <Flame className="w-4 h-4" />
            <span>{Number(stats.studyStreak)} Day Streak</span>
            <Flame className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Right: XP chip + items due + theme + auth */}
      <div className="flex items-center gap-2 shrink-0">
        {/* XP / Level chip */}
        <div
          data-ocid="header.level_chip"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full cursor-default"
          style={{
            background: "oklch(0.75 0.25 165 / 0.1)",
            border: "1px solid oklch(0.75 0.25 165 / 0.3)",
          }}
          title={`${progress ? Number(progress.totalXp) : 0} XP — ${xpPercent}% to next level`}
        >
          <Zap
            className="w-3.5 h-3.5"
            style={{ color: "oklch(0.8 0.28 165)" }}
          />
          <span
            className="text-xs font-display font-bold"
            style={{ color: "oklch(0.8 0.28 165)" }}
          >
            LV {progress ? Number(progress.level) : 1}
          </span>
          {/* XP progress bar */}
          <div className="hidden md:block w-16 h-1.5 rounded-full overflow-hidden bg-muted">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${xpPercent}%`,
                background:
                  "linear-gradient(90deg, oklch(0.75 0.28 165), oklch(0.85 0.28 265))",
                boxShadow: "0 0 8px oklch(0.75 0.28 165 / 0.6)",
              }}
            />
          </div>
          <span className="hidden md:inline text-xs text-muted-foreground font-mono tabular-nums">
            {progress ? Number(progress.totalXp) : 0}xp
          </span>
        </div>

        {/* Badge count */}
        {progress && progress.badges.length > 0 && (
          <div
            data-ocid="header.badges_count"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
            style={{
              background: "oklch(0.75 0.25 85 / 0.1)",
              border: "1px solid oklch(0.75 0.25 85 / 0.3)",
            }}
          >
            <Star className="w-3 h-3" style={{ color: "oklch(0.8 0.25 85)" }} />
            <span
              className="text-xs font-display font-semibold"
              style={{ color: "oklch(0.8 0.25 85)" }}
            >
              {progress.badges.length}
            </span>
          </div>
        )}

        {/* Items due */}
        {stats && (
          <div
            data-ocid="header.items_due"
            className="flex items-center gap-1.5"
          >
            <Badge
              variant="secondary"
              className="font-display font-bold tabular-nums min-w-[2rem] justify-center"
              style={{
                background: "oklch(var(--primary) / 0.18)",
                color: "oklch(var(--primary) / 1)",
                border: "1px solid oklch(var(--primary) / 0.3)",
              }}
            >
              {Number(stats.itemsDueToday)} due
            </Badge>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          data-ocid="header.theme_toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="text-muted-foreground hover:text-foreground w-8 h-8"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>

        {isAuthenticated ? (
          <Button
            variant="ghost"
            size="icon"
            data-ocid="header.logout_button"
            onClick={logout}
            aria-label="Logout"
            className="text-muted-foreground hover:text-foreground w-8 h-8"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            size="sm"
            data-ocid="header.login_button"
            onClick={() => login()}
            className="text-xs h-8 px-3"
            style={{
              background:
                "linear-gradient(135deg, oklch(var(--neon-violet) / 0.8), oklch(var(--neon-cyan) / 0.6))",
              border: "1px solid oklch(var(--neon-violet) / 0.4)",
              color: "white",
            }}
          >
            <LogIn className="w-3.5 h-3.5 mr-1.5" />
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
}
