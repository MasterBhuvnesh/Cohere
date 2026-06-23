"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Doc } from "@/convex/_generated/dataModel";
import { formatDateRange } from "@/components/projects/dates";
import { IssueProgress } from "@/components/projects/project-meta";
import { IssueProgressBar } from "@/components/projects/progress-bar";
import { cycleDisplayName, cycleStatus } from "./cycle-meta";
import { CycleStatusBadge } from "./cycle-status-badge";

export function CycleRow({
  cycle,
}: {
  cycle: Doc<"cycles"> & { progress: IssueProgress };
}) {
  const params = useParams<{ orgSlug: string }>();
  const status = cycleStatus(cycle);
  const activeIssues = cycle.progress.total - cycle.progress.canceled;

  return (
    <Link
      href={`/${params.orgSlug}/cycles/${cycle._id}`}
      className="group flex h-11 items-center gap-3 border-b px-4 text-sm transition-colors hover:bg-accent/50"
    >
      <span className="w-12 shrink-0 font-mono text-xs text-muted-foreground">
        C{cycle.number}
      </span>
      <span className="min-w-0 flex-1 truncate font-medium">
        {cycleDisplayName(cycle)}
      </span>
      <CycleStatusBadge status={status} className="shrink-0" />
      <span className="hidden w-32 shrink-0 text-right text-xs text-muted-foreground sm:block">
        {formatDateRange(cycle.startDate, cycle.endDate)}
      </span>
      <span className="hidden w-16 shrink-0 text-right text-xs text-muted-foreground lg:block">
        {activeIssues} {activeIssues === 1 ? "issue" : "issues"}
      </span>
      <IssueProgressBar
        progress={cycle.progress}
        showPercent
        className="hidden w-44 shrink-0 md:flex"
      />
    </Link>
  );
}
