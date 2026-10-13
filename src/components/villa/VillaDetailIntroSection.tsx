"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import { MapPin } from "lucide-react";
import { VILLA_DETAIL_SPACING } from "./villaDetailSpacing";

const vd = VILLA_DETAIL_SPACING;

type VillaDetailIntroSectionProps = {
  eyebrow: string;
  title: string;
  mapsHref: string;
  locationLabel: string;
  statsRow: ReactNode;
  amenityHighlights?: ReactNode;
  children: ReactNode;
  /** Extra eyebrow link (e.g. Dome estate back link) above type label */
  eyebrowPrefix?: ReactNode;
};

/**
 * Section 1 — shared vertical rhythm for villa detail overview and know-more overlays.
 */
export default function VillaDetailIntroSection({
  eyebrow,
  title,
  mapsHref,
  locationLabel,
  statsRow,
  amenityHighlights,
  children,
  eyebrowPrefix,
}: VillaDetailIntroSectionProps) {
  return (
    <>
      <div className={vd.introContent}>
        <div className={vd.introHeader}>
          {eyebrowPrefix}
          <span className={vd.introEyebrow}>{eyebrow}</span>
          <h1 className={vd.introTitle}>{title}</h1>
        </div>
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className={vd.introLocation}
          aria-label={`Open ${title} location in Google Maps`}
        >
          <MapPin className="h-5 w-5 shrink-0 text-white/70" />
          <span className="font-manrope text-[15px] md:text-[18px] underline-offset-4 group-hover:underline">
            {locationLabel}
          </span>
        </a>
        <div
          className={clsx(vd.statsTagsRail, vd.introStats)}
          data-jade-hscroll
        >
          {statsRow}
        </div>
      </div>

      {amenityHighlights ? (
        <div className={vd.introAmenity}>{amenityHighlights}</div>
      ) : null}

      <div className={clsx(vd.introContent, vd.introBody)}>{children}</div>
    </>
  );
}
