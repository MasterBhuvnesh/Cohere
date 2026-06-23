import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { QueryCtx } from "./_generated/server";
import { logActivity } from "./lib/activity";
import { orgMutation, orgQuery } from "./lib/customFunctions";
import { assertCanCreateIssue } from "./lib/limits";
import { issuePriorityValidator, issueStatusValidator } from "./schema";

export const issueShape = {
  _id: v.id("issues"),
  _creationTime: v.number(),
  orgId: v.id("organizations"),
  teamId: v.id("teams"),
  number: v.number(),
  title: v.string(),
  description: v.optional(v.string()),
  status: issueStatusValidator,
  priority: issuePriorityValidator,
  assigneeId: v.optional(v.id("users")),
  creatorId: v.id("users"),
  projectId: v.optional(v.id("projects")),
  cycleId: v.optional(v.id("cycles")),
  parentIssueId: v.optional(v.id("issues")),
  estimate: v.optional(v.number()),
  dueDate: v.optional(v.number()),
  sortOrder: v.number(),
  embedding: v.optional(v.array(v.float64())),
};

/** Verify an issue belongs to the caller's org before any read/write. */
export async function getOrgIssue(
  ctx: { db: QueryCtx["db"] },
  orgId: Id<"organizations">,
  issueId: Id<"issues">
): Promise<Doc<"issues">> {
  const issue = await ctx.db.get(issueId);
  if (!issue || issue.orgId !== orgId) {
    throw new Error("Issue not found");
  }
  return issue;
}

export const listByTeam = orgQuery({
  args: { teamId: v.id("teams") },
  returns: v.array(v.object(issueShape)),
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team || team.orgId !== ctx.org._id) {
      throw new Error("Team not found");
    }
    return await ctx.db
      .query("issues")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .order("desc")
      .take(500);
  },
});

export const get = orgQuery({
  args: { issueId: v.id("issues") },
  returns: v.union(v.object(issueShape), v.null()),
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.issueId);
    if (!issue || issue.orgId !== ctx.org._id) {
      return null;
    }
    return issue;
  },
});

/** Look up an issue by its display identifier (team key + number, e.g. ENG-42). */
export const getByNumber = orgQuery({
  args: { teamId: v.id("teams"), number: v.number() },
  returns: v.union(v.object(issueShape), v.null()),
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team || team.orgId !== ctx.org._id) {
      return null;
    }
    return await ctx.db
      .query("issues")
      .withIndex("by_team_and_number", (q) =>
        q.eq("teamId", args.teamId).eq("number", args.number)
      )
      .unique();
  },
});

export const create = orgMutation({
  args: {
    teamId: v.id("teams"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.optional(issueStatusValidator),
    priority: v.optional(issuePriorityValidator),
    assigneeId: v.optional(v.id("users")),
    projectId: v.optional(v.id("projects")),
    cycleId: v.optional(v.id("cycles")),
    parentIssueId: v.optional(v.id("issues")),
    estimate: v.optional(v.number()),
    dueDate: v.optional(v.number()),
  },
  returns: v.id("issues"),
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team || team.orgId !== ctx.org._id) {
      throw new Error("Team not found");
    }
    await assertCanCreateIssue(ctx, ctx.org);

    // Claim the next per-team issue number (ENG-1, ENG-2, ...).
    const number = team.nextIssueNumber;
    await ctx.db.patch(team._id, { nextIssueNumber: number + 1 });

    // New issues sort to the top of their column.
    const newest = await ctx.db
      .query("issues")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .order("desc")
      .first();
    const sortOrder = (newest?.sortOrder ?? 0) + 1000;

    const issueId = await ctx.db.insert("issues", {
      orgId: ctx.org._id,
      teamId: args.teamId,
      number,
      title: args.title.trim(),
      description: args.description,
      status: args.status ?? "todo",
      priority: args.priority ?? "none",
      assigneeId: args.assigneeId,
      creatorId: ctx.user._id,
      projectId: args.projectId,
      cycleId: args.cycleId,
      parentIssueId: args.parentIssueId,
      estimate: args.estimate,
      dueDate: args.dueDate,
      sortOrder,
    });

    await logActivity(ctx, {
      orgId: ctx.org._id,
      issueId,
      actorId: ctx.user._id,
      type: "created",
    });

    return issueId;
  },
});

export const update = orgMutation({
  args: {
    issueId: v.id("issues"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(issueStatusValidator),
    priority: v.optional(issuePriorityValidator),
    assigneeId: v.optional(v.union(v.id("users"), v.null())),
    projectId: v.optional(v.union(v.id("projects"), v.null())),
    cycleId: v.optional(v.union(v.id("cycles"), v.null())),
    estimate: v.optional(v.union(v.number(), v.null())),
    dueDate: v.optional(v.union(v.number(), v.null())),
    sortOrder: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const issue = await getOrgIssue(ctx, ctx.org._id, args.issueId);

    const updates: Partial<Doc<"issues">> = {};
    const changes: { field: string; oldValue?: string; newValue?: string }[] =
      [];

    if (args.title !== undefined && args.title !== issue.title) {
      updates.title = args.title.trim();
      changes.push({ field: "title", oldValue: issue.title, newValue: args.title });
    }
    if (args.description !== undefined) {
      updates.description = args.description;
    }
    if (args.status !== undefined && args.status !== issue.status) {
      updates.status = args.status;
      changes.push({ field: "status", oldValue: issue.status, newValue: args.status });
    }
    if (args.priority !== undefined && args.priority !== issue.priority) {
      updates.priority = args.priority;
      changes.push({
        field: "priority",
        oldValue: issue.priority,
        newValue: args.priority,
      });
    }
    if (args.assigneeId !== undefined) {
      updates.assigneeId = args.assigneeId ?? undefined;
      changes.push({
        field: "assignee",
        oldValue: issue.assigneeId,
        newValue: args.assigneeId ?? undefined,
      });
    }
    if (args.projectId !== undefined) {
      updates.projectId = args.projectId ?? undefined;
    }
    if (args.cycleId !== undefined) {
      updates.cycleId = args.cycleId ?? undefined;
    }
    if (args.estimate !== undefined) {
      updates.estimate = args.estimate ?? undefined;
    }
    if (args.dueDate !== undefined) {
      updates.dueDate = args.dueDate ?? undefined;
    }
    if (args.sortOrder !== undefined) {
      updates.sortOrder = args.sortOrder;
    }

    await ctx.db.patch(issue._id, updates);

    for (const change of changes) {
      await logActivity(ctx, {
        orgId: ctx.org._id,
        issueId: issue._id,
        actorId: ctx.user._id,
        type: `${change.field}_changed`,
        field: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue,
      });
    }
    return null;
  },
});

export const remove = orgMutation({
  args: { issueId: v.id("issues") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const issue = await getOrgIssue(ctx, ctx.org._id, args.issueId);

    const labelLinks = await ctx.db
      .query("issueLabels")
      .withIndex("by_issue", (q) => q.eq("issueId", issue._id))
      .collect();
    for (const link of labelLinks) {
      await ctx.db.delete(link._id);
    }

    await ctx.db.delete(issue._id);
    return null;
  },
});
