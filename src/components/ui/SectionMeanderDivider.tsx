import SectionFillTransition from "@/components/ui/SectionFillTransition";
import type { SectionFill } from "@/lib/sectionFillTransitions";

type SectionMeanderDividerProps = {
  /** @deprecated Prefer `from` / `to` on SectionFillTransition. */
  track?: "charcoal" | "green" | "deep";
  from?: SectionFill;
  to?: SectionFill;
};

/**
 * @deprecated Use SectionFillTransition with explicit from/to fills.
 * Retained for hero→content shorthand during migration.
 */
export default function SectionMeanderDivider({
  track = "deep",
  from,
  to,
}: SectionMeanderDividerProps) {
  if (from && to) {
    return <SectionFillTransition from={from} to={to} />;
  }

  const outgoing: SectionFill =
    track === "green" ? "green" : track === "charcoal" ? "charcoal" : "hero";
  return <SectionFillTransition from={outgoing} to="deep" />;
}
