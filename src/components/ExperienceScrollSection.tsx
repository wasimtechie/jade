"use client";

import ScrollSectionComposer from "./ScrollSectionComposer";
import {
  EXPERIENCE_SCROLL_SECTIONS,
  type ExperienceScrollVariant,
} from "@/data/experienceScrollSections";
import { LIVE_BACKGROUND_SCROLL_SECTION_HEIGHT } from "@/lib/liveBackgroundScrollSection";

interface ExperienceScrollSectionProps {
  variant: ExperienceScrollVariant;
  height?: string;
  /** Anchor for hero scroll CTA (e.g. corporate section 3) */
  id?: string;
}

export default function ExperienceScrollSection({
  variant,
  height: heightOverride,
  id,
}: ExperienceScrollSectionProps) {
  const { label, body, height } = EXPERIENCE_SCROLL_SECTIONS[variant];

  const isCorporate = variant === "corporate";

  return (
    <div id={id} className="relative">
      <ScrollSectionComposer
        slides={[{ label, lines: [body] }]}
        height={
          heightOverride ?? height ?? LIVE_BACKGROUND_SCROLL_SECTION_HEIGHT
        }
        fadeTiming="early"
        scrollEffects="performance"
        {...(isCorporate && {
          slideGutterClassName: "px-4 md:px-8",
          contentContainerClassName: "w-full max-w-7xl mx-auto",
        })}
        showScrollIndicator
      />
    </div>
  );
}
