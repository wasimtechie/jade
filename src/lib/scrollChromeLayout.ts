/** Same glass shell as global Navbar (`Navbar.tsx`). */
export const SCROLL_CHROME_NAV_GLASS_SHELL_CLASS =
  "w-full bg-gradient-to-b from-black/70 to-transparent backdrop-blur-sm";

/** Clear fixed global navbar — keep in sync with Navbar inner py + logo + mt-[4px]. */
export const GLOBAL_NAVBAR_OFFSET_TOP_CLASS =
  "pt-[52px] md:pt-[56px] lg:pt-[60px]";

/** @deprecated Use {@link VILLA_ACTION_CHROME_SPACER_CLASS} — 76px is mobile-only. */
export const VILLA_SPACES_HEADER_HEIGHT_PX = 76;

/**
 * Sticky `top` for villa detail / spaces action chrome when the fixed header is visible.
 * Matches ScrollHideTopChrome glass shell + pt/pb + h-11/md:h-12 controls.
 * @deprecated Prefer {@link STICKY_BELOW_VILLA_ACTION_FULL_CLASS} — animates to 0 when chrome hides.
 */
export const VILLA_DETAIL_ACTION_STICKY_TOP_VISIBLE_CLASS =
  "top-[76px] sm:top-[84px] md:top-[88px] lg:top-[96px]";

/**
 * Sticky rails below the global site Navbar — `top` follows scroll-chrome hide (0 when hidden).
 * Values match Navbar inner row (py + 44px targets + mt-[4px]).
 */
export const STICKY_BELOW_GLOBAL_NAV_CLASS = "jade-sticky-below-global-nav";

/** Villa detail section tabs — below compact action row (back + enquire). */
export const STICKY_BELOW_VILLA_ACTION_COMPACT_CLASS =
  "jade-sticky-below-villa-action-compact";

/** Spaces / full action header — below back + title row. */
export const STICKY_BELOW_VILLA_ACTION_FULL_CLASS =
  "jade-sticky-below-villa-action-full";

/** Document-flow spacer under fixed action header — must match sticky top offsets above. */
export const VILLA_ACTION_CHROME_SPACER_CLASS =
  "h-[76px] sm:h-[84px] md:h-[88px] lg:h-[96px]";

/** Page-level top padding to clear fixed action header (same values as spacer). */
export const VILLA_ACTION_CHROME_PAD_TOP_CLASS =
  "pt-[76px] sm:pt-[84px] md:pt-[88px] lg:pt-[96px]";
