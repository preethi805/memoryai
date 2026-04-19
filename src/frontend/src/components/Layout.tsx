import { Toaster } from "@/components/ui/sonner";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { theme } = useTheme();

  // Apply theme on mount
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  return (
    <div
      data-ocid="layout"
      className="flex h-screen overflow-hidden bg-background"
    >
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setMobileSidebarOpen(false)}
            role="button"
            tabIndex={-1}
            aria-label="Close sidebar"
          />
          <div className="relative z-50 flex">
            <Sidebar
              collapsed={false}
              onToggle={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />
        <main
          data-ocid="main_content"
          className={cn("flex-1 overflow-y-auto bg-background")}
        >
          <div className="fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      <Toaster richColors position="bottom-right" />
    </div>
  );
}
