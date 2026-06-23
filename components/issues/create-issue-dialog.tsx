"use client";

import { useMutation, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  IssuePriority,
  IssueStatus,
  PRIORITIES,
  STATUSES,
} from "@/components/shared/issue-meta";
import { PriorityIcon } from "@/components/shared/priority-icon";
import { StatusIcon } from "@/components/shared/status-icon";

export function CreateIssueDialog({
  open,
  onOpenChange,
  defaultTeamId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTeamId?: Id<"teams">;
}) {
  const params = useParams<{ orgSlug?: string }>();
  const router = useRouter();
  const teams = useQuery(api.teams.list, open ? {} : "skip");
  const createIssue = useMutation(api.issues.create);

  const [selectedTeamId, setSelectedTeamId] = useState<
    Id<"teams"> | undefined
  >(undefined);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<IssueStatus>("todo");
  const [priority, setPriority] = useState<IssuePriority>("none");
  const [submitting, setSubmitting] = useState(false);

  // Fall back to the default/first team without needing an effect.
  const teamId = selectedTeamId ?? defaultTeamId ?? teams?.[0]?._id;

  const handleSubmit = async () => {
    if (!teamId || !title.trim()) {
      return;
    }
    setSubmitting(true);
    try {
      const issueId = await createIssue({
        teamId,
        title,
        description: description.trim() || undefined,
        status,
        priority,
      });
      toast.success("Issue created");
      onOpenChange(false);
      setTitle("");
      setDescription("");
      setStatus("todo");
      setPriority("none");
      if (params.orgSlug) {
        router.push(`/${params.orgSlug}/issue/${issueId}`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create issue"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium text-muted-foreground">
            New issue
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Input
            autoFocus
            placeholder="Issue title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                void handleSubmit();
              }
            }}
            className="border-none px-0 text-lg font-medium shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
          <Textarea
            placeholder="Add description…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-20 resize-none border-none px-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={teamId ?? ""}
              onValueChange={(value) => setSelectedTeamId(value as Id<"teams">)}
            >
              <SelectTrigger size="sm" className="w-auto gap-1.5">
                <SelectValue placeholder="Team" />
              </SelectTrigger>
              <SelectContent>
                {teams?.map((team) => (
                  <SelectItem key={team._id} value={team._id}>
                    {team.key} · {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as IssueStatus)}
            >
              <SelectTrigger size="sm" className="w-auto gap-1.5">
                <StatusIcon status={status} />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={priority}
              onValueChange={(value) => setPriority(value as IssuePriority)}
            >
              <SelectTrigger size="sm" className="w-auto gap-1.5">
                <PriorityIcon priority={priority} />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!title.trim() || !teamId || submitting}
            onClick={() => void handleSubmit()}
          >
            Create issue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
