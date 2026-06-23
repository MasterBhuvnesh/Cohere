"use client";

import { useTheme } from "next-themes";
import { useParams, useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { CreateIssueDialog } from "@/components/issues/create-issue-dialog";
import { appCommands, CommandHelpers } from "./registry";

type CommandContextValue = {
  openPalette: () => void;
  openCreateIssue: () => void;
};

const CommandContext = createContext<CommandContextValue | null>(null);

export function useCommands(): CommandContextValue {
  const value = useContext(CommandContext);
  if (!value) {
    throw new Error("useCommands must be used inside CommandProvider");
  }
  return value;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}

export function CommandProvider({ children }: { children: ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [createIssueOpen, setCreateIssueOpen] = useState(false);
  const router = useRouter();
  const params = useParams<{ orgSlug?: string }>();
  const { resolvedTheme, setTheme } = useTheme();

  const helpers: CommandHelpers = useMemo(
    () => ({
      push: (path) => router.push(path),
      orgSlug: params.orgSlug ?? "",
      openCreateIssue: () => setCreateIssueOpen(true),
      toggleTheme: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
    }),
    [router, params.orgSlug, resolvedTheme, setTheme]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      if (isTypingTarget(event.target)) {
        return;
      }
      const command = appCommands.find(
        (c) => c.shortcut && c.shortcut === event.key.toLowerCase()
      );
      if (command) {
        event.preventDefault();
        command.run(helpers);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [helpers]);

  const groups = useMemo(() => {
    const byGroup = new Map<string, typeof appCommands>();
    for (const command of appCommands) {
      const list = byGroup.get(command.group) ?? [];
      list.push(command);
      byGroup.set(command.group, list);
    }
    return [...byGroup.entries()];
  }, []);

  const contextValue = useMemo(
    () => ({
      openPalette: () => setPaletteOpen(true),
      openCreateIssue: () => setCreateIssueOpen(true),
    }),
    []
  );

  const runCommand = useCallback(
    (id: string) => {
      const command = appCommands.find((c) => c.id === id);
      setPaletteOpen(false);
      command?.run(helpers);
    },
    [helpers]
  );

  return (
    <CommandContext.Provider value={contextValue}>
      {children}
      <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen}>
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {groups.map(([group, commands]) => (
            <CommandGroup key={group} heading={group}>
              {commands.map((command) => (
                <CommandItem
                  key={command.id}
                  onSelect={() => runCommand(command.id)}
                >
                  {command.icon ? <command.icon /> : null}
                  {command.label}
                  {command.shortcut ? (
                    <CommandShortcut>
                      {command.shortcut.toUpperCase()}
                    </CommandShortcut>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
      <CreateIssueDialog
        open={createIssueOpen}
        onOpenChange={setCreateIssueOpen}
      />
    </CommandContext.Provider>
  );
}
