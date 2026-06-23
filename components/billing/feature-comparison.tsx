import { Check, Minus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { COMPARISON_SECTIONS, ComparisonValue, PLANS } from "@/lib/plans";
import { cn } from "@/lib/utils";

function ValueCell({ value }: { value: ComparisonValue }) {
  if (value === true) {
    return <Check className="mx-auto size-4 text-primary" aria-label="Included" />;
  }
  if (value === false) {
    return (
      <Minus
        className="mx-auto size-4 text-muted-foreground/40"
        aria-label="Not included"
      />
    );
  }
  return <span className="text-xs text-foreground">{value}</span>;
}

/** Full plan-by-plan feature matrix rendered below the pricing cards. */
export function FeatureComparison() {
  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-2/5 px-4 text-xs">
              Compare plans
            </TableHead>
            {PLANS.map((plan) => (
              <TableHead
                key={plan.slug}
                className={cn(
                  "text-center text-xs font-semibold",
                  plan.popular && "text-primary"
                )}
              >
                {plan.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {COMPARISON_SECTIONS.map((section) => (
            <SectionRows key={section.title} section={section} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SectionRows({
  section,
}: {
  section: (typeof COMPARISON_SECTIONS)[number];
}) {
  return (
    <>
      <TableRow className="bg-muted/40 hover:bg-muted/40">
        <TableCell
          colSpan={PLANS.length + 1}
          className="px-4 py-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase"
        >
          {section.title}
        </TableCell>
      </TableRow>
      {section.rows.map((row) => (
        <TableRow key={row.label} className="hover:bg-muted/20">
          <TableCell className="px-4 py-2.5 text-xs text-muted-foreground">
            {row.label}
          </TableCell>
          {row.values.map((value, index) => (
            <TableCell key={index} className="py-2.5 text-center">
              <ValueCell value={value} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
