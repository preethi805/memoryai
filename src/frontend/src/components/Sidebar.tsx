import { Button } from "@/components/ui/button";
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
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", path: "/", icon: LayoutDashboard },
  { id: "study", label: "Study Queue", path: "/study", icon: BookOpen },
  {
    id: "collections",
    label: "Collections",
    path: "/collections",
    icon: Library,
  },
  { id: "analytics", label: "Analytics", path: "/analytics", icon: BarChart2 },
  { id: "settings", label: "Settings", path: "/settings", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <aside
      data-ocid="sidebar"
      className={cn(
        "flex flex-col bg-sidebar border-r border-sidebar-border transition-smooth shrink-0",
        "h-screen sticky top-0 z-30",
        collapsed ? "w-16" : "w-60",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-2 px-4 py-5 border-b border-sidebar-border",
          collapsed && "justify-center px-0",
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Brain className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-sidebar-foreground text-base tracking-tight">
            MemoryOS
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 space-y-1">
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
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth group",
                collapsed && "justify-center px-0 mx-1",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0",
                  isActive
                    ? "text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground",
                )}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-sidebar-border p-2">
        <Button
          variant="ghost"
          size="sm"
          data-ocid="sidebar.collapse_toggle"
          onClick={onToggle}
          className={cn(
            "w-full text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent",
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
