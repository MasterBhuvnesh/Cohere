import { cn } from "@/lib/utils";

/**
 * Shared marketing section scaffolding: consistent container width,
 * vertical rhythm, and the eyebrow/title/lede heading pattern.
 */
export function Section({
  id,
  className,
  containerClassName,
  children,
}: {
  id?: string;
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("relative border-t", className)}>
      <div
        className={cn(
          "mx-auto w-full max-w-6xl px-6 py-20 md:py-28",
          containerClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "left",
  className,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex max-w-2xl flex-col gap-4",
        align === "center" && "mx-auto items-center text-center",
        className
      )}
    >
      <p className="font-mono text-[11px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
        {title}
      </h2>
      {lede ? (
        <p className="text-base text-balance text-muted-foreground md:text-lg">
          {lede}
        </p>
      ) : null}
    </div>
  );
}
