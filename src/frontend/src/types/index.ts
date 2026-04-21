// Re-export backend types for use across the app
export type {
  Badge,
  Collection,
  CollectionStats,
  DailyActivity,
  DashboardStats,
  FsrsState,
  MemoryItem,
  ReviewEvent,
  UserProgress,
  XpEvent,
} from "../backend";
export { Difficulty } from "../backend";

// ─── App-specific types ────────────────────────────────────────────────────────

export type Id = bigint;
export type Timestamp = bigint;
export type DateKey = bigint;

/** String alias for display; backend uses bigint IDs */
export type Rating = "Again" | "Hard" | "Good" | "Easy";

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
}
