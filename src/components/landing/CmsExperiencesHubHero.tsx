"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import LiveBackground from "@/components/LiveBackground";
import NavbarThemeTrigger from "@/components/NavbarThemeTrigger";
import {
  ScrollLineIndicator,
  SCROLL_LINE_INDICATOR_CLICKABLE_CLASS,
  SCROLL_LINE_INDICATOR_HERO_WRAPPER_CLASS,
} from "@/components/ScrollLineIndicator";
import GoldAccentLine from "@/components/ui/GoldAccentLine";
import { heroHeadingLines } from "@/lib/cms/landingCms";
import type { ExperienceHeroCms } from "@/components/landing/CmsExperienceHero";
import {
  EXPERIENCE_HERO_COPY_SHADOW_CLASS,
  EXPERIENCE_HERO_DESCRIPTION_CLASS,
  EXPERIENCE_HERO_HEADING_CLASS,
} from "@/lib/experienceHeroLayout";

const DEFAULT_HEADING = "Moments\nThoughtfully Hosted";
const DEFAULT_DESCRIPTION =
  "A collection of curated experiences designed across Jade's private VILLAS and distinctive settings.";

export function CmsExperiencesHubHero({ cms }: { cms?: ExperienceHeroCms }) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingLines = cms?.heading?.trim()
    ? heroHeadingLines(cms.heading)
    : heroHeadingLines(DEFAULT_HEADING);
  const description = cms?.description?.trim() || DEFAULT_DESCRIPTION;

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen h-screen w-full overflow-hidden bg-[#050505] flex flex-col items-center justify-center text-center px-6"
    >
      <GoldAccentLine className="absolute top-0 left-0 right-0 z-20" />
      <NavbarThemeTrigger theme="golden" sectionRef={sectionRef} />
      <div className="absolute inset-0 z-0">
        <LiveBackground />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`text-[#EFCD62] text-gh-label font-manrope font-bold tracking-[0.25em] uppercase ${EXPERIENCE_HERO_COPY_SHADOW_CLASS}`}
          style={{ marginBottom: "clamp(4px, 0.96vw, 8px)" }}
        >
          EXPERIENCES
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className={`${EXPERIENCE_HERO_HEADING_CLASS} tracking-tight`}
          style={{ marginBottom: "clamp(8px, 1.28vw, 10.2px)" }}
        >
          {headingLines.map((line, i) => (
            <span key={line}>
              {line}
              {i < headingLines.length - 1 && (
                <>
                  <br className="hidden md:block" />
                  {i === 0 && headingLines.length > 1 ? " " : null}
                </>
              )}
            </span>
          ))}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className={`${EXPERIENCE_HERO_DESCRIPTION_CLASS} max-w-xl`}
        >
          {description}
        </motion.p>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1, ease: "easeOut" }}
        className={SCROLL_LINE_INDICATOR_HERO_WRAPPER_CLASS}
      >
        <ScrollLineIndicator
          floating
          className={SCROLL_LINE_INDICATOR_CLICKABLE_CLASS}
          onClick={() => {
            document.getElementById("experiences-list")?.scrollIntoView({
              behavior: "smooth",
            });
          }}
        />
      </motion.div>
      <GoldAccentLine className="absolute bottom-0 left-0 right-0 z-20" />
    </section>
  );
}
