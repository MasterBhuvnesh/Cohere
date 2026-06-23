import {
  CircleDashed,
  Circle,
  CircleDot,
  CircleEllipsis,
  CircleCheck,
  CircleX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IssueStatus } from "./issue-meta";

const config: Record<
  IssueStatus,
  { icon: typeof Circle; className: string }
> = {
  backlog: { icon: CircleDashed, className: "text-muted-foreground" },
  todo: { icon: Circle, className: "text-muted-foreground" },
  in_progress: { icon: CircleDot, className: "text-yellow-500" },
  in_review: { icon: CircleEllipsis, className: "text-blue-500" },
  done: { icon: CircleCheck, className: "text-emerald-500" },
  canceled: { icon: CircleX, className: "text-muted-foreground/60" },
};

export function StatusIcon({
  status,
  className,
}: {
  status: IssueStatus;
  className?: string;
}) {
  const { icon: Icon, className: colorClass } = config[status];
  return <Icon className={cn("size-4 shrink-0", colorClass, className)} />;
}
