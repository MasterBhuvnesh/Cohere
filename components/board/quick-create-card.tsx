"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { IssueStatus } from "@/components/shared/issue-meta";

/**
 * Inline composer at the top of a board column: Enter creates an issue in
 * that column's status and keeps the composer open for rapid entry; Escape
 * (or blurring while empty) closes it.
 */
export function QuickCreateCard({
  teamId,
  status,
  onClose,
}: {
  teamId: Id<"teams">;
  status: IssueStatus;
  onClose: () => void;
}) {
  const createIssue = useMutation(api.issues.create);
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const trimmed = title.trim();
    if (!trimmed || submitting) {
      return;
    }
    setSubmitting(true);
    try {
      await createIssue({ teamId, title: trimmed, status });
      setTitle("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create issue"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-md border bg-card p-2 shadow-xs">
      <Input
        autoFocus
        value={title}
        placeholder="Issue title…"
        disabled={submitting}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            void submit();
          }
          if (event.key === "Escape") {
            onClose();
          }
        }}
        onBlur={() => {
          if (!title.trim()) {
            onClose();
          }
        }}
        className="h-7 border-none px-1 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
      />
      <p className="px-1 pt-1 text-[10px] text-muted-foreground">
        Enter to create · Esc to dismiss
      </p>
    </div>
  );
}
