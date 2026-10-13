import { buildOnwardsPriceMap } from "@/lib/villas/canonicalOverlayHelpers";

const PARTY_VILLA_IDS = [
  "dome-villas",
  "emerald",
  "magnolia",
  "tranquil",
  "wonderland",
] as const;

/** Derived from Jade_Property_Data.md via canonical portfolio. */
export const PARTY_PRICING_ONWARDS: Record<string, string> = {
  default: "₹15,000 + GST / night",
  ...buildOnwardsPriceMap("party", PARTY_VILLA_IDS),
};
