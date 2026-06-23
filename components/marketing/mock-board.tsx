import { PriorityIcon } from "@/components/shared/priority-icon";
import { StatusIcon } from "@/components/shared/status-icon";
import { UserAvatar } from "@/components/shared/user-avatar";
import { BOARD_COLUMNS, type MockIssue } from "@/components/marketing/mock-data";
import { MockFrame, MockWindowBar } from "@/components/marketing/mock-window";
import { cn } from "@/lib/utils";

/** Kanban board mock for the Board & Cycles section. */
export function MockBoard({ className }: { className?: string }) {
  return (
    <MockFrame className={className}>
      <MockWindowBar title="Engineering · Board" />
      <div className="grid grid-cols-2 gap-3 bg-muted/20 p-3 lg:grid-cols-4">
        {BOARD_COLUMNS.map((column, columnIndex) => (
          <div
            key={column.label}
            className={cn(
              "space-y-2",
              // Keep the mock compact on small screens: two columns only.
              columnIndex >= 2 && "hidden lg:block"
            )}
          >
            <div className="flex items-center gap-1.5 px-1">
              <StatusIcon status={column.status} className="size-3.5" />
              <span className="text-xs font-medium">{column.label}</span>
              <span className="text-[11px] text-muted-foreground">
                {column.issues.length}
              </span>
            </div>
            {column.issues.map((issue, issueIndex) => (
              <MockBoardCard
                key={issue.id}
                issue={issue}
                // The "dragging" card sells the dnd interaction.
                dragging={columnIndex === 1 && issueIndex === 0}
              />
            ))}
            <div className="flex h-7 items-center justify-center rounded-lg border border-dashed text-[11px] text-muted-foreground/60">
              + Add issue
            </div>
          </div>
        ))}
      </div>
    </MockFrame>
  );
}

function MockBoardCard({
  issue,
  dragging,
}: {
  issue: MockIssue;
  dragging?: boolean;
}) {
  return (
    <div
      className={cn(
        "space-y-2 rounded-lg border bg-card p-2.5",
        dragging && "-rotate-2 border-ring shadow-lg shadow-black/20"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] text-muted-foreground">
          {issue.id}
        </span>
        {issue.assignee ? (
          <UserAvatar name={issue.assignee} className="size-4" />
        ) : null}
      </div>
      <p className="line-clamp-2 text-xs leading-snug font-medium">
        {issue.title}
      </p>
      <div className="flex items-center gap-1.5">
        <PriorityIcon priority={issue.priority} className="size-3" />
        {issue.label ? (
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: issue.label.color }}
          />
        ) : null}
        <span className="text-[10px] text-muted-foreground">Cycle 14</span>
      </div>
    </div>
  );
}
