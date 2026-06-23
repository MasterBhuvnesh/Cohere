"use client";

import { Badge } from "@/components/ui/badge";
import { BillingPeriod } from "@/lib/plans";
import { cn } from "@/lib/utils";

/** Segmented monthly/annual switch used on the pricing page and settings. */
export function BillingPeriodToggle({
  period,
  onPeriodChange,
  className,
}: {
  period: BillingPeriod;
  onPeriodChange: (period: BillingPeriod) => void;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Billing period"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border bg-muted/50 p-0.5",
        className
      )}
    >
      <button
        type="button"
        role="radio"
        aria-checked={period === "month"}
        onClick={() => onPeriodChange("month")}
        className={cn(
          "h-7 rounded-full px-3 text-xs font-medium text-muted-foreground transition-colors",
          period === "month" && "bg-background text-foreground shadow-sm"
        )}
      >
        Monthly
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={period === "annual"}
        onClick={() => onPeriodChange("annual")}
        className={cn(
          "flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-muted-foreground transition-colors",
          period === "annual" && "bg-background text-foreground shadow-sm"
        )}
      >
        Annual
        <Badge
          variant="secondary"
          className="h-4 rounded-full px-1.5 text-[10px] font-medium text-primary"
        >
          Save 20%
        </Badge>
      </button>
    </div>
  );
}
