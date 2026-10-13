/** External layout rhythm scale (~20% tighter). Do not use for control internal padding. */
export const LAYOUT_SPACE_SCALE = 0.8;

export function spaceClamp(minPx: number, mid: string, maxPx: number): string {
  const s = LAYOUT_SPACE_SCALE;
  return `clamp(${minPx * s}px, ${mid}, ${maxPx * s}px)`;
}

/** Fluid spacing clamp strings (sync with tailwind.config.ts + globals.css). */
export const FLUID_SPACE = {
  xs: "clamp(3.2px, 0.4vw, 6.4px)",
  sm: "clamp(6.4px, 0.8vw, 12.8px)",
  md: "clamp(12.8px, 1.6vw, 25.6px)",
  lg: "clamp(25.6px, 3.2vw, 51.2px)",
  xl: "clamp(38.4px, 4.8vw, 76.8px)",
  "2xl": "clamp(51.2px, 6.4vw, 102.4px)",
} as const;

/**
 * Footer bottom padding when a fixed booking bar sits over the page (villa detail, etc.).
 * ~5.75rem clears py-4 bar + PrimaryButton + safe-area on desktop (lg:pb-12 was too short).
 */
export const STICKY_BOOKING_BAR_FOOTER_PAD_CLASS =
  "pb-[max(5.75rem,calc(5.75rem+env(safe-area-inset-bottom,0px)))]";

/**
 * Fixed {@link MobileBottomNav} stack height — mirrors `MobileBottomNav.tsx` classes:
 * `pt-2` + icon/label row (~2.75rem) + `pb-[max(0.75rem,calc(safe-area+0.875rem))]`.
 * Safe-area is included once here (do not add inset again on top).
 */
export const MOBILE_BOTTOM_NAV_HEIGHT_EXPR =
  "0.5rem + 2.75rem + max(0.75rem, calc(env(safe-area-inset-bottom, 0px) + 0.875rem))";

/** Gap above mobile nav: 20px phone → 24px tablet (still clears fixed bar) */
export const MOBILE_BOTTOM_NAV_CONTENT_GAP = "clamp(1.25rem, 3.5vw, 1.5rem)";

/**
 * Hero / fixed-bottom UI: nav height + responsive gap (mobile + tablet; nav is `lg:hidden`).
 * Literal string so Tailwind JIT includes the arbitrary `calc(...)`.
 */
export const MOBILE_BOTTOM_NAV_CLEARANCE_CLASS =
  "max-lg:pb-[calc(0.5rem+2.75rem+max(0.75rem,calc(env(safe-area-inset-bottom,0px)+0.875rem))+clamp(1.25rem,3.5vw,1.5rem))]";

/** Floating scroll-line indicator — clears fixed {@link MobileBottomNav} on mobile/tablet */
export const SCROLL_LINE_INDICATOR_BOTTOM_CLASS =
  "max-lg:bottom-[calc(0.5rem+2.75rem+max(0.75rem,calc(env(safe-area-inset-bottom,0px)+0.875rem))+clamp(1.25rem,3.5vw,1.5rem))] lg:bottom-10";

/**
 * Horizontal swipe hint inside scroll-linked sticky stages — stage height already
 * ends above the bottom nav, so use a small inset from the stage bottom only.
 */
export const SCROLL_LINKED_HORIZONTAL_HINT_BOTTOM_CLASS =
  "bottom-[clamp(0.625rem,2vh,0.875rem)] lg:bottom-10";

/**
 * End-of-section vertical cue — same stage-bottom band as the horizontal hint.
 * Do not use {@link SCROLL_LINE_INDICATOR_BOTTOM_CLASS} here: the sticky stage
 * already clears the mobile nav, so double-counting lifts the badge onto CTAs.
 */
export const SCROLL_LINKED_VERTICAL_HINT_BOTTOM_CLASS =
  "bottom-[clamp(0.35rem,1.5vh,0.65rem)] lg:bottom-8";

/** In-flow hero CTA (margin above mobile nav) */
export const SCROLL_LINE_INDICATOR_MB_CLASS =
  "max-lg:mb-[calc(0.5rem+2.75rem+max(0.75rem,calc(env(safe-area-inset-bottom,0px)+0.875rem))+clamp(1.25rem,3.5vw,1.5rem))] lg:mb-8";
