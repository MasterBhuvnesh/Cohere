import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CYCLE_STATUS_LABELS, CycleStatus } from "./cycle-meta";

const styles: Record<CycleStatus, string> = {
  current: "border-emerald-500/30 text-emerald-500",
  upcoming: "border-blue-500/30 text-blue-500",
  completed: "border-border text-muted-foreground",
};

export function CycleStatusBadge({
  status,
  className,
}: {
  status: CycleStatus;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn(styles[status], className)}>
      {CYCLE_STATUS_LABELS[status]}
    </Badge>
  );
}
