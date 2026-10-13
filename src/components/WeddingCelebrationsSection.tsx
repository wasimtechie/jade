"use client";

import ScrollLinkedHorizontalSection from "@/components/scroll-linked/ScrollLinkedHorizontalSection";
import ScrollLinkedPanelCard, {
  type ScrollLinkedPanelData,
} from "@/components/scroll-linked/ScrollLinkedPanelCard";
import ScrollLinkedSectionEndButton from "@/components/scroll-linked/ScrollLinkedSectionEndButton";
import { useScrollLinkedSectionHeight } from "@/lib/useScrollLinkedSectionHeight";
import { scrollLinkedMobileSnapHookStepCount } from "@/lib/scrollLinkedMobileSnap";

const CELEBRATIONS: ScrollLinkedPanelData[] = [
  {
    id: "mehendi",
    title: "Mehendi & Haldi",
    subtext:
      "Daytime rituals in private lawns and courtyards, with space to gather, move freely, and celebrate without interruption.",
    image: "/Experiences/Weddings/5-Pre Wedding/Haldi.webp",
    href: "/weddings",
    cta: "SEE THE RITUALS",
  },
  {
    id: "sangeet",
    title: "Sangeet Evenings",
    subtext:
      "Evenings shaped for music, performances, and dancing, supported by flexible lighting, sound, and open layouts.",
    image: "/Experiences/Weddings/5-Pre Wedding/Sangeeth.webp",
    href: "/weddings",
    cta: "EXPLORE THE VIBE",
  },
  {
    id: "bachelor",
    title: "Bachelor & Bachelorette Parties",
    subtext:
      "Fully private estates for carefree celebrations—poolside moments, music, décor, and late nights with friends.",
    image: "/Experiences/Weddings/5-Pre Wedding/Bachelorette.webp",
    href: "/party-villas",
    cta: "LEARN MORE",
  },
  {
    id: "cocktail",
    title: "Pre-Wedding Cocktail Nights",
    subtext:
      "Relaxed evening gatherings with custom bar setups, lounge seating, and ambient lighting.",
    image: "/Experiences/Weddings/5-Pre Wedding/cocktail...webp",
    href: "/weddings",
    cta: "SEE THE MAGIC",
  },
  {
    id: "shoots",
    title: "Pre-Wedding Shoots",
    subtext:
      "Multiple backdrops within one private estate, allowing your shoot to flow naturally from one setting to the next.",
    image: "/Experiences/Weddings/5-Pre Wedding/Bridal Shoots.webp",
    href: "/weddings",
    cta: "VIEW THE LOCATIONS",
  },
];

export default function WeddingCelebrationsSection() {
  const totalSteps = CELEBRATIONS.length + 1;
  const panelCount = CELEBRATIONS.length;
  const sectionHeightVh = useScrollLinkedSectionHeight(
    "wedding",
    "mobileSnapOnly",
    scrollLinkedMobileSnapHookStepCount(totalSteps),
  );

  return (
    <ScrollLinkedHorizontalSection
      sectionHeightVh={sectionHeightVh}
      stepCount={totalSteps}
      bgClassName="bg-[#1A1C1E]"
      headerLabel="PRE WEDDING CELEBRATIONS"
      headerLabelClassName="font-manrope text-gh-label tracking-[0.3em] uppercase font-semibold text-[#EFCD62] drop-shadow-lg block"
      scrollMode="mobileSnapOnly"
      endButton={(panelProgress) => (
        <ScrollLinkedSectionEndButton
          panelProgress={panelProgress}
          panelCount={panelCount}
          cardStepCount={totalSteps}
          href="/retreats/"
          label="See All Wedding Villas"
        />
      )}
    >
      {(panelProgress) =>
        CELEBRATIONS.map((celebration, i) => (
          <ScrollLinkedPanelCard
            key={celebration.id}
            data={celebration}
            index={i}
            panelProgress={panelProgress}
            totalSteps={totalSteps}
            panelCount={panelCount}
            gapVariant="wide"
            snapCentered
          />
        ))
      }
    </ScrollLinkedHorizontalSection>
  );
}
