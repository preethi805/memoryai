import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  Badge,
  Collection,
  CollectionStats,
  DailyActivity,
  DashboardStats,
  MemoryItem,
  UserProgress,
  XpEvent,
} from "../backend";

// ─── Helper: today's date key as BigInt (YYYYMMDD) ────────────────────────────
export function getTodayKey(): bigint {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return BigInt(`${y}${m}${day}`);
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useDashboardStats() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.getDashboardStats(getTodayKey());
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useCollections() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Collection[]>({
    queryKey: ["collections"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.listCollections();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useMemoryItems(collectionId?: bigint) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<MemoryItem[]>({
    queryKey: ["items", collectionId?.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.listItems({
        collectionId,
        tags: [],
      });
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useDueItems() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<MemoryItem[]>({
    queryKey: ["due-items"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.getDueItems(getTodayKey());
    },
    enabled: !!actor && !isFetching,
    staleTime: 15_000,
  });
}

export function useDailyActivity() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<DailyActivity[]>({
    queryKey: ["daily-activity"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.getDailyActivity();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useGetProgress() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<UserProgress | null>({
    queryKey: ["user-progress"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.getProgress();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useListBadges() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Badge[]>({
    queryKey: ["badges"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.listBadges();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useCollectionStats(collectionId?: bigint) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<CollectionStats | null>({
    queryKey: ["collection-stats", collectionId?.toString()],
    queryFn: async () => {
      if (!actor || !collectionId) return null;
      return actor.getCollectionStats(collectionId);
    },
    enabled: !!actor && !isFetching && !!collectionId,
    staleTime: 60_000,
  });
}

export function useListXpEvents() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<XpEvent[]>({
    queryKey: ["xp-events"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.listXpEvents();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

// ─── Rating map: string → bigint ─────────────────────────────────────────────
const RATING_TO_BIGINT: Record<string, bigint> = {
  Again: 1n,
  Hard: 2n,
  Good: 3n,
  Easy: 4n,
};

export function useSubmitReview() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<UserProgress, Error, { itemId: bigint; rating: string }>({
    mutationFn: async ({ itemId, rating }) => {
      if (!actor) throw new Error("Actor not ready");
      const ratingBigInt = RATING_TO_BIGINT[rating] ?? 3n;
      await actor.submitReview(itemId, ratingBigInt);
      return actor.awardXpForReview(ratingBigInt);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["due-items"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["daily-activity"] });
      queryClient.invalidateQueries({ queryKey: ["user-progress"] });
      queryClient.invalidateQueries({ queryKey: ["xp-events"] });
    },
  });
}

export function useCreateCollection() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<Collection, Error, { name: string; description: string }>({
    mutationFn: async ({ name, description }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createCollection({ name, description });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useCreateMemoryItem() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<
    MemoryItem,
    Error,
    { collectionId: bigint; question: string; answer: string; tags: string[] }
  >({
    mutationFn: async ({ collectionId, question, answer, tags }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createItem({ collectionId, question, answer, tags });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["items", variables.collectionId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["items", undefined] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useDeleteCollection() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, bigint>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteCollection(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useDeleteMemoryItem() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, { id: bigint; collectionId: bigint }>({
    mutationFn: async ({ id }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteItem(id);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["items", variables.collectionId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useUpdateMemoryItem() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<
    MemoryItem | null,
    Error,
    {
      id: bigint;
      collectionId: bigint;
      question: string;
      answer: string;
      tags: string[];
    }
  >({
    mutationFn: async ({ id, question, answer, tags }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateItem(id, { question, answer, tags });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["items", variables.collectionId.toString()],
      });
    },
  });
}
