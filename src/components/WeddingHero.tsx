"use client";

import { Home, Download } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ExperienceHero, { HeroButton } from "./ExperienceHero";
import NavbarThemeTrigger from "./NavbarThemeTrigger";
import { scrollToExperienceVillaSection } from "@/lib/experiencePageVillaScroll";
import { heroHeadingLines } from "@/lib/cms/landingCms";

export type WeddingHeroCms = {
  heading?: string;
  description?: string;
  backgroundImage?: string;
};

const DEFAULT_HEADING = ["Boutique Weddings", "Set in Nature"];
const DEFAULT_DESCRIPTION =
  "Private farmhouse and garden estates around Bangalore, designed for intimate ceremonies or large, multi-day celebrations.";

export default function WeddingHero({ cms }: { cms?: WeddingHeroCms }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [heroImages, setHeroImages] = useState<string[]>([]);

  useEffect(() => {
    if (cms?.backgroundImage?.trim()) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/experiences/weddings/media");
        if (!res.ok) return;
        const data = await res.json();
        const group = (data?.groups || []).find(
          (g: { folder?: string }) => g.folder?.toLowerCase?.() === "1-hero",
        );
        const images = (group?.images || data?.all || []).filter(Boolean);
        if (!cancelled) setHeroImages(images);
      } catch {
        // ignore
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [cms?.backgroundImage]);

  const heroBg = useMemo(() => {
    if (cms?.backgroundImage?.trim()) return cms.backgroundImage.trim();
    return heroImages[0] || "";
  }, [cms?.backgroundImage, heroImages]);

  const headingLines = cms?.heading?.trim()
    ? heroHeadingLines(cms.heading)
    : DEFAULT_HEADING;
  const description = cms?.description?.trim() || DEFAULT_DESCRIPTION;

  const heroButtons: [HeroButton, HeroButton] = [
    {
      icon: <Home className="w-5 h-5" />,
      label: "Venues",
      onClick: () => scrollToExperienceVillaSection("wedding"),
    },
    {
      icon: <Download className="w-5 h-5" />,
      label: "Brochure",
      onClick: () => {
        window.open("/All Properties - Jade Hospitainment.pdf", "_blank");
      },
    },
  ];

  return (
    <ExperienceHero
      ref={sectionRef}
      scrollTargetId="wedding-philosophy"
      videoSlug="weddings"
      backgroundImage={heroBg}
      backgroundAlt="Boutique Weddings"
      heading={
        <>
          {headingLines.map((line, i) => (
            <span key={i}>
              {line}
              {i < headingLines.length - 1 ? <br /> : null}
            </span>
          ))}
        </>
      }
      description={description}
      buttons={heroButtons}
    >
      <NavbarThemeTrigger theme="white" sectionRef={sectionRef} />
    </ExperienceHero>
  );
}
