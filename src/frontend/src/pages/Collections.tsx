import { CardEditor } from "@/components/CardEditor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useCollectionStats,
  useCollections,
  useCreateCollection,
  useDeleteCollection,
  useDeleteMemoryItem,
  useMemoryItems,
} from "@/hooks/useQueries";
import type { Collection, MemoryItem } from "@/types";
import { Difficulty } from "@/types";
import {
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronRight,
  Library,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// ─── Constants ────────────────────────────────────────────────────────────────

const COLLECTION_ACCENTS = [
  { border: "border-chart-1/30", icon: "text-chart-1", bg: "bg-chart-1/10" },
  { border: "border-chart-2/30", icon: "text-chart-2", bg: "bg-chart-2/10" },
  { border: "border-chart-3/30", icon: "text-chart-3", bg: "bg-chart-3/10" },
  { border: "border-chart-4/30", icon: "text-chart-4", bg: "bg-chart-4/10" },
  { border: "border-chart-5/30", icon: "text-chart-5", bg: "bg-chart-5/10" },
];

const DIFFICULTY_LABELS: Record<string, { label: string; className: string }> =
  {
    [Difficulty.new_]: {
      label: "New",
      className: "border-chart-3/60 text-chart-3 bg-chart-3/10",
    },
    [Difficulty.learning]: {
      label: "Learning",
      className: "border-chart-2/60 text-chart-2 bg-chart-2/10",
    },
    [Difficulty.review]: {
      label: "Review",
      className: "border-chart-1/60 text-chart-1 bg-chart-1/10",
    },
    [Difficulty.relearning]: {
      label: "Relearning",
      className: "border-chart-4/60 text-chart-4 bg-chart-4/10",
    },
  };

// ─── Next review date display ─────────────────────────────────────────────────

function formatNextReview(dateKey: bigint): string {
  const dk = String(dateKey);
  if (dk.length === 8) {
    const y = dk.slice(0, 4);
    const m = dk.slice(4, 6);
    const d = dk.slice(6, 8);
    return `${y}-${m}-${d}`;
  }
  return dk;
}

// ─── CardItem ─────────────────────────────────────────────────────────────────

function CardItem({
  item,
  idx,
  onDelete,
}: {
  item: MemoryItem;
  idx: number;
  onDelete: (item: MemoryItem) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const diff =
    DIFFICULTY_LABELS[item.state] ?? DIFFICULTY_LABELS[Difficulty.new_];

  if (editing) {
    return (
      <CardEditor
        collectionId={item.collectionId}
        existingItem={item}
        onCancel={() => setEditing(false)}
        onSaved={() => setEditing(false)}
      />
    );
  }

  return (
    <div
      data-ocid={`collection_detail.card.item.${idx + 1}`}
      className="rounded-lg border border-border bg-background hover:bg-muted/30 transition-smooth"
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start gap-3 px-4 py-3 text-left"
        aria-expanded={expanded}
      >
        <span className="mt-0.5 text-muted-foreground shrink-0">
          {expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground line-clamp-2">
            {item.question}
          </p>
          <div className="flex items-center flex-wrap gap-2 mt-1.5">
            <Badge
              variant="outline"
              className={`text-xs px-1.5 py-0 h-5 font-medium ${diff.className}`}
            >
              {diff.label}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {formatNextReview(item.nextReviewDate)}
            </span>
            {item.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Answer
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              {item.answer}
            </p>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 flex gap-4 text-xs text-muted-foreground">
              <span>
                Stability:{" "}
                <strong className="text-foreground">
                  {item.fsrs.stability.toFixed(1)}d
                </strong>
              </span>
              <span>
                Retrieval:{" "}
                <strong className="text-foreground">
                  {Math.round(item.fsrs.retrievability * 100)}%
                </strong>
              </span>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                data-ocid={`collection_detail.card.edit_button.${idx + 1}`}
                onClick={() => setEditing(true)}
                className="h-7 text-xs"
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                data-ocid={`collection_detail.card.delete_button.${idx + 1}`}
                onClick={() => onDelete(item)}
                className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CollectionStats bar ──────────────────────────────────────────────────────

function CollectionStatsBar({ collectionId }: { collectionId: bigint }) {
  const { data: stats, isLoading } = useCollectionStats(collectionId);

  if (isLoading) {
    return (
      <div className="flex gap-3 mt-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
      <span>
        Accuracy:{" "}
        <strong className="text-foreground">
          {stats.averageAccuracy.toFixed(0)}%
        </strong>
      </span>
      <span>•</span>
      <span>
        Retention:{" "}
        <strong className="text-foreground">
          {(stats.retentionRate * 100).toFixed(0)}%
        </strong>
      </span>
      <span>•</span>
      <span>
        Total:{" "}
        <strong className="text-foreground">{Number(stats.totalItems)}</strong>{" "}
        cards
      </span>
    </div>
  );
}

// ─── CollectionDetail ─────────────────────────────────────────────────────────

function CollectionDetail({
  collection,
  onDeleteCollection,
}: {
  collection: Collection;
  onDeleteCollection: () => void;
}) {
  const [cardSearch, setCardSearch] = useState("");
  const [addingCard, setAddingCard] = useState(false);
  const [deletingCard, setDeletingCard] = useState<MemoryItem | null>(null);

  const { data: items, isLoading } = useMemoryItems(collection.id);
  const { mutate: deleteItem, isPending: deletingPending } =
    useDeleteMemoryItem();

  const filtered =
    items?.filter(
      (i) =>
        i.question.toLowerCase().includes(cardSearch.toLowerCase()) ||
        i.answer.toLowerCase().includes(cardSearch.toLowerCase()) ||
        i.tags.some((t) => t.toLowerCase().includes(cardSearch.toLowerCase())),
    ) ?? [];

  function handleDeleteCard(item: MemoryItem) {
    deleteItem(
      { id: item.id, collectionId: item.collectionId },
      {
        onSuccess: () => {
          toast.success("Card deleted");
          setDeletingCard(null);
        },
        onError: () => {
          toast.error("Failed to delete card");
        },
      },
    );
  }

  return (
    <div
      data-ocid="collection_detail.panel"
      className="mt-4 space-y-4 px-4 pb-5"
    >
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            data-ocid="collection_detail.search_input"
            placeholder="Search cards…"
            value={cardSearch}
            onChange={(e) => setCardSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        <Button
          size="sm"
          data-ocid="collection_detail.add_card_button"
          onClick={() => setAddingCard(true)}
          className="gap-1.5 h-8 text-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Card
        </Button>
        <Button
          size="sm"
          variant="ghost"
          data-ocid="collection_detail.delete_collection_button"
          onClick={onDeleteCollection}
          className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      <CollectionStatsBar collectionId={collection.id} />

      {addingCard && (
        <CardEditor
          collectionId={collection.id}
          onCancel={() => setAddingCard(false)}
          onSaved={() => setAddingCard(false)}
        />
      )}

      {isLoading ? (
        <div className="space-y-2">
          {["l1", "l2", "l3"].map((k) => (
            <Skeleton key={k} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          data-ocid="collection_detail.empty_state"
          className="flex flex-col items-center justify-center py-10 text-center space-y-3"
        >
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">
            {cardSearch ? "No cards match your search" : "No cards yet"}
          </p>
          <p className="text-xs text-muted-foreground max-w-xs">
            {cardSearch
              ? "Try a different search term"
              : "Add your first card to start studying this collection"}
          </p>
          {!cardSearch && !addingCard && (
            <Button
              size="sm"
              variant="outline"
              data-ocid="collection_detail.add_first_card_button"
              onClick={() => setAddingCard(true)}
              className="gap-1.5 text-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add first card
            </Button>
          )}
        </div>
      ) : (
        <div data-ocid="collection_detail.cards_list" className="space-y-2">
          {filtered.map((item, idx) => (
            <CardItem
              key={item.id.toString()}
              item={item}
              idx={idx}
              onDelete={setDeletingCard}
            />
          ))}
        </div>
      )}

      <AlertDialog
        open={!!deletingCard}
        onOpenChange={(open) => !open && setDeletingCard(null)}
      >
        <AlertDialogContent data-ocid="collection_detail.delete_card_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this card?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The card and all its review history
              will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="collection_detail.delete_card_cancel_button"
              onClick={() => setDeletingCard(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="collection_detail.delete_card_confirm_button"
              onClick={() => deletingCard && handleDeleteCard(deletingCard)}
              disabled={deletingPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingPending ? "Deleting…" : "Delete Card"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── CollectionCard ───────────────────────────────────────────────────────────

function CollectionCard({
  collection,
  idx,
  onDelete,
}: {
  collection: Collection;
  idx: number;
  onDelete: (c: Collection) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { data: items } = useMemoryItems(collection.id);
  const accent = COLLECTION_ACCENTS[idx % COLLECTION_ACCENTS.length];

  return (
    <Card
      data-ocid={`collections.item.${idx + 1}`}
      className={`border shadow-subtle transition-smooth ${accent.border} ${expanded ? "shadow-elevated" : ""}`}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left"
        aria-expanded={expanded}
        data-ocid={`collections.expand_button.${idx + 1}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div
              className={`w-10 h-10 rounded-xl ${accent.bg} flex items-center justify-center shrink-0`}
            >
              <Library className={`w-5 h-5 ${accent.icon}`} />
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="secondary" className="text-xs">
                Active
              </Badge>
              <span className="text-muted-foreground">
                {expanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </span>
            </div>
          </div>
          <CardTitle className="text-base font-display font-semibold text-foreground mt-2">
            {collection.name}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground line-clamp-2">
            {collection.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 pb-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              {items ? `${items.length} items` : "Loading…"}
            </span>
          </div>
        </CardContent>
      </button>

      {expanded && (
        <div className="border-t border-border/50">
          <CollectionDetail
            collection={collection}
            onDeleteCollection={() => onDelete(collection)}
          />
        </div>
      )}
    </Card>
  );
}

// ─── CollectionsPage ──────────────────────────────────────────────────────────

export function CollectionsPage() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [deletingCollection, setDeletingCollection] =
    useState<Collection | null>(null);

  const { data: collections, isLoading } = useCollections();
  const { mutate: createCollection, isPending } = useCreateCollection();
  const { mutate: deleteCollection, isPending: deletePending } =
    useDeleteCollection();

  const filtered =
    collections?.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];

  function handleCreate() {
    if (!newName.trim()) return;
    createCollection(
      { name: newName.trim(), description: newDesc.trim() },
      {
        onSuccess: () => {
          toast.success("Collection created!");
          setCreateOpen(false);
          setNewName("");
          setNewDesc("");
        },
        onError: () => {
          toast.error("Failed to create collection");
        },
      },
    );
  }

  function handleDeleteCollection() {
    if (!deletingCollection) return;
    deleteCollection(deletingCollection.id, {
      onSuccess: () => {
        toast.success(`"${deletingCollection.name}" deleted`);
        setDeletingCollection(null);
      },
      onError: () => {
        toast.error("Failed to delete collection");
      },
    });
  }

  return (
    <div
      data-ocid="collections.page"
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Collections
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Organize your memory cards by topic
          </p>
        </div>
        <Button
          data-ocid="collections.create_button"
          onClick={() => setCreateOpen(true)}
          className="gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> New Collection
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          data-ocid="collections.search_input"
          placeholder="Search collections…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {["c1", "c2", "c3", "c4", "c5", "c6"].map((k) => (
            <Card key={k} className="border-border">
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          data-ocid="collections.empty_state"
          className="flex flex-col items-center justify-center py-20 text-center space-y-4"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Library className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-display font-semibold text-foreground">
            No collections yet
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Create your first collection to start organizing your memory cards
            by topic.
          </p>
          <Button
            data-ocid="collections.create_first_button"
            onClick={() => setCreateOpen(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" /> Create Collection
          </Button>
        </div>
      ) : (
        <div
          data-ocid="collections.list"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {filtered.map((c, i) => (
            <CollectionCard
              key={c.id.toString()}
              collection={c}
              idx={i}
              onDelete={setDeletingCollection}
            />
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent
          data-ocid="collections.create_dialog"
          className="sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="font-display">New Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="col-name">Name</Label>
              <Input
                id="col-name"
                data-ocid="collections.name_input"
                placeholder="e.g. Neuroscience"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="col-desc">Description</Label>
              <Textarea
                id="col-desc"
                data-ocid="collections.description_input"
                placeholder="What topics does this collection cover?"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              data-ocid="collections.cancel_button"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="collections.submit_button"
              onClick={handleCreate}
              disabled={!newName.trim() || isPending}
            >
              {isPending ? "Creating…" : "Create Collection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingCollection}
        onOpenChange={(open) => !open && setDeletingCollection(null)}
      >
        <AlertDialogContent data-ocid="collections.delete_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete "{deletingCollection?.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the collection and all{" "}
              <strong>cards and review history</strong> inside it. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="collections.delete_cancel_button"
              onClick={() => setDeletingCollection(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="collections.delete_confirm_button"
              onClick={handleDeleteCollection}
              disabled={deletePending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePending ? "Deleting…" : "Delete Collection"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
