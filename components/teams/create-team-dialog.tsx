"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function suggestKey(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 5);
}

export function CreateTeamDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createTeam = useMutation(api.teams.create);
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [keyTouched, setKeyTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!keyTouched) {
      setKey(suggestKey(value));
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !key.trim()) {
      return;
    }
    setSubmitting(true);
    try {
      await createTeam({ name, key });
      toast.success(`Team ${name} created`);
      onOpenChange(false);
      setName("");
      setKey("");
      setKeyTouched(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create team"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create team</DialogTitle>
          <DialogDescription>
            Teams group issues with their own identifier, board, and cycles.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="team-name">Name</Label>
            <Input
              id="team-name"
              autoFocus
              placeholder="Engineering"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="team-key">Identifier</Label>
            <Input
              id="team-key"
              placeholder="ENG"
              value={key}
              maxLength={5}
              onChange={(e) => {
                setKeyTouched(true);
                setKey(e.target.value.toUpperCase());
              }}
            />
            <p className="text-xs text-muted-foreground">
              Issues will be numbered {key || "ENG"}-1, {key || "ENG"}-2, …
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!name.trim() || !key.trim() || submitting}
            onClick={() => void handleSubmit()}
          >
            Create team
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
