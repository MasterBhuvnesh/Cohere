"use client";

import { useMutation, useQuery } from "convex/react";
import { FolderKanban, LayoutTemplate } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { GithubIcon } from "@/components/shared/github-icon";
import { PriorityIcon } from "@/components/shared/priority-icon";
import { StatusIcon } from "@/components/shared/status-icon";

const NO_PROJECT = "no-project";

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
  const templates = useQuery(api.issueTemplates.list, open ? {} : "skip");
  const projects = useQuery(api.projects.list, open ? {} : "skip");
  const createIssue = useMutation(api.issues.create);

  const [selectedTeamId, setSelectedTeamId] = useState<
    Id<"teams"> | undefined
  >(undefined);
  const [templateId, setTemplateId] = useState<Id<"issueTemplates"> | null>(
    null
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<IssueStatus>("todo");
  const [priority, setPriority] = useState<IssuePriority>("none");
  const [labelIds, setLabelIds] = useState<Id<"labels">[]>([]);
  const [projectId, setProjectId] = useState<Id<"projects"> | null>(null);
  const [syncToGithub, setSyncToGithub] = useState(false);
  const [githubRepo, setGithubRepo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fall back to the default/first team without needing an effect.
  const teamId = selectedTeamId ?? defaultTeamId ?? teams?.[0]?._id;
  const teamTemplates = templates?.filter((t) => t.teamId === teamId) ?? [];

  const selectedProject = projects?.find((p) => p._id === projectId);
  const projectRepos = selectedProject?.githubRepos ?? [];
  // The repo actually submitted: explicit choice, or the only repo connected.
  const syncRepo = syncToGithub
    ? (githubRepo ?? (projectRepos.length === 1 ? projectRepos[0] : null))
    : null;

  const applyTemplate = (id: Id<"issueTemplates">) => {
    const template = templates?.find((t) => t._id === id);
    if (!template) {
      return;
    }
    setTemplateId(id);
    setTitle(template.titlePrefix);
    setDescription(template.description ?? "");
    setPriority(template.priority);
    setLabelIds(template.labelIds);
  };

  const resetForm = () => {
    setTemplateId(null);
    setTitle("");
    setDescription("");
    setStatus("todo");
    setPriority("none");
    setLabelIds([]);
    setProjectId(null);
    setSyncToGithub(false);
    setGithubRepo(null);
  };

  const handleSubmit = async () => {
    if (!teamId || !title.trim()) {
      return;
    }
    if (syncToGithub && !syncRepo) {
      toast.error("Pick a repository to create the issue on GitHub");
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
        labelIds: labelIds.length > 0 ? labelIds : undefined,
        projectId: projectId ?? undefined,
        githubRepo: syncRepo ?? undefined,
      });
      toast.success(
        syncRepo ? "Issue created — syncing to GitHub" : "Issue created"
      );
      onOpenChange(false);
      resetForm();
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
              onValueChange={(value) => {
                setSelectedTeamId(value as Id<"teams">);
                setTemplateId(null);
              }}
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
            {teamTemplates.length > 0 ? (
              <Select
                value={templateId ?? "none"}
                onValueChange={(value) => {
                  if (value === "none") {
                    setTemplateId(null);
                  } else {
                    applyTemplate(value as Id<"issueTemplates">);
                  }
                }}
              >
                <SelectTrigger size="sm" className="w-auto gap-1.5">
                  <LayoutTemplate className="size-3.5" />
                  <SelectValue placeholder="Template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No template</SelectItem>
                  {teamTemplates.map((template) => (
                    <SelectItem key={template._id} value={template._id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
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
            <Select
              value={projectId ?? NO_PROJECT}
              onValueChange={(value) => {
                setProjectId(
                  value === NO_PROJECT ? null : (value as Id<"projects">)
                );
                setSyncToGithub(false);
                setGithubRepo(null);
              }}
            >
              <SelectTrigger size="sm" className="w-auto gap-1.5">
                <FolderKanban className="size-3.5" />
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_PROJECT}>
                  <span className="text-muted-foreground">No project</span>
                </SelectItem>
                {projects?.map((project) => (
                  <SelectItem key={project._id} value={project._id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {projectRepos.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/30 px-2.5 py-2">
              <label className="flex cursor-pointer items-center gap-2 text-xs">
                <Checkbox
                  checked={syncToGithub}
                  onCheckedChange={(checked) => {
                    setSyncToGithub(checked === true);
                    if (checked !== true) {
                      setGithubRepo(null);
                    }
                  }}
                />
                <GithubIcon className="size-3.5" />
                Also create this issue on GitHub
              </label>
              {syncToGithub && projectRepos.length > 1 && (
                <Select
                  value={githubRepo ?? ""}
                  onValueChange={(value) => setGithubRepo(value)}
                >
                  <SelectTrigger
                    size="sm"
                    className="ml-auto w-auto gap-1.5 font-mono text-xs"
                  >
                    <SelectValue placeholder="Pick repository" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectRepos.map((repo) => (
                      <SelectItem
                        key={repo}
                        value={repo}
                        className="font-mono text-xs"
                      >
                        {repo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {syncToGithub && projectRepos.length === 1 && (
                <span className="ml-auto font-mono text-xs text-muted-foreground">
                  {projectRepos[0]}
                </span>
              )}
            </div>
          )}
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
