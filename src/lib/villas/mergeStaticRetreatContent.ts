import { VILLAS } from "@/data/retreats";
import type { Villa } from "@/lib/types";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hasItems<T>(value: T[] | undefined | null): value is T[] {
  return Array.isArray(value) && value.length > 0;
}

function findStaticVilla(retreatId: string): Villa | undefined {
  return VILLAS.find((v) => v.id === retreatId);
}

/**
 * Fill empty Mongo `content` fields from static retreat data (same source as public pages).
 * Mongo overrides always win when they carry meaningful data.
 */
export function mergeStaticRetreatContent(
  retreatId: string,
  mongoContent: Record<string, unknown> = {},
): Record<string, unknown> {
  const staticVilla = findStaticVilla(retreatId);
  if (!staticVilla) return { ...mongoContent };

  const c = mongoContent as Partial<Villa> & {
    brochureUrl?: string;
    brochureFilename?: string;
    hideFromVillasDirectory?: boolean;
  };

  const staticVideo = staticVilla.video;
  const mongoVideo = c.video;

  return {
    ...mongoContent,
    description: isNonEmptyString(c.description)
      ? c.description
      : staticVilla.description ?? "",
    socialProof: isNonEmptyString(c.socialProof)
      ? c.socialProof
      : staticVilla.socialProof ?? "",
    categories: hasItems(c.categories)
      ? c.categories
      : staticVilla.categories ?? [],
    perfectForTags: hasItems(c.perfectForTags)
      ? c.perfectForTags
      : staticVilla.perfectForTags ?? [],
    perfectForCards: hasItems(c.perfectForCards)
      ? c.perfectForCards
      : staticVilla.perfectForCards ?? [],
    amenities: hasItems(c.amenities)
      ? c.amenities
      : staticVilla.amenities ?? [],
    activities: hasItems(c.activities)
      ? c.activities
      : staticVilla.activities ?? [],
    categorizedSpaces: hasItems(c.categorizedSpaces)
      ? c.categorizedSpaces
      : staticVilla.categorizedSpaces ?? [],
    spaces: hasItems(c.spaces) ? c.spaces : staticVilla.spaces ?? [],
    images: hasItems(c.images) ? c.images : staticVilla.images ?? [],
    services: hasItems(c.services) ? c.services : staticVilla.services ?? [],
    propertyDetails: hasItems(c.propertyDetails)
      ? c.propertyDetails
      : staticVilla.propertyDetails ?? [],
    locationDetails:
      c.locationDetails &&
      (isNonEmptyString(c.locationDetails.address) ||
        isNonEmptyString(c.locationDetails.mapImage) ||
        hasItems(c.locationDetails.nearby))
        ? c.locationDetails
        : staticVilla.locationDetails ?? c.locationDetails,
    video:
      mongoVideo &&
      (isNonEmptyString(mongoVideo.youtubeUrl) ||
        isNonEmptyString(mongoVideo.thumbnail))
        ? { ...staticVideo, ...mongoVideo }
        : staticVideo ?? mongoVideo,
    faq: hasItems(c.faq) ? c.faq : staticVilla.faq ?? [],
    hideFromVillasDirectory:
      c.hideFromVillasDirectory ?? staticVilla.hideFromVillasDirectory ?? false,
    brochureUrl: isNonEmptyString(c.brochureUrl)
      ? c.brochureUrl
      : staticVilla.brochureUrl ?? "",
    brochureFilename: isNonEmptyString(c.brochureFilename)
      ? c.brochureFilename
      : staticVilla.brochureFilename ?? "",
  };
}
