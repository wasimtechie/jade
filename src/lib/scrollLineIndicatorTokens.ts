/**
 * Scroll cue — vertical line + white dot loop (subtle).
 */

export const SCROLL_LINE_DURATION_MS = 3000;

/** @deprecated Fluid via CSS vars */
export const SCROLL_LINE_DOT_SIZE_PX = 8;
/** @deprecated */
export const SCROLL_LINE_TRACK_HEIGHT_PX = 68;
/** @deprecated */
export const SCROLL_LINE_TRACK_WIDTH_PX = 44;

export const SCROLL_LINE_TRACK_CLASS = "jade-scroll-track relative shrink-0";

/** @deprecated Use SCROLL_LINE_TRACK_CLASS */
export const SCROLL_LINE_MOUSE_CLASS = SCROLL_LINE_TRACK_CLASS;

export const SCROLL_LINE_TRACK_LINE_CLASS =
  "jade-scroll-track-line pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2";

export const SCROLL_LINE_WHEEL_CLASS = "jade-scroll-wheel absolute left-1/2 top-0 z-[1]";

export const SCROLL_LINE_INDICATOR_HERO_WRAPPER_CLASS =
  "absolute inset-x-0 bottom-0 z-20 flex justify-center pointer-events-none";

export const SCROLL_LINE_INDICATOR_ROOT_GAP_CLASS =
  "jade-scroll-cue-inner flex flex-col items-center";

export const SCROLL_LINE_INDICATOR_CLICKABLE_CLASS =
  "pointer-events-auto cursor-pointer transition-[opacity,transform] duration-500 ease-out hover:-translate-y-px";

/** @deprecated */
export const SCROLL_LINE_MOUSE_RING_CLASS = "hidden";
/** @deprecated */
export const SCROLL_LINE_STEM_CLASS = "hidden";
/** @deprecated */
export const SCROLL_LINE_TRACK_FILL_CLASS = "hidden";
/** @deprecated */
export const SCROLL_LINE_CROWN_CLASS = "hidden";
/** @deprecated */
export const SCROLL_LINE_CAPTION_ROW_CLASS = "hidden";
/** @deprecated */
export const SCROLL_LINE_CAPTION_CLASS = "hidden";
/** @deprecated */
export const SCROLL_LINE_CAPTION_JEWEL_CLASS = "hidden";
/** @deprecated */
export const SCROLL_LINE_TRACK_SHIMMER_CLASS = "hidden";
/** @deprecated */
export const SCROLL_LINE_DIAMOND_CLASS = "hidden";
/** @deprecated */
export const SCROLL_LINE_OUTER_RING_CLASS = "hidden";
/** @deprecated */
export const SCROLL_LINE_WHEEL_CARRIER_CLASS = "hidden";
/** @deprecated */
export const SCROLL_LINE_WHEEL_GHOST_CLASS = "hidden";
/** @deprecated */
export const SCROLL_LINE_CAPTION_FLANK_CLASS = "hidden";
/** @deprecated */
export const SCROLL_LINE_CAPTION_FLANK_RIGHT_CLASS = "hidden";
/** @deprecated */
export const SCROLL_LINE_CAPTION_LINE_CLASS = "hidden";
/** @deprecated */
export const SCROLL_LINE_WHEEL_SLOT_CLASS = "hidden";
/** @deprecated */
export const SCROLL_LINE_WHEEL_RAIL_CLASS = "hidden";
/** @deprecated */
export const SCROLL_LINE_CHEVRONS_CLASS = "hidden";
