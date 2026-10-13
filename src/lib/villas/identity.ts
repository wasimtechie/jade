import {
  CANONICAL_BY_RETREAT_ID,
  retreatIdForSlug,
} from "./canonicalPortfolio";

export function slugForPublicVillaId(id: string): string {
  return CANONICAL_BY_RETREAT_ID.get(id)?.slug ?? id;
}

export function publicVillaIdForSlug(slug: string): string {
  return retreatIdForSlug(slug) ?? slug;
}

export function villaIdentityCandidates(id: string): string[] {
  return Array.from(
    new Set(
      [id, slugForPublicVillaId(id), retreatIdForSlug(id)].filter(
        (value): value is string => Boolean(value),
      ),
    ),
  );
}
