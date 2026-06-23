"use client";

import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IssueDetailSlotProps } from "@/components/issue-detail/slots";
import { cycleDisplayName, isCurrentCycle } from "@/components/cycles/cycle-meta";
import { DEFAULT_PROJECT_COLOR } from "./project-meta";

const NONE = "none";

function PropertyRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

/**
 * Issue-detail sidebar slot (Track B): assign the issue to a project and a
 * cycle via the existing `issues.update` mutation.
 */
export function IssueProjectCyclePanel({ issue, team }: IssueDetailSlotProps) {
  const projects = useQuery(api.projects.list);
  const cycles = useQuery(api.cycles.listByTeam, { teamId: team._id });
  const updateIssue = useMutation(api.issues.update);

  const update = (patch: {
    projectId?: Id<"projects"> | null;
    cycleId?: Id<"cycles"> | null;
  }) => {
    updateIssue({ issueId: issue._id, ...patch }).catch((error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update issue"
      );
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-medium text-muted-foreground">Planning</h3>

      <PropertyRow label="Project">
        <Select
          value={issue.projectId ?? NONE}
          onValueChange={(value) =>
            update({
              projectId: value === NONE ? null : (value as Id<"projects">),
            })
          }
        >
          <SelectTrigger
            size="sm"
            className="w-36 gap-1.5 border-none shadow-none"
          >
            <SelectValue placeholder="No project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>
              <span className="text-muted-foreground">No project</span>
            </SelectItem>
            {projects?.map((project) => (
              <SelectItem key={project._id} value={project._id}>
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: project.color ?? DEFAULT_PROJECT_COLOR,
                  }}
                />
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PropertyRow>

      <PropertyRow label="Cycle">
        <Select
          value={issue.cycleId ?? NONE}
          onValueChange={(value) =>
            update({
              cycleId: value === NONE ? null : (value as Id<"cycles">),
            })
          }
        >
          <SelectTrigger
            size="sm"
            className="w-36 gap-1.5 border-none shadow-none"
          >
            <SelectValue placeholder="No cycle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>
              <span className="text-muted-foreground">No cycle</span>
            </SelectItem>
            {cycles?.map((cycle) => (
              <SelectItem key={cycle._id} value={cycle._id}>
                {cycleDisplayName(cycle)}
                {isCurrentCycle(cycle) && (
                  <span className="text-xs text-emerald-500">Current</span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PropertyRow>
    </div>
  );
}
