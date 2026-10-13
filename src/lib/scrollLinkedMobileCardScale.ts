"use client";

import { useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { useMediaMinLg } from "@/lib/useMediaMinLg";

/** Inactive / neighbour cards on mobile + tablet vertical snap. */
export const SCROLL_LINKED_MOBILE_INACTIVE_CARD_SCALE = 0.6;

/**
 * Scale a scroll-linked card from full size at its snap centre to
 * {@link SCROLL_LINKED_MOBILE_INACTIVE_CARD_SCALE} one step away.
 * Distance interpolates smoothly while dragging either direction.
 */
export function scrollLinkedMobileCardScale(
  progress: number,
  index: number,
  totalSteps: number,
  inactiveScale = SCROLL_LINKED_MOBILE_INACTIVE_CARD_SCALE,
): number {
  if (totalSteps <= 0) return 1;
  const distance = Math.abs(index - progress * totalSteps);
  const t = Math.min(1, Math.max(0, distance));
  return 1 - t * (1 - inactiveScale);
}

/**
 * Mobile / tablet only — desktop and reduced-motion stay at scale 1.
 */
export function useScrollLinkedMobileCardScale(
  progress: MotionValue<number>,
  index: number,
  totalSteps: number,
): MotionValue<number> {
  const isLg = useMediaMinLg();
  const reducedMotion = useReducedMotion();

  return useTransform(progress, (p) => {
    if (isLg || reducedMotion) return 1;
    return scrollLinkedMobileCardScale(p, index, totalSteps);
  });
}
