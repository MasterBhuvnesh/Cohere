/**
 * Convex surfaces server-side `throw new Error("…")` messages inside a noisy
 * wrapper ("[CONVEX M(...)] ... Uncaught Error: <message> at handler ...").
 * Extract the human-readable part for toasts.
 */
export function convexErrorMessage(error: unknown, fallback: string): string {
  const raw = error instanceof Error ? error.message : String(error);
  const match = raw.match(/Uncaught Error:\s*([^\n]+)/);
  if (match) {
    return match[1].trim();
  }
  if (raw && !raw.includes("Server Error") && raw.length < 200) {
    return raw;
  }
  return fallback;
}
