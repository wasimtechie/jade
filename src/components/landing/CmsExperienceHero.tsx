"use client";

import { Calendar, Download } from "lucide-react";
import ExperienceHero, { type HeroStat } from "@/components/ExperienceHero";
import { heroHeadingLines } from "@/lib/cms/landingCms";
import { scrollToExperienceVillaSection } from "@/lib/experiencePageVillaScroll";
import type { VideoSlug } from "@/components/ResponsiveVideo";

export type ExperienceHeroCms = {
  heading?: string;
  description?: string;
  backgroundImage?: string;
};

type CmsExperienceHeroProps = {
  cms?: ExperienceHeroCms;
  videoSlug: VideoSlug;
  scrollTargetId: string;
  backgroundAlt: string;
  defaultHeading: string;
  defaultDescription: string;
  defaultImage: string;
  villaScrollKey: "corporate" | "weekend" | "party" | "wedding";
  brochurePath?: string;
  stats?: HeroStat[];
};

export function CmsExperienceHero({
  cms,
  videoSlug,
  scrollTargetId,
  backgroundAlt,
  defaultHeading,
  defaultDescription,
  defaultImage,
  villaScrollKey,
  brochurePath = "/All Properties - Jade Hospitainment.pdf",
  stats,
}: CmsExperienceHeroProps) {
  const headingLines = cms?.heading?.trim()
    ? heroHeadingLines(cms.heading)
    : heroHeadingLines(defaultHeading);
  const description = cms?.description?.trim() || defaultDescription;
  const backgroundImage = cms?.backgroundImage?.trim() || defaultImage;

  return (
    <ExperienceHero
      scrollTargetId={scrollTargetId}
      videoSlug={videoSlug}
      backgroundImage={backgroundImage}
      backgroundAlt={backgroundAlt}
      heading={
        <>
          {headingLines.map((line, i) => (
            <span key={line}>
              {line}
              {i < headingLines.length - 1 && <br />}
            </span>
          ))}
        </>
      }
      description={description}
      stats={stats}
      buttons={[
        {
          icon: <Calendar className="w-5 h-5" />,
          label: "VENUES",
          onClick: () => scrollToExperienceVillaSection(villaScrollKey),
        },
        {
          icon: <Download className="w-5 h-5" />,
          label: "BROCHURE",
          onClick: () => window.open(brochurePath, "_blank"),
        },
      ]}
    />
  );
}
