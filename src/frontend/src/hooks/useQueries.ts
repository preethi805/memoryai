import type {
  Collection,
  DailyActivity,
  DashboardStats,
  MemoryItem,
  Rating,
  ReviewEvent,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ─── Mock data for development (no backend methods yet) ──────────────────────

const MOCK_STATS: DashboardStats = {
  totalItems: 248,
  itemsDueToday: 45,
  studyStreak: 27,
  accuracyPercent: 84.5,
};

const MOCK_COLLECTIONS: Collection[] = [
  {
    id: "1",
    name: "Neuroscience",
    description: "Brain & memory science fundamentals",
    createdAt: BigInt(Date.now()),
  },
  {
    id: "2",
    name: "Spanish Vocabulary",
    description: "Core 2000 words for fluency",
    createdAt: BigInt(Date.now()),
  },
  {
    id: "3",
    name: "Calculus",
    description: "Derivatives, integrals, and limits",
    createdAt: BigInt(Date.now()),
  },
  {
    id: "4",
    name: "History of Rome",
    description: "Key events from 753 BC to 476 AD",
    createdAt: BigInt(Date.now()),
  },
  {
    id: "5",
    name: "Machine Learning",
    description: "Algorithms, math, and intuition",
    createdAt: BigInt(Date.now()),
  },
];

const MOCK_ITEMS: MemoryItem[] = [
  {
    id: "1",
    collectionId: "1",
    question:
      "What is the primary function of the hippocampus in memory consolidation?",
    answer:
      "The hippocampus converts short-term memories to long-term memories through synaptic consolidation, especially during sleep.",
    tags: ["neuroscience", "memory"],
    state: "Review",
    fsrs: { stability: 12.4, difficulty: 4.2, reps: 8, lapses: 1 },
    nextReviewDate: "2026-04-18",
    createdAt: BigInt(Date.now()),
    updatedAt: BigInt(Date.now()),
  },
  {
    id: "2",
    collectionId: "1",
    question: "Explain the concept of long-term potentiation (LTP).",
    answer:
      "LTP is a persistent strengthening of synapses based on recent patterns of activity, underlying learning and memory.",
    tags: ["neuroscience", "LTP"],
    state: "Learning",
    fsrs: { stability: 3.1, difficulty: 5.8, reps: 3, lapses: 0 },
    nextReviewDate: "2026-04-18",
    createdAt: BigInt(Date.now()),
    updatedAt: BigInt(Date.now()),
  },
  {
    id: "3",
    collectionId: "2",
    question: "¿Cómo se dice 'to remember' en español?",
    answer: "Recordar (or acordarse de for reflexive usage)",
    tags: ["spanish", "verbs"],
    state: "New",
    fsrs: { stability: 0, difficulty: 3.0, reps: 0, lapses: 0 },
    nextReviewDate: "2026-04-18",
    createdAt: BigInt(Date.now()),
    updatedAt: BigInt(Date.now()),
  },
];

const MOCK_DAILY_ACTIVITY: DailyActivity[] = Array.from(
  { length: 35 },
  (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];
    const reviewCount = Math.floor(Math.random() * 50) + (i < 7 ? 20 : 0);
    return {
      dateKey,
      reviewCount,
      correctCount: Math.floor(reviewCount * (0.75 + Math.random() * 0.2)),
    };
  },
).reverse();

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => MOCK_STATS,
    staleTime: 30_000,
  });
}

export function useCollections() {
  return useQuery<Collection[]>({
    queryKey: ["collections"],
    queryFn: async () => MOCK_COLLECTIONS,
    staleTime: 60_000,
  });
}

export function useMemoryItems(collectionId?: string) {
  return useQuery<MemoryItem[]>({
    queryKey: ["items", collectionId],
    queryFn: async () =>
      collectionId
        ? MOCK_ITEMS.filter((i) => i.collectionId === collectionId)
        : MOCK_ITEMS,
    staleTime: 30_000,
  });
}

export function useDueItems() {
  return useQuery<MemoryItem[]>({
    queryKey: ["due-items"],
    queryFn: async () =>
      MOCK_ITEMS.filter(
        (i) => i.nextReviewDate <= new Date().toISOString().split("T")[0],
      ),
    staleTime: 15_000,
  });
}

export function useDailyActivity() {
  return useQuery<DailyActivity[]>({
    queryKey: ["daily-activity"],
    queryFn: async () => MOCK_DAILY_ACTIVITY,
    staleTime: 60_000,
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { itemId: string; rating: Rating }>({
    mutationFn: async ({ itemId, rating }) => {
      // Will call actor.submitReview(itemId, rating) when backend is ready
      await new Promise((r) => setTimeout(r, 200));
      console.log("Review submitted", { itemId, rating });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["due-items"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["daily-activity"] });
    },
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { name: string; description: string }>({
    mutationFn: async ({ name, description }) => {
      await new Promise((r) => setTimeout(r, 200));
      console.log("Collection created", { name, description });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useCreateMemoryItem() {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { collectionId: string; question: string; answer: string; tags: string[] }
  >({
    mutationFn: async (item) => {
      await new Promise((r) => setTimeout(r, 200));
      console.log("Item created", item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}
