import { DOME_VILLA_IDS } from "@/lib/domeVillaIds";

/** Serial showcase order on `/retreats/` (and other directory listings). */
export const VILLAS_DIRECTORY_ORDER: readonly string[] = [
  "jade-735",
  "magnolia",
  DOME_VILLA_IDS.blue,
  DOME_VILLA_IDS.red,
  DOME_VILLA_IDS.yellow,
  "diamond",
  "tranquil",
  "retreat-on-the-ridge",
  "haven",
  "emerald",
  "wonderland",
  "lounge-fly",
  "lemon-tree",
  "palatio",
  "royalty",
];

const directoryRank = new Map(
  VILLAS_DIRECTORY_ORDER.map((id, index) => [id, index]),
);

export function sortVillasForDirectory<T extends { id: string }>(
  VILLAS: T[],
): T[] {
  const fallback = VILLAS_DIRECTORY_ORDER.length;
  return [...VILLAS].sort(
    (a, b) =>
      (directoryRank.get(a.id) ?? fallback) -
      (directoryRank.get(b.id) ?? fallback),
  );
}
