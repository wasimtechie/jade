"use client";

import { memo, useRef } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CarouselNavImageFrame from "@/components/ui/CarouselNavImageFrame";
import NavbarThemeTrigger from "./NavbarThemeTrigger";
import SectionWrapper from "./SectionWrapper";
import LuxuryPattern from "./LuxuryPattern";
import { shouldDeferParallaxPatternToStickyStage } from "@/lib/backgroundAttachmentSupport";
import { useScrollLinkedMobileCardScale } from "@/lib/scrollLinkedMobileCardScale";
import { useScrollLinkedPanelOffset } from "@/lib/useScrollLinkedPanelOffset";
import {
  useScrollLinkedAxisMotion,
  useScrollLinkedSlideAxis,
} from "@/lib/useScrollLinkedSlideAxis";
import { useMediaMinLg } from "@/lib/useMediaMinLg";
import { JADE_GREEN } from "@/lib/jadeSectionColors";
import PrimaryButton from "@/components/PrimaryButton";
import {
  useCarouselDirectionalNav,
  usePreloadNeighborImages,
} from "@/lib/carouselMotion";
import { useScrollLinkedSectionProgress } from "@/lib/useScrollLinkedSectionProgress";
import ScrollLinkedHorizontalSection from "@/components/scroll-linked/ScrollLinkedHorizontalSection";
import { domeVillas } from "@/data/retreats/dome";
import { magnolia } from "@/data/retreats/magnolia";
import { retreatOnTheRidge } from "@/data/retreats/retreat-on-the-ridge";
import { villaDetailPath, villaListingPath } from "@/lib/appRoutes";
import {
  scrollLinkedFeaturedVillaImageFrameClass,
  scrollLinkedIntroSlideClass,
  scrollLinkedPanelBodyClass,
  scrollLinkedPanelOuterFeaturedClass,
  scrollLinkedPanelSlideClass,
  scrollLinkedPanelSlideShellClass,
  scrollLinkedPanelStackFeaturedClass,
  scrollLinkedPanelStackWrapFeaturedClass,
  scrollLinkedPanelTextBlockClass,
} from "@/lib/scrollLinkedPanelLayout";

const VILLAS = [
  {
    id: 1,
    category: "HOBBIT THEMED FARMHOUSE",
    title: "Dome Villa",
    description:
      "A hobbit-home inspired retreat set amidst rolling hills, defined by its iconic dome architecture, private pool and immersive connection to nature. Ideal for intimate getaways and quiet celebrations.",
    images: [
      "/Home Page/Featured Villas/HOBBIT THEMED FARMHOUSE/1-4.webp",
      "/Home Page/Featured Villas/HOBBIT THEMED FARMHOUSE/Dome VILLAS by Jade - Blue v3_Page_01_Image_0001.webp",
      "/Home Page/Featured Villas/HOBBIT THEMED FARMHOUSE/domeye.webp",
    ],
    mobileImages: [
      "/Website Ratio Changes/dome.webp",
      "/Home Page/Featured Villas/HOBBIT THEMED FARMHOUSE/Dome VILLAS by Jade - Blue v3_Page_01_Image_0001.webp",
      "/Home Page/Featured Villas/HOBBIT THEMED FARMHOUSE/domeye.webp",
    ],
    link: villaDetailPath(domeVillas.id),
  },
  {
    id: 2,
    category: "HILL VIEW VILLA",
    title: "Retreat on the Ridge",
    description:
      "A hill-facing private villa known for panoramic views, sunset backdrops, and a serene pool setting—designed for group getaways, nature-led retreats, and slow weekends away from the city.",
    images: [
      "/Home Page/Featured Villas/HILL VIEW VILLA/1.webp",
      "/Home Page/Featured Villas/HILL VIEW VILLA/2.webp",
      "/Home Page/Featured Villas/HILL VIEW VILLA/3.webp",
    ],
    mobileImages: [
      "/Website Ratio Changes/ror.webp",
      "/Home Page/Featured Villas/HILL VIEW VILLA/2.webp",
      "/Home Page/Featured Villas/HILL VIEW VILLA/3.webp",
    ],
    link: villaDetailPath(retreatOnTheRidge.id),
  },
  {
    id: 3,
    category: "CONTEMPORARY GLASS VILLA",
    title: "Magnolia",
    description:
      "A modern glass-walled estate with expansive lawns, a private pool, and an in-house theatre—crafted for vibrant celebrations, social gatherings, and large-format experiences with complete privacy.",
    images: [
      "/Home Page/Featured Villas/CONTEMPORARY GLASS VILLA/1.webp",
      "/Home Page/Featured Villas/CONTEMPORARY GLASS VILLA/2.webp",
      "/Home Page/Featured Villas/CONTEMPORARY GLASS VILLA/3.webp",
    ],
    mobileImages: [
      "/Website Ratio Changes/Magnoliaa.webp",
      "/Home Page/Featured Villas/CONTEMPORARY GLASS VILLA/2.webp",
      "/Home Page/Featured Villas/CONTEMPORARY GLASS VILLA/3.webp",
    ],
    link: villaDetailPath(magnolia.id),
  },
];

/** CTA image frame — 2×2 grid of Villa_Retreats hero photography. */
const CTA_VILLA_HERO_GRID = [
  {
    src: "/Villa_Retreats/Dome/Hero Main/Hero 1.webp",
    alt: "Dome Villa",
  },
  {
    src: "/Villa_Retreats/Retreat on the ridge/1-Hero/Hero.webp",
    alt: "Retreat on the Ridge",
  },
  {
    src: "/Villa_Retreats/Magnolia/Hero/hero.webp",
    alt: "Magnolia",
  },
  {
    src: "/Villa_Retreats/Emerald/Hero/hero.webp",
    alt: "Emerald",
  },
] as const;

const FEATURED_PATTERN = {
  opacity: 0.09,
  strokeColor: "#EFCD62",
  edgeFade: "18vh",
  parallaxFixed: true,
} as const;

/** Mobile: card snaps use snapVh; only exitVh of vertical scroll after CTA before next section */
const FEATURED_MOBILE_SNAP_VH = 280;
const FEATURED_MOBILE_EXIT_VH = 12;
/** Reserved — scroll distance is governed by SNAP_ZONE_VH + one-step gesture lock */
const FEATURED_MOBILE_SNAP_SCROLL_GAIN = 0.55;
/** Longer dwell per card so the track sticks before advancing */
const FEATURED_MOBILE_SNAP_DWELL = 0.34;
const FEATURED_MOBILE_HEIGHT_VH =
  FEATURED_MOBILE_SNAP_VH + FEATURED_MOBILE_EXIT_VH;
const FEATURED_MOBILE_SNAP_PORTION =
  FEATURED_MOBILE_SNAP_VH / FEATURED_MOBILE_HEIGHT_VH;

export default function FeaturedVillas() {
  const deferPattern = shouldDeferParallaxPatternToStickyStage(
    FEATURED_PATTERN.parallaxFixed,
  );
  const totalVillas = VILLAS.length;
  const totalSteps = totalVillas + 2;
  /** CTA (last card) centers at this progress — no further horizontal drift on mobile */
  const mobileCarouselMaxProgress = (totalVillas + 1) / totalSteps;
  const { targetRef, panelProgress, stageNavigation } = useScrollLinkedSectionProgress({
    scrollMode: "mobileSnapOnly",
    stepCount: totalSteps + 1,
    smoothSpring: true,
    mobileSnapAggressive: true,
    mobileSnapScrollGain: FEATURED_MOBILE_SNAP_SCROLL_GAIN,
    mobileSnapDwellRatio: FEATURED_MOBILE_SNAP_DWELL,
    mobileSnapZoneRatio: FEATURED_MOBILE_SNAP_PORTION,
    mobileSnapMaxProgress: mobileCarouselMaxProgress,
    showHorizontalHint: false,
    showVerticalHint: true,
  });

  return (
    <SectionWrapper
      ref={targetRef}
      bg={JADE_GREEN}
      className="max-lg:h-[292vh] lg:h-[720vh]"
      pattern={deferPattern ? false : FEATURED_PATTERN}
    >
      <NavbarThemeTrigger theme="white" sectionRef={targetRef} />
      <ScrollLinkedHorizontalSection
        embedded
        bgClassName="relative"
        targetRef={targetRef}
        panelProgress={panelProgress}
        stageNavigation={stageNavigation}
        scrollMode="mobileSnapOnly"
        stepCount={totalSteps + 1}
        smoothSpring
        panelAreaVariant="featured"
        endZoneProgress={mobileCarouselMaxProgress - 0.02}
      >
        {(progress) => (
          <>
            {deferPattern && <LuxuryPattern {...FEATURED_PATTERN} />}
            <IntroPanel globalProgress={progress} totalSteps={totalSteps} />
            {VILLAS.map((villa, i) => (
              <VillaSlide
                key={villa.id}
                data={villa}
                index={i + 1}
                globalProgress={progress}
                totalSteps={totalSteps}
              />
            ))}
            <CtaSlide
              globalProgress={progress}
              totalSteps={totalSteps}
              index={totalVillas + 1}
            />
          </>
        )}
      </ScrollLinkedHorizontalSection>
    </SectionWrapper>
  );
}

/** Shared snap offset — same math for villa cards and the CTA panel. */
function useFeaturedCarouselMotion(
  globalProgress: MotionValue<number>,
  totalSteps: number,
  index: number,
  measureRef: React.RefObject<HTMLElement | null>,
) {
  const axis = useScrollLinkedSlideAxis();
  const { offsetPx, viewportWidth, stageHeight } = useScrollLinkedPanelOffset(
    measureRef,
    { variant: "wide", snapCentered: axis === "vertical", mobileAxis: axis },
  );

  const slideOffset = useTransform(globalProgress, (p: number) => {
    const slideTime = p * totalSteps;
    const leadSpan = axis === "horizontal" ? viewportWidth : stageHeight;

    let leadPos;
    if (slideTime <= 1) {
      leadPos = leadSpan - slideTime * leadSpan;
    } else {
      leadPos = -(slideTime - 1) * offsetPx;
    }

    return leadPos + (index - 1) * offsetPx;
  });

  return useScrollLinkedAxisMotion(slideOffset, axis);
}

function IntroPanel({
  globalProgress,
  totalSteps,
}: {
  globalProgress: MotionValue<number>;
  totalSteps: number;
}) {
  const step = 1 / totalSteps;
  const axis = useScrollLinkedSlideAxis();
  const introMeasureRef = useRef<HTMLDivElement>(null);
  const { offsetPx, stageHeight } = useScrollLinkedPanelOffset(introMeasureRef, {
    variant: "wide",
    snapCentered: axis === "vertical",
    mobileAxis: axis,
  });

  const exitStart = step * 0.85;
  const exitEnd = step;

  const x = useTransform(globalProgress, (p: number) => {
    if (axis === "vertical") return 0;
    if (p <= exitStart) return "0%";
    if (p >= exitEnd) return "-100%";
    const t = (p - exitStart) / (exitEnd - exitStart);
    return `${-t * 100}%`;
  });

  const y = useTransform(globalProgress, (p: number) => {
    if (axis === "horizontal") return 0;
    if (p <= exitStart) return 0;
    if (p >= exitEnd) return -stageHeight;
    const t = (p - exitStart) / (exitEnd - exitStart);
    return -t * offsetPx;
  });

  const textY = useTransform(
    globalProgress,
    [0, step * 0.8],
    [0, axis === "horizontal" ? -600 : -120],
  );
  const opacity = useTransform(globalProgress, [exitStart, exitEnd], [1, 0]);

  return (
    <motion.div
      style={{ x, y, opacity, zIndex: 5 }}
      className={scrollLinkedIntroSlideClass}
    >
      <div
        ref={introMeasureRef}
        className="relative w-full max-w-4xl mx-auto flex flex-col items-center text-center"
      >
        <motion.div style={{ y: textY }} className="z-10 relative">
          <span className="font-manrope text-gh-label tracking-[0.3em] uppercase text-[#EFCD62] mb-3 font-bold block">
            FEATURED VILLAS
          </span>
          <h2 className="font-philosopher text-gh-h1 text-white leading-tight mb-5">
            Spaces That Hold
            <br />
            the Experience
          </h2>
          <p className="font-manrope text-gh-body text-white/80 max-w-2xl mx-auto leading-relaxed">
            Every Jade experience is defined by its setting—chosen for
            atmosphere, flow, and the freedom it allows.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

type FeaturedVillaData = (typeof VILLAS)[number];

/** Isolated from scroll progress re-renders — prevents slide animation interruption. */
const FeaturedVillaImageCarousel = memo(function FeaturedVillaImageCarousel({
  data,
}: {
  data: FeaturedVillaData;
}) {
  const isLg = useMediaMinLg();
  const { currentIndex, carouselCustom, goNext, goPrev } =
    useCarouselDirectionalNav(data.images.length);

  const imageSrc = isLg
    ? data.images[currentIndex]
    : (data.mobileImages?.[currentIndex] ?? data.images[currentIndex]);

  usePreloadNeighborImages(data.images, currentIndex);
  usePreloadNeighborImages(data.mobileImages ?? data.images, currentIndex);

  return (
    <CarouselNavImageFrame
      slideKey={`${data.id}-${currentIndex}`}
      imageSrc={imageSrc}
      alt={data.title}
      slideCount={data.images.length}
      carouselCustom={carouselCustom}
      onPrev={goPrev}
      onNext={goNext}
      navLayout="corners"
      enableSwipe
      sizes={
        isLg
          ? "(max-width: 640px) 100vw, (max-width: 1280px) 95vw, 1400px"
          : "(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 1400px"
      }
      priority={currentIndex === 0}
    >
      {!isLg ? (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      ) : null}
    </CarouselNavImageFrame>
  );
});

function VillaSlide({
  data,
  index,
  globalProgress,
  totalSteps,
}: {
  data: FeaturedVillaData;
  index: number;
  globalProgress: MotionValue<number>;
  totalSteps: number;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const { x, y } = useFeaturedCarouselMotion(
    globalProgress,
    totalSteps,
    index,
    innerRef,
  );
  const scale = useScrollLinkedMobileCardScale(
    globalProgress,
    index,
    totalSteps,
  );

  return (
    <motion.div
      style={{ x, y, zIndex: totalSteps + 2 - index }}
      className={`${scrollLinkedPanelSlideClass} bg-transparent`}
    >
      <div className={scrollLinkedPanelSlideShellClass}>
        <div className={scrollLinkedPanelOuterFeaturedClass}>
        <div
          ref={innerRef}
          className={`${scrollLinkedPanelStackWrapFeaturedClass} relative z-10 w-full`}
        >
          <motion.div
            style={{ scale }}
            className="w-full origin-center will-change-transform"
          >
          <div className={scrollLinkedPanelStackFeaturedClass}>
          <div
            className={`${scrollLinkedFeaturedVillaImageFrameClass} relative z-20 pointer-events-auto`}
            style={{ perspective: "1500px" }}
            data-jade-stage-no-pan
          >
            <div className="relative h-full w-full">
              <FeaturedVillaImageCarousel data={data} />
            </div>
          </div>

          <Link
            href={data.link}
            className={`${scrollLinkedPanelTextBlockClass} pointer-events-auto group rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#EFCD62]`}
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-manrope text-gh-label tracking-[0.2em] uppercase text-[#EFCD62] mb-2 font-bold"
            >
              {data.category}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-philosopher text-gh-h2 text-white leading-none mb-3"
            >
              {data.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`${scrollLinkedPanelBodyClass} mb-5 lg:mb-6`}
            >
              {data.description}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 text-[#EFCD62] text-gh-label font-bold tracking-widest uppercase group-hover:gap-4 transition-all">
                Learn more about {data.title} <ArrowRight className="w-5 h-5" />
              </span>
            </motion.div>
          </Link>
          </div>
          </motion.div>
        </div>
        </div>
      </div>
    </motion.div>
  );
}

function VillaHeroGridImages() {
  return (
    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1 sm:gap-1.5 bg-[#0f2a1f] p-1 sm:p-1.5">
      {CTA_VILLA_HERO_GRID.map((hero, i) => (
        <div
          key={hero.alt}
          className="relative min-h-0 overflow-hidden border border-white/10 bg-black"
        >
          <Image
            src={hero.src}
            alt={hero.alt}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 40vw, 420px"
            priority={i < 2}
          />
        </div>
      ))}
    </div>
  );
}

function CtaSlide({
  globalProgress,
  totalSteps,
  index,
}: {
  globalProgress: MotionValue<number>;
  totalSteps: number;
  index: number;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const { x, y } = useFeaturedCarouselMotion(
    globalProgress,
    totalSteps,
    index,
    innerRef,
  );
  const scale = useScrollLinkedMobileCardScale(
    globalProgress,
    index,
    totalSteps,
  );

  return (
    <motion.div
      style={{ x, y, zIndex: index * 10 }}
      className={`${scrollLinkedPanelSlideClass} bg-transparent`}
    >
      <div className={scrollLinkedPanelSlideShellClass}>
        <div className={scrollLinkedPanelOuterFeaturedClass}>
        <div
          ref={innerRef}
          className={`${scrollLinkedPanelStackWrapFeaturedClass} relative z-10 pointer-events-auto w-full rounded-sm`}
        >
          <motion.div
            style={{ scale }}
            className="w-full origin-center will-change-transform"
          >
          <div className={scrollLinkedPanelStackFeaturedClass}>
          <div className={`${scrollLinkedFeaturedVillaImageFrameClass} bg-[#0f2a1f]`}>
            <VillaHeroGridImages />
          </div>

          <div className={scrollLinkedPanelTextBlockClass}>
            <p className="font-manrope text-gh-label tracking-[0.2em] uppercase text-[#EFCD62] mb-2 font-bold">
              Explore All Villas
            </p>
            <h2 className="font-philosopher text-gh-h2 text-white leading-none mb-3">
              Find Your Retreat
            </h2>
            <p className={`${scrollLinkedPanelBodyClass} mb-5 lg:mb-6`}>
              Browse the full collection of private Jade estates—each chosen for
              atmosphere, space, and the experiences they hold.
            </p>
            <PrimaryButton
              href={villaListingPath()}
              width="section"
              className="rounded-none shadow-[0_16px_40px_rgba(239,205,98,0.4)] hover:shadow-[0_20px_50px_rgba(239,205,98,0.6)] transition-transform duration-300 hover:scale-[1.03]"
            >
              <span className="font-bold whitespace-nowrap">Explore All Villas</span>
            </PrimaryButton>
          </div>
          </div>
          </motion.div>
        </div>
        </div>
      </div>
    </motion.div>
  );
}
