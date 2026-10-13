import { domeVillasCorporateOverlay } from "./dome-villas";
import { diamondCorporateOverlay } from "./diamond";
import { havenCorporateOverlay } from "./haven";
import { magnoliaCorporateOverlay } from "./magnolia";
import { retreatOnTheRidgeCorporateOverlay } from "./retreat-on-the-ridge";

/** Villas on `/corporate-retreats` — must match Corporate_Villa_Overlay SVG set. */
export const CORPORATE_VILLA_IDS = [
  "dome-villas",
  "magnolia",
  "diamond",
  "haven",
  "retreat-on-the-ridge",
] as const;

export type CorporateVillaId = (typeof CORPORATE_VILLA_IDS)[number];

export const CORPORATE_VILLAS_OVERLAY_DATA = {
  "dome-villas": domeVillasCorporateOverlay,
  magnolia: magnoliaCorporateOverlay,
  diamond: diamondCorporateOverlay,
  haven: havenCorporateOverlay,
  "retreat-on-the-ridge": retreatOnTheRidgeCorporateOverlay,
} as const;
