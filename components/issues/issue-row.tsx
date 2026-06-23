"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { PriorityIcon } from "@/components/shared/priority-icon";
import { StatusIcon } from "@/components/shared/status-icon";
import { UserAvatar } from "@/components/shared/user-avatar";

export function IssueRow({
  issue,
  teamKey,
}: {
  issue: Doc<"issues">;
  teamKey: string;
}) {
  const params = useParams<{ orgSlug: string }>();
  const members = useQuery(api.organizations.listMembers);
  const assignee = members?.find((m) => m.userId === issue.assigneeId);

  return (
    <Link
      href={`/${params.orgSlug}/issue/${issue._id}`}
      className="group flex h-10 items-center gap-3 border-b px-4 text-sm transition-colors hover:bg-accent/50"
    >
      <PriorityIcon priority={issue.priority} />
      <span className="w-16 shrink-0 font-mono text-xs text-muted-foreground">
        {teamKey}-{issue.number}
      </span>
      <StatusIcon status={issue.status} />
      <span className="min-w-0 flex-1 truncate font-medium">{issue.title}</span>
      {issue.dueDate ? (
        <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
          {new Date(issue.dueDate).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>
      ) : null}
      {assignee ? (
        <UserAvatar name={assignee.name} imageUrl={assignee.imageUrl} />
      ) : (
        <span className="size-5 rounded-full border border-dashed border-muted-foreground/40" />
      )}
    </Link>
  );
}
