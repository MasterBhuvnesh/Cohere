import {
  Circle,
  CircleCheck,
  CircleDashed,
  CircleDot,
  CirclePause,
  CircleX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectStatus } from "./project-meta";

const config: Record<
  ProjectStatus,
  { icon: typeof Circle; className: string }
> = {
  backlog: { icon: CircleDashed, className: "text-muted-foreground" },
  planned: { icon: Circle, className: "text-muted-foreground" },
  in_progress: { icon: CircleDot, className: "text-yellow-500" },
  paused: { icon: CirclePause, className: "text-orange-500" },
  completed: { icon: CircleCheck, className: "text-emerald-500" },
  canceled: { icon: CircleX, className: "text-muted-foreground/60" },
};

export function ProjectStatusIcon({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  const { icon: Icon, className: colorClass } = config[status];
  return <Icon className={cn("size-4 shrink-0", colorClass, className)} />;
}
