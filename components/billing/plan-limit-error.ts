import { FREE_PLAN_DISPLAY_LIMITS } from "@/lib/plans";

/**
 * Detection of the free-plan limit errors thrown by `convex/lib/limits.ts`
 * ("Free plan is limited to N issues/projects/members. Upgrade to Pro…").
 * Convex prefixes server errors with request metadata, so we match on the
 * message substring rather than equality.
 */

export type PlanLimitKind = "issues" | "projects" | "seats";

const LIMIT_PATTERN = /free plan is limited to\s+(\d+)\s+(issues?|projects?|members?)/i;

export type PlanLimitMatch = {
  kind: PlanLimitKind;
  limit: number;
};

/** Extract a human-readable message from any thrown value. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "";
}

/** Match a free-plan limit error message, returning which limit was hit. */
export function matchPlanLimitMessage(
  message: string
): PlanLimitMatch | null {
  const match = LIMIT_PATTERN.exec(message);
  if (!match) {
    return null;
  }
  const noun = match[2].toLowerCase();
  const kind: PlanLimitKind = noun.startsWith("issue")
    ? "issues"
    : noun.startsWith("project")
      ? "projects"
      : "seats";
  return { kind, limit: Number(match[1]) };
}

/** Match a thrown error (e.g. a failed Convex mutation) against the free-plan limits. */
export function matchPlanLimitError(error: unknown): PlanLimitMatch | null {
  return matchPlanLimitMessage(getErrorMessage(error));
}

export function isPlanLimitError(error: unknown): boolean {
  return matchPlanLimitError(error) !== null;
}

/** Upgrade-prompt copy per limit kind. */
export const PLAN_LIMIT_COPY: Record<
  PlanLimitKind,
  { title: string; description: string }
> = {
  issues: {
    title: "You've hit the Free plan issue limit",
    description: `Free workspaces can track up to ${FREE_PLAN_DISPLAY_LIMITS.issues} issues. Upgrade to Pro for unlimited issues and the AI agent.`,
  },
  projects: {
    title: "You've hit the Free plan project limit",
    description: `Free workspaces can have up to ${FREE_PLAN_DISPLAY_LIMITS.projects} projects. Upgrade to Pro for unlimited projects and the AI agent.`,
  },
  seats: {
    title: "You've hit the Free plan seat limit",
    description: `Free workspaces include ${FREE_PLAN_DISPLAY_LIMITS.seats} seats. Upgrade to Pro for up to 10 seats, or Enterprise for unlimited members.`,
  },
};
