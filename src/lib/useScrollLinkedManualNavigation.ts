"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PanInfo } from "framer-motion";
import { getLenis } from "@/lib/lenis";
import { subscribeLenisScroll } from "@/lib/lenisScrollBridge";
import {
  SCROLL_LINKED_DRAG_FACTOR,
  SCROLL_LINKED_MOBILE_DRAG_FACTOR,
  SCROLL_LINKED_WHEEL_FACTOR,
  horizontalDragToScrollDelta,
} from "@/lib/scrollLinkedFreeScroll";
import {
  computeMobileSnappedProgress,
  isInMobileSnapEntryZone,
  isInMobileSnapExitZone,
  mobileSnapIndexFromProgress,
  mobileSnapMaxCardIndex,
  mobileSnapScrollYForIndex,
  resolveMobileSnapGestureTargetIndex,
  type MobileSnapProgressOptions,
} from "@/lib/scrollLinkedMobileSnap";

export type ScrollLinkedSnapBoundary = MobileSnapProgressOptions;

export type UseScrollLinkedManualNavigationOptions = {
  enabled: boolean;
  showHint?: boolean;
  /** End-of-section “scroll down” cue — independent from horizontal hint */
  showVerticalHint?: boolean;
  sectionRef?: React.RefObject<HTMLElement | null>;
  /** Panel steps in the section (cards + end CTA) — drives swipe distance per card */
  stepCount?: number;
  /** Mobile snap — entry/exit dead zones + aligned snap math (see scrollLinkedMobileSnap). */
  snapBoundary?: ScrollLinkedSnapBoundary;
  /**
   * Snap the page scroll to the nearest card step when a drag/swipe ends. Only the
   * snap (`mobileSnapOnly`) carousel wants this — for free sections it causes a jarring
   * jump (e.g. snapping a just-pinned section to fill the screen on a slight touch).
   */
  snapOnRelease?: boolean;
  /** Mobile / tablet vertical snap — native scroll only (no sideways swipe). */
  verticalCarouselMobile?: boolean;
};

export type ScrollLinkedStageNavigation = {
  stageRef: React.RefObject<HTMLDivElement | null>;
  onPanStart: (event: PointerEvent) => void;
  onPan: (event: PointerEvent, info: PanInfo) => void;
  onPanEnd: () => void;
  showHint: boolean;
  showVerticalHint: boolean;
  dismissHint: () => void;
  isDragging: boolean;
};

const NO_PAN_SELECTOR = "[data-jade-stage-no-pan]";
const TOUCH_AXIS_LOCK_PX = 10;
/** Horizontal gesture must clearly out-pace vertical before we claim the swipe. */
const HORIZONTAL_LOCK_BIAS = 1.3;

function pointerGain(pointerType?: string): number {
  if (pointerType === "touch" || pointerType === "pen") {
    return SCROLL_LINKED_MOBILE_DRAG_FACTOR;
  }
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return SCROLL_LINKED_MOBILE_DRAG_FACTOR;
  }
  return SCROLL_LINKED_DRAG_FACTOR;
}

function scrollByDelta(dy: number): void {
  if (!dy) return;
  const isCoarse =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;
  const lenis = getLenis();

  // Mobile uses native touch scroll (Lenis syncTouch off) — scrollBy keeps momentum in sync.
  if (isCoarse || !lenis) {
    window.scrollBy(0, dy);
    return;
  }

  lenis.scrollTo(lenis.scroll + dy, { immediate: true });
}

function resolveSectionEl(
  sectionRef: React.RefObject<HTMLElement | null> | undefined,
  stageEl: HTMLElement | null,
): HTMLElement | null {
  if (sectionRef?.current) return sectionRef.current;
  return stageEl?.closest("section") ?? null;
}

function readSectionProgress(sectionEl: HTMLElement): number {
  const scrollable = Math.max(1, sectionEl.offsetHeight - window.innerHeight);
  return Math.max(
    0,
    Math.min(1, (window.scrollY - sectionEl.offsetTop) / scrollable),
  );
}

/** True when scrollY is inside this section's pinned travel range (not above/below it). */
function isSectionInActiveScrollRange(
  section: HTMLElement,
  tolerancePx = 8,
): boolean {
  const scrollY = window.scrollY;
  const top = section.offsetTop;
  const scrollable = Math.max(1, section.offsetHeight - window.innerHeight);
  const maxY = top + scrollable;
  return scrollY >= top - tolerancePx && scrollY <= maxY + tolerancePx;
}

function snapSectionToNearestStep(
  sectionRef: React.RefObject<HTMLElement | null> | undefined,
  stageEl: HTMLElement | null,
  stepCount: number,
  snapBoundary?: ScrollLinkedSnapBoundary,
): void {
  const section = resolveSectionEl(sectionRef, stageEl);
  if (!section) return;

  const scrollable = Math.max(1, section.offsetHeight - window.innerHeight);
  const progress = readSectionProgress(section);

  if (snapBoundary) {
    if (
      isInMobileSnapEntryZone(progress, snapBoundary) ||
      isInMobileSnapExitZone(progress, snapBoundary)
    ) {
      return;
    }
    const snappedProgress = computeMobileSnappedProgress(progress, snapBoundary);
    const targetY = section.offsetTop + snappedProgress * scrollable;
    const dy = targetY - window.scrollY;
    if (Math.abs(dy) < 3) return;
    scrollByDelta(dy);
    return;
  }

  const maxIndex = Math.max(1, stepCount - 1);
  const snappedProgress = Math.round(progress * maxIndex) / maxIndex;
  const targetY = section.offsetTop + snappedProgress * scrollable;
  const dy = targetY - window.scrollY;

  if (Math.abs(dy) < 3) return;
  scrollByDelta(dy);
}

function scrollToYImmediate(y: number): void {
  const lenis = getLenis();
  const isCoarse =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;
  if (isCoarse || !lenis) {
    window.scrollTo({ top: y, behavior: "auto" });
    return;
  }
  lenis.scrollTo(y, { immediate: true });
}

/** Hold scroll inside ±1 card of the gesture anchor while the finger is down / settling. */
function clampScrollToAdjacentCards(
  section: HTMLElement,
  anchorIndex: number,
  snapBoundary: ScrollLinkedSnapBoundary,
): void {
  if (
    isInMobileSnapEntryZone(readSectionProgress(section), snapBoundary) ||
    isInMobileSnapExitZone(readSectionProgress(section), snapBoundary)
  ) {
    return;
  }

  const maxCard = mobileSnapMaxCardIndex(snapBoundary);
  const minIndex = Math.max(0, anchorIndex - 1);
  const maxIndex = Math.min(maxCard, anchorIndex + 1);
  const minY = mobileSnapScrollYForIndex(section, minIndex, snapBoundary);
  const maxY = mobileSnapScrollYForIndex(section, maxIndex, snapBoundary);
  const y = window.scrollY;
  if (y < minY - 1) scrollToYImmediate(minY);
  else if (y > maxY + 1) scrollToYImmediate(maxY);
}

export function useScrollLinkedManualNavigation({
  enabled,
  showHint: showHintOption = true,
  showVerticalHint: showVerticalHintOption = true,
  sectionRef,
  stepCount = 2,
  snapBoundary,
  snapOnRelease = true,
  verticalCarouselMobile = false,
}: UseScrollLinkedManualNavigationOptions): ScrollLinkedStageNavigation {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const ignorePanRef = useRef(false);
  const pointerTypeRef = useRef<string>("mouse");
  const [isDragging, setIsDragging] = useState(false);
  const [showHint, setShowHint] = useState(enabled && showHintOption);
  const [showVerticalHint, setShowVerticalHint] = useState(
    enabled && showVerticalHintOption,
  );
  const lastScrollYRef = useRef(0);

  const dismissHint = useCallback(() => setShowHint(false), []);
  const dismissVerticalHint = useCallback(() => setShowVerticalHint(false), []);

  const applyHorizontalDelta = useCallback(
    (deltaX: number, gain: number) => {
      const section = resolveSectionEl(sectionRef, stageRef.current);
      const dy = horizontalDragToScrollDelta(deltaX, section, stepCount, gain);
      scrollByDelta(dy);
    },
    [sectionRef, stepCount],
  );

  useEffect(() => {
    if (!enabled || !showVerticalHint) return;

    const onScrollSample = (scroll: number) => {
      const section = resolveSectionEl(sectionRef, stageRef.current);
      if (!section) return;

      const progress = readSectionProgress(section);
      const delta = scroll - lastScrollYRef.current;
      lastScrollYRef.current = scroll;

      // Dismiss only when user scrolls down near the section tail (leaving the end card).
      if (progress > 0.94 && delta > 8) {
        dismissVerticalHint();
      }
    };

    const onWindowScroll = () => onScrollSample(window.scrollY);
    window.addEventListener("scroll", onWindowScroll, { passive: true });

    const unsub = subscribeLenisScroll(({ scroll }) => onScrollSample(scroll));

    lastScrollYRef.current = getLenis()?.scroll ?? window.scrollY;
    return () => {
      window.removeEventListener("scroll", onWindowScroll);
      unsub();
    };
  }, [enabled, showVerticalHint, sectionRef, dismissVerticalHint]);

  /**
   * Mobile / tablet vertical snap — one finger gesture advances at most one card,
   * whether the drag is short or long. Clamps mid-gesture and settles on release.
   */
  useEffect(() => {
    if (!enabled || !verticalCarouselMobile || !snapBoundary) return;

    let touching = false;
    let anchorIndex = 0;
    let settleUntil = 0;
    let settleTargetIndex: number | null = null;
    let settleRaf = 0;

    const activeSection = () => {
      const section = resolveSectionEl(sectionRef, stageRef.current);
      if (!section || !isSectionInActiveScrollRange(section)) return null;
      return section;
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const section = activeSection();
      if (!section) return;
      const progress = readSectionProgress(section);
      if (
        isInMobileSnapEntryZone(progress, snapBoundary) ||
        isInMobileSnapExitZone(progress, snapBoundary)
      ) {
        return;
      }
      touching = true;
      settleTargetIndex = null;
      anchorIndex = mobileSnapIndexFromProgress(progress, snapBoundary);
      dismissHint();
    };

    const onScrollClamp = () => {
      const section = activeSection();
      if (!section) return;

      if (touching) {
        clampScrollToAdjacentCards(section, anchorIndex, snapBoundary);
        return;
      }

      if (settleTargetIndex == null || performance.now() > settleUntil) {
        settleTargetIndex = null;
        return;
      }

      const targetY = mobileSnapScrollYForIndex(
        section,
        settleTargetIndex,
        snapBoundary,
      );
      if (Math.abs(window.scrollY - targetY) > 2) {
        scrollToYImmediate(targetY);
      }
    };

    const finishGesture = () => {
      if (!touching) return;
      touching = false;
      const section = activeSection();
      if (!section) return;

      const progress = readSectionProgress(section);
      if (
        isInMobileSnapEntryZone(progress, snapBoundary) ||
        isInMobileSnapExitZone(progress, snapBoundary)
      ) {
        return;
      }

      const targetIndex = resolveMobileSnapGestureTargetIndex(
        anchorIndex,
        progress,
        snapBoundary,
      );
      settleTargetIndex = targetIndex;
      settleUntil = performance.now() + 420;
      scrollToYImmediate(
        mobileSnapScrollYForIndex(section, targetIndex, snapBoundary),
      );

      if (settleRaf) cancelAnimationFrame(settleRaf);
      const tick = () => {
        if (settleTargetIndex == null || performance.now() > settleUntil) {
          settleTargetIndex = null;
          settleRaf = 0;
          return;
        }
        onScrollClamp();
        settleRaf = requestAnimationFrame(tick);
      };
      settleRaf = requestAnimationFrame(tick);
    };

    window.addEventListener("touchstart", onTouchStart, {
      passive: true,
      capture: true,
    });
    window.addEventListener("touchend", finishGesture, {
      passive: true,
      capture: true,
    });
    window.addEventListener("touchcancel", finishGesture, {
      passive: true,
      capture: true,
    });
    window.addEventListener("scroll", onScrollClamp, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart, true);
      window.removeEventListener("touchend", finishGesture, true);
      window.removeEventListener("touchcancel", finishGesture, true);
      window.removeEventListener("scroll", onScrollClamp);
      if (settleRaf) cancelAnimationFrame(settleRaf);
    };
  }, [enabled, verticalCarouselMobile, snapBoundary, sectionRef, dismissHint]);

  useEffect(() => {
    if (!enabled || verticalCarouselMobile) return;
    const el = stageRef.current;
    if (!el) return;

    const onWheel = (event: WheelEvent) => {
      const absX = Math.abs(event.deltaX);
      const absY = Math.abs(event.deltaY);
      if (absX <= absY) return;
      event.preventDefault();
      // Trackpad deltaX sign is opposite pan/touch — invert so swipe-right advances forward.
      applyHorizontalDelta(-event.deltaX, SCROLL_LINKED_WHEEL_FACTOR);
      dismissHint();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [enabled, verticalCarouselMobile, dismissHint, applyHorizontalDelta]);

  // Mobile horizontal finger swipe — scaled to section width (Framer pan alone is 1:1 px → too stiff).
  useEffect(() => {
    if (!enabled || verticalCarouselMobile) return;
    const el = stageRef.current;
    if (!el) return;

    let touchId: number | null = null;
    let lastX = 0;
    let axisLocked: "none" | "horizontal" | "vertical" = "none";
    let originX = 0;
    let originY = 0;

    const resetTouch = () => {
      touchId = null;
      axisLocked = "none";
      if (draggingRef.current) {
        draggingRef.current = false;
        setIsDragging(false);
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const target = event.target as Element | null;
      if (target?.closest(NO_PAN_SELECTOR)) return;

      const touch = event.touches[0];
      touchId = touch.identifier;
      lastX = touch.clientX;
      originX = touch.clientX;
      originY = touch.clientY;
      axisLocked = "none";
    };

    const onTouchMove = (event: TouchEvent) => {
      if (touchId === null) return;
      const touch = Array.from(event.touches).find((t) => t.identifier === touchId);
      if (!touch) return;

      const dx = touch.clientX - originX;
      const dy = touch.clientY - originY;

      if (axisLocked === "none") {
        if (Math.abs(dx) < TOUCH_AXIS_LOCK_PX && Math.abs(dy) < TOUCH_AXIS_LOCK_PX) {
          return;
        }
        // Strong vertical bias: only claim the horizontal swipe on a clearly sideways
        // gesture AND once the section is actually pinned. While it is still scrolling
        // into view, leave scrolling fully native so it never jumps to cover the screen.
        const section = resolveSectionEl(sectionRef, el);
        const horizontalIntent =
          Math.abs(dx) > Math.abs(dy) * HORIZONTAL_LOCK_BIAS &&
          !!section &&
          isSectionInActiveScrollRange(section);
        axisLocked = horizontalIntent ? "horizontal" : "vertical";
        if (axisLocked === "vertical") {
          resetTouch();
          return;
        }
        draggingRef.current = true;
        setIsDragging(true);
        dismissHint();
      }

      if (axisLocked !== "horizontal") return;

      event.preventDefault();
      const step = touch.clientX - lastX;
      lastX = touch.clientX;
      applyHorizontalDelta(step, SCROLL_LINKED_MOBILE_DRAG_FACTOR);
    };

    const onTouchEnd = () => {
      if (snapOnRelease && axisLocked === "horizontal") {
        snapSectionToNearestStep(sectionRef, el, stepCount, snapBoundary);
      }
      resetTouch();
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [enabled, verticalCarouselMobile, dismissHint, applyHorizontalDelta, sectionRef, stepCount, snapOnRelease, snapBoundary]);

  const onPanStart = useCallback(
    (event: PointerEvent) => {
      if (!enabled || verticalCarouselMobile) return;
      if (event.pointerType === "touch") return;
      const target = event?.target as Element | null;
      if (target && target.closest(NO_PAN_SELECTOR)) {
        ignorePanRef.current = true;
        return;
      }
      ignorePanRef.current = false;
      pointerTypeRef.current = event.pointerType;
      draggingRef.current = true;
      setIsDragging(true);
      dismissHint();
    },
    [enabled, verticalCarouselMobile, dismissHint],
  );

  const onPan = useCallback(
    (_event: PointerEvent, info: PanInfo) => {
      if (!enabled || verticalCarouselMobile || ignorePanRef.current || !draggingRef.current) return;
      applyHorizontalDelta(info.delta.x, pointerGain(pointerTypeRef.current));
    },
    [enabled, verticalCarouselMobile, applyHorizontalDelta],
  );

  const onPanEnd = useCallback(() => {
    if (verticalCarouselMobile) return;
    if (snapOnRelease && !ignorePanRef.current && enabled) {
      snapSectionToNearestStep(sectionRef, stageRef.current, stepCount, snapBoundary);
    }
    ignorePanRef.current = false;
    draggingRef.current = false;
    setIsDragging(false);
  }, [enabled, verticalCarouselMobile, sectionRef, stepCount, snapOnRelease, snapBoundary]);

  return {
    stageRef,
    onPanStart,
    onPan,
    onPanEnd,
    showHint: enabled && showHint && !verticalCarouselMobile,
    showVerticalHint: enabled && showVerticalHint,
    dismissHint,
    isDragging,
  };
}
