"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { Users, Car, Home, MapPin, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getEventCapacity, getStayCapacity } from "@/lib/villaDisplay";
import { getOverlayVillaData } from "@/lib/overlayVillaData";
import { useVillaListingImages } from "@/lib/useVillaListingImages";
import {
  heroSplitCardVariants,
  type HeroSplitCustom,
} from "@/lib/heroSplitCarouselVariants";
import { getVillaGoogleMapsUrl } from "@/lib/googleMapsLinks";
import CarouselSwipeLayer from "@/components/ui/CarouselSwipeLayer";

interface WeddingVillaCardProps {
  villa: any; // Type from VILLAS
  onKnowMore: () => void;
}

export default function WeddingVillaCard({
  villa,
  onKnowMore,
}: WeddingVillaCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const { images: listingImages } = useVillaListingImages(villa);
  const images =
    listingImages.filter((i) => i.image).length > 0
      ? listingImages.filter((i) => i.image)
      : [{ name: "Main", image: villa.image }];

  const nextImage = () => {
    setDirection(1);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setDirection(-1);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const currentSpace = images[currentImageIndex];

  const reducedMotion = useReducedMotion();
  const carouselCustom: HeroSplitCustom = {
    dir: direction,
    lowFx: !!reducedMotion,
  };

  // Specific data mapping for Wedding Cards
  const stats = [
    {
      label: "Guests",
      value:
        getEventCapacity(villa)?.toString() ||
        villa.stats?.events?.split(" ")[0] ||
        "600",
      icon: Users,
    },
    {
      label: "Parking",
      value: (villa as { overlay?: { parking?: string } })?.overlay?.parking ?? "80",
      icon: Car,
    },
    {
      label: "Stay",
      value:
        getStayCapacity(villa)?.toString() ||
        villa.stats?.stay?.split(" ")[0] ||
        "20",
      icon: Home,
    },
  ];

  const onwards =
    (villa as { overlay?: { onwardsPrice?: string } })?.overlay?.onwardsPrice ??
    (getOverlayVillaData("wedding", villa?.id) as { overlay?: { onwardsPrice?: string } } | null)
      ?.overlay?.onwardsPrice ??
    null;

  return (
    <div className="flex flex-col lg:flex-row gap-5 lg:gap-10 xl:gap-11 w-full pb-6 lg:py-8 border-b border-white/5 last:border-b-0 bg-[#25282C]">
      {/* IMAGE SECTION */}
      <div
        className="relative w-full lg:w-[45%] h-[38vh] lg:h-[360px] xl:h-[420px] overflow-hidden bg-white/5 flex-shrink-0"
        style={{ perspective: "1400px" }}
      >
        <AnimatePresence mode="sync" initial={false} custom={carouselCustom}>
          <motion.div
            key={`${villa.id}-${currentImageIndex}`}
            custom={carouselCustom}
            variants={heroSplitCardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
            style={{ willChange: "transform" }}
          >
            <Image
              src={currentSpace.image}
              alt={currentSpace.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

        <CarouselSwipeLayer
          onPrev={prevImage}
          onNext={nextImage}
          slideCount={images.length}
          className="absolute inset-0 z-[8] touch-pan-y cursor-grab active:cursor-grabbing"
        />

        {/* IMAGE CONTROLS */}
        <div className="pointer-events-none absolute bottom-6 left-4 right-4 z-20 flex items-center justify-between">
          <button
            type="button"
            onClick={prevImage}
            className="pointer-events-auto w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-[#EFCD62] hover:text-black transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center">
            <span className="text-white font-manrope text-gh-label font-bold tracking-[0.3em] uppercase mb-2">
              {currentSpace.name || "LAWN"}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-white font-philosopher text-gh-gallery-pagination tabular-nums leading-none">
                {currentImageIndex + 1}
              </span>
              <div className="w-12 h-[1px] bg-white/40 shrink-0" />
              <span className="text-white/60 font-philosopher text-gh-gallery-pagination tabular-nums leading-none">
                {images.length}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={nextImage}
            className="pointer-events-auto w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-[#EFCD62] hover:text-black transition-all"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="flex flex-col flex-1 max-lg:px-0 lg:px-0 pt-3 lg:pt-0 justify-start text-left">
        <span
          className="text-[#EFCD62] text-gh-label font-manrope font-bold tracking-[0.25em] uppercase"
          style={{ marginBottom: "clamp(4px, 0.64vw, 8px)" }}
        >
          {villa.type}
        </span>

        <h2
          className="font-philosopher text-gh-h3 text-white leading-tight"
          style={{ marginBottom: "clamp(4px, 0.512vw, 8px)" }}
        >
          {villa.name}
        </h2>

        <a
          href={getVillaGoogleMapsUrl(villa)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-white/50 w-fit max-w-full rounded-sm outline-none hover:text-[#EFCD62] transition-colors focus-visible:ring-2 focus-visible:ring-[#EFCD62]/55"
          style={{ marginBottom: "clamp(4px, 0.512vw, 8px)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <MapPin className="w-5 h-5 text-[#EFCD62] shrink-0" />
          <span className="font-manrope text-gh-body tracking-wide hover:underline underline-offset-4">
            {villa.location}
          </span>
        </a>

        <p
          className="font-manrope text-white/50 leading-relaxed text-gh-desc line-clamp-3 lg:line-clamp-none"
          style={{ marginBottom: "clamp(12.8px, 2.56vw, 23px)" }}
        >
          {villa.description.split(".")[0]}. Ideal for{" "}
          <span className="text-white/80 font-bold">intimate weddings</span> and
          pre-wedding ceremonies.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-3">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center py-4 border border-white/10 text-center hover:border-[#EFCD62]/30 transition-colors"
            >
              <stat.icon className="w-4 h-4 text-white/30 mb-2" />
              <span className="text-white font-philosopher text-gh-scroll md:text-gh-h3 mb-1 truncate w-full px-2">
                {stat.value}
              </span>
              <span className="text-[#EFCD62]/80 uppercase font-bold tracking-[0.2em] font-manrope text-gh-label">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-auto flex flex-row items-center justify-between pt-4">
          <span className="text-white font-manrope font-bold text-gh-villa-footer-row tracking-tight">
            {onwards ? `${onwards} onwards` : "Enquire for pricing"}
          </span>

          <button
            type="button"
            onClick={onKnowMore}
            className="inline-flex items-center gap-2 text-[#EFCD62] font-manrope text-gh-villa-footer-row tracking-[0.2em] font-bold uppercase transition-all group"
          >
            KNOW MORE
            <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
