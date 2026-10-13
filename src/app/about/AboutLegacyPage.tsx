"use client";

import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";
import TrustedBySection from "@/components/TrustedBySection";
import AboutPageHero from "@/components/about/sections/AboutPageHero";
import AboutOurStorySection from "@/components/about/sections/AboutOurStorySection";
import AboutWhyJadeSection from "@/components/about/sections/AboutWhyJadeSection";
import AboutOfferingsCarousel from "@/components/about/sections/AboutOfferingsCarousel";
import AboutMediaSection from "@/components/about/sections/AboutMediaSection";

/** Legacy hardcoded /about body — kept until Puck published version is verified. */
export default function AboutLegacyPage() {
  return (
    <main className="relative min-h-screen bg-[#1A1C1E] pb-16 text-white lg:pb-0">
      <Navbar />
      <MobileBottomNav />
      <AboutPageHero />
      <TrustedBySection />
      <AboutOurStorySection />
      <AboutWhyJadeSection />
      <AboutOfferingsCarousel />
      <AboutMediaSection />
      <Footer />
    </main>
  );
}
