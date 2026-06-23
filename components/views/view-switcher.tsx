"use client";

import { useMutation, useQuery } from "convex/react";
import { Bookmark, BookmarkPlus, Check, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DisplayMode,
  IssueFilters,
  parseSavedView,
  SavedViewPayload,
  serializeSavedView,
  toQueryString,
} from "./filters";

/** Order-insensitive payload fingerprint to highlight the active view. */
function fingerprint(payload: SavedViewPayload): string {
  return JSON.stringify({
    teamId: payload.teamId,
    display: payload.display,
    statuses: [...payload.filters.statuses].sort(),
    priorities: [...payload.filters.priorities].sort(),
    assignees: [...payload.filters.assignees].sort(),
    labels: [...payload.filters.labels].sort(),
  });
}

/**
 * Saved views: apply a view (navigates to its team board with filters),
 * save the current filters as a new view (private or shared), and delete
 * views you created.
 */
export function ViewSwitcher({
  orgSlug,
  teamId,
  display,
  filters,
}: {
  orgSlug: string;
  teamId: Id<"teams">;
  display: DisplayMode;
  filters: IssueFilters;
}) {
  const router = useRouter();
  const views = useQuery(api.views.list);
  const me = useQuery(api.users.current);
  const createView = useMutation(api.views.create);
  const removeView = useMutation(api.views.remove);

  const [saveOpen, setSaveOpen] = useState(false);
  const [name, setName] = useState("");
  const [shared, setShared] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentFingerprint = fingerprint({
    v: 1,
    teamId,
    display,
    filters,
  });

  const applyView = (view: Doc<"views">) => {
    const payload = parseSavedView(view.filters);
    if (!payload) {
      toast.error("This view is corrupted and can't be applied");
      return;
    }
    const query = toQueryString(payload.filters, payload.display);
    router.push(
      `/${orgSlug}/team/${payload.teamId}/board${query ? `?${query}` : ""}`
    );
  };

  const handleDelete = (view: Doc<"views">) => {
    removeView({ viewId: view._id })
      .then(() => toast.success(`Deleted view “${view.name}”`))
      .catch((error: unknown) => {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete view"
        );
      });
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    setSaving(true);
    try {
      await createView({
        name: trimmed,
        filters: serializeSavedView({ teamId, display, filters }),
        shared,
      });
      toast.success(`Saved view “${trimmed}”`);
      setSaveOpen(false);
      setName("");
      setShared(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save view"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 px-2 text-xs text-muted-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground"
          >
            <Bookmark className="size-3.5" />
            Views
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Saved views
          </DropdownMenuLabel>
          {views === undefined ? (
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              Loading…
            </div>
          ) : views.length === 0 ? (
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              No saved views yet. Filter the board, then save it here.
            </div>
          ) : (
            views.map((view) => {
              const payload = parseSavedView(view.filters);
              const isActive =
                payload !== null && fingerprint(payload) === currentFingerprint;
              return (
                <DropdownMenuItem
                  key={view._id}
                  onSelect={() => applyView(view)}
                  className="group/view gap-2"
                >
                  {isActive ? (
                    <Check className="size-3.5 text-primary" />
                  ) : (
                    <Bookmark className="size-3.5 text-muted-foreground" />
                  )}
                  <span className="min-w-0 flex-1 truncate">{view.name}</span>
                  {view.shared ? (
                    <Users className="size-3 text-muted-foreground" />
                  ) : null}
                  {me && view.creatorId === me._id ? (
                    <button
                      aria-label={`Delete view ${view.name}`}
                      className="rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover/view:opacity-100"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDelete(view);
                      }}
                    >
                      <Trash2 className="size-3" />
                    </button>
                  ) : null}
                </DropdownMenuItem>
              );
            })
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setSaveOpen(true)} className="gap-2">
            <BookmarkPlus className="size-3.5" />
            Save current view…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-medium">
              Save view
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="view-name" className="text-xs">
                Name
              </Label>
              <Input
                id="view-name"
                autoFocus
                placeholder="e.g. Urgent unassigned"
                value={name}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void handleSave();
                  }
                }}
                className="h-8"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <Label htmlFor="view-shared" className="text-xs">
                  Share with workspace
                </Label>
                <span className="text-xs text-muted-foreground">
                  Everyone in the org can use shared views.
                </span>
              </div>
              <Switch
                id="view-shared"
                checked={shared}
                onCheckedChange={setShared}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSaveOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!name.trim() || saving}
              onClick={() => void handleSave()}
            >
              Save view
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
