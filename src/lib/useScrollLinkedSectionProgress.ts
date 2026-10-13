"use client";

import { useMemo, useRef } from "react";
import {
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  useScrollLinkedManualNavigation,
  type ScrollLinkedStageNavigation,
  type ScrollLinkedSnapBoundary,
} from "@/lib/useScrollLinkedManualNavigation";
import { useMediaMinLg } from "@/lib/useMediaMinLg";
import { SCROLL_LINKED_FREE_MOBILE_PROGRESS_GAIN } from "@/lib/scrollLinkedFreeScroll";
import { computeMobileSnappedProgress } from "@/lib/scrollLinkedMobileSnap";

export type ScrollLinkedScrollMode = "free" | "mobileSnapOnly";

export type UseScrollLinkedSectionProgressOptions = {
  scrollMode?: ScrollLinkedScrollMode;
  /** Panel steps (cards + end CTA) — used for swipe distance scaling */
  stepCount?: number;
  smoothSpring?: boolean;
  /** Mobile snap only — lower = less vertical scroll before the next card snaps in */
  mobileSnapDwellRatio?: number;
  /** Mobile snap — amplified scroll + optional light dwell */
  mobileSnapAggressive?: boolean;
  /** Passed to aggressive snap (default scrollGain 2.1) */
  mobileSnapScrollGain?: number;
  /** Share of section scroll used for card snaps; remainder is exit runway to next section */
  mobileSnapZoneRatio?: number;
  /** Cap snapped progress so horizontal carousel stops at last card (Featured CTA) */
  mobileSnapMaxProgress?: number;
  /** Manual swipe/drag + horizontal wheel navigation (default: on for all sections) */
  enableManualNavigation?: boolean;
  /** Show swipe/drag hint while the section is first explored */
  showHorizontalHint?: boolean;
  /** End-of-section vertical scroll cue (default on even when horizontal hint is off) */
  showVerticalHint?: boolean;
};

export type UseScrollLinkedSectionProgressResult = {
  targetRef: React.RefObject<HTMLElement | null>;
  panelProgress: MotionValue<number>;
  scrollYProgress: MotionValue<number>;
  stageNavigation: ScrollLinkedStageNavigation | null;
};

export function useScrollLinkedSectionProgress(
  options: UseScrollLinkedSectionProgressOptions = {},
): UseScrollLinkedSectionProgressResult {
  const {
    scrollMode = "free",
    stepCount = 2,
    mobileSnapZoneRatio = 0.68,
    mobileSnapMaxProgress,
    enableManualNavigation,
    showHorizontalHint = true,
    showVerticalHint = true,
  } = options;

  const targetRef = useRef<HTMLElement>(null);
  const isLg = useMediaMinLg();
  const { scrollYProgress } = useScroll({ target: targetRef });

  const mobileSnapActive = scrollMode === "mobileSnapOnly" && !isLg;

  /**
   * Featured-mobile snap: round raw scroll → nearest card index, then spring to it.
   * Pure rounding guarantees a card always settles dead-centre (never between two),
   * and is symmetric — a slight or long swipe, forward or reverse, snaps the same
   * smooth way. The cap stops the carousel on the final card (CTA) while the leftover
   * scroll runway exits to the next section.
   */
  const snapMaxProgress = mobileSnapMaxProgress ?? 1;
  const snapBoundary: ScrollLinkedSnapBoundary | undefined = useMemo(
    () =>
      mobileSnapActive
        ? {
            stepCount,
            snapZoneRatio: mobileSnapZoneRatio,
            snapMaxProgress,
          }
        : undefined,
    [mobileSnapActive, stepCount, mobileSnapZoneRatio, snapMaxProgress],
  );

  const roundedSnapInput = useTransform(scrollYProgress, (p) => {
    if (snapBoundary) {
      return computeMobileSnappedProgress(p, snapBoundary);
    }
    const maxIndex = Math.max(1, stepCount - 1);
    const zone = mobileSnapZoneRatio > 0 ? mobileSnapZoneRatio : 1;
    const carouselP = Math.min(1, Math.max(0, p / zone));
    const snapped = Math.round(carouselP * maxIndex) / maxIndex;
    return Math.min(snapped, snapMaxProgress);
  });

  const snappedProgress = useSpring(roundedSnapInput, {
    stiffness: 115,
    damping: 36,
    mass: 0.58,
    restDelta: 0.0005,
  });

  /**
   * Free mode raw input — scroll position (mobile gets a small sensitivity boost).
   * This is the target the carousel glides toward.
   */
  const freeProgressInput = useTransform(scrollYProgress, (p) => {
    if (isLg || mobileSnapActive) return p;
    return Math.min(1, p * SCROLL_LINKED_FREE_MOBILE_PROGRESS_GAIN);
  });

  /**
   * Premium-carousel momentum on desktop only. Mobile uses direct scroll mapping so
   * cards track native touch momentum 1:1 — a spring here lags behind and reads as
   * jerk/stutter when sticky sections pin.
   */
  const freeSmoothed = useSpring(freeProgressInput, {
    stiffness: 380,
    damping: 26,
    mass: 0.3,
    restDelta: 0.0005,
  });

  const freeProgress = isLg ? freeSmoothed : freeProgressInput;

  /** Featured-mobile snaps to centred cards; free sections glide (direct on mobile). */
  const panelProgress: MotionValue<number> = mobileSnapActive
    ? snappedProgress
    : freeProgress;

  const manualNavEnabled = enableManualNavigation ?? true;

  const stageNavigation = useScrollLinkedManualNavigation({
    enabled: manualNavEnabled,
    showHint: showHorizontalHint,
    showVerticalHint,
    sectionRef: targetRef,
    stepCount,
    snapBoundary,
    // Only the snap carousel re-aligns on release; free sections settle freely so a
    // slight touch never jumps the just-pinned section to fill the screen.
    snapOnRelease: scrollMode === "mobileSnapOnly",
    verticalCarouselMobile: mobileSnapActive,
  });

  return {
    targetRef,
    panelProgress,
    scrollYProgress,
    stageNavigation: manualNavEnabled ? stageNavigation : null,
  };
}
