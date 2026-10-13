/** User-facing message when a form POST fails (network vs API error). */
export function formatSubmitError(
  err: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (err instanceof TypeError) {
    return "Could not reach the server. Run npm run dev and try again.";
  }
  return err instanceof Error ? err.message : fallback;
}
