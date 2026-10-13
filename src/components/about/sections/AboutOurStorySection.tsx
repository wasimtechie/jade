"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionFillTransition from "@/components/ui/SectionFillTransition";
import { JADE_GREEN } from "@/lib/jadeSectionColors";

const OUR_STORY_PATTERN = {
  opacity: 0.09,
  strokeColor: "#EFCD62",
  edgeFade: "18vh",
} as const;

export type AboutOurStorySectionProps = {
  eyebrow?: string;
  body?: string;
};

export default function AboutOurStorySection({
  eyebrow = "OUR STORY",
  body = "Founded in 2011 under Jade Retreats, Jade Hospitainment created exclusive private retreat experiences, starting with one of Bengaluru's most sought-after vacation homes. Jade expanded beyond stays, transforming VILLAS and farmhouses into curated retreats across hospitality and experience. Today, Jade operates a growing portfolio of private retreats for getaways, celebrations, and corporate offsites.",
}: AboutOurStorySectionProps) {
  return (
    <>
      <SectionFillTransition from="deep" to="green" />
      <SectionWrapper
        bg={JADE_GREEN}
        className="jade-section overflow-hidden"
        pattern={OUR_STORY_PATTERN}
      >
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <h3 className="mb-6 text-[#EFCD62] text-gh-label font-bold tracking-[0.2em] uppercase">
            {eyebrow}
          </h3>
          <div className="mb-12 text-center font-manrope text-gh-body leading-relaxed text-white/90">
            <p>{body}</p>
          </div>
          <div className="group relative aspect-video w-full cursor-pointer overflow-hidden rounded-none border border-[#EFCD62]/20 bg-black/40 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="relative h-20 w-20 opacity-80 transition-opacity duration-500 group-hover:opacity-100">
                <Image
                  src="/assets/Golden_Logo.png"
                  alt="Jade Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#EFCD62] bg-black/20 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                <Play className="h-6 w-6 fill-[#EFCD62] text-[#EFCD62]" />
              </div>
              <span className="mt-2 text-[#EFCD62]/60 text-gh-label font-light uppercase tracking-[0.3em]">
                Hospitainment
              </span>
            </div>
          </div>
        </div>
      </SectionWrapper>
      <SectionFillTransition from="green" to="deep" />
    </>
  );
}
