"use client";

import { useOrganization } from "@clerk/nextjs";
import { CheckoutButton } from "@clerk/nextjs/experimental";
import { Check } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Doc } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BillingPeriod,
  ENTERPRISE_PLAN,
  PRO_PLAN,
  PlanDefinition,
  formatPrice,
  priceForPeriod,
} from "@/lib/plans";
import { cn } from "@/lib/utils";
import { BillingPeriodToggle } from "./billing-period-toggle";

/**
 * Upgrade paths from the current plan, with Clerk checkout behind custom
 * buttons. Hidden entirely on Enterprise (nothing left to upgrade to).
 */
export function UpgradeOptions({ org }: { org: Doc<"organizations"> }) {
  const [period, setPeriod] = useState<BillingPeriod>("month");

  const upgrades: PlanDefinition[] =
    org.plan === "free"
      ? [PRO_PLAN, ENTERPRISE_PLAN]
      : org.plan === "pro"
        ? [ENTERPRISE_PLAN]
        : [];

  if (upgrades.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium">Upgrade</h2>
          <p className="text-xs text-muted-foreground">
            Unlock the AI agent and remove workspace limits.
          </p>
        </div>
        <BillingPeriodToggle period={period} onPeriodChange={setPeriod} />
      </div>

      <div
        className={cn(
          "grid gap-3",
          upgrades.length > 1 && "sm:grid-cols-2"
        )}
      >
        {upgrades.map((plan) => (
          <UpgradeCard key={plan.slug} plan={plan} period={period} />
        ))}
      </div>
    </section>
  );
}

function UpgradeCard({
  plan,
  period,
}: {
  plan: PlanDefinition;
  period: BillingPeriod;
}) {
  const params = useParams<{ orgSlug: string }>();
  const { membership } = useOrganization();
  const isAdmin = membership?.role === "org:admin";

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border bg-card p-4",
        plan.popular && "border-primary/40"
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">{plan.name}</span>
        {plan.popular && (
          <Badge className="h-4 rounded-full px-1.5 text-[10px]">
            Popular
          </Badge>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-semibold tracking-tight">
          {formatPrice(priceForPeriod(plan, period))}
        </span>
        <span className="text-xs text-muted-foreground">
          / month{period === "annual" && ", billed annually"}
        </span>
      </div>
      {plan.priceNote && (
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {plan.priceNote}
        </p>
      )}

      <ul className="mt-3 flex flex-col gap-1.5">
        {plan.highlights.slice(0, 3).map((highlight) => (
          <li
            key={highlight}
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <Check className="size-3.5 shrink-0 text-primary" />
            {highlight}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex-1" />
      {isAdmin ? (
        <CheckoutButton
          planId={plan.clerkPlanId}
          planPeriod={period}
          for="organization"
          onSubscriptionComplete={() =>
            toast.success(`Welcome to ${plan.name}`)
          }
          newSubscriptionRedirectUrl={`/${params.orgSlug}/settings/billing`}
        >
          <Button
            size="sm"
            variant={plan.popular ? "default" : "outline"}
            className="w-full"
          >
            Upgrade to {plan.name}
          </Button>
        </CheckoutButton>
      ) : (
        <Button size="sm" variant="outline" className="w-full" disabled>
          Ask an admin to upgrade
        </Button>
      )}
    </div>
  );
}
