/**
 * Mobile / tablet snap carousel — same contract as Featured Villas §6.
 * Desktop keeps free scroll (`scrollMode="mobileSnapOnly"` is inactive at lg+).
 */

/** Featured §6 baseline — 6 steps (intro + cards + CTA). */
const SNAP_BASELINE_STEP_COUNT = 6;
/** Vertical scroll budget for card snaps — higher = slower / more travel per card. */
const SNAP_ZONE_VH = 280;
const SNAP_EXIT_VH = 12;
/** Commit to adjacent card once drag crosses this fraction of a step. */
export const MOBILE_SNAP_COMMIT_THRESHOLD = 0.28;

/** Featured-parity hook step count — aligns snap positions with card `index / cardStepCount`. */
export function scrollLinkedMobileSnapHookStepCount(
  cardStepCount: number,
): number {
  return cardStepCount + 1;
}

export function scrollLinkedMobileSnapHeight(stepCount: number): number {
  const scaledSnap = Math.round(
    SNAP_ZONE_VH * (Math.max(2, stepCount) / SNAP_BASELINE_STEP_COUNT),
  );
  return scaledSnap + SNAP_EXIT_VH;
}

/** Share of vertical scroll used for card snaps; remainder exits to the next section. */
export function scrollLinkedMobileSnapPortion(stepCount: number): number {
  const total = scrollLinkedMobileSnapHeight(stepCount);
  return (total - SNAP_EXIT_VH) / total;
}

/**
 * Cap snapped progress on the end CTA-only stage (after the final card),
 * matching Featured Villas CTA slide index — not the last content card.
 */
export function scrollLinkedMobileSnapMaxProgress(
  panelCount: number,
  totalSteps: number,
): number {
  if (totalSteps <= 0 || panelCount <= 0) return 1;
  return Math.min(1, panelCount / totalSteps);
}

/** Progress at which the vertical “scroll on” cue appears (Featured parity). */
export function scrollLinkedMobileSnapEndZone(
  panelCount: number,
  totalSteps: number,
): number {
  return scrollLinkedMobileSnapMaxProgress(panelCount, totalSteps) - 0.02;
}

export type MobileSnapProgressOptions = {
  /** Hook step count (cardStepCount + 1). */
  stepCount: number;
  snapZoneRatio: number;
  snapMaxProgress: number;
};

export function mobileSnapMaxIndex(options: MobileSnapProgressOptions): number {
  return Math.max(1, options.stepCount - 1);
}

/** Highest snap index that still lands on a carousel card (respects CTA cap). */
export function mobileSnapMaxCardIndex(
  options: MobileSnapProgressOptions,
): number {
  const maxIndex = mobileSnapMaxIndex(options);
  return Math.min(
    maxIndex,
    Math.round(options.snapMaxProgress * maxIndex + 1e-6),
  );
}

/** Continuous (unrounded) card index from raw section scroll progress. */
export function mobileSnapContinuousIndex(
  progress: number,
  options: MobileSnapProgressOptions,
): number {
  const maxIndex = mobileSnapMaxIndex(options);
  const { snapZoneRatio: zone, snapMaxProgress } = options;
  if (progress >= zone) {
    return snapMaxProgress * maxIndex;
  }
  const carouselP = Math.min(1, Math.max(0, progress / zone));
  return carouselP * maxIndex;
}

export function mobileSnapIndexFromProgress(
  progress: number,
  options: MobileSnapProgressOptions,
): number {
  return Math.round(mobileSnapContinuousIndex(progress, options));
}

/** Page scrollY that centres snap index `index` (matches snap-on-release write path). */
export function mobileSnapScrollYForIndex(
  section: HTMLElement,
  index: number,
  options: MobileSnapProgressOptions,
): number {
  const scrollable = Math.max(1, section.offsetHeight - window.innerHeight);
  const maxIndex = mobileSnapMaxIndex(options);
  const snappedProgress = Math.min(index / maxIndex, options.snapMaxProgress);
  return section.offsetTop + snappedProgress * scrollable;
}

/**
 * One gesture → at most one adjacent card.
 * Slight drag past {@link MOBILE_SNAP_COMMIT_THRESHOLD} commits; long drag still caps at ±1.
 */
export function resolveMobileSnapGestureTargetIndex(
  anchorIndex: number,
  progress: number,
  options: MobileSnapProgressOptions,
  commitThreshold = MOBILE_SNAP_COMMIT_THRESHOLD,
): number {
  const maxCard = mobileSnapMaxCardIndex(options);
  const continuous = mobileSnapContinuousIndex(progress, options);
  const delta = continuous - anchorIndex;
  let target = anchorIndex;
  if (delta > commitThreshold) target = anchorIndex + 1;
  else if (delta < -commitThreshold) target = anchorIndex - 1;
  return Math.max(0, Math.min(maxCard, target));
}

/** First card snap threshold in scroll progress — below half of this, exit scroll-up is free. */
export function mobileSnapEntryThreshold(options: MobileSnapProgressOptions): number {
  const maxIndex = Math.max(1, options.stepCount - 1);
  return (options.snapZoneRatio / maxIndex) * 0.55;
}

export function isInMobileSnapEntryZone(
  progress: number,
  options: MobileSnapProgressOptions,
): boolean {
  return progress <= mobileSnapEntryThreshold(options);
}

export function isInMobileSnapExitZone(
  progress: number,
  options: MobileSnapProgressOptions,
): boolean {
  return progress >= options.snapZoneRatio * 0.98;
}

/**
 * Snap scroll progress to card centres — floor bias near entry so a slight scroll-up
 * is not rounded forward to the next card (which pins the section fullscreen).
 */
export function computeMobileSnappedProgress(
  progress: number,
  options: MobileSnapProgressOptions,
): number {
  const { stepCount, snapZoneRatio: zone, snapMaxProgress } = options;
  const maxIndex = Math.max(1, stepCount - 1);

  if (progress >= zone) {
    return snapMaxProgress;
  }

  const carouselP = Math.min(1, Math.max(0, progress / zone));
  const entryThreshold = mobileSnapEntryThreshold(options);
  const useFloor = progress < entryThreshold;
  const snappedIndex = useFloor
    ? Math.floor(carouselP * maxIndex + 1e-6)
    : Math.round(carouselP * maxIndex);

  return Math.min(snappedIndex / maxIndex, snapMaxProgress);
}
