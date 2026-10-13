"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import PrimaryButton from "./PrimaryButton";
import { experienceCarouselDefaults } from "@/lib/experienceCarouselLayout";
import {
  heroSplitCardVariants,
  type HeroSplitCustom,
} from "@/lib/heroSplitCarouselVariants";
import CarouselSwipeLayer from "@/components/ui/CarouselSwipeLayer";

interface Slide {
  title: string;
  desc: string;
  image: string;
}

interface ExperienceCarouselSectionProps {
  label: string;
  title: string;
  slides: Slide[];
  ctaText: string;
  ctaLink?: string;
  onCtaClick?: () => void;
  aspectClass?: string;
  buttonClassName?: string;
  buttonContainerClassName?: string;
  containerClassName?: string;
  innerClassName?: string;
}

export default function ExperienceCarouselSection({
  label,
  title,
  slides,
  ctaText,
  ctaLink,
  onCtaClick,
  aspectClass = experienceCarouselDefaults.aspectClass,
  buttonClassName = "",
  buttonContainerClassName = experienceCarouselDefaults.buttonContainerClassName,
  containerClassName = experienceCarouselDefaults.containerClassName,
  innerClassName = experienceCarouselDefaults.innerClassName,
}: ExperienceCarouselSectionProps) {
  const [activeSlide, setActiveSlide] = React.useState(0);
  const [direction, setDirection] = React.useState(0);
  const reducedMotion = useReducedMotion();
  const carouselCustom: HeroSplitCustom = {
    dir: direction,
    lowFx: !!reducedMotion,
  };
  const slidesRef = useRef(slides);
  slidesRef.current = slides;

  useEffect(() => {
    const list = slidesRef.current;
    const n = list.length;
    if (n <= 1) return;
    for (const j of [(activeSlide + 1) % n, (activeSlide - 1 + n) % n]) {
      const src = list[j]?.image?.trim();
      if (src) {
        const img = new window.Image();
        img.src = src;
      }
    }
  }, [activeSlide]);

  const nextSlide = () => {
    setDirection(1);
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };
  const prevSlide = () => {
    setDirection(-1);
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  /** Encode paths with spaces etc. — Next/Image expects valid URL paths */
  const imageSrc =
    slides[activeSlide]?.image
      ?.trim()
      ?.replace(/ /g, "%20")
      .replace(/#/g, "%23")
      .replace(/\?/g, "%3F") ?? "";

  return (
    <section className={containerClassName}>
      <div className={innerClassName}>
        {/* Header Area */}
        <div className="relative z-10 shrink-0 mb-[clamp(0.75rem,1.76vw,1.75rem)]">
          <p
            className="text-[#EFCD62] text-gh-label font-bold tracking-[0.3em] uppercase font-manrope mb-[clamp(4px,0.8vw,9.6px)]"
          >
            {label}
          </p>
          <div className="flex items-center justify-between gap-[clamp(0.75rem,1.6vw,1.5rem)]">
            <h2 className="text-gh-h2 font-philosopher text-white leading-tight">
              {title}
            </h2>
            <div className="flex gap-2 sm:gap-2.5 md:gap-3 shrink-0">
              <button
                type="button"
                onClick={prevSlide}
                className="flex h-10 w-10 items-center justify-center rounded-none border border-white/15 bg-transparent text-white backdrop-blur-2xl transition-all hover:border-white/35 md:h-14 md:w-14"
              >
                <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 stroke-[1.25]" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="flex h-10 w-10 items-center justify-center rounded-none border border-white/15 bg-transparent text-white backdrop-blur-2xl transition-all hover:border-white/35 md:h-14 md:w-14"
              >
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6 stroke-[1.25]" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Content — direction-aware mini-frame slide */}
        <div
          className={`relative shrink-0 ${aspectClass}`}
          style={{
            minHeight: "clamp(360px, 62.4vmin, 576px)",
            perspective: "1500px",
          }}
        >
          <AnimatePresence mode="sync" initial={false} custom={carouselCustom}>
            <motion.div
              key={activeSlide}
              custom={carouselCustom}
              variants={heroSplitCardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{ willChange: "transform" }}
              className="absolute inset-0 overflow-hidden rounded-sm bg-[#121417]"
            >
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={slides[activeSlide].title}
                  fill
                  sizes="(max-width: 768px) 100vw, 896px"
                  className="object-cover object-center opacity-90"
                  priority={activeSlide === 0}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#121417] to-black/80" />
              )}

              <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

              <div className="absolute inset-x-0 bottom-0 z-[2] flex flex-col items-center justify-end pb-[clamp(1.25rem,2.8vw,2.75rem)] px-[clamp(1rem,3vw,2rem)] sm:px-6 md:px-8 text-center">
                <h3
                  className="text-gh-h3 md:text-gh-h2 font-philosopher text-white mb-[clamp(4px,0.96vw,9.6px)]"
                >
                  {slides[activeSlide]?.title}
                </h3>
                <p className="text-white/75 font-manrope text-gh-body max-w-2xl mx-auto leading-relaxed">
                  {slides[activeSlide]?.desc}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
          <CarouselSwipeLayer
            onPrev={prevSlide}
            onNext={nextSlide}
            slideCount={slides.length}
            className="absolute inset-0 z-[8] touch-pan-y cursor-grab active:cursor-grabbing"
          />
        </div>

        {/* Action Button */}
        <div
          className={`relative z-10 w-full shrink-0 ${buttonContainerClassName}`}
        >
          <PrimaryButton
            width="section"
            className={buttonClassName || undefined}
            href={ctaLink}
            onClick={onCtaClick}
          >
            {ctaText}
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}
