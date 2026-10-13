"use client";

import { ArrowRight } from "lucide-react";
import type { Villa } from "@/lib/types";
import VillaDetailSection from "./VillaDetailSection";
import { VillaDetailSectionHeading } from "./VillaDetailSection";

type PropertyDetail = NonNullable<Villa["propertyDetails"]>[number];

type Props = {
  items: PropertyDetail[];
  onSeeMore: () => void;
  previewCount?: number;
};

export default function VillaDetailPropertyDetailsList({
  items,
  onSeeMore,
  previewCount = 4,
}: Props) {
  if (!items?.length) return null;

  const preview = items.slice(0, previewCount);

  return (
    <VillaDetailSection id="details" variant="charcoal">
      <VillaDetailSectionHeading>Property Details</VillaDetailSectionHeading>
      <div className="flex flex-col gap-6">
        {preview.map((detail, idx) => (
          <div key={idx} className="flex gap-3">
            <span
              className="mt-2 w-1.5 h-1.5 rotate-45 bg-[#EFCD62] flex-shrink-0 block"
              aria-hidden
            />
            <div>
              <h4 className="text-gh-body text-white font-manrope font-semibold mb-2">
                {detail.label ?? detail.title}
              </h4>
              <p className="text-white/60 text-gh-body leading-relaxed">
                {detail.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      {items.length > previewCount ? (
        <button
          type="button"
          onClick={onSeeMore}
          className="flex items-center gap-2 text-[#EFCD62] text-gh-label font-bold tracking-widest uppercase hover:text-white transition-colors"
        >
          SEE MORE <ArrowRight className="w-3 h-3" />
        </button>
      ) : null}
    </VillaDetailSection>
  );
}
