import { v } from "convex/values";
import { orgAdminMutation, orgQuery } from "./lib/customFunctions";

const teamShape = {
  _id: v.id("teams"),
  _creationTime: v.number(),
  orgId: v.id("organizations"),
  name: v.string(),
  key: v.string(),
  description: v.optional(v.string()),
  nextIssueNumber: v.number(),
};

export const list = orgQuery({
  args: {},
  returns: v.array(v.object(teamShape)),
  handler: async (ctx) => {
    return await ctx.db
      .query("teams")
      .withIndex("by_org", (q) => q.eq("orgId", ctx.org._id))
      .collect();
  },
});

export const get = orgQuery({
  args: { teamId: v.id("teams") },
  returns: v.union(v.object(teamShape), v.null()),
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team || team.orgId !== ctx.org._id) {
      return null;
    }
    return team;
  },
});

export const create = orgAdminMutation({
  args: {
    name: v.string(),
    key: v.string(),
    description: v.optional(v.string()),
  },
  returns: v.id("teams"),
  handler: async (ctx, args) => {
    const key = args.key.toUpperCase().trim();
    if (!/^[A-Z][A-Z0-9]{0,4}$/.test(key)) {
      throw new Error(
        "Team key must be 1-5 characters, letters and digits, starting with a letter"
      );
    }
    const existing = await ctx.db
      .query("teams")
      .withIndex("by_org_and_key", (q) =>
        q.eq("orgId", ctx.org._id).eq("key", key)
      )
      .unique();
    if (existing) {
      throw new Error(`Team key "${key}" is already in use`);
    }
    return await ctx.db.insert("teams", {
      orgId: ctx.org._id,
      name: args.name.trim(),
      key,
      description: args.description,
      nextIssueNumber: 1,
    });
  },
});
