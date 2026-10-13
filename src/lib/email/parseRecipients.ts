const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Parse comma/semicolon-separated notify addresses; trim, validate, dedupe. */
export function parseRecipients(raw: string | undefined | null): string[] {
  if (!raw?.trim()) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(/[,;]+/)) {
    const email = part.trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email) || seen.has(email)) continue;
    seen.add(email);
    out.push(email);
  }
  return out;
}

/** First valid recipient (for reply-to fallback). */
export function firstRecipient(raw: string | undefined | null): string | undefined {
  return parseRecipients(raw)[0];
}
