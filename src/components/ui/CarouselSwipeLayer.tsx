"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { useCarouselSwipeDragProps } from "@/lib/carouselMotion";

type CarouselSwipeLayerProps = {
  onPrev: () => void;
  onNext: () => void;
  slideCount: number;
  className?: string;
  /** Legacy: touch-only below lg */
  mobileOnly?: boolean;
};

export default function CarouselSwipeLayer({
  onPrev,
  onNext,
  slideCount,
  className,
  mobileOnly = false,
}: CarouselSwipeLayerProps) {
  const dragProps = useCarouselSwipeDragProps(
    onPrev,
    onNext,
    slideCount > 1,
    { mobileOnly },
  );

  if (slideCount <= 1 || dragProps.drag === false) return null;

  return (
    <motion.div
      aria-hidden
      className={clsx(
        "absolute inset-0 z-[15] touch-pan-y cursor-grab active:cursor-grabbing",
        className,
      )}
      {...dragProps}
    />
  );
}
