"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CarouselHeroScrim from "./CarouselHeroScrim";
import {
  carouselHeroCopyRoot,
  carouselHeroHeadlineClass,
  carouselHeroLabelClass,
  carouselHeroSubtextClass,
} from "@/lib/carouselHeroCopy";
import NavbarThemeTrigger from "./NavbarThemeTrigger";
import SectionWrapper from "./SectionWrapper";
import { JADE_CHARCOAL } from "@/lib/jadeSectionColors";
import {
  useCarouselSwipeDragProps,
  usePreloadNeighborSlideImages,
} from "@/lib/carouselMotion";
import CarouselSwipeLayer from "@/components/ui/CarouselSwipeLayer";
import CarouselHeroMiniFrame from "@/components/ui/CarouselHeroMiniFrame";
import {
  heroSplitBgVariants,
  type HeroSplitCustom,
} from "@/lib/heroSplitCarouselVariants";

const AMENITIES = [
  {
    title: "WHAT COMES WITH STAYING AT JADE",
    heading: ["Culinary", "Experiences"],
    subtext:
      "From private chef dinners to starlit barbecues crafted in your villa.",
    tags: ["Private Chef", "Barbecue Setup", "Custom Menus"],
    bgImage:
      "/Home Page/What Comes With Staying At Jade/culinary experiences.webp",
    cardImage:
      "/Home Page/What Comes With Staying At Jade/culinary experiences 2.webp",
  },
  {
    title: "WHAT COMES WITH STAYING AT JADE",
    heading: ["Leisure &", "Entertainment"],
    subtext:
      "Immersive games, private pools, and home theatre screening rooms.",
    tags: ["Private Pools", "Home Theatre", "Indoor Games"],
    bgImage:
      "/Home Page/What Comes With Staying At Jade/leisure & enterta....webp",
    cardImage: "/Home Page/What Comes With Staying At Jade/leisure & ....webp",
  },
  {
    title: "WHAT COMES WITH STAYING AT JADE",
    heading: ["Wellness", "& Nature"],
    subtext:
      "Alfresco dining, lush lawns, and open-air decks in serene surroundings.",
    tags: ["Expansive Lawns", "Alfresco Dining", "Open Decks"],
    bgImage:
      "/Home Page/What Comes With Staying At Jade/Wellness & Nature.webp",
    cardImage:
      "/Home Page/What Comes With Staying At Jade/Wellness & Naturee.webp",
  },
  {
    title: "WHAT COMES WITH STAYING AT JADE",
    heading: ["Seamless", "Hospitality"],
    subtext: "Round-the-clock concierge support and premium housekeeping.",
    tags: ["24/7 Support", "Housekeeping", "Butler Service"],
    bgImage: "/Experiences/Corporate Retreats/1-Hero/xhero.webp",
    cardImage: "/Experiences/Weekend Getaways/1-Hero/casual stays.webp",
  },
];

export default function JadeAmenitiesSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  const currentSlide = AMENITIES[currentIndex];

  usePreloadNeighborSlideImages(AMENITIES, currentIndex);

  const carouselCustom: HeroSplitCustom = {
    dir: direction,
    lowFx: !!reducedMotion,
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? AMENITIES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === AMENITIES.length - 1 ? 0 : prev + 1));
  };

  const miniCardSwipeProps = useCarouselSwipeDragProps(handlePrev, handleNext);

  return (
    <SectionWrapper
      ref={sectionRef}
      bg={JADE_CHARCOAL}
      className="min-h-0 md:min-h-screen w-full overflow-hidden flex flex-col"
    >
      <NavbarThemeTrigger theme="white" sectionRef={sectionRef} />

      {/* ── TOP AREA (75vh mobile / 80vh desktop) — background image ── */}
      <div
        className="relative w-full h-[75vh] md:h-[80vh] z-0 overflow-hidden shrink-0 bg-jade-green pointer-events-none"
        style={{ perspective: "1500px" }}
      >
        {/* Background Overlay Pattern for the Green part */}
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

        <CarouselHeroScrim variant="upper" />

        <CarouselSwipeLayer
          onPrev={handlePrev}
          onNext={handleNext}
          slideCount={AMENITIES.length}
          className="pointer-events-auto"
        />

        {/* ── TEXT ── */}
        <div className={carouselHeroCopyRoot}>
          <motion.p
            key={`label-${currentIndex}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={carouselHeroLabelClass}
            style={{ marginBottom: "clamp(4px, 0.64vw, 8px)" }}
          >
            {currentSlide.title}
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
            transition={{ delay: 0.06, duration: 0.38 }}
            className={carouselHeroSubtextClass}
          >
            {currentSlide.subtext}
          </motion.p>
        </div>
      </div>

      {/* ── BOTTOM AREA ── */}
      <div className="relative w-full h-[12vh] md:h-[20vh] z-10 bg-jade-charcoal" />

      {/* ── SPACER — exactly 40px gap ── */}
      <div className="hidden md:block h-[40px] bg-jade-charcoal" />

      {/* ── ARROWS ── */}
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
