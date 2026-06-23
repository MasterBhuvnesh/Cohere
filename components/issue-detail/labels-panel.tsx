"use client";

import { useMutation, useQuery } from "convex/react";
import { Check, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { IssueDetailSlotProps } from "@/components/issue-detail/slots";
import { LabelChip } from "@/components/shared/label-chip";
import { cn } from "@/lib/utils";

/** Linear's default label palette. */
const LABEL_COLORS = [
  "#5e6ad2",
  "#26b5ce",
  "#4cb782",
  "#f2c94c",
  "#f2994a",
  "#eb5757",
  "#bb87fc",
  "#95a2b3",
];

export function LabelsPanel({ issue }: IssueDetailSlotProps) {
  const issueLabels = useQuery(api.labels.listForIssue, {
    issueId: issue._id,
  });
  const allLabels = useQuery(api.labels.list);
  const toggleLabel = useMutation(api.labels.toggleOnIssue);
  const createLabel = useMutation(api.labels.create);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const activeIds = new Set(issueLabels?.map((label) => label._id));

  const toggle = (labelId: Id<"labels">) => {
    toggleLabel({ issueId: issue._id, labelId }).catch((error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update labels"
      );
    });
  };

  const createAndApply = async () => {
    const name = query.trim();
    if (!name) {
      return;
    }
    setQuery("");
    try {
      const color = LABEL_COLORS[(allLabels?.length ?? 0) % LABEL_COLORS.length];
      const labelId = await createLabel({ name, color });
      await toggleLabel({ issueId: issue._id, labelId });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create label"
      );
    }
  };

  const exactMatch = allLabels?.some(
    (label) => label.name.toLowerCase() === query.trim().toLowerCase()
  );

  return (
    <section className="mb-5">
      <div className="flex h-6 items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground">Labels</h3>
        <Popover
          open={open}
          onOpenChange={(value) => {
            setOpen(value);
            if (!value) {
              setQuery("");
            }
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Edit labels"
              className="size-6 text-muted-foreground"
            >
              <Plus className="size-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 p-0">
            <Command>
              <CommandInput
                placeholder="Add labels…"
                value={query}
                onValueChange={setQuery}
              />
              <CommandList>
                <CommandEmpty>No labels found.</CommandEmpty>
                <CommandGroup>
                  {allLabels?.map((label) => (
                    <CommandItem
                      key={label._id}
                      value={label.name}
                      onSelect={() => toggle(label._id)}
                    >
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="truncate">{label.name}</span>
                      <Check
                        className={cn(
                          "ml-auto size-3.5",
                          activeIds.has(label._id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
                {query.trim() && !exactMatch && (
                  <CommandGroup forceMount>
                    <CommandItem
                      forceMount
                      value={`create-${query}`}
                      onSelect={() => void createAndApply()}
                    >
                      <Plus className="size-3.5" />
                      Create label “{query.trim()}”
                    </CommandItem>
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {issueLabels && issueLabels.length > 0 ? (
        <div className="flex flex-wrap gap-1 pt-1">
          {issueLabels.map((label) => (
            <button
              key={label._id}
              type="button"
              onClick={() => toggle(label._id)}
              title="Remove label"
              className="transition-opacity hover:opacity-70"
            >
              <LabelChip name={label.name} color={label.color} />
            </button>
          ))}
        </div>
      ) : (
        <p className="pt-1 text-xs text-muted-foreground/60">No labels</p>
      )}
    </section>
  );
}
