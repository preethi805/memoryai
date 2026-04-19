export type Id = string;
export type Timestamp = bigint;
export type DateKey = string;
export type Difficulty = "New" | "Learning" | "Review" | "Relearning";
export type Rating = "Again" | "Hard" | "Good" | "Easy";

export interface FsrsState {
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
}

export interface DashboardStats {
  totalItems: number;
  itemsDueToday: number;
  studyStreak: number;
  accuracyPercent: number;
}

export interface Collection {
  id: Id;
  name: string;
  description: string;
  createdAt: Timestamp;
}

export interface MemoryItem {
  id: Id;
  collectionId: Id;
  question: string;
  answer: string;
  tags: string[];
  state: Difficulty;
  fsrs: FsrsState;
  nextReviewDate: DateKey;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ReviewEvent {
  id: Id;
  itemId: Id;
  collectionId: Id;
  rating: Rating;
  reviewedAt: Timestamp;
}

export interface DailyActivity {
  dateKey: DateKey;
  reviewCount: number;
  correctCount: number;
}

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
}
