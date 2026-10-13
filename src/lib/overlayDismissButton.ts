/** Shared dismiss (X) control for modal / sheet overlays. */

export const OVERLAY_DISMISS_BUTTON_BASE =
  "w-12 h-12 rounded-full bg-[#124131] flex items-center justify-center text-white hover:bg-[#1f5c48] transition-colors shadow-2xl flex-shrink-0";

/** Fixed to viewport — horizontally centered at top (safe-area aware). */
export const OVERLAY_DISMISS_BUTTON_VIEWPORT_TOP_CLASS = `fixed left-0 right-0 mx-auto top-[max(0.75rem,env(safe-area-inset-top,0px))] z-[102] ${OVERLAY_DISMISS_BUTTON_BASE}`;

/**
 * Mobile bottom sheets — 1rem lip between dismiss control and sheet top
 * (matches {@link EXPERIENCE_OVERLAY_MOBILE_CLOSE_FRAME_GAP_REM}).
 */
export const OVERLAY_DISMISS_ABOVE_SHEET_GAP_CLASS = "mb-4";

/** In-flow dismiss for mobile bottom sheets inside a `justify-end` flex host. */
export const OVERLAY_DISMISS_ABOVE_SHEET_MOBILE_CLASS = `md:hidden pointer-events-auto shrink-0 ${OVERLAY_DISMISS_BUTTON_BASE} ${OVERLAY_DISMISS_ABOVE_SHEET_GAP_CLASS}`;
