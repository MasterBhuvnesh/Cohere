import { Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";

type ActivityEntry = {
  orgId: Id<"organizations">;
  issueId: Id<"issues">;
  /** Omit for automated events and set systemActor instead. */
  actorId?: Id<"users">;
  /** Automated actor (e.g. the GitHub integration). */
  systemActor?: "github";
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
  if (!entry.actorId && !entry.systemActor) {
    throw new Error("Activity entry needs an actor");
  }
  await ctx.db.insert("activity", entry);
}
