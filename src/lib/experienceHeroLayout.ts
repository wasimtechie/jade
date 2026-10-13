import { MOBILE_BOTTOM_NAV_CLEARANCE_CLASS } from "@/lib/layoutSpacing";

/**
 * Shared layout for experience-category heroes (Corporate, Party Villas,
 * Weekend Getaways, Weddings via WeddingHero, Caravans — all use ExperienceHero).
 * Mobile/tablet: stats + CTAs use the full padded hero width (Image 2 alignment).
 * Large screens: cap width for readability and center the chrome stack.
 */
export const EXPERIENCE_HERO_CHROME_WIDTH_CLASS =
  "w-full lg:max-w-2xl lg:mx-auto xl:max-w-[40rem]";

/**
 * Bottom padding: mobile/tablet = nav height + ~20–24px gap (no double safe-area).
 * Desktop: modest padding only (`MobileBottomNav` is hidden at `lg`).
 */
export const EXPERIENCE_HERO_SAFE_BOTTOM_CLASS =
  `${MOBILE_BOTTOM_NAV_CLEARANCE_CLASS} lg:pb-12`;

/** Home hero parity — readable white copy on photo/video heroes. */
export const EXPERIENCE_HERO_COPY_SHADOW_CLASS =
  "[text-shadow:0_1px_8px_rgba(0,0,0,0.8),0_2px_18px_rgba(0,0,0,0.5)]";

export const EXPERIENCE_HERO_HEADING_CLASS =
  `font-philosopher text-white text-gh-h1 leading-tight ${EXPERIENCE_HERO_COPY_SHADOW_CLASS}`;

export const EXPERIENCE_HERO_DESCRIPTION_CLASS =
  `font-manrope text-gh-body font-semibold text-white max-w-2xl leading-relaxed ${EXPERIENCE_HERO_COPY_SHADOW_CLASS}`;
