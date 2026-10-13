import { EXPERIENCE_SECTION_CTA_CONTAINER_CLASS } from "@/lib/experienceSectionCta";

/**
 * Shared layout for “Section 3” experience carousels:
 * Party Villas · Weekend Getaways · Caravans
 *
 * Keeps frame height, section padding, and CTA inset consistent with design frames.
 */

export const experienceCarouselDefaults = {
  /** Section shell — no min-height stretch so CTA stays 16px under the frame */
  containerClassName: "jade-section bg-[#141517] overflow-x-hidden",

  /** Inner column — horizontal inset only; vertical rhythm from `.jade-section`. */
  innerClassName:
    "w-full max-w-6xl mx-auto flex flex-col px-4 sm:px-6 md:px-8",

  /**
   * Image frame — explicit stepped heights only (avoid `min(dvh,*)` arbitrary classes;
   * they parse unreliably in Tailwind JIT and collapse position:absolute slides).
   * Portrait-ish rail — stepped heights (raised for more visual presence).
   */
  aspectClass:
    "relative w-full max-w-6xl mx-auto bg-[#121417] overflow-hidden rounded-sm shadow-2xl h-[456px] sm:h-[480px] md:h-[528px] lg:h-[576px] min-h-[360px]",

  /** Frame → CTA: 16px floor on mobile, then scales with viewport (capped for large screens). */
  buttonContainerClassName: `mt-[clamp(12.8px,3.2vw,25.6px)] ${EXPERIENCE_SECTION_CTA_CONTAINER_CLASS}`,
} as const;
