/**
 * Shared glass chrome for sticky category tabs + pricing bottom bars.
 * Villa detail uses transparent fill; venue overlays use white @ 5% on green shell.
 */

const GLASS_BLUR = "backdrop-blur-2xl";
const GLASS_SHADOW_TOP = "shadow-[0_8px_32px_rgba(0,0,0,0.12)]";
const GLASS_SHADOW_BOTTOM = "shadow-[0_-8px_32px_rgba(0,0,0,0.12)]";

/** Villa detail — matches fixed pricing bottom bar (transparent + blur). */
export const VILLA_DETAIL_SCROLL_CHROME_GLASS =
  `${GLASS_BLUR} border-white/10`;

export const VILLA_DETAIL_STICKY_TABS_CHROME_CLASS = `border-b ${VILLA_DETAIL_SCROLL_CHROME_GLASS} bg-transparent ${GLASS_SHADOW_TOP}`;

/** Greek-key band above sticky tabs — blurred so it floats over scrolling content. */
export const STICKY_TABS_MEANDER_TRACK_CLASS =
  "bg-jade-charcoal/35 backdrop-blur-2xl";

export const VILLA_DETAIL_PRICING_BOTTOM_BAR_CHROME_CLASS = `border-t ${VILLA_DETAIL_SCROLL_CHROME_GLASS} bg-transparent ${GLASS_SHADOW_BOTTOM}`;

/** Wedding / corporate / party overlays — white fill @ 5% on green sections. */
export const OVERLAY_SCROLL_CHROME_GLASS =
  `${GLASS_BLUR} border-white/10 bg-white/[0.05]`;

export const OVERLAY_STICKY_TABS_CHROME_CLASS = `border-b ${OVERLAY_SCROLL_CHROME_GLASS} ${GLASS_SHADOW_TOP}`;

export const OVERLAY_PRICING_BOTTOM_BAR_CHROME_CLASS = `border-t ${OVERLAY_SCROLL_CHROME_GLASS} ${GLASS_SHADOW_BOTTOM}`;

/** 30% black on top 8px (full width). */
export const OVERLAY_GLASS_TOP_8PX_SHADE_CLASS =
  "pointer-events-none absolute inset-x-0 top-0 z-[2] h-2 bg-gradient-to-b from-black/30 to-transparent";

/**
 * 30% black on upper 8px + fade through sheet top radius (32px) for corner depth.
 * Parent must be `relative` with `rounded-t-[32px]`.
 */
export const OVERLAY_SHEET_TOP_RADIUS_EDGE_SHADE_CLASS =
  "pointer-events-none absolute inset-x-0 top-0 z-[70] h-8 rounded-t-[32px] bg-[linear-gradient(to_bottom,rgba(0,0,0,0.3)_0px,rgba(0,0,0,0.3)_8px,transparent_32px)]";
