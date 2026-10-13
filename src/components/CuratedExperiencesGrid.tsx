"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import PrimaryButton from "./PrimaryButton";
import {
  EXPERIENCE_SECTION_CTA_CONTAINER_CLASS,
} from "@/lib/experienceSectionCta";

interface Experience {
  title: string;
  image: string;
}

interface CuratedExperiencesGridProps {
  label: string;
  title: string;
  experiences: Experience[];
  ctaText?: string;
  ctaLink?: string;
  onCtaClick?: () => void;
  background?: string;
  containerClassName?: string;
  innerClassName?: string;
  gridClassName?: string;
  ctaContainerClassName?: string;
  /** When false, hides the bottom CTA row (WG-1 weekend page). */
  showCta?: boolean;
}

export default function CuratedExperiencesGrid({
  label,
  title,
  experiences,
  ctaText,
  ctaLink,
  onCtaClick,
  background = "#141517",
  containerClassName = "jade-section",
  innerClassName = "max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24",
  gridClassName = "grid grid-cols-2 md:grid-cols-3",
  ctaContainerClassName = EXPERIENCE_SECTION_CTA_CONTAINER_CLASS,
  showCta = true,
}: CuratedExperiencesGridProps) {
  const lastIdx = experiences.length - 1;
  const mdLastAlone = experiences.length % 3 === 1;
  const smLastAlone = experiences.length % 2 === 1;

  return (
    <section className={containerClassName} style={{ backgroundColor: background }}>
      <div className={innerClassName}>
        {/* Header */}
        <div
          className="text-center"
          style={{ marginBottom: "clamp(20.5px, 3.84vw, 41px)" }}
        >
          <p
            className="text-[#EFCD62] text-gh-label font-bold tracking-[0.3em] uppercase font-manrope"
            style={{ marginBottom: "clamp(8px, 1.28vw, 10.2px)" }}
          >
            {label}
          </p>
          <h2 className="text-gh-h2 font-philosopher text-white leading-tight">
            {title}
          </h2>
        </div>

        {/* Grid Section */}
        <div
          className={gridClassName}
          style={{
            gap: "clamp(8px, 1.28vw, 15.4px)",
            marginBottom: "clamp(20.5px, 3.84vw, 41px)",
          }}
        >
          {" "}
          {/* 40px spacing between grid and button */}
          {experiences.map((exp, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className={[
                "relative aspect-[4/3] md:aspect-[16/9] overflow-hidden group border border-white/5",
                idx === lastIdx && smLastAlone ? "col-span-2 sm:col-span-2" : "",
                idx === lastIdx && mdLastAlone ? "md:col-span-1 md:col-start-2" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {exp.image ? (
                <Image
                  src={exp.image}
                  alt={exp.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#141517] to-black/80" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-center justify-center p-4 text-center">
                <h3 className="text-white text-gh-scroll font-philosopher leading-tight">
                  {exp.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>

        {showCta ? (
          <div className={ctaContainerClassName}>
            <PrimaryButton
              width="section"
              href={ctaLink}
              onClick={onCtaClick}
            >
              {ctaText}
            </PrimaryButton>
          </div>
        ) : null}
      </div>
    </section>
  );
}
