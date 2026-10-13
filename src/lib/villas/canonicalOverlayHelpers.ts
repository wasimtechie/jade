import { DOME_ESTATE_ID } from "@/lib/domeVillaIds";
import {
  CANONICAL_BY_RETREAT_ID,
  type CanonicalVilla,
} from "./canonicalPortfolio";

export function formatRupees(rupees: number): string {
  return `₹${rupees.toLocaleString("en-IN")}`;
}

/** Lowest wedding / function package + GST (client portfolio). */
export function getWeddingOnwardsLabel(c: CanonicalVilla): string {
  if (c.weddingTiers.length > 0) {
    const min = Math.min(...c.weddingTiers.map((t) => t.priceRupees));
    return `${formatRupees(min)} + GST`;
  }
  return `${formatRupees(c.basePriceRupees)} + GST / night`;
}

/** Stay base rate + GST. */
export function getStayOnwardsLabel(c: CanonicalVilla): string {
  if (c.basePriceRupees <= 0) return "Enquire for pricing";
  return `${formatRupees(c.basePriceRupees)} + GST / night`;
}

/** Corporate cards — day-out / stay base from portfolio. */
export function getCorporateOnwardsLabel(c: CanonicalVilla): string {
  return getStayOnwardsLabel(c);
}

/** Party cards — same as stay base. */
export function getPartyOnwardsLabel(c: CanonicalVilla): string {
  return getStayOnwardsLabel(c);
}

const DOME_COLORS = ["dome-villas-blue", "dome-villas-red", "dome-villas-yellow"] as const;

/** Synthetic canonical row for the full dome estate (cluster). */
export function getDomeEstateCanonical(): CanonicalVilla {
  const domes = DOME_COLORS.map((id) => CANONICAL_BY_RETREAT_ID.get(id)).filter(
    Boolean,
  ) as CanonicalVilla[];
  const minStay = Math.min(...domes.map((d) => d.basePriceRupees));
  return {
    slug: "dome-villas",
    retreatId: DOME_ESTATE_ID,
    name: "Dome Villas by Jade",
    shortName: "Dome Villas",
    type: "DOME VILLA CLUSTER · 3 PRIVATE VILLAS",
    location: "Doddaballapur · 30 min airport toll",
    thumbnail: "/Villa_Retreats/Dome/Hero Main/Hero 1.webp",
    basePriceRupees: minStay,
    dayOutBasePriceRupees: minStay,
    stayBasePax: 8,
    dayOutBasePax: 16,
    stayMaxPax: 24,
    extraPaxStayRupees: 2000,
    extraPaxDayOutRupees: 1000,
    weddingVenue: false,
    bookable: true,
    status: "active",
    portfolioSource: "canonical",
    stats: {
      stay: "Up to 24 Guests (3 villas)",
      events: "Up to 35 Guests (cluster)",
      bhk: "3 Domes · 3 BR each",
      lawn: "Shared cluster stage",
      villaArea: "Doddaballapur hills",
    },
    weddingTiers: [],
  };
}

export function resolveCanonicalForRetreat(
  retreatId: string,
): CanonicalVilla | undefined {
  if (retreatId === DOME_ESTATE_ID) return getDomeEstateCanonical();
  return CANONICAL_BY_RETREAT_ID.get(retreatId);
}

export function onwardsLabelForPage(
  page: "wedding" | "corporate" | "party" | "weekend",
  c: CanonicalVilla,
): string {
  if (page === "wedding") return getWeddingOnwardsLabel(c);
  if (page === "corporate") return getCorporateOnwardsLabel(c);
  return getPartyOnwardsLabel(c);
}

/** Build onwards map for hero pricing strips from canonical data. */
export function buildOnwardsPriceMap(
  page: "wedding" | "corporate" | "party" | "weekend",
  ids: readonly string[],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const id of ids) {
    const c = resolveCanonicalForRetreat(id);
    if (c) out[id] = onwardsLabelForPage(page, c);
  }
  return out;
}
