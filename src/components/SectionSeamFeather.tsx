"use client";

import { sectionSeamFeatherGreen } from "@/lib/jadeSectionColors";

/**
 * Section seam feather (mobile) — green bloom on the 12vh band below the split-hero
 * image so it matches the desktop hero scrim tail (no charcoal wash on the seam).
 */
export default function SectionSeamFeather() {
  return (
    <div
      className="md:hidden absolute inset-x-0 bottom-0 h-[12vh] z-[8] pointer-events-none"
      aria-hidden
      style={{ background: sectionSeamFeatherGreen() }}
    />
  );
}
