"use client";

import React from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CAROUSEL_CROSSFADE,
  usePreloadNeighborImages,
} from "@/lib/carouselMotion";
import {
  heroSplitCardVariants,
  type HeroSplitCustom,
} from "@/lib/heroSplitCarouselVariants";
import CarouselSwipeLayer from "@/components/ui/CarouselSwipeLayer";

export type AboutOfferingItem = {
  title: string;
  description: string;
  image: string;
};

export const DEFAULT_ABOUT_OFFERINGS: AboutOfferingItem[] = [
  {
    title: "Weekend Getaways",
    description:
      "A day or two with your friends and family away from the bustling city in the wilderness is truly on everyone's wishlist.",
    image: "/Experiences/Weekend Getaways/1-Hero/casual stays.webp",
  },
  {
    title: "Corporate Retreats",
    description:
      "Private venues designed for focused sessions, team alignment, and meaningful downtime.",
    image: "/Experiences/Corporate Retreats/1-Hero/xhero.webp",
  },
  {
    title: "Weddings",
    description:
      "Bespoke celebrations in curated settings that make your special day truly unforgettable.",
    image: "/Experiences/Weddings/1-Hero/2 (1).webp",
  },
  {
    title: "Party Villas",
    description:
      "Host birthdays, pool parties, reunions or milestone celebrations in exclusive Jade VILLAS.",
    image: "/Experiences/Party Villas/1-Hero/Pool Parties.webp",
  },
];

export type AboutOfferingsCarouselProps = {
  eyebrow?: string;
  heading?: string;
  offerings?: AboutOfferingItem[];
};

export default function AboutOfferingsCarousel({
  eyebrow = "WHAT WE DO",
  heading = "Our Offering",
  offerings = DEFAULT_ABOUT_OFFERINGS,
}: AboutOfferingsCarouselProps) {
  const [current, setCurrent] = React.useState(0);
  const [direction, setDirection] = React.useState(0);
  const reducedMotion = useReducedMotion();
  const items = offerings.length > 0 ? offerings : DEFAULT_ABOUT_OFFERINGS;
  const offering = items[current % items.length];

  const carouselCustom: HeroSplitCustom = {
    dir: direction,
    lowFx: !!reducedMotion,
  };

  const next = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % items.length);
  };
  const prev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + items.length) % items.length);
  };

  usePreloadNeighborImages(
    items.map((o) => o.image),
    current,
  );

  return (
    <section className="jade-section relative overflow-hidden bg-[#1A1C1E]">
      <div className="mx-auto flex w-full max-w-7xl flex-col px-6">
        <div className="mb-6 flex items-end justify-between md:mb-10">
          <div>
            <h3 className="mb-2.5 font-manrope text-[#EFCD62] text-gh-label font-bold uppercase tracking-[0.2em]">
              {eyebrow}
            </h3>
            <h2 className="font-philosopher text-gh-h2 leading-none text-white">
              {heading}
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={prev}
              className="group flex h-10 w-10 items-center justify-center rounded-none border border-white/10 bg-white/5 text-white/40 transition-all hover:bg-white/10 hover:text-white md:h-12 md:w-12"
            >
              <ArrowLeft className="h-5 w-5 transition-transform group-active:scale-90" />
            </button>
            <button
              type="button"
              onClick={next}
              className="group flex h-10 w-10 items-center justify-center rounded-none border border-white/10 bg-white/5 text-white/40 transition-all hover:bg-white/10 hover:text-white md:h-12 md:w-12"
            >
              <ArrowRight className="h-5 w-5 transition-transform group-active:scale-90" />
            </button>
          </div>
        </div>
        <div
          className="group relative mx-auto h-[clamp(320px,50svh,540px)] w-full overflow-hidden rounded-none md:h-[clamp(380px,55svh,700px)] lg:h-[clamp(420px,58svh,820px)]"
          style={{ perspective: "1500px" }}
        >
          <AnimatePresence mode="sync" initial={false} custom={carouselCustom}>
            <motion.div
              key={current}
              custom={carouselCustom}
              variants={heroSplitCardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 h-full w-full border border-white/10"
              style={{ willChange: "transform" }}
            >
              <div className="absolute inset-0">
                <Image
                  src={offering.image}
                  alt={offering.title}
                  fill
                  className="object-cover"
                  priority={current === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] opacity-[0.07] [background-size:18px_18px]" />
              </div>
              <div className="absolute inset-0 flex max-w-4xl flex-col items-start justify-center p-8 text-left md:p-16 lg:p-24">
                <motion.h3
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.06,
                    duration: CAROUSEL_CROSSFADE.duration,
                    ease: CAROUSEL_CROSSFADE.ease,
                  }}
                  className="mb-3 font-philosopher text-gh-h2 text-white"
                >
                  {offering.title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.1,
                    duration: CAROUSEL_CROSSFADE.duration,
                    ease: CAROUSEL_CROSSFADE.ease,
                  }}
                  className="max-w-xl font-manrope text-gh-body leading-relaxed text-white/80"
                >
                  {offering.description}
                </motion.p>
              </div>
            </motion.div>
          </AnimatePresence>
          <CarouselSwipeLayer
            onPrev={prev}
            onNext={next}
            slideCount={items.length}
            className="absolute inset-0 z-[8] cursor-grab touch-pan-y active:cursor-grabbing"
          />
        </div>
      </div>
    </section>
  );
}
