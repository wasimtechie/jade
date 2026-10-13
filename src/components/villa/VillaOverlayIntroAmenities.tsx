"use client";

import type { VillaAmenity, VillaAmenityHighlight } from "@/lib/types";
import { amenityHighlightsFrom } from "@/lib/villaDetailData";
import VillaDetailAmenityHighlights from "./VillaDetailAmenityHighlights";

type VillaLike = {
  amenityHighlights?: VillaAmenityHighlight[];
  amenities?: VillaAmenity[];
};

type Props = {
  villa: VillaLike;
};

/** Intro amenity row — same tiles + spacing as villa detail page. */
export default function VillaOverlayIntroAmenities({ villa }: Props) {
  const highlights = villa.amenityHighlights?.length
    ? villa.amenityHighlights
    : villa.amenities?.length
      ? amenityHighlightsFrom(villa.amenities)
      : [];

  if (!highlights.length) return null;

  return <VillaDetailAmenityHighlights highlights={highlights} trackVariant="overlay" />;
}
