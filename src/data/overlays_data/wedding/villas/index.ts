import { domeVillasWeddingOverlay } from "./dome-villas";
import { diamondWeddingOverlay } from "./diamond";
import { havenWeddingOverlay } from "./haven";
import { magnoliaWeddingOverlay } from "./magnolia";
import { tranquilWeddingOverlay } from "./tranquil";

/** Villas listed on `/weddings` — must match Wedding_Villa_Overlay SVG set. */
export const WEDDING_VILLA_IDS = [
  "dome-villas",
  "haven",
  "tranquil",
  "magnolia",
  "diamond",
] as const;

export type WeddingVillaId = (typeof WEDDING_VILLA_IDS)[number];

export const WEDDING_VILLAS_OVERLAY_DATA = {
  "dome-villas": domeVillasWeddingOverlay,
  haven: havenWeddingOverlay,
  tranquil: tranquilWeddingOverlay,
  magnolia: magnoliaWeddingOverlay,
  diamond: diamondWeddingOverlay,
} as const;
