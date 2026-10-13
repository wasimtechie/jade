import { scrollToElement } from "@/lib/lenis";

/** In-page targets for experience hero CTAs (VENUES / KNOW MORE). */
export const EXPERIENCE_HERO_SECTION_ID = {
  wedding: "wedding-venues",
  corporate: "featured-venues",
  party: "party-villas-section",
  weekend: "themed-villa-retreats",
  /** Caravans — Inside the Rathaa detail carousel */
  caravans: "the-caravan",
} as const;

export type ExperienceHeroScrollPage = keyof typeof EXPERIENCE_HERO_SECTION_ID;

/** Villa pages only (back-compat). */
export const EXPERIENCE_VILLA_SECTION_ID = {
  wedding: EXPERIENCE_HERO_SECTION_ID.wedding,
  corporate: EXPERIENCE_HERO_SECTION_ID.corporate,
  party: EXPERIENCE_HERO_SECTION_ID.party,
  weekend: EXPERIENCE_HERO_SECTION_ID.weekend,
} as const;

export type ExperienceVillaPage = keyof typeof EXPERIENCE_VILLA_SECTION_ID;

const HERO_SECTION_SCROLL_OFFSET = -80;

export function scrollToExperienceHeroSection(page: ExperienceHeroScrollPage) {
  const el = document.getElementById(EXPERIENCE_HERO_SECTION_ID[page]);
  if (!el) return;
  scrollToElement(el, { offset: HERO_SECTION_SCROLL_OFFSET });
}

export function scrollToExperienceVillaSection(page: ExperienceVillaPage) {
  scrollToExperienceHeroSection(page);
}
