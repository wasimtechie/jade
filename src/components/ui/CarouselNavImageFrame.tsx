"use client";

import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { useCarouselSwipeDragProps } from "@/lib/carouselMotion";
import {
  heroSplitCardVariants,
  type HeroSplitCustom,
} from "@/lib/heroSplitCarouselVariants";

export type CarouselNavImageFrameProps = {
  frameClassName?: string;
  slideKey: string | number;
  imageSrc: string;
  alt: string;
  slideCount: number;
  carouselCustom: HeroSplitCustom;
  onPrev: () => void;
  onNext: () => void;
  sizes?: string;
  priority?: boolean;
  imageClassName?: string;
  /** Featured-villa corner arrows; `none` = swipe/drag only */
  navLayout?: "corners" | "none";
  /** When true, horizontal swipe/drag only below `lg`; desktop uses arrows / free scroll */
  swipeMobileOnly?: boolean;
  /** Disable image swipe/drag entirely (arrows only) — lets a parent surface own the drag */
  enableSwipe?: boolean;
  children?: React.ReactNode;
};

/**
 * Mini-frame parity: drag on the slide shell (CarouselHeroMiniFrame), direction-aware
 * enter/exit via heroSplitCardVariants, nav controls outside the drag layer.
 */
export default function CarouselNavImageFrame({
  frameClassName,
  slideKey,
  imageSrc,
  alt,
  slideCount,
  carouselCustom,
  onPrev,
  onNext,
  sizes = "100vw",
  priority = false,
  imageClassName = "object-cover",
  navLayout = "none",
  swipeMobileOnly = false,
  enableSwipe = true,
  children,
}: CarouselNavImageFrameProps) {
  const showCornerNav = navLayout === "corners" && slideCount > 1;
  const miniCardSwipeProps = useCarouselSwipeDragProps(
    onPrev,
    onNext,
    enableSwipe && slideCount > 1,
    { mobileOnly: swipeMobileOnly },
  );
  const swipeDrag = miniCardSwipeProps.drag === "x";

  const stopNavClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <div className={clsx("relative h-full w-full overflow-hidden", frameClassName)}>
      <motion.div
        className={clsx(
          "relative h-full w-full",
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
            className="absolute inset-0 h-full w-full"
            style={{ willChange: "transform" }}
          >
            <Image
              src={imageSrc}
              alt={alt}
              fill
              className={imageClassName}
              sizes={sizes}
              priority={priority}
              draggable={false}
            />
            {children}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {showCornerNav ? (
        <>
          <button
            type="button"
            onClick={(e) => stopNavClick(e, onPrev)}
            aria-label="Previous image"
            className="absolute bottom-0 left-0 z-[40] cursor-pointer rounded-none border-r border-t border-white/10 bg-black/40 p-4 text-white backdrop-blur-md transition-colors hover:bg-[#EFCD62] hover:text-black"
          >
            <ChevronRight className="h-6 w-6 rotate-180" />
          </button>
          <button
            type="button"
            onClick={(e) => stopNavClick(e, onNext)}
            aria-label="Next image"
            className="absolute bottom-0 right-0 z-[40] cursor-pointer rounded-none border-l border-t border-white/10 bg-black/40 p-4 text-white backdrop-blur-md transition-colors hover:bg-[#EFCD62] hover:text-black"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      ) : null}
    </div>
  );
}
