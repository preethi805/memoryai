import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardStats } from "@/hooks/useQueries";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Clock, Flame, LogIn, LogOut, Menu, Moon, Sun } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { isAuthenticated, login, logout } = useAuth();
  const { data: stats } = useDashboardStats();
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      data-ocid="header"
      className="h-14 bg-card border-b border-border flex items-center justify-between px-4 gap-4 shadow-subtle sticky top-0 z-20"
    >
      {/* Left: hamburger (mobile) */}
      <Button
        variant="ghost"
        size="icon"
        data-ocid="header.menu_button"
        onClick={onMenuClick}
        className="md:hidden shrink-0"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Center: streak badge */}
      <div className="flex items-center gap-3 flex-1 justify-center md:justify-center">
        {stats && (
          <div
            data-ocid="header.streak_badge"
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-display font-semibold",
              "bg-accent/15 border-accent/40 text-accent",
            )}
          >
            <Flame className="w-4 h-4" />
            <span>{stats.studyStreak} Day Streak</span>
            <Flame className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Right: items due + theme toggle + auth */}
      <div className="flex items-center gap-3 shrink-0">
        {stats && (
          <div
            data-ocid="header.items_due"
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-medium">
              Items Due
            </span>
            <Badge
              variant="secondary"
              className="bg-primary/20 text-primary border-primary/30 font-display font-bold tabular-nums min-w-[2rem] justify-center"
            >
              {stats.itemsDueToday}
            </Badge>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          data-ocid="header.theme_toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="text-muted-foreground hover:text-foreground"
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
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            data-ocid="header.login_button"
            onClick={() => login()}
            className="text-xs"
          >
            <LogIn className="w-3.5 h-3.5 mr-1.5" />
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
}
