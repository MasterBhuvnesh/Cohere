import { v } from "convex/values";
import { query } from "./_generated/server";
import { orgQuery } from "./lib/customFunctions";
import { getCurrentUserOrNull } from "./lib/auth";
import { planValidator, memberRoleValidator } from "./schema";

const orgShape = {
  _id: v.id("organizations"),
  _creationTime: v.number(),
  clerkOrgId: v.string(),
  name: v.string(),
  slug: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  plan: planValidator,
  subscriptionStatus: v.optional(v.string()),
};

/**
 * The active organization (from the JWT claim), or null while webhook sync
 * is in flight. Used by the app shell to gate rendering.
 */
export const current = query({
  args: {},
  returns: v.union(v.object(orgShape), v.null()),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const user = await getCurrentUserOrNull(ctx);
    if (!user) {
      return null;
    }
    const claims = identity as unknown as { org_id?: string };
    if (!claims.org_id) {
      return null;
    }
    const org = await ctx.db
      .query("organizations")
      .withIndex("by_clerk_org_id", (q) => q.eq("clerkOrgId", claims.org_id!))
      .unique();
    if (!org) {
      return null;
    }
    const membership = await ctx.db
      .query("members")
      .withIndex("by_org_and_user", (q) =>
        q.eq("orgId", org._id).eq("userId", user._id)
      )
      .unique();
    if (!membership) {
      return null;
    }
    return org;
  },
});

/** All members of the active org with their user info (assignee pickers, @mentions). */
export const listMembers = orgQuery({
  args: {},
  returns: v.array(
    v.object({
      memberId: v.id("members"),
      userId: v.id("users"),
      role: memberRoleValidator,
      name: v.string(),
      email: v.string(),
      imageUrl: v.optional(v.string()),
    })
  ),
  handler: async (ctx) => {
    const members = await ctx.db
      .query("members")
      .withIndex("by_org", (q) => q.eq("orgId", ctx.org._id))
      .collect();
    const result = [];
    for (const member of members) {
      const user = await ctx.db.get(member.userId);
      if (user) {
        result.push({
          memberId: member._id,
          userId: user._id,
          role: member.role,
          name: user.name,
          email: user.email,
          imageUrl: user.imageUrl,
        });
      }
    }
    return result;
  },
});
