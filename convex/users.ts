import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentUserOrNull } from "./lib/auth";

/**
 * The signed-in user's synced doc, or null while the Clerk webhook sync is
 * in flight. The app shell gates rendering on this.
 */
export const current = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      clerkId: v.string(),
      name: v.string(),
      email: v.string(),
      imageUrl: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    return await getCurrentUserOrNull(ctx);
  },
});
