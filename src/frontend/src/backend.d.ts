import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export type Rating = bigint;
export interface FsrsState {
    difficulty: number;
    stability: number;
    retrievability: number;
}
export type DateKey = bigint;
export interface ReviewEvent {
    id: Id;
    itemId: Id;
    collectionId: Id;
    reviewedAt: Timestamp;
    rating: Rating;
}
export interface ItemFilter {
    collectionId?: Id;
    tags: Array<string>;
    dueBefore?: DateKey;
}
export interface DashboardStats {
    itemsDueToday: bigint;
    studyStreak: bigint;
    totalItems: bigint;
    accuracyPercent: number;
}
export interface MemoryItemInput {
    question: string;
    collectionId: Id;
    tags: Array<string>;
    answer: string;
}
export interface Collection {
    id: Id;
    name: string;
    createdAt: Timestamp;
    description: string;
}
export interface MemoryItem {
    id: Id;
    question: string;
    collectionId: Id;
    fsrs: FsrsState;
    createdAt: Timestamp;
    tags: Array<string>;
    answer: string;
    updatedAt: Timestamp;
    state: Difficulty;
    nextReviewDate: DateKey;
}
export interface MemoryItemUpdate {
    question: string;
    tags: Array<string>;
    answer: string;
}
export type Id = bigint;
export interface DailyActivity {
    dateKey: DateKey;
    correctCount: bigint;
    reviewCount: bigint;
}
export interface CollectionStats {
    collectionId: Id;
    averageAccuracy: number;
    totalItems: bigint;
    retentionRate: number;
}
export interface CollectionInput {
    name: string;
    description: string;
}
export enum Difficulty {
    new_ = "new",
    review = "review",
    relearning = "relearning",
    learning = "learning"
}
export interface backendInterface {
    createCollection(input: CollectionInput): Promise<Collection>;
    createItem(input: MemoryItemInput): Promise<MemoryItem>;
    deleteCollection(id: Id): Promise<boolean>;
    deleteItem(id: Id): Promise<boolean>;
    getCollection(id: Id): Promise<Collection | null>;
    getCollectionStats(id: Id): Promise<CollectionStats | null>;
    getDailyActivity(): Promise<Array<DailyActivity>>;
    getDashboardStats(todayKey: DateKey): Promise<DashboardStats>;
    getDueItems(todayKey: DateKey): Promise<Array<MemoryItem>>;
    getItem(id: Id): Promise<MemoryItem | null>;
    listCollections(): Promise<Array<Collection>>;
    listItems(filter: ItemFilter): Promise<Array<MemoryItem>>;
    listReviewEvents(): Promise<Array<ReviewEvent>>;
    submitReview(itemId: Id, rating: Rating): Promise<ReviewEvent | null>;
    updateCollection(id: Id, input: CollectionInput): Promise<Collection | null>;
    updateItem(id: Id, input: MemoryItemUpdate): Promise<MemoryItem | null>;
}
