import type { backendInterface, Collection, MemoryItem, DashboardStats, DailyActivity, CollectionStats, ReviewEvent, UserProgress, Badge, XpEvent } from "../backend";
import { Difficulty } from "../backend";

const now = BigInt(Date.now()) * BigInt(1_000_000);
const todayKey = BigInt(Math.floor(Date.now() / 86400000));

const collections: Collection[] = [
  { id: BigInt(1), name: "Spanish Vocabulary", description: "Core vocabulary for B2 fluency", createdAt: now },
  { id: BigInt(2), name: "History: WW2", description: "Key events, dates, and figures", createdAt: now },
  { id: BigInt(3), name: "Programming Concepts", description: "CS fundamentals and data structures", createdAt: now },
];

const items: MemoryItem[] = [
  {
    id: BigInt(1), collectionId: BigInt(1),
    question: "What does 'efímero' mean?",
    answer: "Ephemeral / short-lived",
    tags: ["adjective", "b2"],
    fsrs: { difficulty: 0.3, stability: 4.2, retrievability: 0.85 },
    createdAt: now, updatedAt: now,
    state: Difficulty.review,
    nextReviewDate: todayKey,
  },
  {
    id: BigInt(2), collectionId: BigInt(1),
    question: "How do you say 'butterfly' in Spanish?",
    answer: "Mariposa",
    tags: ["noun", "a1"],
    fsrs: { difficulty: 0.1, stability: 12.5, retrievability: 0.95 },
    createdAt: now, updatedAt: now,
    state: Difficulty.review,
    nextReviewDate: todayKey + BigInt(3),
  },
  {
    id: BigInt(3), collectionId: BigInt(2),
    question: "When did D-Day take place?",
    answer: "June 6, 1944 — Operation Overlord, Allied invasion of Normandy",
    tags: ["date", "operation"],
    fsrs: { difficulty: 0.25, stability: 7.8, retrievability: 0.78 },
    createdAt: now, updatedAt: now,
    state: Difficulty.relearning,
    nextReviewDate: todayKey,
  },
  {
    id: BigInt(4), collectionId: BigInt(3),
    question: "What is Big-O notation for binary search?",
    answer: "O(log n) — the search space halves on each step",
    tags: ["algorithms", "complexity"],
    fsrs: { difficulty: 0.4, stability: 3.1, retrievability: 0.65 },
    createdAt: now, updatedAt: now,
    state: Difficulty.learning,
    nextReviewDate: todayKey,
  },
  {
    id: BigInt(5), collectionId: BigInt(3),
    question: "Define a closure in programming",
    answer: "A function that captures variables from its enclosing lexical scope",
    tags: ["functional", "concepts"],
    fsrs: { difficulty: 0.2, stability: 9.0, retrievability: 0.92 },
    createdAt: now, updatedAt: now,
    state: Difficulty.review,
    nextReviewDate: todayKey + BigInt(1),
  },
];

const dailyActivity: DailyActivity[] = Array.from({ length: 30 }, (_, i) => ({
  dateKey: todayKey - BigInt(29 - i),
  reviewCount: BigInt(Math.floor(Math.random() * 25 + 5)),
  correctCount: BigInt(Math.floor(Math.random() * 20 + 3)),
}));

const dashboardStats: DashboardStats = {
  itemsDueToday: BigInt(8),
  studyStreak: BigInt(14),
  totalItems: BigInt(items.length),
  accuracyPercent: 82.4,
};

const collectionStats: CollectionStats = {
  collectionId: BigInt(1),
  totalItems: BigInt(2),
  averageAccuracy: 87.5,
  retentionRate: 0.88,
};

const reviewEvents: ReviewEvent[] = [
  { id: BigInt(1), itemId: BigInt(1), collectionId: BigInt(1), reviewedAt: now, rating: BigInt(3) },
  { id: BigInt(2), itemId: BigInt(3), collectionId: BigInt(2), reviewedAt: now, rating: BigInt(2) },
];

const badges: Badge[] = [
  { id: "first_card", name: "First Card", description: "Create your first flashcard", iconKey: "card", unlockedAt: now },
  { id: "streak_starter", name: "Streak Starter", description: "Achieve a 3-day study streak", iconKey: "flame" },
  { id: "week_warrior", name: "Week Warrior", description: "Achieve a 7-day study streak", iconKey: "fire" },
  { id: "month_master", name: "Month Master", description: "Achieve a 30-day study streak", iconKey: "crown" },
  { id: "century", name: "Century", description: "Complete 100 total reviews", iconKey: "hundred" },
  { id: "perfect_session", name: "Perfect Session", description: "Finish a session with all Good/Easy ratings", iconKey: "star" },
  { id: "speed_learner", name: "Speed Learner", description: "Complete 50 reviews in a single day", iconKey: "lightning" },
  { id: "memory_master", name: "Memory Master", description: "Complete 500 total reviews", iconKey: "brain" },
];

const mockProgress: UserProgress = {
  totalXp: BigInt(340),
  level: BigInt(1),
  badges,
  lastUpdated: now,
};

const xpEvents: XpEvent[] = [
  { id: BigInt(1), userId: { toText: () => "mock-user" } as any, earnedAt: now, amount: BigInt(15), reason: "review" },
  { id: BigInt(2), userId: { toText: () => "mock-user" } as any, earnedAt: now, amount: BigInt(20), reason: "review" },
];

export const mockBackend: backendInterface = {
  createCollection: async (input) => ({
    id: BigInt(Date.now()), name: input.name, description: input.description, createdAt: now,
  }),
  createItem: async (input) => ({
    id: BigInt(Date.now()), question: input.question, answer: input.answer,
    collectionId: input.collectionId, tags: input.tags,
    fsrs: { difficulty: 0.3, stability: 1.0, retrievability: 1.0 },
    createdAt: now, updatedAt: now, state: Difficulty.new_, nextReviewDate: todayKey,
  }),
  deleteCollection: async () => true,
  deleteItem: async () => true,
  getCollection: async (id) => collections.find(c => c.id === id) ?? null,
  getCollectionStats: async () => collectionStats,
  getDailyActivity: async () => dailyActivity,
  getDashboardStats: async () => dashboardStats,
  getDueItems: async () => items.filter(i => i.nextReviewDate <= todayKey),
  getItem: async (id) => items.find(i => i.id === id) ?? null,
  listCollections: async () => collections,
  listItems: async () => items,
  listReviewEvents: async () => reviewEvents,
  submitReview: async (itemId, rating) => ({
    id: BigInt(Date.now()), itemId, collectionId: BigInt(1), reviewedAt: now, rating,
  }),
  updateCollection: async (id, input) => ({
    id, name: input.name, description: input.description, createdAt: now,
  }),
  updateItem: async (id, input) => {
    const item = items.find(i => i.id === id);
    if (!item) return null;
    return { ...item, question: input.question, answer: input.answer, tags: input.tags, updatedAt: now };
  },
  awardXpForReview: async (_rating) => mockProgress,
  getProgress: async () => mockProgress,
  listBadges: async () => badges,
  listXpEvents: async () => xpEvents,
};
