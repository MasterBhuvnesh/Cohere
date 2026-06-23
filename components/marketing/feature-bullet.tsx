import type { LucideIcon } from "lucide-react";

/** Icon + title + description bullet used in the feature sections. */
export function FeatureBullet({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3.5">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border bg-muted/50">
        <Icon className="size-3.5 text-foreground/80" />
      </span>
      <div>
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
