/**
 * Canonical section background fills for meander placement.
 * Mirrors Wedding / Villa Detail transition rules:
 * - track matches the outgoing (upper) section
 * - accentLine="green" when entering a green section
 */
export type SectionFill =
  | "hero"
  | "cinema"
  | "deep"
  | "charcoal"
  | "green"
  | "footer";

export type SectionFillMeanderProps = {
  track: "charcoal" | "green" | "deep";
  accentLine: "green" | "none";
};

/** Returns MeanderStrip props when `from` and `to` differ; otherwise null. */
export function resolveSectionFillMeander(
  from: SectionFill,
  to: SectionFill,
): SectionFillMeanderProps | null {
  if (from === to) return null;

  const track: SectionFillMeanderProps["track"] =
    from === "green"
      ? "green"
      : from === "deep" || from === "hero" || from === "cinema"
        ? "deep"
        : "charcoal";

  const accentLine: SectionFillMeanderProps["accentLine"] =
    to === "green" ? "green" : "none";

  return { track, accentLine };
}
