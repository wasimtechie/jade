"use client";

import clsx from "clsx";
import type { VillaAmenityHighlight } from "@/lib/types";
import { getVillaDetailIcon } from "@/lib/villaDetailIcons";
import HorizontalScrollRail from "@/components/ui/HorizontalScrollRail";
import AmenityHighlightTile from "./AmenityHighlightTile";
import { VILLA_DETAIL_SPACING } from "./villaDetailSpacing";

const vd = VILLA_DETAIL_SPACING;

type Props = {
  highlights: VillaAmenityHighlight[];
  className?: string;
  /** Overlay intro rails use right-edge bleed + extra track padding. */
  trackVariant?: "detail" | "overlay";
};

export default function VillaDetailAmenityHighlights({
  highlights,
  className,
  trackVariant = "detail",
}: Props) {
  if (!highlights?.length) return null;

  const trackClass =
    trackVariant === "overlay"
      ? vd.amenityHighlightTrackOverlay
      : vd.amenityHighlightTrackFullBleed;

  return (
    <HorizontalScrollRail
      className={clsx(
        vd.amenityHighlightViewportShell,
        vd.amenityHighlightViewportEdge,
      )}
      trackClassName={clsx(trackClass, className)}
      showFade={false}
      cursorGrab
    >
      {highlights.map((amenity, idx) => {
        const Icon = getVillaDetailIcon(amenity.icon);
        return (
          <AmenityHighlightTile
            key={`${amenity.label}-${idx}`}
            icon={Icon}
            label={amenity.label}
            sublabel={amenity.sublabel}
          />
        );
      })}
    </HorizontalScrollRail>
  );
}
