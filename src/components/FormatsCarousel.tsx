"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CAROUSEL_CROSSFADE } from "@/lib/carouselMotion";
import CarouselSwipeLayer from "@/components/ui/CarouselSwipeLayer";
import {
  heroSplitCardVariants,
  type HeroSplitCustom,
} from "@/lib/heroSplitCarouselVariants";

interface Format {
  title: string;
  description: string;
  image1: string;
  image2: string;
}

const FORMATS: Format[] = [
  {
    title: "Corporate Team Outings",
    description:
      "Private pool VILLAS with sprawling lawns designed for structured activities, team engagement, and relaxed downtime. Suitable for both intimate groups and larger gatherings.",
    image1:
      "/Experiences/Corporate Retreats/2-Formats/corporate team outings.webp",
    image2:
      "/Experiences/Corporate Retreats/2-Formats/offsite and work....webp",
  },
  {
    title: "Offsites & Workations",
    description:
      "Inspiring workspaces with presentation setups and high-speed Wi-Fi, complemented by customised meals and curated team-building activities.",
    image1: "/Experiences/Corporate Retreats/2-Formats/offsite and work....webp",
    image2: "/Experiences/Corporate Retreats/2-Formats/corporate team outings.webp",
  },
  {
    title: "Conference & Recognition Meets",
    description:
      "Elegant indoor-outdoor setups with LED screens and structured seating, tailored for reward and recognition ceremonies, followed by curated dinners, drinks, and DJ-led evenings.",
    image1:
      "/Experiences/Corporate Retreats/2-Formats/Conference and....webp",
    image2: "/Experiences/Corporate Retreats/2-Formats/offsite and work....webp",
  },
  {
    title: "Corporate Events & Parties",
    description:
      "Ideal for celebrating milestones, company anniversaries, success parties, and employee appreciation ceremonies in private, well-curated settings.",
    image1: "/Experiences/Corporate Retreats/2-Formats/corporate team outings.webp",
    image2:
      "/Experiences/Corporate Retreats/2-Formats/offsite and work....webp",
  },
];

export default function FormatsCarousel() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const reducedMotion = useReducedMotion();

  const carouselCustom: HeroSplitCustom = {
    dir: direction,
    lowFx: !!reducedMotion,
  };

  useEffect(() => {
    const n = FORMATS.length;
    if (n <= 1) return;
    for (const j of [(index + 1) % n, (index - 1 + n) % n]) {
      const f = FORMATS[j];
      [f.image1, f.image2].forEach((src) => {
        if (src?.trim()) {
          const img = new window.Image();
          img.src = src;
        }
      });
    }
  }, [index]);

  const next = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % FORMATS.length);
  };

  const prev = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + FORMATS.length) % FORMATS.length);
  };

  return (
    <div className="flex h-full min-h-0 w-full max-w-7xl flex-col mx-auto px-4 lg:justify-center lg:px-8 lg:py-fluid-md">
      {/* SECTION HEADER */}
      <div className="flex shrink-0 flex-col pt-3 pb-2 lg:pb-6">
        <p className="text-[#EFCD62] text-gh-label font-bold tracking-[0.2em] uppercase mb-2 font-manrope lg:mb-3">
          CORPORATE EXPERIENCE AT JADE
        </p>
        <div className="flex items-center justify-between w-full">
          <h2 className="text-gh-h1 font-philosopher text-white">Formats</h2>
          <div className="flex gap-px pt-1 lg:pt-2">
            <button
              onClick={prev}
              className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center border border-white/10 bg-[#1E2023] hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </button>
            <button
              onClick={next}
              className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center border border-white/10 bg-[#1E2023] hover:bg-white/10 transition-colors"
            >
              <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] gap-2 lg:grid-cols-2 lg:grid-rows-none lg:items-center lg:gap-10">
        {/* Static image frame — size never animates; slides move inside */}
        <div className="relative order-1 min-h-0 lg:max-h-[min(62dvh,640px)] lg:flex lg:items-center lg:justify-center">
          <div
            className="relative h-full min-h-0 w-full overflow-hidden contain-[layout_paint] lg:aspect-[4/5] lg:h-auto lg:max-h-[min(62dvh,640px)] lg:w-full"
          >
            <AnimatePresence mode="sync" initial={false} custom={carouselCustom}>
              <motion.div
                key={index}
                custom={carouselCustom}
                variants={heroSplitCardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                style={{ willChange: "transform" }}
                className="absolute inset-0 flex flex-col"
              >
                <div className="flex h-full flex-col">
                  <div className="relative min-h-0 flex-1 w-full overflow-hidden">
                    <Image
                      src={FORMATS[index].image1}
                      alt={FORMATS[index].title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority={index === 0}
                    />
                  </div>
                  <div className="relative min-h-0 flex-1 w-full overflow-hidden border-t border-white/5">
                    <Image
                      src={FORMATS[index].image2}
                      alt={FORMATS[index].title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <CarouselSwipeLayer
              onPrev={prev}
              onNext={next}
              slideCount={FORMATS.length}
            />
          </div>
        </div>

        {/* Copy — fixed min-height; absolute crossfade so layout never shifts */}
        <div className="relative order-2 min-h-[6.25rem] shrink-0 pb-3 lg:min-h-[11rem] lg:pb-0 lg:pl-2">
          <div className="relative min-h-[inherit] w-full lg:min-h-[11rem]">
            <AnimatePresence mode="sync" initial={false}>
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: CAROUSEL_CROSSFADE.duration,
                  ease: CAROUSEL_CROSSFADE.ease,
                }}
                className="absolute inset-x-0 top-0 w-full lg:top-1/2 lg:-translate-y-1/2"
              >
                <h3 className="text-gh-scroll font-philosopher text-white mb-1.5 lg:mb-3">
                  {FORMATS[index].title}
                </h3>
                <p className="text-white/70 font-manrope text-gh-body leading-relaxed max-w-xl line-clamp-3 sm:line-clamp-4 lg:line-clamp-none">
                  {FORMATS[index].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
