/**
 * Menu preview column — horizontal inset matches `.jade-nav-inner` (global header).
 */

export const MENU_PREVIEW_GUTTER_CLASS =
  "pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] sm:pl-[max(1.25rem,env(safe-area-inset-left,0px))] sm:pr-[max(1.25rem,env(safe-area-inset-right,0px))] lg:pl-[max(2rem,env(safe-area-inset-left,0px))] lg:pr-[max(2rem,env(safe-area-inset-right,0px))]";

/** Mobile/tablet primary menu — white labels; gold on hover (Figma menu screen). */
export const MENU_MOBILE_NAV_LABEL_CLASS =
  "max-lg:text-white max-lg:transition-colors max-lg:duration-300 max-lg:group-hover:text-[#EFCD62]";

export const MENU_MOBILE_NAV_CHEVRON_CLASS =
  "shrink-0 max-lg:h-5 max-lg:w-5 max-lg:text-white/50 max-lg:transition-colors max-lg:duration-300 max-lg:group-hover:text-[#EFCD62] lg:h-5 lg:w-5 lg:self-center";

/** Mobile/tablet static row (About, Careers, …) */
export const MENU_MOBILE_STATIC_LINK_CLASS =
  "max-lg:block max-lg:text-white max-lg:transition-colors max-lg:duration-300 max-lg:hover:text-[#EFCD62]";

/** Social icon square — menu mobile/tablet */
export const MENU_MOBILE_SOCIAL_ICON_CLASS =
  "menu-mobile-social-icon flex h-10 w-10 items-center justify-center border border-white/20 text-white transition-colors hover:bg-white/5";

/** Carousel nav — same chrome + hover as global header BOOK / icon buttons */
export const MENU_CAROUSEL_NAV_BUTTON_CLASS =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-none border border-white/20 bg-white/[0.05] text-white backdrop-blur-sm transition-all duration-300 hover:bg-jade-gold hover:text-black";

/** @deprecated Use NAVBAR_GLASS_ICON_CLASS from @/lib/navbarChrome */
export { NAVBAR_GLASS_ICON_CLASS as MENU_MOBILE_HEADER_ICON_CLASS } from "@/lib/navbarChrome";

/** Primary menu link type — fluid on short mobile viewports (max-lg only). */
export const MENU_MOBILE_PRIMARY_OPTION_TYPE =
  "max-lg:text-[clamp(1.5rem,calc(1.25rem+1.5dvh),2rem)] max-lg:leading-[1.1] max-lg:py-0 max-lg:font-normal lg:block lg:py-2 lg:leading-none lg:text-gh-h2 leading-none py-2 font-philosopher font-light";

/** MENU eyebrow label — mobile/tablet */
export const MENU_MOBILE_LABEL_CLASS =
  "block font-manrope text-gh-label uppercase tracking-[0.2em] text-white/50 max-lg:font-medium lg:font-bold";

/** Primary panel shell — mobile/tablet only */
export const MENU_MOBILE_PRIMARY_PANEL_CLASS = "menu-mobile-primary";

/** Nav list — grouped items; spacer below pushes social on mobile */
export const MENU_MOBILE_PRIMARY_NAV_CLASS =
  "menu-mobile-primary__nav flex flex-col max-lg:shrink-0 md:min-h-0 md:flex-1 md:justify-center md:space-y-2 md:overflow-visible";

/** Flex spacer — absorbs extra height between nav + social (mobile/tablet) */
export const MENU_MOBILE_PRIMARY_SPACER_CLASS =
  "menu-mobile-primary__spacer hidden max-lg:block max-lg:min-h-[clamp(0.75rem,3dvh,2rem)] max-lg:flex-1";

/** Each primary nav row — consistent height + vertical center (all breakpoints) */
export const MENU_MOBILE_PRIMARY_ITEM_CLASS =
  "menu-mobile-primary__item flex w-full items-center max-lg:min-h-[clamp(2.375rem,5.8dvh,2.75rem)]";

/** Rows with trailing chevron — label left, arrow right */
export const MENU_DESKTOP_CHEVRON_ROW_CLASS =
  "justify-between gap-3";

/** Social row — pinned below nav on mobile; extra bottom pad clears bottom nav */
export const MENU_MOBILE_PRIMARY_SOCIAL_CLASS =
  "menu-mobile-primary__social flex shrink-0 gap-3 md:mt-auto md:pt-8";

/** Mobile secondary panels (Villas / Experiences) — vertical scroll; no lenis-prevent */
export const MENU_MOBILE_VSCROLL_PANEL_CLASS =
  "menu-mobile-vscroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-6 [-webkit-overflow-scrolling:touch]";
