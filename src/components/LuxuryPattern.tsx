"use client";

import React, { memo, useEffect, useState } from "react";
import { supportsFixedBackgroundAttachment } from "@/lib/backgroundAttachmentSupport";

export interface LuxuryPatternProps {
  /** Controls the size of each repeating tile in px. Default: 300 */
  patternSize?: number;
  /** Stroke/pattern color tint — currently unused (asset-driven). */
  strokeColor?: string;
  /** Background color rendered behind the pattern. Default: transparent (let parent show through) */
  backgroundColor?: string;
  /** Opacity of the pattern overlay. Default: 1 */
  opacity?: number;
  /** Extra Tailwind / CSS classes for the outer container */
  className?: string;
  /** Unique id — unused in CSS-tile mode but kept for API compat */
  patternId?: string;
  /**
   * Pattern edge feather — mask distance so the motif softens into the section
   * background at top/bottom (CSS `mask-image` linear gradient). Featured Villas
   * uses `"18vh"`. Design term: pattern edge feather / edge vignette.
   */
  edgeFade?: string;
  /** Keep pattern fixed to viewport (Featured Villas static parallax). */
  parallaxFixed?: boolean;
  /** @deprecated use patternSize */
  tileSize?: number;
  width?: number;
  height?: number;
}

/**
 * LuxuryPattern — tiles the official `/assets/Design.png` as a transparent
 * geometric background overlay on the Jade Green base.
 */
const LuxuryPattern = memo(
  ({
    patternSize = 300,
    tileSize,
    backgroundColor = "transparent",
    opacity = 1,
    edgeFade,
    parallaxFixed = false,
    className = "",
  }: LuxuryPatternProps) => {
    const size = tileSize ?? patternSize;

    const [fixedAttachment, setFixedAttachment] = useState(false);

    useEffect(() => {
      if (parallaxFixed) {
        setFixedAttachment(supportsFixedBackgroundAttachment());
        return;
      }
      const finePointer = window.matchMedia("(pointer: fine)").matches;
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      setFixedAttachment(finePointer && !reducedMotion);
    }, [parallaxFixed]);

    const fadeMask = edgeFade
      ? `linear-gradient(to bottom, transparent 0, black ${edgeFade}, black calc(100% - ${edgeFade}), transparent 100%)`
      : undefined;

    const scrollClass = fixedAttachment ? "" : "jade-luxury-pattern--scroll";

    return (
      <div
        aria-hidden="true"
        className={`absolute inset-0 w-full h-full pointer-events-none z-0 ${scrollClass} ${className}`}
        style={{
          opacity,
          backgroundColor,
          backgroundImage: "url(/assets/Design.png)",
          backgroundRepeat: "repeat",
          backgroundSize: `${size}px ${size}px`,
          backgroundAttachment: fixedAttachment ? "fixed" : "scroll",
          ...(fadeMask
            ? {
                WebkitMaskImage: fadeMask,
                maskImage: fadeMask,
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskSize: "100% 100%",
                maskSize: "100% 100%",
              }
            : null),
        }}
      />
    );
  },
);

LuxuryPattern.displayName = "LuxuryPattern";

export default LuxuryPattern;
