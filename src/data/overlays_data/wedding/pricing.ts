import { buildOnwardsPriceMap } from "@/lib/villas/canonicalOverlayHelpers";
import { WEDDING_VILLA_IDS } from "./villas/index";

/** Derived from Jade_Property_Data.md via canonical portfolio. */
export const WEDDING_PRICING_ONWARDS: Record<string, string> = {
  default: "₹1,00,000 + GST",
  ...buildOnwardsPriceMap("wedding", WEDDING_VILLA_IDS),
};
