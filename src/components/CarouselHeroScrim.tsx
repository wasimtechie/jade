"use client";

import { useReducedMotion } from "framer-motion";
import {
  CAROUSEL_HERO_TEXT_RADIAL,
  carouselHeroFadeScrim,
  carouselUpperCharcoalScrim,
} from "@/lib/jadeSectionColors";

type CarouselHeroScrimVariant = "upper" | "value";

export interface CarouselHeroScrimProps {
  /** `upper` = charcoal top only · `value` = home §5 charcoal→green blend */
  variant?: CarouselHeroScrimVariant;
  className?: string;
}

/** Hero scrim — charcoal→jade linear gradient + radial text vignette (+ soft bloom). */
export default function CarouselHeroScrim({
  variant = "upper",
  className = "",
}: CarouselHeroScrimProps) {
  const reducedMotion = useReducedMotion();
  const background =
    variant === "value" ? carouselHeroFadeScrim() : carouselUpperCharcoalScrim();

  return (
    <div className={`absolute inset-0 ${className}`}>
      <div
        aria-hidden
        className="absolute inset-0 z-[5] pointer-events-none"
        style={{ background }}
      />
      <div
        aria-hidden
        className="absolute inset-0 z-[6] pointer-events-none"
        style={{ background: CAROUSEL_HERO_TEXT_RADIAL }}
      />
      {!reducedMotion && (
        <div
          aria-hidden
          className="absolute inset-0 z-[4] pointer-events-none opacity-[0.2]"
          style={{
            background,
            filter: "blur(12px)",
            transform: "scale(1.04)",
          }}
        />
      )}
    </div>
  );
}
