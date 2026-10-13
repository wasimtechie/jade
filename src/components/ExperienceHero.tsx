"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";
import React, { useMemo } from "react";
import GlassButton from "./GlassButton";
import GlassStatsBanner from "./GlassStatsBanner";
import {
  useCarouselAutoAdvance,
  useCarouselDirectionalNav,
} from "@/lib/carouselMotion";
import {
  heroSplitBgVariants,
  type HeroSplitCustom,
} from "@/lib/heroSplitCarouselVariants";
import {
  EXPERIENCE_HERO_CHROME_WIDTH_CLASS,
  EXPERIENCE_HERO_DESCRIPTION_CLASS,
  EXPERIENCE_HERO_HEADING_CLASS,
  EXPERIENCE_HERO_SAFE_BOTTOM_CLASS,
} from "@/lib/experienceHeroLayout";
import {
  ScrollLineIndicator,
  SCROLL_LINE_INDICATOR_CLICKABLE_CLASS,
} from "./ScrollLineIndicator";
import ResponsiveVideo, { type VideoSlug } from "./ResponsiveVideo";
import HeroVideoScrim from "@/components/ui/HeroVideoScrim";

export interface HeroButton {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

export interface HeroStat {
  value: string;
  label: string;
}

interface ExperienceHeroProps {
  /** Background image path (also used as video poster when videoSlug is set) */
  backgroundImage?: string;
  /** Multiple backgrounds — liquid big-frame crossfade (text stays static) */
  backgroundImages?: string[];
  /** Auto-advance interval when `backgroundImages` has 2+ items */
  backgroundAutoAdvanceMs?: number;
  /** Responsive hero video slug — landscape on desktop, portrait on mobile */
  videoSlug?: VideoSlug;
  /** Alt text for the background image */
  backgroundAlt: string;
  /** Main heading - supports line breaks via \n or ReactNode */
  heading: React.ReactNode;
  /** Description text below the heading */
  description: string;
  /** Two action buttons */
  buttons: [HeroButton, HeroButton];
  /** Optional stats bar (e.g. Corporate page) */
  stats?: HeroStat[];
  /** Optional extra content between description and buttons */
  children?: React.ReactNode;
  showScrollIndicator?: boolean;
  /** Element id of the next section (philosophy panel) */
  scrollTargetId?: string;
}

const ExperienceHero = React.forwardRef<HTMLElement, ExperienceHeroProps>(
  (
    {
      backgroundImage,
      backgroundImages,
      backgroundAutoAdvanceMs = 4500,
      videoSlug,
      backgroundAlt,
      heading,
      description,
      buttons,
      stats,
      children,
      showScrollIndicator = false,
      scrollTargetId,
    },
    ref,
  ) => {
    const reducedMotion = useReducedMotion();

    const backgroundSlides = useMemo(() => {
      const fromList = backgroundImages?.filter((src) => src?.trim()) ?? [];
      if (fromList.length > 0) return fromList;
      if (backgroundImage?.trim()) return [backgroundImage];
      return [];
    }, [backgroundImages, backgroundImage]);

    const { currentIndex, carouselCustom, goNext } = useCarouselDirectionalNav(
      backgroundSlides.length,
    );

    const activeBackground =
      backgroundSlides[currentIndex] ?? backgroundSlides[0] ?? "";

    const { pause: pauseBgLoop, resume: resumeBgLoop } = useCarouselAutoAdvance({
      onNext: goNext,
      enabled: !videoSlug && backgroundSlides.length > 1,
      intervalMs: backgroundAutoAdvanceMs,
    });

    const scrollToNext = () => {
      if (scrollTargetId) {
        document.getElementById(scrollTargetId)?.scrollIntoView({
          behavior: "smooth",
        });
        return;
      }
      if (ref && typeof ref !== "function") {
        ref.current?.nextElementSibling?.scrollIntoView({ behavior: "smooth" });
      }
    };

    const bgCarouselCustom: HeroSplitCustom = {
      dir: carouselCustom.dir,
      lowFx: !!reducedMotion,
    };

    const hasBgCarousel = !videoSlug && backgroundSlides.length > 1;

    return (
      <section
        ref={ref}
        className="major-section relative flex min-h-screen w-full flex-col items-center justify-end overflow-hidden"
        onMouseEnter={hasBgCarousel ? pauseBgLoop : undefined}
        onMouseLeave={hasBgCarousel ? resumeBgLoop : undefined}
        onFocusCapture={hasBgCarousel ? pauseBgLoop : undefined}
        onBlurCapture={hasBgCarousel ? resumeBgLoop : undefined}
      >
        {/* Background media */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {videoSlug ? (
            <>
              {backgroundImage ? (
                <Image
                  src={backgroundImage}
                  alt=""
                  fill
                  className="object-cover z-0"
                  priority
                  sizes="100vw"
                  aria-hidden
                />
              ) : null}
              <ResponsiveVideo
                slug={videoSlug}
                poster={backgroundImage}
                className="absolute inset-0 z-[1] h-full w-full object-cover [transform:translateZ(0)]"
              />
              <HeroVideoScrim />
            </>
          ) : hasBgCarousel ? (
            <div
              className="absolute inset-0"
              style={{ perspective: "1500px" }}
            >
              <AnimatePresence
                mode="sync"
                initial={false}
                custom={bgCarouselCustom}
              >
                <motion.div
                  key={`${currentIndex}-${activeBackground}`}
                  custom={bgCarouselCustom}
                  variants={heroSplitBgVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 h-full w-full"
                  style={{
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden",
                  }}
                >
                  <Image
                    src={activeBackground}
                    alt={backgroundAlt}
                    fill
                    className="object-cover"
                    priority={currentIndex === 0}
                    sizes="100vw"
                  />
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-0 bg-black/40" />
            </div>
          ) : activeBackground ? (
            <>
              <Image
                src={activeBackground}
                alt={backgroundAlt}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-black/40" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-[#1A1C1E] to-[#0B2C23]" />
          )}
        </div>

        {/* Content - Grouped at the Bottom */}
        <div
          className={`relative z-10 flex w-full max-w-5xl flex-col items-center px-4 text-center sm:px-6 page-wrapper ${EXPERIENCE_HERO_SAFE_BOTTOM_CLASS}`}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-0 flex flex-col items-center w-full"
          >
            {/* Logo */}
            <div
              className="relative w-[45px] h-[45px]"
              style={{ marginBottom: "clamp(4px, 0.96vw, 8px)" }}
            >
              <Image
                src="/assets/White_Logo.png"
                alt="Jade Logo"
                fill
                className="object-contain"
                sizes="45px"
              />
            </div>

            {/* Heading */}
            <h1
              className={EXPERIENCE_HERO_HEADING_CLASS}
              style={{ marginBottom: "clamp(4px, 0.96vw, 8px)" }}
            >
              {heading}
            </h1>

            {/* Description */}
            <p
              className={EXPERIENCE_HERO_DESCRIPTION_CLASS}
              style={{ marginBottom: "clamp(8px, 1.6vw, 12.8px)" }}
            >
              {description}
            </p>
          </motion.div>
          {/* Optional Extra Content (invisible observers, etc.) */}
          {children}
          {/* Stats strip + CTAs share one width lane so edges stay aligned */}
          <div
            className={`mt-4 flex w-full flex-col gap-2.5 sm:mt-5 ${EXPERIENCE_HERO_CHROME_WIDTH_CLASS}`}
          >
            {stats && stats.length > 0 && (
              <GlassStatsBanner stats={stats} marginBottom="mb-0" />
            )}
            <div className="flex w-full flex-row items-stretch justify-center gap-2.5">
              {buttons.map((btn, idx) => (
                <GlassButton
                  key={idx}
                  icon={btn.icon}
                  label={btn.label}
                  onClick={btn.onClick}
                />
              ))}
            </div>
          </div>
        </div>

        {showScrollIndicator && (
          <ScrollLineIndicator
            floating
            className={SCROLL_LINE_INDICATOR_CLICKABLE_CLASS}
            onClick={scrollToNext}
          />
        )}
      </section>
    );
  },
);

ExperienceHero.displayName = "ExperienceHero";

export default ExperienceHero;
