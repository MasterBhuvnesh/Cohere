import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { QueryCtx } from "./_generated/server";
import { issueShape } from "./issues";
import { logActivity } from "./lib/activity";
import { orgMutation, orgQuery } from "./lib/customFunctions";
import { progressShape } from "./projects";

export const cycleShape = {
  _id: v.id("cycles"),
  _creationTime: v.number(),
  orgId: v.id("organizations"),
  teamId: v.id("teams"),
  number: v.number(),
  name: v.optional(v.string()),
  startDate: v.number(),
  endDate: v.number(),
};

/** Verify a cycle belongs to the caller's org before any read/write. */
async function getOrgCycle(
  ctx: { db: QueryCtx["db"] },
  orgId: Id<"organizations">,
  cycleId: Id<"cycles">
): Promise<Doc<"cycles">> {
  const cycle = await ctx.db.get(cycleId);
  if (!cycle || cycle.orgId !== orgId) {
    throw new Error("Cycle not found");
  }
  return cycle;
}

/** Verify a team belongs to the caller's org. */
async function getOrgTeam(
  ctx: { db: QueryCtx["db"] },
  orgId: Id<"organizations">,
  teamId: Id<"teams">
): Promise<Doc<"teams">> {
  const team = await ctx.db.get(teamId);
  if (!team || team.orgId !== orgId) {
    throw new Error("Team not found");
  }
  return team;
}

async function countProgress(
  ctx: { db: QueryCtx["db"] },
  orgId: Id<"organizations">,
  cycleId: Id<"cycles">
) {
  const issues = await ctx.db
    .query("issues")
    .withIndex("by_cycle", (q) => q.eq("cycleId", cycleId))
    .collect();
  const progress = {
    total: 0,
    backlog: 0,
    todo: 0,
    in_progress: 0,
    in_review: 0,
    done: 0,
    canceled: 0,
  };
  for (const issue of issues) {
    if (issue.orgId !== orgId) {
      continue;
    }
    progress.total += 1;
    progress[issue.status] += 1;
  }
  return progress;
}

/** Cycles for one team, newest first (lightweight — for pickers). */
export const listByTeam = orgQuery({
  args: { teamId: v.id("teams") },
  returns: v.array(v.object(cycleShape)),
  handler: async (ctx, args) => {
    await getOrgTeam(ctx, ctx.org._id, args.teamId);
    return await ctx.db
      .query("cycles")
      .withIndex("by_team_and_number", (q) => q.eq("teamId", args.teamId))
      .order("desc")
      .collect();
  },
});

/**
 * Every cycle in the org with team info and per-status issue counts —
 * powers the cycles index page.
 */
export const listWithProgress = orgQuery({
  args: {},
  returns: v.array(
    v.object({
      ...cycleShape,
      teamName: v.string(),
      teamKey: v.string(),
      progress: progressShape,
    })
  ),
  handler: async (ctx) => {
    const teams = await ctx.db
      .query("teams")
      .withIndex("by_org", (q) => q.eq("orgId", ctx.org._id))
      .collect();
    const result = [];
    for (const team of teams) {
      const cycles = await ctx.db
        .query("cycles")
        .withIndex("by_team_and_number", (q) => q.eq("teamId", team._id))
        .order("desc")
        .collect();
      for (const cycle of cycles) {
        result.push({
          ...cycle,
          teamName: team.name,
          teamKey: team.key,
          progress: await countProgress(ctx, ctx.org._id, cycle._id),
        });
      }
    }
    return result;
  },
});

export const get = orgQuery({
  args: { cycleId: v.id("cycles") },
  returns: v.union(v.object(cycleShape), v.null()),
  handler: async (ctx, args) => {
    const cycle = await ctx.db.get(args.cycleId);
    if (!cycle || cycle.orgId !== ctx.org._id) {
      return null;
    }
    return cycle;
  },
});

/**
 * The team's current cycle — the active cycle (startDate ≤ now ≤ endDate)
 * with the most recent start, or null when no cycle is running.
 */
export const currentForTeam = orgQuery({
  args: { teamId: v.id("teams") },
  returns: v.union(v.object(cycleShape), v.null()),
  handler: async (ctx, args) => {
    await getOrgTeam(ctx, ctx.org._id, args.teamId);
    const cycles = await ctx.db
      .query("cycles")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();
    const now = Date.now();
    const active = cycles
      .filter((cycle) => cycle.startDate <= now && now <= cycle.endDate)
      .sort((a, b) => b.startDate - a.startDate);
    return active[0] ?? null;
  },
});

/** All issues scheduled into a cycle (detail page computes progress from this). */
export const listIssues = orgQuery({
  args: { cycleId: v.id("cycles") },
  returns: v.array(v.object(issueShape)),
  handler: async (ctx, args) => {
    await getOrgCycle(ctx, ctx.org._id, args.cycleId);
    const issues = await ctx.db
      .query("issues")
      .withIndex("by_cycle", (q) => q.eq("cycleId", args.cycleId))
      .collect();
    return issues.filter((issue) => issue.orgId === ctx.org._id);
  },
});

/**
 * Team issues NOT already in the given cycle — candidates for the
 * "add issues to cycle" picker. Assignment itself goes through
 * `issues.update` (cycleId arg).
 */
export const candidateIssues = orgQuery({
  args: { cycleId: v.id("cycles") },
  returns: v.array(v.object(issueShape)),
  handler: async (ctx, args) => {
    const cycle = await getOrgCycle(ctx, ctx.org._id, args.cycleId);
    const issues = await ctx.db
      .query("issues")
      .withIndex("by_team", (q) => q.eq("teamId", cycle.teamId))
      .order("desc")
      .take(500);
    return issues
      .filter(
        (issue) => issue.orgId === ctx.org._id && issue.cycleId !== args.cycleId
      )
      .slice(0, 200);
  },
});

/** Create a cycle for a team. Cycles are auto-numbered per team (Cycle 1, 2, …). */
export const create = orgMutation({
  args: {
    teamId: v.id("teams"),
    name: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.number(),
  },
  returns: v.id("cycles"),
  handler: async (ctx, args) => {
    await getOrgTeam(ctx, ctx.org._id, args.teamId);
    if (args.endDate <= args.startDate) {
      throw new Error("Cycle end date must be after its start date");
    }

    // Claim the next per-team cycle number.
    const latest = await ctx.db
      .query("cycles")
      .withIndex("by_team_and_number", (q) => q.eq("teamId", args.teamId))
      .order("desc")
      .first();
    const number = (latest?.number ?? 0) + 1;

    const name = args.name?.trim();
    return await ctx.db.insert("cycles", {
      orgId: ctx.org._id,
      teamId: args.teamId,
      number,
      name: name ? name : undefined,
      startDate: args.startDate,
      endDate: args.endDate,
    });
  },
});

export const update = orgMutation({
  args: {
    cycleId: v.id("cycles"),
    name: v.optional(v.union(v.string(), v.null())),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const cycle = await getOrgCycle(ctx, ctx.org._id, args.cycleId);

    const startDate = args.startDate ?? cycle.startDate;
    const endDate = args.endDate ?? cycle.endDate;
    if (endDate <= startDate) {
      throw new Error("Cycle end date must be after its start date");
    }

    const updates: Partial<Doc<"cycles">> = {};
    if (args.name !== undefined) {
      const name = args.name?.trim();
      updates.name = name ? name : undefined;
    }
    if (args.startDate !== undefined) {
      updates.startDate = args.startDate;
    }
    if (args.endDate !== undefined) {
      updates.endDate = args.endDate;
    }

    await ctx.db.patch(cycle._id, updates);
    return null;
  },
});

/** Delete a cycle and unschedule its issues (issues themselves are kept). */
export const remove = orgMutation({
  args: { cycleId: v.id("cycles") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const cycle = await getOrgCycle(ctx, ctx.org._id, args.cycleId);

    const issues = await ctx.db
      .query("issues")
      .withIndex("by_cycle", (q) => q.eq("cycleId", cycle._id))
      .collect();
    for (const issue of issues) {
      if (issue.orgId !== ctx.org._id) {
        continue;
      }
      await ctx.db.patch(issue._id, { cycleId: undefined });
      await logActivity(ctx, {
        orgId: ctx.org._id,
        issueId: issue._id,
        actorId: ctx.user._id,
        type: "cycle_changed",
        field: "cycle",
        oldValue: cycle.name ?? `Cycle ${cycle.number}`,
        newValue: undefined,
      });
    }

    await ctx.db.delete(cycle._id);
    return null;
  },
});
