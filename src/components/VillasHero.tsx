"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import LiveBackground from "./LiveBackground";
import NavbarThemeTrigger from "./NavbarThemeTrigger";
import {
  ScrollLineIndicator,
  SCROLL_LINE_INDICATOR_CLICKABLE_CLASS,
  SCROLL_LINE_INDICATOR_HERO_WRAPPER_CLASS,
} from "./ScrollLineIndicator";
import GoldAccentLine from "@/components/ui/GoldAccentLine";

export default function VillasHero() {
  const sectionRef = useRef<HTMLElement>(null);
  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen h-screen w-full overflow-hidden bg-[#050505] flex flex-col items-center justify-center text-center px-6"
    >
      <GoldAccentLine className="absolute top-0 left-0 right-0 z-20" />
      <NavbarThemeTrigger theme="golden" sectionRef={sectionRef} />
      {/* Live Background */}
      <div className="absolute inset-0 z-0">
        <LiveBackground />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* Label */}
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-[#EFCD62] text-gh-label font-manrope font-bold tracking-[0.25em] uppercase"
          style={{ marginBottom: "clamp(4px, 0.96vw, 8px)" }}
        >
          VILLA RETREATS
        </motion.span>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="font-philosopher text-gh-h1 text-white leading-tight tracking-tight"
          style={{ marginBottom: "clamp(8px, 1.28vw, 10.2px)" }}
        >
          All Our Villa Retreats
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="font-manrope text-white/70 text-gh-body max-w-xl leading-relaxed"
        >
          A curated collection of fully private villa retreats across Bangalore, each
          offering a distinct theme for stays, celebrations and bespoke
          experiences.
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
            document.getElementById("VILLAS-carousel")?.scrollIntoView({
              behavior: "smooth",
            });
          }}
        />
      </motion.div>
      <GoldAccentLine className="absolute bottom-0 left-0 right-0 z-20" />
    </section>
  );
}
