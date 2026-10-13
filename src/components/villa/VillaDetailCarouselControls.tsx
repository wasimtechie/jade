"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import clsx from "clsx";

type VillaDetailCarouselControlsProps = {
  label: string;
  slideCount: number;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
};

/** In-frame prev / label / next — matches VillaCard listing hero chrome. */
export default function VillaDetailCarouselControls({
  label,
  slideCount,
  onPrev,
  onNext,
  className,
}: VillaDetailCarouselControlsProps) {
  const hasMultiple = slideCount > 1;

  return (
    <div
      className={clsx(
        "absolute bottom-3 sm:bottom-4 left-3 right-3 sm:left-4 sm:right-4 z-20 flex items-center justify-between gap-1.5 sm:gap-2 pointer-events-none",
        className,
      )}
    >
      {hasMultiple ? (
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous image"
          className="pointer-events-auto shrink-0 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-black transition-colors rounded-sm"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      ) : (
        <span className="shrink-0 w-10 h-10 md:w-12 md:h-12" aria-hidden />
      )}

      <div className="flex-1 min-w-0 px-0.5 sm:px-1 flex flex-col items-center pointer-events-none">
        <p
          className="w-full text-center text-white text-gh-label font-manrope font-bold tracking-[0.2em] sm:tracking-widest uppercase line-clamp-2 break-words [overflow-wrap:anywhere]"
          title={label}
        >
          {label}
        </p>
      </div>

      {hasMultiple ? (
        <button
          type="button"
          onClick={onNext}
          aria-label="Next image"
          className="pointer-events-auto shrink-0 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-black transition-colors rounded-sm"
        >
          <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      ) : (
        <span className="shrink-0 w-10 h-10 md:w-12 md:h-12" aria-hidden />
      )}
    </div>
  );
}
