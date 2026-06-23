"use client";

import { useMutation, useQuery } from "convex/react";
import { CornerUpLeft, Plus, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IssueDetailSlotProps } from "@/components/issue-detail/slots";
import { PriorityIcon } from "@/components/shared/priority-icon";
import { StatusIcon } from "@/components/shared/status-icon";
import { UserAvatar } from "@/components/shared/user-avatar";

/** Parent link + sub-issue list with inline creation, under the description. */
export function SubIssuesPanel({ issue, team }: IssueDetailSlotProps) {
  const params = useParams<{ orgSlug: string }>();
  const hierarchy = useQuery(api.issueRelations.hierarchy, {
    issueId: issue._id,
  });
  const members = useQuery(api.organizations.listMembers);
  const createIssue = useMutation(api.issues.create);
  const setParent = useMutation(api.issueRelations.setParent);

  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const subIssues = hierarchy?.subIssues ?? [];
  const doneCount = subIssues.filter((sub) => sub.status === "done").length;

  const addSubIssue = async () => {
    const trimmed = title.trim();
    if (!trimmed || submitting) {
      return;
    }
    setSubmitting(true);
    try {
      await createIssue({
        teamId: team._id,
        title: trimmed,
        parentIssueId: issue._id,
      });
      setTitle("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create sub-issue"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const removeParent = () => {
    setParent({ issueId: issue._id, parentIssueId: null }).catch(
      (error: unknown) => {
        toast.error(
          error instanceof Error ? error.message : "Failed to remove parent"
        );
      }
    );
  };

  return (
    <section className="flex flex-col gap-1">
      {hierarchy?.parent && (
        <div className="group flex h-7 items-center gap-2 text-xs text-muted-foreground">
          <CornerUpLeft className="size-3.5 shrink-0" />
          <span className="shrink-0">Sub-issue of</span>
          <Link
            href={`/${params.orgSlug}/issue/${hierarchy.parent._id}`}
            className="flex min-w-0 items-center gap-1.5 hover:text-foreground"
          >
            <span className="font-mono">{hierarchy.parent.identifier}</span>
            <span className="truncate">{hierarchy.parent.title}</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={removeParent}
            aria-label="Remove parent issue"
            className="size-5 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <X className="size-3" />
          </Button>
        </div>
      )}

      <div className="flex h-7 items-center gap-2">
        <h3 className="text-xs font-medium text-muted-foreground">
          Sub-issues
        </h3>
        {subIssues.length > 0 && (
          <span className="text-xs text-muted-foreground/70">
            {doneCount}/{subIssues.length} done
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setAdding((value) => !value)}
          aria-label="Add sub-issue"
          className="size-6 text-muted-foreground"
        >
          <Plus className="size-3.5" />
        </Button>
      </div>

      {subIssues.length > 0 && (
        <div className="flex flex-col">
          {subIssues.map((sub) => {
            const assignee = members?.find(
              (member) => member.userId === sub.assigneeId
            );
            return (
              <Link
                key={sub._id}
                href={`/${params.orgSlug}/issue/${sub._id}`}
                className="-mx-2 flex h-9 items-center gap-2.5 rounded-md px-2 text-sm transition-colors hover:bg-accent/50"
              >
                <StatusIcon status={sub.status} />
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {sub.identifier}
                </span>
                <span className="min-w-0 flex-1 truncate">{sub.title}</span>
                {sub.priority !== "none" && (
                  <PriorityIcon priority={sub.priority} />
                )}
                {assignee && (
                  <UserAvatar
                    name={assignee.name}
                    imageUrl={assignee.imageUrl}
                  />
                )}
              </Link>
            );
          })}
        </div>
      )}

      {adding && (
        <div className="-mx-2 flex h-9 items-center gap-2 rounded-md border border-dashed px-2">
          <StatusIcon status="todo" className="opacity-50" />
          <Input
            autoFocus
            value={title}
            disabled={submitting}
            placeholder="Sub-issue title… (Enter to create)"
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void addSubIssue();
              }
              if (e.key === "Escape") {
                setAdding(false);
                setTitle("");
              }
            }}
            className="h-7 border-none px-0 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
        </div>
      )}
    </section>
  );
}
