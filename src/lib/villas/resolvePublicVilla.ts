import { VILLAS as STATIC_VILLAS } from "@/data/retreats";
import { connectDB } from "@/lib/db";
import type { Villa } from "@/lib/types";
import { VillaModel } from "@/models/Villa";
import { buildPricingDisplayFromMongo } from "@/lib/villas/pricingDisplay";
import { mergePublicText } from "@/lib/villas/mergePublicFields";
import {
  directoryHiddenForMergedVilla,
  isHiddenFromVillasDirectory,
  isVillaPubliclyHidden,
  repairStaleDirectoryHideFlag,
} from "@/lib/villas/villaVisibility";
import {
  publicVillaIdForSlug,
  slugForPublicVillaId,
  villaIdentityCandidates,
} from "@/lib/villas/identity";

type MongoVilla = {
  _id?: unknown;
  slug: string;
  retreatId?: string;
  shortName?: string;
  name: string;
  type?: string;
  location?: string;
  thumbnail?: string;
  basePricePaise: number;
  dayOutBasePricePaise: number;
  stayBasePax: number;
  dayOutBasePax: number;
  stayMaxPax: number;
  bookable?: boolean;
  status?: string;
  displayStats?: Record<string, string | undefined>;
  content?: Record<string, unknown>;
  portfolioSource?: string;
  updatedAt?: Date;
  addOnAvailability?: string[];
  extraPaxStayPaise?: number;
  extraPaxDayOutPaise?: number;
  weddingVenue?: boolean;
  weddingTiers?: {
    label: string;
    maxGuests: number;
    pricePaise: number;
  }[];
  settings?: { taxPercent?: number };
};

function statsFromDoc(doc: MongoVilla) {
  const d = doc.displayStats ?? {};
  return {
    stay: d.stay ?? `Up to ${doc.stayBasePax} guests`,
    events: d.events ?? "",
    bhk: d.bhk ?? "",
    lawn: d.lawn,
    villaArea: d.villaArea,
    pool: d.pool,
  };
}

/** Dashboard Mongo record wins when rates are set; else keep static/canonical pricing. */
function mergedPricing(doc: MongoVilla, staticVilla?: Villa) {
  const hasMongoRates =
    doc.basePricePaise > 0 || doc.dayOutBasePricePaise > 0;
  if (hasMongoRates) {
    return buildPricingDisplayFromMongo(doc) as Villa["pricing"];
  }
  if (staticVilla?.pricing) {
    return staticVilla.pricing;
  }
  return buildPricingDisplayFromMongo(doc) as Villa["pricing"];
}

function operationalPricing(doc: MongoVilla, staticVilla?: Villa) {
  return mergedPricing(doc, staticVilla);
}

function shellFromMongo(doc: MongoVilla): Villa {
  const retreatId = doc.retreatId ?? doc.slug;
  const content = (doc.content ?? {}) as Partial<Villa>;
  const thumb = doc.thumbnail || content.images?.[0] || "";
  return {
    id: retreatId,
    slug: doc.slug,
    retreatId,
    name: doc.shortName ?? doc.name,
    type: doc.type ?? "",
    location: doc.location ?? "",
    description: content.description ?? "",
    image: thumb,
    images: content.images ?? (thumb ? [thumb] : []),
    stats: statsFromDoc(doc),
    perfectForTags: content.perfectForTags ?? [],
    perfectForCards: content.perfectForCards ?? [],
    amenityHighlights: content.amenityHighlights ?? [],
    categories: content.categories ?? [],
    amenities: content.amenities ?? [],
    services: content.services,
    propertyDetails: content.propertyDetails,
    spaces: content.spaces,
    activities: content.activities,
    categorizedSpaces: content.categorizedSpaces,
    pricing: operationalPricing(doc) as Villa["pricing"],
    addOnAvailability: doc.addOnAvailability ?? [],
    locationDetails: content.locationDetails,
    video: content.video,
    faq: content.faq,
    bookable: doc.bookable ?? true,
    hideFromVillasDirectory: directoryHiddenForMergedVilla(doc),
    socialProof: content.socialProof,
    brochureUrl: content.brochureUrl as string | undefined,
    brochureFilename: content.brochureFilename as string | undefined,
    portfolioSource: doc.portfolioSource ?? "custom",
  } as Villa;
}

function mergeStaticWithMongo(staticVilla: Villa, doc: MongoVilla): Villa {
  const content = (doc.content ?? {}) as Partial<Villa>;
  const retreatId = doc.retreatId ?? doc.slug;
  const thumb =
    doc.thumbnail ||
    staticVilla.image ||
    content.images?.[0] ||
    "";

  return {
    ...staticVilla,
    slug: doc.slug,
    retreatId,
    name: doc.shortName ?? doc.name ?? staticVilla.name,
    type: mergePublicText(doc.type, staticVilla.type),
    location: mergePublicText(doc.location, staticVilla.location),
    description: mergePublicText(content.description, staticVilla.description),
    image: thumb || staticVilla.image,
    images:
      content.images && content.images.length > 0
        ? content.images
        : staticVilla.images,
    stats: { ...staticVilla.stats, ...statsFromDoc(doc) },
    perfectForTags:
      content.perfectForTags && content.perfectForTags.length > 0
        ? content.perfectForTags
        : staticVilla.perfectForTags,
    perfectForCards:
      content.perfectForCards && content.perfectForCards.length > 0
        ? content.perfectForCards
        : staticVilla.perfectForCards,
    amenityHighlights:
      content.amenityHighlights && content.amenityHighlights.length > 0
        ? content.amenityHighlights
        : staticVilla.amenityHighlights,
    amenities:
      content.amenities && content.amenities.length > 0
        ? content.amenities
        : staticVilla.amenities,
    services:
      content.services && content.services.length > 0
        ? content.services
        : staticVilla.services,
    propertyDetails:
      content.propertyDetails && content.propertyDetails.length > 0
        ? content.propertyDetails
        : staticVilla.propertyDetails,
    activities:
      content.activities && content.activities.length > 0
        ? content.activities
        : staticVilla.activities,
    categorizedSpaces:
      content.categorizedSpaces && content.categorizedSpaces.length > 0
        ? content.categorizedSpaces
        : staticVilla.categorizedSpaces,
    spaces:
      content.spaces && content.spaces.length > 0
        ? content.spaces
        : staticVilla.spaces,
    pricing: operationalPricing(doc, staticVilla) as Villa["pricing"],
    addOnAvailability: doc.addOnAvailability ?? staticVilla.addOnAvailability,
    locationDetails: content.locationDetails ?? staticVilla.locationDetails,
    video:
      content.video &&
      (content.video.youtubeUrl || content.video.thumbnail)
        ? {
            ...staticVilla.video,
            ...content.video,
          }
        : staticVilla.video,
    faq:
      content.faq && content.faq.length > 0 ? content.faq : staticVilla.faq,
    bookable: doc.bookable ?? staticVilla.bookable ?? true,
    hideFromVillasDirectory: directoryHiddenForMergedVilla(doc, staticVilla),
    socialProof: mergePublicText(
      content.socialProof,
      staticVilla.socialProof,
    ) || undefined,
    categories:
      content.categories && content.categories.length > 0
        ? content.categories
        : staticVilla.categories,
    brochureUrl:
      (content.brochureUrl as string | undefined) || staticVilla.brochureUrl,
    brochureFilename:
      (content.brochureFilename as string | undefined) ||
      staticVilla.brochureFilename,
    portfolioSource: doc.portfolioSource ?? staticVilla.portfolioSource ?? "canonical",
  };
}

function staticVillaFallback(
  retreatId: string,
  staticVilla: Villa | undefined,
): Villa | null {
  if (!staticVilla) return null;
  return {
    ...staticVilla,
    slug: slugForPublicVillaId(retreatId),
    retreatId: publicVillaIdForSlug(retreatId),
  };
}

/** Resolve public villa: MongoDB overrides + static retreats fallback. */
export async function resolvePublicVilla(
  retreatId: string,
): Promise<Villa | null> {
  const publicId = publicVillaIdForSlug(retreatId);
  const slug = slugForPublicVillaId(retreatId);
  const staticVilla = STATIC_VILLAS.find(
    (v) => v.id === publicId,
  ) as Villa | undefined;
  const candidates = villaIdentityCandidates(retreatId);

  let doc: MongoVilla | null = null;
  try {
    await connectDB();
    doc = (await VillaModel.findOne({
    $or: candidates.flatMap((candidate) => [
      { retreatId: candidate },
      { slug: candidate },
    ]),
    isDeleted: false,
  }).lean()) as MongoVilla | null;
  } catch (e) {
    console.error("[resolvePublicVilla] Mongo unavailable, using static fallback", e);
    return staticVillaFallback(retreatId, staticVilla);
  }

  if (doc && isVillaPubliclyHidden(doc)) return null;
  if (doc) {
    if (repairStaleDirectoryHideFlag(doc) && doc._id) {
      void VillaModel.updateOne(
        { _id: doc._id },
        { $set: { "content.hideFromVillasDirectory": false } },
      );
    }
  }
  if (!doc && !staticVilla) return null;
  if (!doc) {
    return staticVilla
      ? {
          ...staticVilla,
          slug,
          retreatId: publicId,
        }
      : null;
  }
  if (!staticVilla) return shellFromMongo(doc);
  return mergeStaticWithMongo(staticVilla, doc);
}

function staticVillaListFallback(): Villa[] {
  return (STATIC_VILLAS as Villa[]).filter((v) => !v.hideFromVillasDirectory);
}

/** Directory list — merges all Mongo villas + static not yet in DB. */
export async function resolvePublicVillaList(): Promise<Villa[]> {
  try {
    await connectDB();
    const docs = (await VillaModel.find({ isDeleted: false }).lean()) as MongoVilla[];
    const byRetreatId = new Map<string, Villa>();
    const mongoRetreatIds = new Set<string>();

    for (const doc of docs) {
      const id = doc.retreatId ?? doc.slug;
      mongoRetreatIds.add(id);
      if (repairStaleDirectoryHideFlag(doc) && doc._id) {
        void VillaModel.updateOne(
          { _id: doc._id },
          { $set: { "content.hideFromVillasDirectory": false } },
        );
      }
      if (isHiddenFromVillasDirectory(doc)) continue;
      const staticV = STATIC_VILLAS.find((v) => v.id === id) as Villa | undefined;
      byRetreatId.set(
        id,
        staticV ? mergeStaticWithMongo(staticV, doc) : shellFromMongo(doc),
      );
    }

    for (const staticV of STATIC_VILLAS as Villa[]) {
      if (mongoRetreatIds.has(staticV.id)) continue;
      if (staticV.hideFromVillasDirectory) continue;
      byRetreatId.set(staticV.id, staticV);
    }

    return Array.from(byRetreatId.values()).filter(
      (v) => !v.hideFromVillasDirectory,
    );
  } catch (e) {
    console.error("[resolvePublicVillaList] Mongo unavailable, using static villas", e);
    return staticVillaListFallback();
  }
}
