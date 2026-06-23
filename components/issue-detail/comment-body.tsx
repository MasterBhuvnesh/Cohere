"use client";

import { useMemo } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { escapeRegExp } from "@/components/issue-detail/format";

type MentionedUser = { userId: Id<"users">; name: string };

/**
 * Renders a plain-text comment body with `@Name` tokens highlighted for
 * everyone recorded in the comment's mentions.
 */
export function CommentBody({
  body,
  mentionedUsers,
}: {
  body: string;
  mentionedUsers: MentionedUser[];
}) {
  const segments = useMemo(() => {
    if (mentionedUsers.length === 0) {
      return [{ text: body, mention: false }];
    }
    // Longest names first so "@Jo Smith" wins over "@Jo".
    const names = [...new Set(mentionedUsers.map((user) => user.name))]
      .sort((a, b) => b.length - a.length)
      .map(escapeRegExp);
    const pattern = new RegExp(`@(?:${names.join("|")})`, "g");

    const parts: { text: string; mention: boolean }[] = [];
    let cursor = 0;
    for (const match of body.matchAll(pattern)) {
      const index = match.index ?? 0;
      if (index > cursor) {
        parts.push({ text: body.slice(cursor, index), mention: false });
      }
      parts.push({ text: match[0], mention: true });
      cursor = index + match[0].length;
    }
    if (cursor < body.length) {
      parts.push({ text: body.slice(cursor), mention: false });
    }
    return parts;
  }, [body, mentionedUsers]);

  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed">
      {segments.map((segment, index) =>
        segment.mention ? (
          <span
            key={index}
            className="rounded bg-primary/10 px-0.5 font-medium text-primary"
          >
            {segment.text}
          </span>
        ) : (
          <span key={index}>{segment.text}</span>
        )
      )}
    </p>
  );
}
