import { Bot } from "lucide-react";
import { AppCommand } from "@/components/commands/registry";

export const aiCommands: AppCommand[] = [
  {
    id: "open-ai-agent",
    label: "Open AI Agent",
    group: "AI",
    icon: Bot,
    shortcut: "a",
    run: ({ push, orgSlug }) => push(`/${orgSlug}/ai`),
  },
];
