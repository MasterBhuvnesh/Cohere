import { Doc } from "@/convex/_generated/dataModel";

export type IssueStatus = Doc<"issues">["status"];
export type IssuePriority = Doc<"issues">["priority"];

export const STATUSES: { value: IssueStatus; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "Todo" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "done", label: "Done" },
  { value: "canceled", label: "Canceled" },
];

export const PRIORITIES: { value: IssuePriority; label: string }[] = [
  { value: "none", label: "No priority" },
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export function statusLabel(status: IssueStatus): string {
  return STATUSES.find((s) => s.value === status)?.label ?? status;
}

export function priorityLabel(priority: IssuePriority): string {
  return PRIORITIES.find((p) => p.value === priority)?.label ?? priority;
}
