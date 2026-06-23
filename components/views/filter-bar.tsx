"use client";

import { CircleDashed, SignalHigh, Tag, User, X } from "lucide-react";
import { ReactNode } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PRIORITIES,
  STATUSES,
} from "@/components/shared/issue-meta";
import { PriorityIcon } from "@/components/shared/priority-icon";
import { StatusIcon } from "@/components/shared/status-icon";
import { UserAvatar } from "@/components/shared/user-avatar";
import { cn } from "@/lib/utils";
import {
  countActiveFilters,
  IssueFilters,
  UNASSIGNED_FILTER,
} from "./filters";

export type OrgMember = {
  userId: string;
  name: string;
  imageUrl?: string;
};

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function FilterMenu({
  label,
  icon,
  activeCount,
  children,
}: {
  label: string;
  icon: ReactNode;
  activeCount: number;
  children: ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 gap-1.5 px-2 text-xs text-muted-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground",
            activeCount > 0 && "text-foreground"
          )}
        >
          {icon}
          {label}
          {activeCount > 0 ? (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/15 px-1 font-mono text-[10px] text-primary">
              {activeCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Linear-style filter toolbar: multi-select status / priority / assignee /
 * label filters, with a clear button when anything is active.
 */
export function FilterBar({
  filters,
  onFiltersChange,
  members,
  labels,
}: {
  filters: IssueFilters;
  onFiltersChange: (filters: IssueFilters) => void;
  members: OrgMember[];
  labels: Doc<"labels">[];
}) {
  const activeCount = countActiveFilters(filters);

  return (
    <div className="flex flex-wrap items-center gap-1">
      <FilterMenu
        label="Status"
        icon={<CircleDashed className="size-3.5" />}
        activeCount={filters.statuses.length}
      >
        {STATUSES.map((status) => (
          <DropdownMenuCheckboxItem
            key={status.value}
            checked={filters.statuses.includes(status.value)}
            onCheckedChange={() =>
              onFiltersChange({
                ...filters,
                statuses: toggleValue(filters.statuses, status.value),
              })
            }
            onSelect={(event) => event.preventDefault()}
          >
            <StatusIcon status={status.value} className="size-3.5" />
            {status.label}
          </DropdownMenuCheckboxItem>
        ))}
      </FilterMenu>

      <FilterMenu
        label="Priority"
        icon={<SignalHigh className="size-3.5" />}
        activeCount={filters.priorities.length}
      >
        {PRIORITIES.map((priority) => (
          <DropdownMenuCheckboxItem
            key={priority.value}
            checked={filters.priorities.includes(priority.value)}
            onCheckedChange={() =>
              onFiltersChange({
                ...filters,
                priorities: toggleValue(filters.priorities, priority.value),
              })
            }
            onSelect={(event) => event.preventDefault()}
          >
            <PriorityIcon priority={priority.value} className="size-3.5" />
            {priority.label}
          </DropdownMenuCheckboxItem>
        ))}
      </FilterMenu>

      <FilterMenu
        label="Assignee"
        icon={<User className="size-3.5" />}
        activeCount={filters.assignees.length}
      >
        <DropdownMenuCheckboxItem
          checked={filters.assignees.includes(UNASSIGNED_FILTER)}
          onCheckedChange={() =>
            onFiltersChange({
              ...filters,
              assignees: toggleValue(filters.assignees, UNASSIGNED_FILTER),
            })
          }
          onSelect={(event) => event.preventDefault()}
        >
          <span className="size-4 rounded-full border border-dashed border-muted-foreground/40" />
          Unassigned
        </DropdownMenuCheckboxItem>
        {members.length > 0 ? <DropdownMenuSeparator /> : null}
        {members.map((member) => (
          <DropdownMenuCheckboxItem
            key={member.userId}
            checked={filters.assignees.includes(member.userId)}
            onCheckedChange={() =>
              onFiltersChange({
                ...filters,
                assignees: toggleValue(filters.assignees, member.userId),
              })
            }
            onSelect={(event) => event.preventDefault()}
          >
            <UserAvatar
              name={member.name}
              imageUrl={member.imageUrl}
              className="size-4"
            />
            <span className="truncate">{member.name}</span>
          </DropdownMenuCheckboxItem>
        ))}
      </FilterMenu>

      <FilterMenu
        label="Labels"
        icon={<Tag className="size-3.5" />}
        activeCount={filters.labels.length}
      >
        {labels.length === 0 ? (
          <div className="px-2 py-1.5 text-xs text-muted-foreground">
            No labels in this workspace yet.
          </div>
        ) : (
          labels.map((label) => (
            <DropdownMenuCheckboxItem
              key={label._id}
              checked={filters.labels.includes(label._id)}
              onCheckedChange={() =>
                onFiltersChange({
                  ...filters,
                  labels: toggleValue(filters.labels, label._id),
                })
              }
              onSelect={(event) => event.preventDefault()}
            >
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: label.color }}
              />
              {label.name}
            </DropdownMenuCheckboxItem>
          ))
        )}
      </FilterMenu>

      {activeCount > 0 ? (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs text-muted-foreground"
          onClick={() =>
            onFiltersChange({
              statuses: [],
              priorities: [],
              assignees: [],
              labels: [],
            })
          }
        >
          <X className="size-3.5" />
          Clear
        </Button>
      ) : null}
    </div>
  );
}
