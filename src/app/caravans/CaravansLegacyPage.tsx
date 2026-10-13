"use client";

import React from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";
import ExperienceHero from "@/components/ExperienceHero";
import ExperienceScrollSection from "@/components/ExperienceScrollSection";
import ExperienceCarouselSection from "@/components/ExperienceCarouselSection";
import CaravanUsageSection from "@/components/CaravanUsageSection";
import CaravanJourneySection from "@/components/CaravanJourneySection";
import CuratedExperiencesGrid from "@/components/CuratedExperiencesGrid";
import PremiumFeaturesSection from "@/components/PremiumFeaturesSection";
import TravelGuidelinesSection from "@/components/TravelGuidelinesSection";
import { Info, Calendar } from "lucide-react";
import { useAnimation } from "@/context/AnimationContext";
import { scrollToExperienceHeroSection } from "@/lib/experiencePageVillaScroll";
import SectionFillTransition from "@/components/ui/SectionFillTransition";
import { useEffect, useMemo, useState } from "react";

const DEFAULT_SLIDES = [
  {
    title: "Inside Rathaa",
    desc: "A private lounge designed for relaxed journeys.",
  },
  {
    title: "Comfort On The Road",
    desc: "Convertible sleeping and lounge configurations for small groups.",
  },
  {
    title: "Entertainment",
    desc: "Dual screens, music, and plug-and-play connectivity.",
  },
  {
    title: "Kitchenette",
    desc: "Refreshments and essential utilities throughout the trip.",
  },
  {
    title: "Climate-Controlled Interiors",
    desc: "Air-conditioned comfort across seasons.",
  },
  {
    title: "Capacity",
    desc: "Ideal for 6–8 guests travelling together.",
  },
];

export default function CaravansLegacyPage() {
  const { setRathaaOverlayOpen } = useAnimation();
  const [allImages, setAllImages] = useState<string[]>([]);
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [spaceImages, setSpaceImages] = useState<string[]>([]);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/experiences/caravans/media");
        if (!res.ok) return;
        const data = await res.json();
        const groups = data?.groups || [];
        const hero = (groups.find(
          (g: any) => String(g.folder).toLowerCase() === "1-hero",
        )?.images || []) as string[];
        const spaces = (groups.find(
          (g: any) => String(g.folder).toLowerCase() === "2-spaces",
        )?.images || []) as string[];
        const all = (data?.all || []) as string[];
        if (!cancelled) {
          setHeroImages(hero);
          setSpaceImages(spaces);
          setAllImages(all);
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

  const caravanSlides = useMemo(() => {
    const imgs = spaceImages.length ? spaceImages : allImages;
    return DEFAULT_SLIDES.map((s, idx) => ({
      ...s,
      image: imgs[idx % Math.max(imgs.length, 1)] || "",
    }));
  }, [spaceImages, allImages]);

  const heroBackgrounds = useMemo(() => {
    if (heroImages.length > 0) return heroImages;
    if (allImages.length > 0) return allImages;
    return [];
  }, [heroImages, allImages]);

  return (
    <main className="relative min-h-screen bg-[#1A1C1E] text-white pb-16 lg:pb-0">
      <Navbar />
      <MobileBottomNav />

      {/* SECTION 1: HERO SECTION */}
      <ExperienceHero
        scrollTargetId="caravans-philosophy"
        backgroundImages={heroBackgrounds}
        backgroundImage={heroBackgrounds[0]}
        backgroundAutoAdvanceMs={4500}
        backgroundAlt="Caravans"
        heading={
          <>
            Rathaa By Jade, A
            <br />
            Retreat on the Move
          </>
        }
        description="A private caravan experience designed for curated road journeys, celebrations, and escapes beyond the city."
        buttons={[
          {
            icon: <Info className="w-5 h-5" />,
            label: "KNOW MORE",
            onClick: () => scrollToExperienceHeroSection("caravans"),
          },
          {
            icon: <Calendar className="w-5 h-5" />,
            label: "PLAN JOURNEY",
            onClick: () => setRathaaOverlayOpen(true),
          },
        ]}
      />

      {/* SECTION 2: ANIMATED TEXT SECTION */}
      <ExperienceScrollSection variant="caravans" id="caravans-philosophy" />

      {/* SECTION 3: THE CARAVAN — hero KNOW MORE scroll target */}
      <section id="the-caravan">
        <ExperienceCarouselSection
          label="INSIDE THE RATHAA EXPERIENCE"
          title="The Caravan"
          slides={caravanSlides}
          ctaText="BOOK CARAVAN"
          onCtaClick={() => setRathaaOverlayOpen(true)}
        />
      </section>

      <SectionFillTransition from="deep" to="green" />
      <CaravanUsageSection />
      <CaravanJourneySection />

      <SectionFillTransition from="green" to="deep" />
      <CuratedExperiencesGrid
        label="CURATED EXPERIENCES"
        title="Enhance Your Stay"
        showCta={false}
        experiences={caravanSlides.slice(0, 6).map((s) => ({
          title: s.title,
          image: s.image,
        }))}
        innerClassName="max-w-6xl mx-auto px-4 sm:px-6 md:px-8"
      />

      <PremiumFeaturesSection
        subheading="WHY RATHAA"
        heading="Travel Reimagined"
        cardsLayout="scroll"
        cards={[
          {
            tag: "experience",
            title: "PRIVATE JOURNEYS",
            desc: "Travel with your group in a fully private caravan, designed for small gatherings, celebrations, and relaxed escapes.",
          },
          {
            tag: "explore",
            title: "CURATED ROUTES",
            desc: "Discover scenic destinations and offbeat stops through thoughtfully designed travel circuits around and beyond the city.",
          },
          {
            tag: "enjoy",
            title: "COMFORT ON THE ROAD",
            desc: "A fully equipped caravan with lounge seating, sleeping spaces, entertainment, and modern travel amenities.",
          },
          {
            tag: "create",
            title: "CUSTOM JOURNEYS",
            desc: "From one-day escapes to overnight retreats and multi-day road trips, every journey can be tailored to your plan.",
          },
        ]}
        footerText="Rathaa turns every road into an experience for those who travel beyond the ordinary."
        ctaText="PLAN YOUR JOURNEY"
        onCtaClick={() => setRathaaOverlayOpen(true)}
        alternateGold={true}
        experienceCta
      />

      <SectionFillTransition from="deep" to="green" />
      <TravelGuidelinesSection />

      <Footer />
    </main>
  );
}
