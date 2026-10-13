import portfolio from "@/data/villas/canonical-portfolio.json";
import { rupeesToPaise } from "@/lib/money";

export type PortfolioSource = "canonical" | "legacy" | "coming_soon";

export type WeddingTierDef = {
  id: string;
  label: string;
  mode: string;
  maxGuests: number;
  priceRupees: number;
  stayIncludedPax: number;
};

export type CanonicalVilla = {
  slug: string;
  retreatId: string;
  name: string;
  shortName: string;
  type: string;
  location: string;
  thumbnail: string;
  basePriceRupees: number;
  dayOutBasePriceRupees: number;
  stayBasePax: number;
  dayOutBasePax: number;
  stayMaxPax: number;
  extraPaxStayRupees: number;
  extraPaxDayOutRupees: number;
  weddingVenue: boolean;
  bookable: boolean;
  status: "active" | "maintenance" | "hidden";
  portfolioSource: PortfolioSource;
  stats: Record<string, string | undefined>;
  weddingTiers: WeddingTierDef[];
  addOnAvailability?: string[];
};

export const CANONICAL_VILLAS = portfolio.villas as unknown as CanonicalVilla[];

export const CANONICAL_BY_SLUG = new Map(
  CANONICAL_VILLAS.map((v) => [v.slug, v]),
);

export const CANONICAL_BY_RETREAT_ID = new Map(
  CANONICAL_VILLAS.map((v) => [v.retreatId, v]),
);

export function slugForRetreatId(retreatId: string): string | undefined {
  return CANONICAL_BY_RETREAT_ID.get(retreatId)?.slug;
}

export function retreatIdForSlug(slug: string): string | undefined {
  return CANONICAL_BY_SLUG.get(slug)?.retreatId;
}

export function seedDocFromCanonical(v: CanonicalVilla) {
  const hasPricing = v.basePriceRupees > 0;
  return {
    slug: v.slug,
    name: v.name,
    basePricePaise: hasPricing ? rupeesToPaise(v.basePriceRupees) : 0,
    dayOutBasePricePaise: hasPricing
      ? rupeesToPaise(v.dayOutBasePriceRupees)
      : 0,
    stayBasePax: v.stayBasePax,
    dayOutBasePax: v.dayOutBasePax,
    stayMaxPax: v.stayMaxPax,
    extraPaxStayPaise: rupeesToPaise(v.extraPaxStayRupees),
    extraPaxDayOutPaise: rupeesToPaise(v.extraPaxDayOutRupees),
    weddingVenue: v.weddingVenue,
    weddingTiers: v.weddingTiers.map((t) => ({
      id: t.id,
      label: t.label,
      mode: t.mode,
      maxGuests: t.maxGuests,
      pricePaise: rupeesToPaise(t.priceRupees),
      stayIncludedPax: t.stayIncludedPax,
    })),
    addOnAvailability: v.addOnAvailability ?? [],
    bookable: v.bookable && hasPricing,
    status: v.status,
    portfolioSource: v.portfolioSource,
    thumbnail: v.thumbnail,
    type: v.type,
    location: v.location,
    shortName: v.shortName,
    retreatId: v.retreatId,
  };
}
