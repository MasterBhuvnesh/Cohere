"use client";

import usePresence from "@convex-dev/presence/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IssueDetailSlotProps } from "@/components/issue-detail/slots";
import { UserAvatar } from "@/components/shared/user-avatar";

const MAX_FACES = 5;

/** Live "who's viewing this issue" facepile, backed by @convex-dev/presence. */
export function PresencePanel({ issue }: IssueDetailSlotProps) {
  const currentUser = useQuery(api.users.current);
  if (!currentUser) {
    return null;
  }
  return <PresenceFacepile roomId={issue._id} userId={currentUser._id} />;
}

function PresenceFacepile({
  roomId,
  userId,
}: {
  roomId: string;
  userId: string;
}) {
  const presenceState = usePresence(api.presenceFns, roomId, userId);
  const online = (presenceState ?? []).filter((entry) => entry.online);

  if (online.length === 0) {
    return null;
  }

  const visible = online.slice(0, MAX_FACES);
  const overflow = online.length - visible.length;

  return (
    <section className="mb-5">
      <h3 className="flex h-6 items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        Viewing now
      </h3>
      <TooltipProvider>
        <div className="flex items-center pt-1">
          <div className="flex -space-x-1.5">
            {visible.map((entry) => (
              <Tooltip key={entry.userId}>
                <TooltipTrigger asChild>
                  <span className="inline-flex rounded-full ring-2 ring-background">
                    <UserAvatar
                      name={entry.name ?? "Member"}
                      imageUrl={entry.image}
                      className="size-6"
                    />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {entry.name ?? "Member"}
                  {entry.userId === userId ? " (you)" : ""}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
          {overflow > 0 && (
            <span className="pl-2 text-xs text-muted-foreground">
              +{overflow}
            </span>
          )}
        </div>
      </TooltipProvider>
    </section>
  );
}
