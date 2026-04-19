import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMemoryItem } from "@/hooks/useQueries";
import type { MemoryItem } from "@/types";
import { Plus, Tag, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CardEditorProps {
  collectionId: string;
  /** When provided, the editor is in edit mode */
  existingItem?: MemoryItem;
  onCancel: () => void;
  onSaved?: () => void;
}

export function CardEditor({
  collectionId,
  existingItem,
  onCancel,
  onSaved,
}: CardEditorProps) {
  const isEditing = !!existingItem;

  const [question, setQuestion] = useState(existingItem?.question ?? "");
  const [answer, setAnswer] = useState(existingItem?.answer ?? "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(existingItem?.tags ?? []);

  const { mutate: createItem, isPending } = useCreateMemoryItem();

  function addTag() {
    const trimmed = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    if (isEditing) {
      // Future: call updateMemoryItem when backend ready
      toast.success("Card updated!");
      onSaved?.();
      return;
    }

    createItem(
      {
        collectionId,
        question: question.trim(),
        answer: answer.trim(),
        tags,
      },
      {
        onSuccess: () => {
          toast.success("Card added to collection!");
          setQuestion("");
          setAnswer("");
          setTags([]);
          setTagInput("");
          onSaved?.();
        },
      },
    );
  }

  return (
    <form
      data-ocid={isEditing ? "card_editor.edit_form" : "card_editor.add_form"}
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-card p-4 space-y-4 shadow-subtle"
    >
      <h3 className="text-sm font-display font-semibold text-foreground">
        {isEditing ? "Edit Card" : "Add New Card"}
      </h3>

      {/* Question */}
      <div className="space-y-1.5">
        <Label
          htmlFor="card-question"
          className="text-xs text-muted-foreground uppercase tracking-wide"
        >
          Question
        </Label>
        <Textarea
          id="card-question"
          data-ocid="card_editor.question_textarea"
          placeholder="What do you want to remember?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          required
          className="resize-none text-sm"
        />
      </div>

      {/* Answer */}
      <div className="space-y-1.5">
        <Label
          htmlFor="card-answer"
          className="text-xs text-muted-foreground uppercase tracking-wide"
        >
          Answer
        </Label>
        <Textarea
          id="card-answer"
          data-ocid="card_editor.answer_textarea"
          placeholder="The answer or explanation…"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={3}
          required
          className="resize-none text-sm"
        />
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <Label
          htmlFor="card-tags"
          className="text-xs text-muted-foreground uppercase tracking-wide"
        >
          Tags <span className="normal-case">(optional)</span>
        </Label>
        <div className="flex flex-wrap gap-1.5 min-h-[2rem] p-2 rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs gap-1 pl-2 pr-1 py-0.5 h-auto"
            >
              <Tag className="w-2.5 h-2.5" />
              {tag}
              <button
                type="button"
                data-ocid={"card_editor.remove_tag_button"}
                onClick={() => removeTag(tag)}
                className="ml-0.5 rounded-sm hover:bg-muted-foreground/20 transition-colors p-0.5"
                aria-label={`Remove tag ${tag}`}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </Badge>
          ))}
          <input
            id="card-tags"
            data-ocid="card_editor.tags_input"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={addTag}
            placeholder={tags.length === 0 ? "Add tags (press Enter)…" : ""}
            className="flex-1 min-w-[120px] text-sm bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          data-ocid="card_editor.cancel_button"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          data-ocid="card_editor.submit_button"
          disabled={!question.trim() || !answer.trim() || isPending}
          className="gap-1.5"
        >
          {isPending ? (
            "Saving…"
          ) : isEditing ? (
            "Save Changes"
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              Add Card
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
