import { DAY_MS } from "@/components/projects/dates";

type CycleLike = {
  number: number;
  name?: string;
  startDate: number;
  endDate: number;
};

export type CycleStatus = "current" | "upcoming" | "completed";

/** "Cycle 3" or the custom name when one is set. */
export function cycleDisplayName(cycle: CycleLike): string {
  return cycle.name ?? `Cycle ${cycle.number}`;
}

export function cycleStatus(cycle: CycleLike, now = Date.now()): CycleStatus {
  if (now < cycle.startDate) {
    return "upcoming";
  }
  if (now > cycle.endDate) {
    return "completed";
  }
  return "current";
}

export function isCurrentCycle(cycle: CycleLike, now = Date.now()): boolean {
  return cycleStatus(cycle, now) === "current";
}

export const CYCLE_STATUS_LABELS: Record<CycleStatus, string> = {
  current: "Current",
  upcoming: "Upcoming",
  completed: "Completed",
};

/** Whole days until the cycle ends (0 when it has ended). */
export function daysRemaining(cycle: CycleLike, now = Date.now()): number {
  return Math.max(0, Math.ceil((cycle.endDate - now) / DAY_MS));
}

/** Whole days until the cycle starts (0 once it has started). */
export function daysUntilStart(cycle: CycleLike, now = Date.now()): number {
  return Math.max(0, Math.ceil((cycle.startDate - now) / DAY_MS));
}
