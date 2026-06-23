"use client";

import { useMutation, useQuery } from "convex/react";
import { Plus, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDeferredValue, useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IssueDetailSlotProps } from "@/components/issue-detail/slots";
import { StatusIcon } from "@/components/shared/status-icon";

type StoredRelationType = Doc<"issueRelations">["type"];
type DisplayRelationType = StoredRelationType | "duplicated_by";

const RELATION_OPTIONS: { value: StoredRelationType; label: string }[] = [
  { value: "blocks", label: "Blocks" },
  { value: "blocked_by", label: "Blocked by" },
  { value: "related", label: "Related to" },
  { value: "duplicate_of", label: "Duplicate of" },
];

const GROUP_ORDER: { type: DisplayRelationType; label: string }[] = [
  { type: "blocked_by", label: "Blocked by" },
  { type: "blocks", label: "Blocks" },
  { type: "duplicate_of", label: "Duplicate of" },
  { type: "duplicated_by", label: "Duplicated by" },
  { type: "related", label: "Related to" },
];

export function RelationsPanel({ issue }: IssueDetailSlotProps) {
  const params = useParams<{ orgSlug: string }>();
  const relations = useQuery(api.issueRelations.listForIssue, {
    issueId: issue._id,
  });
  const createRelation = useMutation(api.issueRelations.create);
  const removeRelation = useMutation(api.issueRelations.remove);

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<StoredRelationType>("blocks");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const candidates = useQuery(
    api.issueRelations.searchIssues,
    open ? { query: deferredQuery, excludeIssueId: issue._id } : "skip"
  );

  const linkIssue = async (relatedIssueId: Doc<"issues">["_id"]) => {
    setOpen(false);
    setQuery("");
    try {
      await createRelation({ issueId: issue._id, relatedIssueId, type });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to link issues"
      );
    }
  };

  const unlink = (relationId: Doc<"issueRelations">["_id"]) => {
    removeRelation({ relationId }).catch((error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove relation"
      );
    });
  };

  return (
    <section className="mb-5">
      <div className="flex h-6 items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground">
          Relations
        </h3>
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
              aria-label="Add relation"
              className="size-6 text-muted-foreground"
            >
              <Plus className="size-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 p-0">
            <div className="border-b p-2">
              <Select
                value={type}
                onValueChange={(value) =>
                  setType(value as StoredRelationType)
                }
              >
                <SelectTrigger size="sm" className="h-7 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RELATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search issues…"
                value={query}
                onValueChange={setQuery}
              />
              <CommandList>
                <CommandEmpty>
                  {candidates === undefined ? "Searching…" : "No issues found."}
                </CommandEmpty>
                {candidates?.map((candidate) => (
                  <CommandItem
                    key={candidate._id}
                    value={candidate._id}
                    onSelect={() => void linkIssue(candidate._id)}
                  >
                    <StatusIcon status={candidate.status} />
                    <span className="font-mono text-xs text-muted-foreground">
                      {candidate.identifier}
                    </span>
                    <span className="truncate">{candidate.title}</span>
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {relations && relations.length > 0 ? (
        <div className="flex flex-col gap-2 pt-1">
          {GROUP_ORDER.map(({ type: groupType, label }) => {
            const group = relations.filter(
              (relation) => relation.type === groupType
            );
            if (group.length === 0) {
              return null;
            }
            return (
              <div key={groupType}>
                <p className="pb-0.5 text-[11px] text-muted-foreground/70">
                  {label}
                </p>
                {group.map((relation) => (
                  <div
                    key={relation.relationId}
                    className="group -mx-1 flex h-7 items-center gap-1.5 rounded-md px-1 text-xs transition-colors hover:bg-accent/50"
                  >
                    <StatusIcon
                      status={relation.issue.status}
                      className="size-3.5"
                    />
                    <Link
                      href={`/${params.orgSlug}/issue/${relation.issue._id}`}
                      className="flex min-w-0 flex-1 items-center gap-1.5"
                    >
                      <span className="shrink-0 font-mono text-muted-foreground">
                        {relation.issue.identifier}
                      </span>
                      <span className="truncate">{relation.issue.title}</span>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => unlink(relation.relationId)}
                      aria-label="Remove relation"
                      className="size-5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="pt-1 text-xs text-muted-foreground/60">No relations</p>
      )}
    </section>
  );
}
