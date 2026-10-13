import type {
  VillaAmenity,
  VillaAmenityHighlight,
  VillaPerfectForCard,
} from "@/lib/types";

/** Build intro highlight tiles from full amenities (explicit labels, no page heuristics). */
export function amenityHighlightsFrom(
  amenities: VillaAmenity[],
  count = 8,
): VillaAmenityHighlight[] {
  return amenities.slice(0, count).map((a) => {
    const words = a.label.trim().split(/\s+/);
    if (words.length <= 2) {
      return { label: a.label, icon: a.icon };
    }
    return {
      label: words.slice(0, 2).join(" "),
      sublabel: words.slice(2).join(" "),
      icon: a.icon,
    };
  });
}

export function perfectForTagsFromCards(cards: VillaPerfectForCard[]): string[] {
  return cards.map((c) => c.title);
}

/** Migrate legacy `perfectFor` string or object entries into split fields. */
export function splitLegacyPerfectFor(
  items: Array<string | { title: string; image?: string }>,
  fallbackImages: string[] = [],
): { perfectForTags: string[]; perfectForCards: VillaPerfectForCard[] } {
  const perfectForTags: string[] = [];
  const perfectForCards: VillaPerfectForCard[] = [];
  const fallback = fallbackImages.length > 0 ? fallbackImages : [""];

  items.forEach((item, idx) => {
    if (typeof item === "string") {
      perfectForTags.push(item);
      perfectForCards.push({
        title: item,
        image: fallback[idx % fallback.length] ?? "",
      });
    } else {
      perfectForTags.push(item.title);
      perfectForCards.push({
        title: item.title,
        image: item.image ?? fallback[idx % fallback.length] ?? "",
      });
    }
  });

  return { perfectForTags, perfectForCards };
}
