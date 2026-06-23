import { Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";

type ActivityEntry = {
  orgId: Id<"organizations">;
  issueId: Id<"issues">;
  actorId: Id<"users">;
  type: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
};

/**
 * Append an event to an issue's activity feed. All mutations that change
 * issues should call this so the feed (Track C) stays complete.
 */
export async function logActivity(
  ctx: MutationCtx,
  entry: ActivityEntry
): Promise<void> {
  await ctx.db.insert("activity", entry);
}
