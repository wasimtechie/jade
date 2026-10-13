"use client";

import ScrollSectionComposer, { ScrollSlide } from "./ScrollSectionComposer";
import LiveBackground from "./LiveBackground";
import { LIVE_BACKGROUND_SCROLL_SECTION_HEIGHT } from "@/lib/liveBackgroundScrollSection";

const slides: ScrollSlide[] = [
  {
    label: "OUR PHILOSOPHY",
    lines: [
      "Hospitainment is the blend of hospitality and entertainment through private, exclusive and experiential retreats.",
      "At Jade, guests enjoy curated villa stays brought to life through culinary, wellness and entertainment experiences.",
    ],
  },
];

/** Home page section 2 — philosophy scroll panel (OUR PHILOSOPHY). */
export default function UnifiedScrollSection() {
  return (
    <ScrollSectionComposer
      slides={slides}
      height={LIVE_BACKGROUND_SCROLL_SECTION_HEIGHT}
      fadeTiming="early"
      lineStaggerDelayMs={280}
      scrollEffects="performance"
      background={<LiveBackground />}
      showScrollIndicator
    />
  );
}
