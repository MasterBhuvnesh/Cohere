"use client";

import { useMutation, useQuery } from "convex/react";
import { CalendarDays } from "lucide-react";
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
import { UserAvatar } from "@/components/shared/user-avatar";
import { cn } from "@/lib/utils";
import { inputDateToMs } from "./dates";
import {
  DEFAULT_PROJECT_COLOR,
  PROJECT_COLORS,
  PROJECT_STATUSES,
  ProjectStatus,
} from "./project-meta";
import { ProjectStatusIcon } from "./project-status-icon";

const NO_LEAD = "no-lead";

export function CreateProjectDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const params = useParams<{ orgSlug?: string }>();
  const router = useRouter();
  const members = useQuery(api.organizations.listMembers, open ? {} : "skip");
  const createProject = useMutation(api.projects.create);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("planned");
  const [leadId, setLeadId] = useState<Id<"users"> | undefined>(undefined);
  const [targetDate, setTargetDate] = useState("");
  const [color, setColor] = useState<string>(DEFAULT_PROJECT_COLOR);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName("");
    setDescription("");
    setStatus("planned");
    setLeadId(undefined);
    setTargetDate("");
    setColor(DEFAULT_PROJECT_COLOR);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      return;
    }
    setSubmitting(true);
    try {
      const projectId = await createProject({
        name,
        description: description.trim() || undefined,
        status,
        leadId,
        targetDate: inputDateToMs(targetDate, "end"),
        color,
      });
      toast.success("Project created");
      onOpenChange(false);
      reset();
      if (params.orgSlug) {
        router.push(`/${params.orgSlug}/projects/${projectId}`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create project"
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
            New project
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Input
            autoFocus
            placeholder="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
              value={status}
              onValueChange={(value) => setStatus(value as ProjectStatus)}
            >
              <SelectTrigger size="sm" className="w-auto gap-1.5">
                <ProjectStatusIcon status={status} />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={leadId ?? NO_LEAD}
              onValueChange={(value) =>
                setLeadId(value === NO_LEAD ? undefined : (value as Id<"users">))
              }
            >
              <SelectTrigger size="sm" className="w-auto gap-1.5">
                <SelectValue placeholder="Lead" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_LEAD}>
                  <span className="text-muted-foreground">No lead</span>
                </SelectItem>
                {members?.map((member) => (
                  <SelectItem key={member.userId} value={member.userId}>
                    <UserAvatar name={member.name} imageUrl={member.imageUrl} />
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex h-8 items-center gap-1.5 rounded-md border px-2">
              <CalendarDays className="size-3.5 text-muted-foreground" />
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                aria-label="Target date"
                className="bg-transparent text-xs text-foreground outline-none [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="mr-1 text-xs text-muted-foreground">Color</span>
            {PROJECT_COLORS.map((swatch) => (
              <button
                key={swatch}
                type="button"
                aria-label={`Use color ${swatch}`}
                onClick={() => setColor(swatch)}
                className={cn(
                  "size-4 rounded-full transition-transform hover:scale-110",
                  color === swatch &&
                    "ring-2 ring-ring ring-offset-2 ring-offset-background"
                )}
                style={{ backgroundColor: swatch }}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!name.trim() || submitting}
            onClick={() => void handleSubmit()}
          >
            Create project
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
