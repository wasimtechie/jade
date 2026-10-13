/** Property name typed in the delete dialog must match Mongo name or shortName. */
export function villaDeleteNameMatches(
  typed: string,
  villa: { name?: string; shortName?: string },
): boolean {
  const value = typed.trim();
  if (!value) return false;
  const candidates = [villa.shortName, villa.name]
    .filter((s): s is string => Boolean(s?.trim()))
    .map((s) => s.trim());
  return candidates.includes(value);
}

export function villaDeleteConfirmLabel(villa: {
  name?: string;
  shortName?: string;
}): string {
  return (villa.shortName?.trim() || villa.name?.trim() || "").trim();
}
