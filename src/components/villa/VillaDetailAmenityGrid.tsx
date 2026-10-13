"use client";

import { ArrowRight } from "lucide-react";
import type { VillaAmenity } from "@/lib/types";
import { getVillaDetailIcon, splitAmenityLabel } from "@/lib/villaDetailIcons";
import clsx from "clsx";
import VillaDetailSection from "./VillaDetailSection";
import { VillaDetailSectionHeading } from "./VillaDetailSection";
import { VILLA_DETAIL_SPACING } from "./villaDetailSpacing";

const vd = VILLA_DETAIL_SPACING;

type Props = {
  amenities: VillaAmenity[];
  onSeeMore?: () => void;
  previewCount?: number;
  title?: string;
  showSeeMore?: boolean;
  /** When false, render grid only (for overlays without drawer). */
  wrapSection?: boolean;
  meanderBottom?: boolean;
};

export default function VillaDetailAmenityGrid({
  amenities,
  onSeeMore,
  previewCount = 8,
  title = "Amenities",
  showSeeMore = true,
  wrapSection = true,
  meanderBottom = true,
}: Props) {
  if (!amenities?.length) return null;

  const content = (
    <>
      <VillaDetailSectionHeading>{title}</VillaDetailSectionHeading>
      <div className={vd.amenitiesGrid}>
        {amenities.slice(0, previewCount).map((amenity, idx) => {
          const Icon = getVillaDetailIcon(amenity.icon);
          const { line1, line2 } = splitAmenityLabel(amenity.label);
          return (
            <div key={idx} className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#EFCD62]/70">
                <Icon className="h-5 w-5 text-[#EFCD62]" strokeWidth={1} />
              </div>
              <div className="pt-1 font-manrope text-sm leading-snug text-white">
                <span className="block">{line1}</span>
                {line2 ? <span className="block">{line2}</span> : null}
              </div>
            </div>
          );
        })}
      </div>
      {showSeeMore && amenities.length > previewCount && onSeeMore ? (
        <button
          type="button"
          onClick={onSeeMore}
          className="flex items-center gap-2 text-[#EFCD62] text-gh-label font-bold tracking-widest uppercase hover:text-white transition-colors lg:hidden"
        >
          SEE MORE <ArrowRight className="h-3 w-3" />
        </button>
      ) : null}
    </>
  );

  if (!wrapSection) return content;

  return (
    <VillaDetailSection
      id="amenities"
      variant="charcoal"
      meanderBottom={meanderBottom}
      meanderBottomAccent="green"
    >
      {content}
    </VillaDetailSection>
  );
}
