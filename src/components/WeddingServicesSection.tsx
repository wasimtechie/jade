"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import JadeImage from "@/components/ui/JadeImage";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CarouselHeroScrim from "./CarouselHeroScrim";
import {
  carouselHeroCopyRoot,
  carouselHeroHeadlineClass,
  carouselHeroLabelClass,
  carouselHeroSubtextClass,
} from "@/lib/carouselHeroCopy";
import NavbarThemeTrigger from "./NavbarThemeTrigger";
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

function pick(images: string[], idx: number) {
  if (!images.length) return "";
  return images[idx % images.length];
}

const SERVICES_SLIDES = [
  {
    id: 1,
    label: "ADDITIONAL WEDDING SERVICES",
    heading: ["Décor &", "Styling"],
    subtext:
      "Custom mandaps, stages, floral concepts, lighting, and themed décor designed to adapt to each venue's unique character.",
    bgImage: "",
    cardImage: "",
  },
  {
    id: 2,
    label: "ADDITIONAL WEDDING SERVICES",
    heading: ["Catering", "Flexibility"],
    subtext:
      "Diverse catering formats including traditional, regional, and customized menus tailored to your specific taste and heritage.",
    bgImage: "",
    cardImage: "",
  },
  {
    id: 3,
    label: "ADDITIONAL WEDDING SERVICES",
    heading: ["Photography &", "Videography"],
    subtext:
      "Outdoor and indoor settings, including pre-wedding shoots and full wedding coverage to capture every precious moment.",
    bgImage: "",
    cardImage: "",
  },
  {
    id: 4,
    label: "ADDITIONAL WEDDING SERVICES",
    heading: ["Music &", "Entertainment"],
    subtext:
      "DJs, live bands, traditional performances, sound systems, and stage configurations to bring your celebration to life.",
    bgImage: "",
    cardImage: "",
  },
];

export default function WeddingServicesSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const [serviceImages, setServiceImages] = useState<string[]>([]);
  const [preWeddingImages, setPreWeddingImages] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/experiences/weddings/media");
        if (!res.ok) return;
        const data = await res.json();
        const servicesGroup = (data?.groups || []).find((g: any) =>
          String(g.folder || "")
            .toLowerCase()
            .includes("3-additional"),
        );
        const preWeddingGroup = (data?.groups || []).find((g: any) =>
          String(g.folder || "")
            .toLowerCase()
            .includes("5-pre wedding"),
        );
        const services = (servicesGroup?.images || []).filter(Boolean);
        const pre = (preWeddingGroup?.images || []).filter(Boolean);
        if (!cancelled) {
          setServiceImages(services);
          setPreWeddingImages(pre);
        }
      } catch {
        // ignore
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const slides = useMemo(() => {
    // Use services images for first 3, then pull a “music/cocktail” vibe from pre-wedding set.
    return SERVICES_SLIDES.map((s, idx) => ({
      ...s,
      bgImage:
        idx < 3 ? pick(serviceImages, idx * 2) : pick(preWeddingImages, 2),
      cardImage:
        idx < 3 ? pick(serviceImages, idx * 2 + 1) : pick(preWeddingImages, 3),
    }));
  }, [serviceImages, preWeddingImages]);

  const currentSlide = slides[currentIndex] || SERVICES_SLIDES[0];

  usePreloadNeighborSlideImages(slides, currentIndex);

  const carouselCustom: HeroSplitCustom = {
    dir: direction,
    lowFx: !!reducedMotion,
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const miniCardSwipeProps = useCarouselSwipeDragProps(handlePrev, handleNext);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-0 md:min-h-screen w-full overflow-hidden bg-[#0B2C23] flex flex-col"
    >
      <NavbarThemeTrigger theme="white" sectionRef={sectionRef} />

      {/* ── TOP AREA (75vh mobile / 80vh desktop) — background image ── */}
      <div
        className="relative w-full h-[75vh] md:h-[80vh] z-0 overflow-hidden shrink-0 pointer-events-none"
        style={{ perspective: "1500px" }}
      >
        <AnimatePresence mode="sync" initial={false} custom={carouselCustom}>
          <motion.div
            key={`bg-${currentIndex}-${currentSlide.bgImage || "empty"}`}
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
            {currentSlide.bgImage ? (
              <JadeImage
                src={currentSlide.bgImage}
                alt="Background"
                fill
                className="object-cover"
                sizes="100vw"
                priority={currentIndex === 0}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-[#0B2C23] to-[#0B2C23]" />
            )}
          </motion.div>
        </AnimatePresence>

        <CarouselHeroScrim variant="upper" />

        <CarouselSwipeLayer
          onPrev={handlePrev}
          onNext={handleNext}
          slideCount={slides.length}
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
      <div className="relative w-full h-[12vh] md:h-[20vh] z-10 bg-[#0B2C23]" />

      {/* ── SPACER — exactly 40px gap ── */}
      <div className="hidden md:block h-[40px] bg-[#0B2C23]" />

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
        slideKey={`card-${currentIndex}-${currentSlide.cardImage || "empty"}`}
        carouselCustom={carouselCustom}
        miniCardSwipeProps={miniCardSwipeProps}
      >
        {currentSlide.cardImage ? (
          <JadeImage
            src={currentSlide.cardImage}
            alt="Feature"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 55vw, (max-width: 1024px) 45vw, 32vw"
            priority={currentIndex === 0}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-[#0B2C23] to-black/80" />
        )}
      </CarouselHeroMiniFrame>
    </section>
  );
}
