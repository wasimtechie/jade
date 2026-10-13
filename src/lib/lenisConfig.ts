/** Shared Lenis + programmatic scroll tuning (luxury / silk feel). */

export type LenisScrollPreset = "extreme" | "balanced" | "default";

/** Legacy alias — same as extreme */
export type SmoothScrollPreset = LenisScrollPreset | "weddings";

/**
 * Wheel follow — lower = silkier trail, higher = tighter (less input lag).
 * `default` kept for fallback / reduced scope experiments.
 */
export const LENIS_LERP = 0.09;

/**
 * Buttery-smooth + fast: lerp ~0.09–0.1 (Lenis sweet spot).
 * Too low (0.03–0.05) = pretty but slow; too high (>0.12) = harsh, not butter.
 */
export const EXTREME_LENIS_LERP_DESKTOP = 0.092;
/** If syncTouch is ever enabled on a tablet + mouse. */
export const EXTREME_LENIS_LERP_TOUCH = 0.1;
/** @deprecated Base preset table; runtime picks desktop vs touch lerp. */
export const EXTREME_LENIS_LERP = EXTREME_LENIS_LERP_DESKTOP;
/** Slight boost — more section travel per wheel tick, still smoothed by lerp. */
export const EXTREME_LENIS_WHEEL_MULTIPLIER = 1.1;
export const EXTREME_LENIS_TOUCH_MULTIPLIER = 1;
export const EXTREME_LENIS_SYNC_TOUCH_LERP = 0.1;
export const EXTREME_LENIS_ANCHOR_DURATION = 1.4;
export const EXTREME_LENIS_SCROLL_TO_DURATION = 1.25;
export const EXTREME_LENIS_EASING = (t: number) => 1 - Math.pow(1 - t, 4.5);

/** `/book` — same butter, slightly tighter for forms. */
export const BALANCED_LENIS_LERP_DESKTOP = 0.088;
export const BALANCED_LENIS_LERP_TOUCH = 0.1;
export const BALANCED_LENIS_LERP = BALANCED_LENIS_LERP_DESKTOP;
export const BALANCED_LENIS_WHEEL_MULTIPLIER = 1.04;
export const BALANCED_LENIS_TOUCH_MULTIPLIER = 1;
export const BALANCED_LENIS_SYNC_TOUCH_LERP = 0.09;
export const BALANCED_LENIS_ANCHOR_DURATION = 1.35;
export const BALANCED_LENIS_SCROLL_TO_DURATION = 1.35;
export const BALANCED_LENIS_EASING = (t: number) => 1 - Math.pow(1 - t, 5);

/** @deprecated Use EXTREME_LENIS_* */
export const WEDDINGS_LENIS_LERP = EXTREME_LENIS_LERP;
export const WEDDINGS_LENIS_WHEEL_MULTIPLIER = EXTREME_LENIS_WHEEL_MULTIPLIER;
export const WEDDINGS_LENIS_TOUCH_MULTIPLIER = EXTREME_LENIS_TOUCH_MULTIPLIER;
export const WEDDINGS_LENIS_SYNC_TOUCH_LERP = EXTREME_LENIS_SYNC_TOUCH_LERP;
export const WEDDINGS_LENIS_ANCHOR_DURATION = EXTREME_LENIS_ANCHOR_DURATION;
export const WEDDINGS_LENIS_SCROLL_TO_DURATION = EXTREME_LENIS_SCROLL_TO_DURATION;
export const WEDDINGS_LENIS_EASING = EXTREME_LENIS_EASING;

export const LENIS_WHEEL_MULTIPLIER = 0.88;
export const LENIS_TOUCH_MULTIPLIER = 1;
export const LENIS_SYNC_TOUCH_LERP = 0.075;

export const LENIS_SCROLL_TO_DURATION = 1.35;
export const VILLA_DETAIL_SCROLL_TO_DURATION = 2;
export const LENIS_EASING = (t: number) => 1 - Math.pow(1 - t, 4);

export const PANEL_SMOOTH_SCROLL_MS = 920;
export const PANEL_SCROLL_EASING = (t: number) => 1 - Math.pow(1 - t, 4);
export const PANEL_LENIS_LERP = 0.06;
export const PANEL_LENIS_WHEEL_MULTIPLIER = 0.9;

export function lenisSyncTouchEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

export function normalizeLenisPreset(
  preset: SmoothScrollPreset | undefined,
): LenisScrollPreset {
  if (preset === "weddings" || preset === "extreme") return "extreme";
  if (preset === "balanced") return "balanced";
  return "default";
}

/** Route → preset when `SmoothScroll` has no explicit `preset` prop. */
export function getLenisPresetFromPathname(pathname: string): LenisScrollPreset {
  const path = pathname.replace(/\/$/, "") || "/";
  if (path === "/book" || path.startsWith("/book/")) return "balanced";
  return "extreme";
}

export type LenisPointerProfile = "fine" | "coarse";

export function getLenisPointerProfile(): LenisPointerProfile {
  if (typeof window === "undefined") return "fine";
  return window.matchMedia("(pointer: coarse)").matches ? "coarse" : "fine";
}

export type LenisPresetConfig = {
  lerp: number;
  wheelMultiplier: number;
  touchMultiplier: number;
  syncTouchLerp: number;
  anchorDuration: number;
  scrollToDuration: number;
  easing: (t: number) => number;
};

export function getLenisPresetConfig(preset: LenisScrollPreset): LenisPresetConfig {
  if (preset === "balanced") {
    return {
      lerp: BALANCED_LENIS_LERP,
      wheelMultiplier: BALANCED_LENIS_WHEEL_MULTIPLIER,
      touchMultiplier: BALANCED_LENIS_TOUCH_MULTIPLIER,
      syncTouchLerp: BALANCED_LENIS_SYNC_TOUCH_LERP,
      anchorDuration: BALANCED_LENIS_ANCHOR_DURATION,
      scrollToDuration: BALANCED_LENIS_SCROLL_TO_DURATION,
      easing: BALANCED_LENIS_EASING,
    };
  }
  if (preset === "extreme") {
    return {
      lerp: EXTREME_LENIS_LERP,
      wheelMultiplier: EXTREME_LENIS_WHEEL_MULTIPLIER,
      touchMultiplier: EXTREME_LENIS_TOUCH_MULTIPLIER,
      syncTouchLerp: EXTREME_LENIS_SYNC_TOUCH_LERP,
      anchorDuration: EXTREME_LENIS_ANCHOR_DURATION,
      scrollToDuration: EXTREME_LENIS_SCROLL_TO_DURATION,
      easing: EXTREME_LENIS_EASING,
    };
  }
  return {
    lerp: LENIS_LERP,
    wheelMultiplier: LENIS_WHEEL_MULTIPLIER,
    touchMultiplier: LENIS_TOUCH_MULTIPLIER,
    syncTouchLerp: LENIS_SYNC_TOUCH_LERP,
    anchorDuration: 1.25,
    scrollToDuration: LENIS_SCROLL_TO_DURATION,
    easing: LENIS_EASING,
  };
}

export type LenisRuntimeOptions = LenisPresetConfig & {
  syncTouch: boolean;
};

/**
 * Per viewport:
 * - Phone/tablet: **native vertical touch** (syncTouch off) — OS momentum, one swipe clears height.
 * - Desktop: Lenis smooth wheel with higher lerp — silk without dragging through sections.
 * Never override touchInertiaExponent — Lenis default (1.7) is correct.
 */
export function getLenisRuntimeOptions(preset: LenisScrollPreset): LenisRuntimeOptions {
  const base = getLenisPresetConfig(preset);
  const profile = getLenisPointerProfile();

  if (profile === "coarse") {
    const touchLerp =
      preset === "balanced"
        ? BALANCED_LENIS_LERP_TOUCH
        : preset === "extreme"
          ? EXTREME_LENIS_LERP_TOUCH
          : LENIS_LERP;
    const touchMult =
      preset === "balanced"
        ? BALANCED_LENIS_TOUCH_MULTIPLIER
        : EXTREME_LENIS_TOUCH_MULTIPLIER;

    return {
      ...base,
      lerp: touchLerp,
      touchMultiplier: touchMult,
      syncTouchLerp: EXTREME_LENIS_SYNC_TOUCH_LERP,
      /** Native finger scroll — free + full section travel per swipe (no Lenis drag lag). */
      syncTouch: false,
    };
  }

  if (preset === "balanced") {
    return {
      ...base,
      lerp: BALANCED_LENIS_LERP_DESKTOP,
      wheelMultiplier: BALANCED_LENIS_WHEEL_MULTIPLIER,
      syncTouch: false,
    };
  }
  if (preset === "extreme") {
    return {
      ...base,
      lerp: EXTREME_LENIS_LERP_DESKTOP,
      wheelMultiplier: EXTREME_LENIS_WHEEL_MULTIPLIER,
      syncTouch: false,
    };
  }
  return { ...base, syncTouch: false };
}

/** @deprecated Use getLenisRuntimeOptions */
export function lenisSyncTouchEnabledForPreset(_preset: LenisScrollPreset): boolean {
  return getLenisRuntimeOptions(_preset).syncTouch;
}

/** @deprecated Use getLenisPresetFromPathname + getLenisPresetConfig */
export function isWeddingsRoute(): boolean {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  return path === "/weddings";
}
