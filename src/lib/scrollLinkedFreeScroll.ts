/** Manual horizontal navigation tuning for scroll-linked sticky sections. */

/** Pointer gain — near 1:1; scaling happens in {@link horizontalDragToScrollDelta}. */
export const SCROLL_LINKED_DRAG_FACTOR = 1.0;
/** Mobile finger swipe gain — slightly quicker free swipe (cards advance a touch faster). */
export const SCROLL_LINKED_MOBILE_DRAG_FACTOR = 1.35;

/** Extra multiplier on trackpad horizontal wheel */
export const SCROLL_LINKED_WHEEL_FACTOR = 1.15;

/**
 * ~55% of viewport width horizontal drag ≈ one panel step (mobile completes in one swipe).
 */
export const SCROLL_LINKED_SWIPE_VIEWPORT_RATIO = 0.55;

/**
 * Mobile vertical scroll → panel drift sensitivity. Kept near 1:1 so cards track the
 * native scroll directly (responsive, not sticky); a small boost adds "slight high
 * sensitivity" without a long end dead-zone (dead-zone ≈ 1 − 1/gain of the section).
 */
export const SCROLL_LINKED_FREE_MOBILE_PROGRESS_GAIN = 1.12;

/**
 * Pinned section height (vh). Shorter mobile heights make the free cards traverse more
 * readily (drift feel) instead of needing a full screen of scroll per card.
 */
export const SCROLL_LINKED_SECTION_VH = {
  home: { mobile: 400, desktop: 560 },
  experiences: { mobile: 400, desktop: 560 },
  wedding: { mobile: 440, desktop: 440 },
} as const;

function readSectionScrollableHeight(sectionEl: HTMLElement): number {
  return Math.max(1, sectionEl.offsetHeight - window.innerHeight);
}

/**
 * Map horizontal finger/wheel delta (px) → vertical scroll delta for scroll-linked sections.
 * A moderate horizontal swipe advances ~one card without feeling sticky or hyper-sensitive.
 */
export function horizontalDragToScrollDelta(
  deltaX: number,
  sectionEl: HTMLElement | null,
  stepCount: number,
  pointerGain = 1,
): number {
  if (!deltaX || !sectionEl) return 0;

  const scrollable = readSectionScrollableHeight(sectionEl);
  const steps = Math.max(1, stepCount);
  const pxPerStep = scrollable / steps;
  const swipeSpan = Math.max(
    280,
    window.innerWidth * SCROLL_LINKED_SWIPE_VIEWPORT_RATIO,
  );
  const scrollPerFingerPx = (pxPerStep / swipeSpan) * pointerGain;

  return -deltaX * scrollPerFingerPx;
}
