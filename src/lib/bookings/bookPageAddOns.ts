import {
  ADD_ON_CATALOG,
  COMPLIMENTARY_ADDON_IDS,
  type AddOnCatalogEntry,
} from "./addOnCatalog";
import { paiseToRupees } from "@/lib/money";

export type BookPageAddOn = {
  id: string;
  label: string;
  /** Display price in paise; 0 = included / quote */
  pricePaise: number;
  mode: AddOnCatalogEntry["mode"];
  complimentary: boolean;
};

/** Paid + quote add-ons for /book UI — ids match server ADD_ON_CATALOG. */
export function getBookPageAddOns(
  villaSlug?: string,
  allowedAddOnIds?: string[],
): BookPageAddOn[] {
  const hasConfiguredAllowlist =
    Array.isArray(allowedAddOnIds) && allowedAddOnIds.length > 0;
  return Object.values(ADD_ON_CATALOG)
    .filter((entry) => {
      if (hasConfiguredAllowlist) {
        return allowedAddOnIds.includes(entry.id);
      }
      if (COMPLIMENTARY_ADDON_IDS.has(entry.id)) return false;
      if (entry.villaIds?.length && villaSlug) {
        return entry.villaIds.includes(villaSlug);
      }
      if (entry.villaIds?.length && !villaSlug) return false;
      return true;
    })
    .map((entry) => {
      if (entry.mode === "flat") {
        return {
          id: entry.id,
          label: entry.label,
          pricePaise: entry.pricePaise,
          mode: entry.mode,
          complimentary: false,
        };
      }
      if (entry.mode === "perPerson") {
        return {
          id: entry.id,
          label: `${entry.label} (per person, min ${entry.minPax})`,
          pricePaise: entry.pricePerPersonPaise * entry.minPax,
          mode: entry.mode,
          complimentary: false,
        };
      }
      return {
        id: entry.id,
        label: `${entry.label} — quote on request`,
        pricePaise: 0,
        mode: entry.mode,
        complimentary: false,
      };
    });
}

export function estimateAddOnPaise(
  selectedIds: string[],
  guests: number,
): number {
  let total = 0;
  for (const id of selectedIds) {
    const entry = ADD_ON_CATALOG[id];
    if (!entry || COMPLIMENTARY_ADDON_IDS.has(id)) continue;
    if (entry.mode === "flat") total += entry.pricePaise;
    else if (entry.mode === "perPerson") {
      const pax = Math.max(guests, entry.minPax);
      total += entry.pricePerPersonPaise * pax;
    }
  }
  return total;
}

export function formatBookAddOnPrice(paise: number): string {
  if (paise <= 0) return "Included";
  return `₹${paiseToRupees(paise).toLocaleString("en-IN")}`;
}
