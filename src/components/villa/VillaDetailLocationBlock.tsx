"use client";

import { MapPin } from "lucide-react";
import JadeImage from "@/components/ui/JadeImage";
import { VILLA_DETAIL_SPACING } from "./villaDetailSpacing";

const vd = VILLA_DETAIL_SPACING;

export type VillaLocationDetails = {
  mapImage?: string;
  address?: string;
  distance?: string;
  nearby?: Array<{ label: string; distance?: string; dist?: string; note?: string }>;
};

type Props = {
  mapsHref: string;
  locationDetails: VillaLocationDetails;
  fallbackMapImage?: string;
};

export default function VillaDetailLocationBlock({
  mapsHref,
  locationDetails,
  fallbackMapImage,
}: Props) {
  const mapSrc =
    locationDetails.mapImage || fallbackMapImage || undefined;

  return (
    <>
      <div className="overflow-hidden rounded-none border border-white/10 bg-jade-charcoal">
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="relative block h-64 w-full cursor-pointer outline-none transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#EFCD62]/70 md:h-80"
          aria-label="Open location in Google Maps"
        >
          {mapSrc ? (
            <JadeImage
              src={mapSrc}
              alt="Map Location"
              fill
              className="object-cover opacity-80"
              sizes="100vw"
              loading="lazy"
            />
          ) : null}
        </a>
        <div className="border-t border-white/10 bg-[#25282C] p-5 md:p-6">
          <a
            href={mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-4 rounded-sm outline-none transition-colors hover:text-[#EFCD62] focus-visible:ring-2 focus-visible:ring-[#EFCD62]/60"
          >
            <MapPin className="mt-1 h-5 w-5 shrink-0 text-jade-gold" />
            <p className="font-manrope text-gh-body font-medium leading-relaxed text-white underline-offset-4 group-hover:underline">
              {locationDetails.address}
            </p>
          </a>
          {locationDetails.distance ? (
            <div className="mt-6 w-full rounded-md bg-white/[0.04] px-4 py-4">
              <p className="font-manrope text-[12px] text-white/60 md:text-[13px]">
                {locationDetails.distance}
              </p>
            </div>
          ) : null}
        </div>
      </div>
      {locationDetails.nearby && locationDetails.nearby.length > 0 ? (
        <div className={vd.stackSm}>
          <h4 className="font-philosopher text-xl text-[#EFCD62] md:text-2xl">
            Whats nearby:
          </h4>
          <div className="flex flex-col gap-4">
            {locationDetails.nearby.map((item, idx) => (
              <div
                key={`${item.label}-${idx}`}
                className="flex items-center justify-between border-b border-white/5 pb-3"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-manrope text-gh-desc font-medium uppercase tracking-wider text-white">
                    {item.label}
                  </span>
                  {item.note ? (
                    <span className="font-manrope text-[11px] text-white/45">
                      {item.note}
                    </span>
                  ) : null}
                </div>
                <span className="font-manrope text-gh-desc text-white/60">
                  {item.distance ?? item.dist}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
