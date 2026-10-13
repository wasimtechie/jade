/**
 * Global navbar action chrome — shared dimensions for glass icons + gold BOOK.
 * Keep phone, wishlist, and BOOK aligned at 44×44px (icon squares) on every page.
 */

import { JADE_BTN_CHROME_HEIGHT } from "./jadeButtonTokens";

/** Square glass icon — call, contact, wishlist */
export const NAVBAR_GLASS_ICON_CLASS =
  "flex h-11 w-11 min-h-[44px] min-w-[44px] max-h-[44px] max-w-[44px] shrink-0 items-center justify-center rounded-none border border-white/20 bg-white/[0.05] text-white backdrop-blur-sm transition-all duration-300 hover:bg-jade-gold hover:text-black";

/** Wishlist — same footprint as other icon buttons */
export const NAVBAR_WISHLIST_ICON_CLASS = `${NAVBAR_GLASS_ICON_CLASS} relative`;

/**
 * PrimaryButton padding for navbar BOOK — height via size="chrome".
 */
export const NAVBAR_BOOK_BUTTON_CLASS = "shrink-0 px-4 md:px-5 whitespace-nowrap";

/** Glass text CTA in navbar (detail BOOK NOW, experiences path). */
export const NAVBAR_CHROME_TEXT_BUTTON_CLASS = `${JADE_BTN_CHROME_HEIGHT} shrink-0 px-4 md:px-5 whitespace-nowrap inline-flex items-center justify-center rounded-none border border-white/20 bg-white/[0.05] font-manrope text-gh-label font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm transition-all duration-300 hover:bg-jade-gold hover:text-black`;

/** Square overlay control — villa hero header back / call (44px footprint). */
export const OVERLAY_ACTION_ICON_CLASS = `${JADE_BTN_CHROME_HEIGHT} w-11 min-w-[44px] max-w-[44px] shrink-0 flex items-center justify-center`;

/** Text CTA in overlay header row — same 44px height as icon controls. */
export const OVERLAY_ACTION_TEXT_CLASS = `${JADE_BTN_CHROME_HEIGHT} shrink-0 px-3 md:px-4 whitespace-nowrap inline-flex items-center justify-center`;

/** Hero gallery CTA (VIEW ALL PICTURES) — compact 44px bar. */
export const OVERLAY_HERO_GALLERY_CTA_CLASS = `${JADE_BTN_CHROME_HEIGHT} shrink-0 inline-flex max-w-full items-center justify-center gap-1.5 px-3 md:px-4 py-0 whitespace-nowrap`;

/** Right-side action cluster — consistent gap between icons + BOOK */
export const NAVBAR_ACTIONS_CLUSTER_CLASS = "flex items-center gap-2";
