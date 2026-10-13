"use client";

import { useRef, useCallback } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import clsx from "clsx";
import HorizontalScrollRail from "@/components/ui/HorizontalScrollRail";
import { VILLA_DETAIL_SPACING } from "@/components/villa/villaDetailSpacing";
import type { VillaSpaceGroup } from "@/lib/types";

const vd = VILLA_DETAIL_SPACING;

type SpacesImageSectionProps = {
  space: VillaSpaceGroup;
};

/** Villa spaces page — titled row + edge-bleed gallery with Figma right fade. */
export default function SpacesImageSection({ space }: SpacesImageSectionProps) {
  const railRef = useRef<HTMLDivElement>(null);

  const scrollRail = useCallback((direction: -1 | 1) => {
    const track = railRef.current;
    if (!track) return;
    const amount = Math.max(280, Math.round(track.clientWidth * 0.82));
    track.scrollBy({ left: direction * amount, behavior: "smooth" });
  }, []);

  const images = space.images.length > 0 ? space.images : ["", ""];

  return (
    <section className="flex flex-col gap-6">
      <div
        className={clsx(
          "w-full flex items-start justify-between gap-4",
          vd.gutterX,
        )}
      >
        <div className="min-w-0">
          <h2 className="text-white font-philosopher text-3xl md:text-4xl mb-2">
            {space.title}
          </h2>
          <div className="text-white/40 text-[11px] md:text-[13px] font-manrope font-medium flex flex-wrap gap-x-2">
            {space.amenities.map((amenity: string, idx: number) => (
              <span key={idx} className="flex items-center gap-2">
                {amenity}
                {idx < space.amenities.length - 1 && <span>·</span>}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start mt-1">
          <button
            type="button"
            onClick={() => scrollRail(-1)}
            aria-label={`Scroll ${space.title} images left`}
            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-black transition-colors rounded-sm"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => scrollRail(1)}
            aria-label={`Scroll ${space.title} images right`}
            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-black transition-colors rounded-sm"
          >
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <HorizontalScrollRail
        ref={railRef}
        viewportEdgeAll
        fadeFrom="#1A1C1E"
        showFade
        cursorGrab
        trackClassName={clsx(
          "gap-4 pb-4 scrollbar-none snap-x snap-mandatory",
          vd.hScrollTrackInset,
        )}
      >
        {images.map((img: string, idx: number) => (
          <div
            key={idx}
            className="relative min-w-[300px] md:min-w-[500px] flex-shrink-0 aspect-[4/3] md:aspect-[16/9] bg-white/5 snap-start overflow-hidden group jade-hscroll-view-item"
          >
            {img && img.length > 0 ? (
              <Image
                src={img}
                alt={`${space.title} ${idx + 1}`}
                fill
                draggable={false}
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 500px"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/10 uppercase tracking-widest text-xs font-bold">
                {space.title} Image Coming Soon
              </div>
            )}
          </div>
        ))}
      </HorizontalScrollRail>
    </section>
  );
}
