import { CreditCard, Sparkles, Users } from "lucide-react";
import type { AppCommand } from "@/components/commands/registry";

/** Track E command-palette entries (billing + members settings). */
export const billingCommands: AppCommand[] = [
  {
    id: "go-billing-settings",
    label: "Go to billing settings",
    group: "Settings",
    icon: CreditCard,
    run: ({ push, orgSlug }) => push(`/${orgSlug}/settings/billing`),
  },
  {
    id: "go-members-settings",
    label: "Go to members settings",
    group: "Settings",
    icon: Users,
    run: ({ push, orgSlug }) => push(`/${orgSlug}/settings/members`),
  },
  {
    id: "upgrade-plan",
    label: "Upgrade plan",
    group: "Settings",
    icon: Sparkles,
    run: ({ push, orgSlug }) => push(`/${orgSlug}/settings/billing`),
  },
];
