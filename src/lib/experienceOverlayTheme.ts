/**
 * Experience overlay palette — aligned with villa detail (`bg-jade-charcoal` / `bg-jade-green`).
 * Overlay-only tokens; do not import villa detail page structure.
 *
 * Section background transitions use `@/components/ui/MeanderStrip` (Sep_bar_design.svg).
 */

import {
  OVERLAY_PRICING_BOTTOM_BAR_CHROME_CLASS,
  OVERLAY_SHEET_TOP_RADIUS_EDGE_SHADE_CLASS,
  OVERLAY_STICKY_TABS_CHROME_CLASS,
} from "@/lib/scrollChromeGlass";
import {
  OVERLAY_MOBILE_ACTION_BAR_PB_CLASS,
  OVERLAY_MOBILE_ACTION_BAR_SPACER_CLASS,
} from "@/lib/overlayMobileChrome";

/** Mobile sheet lip — 30% black on top 8px + rounded corner edges (matches `rounded-t-[32px]`). */
export const EXPERIENCE_OVERLAY_MOBILE_SHEET_TOP_EDGE_SHADE_CLASS =
  OVERLAY_SHEET_TOP_RADIUS_EDGE_SHADE_CLASS;

export const OVERLAY_SECTION_CHARCOAL = "w-full bg-jade-charcoal text-white";
export const OVERLAY_SECTION_GREEN = "w-full bg-jade-green text-white";

export const EXPERIENCE_SHELL_BG_CLASS = "bg-jade-green";

/** @deprecated Use EXPERIENCE_SHELL_BG_CLASS */
export const EXPERIENCE_OVERLAY_BG_CLASS = EXPERIENCE_SHELL_BG_CLASS;

export const EXPERIENCE_OVERLAY_FLOATING_LABEL_CLASS = "bg-jade-charcoal";

/** Mobile chrome behind sheet — matches top 8vh band (corner radius wedges). */
export const EXPERIENCE_OVERLAY_MOBILE_CHROME_BG_CLASS = "bg-black/60";

/** Scrim behind sheet — same tone as top band so radius gaps are not solid black. */
export const EXPERIENCE_OVERLAY_MOBILE_SCRIM_CLASS =
  `${EXPERIENCE_OVERLAY_MOBILE_CHROME_BG_CLASS} backdrop-blur-sm`;

/** Phone: top 8vh clear; scrim only under sheet. Desktop: full bleed. */
export const EXPERIENCE_OVERLAY_ROOT_CLASS =
  "fixed inset-0 z-[9999] max-md:bg-transparent max-md:backdrop-blur-none md:bg-jade-charcoal backdrop-blur-sm md:backdrop-blur-none overflow-hidden text-white";

/** Mobile bottom-sheet proportions (8dvh tap band + flex-1 sheet = full viewport). */
export const EXPERIENCE_OVERLAY_MOBILE_TOP_SHADE_VH = 8;

/** Top 8dvh tap-to-dismiss band — solid 60% black (not transparent). */
export const EXPERIENCE_OVERLAY_MOBILE_TOP_SHADE_CLASS =
  `flex-[0_0_8dvh] min-h-[2.75rem] max-h-[4.5rem] shrink-0 ${EXPERIENCE_OVERLAY_MOBILE_CHROME_BG_CLASS}`;

/** Gap between mobile close button and sheet top edge (below the 8vh band). */
export const EXPERIENCE_OVERLAY_MOBILE_CLOSE_FRAME_GAP_REM = 1;

/** Mobile close control — centered in top dismiss band. */
export const EXPERIENCE_OVERLAY_CLOSE_BUTTON_FRAME_CLASS = "w-10 h-10";
export const EXPERIENCE_OVERLAY_CLOSE_ICON_CLASS = "w-5 h-5 stroke-[1.5]";

/** Sheet zone — flex-1 fills remaining viewport (avoids svh gap when browser chrome shifts). */
export const EXPERIENCE_OVERLAY_MOBILE_SHEET_ZONE_CLASS =
  `flex-1 min-h-0 relative ${EXPERIENCE_OVERLAY_MOBILE_CHROME_BG_CLASS}`;

/** Scrim fill for sheet zone (corner wedges). */
export const EXPERIENCE_OVERLAY_MOBILE_SHEET_SCRIM_CLASS = `absolute inset-0 pointer-events-none ${EXPERIENCE_OVERLAY_MOBILE_SCRIM_CLASS}`;

/** Stuck sheet — rounded top clips scrolling content. */
export const EXPERIENCE_OVERLAY_MOBILE_SHEET_FRAME_CLASS =
  "relative z-10 flex h-full min-h-0 flex-col overflow-hidden rounded-t-[32px] bg-jade-charcoal isolate";

export const EXPERIENCE_OVERLAY_STICKY_TABS_CLASS = `sticky top-0 z-[60] mb-0 w-full ${OVERLAY_STICKY_TABS_CHROME_CLASS}`;

/**
 * Scroll-end spacer — matches mobile booking bar (pt-4 + row + pb), not extra section pad.
 */
export const EXPERIENCE_OVERLAY_BOOKING_BAR_SPACER_CLASS =
  OVERLAY_MOBILE_ACTION_BAR_SPACER_CLASS;

/** Glass chrome — same tokens as {@link OVERLAY_STICKY_TABS_CHROME_CLASS}. */
const EXPERIENCE_OVERLAY_BOTTOM_BAR_CHROME = `jade-scroll-chrome relative w-full ${OVERLAY_PRICING_BOTTOM_BAR_CHROME_CLASS} pt-4 ${OVERLAY_MOBILE_ACTION_BAR_PB_CLASS} md:pb-4 transition-all flex justify-center`;

/** Overlaid on mobile sheet scroll (absolute bottom of sheet frame). */
export const EXPERIENCE_OVERLAY_BOTTOM_BAR_SHEET_CLASS = EXPERIENCE_OVERLAY_BOTTOM_BAR_CHROME;

/** Fixed to viewport (desktop). */
export const EXPERIENCE_OVERLAY_BOTTOM_BAR_CLASS = `${EXPERIENCE_OVERLAY_BOTTOM_BAR_CHROME} fixed bottom-0 left-0 z-[150] hidden md:flex`;

export const EXPERIENCE_OVERLAY_CLOSE_BUTTON_CLASS =
  "pointer-events-auto w-full h-full flex items-center justify-center rounded-full border border-white/15 bg-transparent text-white backdrop-blur-2xl shadow-lg transition-colors hover:border-white/35";

/** Body inside sheet — mobile clearance via booking-bar spacer only; desktop keeps scroll pad. */
export const EXPERIENCE_OVERLAY_CONTENT_FRAME_CLASS =
  "w-full max-md:pb-0 pb-6 md:pb-20 bg-jade-charcoal max-md:rounded-none md:rounded-none";

/** Full-viewport mobile host — no fill; top band stays clear (hidden at md+). */
export const EXPERIENCE_OVERLAY_MOBILE_HOST_CLASS =
  "md:hidden fixed inset-0 flex flex-col overflow-hidden z-[1] bg-transparent";

/** Inner scroll — content clips under sheet top radius. */
export const EXPERIENCE_OVERLAY_MOBILE_SCROLL_SHEET_CLASS =
  "min-h-0 flex-1 overflow-y-auto overscroll-y-contain scrollbar-none touch-pan-y [overscroll-behavior:contain]";

/** Desktop full-bleed scroll (unchanged). */
export const EXPERIENCE_OVERLAY_DESKTOP_BODY_CLASS =
  "hidden md:block absolute inset-0 overflow-y-auto overscroll-y-contain scrollbar-none touch-pan-y [overscroll-behavior:contain]";

