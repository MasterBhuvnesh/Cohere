"use client";

import { ReactNode } from "react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { IssueRow } from "@/components/issues/issue-row";
import { STATUSES } from "@/components/shared/issue-meta";
import { StatusIcon } from "@/components/shared/status-icon";

/**
 * Issues grouped into status sections, Linear-list style. Shared by the
 * project and cycle detail pages (Track B).
 */
export function GroupedIssueList({
  issues,
  teamKeyFor,
  emptyState,
}: {
  issues: Doc<"issues">[];
  teamKeyFor: (teamId: Id<"teams">) => string;
  emptyState: ReactNode;
}) {
  if (issues.length === 0) {
    return <>{emptyState}</>;
  }

  const grouped = STATUSES.map((status) => ({
    status,
    issues: issues
      .filter((issue) => issue.status === status.value)
      .sort((a, b) => b.sortOrder - a.sortOrder),
  })).filter((group) => group.issues.length > 0);

  return (
    <>
      {grouped.map(({ status, issues: groupIssues }) => (
        <section key={status.value}>
          <div className="flex h-9 items-center gap-2 bg-muted/50 px-4 text-sm">
            <StatusIcon status={status.value} />
            <span className="font-medium">{status.label}</span>
            <span className="text-xs text-muted-foreground">
              {groupIssues.length}
            </span>
          </div>
          {groupIssues.map((issue) => (
            <IssueRow
              key={issue._id}
              issue={issue}
              teamKey={teamKeyFor(issue.teamId)}
            />
          ))}
        </section>
      ))}
    </>
  );
}
