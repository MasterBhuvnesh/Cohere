"use client";

import { cn } from "@/lib/utils";

export type AiQuota = {
  hasAccess: boolean;
  unlimited: boolean;
  limit: number;
  remaining: number;
  resetsAt: number | null;
};

/** Compact daily-quota indicator for Pro orgs (Enterprise is unlimited). */
export function QuotaPill({ quota }: { quota: AiQuota | undefined }) {
  if (!quota || !quota.hasAccess || quota.unlimited) {
    return null;
  }
  const exhausted = quota.remaining <= 0;
  const resetHint = quota.resetsAt
    ? `Resets ${new Date(quota.resetsAt).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })}`
    : undefined;
  return (
    <span
      title={resetHint}
      className={cn(
        "rounded-full border px-2 py-0.5 text-[10px] font-medium text-muted-foreground",
        exhausted && "border-destructive/40 text-destructive"
      )}
    >
      {quota.remaining}/{quota.limit} messages today
    </span>
  );
}
