"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import {
  IssuePriority,
  IssueStatus,
  priorityLabel,
  statusLabel,
} from "@/components/shared/issue-meta";
import { PriorityIcon } from "@/components/shared/priority-icon";
import { StatusIcon } from "@/components/shared/status-icon";
import { UserAvatar } from "@/components/shared/user-avatar";

export type IssueNodeData = {
  identifier: string;
  title: string;
  status: IssueStatus;
  priority: IssuePriority;
  estimate?: number;
  assigneeName?: string;
  assigneeImageUrl?: string;
};

export type IssueFlowNode = Node<IssueNodeData, "issue">;

/**
 * Issue card node, n8n-style: header row, prominent title, and an inset
 * key/value section. Left handle = incoming, right = outgoing.
 */
export function IssueNode({ data }: NodeProps<IssueFlowNode>) {
  return (
    <div className="w-64 rounded-xl border bg-card p-2.5 shadow-sm transition-shadow hover:shadow-md">
      <Handle
        type="target"
        position={Position.Left}
        className="size-3! border-2! border-background! bg-muted-foreground!"
      />
      <div className="flex items-center gap-1.5 px-0.5">
        <StatusIcon status={data.status} />
        <span className="font-mono text-[11px] font-semibold tracking-wide">
          {data.identifier}
        </span>
        {data.assigneeName && (
          <span className="ml-auto" title={data.assigneeName}>
            <UserAvatar
              name={data.assigneeName}
              imageUrl={data.assigneeImageUrl}
            />
          </span>
        )}
      </div>
      <p className="mt-1 line-clamp-2 px-0.5 text-xs font-medium leading-snug">
        {data.title}
      </p>
      <div className="mt-2 flex flex-col gap-px overflow-hidden rounded-lg">
        <div className="flex items-center justify-between bg-muted/60 px-2 py-1 text-[11px]">
          <span className="text-muted-foreground">Status</span>
          <span className="font-medium">{statusLabel(data.status)}</span>
        </div>
        <div className="flex items-center justify-between bg-muted/60 px-2 py-1 text-[11px]">
          <span className="text-muted-foreground">Priority</span>
          <span className="flex items-center gap-1 font-medium">
            <PriorityIcon priority={data.priority} />
            {priorityLabel(data.priority)}
          </span>
        </div>
        {data.estimate !== undefined && (
          <div className="flex items-center justify-between bg-muted/60 px-2 py-1 text-[11px]">
            <span className="text-muted-foreground">Estimate</span>
            <span className="font-medium tabular-nums">
              {data.estimate} pts
            </span>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="size-3! border-2! border-background! bg-primary!"
      />
    </div>
  );
}
