"use client";

import { useAuth } from "@clerk/nextjs";

/**
 * Cosmetic plan gate for AI surfaces via Clerk's `has` check.
 * Convex (`hasAiAccess`) is the authoritative enforcement.
 */
export function useAiAccess(): { isLoaded: boolean; hasAccess: boolean } {
  const { isLoaded, has } = useAuth();
  return {
    isLoaded,
    hasAccess: isLoaded ? (has?.({ feature: "ai_agent" }) ?? false) : false,
  };
}
