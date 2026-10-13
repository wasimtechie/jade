export type AddOnMode = "flat" | "perPerson" | "quoteOnly";

export interface FlatAddOn {
  id: string;
  label: string;
  mode: "flat";
  pricePaise: number;
  villaIds?: string[];
}

export interface PerPersonAddOn {
  id: string;
  label: string;
  mode: "perPerson";
  pricePerPersonPaise: number;
  minPax: number;
  villaIds?: string[];
}

export interface QuoteOnlyAddOn {
  id: string;
  label: string;
  mode: "quoteOnly";
  villaIds?: string[];
}

export type AddOnCatalogEntry = FlatAddOn | PerPersonAddOn | QuoteOnlyAddOn;

/** Complimentary — never in catalog as paid items. */
export const COMPLIMENTARY_ADDON_IDS = new Set([
  "breakfast-included",
  "bbq-stand-self-use",
  "bonfire",
  "speakers",
  "indoor-outdoor-games",
  "lawn-movie-night",
]);

export const ADD_ON_CATALOG: Record<string, AddOnCatalogEntry> = {
  "picnic-setup": {
    id: "picnic-setup",
    label: "Picnic setup",
    mode: "flat",
    pricePaise: 400000,
  },
  "floating-breakfast": {
    id: "floating-breakfast",
    label: "Floating breakfast (up to 5 pax)",
    mode: "flat",
    pricePaise: 400000,
  },
  "rooftop-jacuzzi": {
    id: "rooftop-jacuzzi",
    label: "Rooftop jacuzzi",
    mode: "flat",
    pricePaise: 400000,
    villaIds: ["jade-735"],
  },
  "high-tea": {
    id: "high-tea",
    label: "High Tea",
    mode: "perPerson",
    pricePerPersonPaise: 15000,
    minPax: 5,
  },
  "bbq-2-starter": {
    id: "bbq-2-starter",
    label: "2-Starter BBQ",
    mode: "perPerson",
    pricePerPersonPaise: 36000,
    minPax: 5,
  },
  "bbq-4-starter": {
    id: "bbq-4-starter",
    label: "4-Starter BBQ",
    mode: "perPerson",
    pricePerPersonPaise: 72000,
    minPax: 5,
  },
  "standard-meal": {
    id: "standard-meal",
    label: "Standard Lunch / Dinner",
    mode: "perPerson",
    pricePerPersonPaise: 65000,
    minPax: 5,
  },
  "bbq-meal": {
    id: "bbq-meal",
    label: "Standard BBQ Lunch / Dinner",
    mode: "perPerson",
    pricePerPersonPaise: 65000,
    minPax: 5,
  },
  "extra-biryani": {
    id: "extra-biryani",
    label: "Extra biryani",
    mode: "perPerson",
    pricePerPersonPaise: 30000,
    minPax: 5,
  },
  "culinary-experience": {
    id: "culinary-experience",
    label: "Culinary Experience",
    mode: "quoteOnly",
  },
};

export function getAddOn(id: string): AddOnCatalogEntry | undefined {
  return ADD_ON_CATALOG[id];
}
