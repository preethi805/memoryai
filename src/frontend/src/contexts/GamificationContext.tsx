import {
  useGetProgress,
  useListBadges,
  useListXpEvents,
} from "@/hooks/useQueries";
import type { Badge, UserProgress, XpEvent } from "@/types";
import { createContext, useContext } from "react";

// ─── Context types ─────────────────────────────────────────────────────────────

interface GamificationContextValue {
  progress: UserProgress | null;
  badges: Badge[];
  xpEvents: XpEvent[];
  isLoading: boolean;
}

// ─── Defaults ──────────────────────────────────────────────────────────────────

const GamificationContext = createContext<GamificationContextValue>({
  progress: null,
  badges: [],
  xpEvents: [],
  isLoading: true,
});

// ─── Provider ──────────────────────────────────────────────────────────────────

export function GamificationProvider({
  children,
}: { children: React.ReactNode }) {
  const { data: progress, isLoading: progressLoading } = useGetProgress();
  const { data: badges = [], isLoading: badgesLoading } = useListBadges();
  const { data: xpEvents = [], isLoading: xpLoading } = useListXpEvents();

  const isLoading = progressLoading || badgesLoading || xpLoading;

  return (
    <GamificationContext.Provider
      value={{
        progress: progress ?? null,
        badges,
        xpEvents,
        isLoading,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  return useContext(GamificationContext);
}

// Re-export types for convenience
export type { Badge, UserProgress, XpEvent };
