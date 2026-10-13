/** Canonical home-page section backgrounds. */
export const JADE_CHARCOAL = "#25282C";
export const JADE_GREEN = "#0B2C23";

/** Radial darkening behind headline — lighter so the hero photo stays visible. */
export const CAROUSEL_HERO_TEXT_RADIAL =
  "radial-gradient(ellipse 100% 62% at 50% 18%, rgba(37, 40, 44, 0.52) 0%, rgba(37, 40, 44, 0.28) 38%, transparent 68%)";

/** Upper charcoal wash — text band only; fades out by mid-frame. */
export function carouselUpperCharcoalScrim(): string {
  return [
    "linear-gradient(180deg,",
    "rgba(37, 40, 44, 0.72) 0%,",
    "rgba(37, 40, 44, 0.58) 8%,",
    "rgba(37, 40, 44, 0.4) 16%,",
    "rgba(37, 40, 44, 0.24) 26%,",
    "rgba(37, 40, 44, 0.1) 36%,",
    "transparent 48%,",
    "transparent 100%)",
  ].join(" ");
}

/**
 * Hero scrim gradient — charcoal wash at top, jade-green bloom at bottom.
 * Used by `CarouselHeroScrim` (variant `value`) and mobile `SectionSeamFeather`.
 */
export function carouselHeroFadeScrim(): string {
  return [
    "linear-gradient(180deg,",
    "rgba(37, 40, 44, 0.68) 0%,",
    "rgba(37, 40, 44, 0.52) 9%,",
    "rgba(37, 40, 44, 0.34) 18%,",
    "rgba(11, 44, 35, 0.22) 30%,",
    "rgba(11, 44, 35, 0.08) 40%,",
    "transparent 52%,",
    "transparent 66%,",
    "rgba(11, 44, 35, 0.28) 88%,",
    "rgba(11, 44, 35, 0.55) 100%)",
  ].join(" ");
}

/** Mobile split-hero lower band — jade-green bloom only (matches scrim tail, no charcoal). */
export function sectionSeamFeatherGreen(): string {
  return [
    "linear-gradient(180deg,",
    "rgba(11, 44, 35, 0.32) 0%,",
    "rgba(11, 44, 35, 0.55) 50%,",
    "rgba(11, 44, 35, 0.85) 85%,",
    "rgba(11, 44, 35, 1) 100%)",
  ].join(" ");
}
