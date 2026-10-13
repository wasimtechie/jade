import MeanderStrip from "@/components/ui/MeanderStrip";
import {
  resolveSectionFillMeander,
  type SectionFill,
} from "@/lib/sectionFillTransitions";

type SectionFillTransitionProps = {
  /** Outgoing section fill (upper). */
  from: SectionFill;
  /** Incoming section fill (lower). */
  to: SectionFill;
  className?: string;
};

/** Gold Greek-key band at a section background change — one per transition. */
export default function SectionFillTransition({
  from,
  to,
  className,
}: SectionFillTransitionProps) {
  const props = resolveSectionFillMeander(from, to);
  if (!props) return null;

  return (
    <MeanderStrip
      layout="fullBleed"
      track={props.track}
      accentLine={props.accentLine}
      className={className}
    />
  );
}
