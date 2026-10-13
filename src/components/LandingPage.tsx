"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { useAnimation } from "@/context/AnimationContext";
import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import ResponsiveVideo from "./ResponsiveVideo";
import Navbar from "./Navbar";
import MobileBottomNav from "./MobileBottomNav";
import NavbarThemeTrigger from "./NavbarThemeTrigger";
import dynamic from "next/dynamic";
import { getLenis, scrollToY } from "@/lib/lenis";
import LazyWhenNear from "@/components/ui/LazyWhenNear";
import SectionFillTransition from "@/components/ui/SectionFillTransition";
import { InstagramCarouselShell } from "@/components/InstagramCarouselShell";
import { prefetchInstagramOembed } from "@/lib/instagramOembedCache";
import {
  ScrollLineIndicator,
  SCROLL_LINE_INDICATOR_CLICKABLE_CLASS,
  SCROLL_LINE_INDICATOR_HERO_WRAPPER_CLASS,
} from "./ScrollLineIndicator";
import PrimaryButton from "./PrimaryButton";
import { carouselHeroLabelClass } from "@/lib/carouselHeroCopy";
import { useMediaMinLg } from "@/lib/useMediaMinLg";
import HeroVideoScrim from "@/components/ui/HeroVideoScrim";

const InstagramCarousel = dynamic(() => import("./InstagramCarousel"), {
  ssr: false,
});

const UnifiedScrollSection = dynamic(() => import("./UnifiedScrollSection"), {
  ssr: false,
});
const HorizontalScrollSection = dynamic(
  () => import("./HorizontalScrollSection"),
  { ssr: false },
);
const ValuePropositionSection = dynamic(
  () => import("./ValuePropositionSection"),
  { ssr: false },
);
const FeaturedVillas = dynamic(() => import("./FeaturedVillas"), {
  ssr: false,
});
const JadeAmenitiesSection = dynamic(() => import("./JadeAmenitiesSection"), {
  ssr: false,
});
const BlogSection = dynamic(() => import("./BlogSection"), { ssr: false });
const Footer = dynamic(() => import("./Footer"), { ssr: false });

export default function LandingPage() {
  const { isSplashComplete } = useAnimation();
  const isLg = useMediaMinLg();
  const containerRef = useRef(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const heroFallbackImage = "/Home Page/4-Venue Images/1.webp";

  useEffect(() => {
    prefetchInstagramOembed();
  }, []);

  const { scrollY } = useScroll();
  const heroContentY = useTransform(scrollY, [0, 500], ["0%", "15%"]);

  return (
    <motion.div
      ref={containerRef}
      className="relative bg-jade-dark text-white"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
    >
      {/* 1. Navigation & Header */}
      <Navbar />

      {/* Fixed Header Elements (Logo & Contact) */}

      {/* 2. Hero Section (Parallax) — fixed viewport height so absolute children anchor correctly */}
      <div
        ref={heroRef}
        className="relative w-full overflow-hidden h-[100svh] lg:h-[100dvh]"
      >
        <NavbarThemeTrigger theme="white" sectionRef={heroRef} />
        {/* Background: static video layer (no scroll parallax — keeps decode smooth) */}
        <div className="absolute inset-0 w-full h-full z-0">
          <div className="absolute inset-0 z-0">
            <Image
              src={heroFallbackImage}
              alt=""
              fill
              priority
              className="object-cover"
              aria-hidden
            />
          </div>
          <ResponsiveVideo
            slug="homepage"
            poster={heroFallbackImage}
            className="absolute inset-0 z-[1] h-full w-full object-cover [transform:translateZ(0)]"
          />
          <HeroVideoScrim />
        </div>

        {/* Foreground — copy + CTA share the same scroll parallax (desktop only) */}
        <motion.div
          style={isLg ? { y: heroContentY } : undefined}
          className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6 md:px-12 max-w-[1920px] mx-auto pointer-events-none"
        >
          <motion.div className="flex-1 flex flex-col justify-center items-center w-full">
            <motion.div className="max-w-5xl flex flex-col items-center gap-0 pointer-events-auto">
            {/* Label */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={isSplashComplete ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className={`${carouselHeroLabelClass} [text-shadow:0_1px_8px_rgba(0,0,0,0.8),0_2px_18px_rgba(0,0,0,0.5)]`}
              style={{ marginBottom: "clamp(4px, 0.96vw, 8px)" }}
            >
              VILLA RETREATS
            </motion.p>

            {/* Title — tight to label above, tight to subtext below */}
            <motion.h1
              className="font-philosopher text-gh-h1 leading-[1.1] text-white"
              initial={{ opacity: 0, y: 30 }}
              animate={isSplashComplete ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              style={{ marginBottom: "clamp(8px, 1.28vw, 10.2px)" }}
            >
              <div className="block">Where Hospitality</div>
              <div className="block">Meets Entertainment</div>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={isSplashComplete ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              className="text-gh-body font-semibold text-white max-w-xl font-manrope leading-relaxed [text-shadow:0_1px_8px_rgba(0,0,0,0.8),0_2px_18px_rgba(0,0,0,0.5)]"
            >
              Private themed farmhouse villa retreats in serene locations of Bangalore,
              curated for gatherings and getaways.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isSplashComplete ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
              style={{ marginTop: "clamp(16px, 2.5vw, 24px)" }}
            >
              <PrimaryButton href="/book" withArrow={false} width="section">
                Book Villa Retreat
              </PrimaryButton>
            </motion.div>
            </motion.div>
          </motion.div>

        </motion.div>

        {/* Scroll cue — pinned to bottom of hero viewport (above mobile nav) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isSplashComplete ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          className={SCROLL_LINE_INDICATOR_HERO_WRAPPER_CLASS}
        >
          <ScrollLineIndicator
            floating
            className={SCROLL_LINE_INDICATOR_CLICKABLE_CLASS}
            onClick={() => scrollToY(window.innerHeight, { duration: 1.1 })}
          />
        </motion.div>
      </div>

      <UnifiedScrollSection />
      <MobileBottomNav />
      <HorizontalScrollSection />
      <LazyWhenNear
        minHeight="90vh"
        approachMargin="800px 0px"
        mountMargin="72px 0px"
        mountDeferMs={48}
        shell={<InstagramCarouselShell />}
        onApproach={prefetchInstagramOembed}
      >
        <InstagramCarousel />
      </LazyWhenNear>
      <SectionFillTransition from="charcoal" to="green" />
      <LazyWhenNear
        minHeight="calc(75vh + 12vh)"
        className="bg-jade-green"
      >
        <ValuePropositionSection />
      </LazyWhenNear>
      <FeaturedVillas />
      <SectionFillTransition from="green" to="charcoal" />
      <LazyWhenNear minHeight="80vh">
        <JadeAmenitiesSection />
      </LazyWhenNear>
      <LazyWhenNear minHeight="70vh">
        <BlogSection />
      </LazyWhenNear>
      <LazyWhenNear minHeight="50vh">
        <Footer />
      </LazyWhenNear>
    </motion.div>
  );
}
