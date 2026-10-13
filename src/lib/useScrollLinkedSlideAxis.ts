"use client";

import { useTransform, type MotionValue } from "framer-motion";
import { useMediaMinLg } from "@/lib/useMediaMinLg";

export type ScrollLinkedSlideAxis = "horizontal" | "vertical";

/** Desktop: horizontal carousel. Mobile / tablet: vertical snap stack. */
export function useScrollLinkedSlideAxis(): ScrollLinkedSlideAxis {
  const isLg = useMediaMinLg();
  return isLg ? "horizontal" : "vertical";
}

/** Map signed slide offset to x or y based on viewport axis. */
export function useScrollLinkedAxisMotion(
  slideOffset: MotionValue<number>,
  axis: ScrollLinkedSlideAxis,
): { x: MotionValue<number>; y: MotionValue<number> } {
  const x = useTransform(slideOffset, (v) => (axis === "horizontal" ? v : 0));
  const y = useTransform(slideOffset, (v) => (axis === "vertical" ? v : 0));
  return { x, y };
}
