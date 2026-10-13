import { buildOnwardsPriceMap } from "@/lib/villas/canonicalOverlayHelpers";
import { CORPORATE_VILLA_IDS } from "./villas/index";

/** Derived from Jade_Property_Data.md via canonical portfolio. */
export const CORPORATE_PRICING_ONWARDS: Record<string, string> = {
  default: "₹31,000 + GST / night",
  ...buildOnwardsPriceMap("corporate", CORPORATE_VILLA_IDS),
};
