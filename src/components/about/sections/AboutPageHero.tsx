"use client";

import Image from "next/image";
import LiveBackground from "@/components/LiveBackground";
import GlassStatsBanner from "@/components/GlassStatsBanner";
import GoldAccentLine from "@/components/ui/GoldAccentLine";

export type AboutPageHeroProps = {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  stat1Value?: string;
  stat1Label?: string;
  stat2Value?: string;
  stat2Label?: string;
  stat3Value?: string;
  stat3Label?: string;
};

export default function AboutPageHero({
  eyebrow = "ABOUT JADEHOSPITAINMENT",
  heading = "Curated VILLAS.\nThoughtfully Operated.",
  subheading = "Where hospitality and experience go beyond conventional listing platforms.",
  stat1Value = "16",
  stat1Label = "LUXURY VILLA",
  stat2Value = "7500+",
  stat2Label = "CHECK-INS",
  stat3Value = "100+",
  stat3Label = "EVENTS HOSTED",
}: AboutPageHeroProps) {
  const headingLines = heading.split("\n");

  return (
    <>
      <section className="relative flex min-h-[100svh] w-full flex-col items-center justify-end overflow-hidden pb-20">
        <GoldAccentLine className="absolute left-0 right-0 top-0 z-20" />
        <div className="absolute inset-0 z-0">
          <LiveBackground />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
        </div>
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
          <div className="relative mb-8 h-16 w-16 md:h-24 md:w-24">
            <Image
              src="/assets/Golden_Logo.png"
              alt="Jade Logo"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
          <h2 className="mb-2 text-[#EFCD62] text-gh-label font-bold tracking-[0.2em] uppercase">
            {eyebrow}
          </h2>
          <h1 className="mb-3 font-philosopher text-gh-h1 leading-tight text-white">
            {headingLines.map((line, i) => (
              <span key={i}>
                {line}
                {i < headingLines.length - 1 && <br />}
              </span>
            ))}
          </h1>
          <p className="mb-5 max-w-2xl font-manrope text-gh-body leading-relaxed text-white/80">
            {subheading}
          </p>
          <GlassStatsBanner
            stats={[
              { value: stat1Value, label: stat1Label },
              { value: stat2Value, label: stat2Label },
              { value: stat3Value, label: stat3Label },
            ]}
          />
        </div>
      </section>
      <GoldAccentLine />
    </>
  );
}
