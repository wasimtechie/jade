/**
 * Single contract for touch-scrollable horizontal rails on mobile.
 * Use on the scroll root (the element with overflow-x-auto), or prefer HorizontalScrollRail.
 */
export const HORIZONTAL_SCROLL_TRACK_CLASSES =
  "jade-hscroll-track flex overflow-x-auto min-w-0 overscroll-x-contain scrollbar-none";

/** Marks a node for Lenis + global mobile touch rules (see globals.css). */
export const JADE_HSCROLL_DATA_ATTR = "data-jade-hscroll" as const;

/**
 * @deprecated Do not put on horizontal rails — blocks vertical scroll on mobile/desktop.
 * HScrollTouchAssurance strips this from `.jade-hscroll-track` at runtime.
 */
export const JADE_LENIS_PREVENT_TOUCH = "data-lenis-prevent-touch" as const;
