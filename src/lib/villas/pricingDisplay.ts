import type { CanonicalVilla } from "./canonicalPortfolio";
import { paiseToRupees } from "@/lib/money";

function fmtRupees(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

function perHead(base: number, pax: number): string {
  if (pax <= 0) return "";
  const per = Math.round(base / pax);
  return `≈ ${fmtRupees(per)} / head`;
}

function gstSuffix(taxPercent: number): string {
  return taxPercent > 0 ? ` + GST (${taxPercent}%)` : " + GST";
}

/** Mongo dashboard operational fields → public pricing blocks. */
export type MongoPricingSource = {
  slug?: string;
  retreatId?: string;
  basePricePaise: number;
  dayOutBasePricePaise: number;
  stayBasePax: number;
  dayOutBasePax: number;
  extraPaxStayPaise?: number;
  extraPaxDayOutPaise?: number;
  weddingVenue?: boolean;
  weddingTiers?: {
    label: string;
    maxGuests: number;
    pricePaise: number;
  }[];
  settings?: { taxPercent?: number };
};

export function buildPricingDisplayFromMongo(doc: MongoPricingSource) {
  const taxPercent = doc.settings?.taxPercent ?? 18;
  const gst = gstSuffix(taxPercent);
  const stayBase = paiseToRupees(doc.basePricePaise);
  const dayOutBase = paiseToRupees(doc.dayOutBasePricePaise);
  const extraStay = paiseToRupees(doc.extraPaxStayPaise ?? 0);
  const extraDayOut = paiseToRupees(doc.extraPaxDayOutPaise ?? 0);

  const stay = {
    title: "Stay Experience",
    subtitle: "22 hours (1 PM check-in · 11 AM checkout)",
    packages: [
      {
        label: `Up to ${doc.stayBasePax} PAX`,
        sublabel: perHead(stayBase, doc.stayBasePax),
        price: `${stayBase > 0 ? fmtRupees(stayBase) : "—"}${gst}`,
      },
      ...(extraStay > 0
        ? [
            {
              label: "Additional Guest",
              price: `${fmtRupees(extraStay)} + GST / head`,
            },
          ]
        : []),
    ],
    features: [
      "Private villa access",
      "Overnight stay",
      "Complimentary breakfast",
    ],
  };

  const tiers = doc.weddingTiers ?? [];
  const event =
    doc.weddingVenue && tiers.length > 0
      ? {
          title: "Wedding & Events",
          subtitle: "Half-day or full-day packages · catering separate",
          packages: tiers.map((t) => ({
            label: t.label,
            sublabel: `Up to ${t.maxGuests} guests`,
            price: `${fmtRupees(paiseToRupees(t.pricePaise))} + GST`,
          })),
          features: [
            "Lawn & venue access",
            "Stay inclusion on full-day tiers only",
          ],
        }
      : {
          title: "Day-out Experience",
          subtitle: "Single day · no overnight",
          packages: [
            {
              label: `Up to ${doc.dayOutBasePax} PAX`,
              sublabel: perHead(dayOutBase, doc.dayOutBasePax),
              price: `${dayOutBase > 0 ? fmtRupees(dayOutBase) : "—"}${gst}`,
            },
            ...(extraDayOut > 0
              ? [
                  {
                    label: "Additional Guest",
                    price: `${fmtRupees(extraDayOut)} + GST / head`,
                  },
                ]
              : []),
          ],
          features: ["Venue access", "Complimentary high tea"],
        };

  return { stay, event };
}

/**
 * Pricing for a villa backed by a dashboard Mongo record.
 * Quick Edit and Full Editor both PATCH operational fields to the same document.
 */
export function resolveOperationalPricing(doc: MongoPricingSource) {
  return buildPricingDisplayFromMongo(doc);
}

/** Public-facing pricing block aligned with Jade_Property_Data.md rates. */
export function buildPricingDisplay(v: CanonicalVilla) {
  const stayBase = v.basePriceRupees;
  const dayOutBase = v.dayOutBasePriceRupees;

  const stay = {
    title: "Stay Experience",
    subtitle: "22 hours (1 PM check-in · 11 AM checkout)",
    packages: [
      {
        label: `Up to ${v.stayBasePax} PAX`,
        sublabel: perHead(stayBase, v.stayBasePax),
        price: `${fmtRupees(stayBase)} + GST (18%)`,
      },
      {
        label: "Additional Guest",
        price: `${fmtRupees(v.extraPaxStayRupees)} + GST / head`,
      },
    ],
    features: [
      "Private villa access",
      "Overnight stay",
      "Complimentary breakfast",
    ],
  };

  const event =
    v.weddingVenue && v.weddingTiers.length > 0
      ? {
          title: "Wedding & Events",
          subtitle: "Half-day or full-day packages · catering separate",
          packages: v.weddingTiers.map((t) => ({
            label: t.label,
            sublabel: `Up to ${t.maxGuests} guests`,
            price: `${fmtRupees(t.priceRupees)} + GST`,
          })),
          features: [
            "Lawn & venue access",
            "Stay inclusion on full-day tiers only",
          ],
        }
      : {
          title: "Day-out Experience",
          subtitle: "Single day · no overnight",
          packages: [
            {
              label: `Up to ${v.dayOutBasePax} PAX`,
              sublabel: perHead(dayOutBase, v.dayOutBasePax),
              price: `${fmtRupees(dayOutBase)} + GST (18%)`,
            },
            {
              label: "Additional Guest",
              price: `${fmtRupees(v.extraPaxDayOutRupees)} + GST / head`,
            },
          ],
          features: ["Venue access", "Complimentary high tea"],
        };

  return { stay, event };
}
