"use client";

import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { carouselHeroMiniCardShadow } from "@/lib/carouselHeroCopy";
import {
  heroSplitCardVariants,
  type HeroSplitCustom,
} from "@/lib/heroSplitCarouselVariants";

type CarouselHeroMiniFrameProps = {
  /** Unique per slide — drives AnimatePresence (include index + image id when async). */
  slideKey: string | number;
  carouselCustom: HeroSplitCustom;
  miniCardSwipeProps: Record<string, unknown>;
  children: React.ReactNode;
};

/**
 * Hero-split seam mini card — direction-aware slide via heroSplitCardVariants
 * (no horizontal strip rewind on index wrap).
 */
export default function CarouselHeroMiniFrame({
  slideKey,
  carouselCustom,
  miniCardSwipeProps,
  children,
}: CarouselHeroMiniFrameProps) {
  const swipeDrag = miniCardSwipeProps.drag === "x";

  return (
    <div
      className={`absolute top-[75vh] md:top-[80vh] -translate-y-1/2 left-1/2 -translate-x-1/2 z-30 w-[45vw] max-w-[280px] sm:w-[35vw] sm:max-w-[320px] lg:w-[24vw] lg:max-w-[380px] xl:w-[20vw] aspect-[4/3] ${carouselHeroMiniCardShadow} overflow-hidden border border-white/20`}
    >
      <motion.div
        className={clsx(
          "relative w-full h-full",
          swipeDrag && "cursor-grab active:cursor-grabbing",
        )}
        dragElastic={swipeDrag ? 0.12 : 0}
        {...miniCardSwipeProps}
      >
        <AnimatePresence mode="sync" initial={false} custom={carouselCustom}>
          <motion.div
            key={slideKey}
            custom={carouselCustom}
            variants={heroSplitCardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
            style={{ willChange: "transform" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
