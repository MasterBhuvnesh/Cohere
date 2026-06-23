"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { inputDateToMs, msToInputDate } from "@/components/projects/dates";

/**
 * Edit a cycle's name and dates. Mount this only while open so local state
 * initializes from the latest cycle document.
 */
export function EditCycleDialog({
  cycle,
  open,
  onOpenChange,
}: {
  cycle: Doc<"cycles">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateCycle = useMutation(api.cycles.update);

  const [name, setName] = useState(cycle.name ?? "");
  const [start, setStart] = useState(() => msToInputDate(cycle.startDate));
  const [end, setEnd] = useState(() => msToInputDate(cycle.endDate));
  const [submitting, setSubmitting] = useState(false);

  const startMs = inputDateToMs(start);
  const endMs = inputDateToMs(end, "end");
  const datesValid =
    startMs !== undefined && endMs !== undefined && endMs > startMs;

  const handleSubmit = async () => {
    if (!datesValid) {
      return;
    }
    setSubmitting(true);
    try {
      await updateCycle({
        cycleId: cycle._id,
        name: name.trim() || null,
        startDate: startMs,
        endDate: endMs,
      });
      toast.success("Cycle updated");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update cycle"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium text-muted-foreground">
            Edit cycle {cycle.number}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Input
            autoFocus
            placeholder={`Cycle ${cycle.number}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                void handleSubmit();
              }
            }}
            className="border-none px-0 text-lg font-medium shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Start</Label>
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                aria-label="Start date"
                className="h-8 rounded-md border bg-transparent px-2 text-xs text-foreground outline-none [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">End</Label>
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                aria-label="End date"
                className="h-8 rounded-md border bg-transparent px-2 text-xs text-foreground outline-none [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
          </div>
          {!datesValid && (
            <p className="text-xs text-destructive">
              End date must be after the start date.
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!datesValid || submitting}
            onClick={() => void handleSubmit()}
          >
            Save changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
