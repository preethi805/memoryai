import { Button } from "@/components/ui/button";
import { useGamification } from "@/contexts/GamificationContext";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart2,
  BookOpen,
  Brain,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Library,
  Settings,
  Trophy,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  glowColor: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
    glowColor: "oklch(0.75 0.28 265)",
  },
  {
    id: "study",
    label: "Study Queue",
    path: "/study",
    icon: BookOpen,
    glowColor: "oklch(0.75 0.28 165)",
  },
  {
    id: "collections",
    label: "Collections",
    path: "/collections",
    icon: Library,
    glowColor: "oklch(0.75 0.28 220)",
  },
  {
    id: "analytics",
    label: "Analytics",
    path: "/analytics",
    icon: BarChart2,
    glowColor: "oklch(0.75 0.25 85)",
  },
  {
    id: "achievements",
    label: "Achievements",
    path: "/achievements",
    icon: Trophy,
    glowColor: "oklch(0.8 0.25 55)",
  },
  {
    id: "settings",
    label: "Settings",
    path: "/settings",
    icon: Settings,
    glowColor: "oklch(0.7 0.18 45)",
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { progress } = useGamification();

  return (
    <aside
      data-ocid="sidebar"
      className={cn(
        "flex flex-col shrink-0 h-screen sticky top-0 z-30 transition-smooth",
        collapsed ? "w-16" : "w-60",
      )}
      style={{
        background: "oklch(var(--sidebar) / 0.75)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRight: "1px solid oklch(var(--sidebar-border) / 0.25)",
        boxShadow: "4px 0 32px 0 rgba(0,0,0,0.15)",
      }}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-5 border-b",
          collapsed && "justify-center px-0",
        )}
        style={{ borderColor: "oklch(var(--sidebar-border) / 0.2)" }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background:
              "linear-gradient(135deg, oklch(var(--neon-violet) / 0.9), oklch(var(--neon-cyan) / 0.7))",
            boxShadow:
              "0 0 16px 0 oklch(var(--glow-violet) / 0.5), inset 0 1px 1px oklch(1 0 0 / 0.2)",
          }}
        >
          <Brain className="w-4.5 h-4.5 text-black" />
        </div>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              key="brand"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="gradient-text-violet font-display font-bold text-lg tracking-tight whitespace-nowrap"
            >
              MemoryAI
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === "/"
              ? currentPath === "/"
              : currentPath.startsWith(item.path);

          return (
            <Link
              key={item.id}
              to={item.path}
              data-ocid={`sidebar.nav.${item.id}`}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth group overflow-hidden",
                collapsed && "justify-center px-0 mx-1",
              )}
              style={
                isActive
                  ? {
                      background: `${item.glowColor.replace(")", " / 0.12)")}`,
                      borderLeft: `2px solid ${item.glowColor}`,
                      paddingLeft: collapsed ? undefined : "10px",
                      boxShadow: `inset 4px 0 12px 0 ${item.glowColor.replace(")", " / 0.1)")}`,
                      color: item.glowColor,
                    }
                  : {}
              }
              title={collapsed ? item.label : undefined}
            >
              {/* Hover glow overlay */}
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-smooth rounded-lg"
                style={{
                  background: isActive
                    ? undefined
                    : `radial-gradient(ellipse at left center, ${item.glowColor.replace(")", " / 0.08)")} 0%, transparent 70%)`,
                }}
                aria-hidden="true"
              />

              <Icon
                className={cn(
                  "w-4 h-4 shrink-0 relative z-10 transition-smooth",
                  isActive
                    ? ""
                    : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/90",
                )}
                style={
                  isActive
                    ? {
                        color: item.glowColor,
                        filter: `drop-shadow(0 0 6px ${item.glowColor.replace(")", " / 0.7)")})`,
                      }
                    : {}
                }
              />

              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    key="label"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      "relative z-10 whitespace-nowrap",
                      isActive
                        ? "font-semibold"
                        : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground",
                    )}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* User XP mini-card */}
      <AnimatePresence initial={false}>
        {!collapsed && progress && (
          <motion.div
            key="xp-card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="mx-3 mb-3 px-3 py-2.5 rounded-xl"
            style={{
              background: "oklch(0.75 0.28 265 / 0.06)",
              border: "1px solid oklch(0.75 0.28 265 / 0.2)",
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Trophy
                  className="w-3.5 h-3.5"
                  style={{ color: "oklch(0.8 0.25 85)" }}
                />
                <span
                  className="text-xs font-display font-bold"
                  style={{ color: "oklch(0.8 0.25 85)" }}
                >
                  Level {Number(progress.level)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Zap
                  className="w-3 h-3"
                  style={{ color: "oklch(0.75 0.28 165)" }}
                />
                <span
                  className="text-xs font-mono tabular-nums"
                  style={{ color: "oklch(0.75 0.28 165)" }}
                >
                  {Number(progress.totalXp)} XP
                </span>
              </div>
            </div>
            {/* XP bar */}
            <div className="h-1.5 rounded-full overflow-hidden bg-muted/50">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.round((Number(progress.totalXp) % 500) / 5)}%`,
                  background:
                    "linear-gradient(90deg, oklch(0.75 0.28 265), oklch(0.75 0.28 165))",
                  boxShadow: "0 0 8px 0 oklch(0.75 0.28 265 / 0.6)",
                }}
              />
            </div>
            {progress.badges.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1.5 truncate">
                🏅 {progress.badges.length} badge
                {progress.badges.length !== 1 ? "s" : ""} earned
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse toggle */}
      <div
        className="border-t p-2"
        style={{ borderColor: "oklch(var(--sidebar-border) / 0.2)" }}
      >
        <Button
          variant="ghost"
          size="sm"
          data-ocid="sidebar.collapse_toggle"
          onClick={onToggle}
          className={cn(
            "w-full text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-smooth",
            collapsed && "px-0",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
