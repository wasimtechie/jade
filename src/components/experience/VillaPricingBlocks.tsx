"use client";

import React from "react";
import type { VillaPricingPackage } from "@/lib/types";

export type { VillaPricingPackage };

export type VillaPricingBlock = {
  title: string;
  subtitle?: string;
  packages: VillaPricingPackage[];
  features: string[];
};

type VillaPricingBlocksProps = {
  sectionTitle?: string;
  blocks: VillaPricingBlock[];
  footnote?: React.ReactNode;
  /** `villa-detail` — rounded green cards per villa detail mocks */
  variant?: "default" | "villa-detail";
};

/** Villa detail pricing — dark forest green + gold (reference mocks) */
const DETAIL = {
  card: "rounded-xl border border-[#1A4036] bg-[#0B3027] p-5 md:p-7",
  title: "text-[#EEDC82] text-lg md:text-xl font-manrope font-bold mb-1",
  row: "flex justify-between items-center gap-4 rounded-lg border border-[#1A4036] bg-[#1A4036] p-4",
  label: "text-white font-semibold text-base md:text-lg font-manrope",
  sublabel: "text-[#B0B0B0] text-sm font-manrope mt-0.5",
  price: "text-white font-bold text-base md:text-lg font-manrope text-right shrink-0",
  included: "text-white text-sm font-manrope",
  chip: "rounded-md border border-[#1A4036] bg-[#1A4036] px-4 py-2 text-xs md:text-sm font-manrope text-white",
} as const;

function parsePricingSubtitle(subtitle?: string) {
  if (!subtitle) return { lead: "", detail: "" };
  const paren = subtitle.indexOf("(");
  if (paren === -1) return { lead: subtitle, detail: "" };
  return {
    lead: subtitle.slice(0, paren).trim(),
    detail: subtitle.slice(paren).trim(),
  };
}

/**
 * Shared pricing cards used on villa detail page and experience overlays
 * (typography matches overlay “Half-Day / Full-Day” cards).
 */
export default function VillaPricingBlocks({
  sectionTitle = "Pricing",
  blocks,
  footnote,
  variant = "default",
}: VillaPricingBlocksProps) {
  if (!blocks.length) return null;

  const isDetail = variant === "villa-detail";

  return (
    <div className={isDetail ? "flex flex-col gap-8" : "space-y-12"}>
      <h3
        className={
          isDetail
            ? "text-gh-h1 font-philosopher text-white"
            : "text-gh-h2 font-philosopher"
        }
      >
        {sectionTitle}
      </h3>
      {blocks.map((rent, idx) => {
        const subtitleParts = isDetail
          ? parsePricingSubtitle(rent.subtitle)
          : { lead: rent.subtitle ?? "", detail: "" };

        return (
        <div
          key={`${rent.title}-${idx}`}
          className={
            isDetail
              ? DETAIL.card
              : "border border-white/10 rounded-sm p-5 md:p-6 bg-white/5 mb-6"
          }
        >
          <h4
            className={
              isDetail
                ? DETAIL.title
                : "text-[#EFCD62] text-gh-h3 font-manrope font-semibold mb-1"
            }
          >
            {rent.title}
          </h4>
          {isDetail ? (
            <p className="mb-6 font-manrope text-sm md:text-base">
              {subtitleParts.lead ? (
                <span className="font-bold text-white">{subtitleParts.lead}</span>
              ) : null}
              {subtitleParts.detail ? (
                <span className="ml-1 text-[#B0B0B0]">{subtitleParts.detail}</span>
              ) : null}
            </p>
          ) : (
            <p className="text-white/40 text-gh-desc mb-6">{rent.subtitle ?? ""}</p>
          )}

          <div className={isDetail ? "mb-6 space-y-3" : "mb-6 space-y-2.5"}>
            {rent.packages.map((item, i) => (
              <div
                key={i}
                className={
                  isDetail
                    ? DETAIL.row
                    : "flex justify-between items-center bg-black/20 p-4 rounded-sm border border-white/5"
                }
              >
                <div className="flex flex-col min-w-0 pr-3">
                  <span
                    className={
                      isDetail
                        ? DETAIL.label
                        : "text-white font-bold text-gh-desc mb-1 uppercase tracking-wide"
                    }
                  >
                    {item.label}
                  </span>
                  {item.sublabel ? (
                    <span
                      className={
                        isDetail
                          ? DETAIL.sublabel
                          : "text-white/40 text-gh-label leading-tight"
                      }
                    >
                      {item.sublabel}
                    </span>
                  ) : null}
                </div>
                <span
                  className={
                    isDetail
                      ? DETAIL.price
                      : "text-white font-bold text-[15px] sm:text-[16px] md:text-[18px] leading-tight uppercase tracking-wide text-right shrink-0"
                  }
                >
                  {item.price}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <span
              className={
                isDetail
                  ? DETAIL.included
                  : "text-white/40 text-gh-label font-bold uppercase tracking-widest"
              }
            >
              Included:
            </span>
            <div className="flex flex-wrap gap-2">
              {rent.features.map((inc) => (
                <span
                  key={inc}
                  className={
                    isDetail
                      ? DETAIL.chip
                      : "px-3 py-1.5 bg-[#174539] border border-white/5 rounded-sm text-white/70 text-gh-label"
                  }
                >
                  {inc}
                </span>
              ))}
            </div>
          </div>
        </div>
        );
      })}
      {footnote}
    </div>
  );
}

export function buildDetailPagePricingBlocks(pricing: {
  event?: {
    title: string;
    subtitle?: string;
    packages: VillaPricingPackage[];
    features?: string[];
  };
  stay?: {
    title: string;
    subtitle?: string;
    packages: VillaPricingPackage[];
    features?: string[];
  };
}): VillaPricingBlock[] {
  const out: VillaPricingBlock[] = [];
  if (pricing.stay?.packages?.length) {
    out.push({
      title: pricing.stay.title,
      subtitle: pricing.stay.subtitle,
      packages: pricing.stay.packages,
      features: pricing.stay.features ?? [],
    });
  }
  if (pricing.event?.packages?.length) {
    out.push({
      title: pricing.event.title,
      subtitle: pricing.event.subtitle,
      packages: pricing.event.packages,
      features: pricing.event.features ?? [],
    });
  }
  return out;
}

export function buildWeddingWeekendOverlayPricingBlocks(v: any): VillaPricingBlock[] {
  const pricingData: VillaPricingBlock[] = [];
  if (v?.pricing?.event) {
    pricingData.push({
      title: "Half-Day Rental",
      subtitle: "6 hours",
      packages: (v.pricing.event.packages ?? []).map((p: any) => ({
        label: p.label,
        sublabel: p.sublabel,
        price: p.price,
      })),
      features: v.pricing.event.features ?? [],
    });
  }
  if (v?.pricing?.stay) {
    pricingData.push({
      title: "Full-Day Rental",
      subtitle: "12 hours",
      packages: (v.pricing.stay.packages ?? []).map((p: any) => ({
        label: p.label,
        sublabel: p.sublabel,
        price: p.price,
      })),
      features: v.pricing.stay.features ?? [],
    });
  }
  pricingData.push({
    title: "Multi-Day Events",
    subtitle: "24+ hours (Customizable)",
    packages: [
      {
        label: "Starting Package",
        sublabel: "Custom quotes",
        price: "On Request",
      },
    ],
    features: [
      "Full Estate Access",
      "Overnight Stay",
      "Event Coordination",
      "Security",
    ],
  });
  return pricingData;
}

export function buildPartyOverlayPricingBlocks(v: any): VillaPricingBlock[] {
  const pricingData: VillaPricingBlock[] = [];
  if (v?.pricing?.event) {
    pricingData.push({
      title: "Half-Day Party",
      subtitle: v.pricing.event.subtitle ?? "6 hours",
      packages: (v.pricing.event.packages ?? []).map((p: any) => ({
        label: p.label,
        sublabel: p.sublabel,
        price: p.price,
      })),
      features: v.pricing.event.features ?? [],
    });
  }
  if (v?.pricing?.stay) {
    pricingData.push({
      title: "Full-Day Party",
      subtitle: v.pricing.stay.subtitle ?? "12 hours",
      packages: (v.pricing.stay.packages ?? []).map((p: any) => ({
        label: p.label,
        sublabel: p.sublabel,
        price: p.price,
      })),
      features: v.pricing.stay.features ?? [],
    });
  }
  return pricingData;
}

export function buildCorporateOverlayPricingBlocks(v: any): VillaPricingBlock[] {
  const pricingData: VillaPricingBlock[] = [];
  if (v?.pricing?.event) {
    pricingData.push({
      title: "Day Conference",
      subtitle: "6-12 hour sessions",
      packages: (v.pricing.event.packages ?? v.pricing.event.items ?? []).map(
        (p: any) => ({
          label: p.label,
          sublabel: p.sublabel ?? p.head,
          price: p.price,
        }),
      ),
      features: v.pricing.event.features ?? v.pricing.event.included ?? [],
    });
  }
  if (v?.pricing?.stay) {
    pricingData.push({
      title: "Residential Offsite",
      subtitle: "Includes stay & meals",
      packages: (v.pricing.stay.packages ?? v.pricing.stay.items ?? []).map(
        (p: any) => ({
          label: p.label,
          sublabel: p.sublabel ?? p.head,
          price: p.price,
        }),
      ),
      features: v.pricing.stay.features ?? v.pricing.stay.included ?? [],
    });
  }
  return pricingData;
}
