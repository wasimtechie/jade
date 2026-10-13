import { DOME_VIDEO_URLS, type DomeVideoKey } from "@/lib/videoUtils";

export const DOME_ESTATE_ID = "dome-villas" as const;

export const DOME_VILLA_IDS = {
  blue: "dome-villas-blue",
  red: "dome-villas-red",
  yellow: "dome-villas-yellow",
} as const;

export type DomeColorKey = DomeVideoKey;

export const DOME_COLOR_META: Record<
  DomeColorKey,
  {
    id: (typeof DOME_VILLA_IDS)[DomeColorKey];
    name: string;
    shortLabel: string;
    categoryLabel: string;
    pathNeedle: string;
    dot: string;
  }
> = {
  blue: {
    id: DOME_VILLA_IDS.blue,
    name: "Blue Dome Villa",
    shortLabel: "Blue Dome",
    categoryLabel: "Blue Dome",
    pathNeedle: "/Dome Villa_s - Blue/",
    dot: "#3b82f6",
  },
  red: {
    id: DOME_VILLA_IDS.red,
    name: "Red Dome Villa",
    shortLabel: "Red Dome",
    categoryLabel: "Red Dome",
    pathNeedle: "/Dome Villa_s - Red/",
    dot: "#ef4444",
  },
  yellow: {
    id: DOME_VILLA_IDS.yellow,
    name: "Yellow Dome Villa",
    shortLabel: "Yellow Dome",
    categoryLabel: "Yellow Dome",
    pathNeedle: "/Dome Villa_s - Yellow/",
    dot: "#eab308",
  },
};

const COLOR_BY_VILLA_ID: Record<string, DomeColorKey> = {
  [DOME_VILLA_IDS.blue]: "blue",
  [DOME_VILLA_IDS.red]: "red",
  [DOME_VILLA_IDS.yellow]: "yellow",
};

export function isDomeEstateId(id: string | undefined): boolean {
  return id === DOME_ESTATE_ID;
}

export function getDomeColorFromVillaId(
  id: string | undefined,
): DomeColorKey | null {
  if (!id) return null;
  return COLOR_BY_VILLA_ID[id] ?? null;
}

export function isDomeVillaId(id: string | undefined): boolean {
  return isDomeEstateId(id) || getDomeColorFromVillaId(id) !== null;
}

export function getDomeVideoUrlForVillaId(id: string | undefined): string {
  const color = getDomeColorFromVillaId(id);
  if (color) return DOME_VIDEO_URLS[color];
  return DOME_VIDEO_URLS.blue;
}

export const DOME_COLOR_ORDER: DomeColorKey[] = ["blue", "red", "yellow"];
