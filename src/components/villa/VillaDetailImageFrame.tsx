"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import JadeImage from "@/components/ui/JadeImage";
import CarouselSwipeLayer from "@/components/ui/CarouselSwipeLayer";
import {
  heroSplitCardVariants,
  type HeroSplitCustom,
} from "@/lib/heroSplitCarouselVariants";
import { VILLA_DETAIL_SPACING } from "@/components/villa/villaDetailSpacing";

const vd = VILLA_DETAIL_SPACING;

type VillaDetailImageFrameProps = {
  imageKey: string;
  src: string;
  alt: string;
  onPrev: () => void;
  onNext: () => void;
  slideCount: number;
  aspectClassName?: string;
  imageClassName?: string;
  sizes?: string;
  onPauseAuto?: () => void;
  onResumeAuto?: () => void;
  children?: React.ReactNode;
};

export default function VillaDetailImageFrame({
  imageKey,
  src,
  alt,
  onPrev,
  onNext,
  slideCount,
  aspectClassName = vd.mediaStageFrame,
  imageClassName = "object-cover object-center",
  sizes = "(max-width: 768px) 100vw, 800px",
  onPauseAuto,
  onResumeAuto,
  children,
}: VillaDetailImageFrameProps) {
  const reducedMotion = useReducedMotion();
  const [direction, setDirection] = useState(0);

  const carouselCustom: HeroSplitCustom = {
    dir: direction,
    lowFx: !!reducedMotion,
  };

  const wrappedPrev = useCallback(() => {
    setDirection(-1);
    onPrev();
  }, [onPrev]);

  const wrappedNext = useCallback(() => {
    setDirection(1);
    onNext();
  }, [onNext]);

  return (
    <div
      className={clsx(
        "relative w-full rounded-none overflow-hidden group bg-black/30",
        aspectClassName,
      )}
      onMouseEnter={onPauseAuto}
      onMouseLeave={onResumeAuto}
      onFocusCapture={onPauseAuto}
      onBlurCapture={onResumeAuto}
    >
      <AnimatePresence mode="sync" initial={false} custom={carouselCustom}>
        <motion.div
          key={imageKey}
          custom={carouselCustom}
          variants={heroSplitCardVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
          style={{ willChange: "transform" }}
        >
          <JadeImage
            src={src}
            alt={alt}
            fill
            className={imageClassName}
            sizes={sizes}
            loading="lazy"
          />
        </motion.div>
      </AnimatePresence>
      <CarouselSwipeLayer
        onPrev={wrappedPrev}
        onNext={wrappedNext}
        slideCount={slideCount}
        className="absolute inset-0 z-[8] touch-pan-y"
      />
      {children}
    </div>
  );
}
