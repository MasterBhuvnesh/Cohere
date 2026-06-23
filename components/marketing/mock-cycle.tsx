import { RefreshCcw } from "lucide-react";
import { CYCLE_BARS } from "@/components/marketing/mock-data";
import { cn } from "@/lib/utils";

/**
 * Compact cycle progress card: header, progress bar, scope stats, and a
 * tiny burnup chart drawn with plain divs.
 */
export function MockCycle({ className }: { className?: string }) {
  const scope = 38;
  const completed = CYCLE_BARS[CYCLE_BARS.length - 1];
  const percent = Math.round((completed / scope) * 100);
  const max = Math.max(...CYCLE_BARS);

  return (
    <div className={cn("rounded-xl border bg-card p-4 shadow-sm", className)}>
      <div className="flex items-center gap-2">
        <RefreshCcw className="size-3.5 text-muted-foreground" />
        <span className="text-sm font-medium">Cycle 14</span>
        <span className="text-xs text-muted-foreground">Jun 2 – Jun 16</span>
        <span className="ml-auto font-mono text-xs text-emerald-500">
          {percent}%
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-emerald-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-foreground/30" />
          Scope {scope}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-yellow-500" />
          Started 7
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Completed {completed}
        </span>
      </div>
      <div className="mt-4 flex h-12 items-end gap-1" aria-hidden>
        {CYCLE_BARS.map((value, index) => (
          <div
            key={index}
            className={
              index === CYCLE_BARS.length - 1
                ? "flex-1 rounded-sm bg-emerald-500"
                : "flex-1 rounded-sm bg-foreground/10"
            }
            style={{ height: `${Math.max(8, (value / max) * 100)}%` }}
          />
        ))}
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        Unfinished issues roll into Cycle 15 automatically.
      </p>
    </div>
  );
}
