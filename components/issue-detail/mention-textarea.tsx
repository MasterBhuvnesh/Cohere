"use client";

import { useQuery } from "convex/react";
import { useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/shared/user-avatar";
import { cn } from "@/lib/utils";

export type MentionUser = { userId: Id<"users">; name: string };

/**
 * Plain textarea with `@mention` autocomplete over the org's members.
 *
 * The parent owns the text value and a map of users that have been mentioned;
 * on submit it should keep only the mentions whose `@Name` token still
 * appears in the text (see `resolveMentions`).
 */
export function MentionTextarea({
  value,
  onChange,
  onMention,
  onSubmit,
  placeholder,
  autoFocus,
  disabled,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  /** Called when a member is picked from the autocomplete. */
  onMention: (user: MentionUser) => void;
  /** Called on Cmd/Ctrl+Enter. */
  onSubmit?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const members = useQuery(api.organizations.listMembers);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const [mentionQuery, setMentionQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const suggestions =
    mentionStart !== null && members
      ? members
          .filter(
            (member) =>
              member.name
                .toLowerCase()
                .includes(mentionQuery.toLowerCase()) ||
              member.email.toLowerCase().includes(mentionQuery.toLowerCase())
          )
          .slice(0, 6)
      : [];
  const open = mentionStart !== null && suggestions.length > 0;

  /** Re-derive the active "@query" fragment from the caret position. */
  const syncMentionContext = (text: string, caret: number) => {
    const before = text.slice(0, caret);
    const match = /(?:^|\s)@([\w-]{0,30})$/.exec(before);
    if (match) {
      setMentionStart(caret - match[1].length - 1);
      setMentionQuery(match[1]);
      setActiveIndex(0);
    } else {
      setMentionStart(null);
      setMentionQuery("");
    }
  };

  const selectMember = (member: { userId: Id<"users">; name: string }) => {
    if (mentionStart === null) {
      return;
    }
    const caret = mentionStart + 1 + mentionQuery.length;
    const next = `${value.slice(0, mentionStart)}@${member.name} ${value.slice(
      caret
    )}`;
    onChange(next);
    onMention({ userId: member.userId, name: member.name });
    setMentionStart(null);
    setMentionQuery("");
    // Restore the caret right after the inserted mention.
    const position = mentionStart + member.name.length + 2;
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(position, position);
      }
    });
  };

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        disabled={disabled}
        autoFocus={autoFocus}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          syncMentionContext(e.target.value, e.target.selectionStart ?? 0);
        }}
        onClick={(e) =>
          syncMentionContext(value, e.currentTarget.selectionStart ?? 0)
        }
        onBlur={() => {
          // Delay so clicking a suggestion (mousedown) wins over blur.
          setTimeout(() => setMentionStart(null), 150);
        }}
        onKeyDown={(e) => {
          if (open) {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((index) => (index + 1) % suggestions.length);
              return;
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex(
                (index) =>
                  (index - 1 + suggestions.length) % suggestions.length
              );
              return;
            }
            if (e.key === "Enter" || e.key === "Tab") {
              e.preventDefault();
              selectMember(suggestions[activeIndex]);
              return;
            }
            if (e.key === "Escape") {
              e.preventDefault();
              setMentionStart(null);
              return;
            }
          }
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            onSubmit?.();
          }
        }}
        className={cn(
          "min-h-16 resize-none border-none px-0 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent",
          className
        )}
      />
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-64 overflow-hidden rounded-md border bg-popover p-1 shadow-md">
          {suggestions.map((member, index) => (
            <button
              key={member.userId}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                selectMember(member);
              }}
              onMouseEnter={() => setActiveIndex(index)}
              className={cn(
                "flex h-8 w-full items-center gap-2 rounded-sm px-2 text-left text-sm",
                index === activeIndex && "bg-accent text-accent-foreground"
              )}
            >
              <UserAvatar name={member.name} imageUrl={member.imageUrl} />
              <span className="truncate">{member.name}</span>
              <span className="ml-auto truncate text-xs text-muted-foreground">
                {member.email}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Keep only the tracked mentions whose `@Name` token survived editing. */
export function resolveMentions(
  body: string,
  tracked: Map<Id<"users">, string>
): Id<"users">[] {
  const mentions: Id<"users">[] = [];
  for (const [userId, name] of tracked) {
    if (body.includes(`@${name}`)) {
      mentions.push(userId);
    }
  }
  return mentions;
}
