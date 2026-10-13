import React, { ReactNode } from "react";
import clsx from "clsx";
import PrimaryButton from "@/components/PrimaryButton";
import {
  EXPERIENCE_SECTION_CTA_CONTAINER_CLASS,
} from "@/lib/experienceSectionCta";

interface FeatureCard {
  tag: string;
  title: string;
  desc: string;
}

interface PremiumFeaturesSectionProps {
  subheading: string;
  heading: ReactNode;
  cards: FeatureCard[];
  footerText: string;
  ctaText: string;
  ctaLink?: string;
  onCtaClick?: () => void;
  cardClassName?: string;
  alternateGold?: boolean;
  /** Edge-to-edge horizontal scroll rail (e.g. Party Villas); default is responsive grid. */
  cardsLayout?: "grid" | "scroll";
  /** Extra margin below subheading + heading (before cards). Grid layout only. */
  headerBlockClassName?: string;
  /** Extra margin below card rail/grid (before footer copy). Grid layout only. */
  cardsBlockClassName?: string;
  /** Symmetric vertical padding on scroll rail (top = bottom, avoids margin collapse). */
  cardRailSpacingClassName?: string;
  /** Tight layout for subheading + heading (e.g. flex flex-col items-center gap-1.5). */
  headerGroupClassName?: string;
  /** Experience landing pages — standardized md+ CTA sizing (About page stays default). */
  experienceCta?: boolean;
}

/** Canonical scroll-rail layout (About page reference). */
export const PREMIUM_SCROLL_HEADER_GROUP =
  "flex flex-col items-center gap-1.5";
export const PREMIUM_SCROLL_RAIL_GAP = "jade-premium-rail-gap-y";

export default function PremiumFeaturesSection({
  subheading,
  heading,
  cards,
  footerText,
  ctaText,
  ctaLink,
  onCtaClick,
  cardClassName = "bg-[#121417]",
  alternateGold = false,
  cardsLayout = "grid",
  headerBlockClassName = "mb-fluid-md",
  cardsBlockClassName = "mb-fluid-md",
  cardRailSpacingClassName,
  headerGroupClassName,
  experienceCta = false,
}: PremiumFeaturesSectionProps) {
  const resolvedHeaderGroupClassName =
    headerGroupClassName ??
    (cardsLayout === "scroll" ? PREMIUM_SCROLL_HEADER_GROUP : undefined);
  const resolvedCardRailSpacingClassName =
    cardRailSpacingClassName ??
    (cardsLayout === "scroll" ? PREMIUM_SCROLL_RAIL_GAP : undefined);

  const scrollRailVerticalSpacing =
    resolvedCardRailSpacingClassName ?? cardsBlockClassName;
  /* Narrow: justify-start avoids centered-rail clipping. xl+: centered row when viewport fits ~4×269 + gaps. */
  const scrollOuterClasses = [
    "w-full flex justify-start xl:justify-center overflow-x-auto overflow-y-clip scrollbar-none jade-hscroll-track scroll-pl-4 md:scroll-pl-6 lg:scroll-pl-8 xl:scroll-pl-6",
    resolvedCardRailSpacingClassName
      ? scrollRailVerticalSpacing
      : `pb-3 ${scrollRailVerticalSpacing}`,
  ].join(" ");
  const scrollTrackClasses =
    "inline-flex gap-[clamp(10px,2vw,14px)] snap-x snap-mandatory scroll-smooth pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] md:pl-8 md:pr-8 lg:pl-12 lg:pr-10 xl:pl-8 xl:pr-8";
  /** Narrower than ~82dvw so the next card peeks and total height stays comfortable on phones. */
  const scrollItemWidthClasses =
    "w-[max(200px,min(72dvw,275px))] sm:w-[max(218px,min(74dvw,275px))] md:w-[min(269px,40vw)] lg:w-[269px]";

  return (
    <section className="jade-section flex flex-col items-center justify-center bg-[#1A1C1E]">
      <div className="max-w-7xl mx-auto px-4 w-full flex flex-col items-center">
        <div
          className={`text-center ${
            resolvedHeaderGroupClassName ?? ""
          } ${
            cardsLayout === "scroll" && resolvedCardRailSpacingClassName
              ? ""
              : headerBlockClassName
          }`}
        >
          <p
            className={`text-[#EFCD62] text-gh-label font-bold tracking-[0.2em] uppercase font-manrope ${
              resolvedHeaderGroupClassName ? "mb-0" : "mb-[11.2px]"
            }`}
          >
            {subheading}
          </p>
          <h2 className="text-gh-h2 font-philosopher text-white leading-[1.1] m-0">
            {heading}
          </h2>
        </div>

        {cardsLayout === "grid" ? (
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[clamp(9.6px,1.6vw,11.2px)] w-full px-fluid-sm md:px-fluid-md ${cardsBlockClassName}`}
          >
            {cards.map((card, idx) => (
              <PremiumFeatureCard
                key={idx}
                card={card}
                idx={idx}
                alternateGold={alternateGold}
                cardClassName={cardClassName}
                variant="grid"
              />
            ))}
          </div>
        ) : null}
      </div>

      {cardsLayout === "scroll" ? (
        <div
          data-jade-hscroll
          className={scrollOuterClasses}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className={scrollTrackClasses}>
            {cards.map((card, idx) => (
              <div
                key={idx}
                className={`snap-start flex-shrink-0 jade-hscroll-view-item ${scrollItemWidthClasses}`}
              >
                <PremiumFeatureCard
                  card={card}
                  idx={idx}
                  alternateGold={alternateGold}
                  cardClassName={cardClassName}
                  variant="scroll"
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="max-w-7xl mx-auto px-4 w-full flex flex-col items-center">
        <div
          className={`flex flex-col items-center w-full ${
            resolvedCardRailSpacingClassName ? "max-w-3xl gap-4" : ""
          }`}
        >
          <p
            className={`text-white/60 font-philosopher italic text-gh-body text-center max-w-3xl leading-relaxed ${
              resolvedCardRailSpacingClassName ? "mb-0" : "mb-[19.2px]"
            }`}
          >
            {footerText}
          </p>

          <div
            className={clsx(
              "w-full",
              experienceCta
                ? EXPERIENCE_SECTION_CTA_CONTAINER_CLASS
                : resolvedCardRailSpacingClassName
                  ? ""
                  : "max-w-3xl mx-auto",
            )}
          >
            <PrimaryButton
              href={ctaLink}
              onClick={onCtaClick}
              width={experienceCta ? "section" : "form"}
            >
              {ctaText}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function PremiumFeatureCard({
  card,
  idx,
  alternateGold,
  cardClassName,
  variant = "grid",
}: {
  card: FeatureCard;
  idx: number;
  alternateGold: boolean;
  cardClassName: string;
  variant?: "grid" | "scroll";
}) {
  const geoId = `premium-card-geo-${idx}`;
  const noiseId = `premium-card-noise-${idx}`;
  const aspectClass =
    variant === "scroll"
      ? "aspect-[4/5] md:aspect-[269/375]"
      : "aspect-[269/375]";

  return (
    <div
      className={`group relative w-full ${aspectClass} border border-white/[0.05] p-[clamp(1rem,3.25vw,2rem)] flex flex-col justify-between overflow-hidden transition-all duration-500 hover:border-[#EFCD62]/30 ${cardClassName}`}
    >
      {/* Layer 1: Refined Linear Fill with Accurate Shiny Accents */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#363A45_0%,#121417_100%)]" />

        {alternateGold && (
          <>
            {idx % 2 === 0 ? (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(239,205,98,0.25)_0%,rgba(239,205,98,0.05)_40%,transparent_70%)]" />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_85%,rgba(239,205,98,0.25)_0%,rgba(239,205,98,0.05)_40%,transparent_70%)]" />
            )}
          </>
        )}

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,205,98,0.03)_0%,transparent_80%)]" />
      </div>

      <div className="absolute inset-0 z-10 opacity-[0.12] pointer-events-none overflow-hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          className="w-full h-full"
        >
          <defs>
            <pattern
              id={geoId}
              x="0"
              y="0"
              width="120"
              height="120"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 15 L 105 60 L 60 105 L 15 60 Z"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
                opacity="0.3"
              />
              <circle cx="60" cy="60" r="1.2" fill="white" opacity="0.6" />
              <circle cx="25" cy="25" r="0.4" fill="white" />
              <circle cx="95" cy="35" r="0.6" fill="white" />
              <circle cx="40" cy="80" r="0.5" fill="white" />
              <circle cx="85" cy="95" r="0.3" fill="white" />
              <circle
                cx="60"
                cy="60"
                r="25"
                fill="none"
                stroke="white"
                strokeWidth="0.2"
                opacity="0.08"
              />
              <circle
                cx="60"
                cy="60"
                r="40"
                fill="none"
                stroke="white"
                strokeWidth="0.1"
                opacity="0.04"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${geoId})`} />
        </svg>
      </div>

      <div className="absolute inset-0 z-[11] opacity-[0.08] pointer-events-none mix-blend-overlay">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          className="w-full h-full"
        >
          <filter id={noiseId}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter={`url(#${noiseId})`} />
        </svg>
      </div>

      <div className="relative z-20">
        <span className="text-[#A2A4A7] font-philosopher italic text-gh-desc mb-[clamp(0.65rem,calc(0.45rem+0.68vw),1.0625rem)] block tracking-wide">
          {card.tag}
        </span>
        <h3 className="font-manrope font-extrabold text-white text-[clamp(1.0625rem,calc(0.55rem+2.85vw),2rem)] leading-[1.2] tracking-[0.01em] uppercase break-words hyphens-none">
          {card.title.split(" ").map((word, i) => (
            <React.Fragment key={i}>
              {word}
              <br />
            </React.Fragment>
          ))}
        </h3>
      </div>

      <p className="relative z-20 text-white/40 font-manrope text-[clamp(0.6875rem,calc(0.45rem+0.85vw),0.75rem)] sm:text-gh-label leading-relaxed max-w-[95%] line-clamp-6 sm:line-clamp-none">
        {card.desc}
      </p>
    </div>
  );
}
