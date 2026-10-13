import type { VillaPerfectForCard } from "@/lib/types";

type VillaCategorySource = {
  id?: string;
  categories?: string[];
  perfectForTags?: string[];
  perfectForCards?: VillaPerfectForCard[];
};

/** Villas excluded from specific directory tabs (data tags may still overlap aliases). */
const CATEGORY_EXCLUDED_VILLA_IDS: Partial<Record<string, readonly string[]>> = {
  Weddings: ["palatio"],
};

/** Rail labels on `/retreats/` → related tag/card strings shown on villa cards. */
export const VILLA_CATEGORY_ALIASES: Record<string, readonly string[]> = {
  Weddings: [
    "Wedding",
    "Weddings",
    "Intimate Weddings",
    "Private Celebrations",
    "Large Celebrations",
  ],
  "Pre-wedding": ["Pre-wedding", "Pre wedding", "Mehendi", "Sangeet", "Engagements"],
  "Corporate Retreats": [
    "Corporate Retreats",
    "Corporate Retreat",
    "Corporate Outings",
    "Corporate Offsites",
    "Leadership Retreats",
    "Brainstorming Sessions",
    "Day Outings",
    "Recognition Evenings",
    "Team Meets",
  ],
  "Weekend Getaways": [
    "Weekend Getaways",
    "Weekend Getaway",
    "Staycations",
    "Social Stays",
    "Couple Retreat",
    "Couple Retreats",
    "Family Gatherings",
  ],
  "Luxury Stays": ["Luxury Stays", "Luxury Stay", "Boutique Stays"],
  "Nature Retreats": ["Nature Retreats", "Nature Retreat"],
  "Pet Friendly": ["Pet Friendly", "Pet-friendly"],
  "Party Venues": ["Party Venues", "Party Venue", "Private Celebrations"],
  "Wellness Retreats": ["Wellness Retreats", "Wellness Retreat", "Couple Retreat"],
};

function normalizeCategory(value: string): string {
  return value.trim().toLowerCase();
}

function matchTokensForCategory(category: string): Set<string> {
  const tokens = [category, ...(VILLA_CATEGORY_ALIASES[category] ?? [])];
  return new Set(tokens.map(normalizeCategory));
}

/** Whether a villa belongs to a `/retreats/` directory category tab. */
export function villaMatchesCategory(
  villa: VillaCategorySource,
  category: string,
): boolean {
  if (category === "All") return true;

  const excluded = CATEGORY_EXCLUDED_VILLA_IDS[category];
  if (excluded?.includes(villa.id ?? "")) return false;

  const tokens = matchTokensForCategory(category);
  const sources = [
    ...(villa.categories ?? []),
    ...(villa.perfectForTags ?? []),
    ...(villa.perfectForCards ?? []).map((card) => card.title),
  ];

  return sources.some((value) => tokens.has(normalizeCategory(value)));
}

/** Case-insensitive space category filter for `/retreat/[id]/spaces/`. */
export function spaceMatchesCategory(
  spaceCategory: string,
  activeCategory: string,
): boolean {
  return normalizeCategory(spaceCategory) === normalizeCategory(activeCategory);
}
