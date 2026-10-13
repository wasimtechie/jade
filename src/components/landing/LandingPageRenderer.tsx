"use client";

import type { CmsLandingSection } from "@/lib/cms/landingCms";
import { slotDefinition } from "@/lib/cms/landingTemplates";
import MeanderStrip from "@/components/ui/MeanderStrip";
import { renderLandingSlot } from "@/components/landing/ExperienceLandingSlots";

type LandingPageRendererProps = {
  templateKey: string;
  sections: CmsLandingSection[];
};

export function LandingPageRenderer({
  templateKey,
  sections,
}: LandingPageRendererProps) {
  return (
    <>
      {sections.map((section) => {
        if (section.enabled === false) return null;
        const def = slotDefinition(templateKey, section.slotId);
        if (def?.kind === "divider") {
          return (
            <MeanderStrip
              key={section.sectionKey}
              accentLine={section.slotId.includes("1") ? "green" : undefined}
              track={section.slotId.includes("2") ? "green" : undefined}
            />
          );
        }
        return (
          <div key={section.sectionKey}>
            {renderLandingSlot(templateKey, section)}
          </div>
        );
      })}
    </>
  );
}
