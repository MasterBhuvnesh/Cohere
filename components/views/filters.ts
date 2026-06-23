import { Doc, Id } from "@/convex/_generated/dataModel";
import {
  IssuePriority,
  IssueStatus,
  PRIORITIES,
  STATUSES,
} from "@/components/shared/issue-meta";

/**
 * Track A filter model. Filters live in the board URL (shareable links) and
 * are serialized to JSON for the `views` table when saved.
 */

/** Sentinel used in `assignees` to match issues with no assignee. */
export const UNASSIGNED_FILTER = "unassigned";

export type DisplayMode = "board" | "list";

export type IssueFilters = {
  statuses: IssueStatus[];
  priorities: IssuePriority[];
  /** User ids, or the {@link UNASSIGNED_FILTER} sentinel */
  assignees: string[];
  /** Label ids */
  labels: string[];
};

export const EMPTY_FILTERS: IssueFilters = {
  statuses: [],
  priorities: [],
  assignees: [],
  labels: [],
};

const STATUS_VALUES = new Set<string>(STATUSES.map((s) => s.value));
const PRIORITY_VALUES = new Set<string>(PRIORITIES.map((p) => p.value));

function parseList(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }
  return [...new Set(value.split(",").map((part) => part.trim()))].filter(
    Boolean
  );
}

function sanitizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return [
    ...new Set(value.filter((item): item is string => typeof item === "string")),
  ];
}

/** Coerce untrusted input (URL params, stored JSON) into a valid filter set. */
export function sanitizeFilters(input: unknown): IssueFilters {
  const raw = (input ?? {}) as Record<string, unknown>;
  return {
    statuses: sanitizeStringArray(raw.statuses).filter((s) =>
      STATUS_VALUES.has(s)
    ) as IssueStatus[],
    priorities: sanitizeStringArray(raw.priorities).filter((p) =>
      PRIORITY_VALUES.has(p)
    ) as IssuePriority[],
    assignees: sanitizeStringArray(raw.assignees),
    labels: sanitizeStringArray(raw.labels),
  };
}

type ParamsLike = { get(name: string): string | null };

export function filtersFromSearchParams(params: ParamsLike): IssueFilters {
  return sanitizeFilters({
    statuses: parseList(params.get("status")),
    priorities: parseList(params.get("priority")),
    assignees: parseList(params.get("assignee")),
    labels: parseList(params.get("label")),
  });
}

export function displayFromSearchParams(params: ParamsLike): DisplayMode {
  return params.get("view") === "list" ? "list" : "board";
}

/** Query string (no leading "?") encoding filters + display mode. */
export function toQueryString(
  filters: IssueFilters,
  display: DisplayMode
): string {
  const params = new URLSearchParams();
  if (display === "list") {
    params.set("view", "list");
  }
  if (filters.statuses.length > 0) {
    params.set("status", filters.statuses.join(","));
  }
  if (filters.priorities.length > 0) {
    params.set("priority", filters.priorities.join(","));
  }
  if (filters.assignees.length > 0) {
    params.set("assignee", filters.assignees.join(","));
  }
  if (filters.labels.length > 0) {
    params.set("label", filters.labels.join(","));
  }
  return params.toString();
}

export function countActiveFilters(filters: IssueFilters): number {
  return (
    filters.statuses.length +
    filters.priorities.length +
    filters.assignees.length +
    filters.labels.length
  );
}

export function issueMatchesFilters(
  issue: Doc<"issues">,
  filters: IssueFilters,
  labelIdsByIssue: Map<Id<"issues">, Set<string>>
): boolean {
  if (
    filters.statuses.length > 0 &&
    !filters.statuses.includes(issue.status)
  ) {
    return false;
  }
  if (
    filters.priorities.length > 0 &&
    !filters.priorities.includes(issue.priority)
  ) {
    return false;
  }
  if (filters.assignees.length > 0) {
    const matches = filters.assignees.some((assignee) =>
      assignee === UNASSIGNED_FILTER
        ? issue.assigneeId === undefined
        : issue.assigneeId === assignee
    );
    if (!matches) {
      return false;
    }
  }
  if (filters.labels.length > 0) {
    const labelIds = labelIdsByIssue.get(issue._id);
    if (!labelIds || !filters.labels.some((label) => labelIds.has(label))) {
      return false;
    }
  }
  return true;
}

// ── Saved view (de)serialization for the `views` table ────────────────────

export type SavedViewPayload = {
  v: 1;
  teamId: string;
  display: DisplayMode;
  filters: IssueFilters;
};

export function serializeSavedView(payload: {
  teamId: string;
  display: DisplayMode;
  filters: IssueFilters;
}): string {
  return JSON.stringify({ v: 1, ...payload } satisfies SavedViewPayload);
}

export function parseSavedView(raw: string): SavedViewPayload | null {
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    if (typeof data !== "object" || data === null) {
      return null;
    }
    if (typeof data.teamId !== "string" || data.teamId.length === 0) {
      return null;
    }
    return {
      v: 1,
      teamId: data.teamId,
      display: data.display === "list" ? "list" : "board",
      filters: sanitizeFilters(data.filters),
    };
  } catch {
    return null;
  }
}
