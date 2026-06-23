import { Doc } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";

/**
 * Free-tier caps. Pro/Enterprise are unlimited app-side; Clerk enforces
 * paid seat limits at invite time.
 */
export const FREE_PLAN_LIMITS = {
  seats: 3,
  projects: 2,
  issues: 100,
} as const;

export function isPaidPlan(org: Doc<"organizations">): boolean {
  return org.plan === "pro" || org.plan === "enterprise";
}

export async function assertCanCreateIssue(
  ctx: MutationCtx,
  org: Doc<"organizations">
): Promise<void> {
  if (isPaidPlan(org)) {
    return;
  }
  const issues = await ctx.db
    .query("issues")
    .withIndex("by_org", (q) => q.eq("orgId", org._id))
    .collect();
  if (issues.length >= FREE_PLAN_LIMITS.issues) {
    throw new Error(
      `Free plan is limited to ${FREE_PLAN_LIMITS.issues} issues. Upgrade to Pro for unlimited issues.`
    );
  }
}

export async function assertCanCreateProject(
  ctx: MutationCtx,
  org: Doc<"organizations">
): Promise<void> {
  if (isPaidPlan(org)) {
    return;
  }
  const projects = await ctx.db
    .query("projects")
    .withIndex("by_org", (q) => q.eq("orgId", org._id))
    .collect();
  if (projects.length >= FREE_PLAN_LIMITS.projects) {
    throw new Error(
      `Free plan is limited to ${FREE_PLAN_LIMITS.projects} projects. Upgrade to Pro for unlimited projects.`
    );
  }
}

export async function assertUnderSeatLimit(
  ctx: MutationCtx,
  org: Doc<"organizations">
): Promise<void> {
  if (isPaidPlan(org)) {
    return;
  }
  const members = await ctx.db
    .query("members")
    .withIndex("by_org", (q) => q.eq("orgId", org._id))
    .collect();
  if (members.length >= FREE_PLAN_LIMITS.seats) {
    throw new Error(
      `Free plan is limited to ${FREE_PLAN_LIMITS.seats} members. Upgrade to Pro for more seats.`
    );
  }
}

export function hasAiAccess(org: Doc<"organizations">): boolean {
  return isPaidPlan(org);
}
