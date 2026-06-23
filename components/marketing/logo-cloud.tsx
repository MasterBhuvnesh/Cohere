import {
  Aperture,
  Hexagon,
  Landmark,
  Mountain,
  Orbit,
  Waves,
  type LucideIcon,
} from "lucide-react";

const COMPANIES: { name: string; icon: LucideIcon }[] = [
  { name: "Hexa Labs", icon: Hexagon },
  { name: "Aperture", icon: Aperture },
  { name: "Northwind", icon: Mountain },
  { name: "Tidal", icon: Waves },
  { name: "Orbital", icon: Orbit },
  { name: "Meridian", icon: Landmark },
];

export function LogoCloud() {
  return (
    <section className="border-t">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <p className="text-center font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
          Powering product teams at
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-5 md:justify-between">
          {COMPANIES.map(({ name, icon: Icon }) => (
            <span
              key={name}
              className="flex items-center gap-2 text-sm font-semibold tracking-tight text-muted-foreground/70 transition-colors hover:text-foreground"
            >
              <Icon className="size-4" strokeWidth={2.25} />
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
