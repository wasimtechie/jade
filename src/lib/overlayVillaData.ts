import { CORPORATE_VILLAS_OVERLAY_DATA } from "@/data/overlays_data/corporate/villas/index";
import { PARTY_VILLAS_OVERLAY_DATA } from "@/data/overlays_data/party/villas";
import { WEDDING_VILLAS_OVERLAY_DATA } from "@/data/overlays_data/wedding/villas/index";
import { VILLAS } from "@/lib/mockData";
import type { Villa, VillaAmenity, VillaAmenityHighlight } from "@/lib/types";
import { amenityHighlightsFrom } from "@/lib/villaDetailData";
import {
  onwardsLabelForPage,
  resolveCanonicalForRetreat,
} from "@/lib/villas/canonicalOverlayHelpers";
import { buildPricingDisplay } from "@/lib/villas/pricingDisplay";

export type OverlayPageKey = "wedding" | "weekend" | "corporate" | "party";

const MAP = {
  wedding: WEDDING_VILLAS_OVERLAY_DATA,
  weekend: {} as const,
  corporate: CORPORATE_VILLAS_OVERLAY_DATA,
  party: PARTY_VILLAS_OVERLAY_DATA,
} as const;

type OverlayMarketing = {
  id?: string;
  description?: string;
  perfectForTags?: string[];
  categories?: string[];
  type?: string;
  overlay?: { parking?: string; onwardsPrice?: string };
};

type OverlayVillaLike = {
  id?: string;
  amenities?: VillaAmenity[];
  amenityHighlights?: VillaAmenityHighlight[];
};

/** Keep overlay amenity tiles aligned with retreat source records. */
export function syncOverlayAmenityFields<T extends OverlayVillaLike>(
  overlayVilla: T,
): T {
  const retreat = VILLAS.find((villa) => villa.id === overlayVilla.id);
  if (!retreat) return overlayVilla;

  const amenities =
    overlayVilla.amenities?.length ? overlayVilla.amenities : retreat.amenities;
  const amenityHighlights = overlayVilla.amenityHighlights?.length
    ? overlayVilla.amenityHighlights
    : retreat.amenityHighlights?.length
      ? retreat.amenityHighlights
      : amenityHighlightsFrom(amenities ?? []);

  return {
    ...overlayVilla,
    amenities,
    amenityHighlights,
  };
}

function mergeExperienceOverlay(
  page: OverlayPageKey,
  villaId: string,
): Villa | null {
  const enriched = VILLAS.find((v) => v.id === villaId);
  if (!enriched) return null;

  const marketing = (MAP as Record<string, Record<string, OverlayMarketing>>)[
    page
  ]?.[villaId];
  const canonical = resolveCanonicalForRetreat(villaId);

  const onwardsPrice =
    marketing?.overlay?.onwardsPrice ??
    (canonical ? onwardsLabelForPage(page, canonical) : undefined);

  const pricing = canonical
    ? buildPricingDisplay(canonical)
    : enriched.pricing;

  const stats = canonical?.stats
    ? { ...enriched.stats, ...canonical.stats }
    : enriched.stats;

  return syncOverlayAmenityFields({
    ...enriched,
    ...(marketing?.description ? { description: marketing.description } : {}),
    ...(marketing?.perfectForTags
      ? { perfectForTags: marketing.perfectForTags }
      : {}),
    ...(marketing?.categories ? { categories: marketing.categories } : {}),
    ...(marketing?.type ? { type: marketing.type } : {}),
    stats,
    pricing,
    overlay: {
      ...(marketing?.overlay ?? {}),
      ...(onwardsPrice ? { onwardsPrice } : {}),
    },
  } as Villa & { overlay?: { onwardsPrice?: string; parking?: string } });
}

export function getOverlayVillaData(page: OverlayPageKey, villaId?: string) {
  if (!villaId) return null;
  return mergeExperienceOverlay(page, villaId);
}
