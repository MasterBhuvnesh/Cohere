"use client";

import { useQuery } from "convex/react";
import { GitMerge, GitPullRequest, GitPullRequestClosed } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Separator } from "@/components/ui/separator";
import { GithubIcon } from "@/components/shared/github-icon";
import { IssueDetailSlotProps } from "./slots";

const STATE_ICONS = {
  open: <GitPullRequest className="size-3.5 shrink-0 text-green-500" />,
  merged: <GitMerge className="size-3.5 shrink-0 text-purple-500" />,
  closed: <GitPullRequestClosed className="size-3.5 shrink-0 text-red-500" />,
} as const;

/**
 * GitHub links for this issue: the synced GitHub issue (created via
 * "Also create this issue on GitHub") and pull requests linked by
 * branch/title mentions.
 */
export function PullRequestsPanel({ issue }: IssueDetailSlotProps) {
  const pullRequests = useQuery(api.integrations.listByIssue, {
    issueId: issue._id,
  });
  const githubIssues = useQuery(api.github.sync.linksByIssue, {
    issueId: issue._id,
  });

  const empty =
    (!pullRequests || pullRequests.length === 0) &&
    (!githubIssues || githubIssues.length === 0);
  if (empty) {
    return null;
  }

  return (
    <>
      <Separator className="my-4" />
      <div className="flex flex-col gap-2 pb-2">
        <h3 className="text-xs font-medium text-muted-foreground">GitHub</h3>
        {githubIssues?.map((link) => (
          <a
            key={link._id}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-md px-1 py-0.5 text-xs transition-colors hover:bg-accent"
            title={`Synced GitHub issue in ${link.repo}`}
          >
            <GithubIcon className="size-3.5 shrink-0" />
            <span className="truncate">
              <span className="text-muted-foreground">{link.repo}</span>
              #{link.number}
            </span>
          </a>
        ))}
        {pullRequests?.map((pr) => (
          <a
            key={pr._id}
            href={pr.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-md px-1 py-0.5 text-xs transition-colors hover:bg-accent"
            title={`${pr.repo} · by ${pr.authorLogin}`}
          >
            {STATE_ICONS[pr.state]}
            <span className="text-muted-foreground">#{pr.number}</span>
            <span className="truncate">{pr.title}</span>
          </a>
        ))}
      </div>
    </>
  );
}
