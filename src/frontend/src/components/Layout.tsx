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

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  return (
    <div
      data-ocid="layout"
      className="flex h-screen overflow-hidden bg-background relative"
    >
      {/* Animated gradient mesh background */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        {/* Deep space orbs */}
        <div
          className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full opacity-[0.07]"
          style={{
            background:
              "radial-gradient(circle, oklch(0.75 0.28 265) 0%, transparent 70%)",
            animation: "float 12s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full opacity-[0.06]"
          style={{
            background:
              "radial-gradient(circle, oklch(0.7 0.28 165) 0%, transparent 70%)",
            animation: "float 16s ease-in-out infinite reverse",
          }}
        />
        <div
          className="absolute top-[40%] left-[40%] w-[30vw] h-[30vw] rounded-full opacity-[0.04]"
          style={{
            background:
              "radial-gradient(circle, oklch(0.65 0.22 320) 0%, transparent 70%)",
            animation: "float 10s ease-in-out infinite 2s",
          }}
        />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex relative z-20">
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
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative z-10">
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />
        <main data-ocid="main_content" className={cn("flex-1 overflow-y-auto")}>
          <div className="fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      <Toaster richColors position="bottom-right" />
    </div>
  );
}
