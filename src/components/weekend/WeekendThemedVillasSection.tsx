"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import PrimaryButton from "@/components/PrimaryButton";
import {
  EXPERIENCE_SECTION_CTA_CONTAINER_CLASS,
} from "@/lib/experienceSectionCta";
import HorizontalScrollRail from "@/components/ui/HorizontalScrollRail";
import { VILLA_DETAIL_SPACING } from "@/components/villa/villaDetailSpacing";
import { WEEKEND_THEMED_VILLAS } from "@/data/weekend/weekendThemedVillas";

const vd = VILLA_DETAIL_SPACING;
const CARD_COUNT = WEEKEND_THEMED_VILLAS.length;

/** Mobile: wide cards with next-card peek; desktop: flex grid in section width. */
const scrollCardWidthClasses =
  "w-[max(240px,min(78dvw,340px))] sm:w-[max(260px,min(80dvw,360px))] md:w-[min(300px,42vw)] lg:w-[var(--villa-card-w)] lg:max-w-[360px] lg:min-w-[240px]";

const sectionVars = {
  "--villa-gap": "clamp(14px, 2.2vw, 28px)",
  "--villa-card-w": `clamp(240px, calc((100% - (${CARD_COUNT} - 1) * var(--villa-gap)) / ${CARD_COUNT}), 360px)`,
} as CSSProperties;

export default function WeekendThemedVillasSection() {
  return (
    <section
      id="themed-villa-retreats"
      className="bg-[#141517] border-t border-white/5 overflow-y-hidden max-sm:overflow-x-visible flex flex-col min-h-[80dvh] max-h-[85dvh] h-[85dvh] lg:min-h-[100dvh] lg:max-h-[100dvh] lg:h-[100dvh]"
      style={sectionVars}
    >
      <header className="shrink-0 text-center px-6 pt-5 md:pt-8 pb-3 md:pb-4">
        <p className="text-[#EFCD62] text-gh-label font-bold tracking-[0.3em] uppercase mb-2">
          OUR VILLA RETREATS
        </p>
        <h2 className="text-gh-h2 font-philosopher text-white leading-tight">
          Themed Villa Retreats By Jade
        </h2>
      </header>

      <div className="flex-1 min-h-0 w-full flex max-sm:overflow-visible lg:px-10">
        <HorizontalScrollRail
          showFade={false}
          mobileViewportEdge
          mobileTrackGutter
          className={`w-full h-full lg:max-w-[1320px] lg:mx-auto lg:overflow-visible jade-premium-rail-gap-y ${vd.hScrollViewportEdge}`}
          trackClassName="w-full h-full min-h-0 items-stretch justify-start lg:max-w-[1320px] lg:mx-auto lg:justify-center gap-[var(--villa-gap)] snap-x snap-mandatory scroll-smooth lg:overflow-x-visible"
        >
          {WEEKEND_THEMED_VILLAS.map((villa) => (
            <article
              key={villa.href}
              className={`group flex flex-col shrink-0 h-full snap-start jade-hscroll-view-item lg:shrink ${scrollCardWidthClasses}`}
            >
              <Link
                href={villa.href}
                className="flex flex-col flex-1 min-h-0 h-full cursor-pointer"
              >
                <div className="relative flex-1 min-h-[200px] w-full overflow-hidden border border-white/5 group-hover:border-[#EFCD62]/30 transition-colors mb-2.5 lg:mb-3">
                  <Image
                    src={villa.image}
                    alt={villa.name}
                    fill
                    sizes="(max-width: 1024px) 80vw, 22vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                </div>
                <div className="shrink-0 pb-1">
                  <p
                    className="text-[#EFCD62] text-gh-label font-bold tracking-[0.2em] uppercase text-left"
                    style={{ marginBottom: "clamp(4px, 0.64vw, 8px)" }}
                  >
                    {villa.tag}
                  </p>
                  <h3 className="text-gh-h3 font-philosopher text-white group-hover:text-[#EFCD62] transition-colors text-left leading-tight">
                    {villa.name}
                  </h3>
                </div>
              </Link>
            </article>
          ))}
        </HorizontalScrollRail>
      </div>

      <div className="shrink-0 max-w-7xl mx-auto px-4 w-full pb-5 md:pb-6 pt-3 md:pt-4">
        <div className={EXPERIENCE_SECTION_CTA_CONTAINER_CLASS}>
          <PrimaryButton width="section" href="/retreats/">
            VIEW ALL VILLA RETREATS
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}
