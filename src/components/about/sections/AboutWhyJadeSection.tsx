"use client";

import PremiumFeaturesSection from "@/components/PremiumFeaturesSection";
import { useAnimation } from "@/context/AnimationContext";

export type AboutFeatureCard = {
  tag: string;
  title: string;
  desc: string;
};

export const DEFAULT_ABOUT_WHY_JADE_CARDS: AboutFeatureCard[] = [
  {
    tag: "operate",
    title: "BY INTENT",
    desc: "Private Villas are thoughtfully positioned and operated with clarity around how they are meant to be experienced, whether for stays, celebrations, or retreats.",
  },
  {
    tag: "curate",
    title: "THROUGH CARE",
    desc: "Each property and experience is carefully curated based on its character, setting & suitability, ensuring the right fit for every occasion.",
  },
  {
    tag: "guide",
    title: "WITH CLARITY",
    desc: "From selecting the right villa to shaping the overall experience, Jade provides clear guidance so every stay or gathering unfolds smoothly.",
  },
  {
    tag: "host",
    title: "IN RESPONSIBILITY",
    desc: "Spaces are managed with long-term care in mind, balancing guest experience with respect for the property, its surroundings, and its people.",
  },
];

export type AboutWhyJadeSectionProps = {
  subheading?: string;
  heading?: string;
  footerText?: string;
  ctaText?: string;
  cards?: AboutFeatureCard[];
};

export default function AboutWhyJadeSection({
  subheading = "WHY JADE",
  heading = "Because how you operate matters",
  footerText = "Bringing unique VILLAS and curated experiences together under one standard of hospitality.",
  ctaText = "PARTNER WITH JADE",
  cards = DEFAULT_ABOUT_WHY_JADE_CARDS,
}: AboutWhyJadeSectionProps) {
  const { setPartnerOverlayOpen } = useAnimation();

  return (
    <PremiumFeaturesSection
      subheading={subheading}
      heading={heading}
      cards={cards.length > 0 ? cards : DEFAULT_ABOUT_WHY_JADE_CARDS}
      footerText={footerText}
      ctaText={ctaText}
      onCtaClick={() => setPartnerOverlayOpen(true)}
      alternateGold
      experienceCta
      cardsLayout="scroll"
    />
  );
}
