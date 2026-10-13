"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import NavbarThemeTrigger from "./NavbarThemeTrigger";
import SectionWrapper from "./SectionWrapper";
import { JADE_GREEN } from "@/lib/jadeSectionColors";
import CarouselHeroScrim from "./CarouselHeroScrim";
import SectionSeamFeather from "./SectionSeamFeather";
import {
  carouselHeroCopyRoot,
  carouselHeroHeadlineClass,
  carouselHeroLabelClass,
  carouselHeroSubtextClass,
} from "@/lib/carouselHeroCopy";
import {
  CAROUSEL_CROSSFADE,
  useCarouselSwipeDragProps,
  usePreloadNeighborSlideImages,
} from "@/lib/carouselMotion";
import CarouselSwipeLayer from "@/components/ui/CarouselSwipeLayer";
import CarouselHeroMiniFrame from "@/components/ui/CarouselHeroMiniFrame";
import {
  heroSplitBgVariants,
  type HeroSplitCustom,
} from "@/lib/heroSplitCarouselVariants";

const SLIDES = [
  {
    id: 1,
    label: "THE VALUE JADE PROVIDES",
    heading: ["Private Villas", "around Bangalore"],
    subtext:
      "Located in serene yet accessible pockets around Bangalore, offering privacy without disconnect.",
    bgImage:
      "/Home Page/The Value Jade Provides/Private Villa Retreats aroundBangalore 1.webp",
    cardImage:
      "/Home Page/The Value Jade Provides/Private Villa Retreats around Bangalore 2.webp",
  },
  {
    id: 2,
    label: "THE VALUE JADE PROVIDES",
    heading: ["Distinctive,", "themed stays"],
    subtext:
      "From luxury pool VILLAS and glass homes to landscaped farm estates — each space chosen for its character and versatility.",
    bgImage:
      "/Home Page/The Value Jade Provides/Distinctive Themed Villa Retreats 1.webp",
    cardImage:
      "/Home Page/The Value Jade Provides/Distinctive Themed Villa Retreats 2.webp",
  },
  {
    id: 3,
    label: "THE VALUE JADE PROVIDES",
    heading: ["Curated", "experiences"],
    subtext:
      "More than just a stay — from private chef dining and starlit barbecues to curated recreational setups tailored precisely for you.",
    bgImage: "/Home Page/The Value Jade Provides/curated exp 1.webp",
    cardImage: "/Home Page/The Value Jade Provides/curated exp2.webp",
  },
];

export default function ValuePropositionSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  const currentSlide = SLIDES[currentIndex];

  usePreloadNeighborSlideImages(SLIDES, currentIndex);

  const carouselCustom: HeroSplitCustom = {
    dir: direction,
    lowFx: !!reducedMotion,
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  };

  const miniCardSwipeProps = useCarouselSwipeDragProps(handlePrev, handleNext);

  return (
    <SectionWrapper
      ref={sectionRef}
      bg={JADE_GREEN}
      className="min-h-0 md:min-h-screen w-full overflow-hidden flex flex-col"
    >
      <NavbarThemeTrigger theme="white" sectionRef={sectionRef} />

      {/* Split-hero stack — mobile uses SectionSeamFeather across image + lower band */}
      <div className="relative w-full shrink-0">
        <div
          className="relative w-full h-[75vh] md:h-[80vh] z-0 overflow-hidden bg-jade-green pointer-events-none"
          style={{ perspective: "1500px" }}
        >
          <AnimatePresence mode="sync" initial={false} custom={carouselCustom}>
            <motion.div
              key={`bg-${currentIndex}`}
              custom={carouselCustom}
              variants={heroSplitBgVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 w-full h-full"
              style={{
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
              }}
            >
              <Image
                src={currentSlide.bgImage}
                alt="Background"
                fill
                className="object-cover"
                sizes="100vw"
                priority={currentIndex === 0}
              />
            </motion.div>
          </AnimatePresence>

          <CarouselHeroScrim variant="value" />

          <CarouselSwipeLayer
            onPrev={handlePrev}
            onNext={handleNext}
            slideCount={SLIDES.length}
            className="pointer-events-auto"
          />

          {/* ── TEXT — sits inside the image zone ── */}
          <div className={carouselHeroCopyRoot}>
            <motion.p
              key={`label-${currentIndex}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={carouselHeroLabelClass}
              style={{ marginBottom: "clamp(4px, 0.64vw, 8px)" }}
            >
              {currentSlide.label}
            </motion.p>
            <div style={{ marginBottom: "clamp(4px, 0.96vw, 8px)" }}>
              <h2 className={carouselHeroHeadlineClass}>
                {currentSlide.heading.join(" ")}
              </h2>
            </div>
            <motion.p
              key={`sub-${currentIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.08, duration: CAROUSEL_CROSSFADE.duration }}
              className={carouselHeroSubtextClass}
            >
              {currentSlide.subtext}
            </motion.p>
          </div>
        </div>

        {/* ── BOTTOM AREA ── */}
        <div className="relative w-full h-[12vh] md:h-[20vh] z-0 bg-jade-green" />

        <SectionSeamFeather />
      </div>

      {/* ── SPACER — exactly 40px gap ── */}
      <div className="hidden md:block h-[40px] bg-jade-green shrink-0" />

      {/* ── ARROWS — straddling the seam ── */}
      <button
        onClick={handlePrev}
        aria-label="Previous"
        className="absolute left-4 sm:left-8 lg:left-16 xl:left-28 top-[75vh] md:top-[80vh] -translate-y-1/2 p-3 sm:p-4 lg:p-5 bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all shadow-md z-30 border border-white/10 group"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white group-hover:-translate-x-1 transition-transform" />
      </button>

      <button
        onClick={handleNext}
        aria-label="Next"
        className="absolute right-4 sm:right-8 lg:right-16 xl:right-28 top-[75vh] md:top-[80vh] -translate-y-1/2 p-3 sm:p-4 lg:p-5 bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all shadow-md z-30 border border-white/10 group"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white group-hover:translate-x-1 transition-transform" />
      </button>

      <CarouselHeroMiniFrame
        slideKey={`card-${currentIndex}`}
        carouselCustom={carouselCustom}
        miniCardSwipeProps={miniCardSwipeProps}
      >
        <Image
          src={currentSlide.cardImage}
          alt="Feature"
          fill
          className="object-cover"
          sizes="(max-width: 640px) 55vw, (max-width: 1024px) 45vw, 32vw"
          priority={currentIndex === 0}
          loading="eager"
        />
      </CarouselHeroMiniFrame>
    </SectionWrapper>
  );
}
