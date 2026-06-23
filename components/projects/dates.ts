/** Date helpers shared by the projects & cycles UI (Track B). */

export const DAY_MS = 86_400_000;

export function formatDay(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function formatDayWithYear(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateRange(start: number, end: number): string {
  const endsThisYear =
    new Date(end).getFullYear() === new Date().getFullYear();
  return `${formatDay(start)} – ${endsThisYear ? formatDay(end) : formatDayWithYear(end)}`;
}

/** ms since epoch → "yyyy-mm-dd" in the local timezone (for <input type="date">). */
export function msToInputDate(ms: number): string {
  const date = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** "yyyy-mm-dd" → local-midnight ms (or local end-of-day for range ends). */
export function inputDateToMs(
  value: string,
  boundary: "start" | "end" = "start"
): number | undefined {
  if (!value) {
    return undefined;
  }
  const time = boundary === "end" ? "T23:59:59.999" : "T00:00:00";
  const ms = new Date(`${value}${time}`).getTime();
  return Number.isNaN(ms) ? undefined : ms;
}
