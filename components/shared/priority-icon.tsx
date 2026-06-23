import {
  Minus,
  SignalHigh,
  SignalLow,
  SignalMedium,
  TriangleAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IssuePriority } from "./issue-meta";

const config: Record<
  IssuePriority,
  { icon: typeof Minus; className: string }
> = {
  none: { icon: Minus, className: "text-muted-foreground/50" },
  urgent: { icon: TriangleAlert, className: "text-orange-500" },
  high: { icon: SignalHigh, className: "text-foreground" },
  medium: { icon: SignalMedium, className: "text-foreground" },
  low: { icon: SignalLow, className: "text-foreground" },
};

export function PriorityIcon({
  priority,
  className,
}: {
  priority: IssuePriority;
  className?: string;
}) {
  const { icon: Icon, className: colorClass } = config[priority];
  return <Icon className={cn("size-4 shrink-0", colorClass, className)} />;
}
