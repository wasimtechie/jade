"use client";

import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import { splitAmenityLabel } from "@/lib/villaDetailIcons";
import HorizontalScrollRail from "@/components/ui/HorizontalScrollRail";
import AmenityHighlightTile from "./AmenityHighlightTile";
import { VILLA_DETAIL_SPACING } from "./villaDetailSpacing";

const vd = VILLA_DETAIL_SPACING;

type AmenityLike = { icon?: string; label?: string };

type Props = {
  amenities: AmenityLike[];
  getIcon: (iconName?: string, title?: string) => LucideIcon;
};

export default function OverlayIntroAmenityHighlights({
  amenities,
  getIcon,
}: Props) {
  if (!amenities?.length) return null;

  return (
    <HorizontalScrollRail
      className={clsx(
        vd.amenityHighlightViewportShell,
        vd.amenityHighlightViewportEdge,
      )}
      trackClassName={vd.amenityHighlightTrackFullBleed}
      showFade={false}
      cursorGrab
    >
      {amenities.map((amenity, idx) => {
        const IconComponent = getIcon(amenity.icon, amenity.label);
        const { line1, line2 } = splitAmenityLabel(amenity.label ?? "");
        return (
          <AmenityHighlightTile
            key={idx}
            icon={IconComponent}
            label={line1}
            sublabel={line2 || null}
          />
        );
      })}
    </HorizontalScrollRail>
  );
}
