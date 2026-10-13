/**
 * Shared hero “glass chrome”: sharp corners, translucent fill, gradient edge frame.
 * Stats strip + VENUES/BROCHURE — single source; use GlassChromePanel for DOM parity.
 */

/** 1px gradient rim (semi-linear highlights) */
export const GLASS_EDGE_GRADIENT =
  "rounded-none bg-[linear-gradient(142deg,hsla(0,0%,100%,0.52)_0%,hsla(0,0%,100%,0.08)_38%,hsla(0,0%,100%,0.18)_68%,hsla(0,0%,100%,0.09)_100%)]";

/** Inner glass slab — identical tint/blur on banner + buttons */
export const GLASS_INNER_SURFACE =
  "rounded-none bg-black/[0.09] backdrop-blur-2xl backdrop-saturate-150 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.045)]";

export const GLASS_PANEL_SHADOW =
  "shadow-[0_10px_40px_-8px_rgba(0,0,0,0.45)]";

export const GLASS_OUTER_SHELL = "rounded-none overflow-hidden p-px";

/** Full frame: shell + gradient border + shadow (same on stats + CTAs) */
export const GLASS_CHROME_FRAME_CLASS = [
  GLASS_OUTER_SHELL,
  GLASS_EDGE_GRADIENT,
  GLASS_PANEL_SHADOW,
  "relative isolate",
].join(" ");

/** Reset native <button> paint so only glass tokens show (no grey button face) */
export const GLASS_BUTTON_RESET_CLASS =
  "appearance-none border-0 bg-transparent p-0 font-inherit text-inherit cursor-pointer [-webkit-tap-highlight-color:transparent]";

/** Content row above the glass slab */
export const GLASS_CHROME_CONTENT_CLASS =
  "relative z-10 flex w-full min-h-0 bg-transparent";
