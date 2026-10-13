"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { useNestedLenisPanel } from "@/lib/nestedLenisPanel";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import {
  EXPERIENCE_OVERLAY_BOOKING_BAR_SPACER_CLASS,
  EXPERIENCE_OVERLAY_MOBILE_SHEET_TOP_EDGE_SHADE_CLASS,
  EXPERIENCE_OVERLAY_CLOSE_BUTTON_CLASS,
  EXPERIENCE_OVERLAY_CLOSE_BUTTON_FRAME_CLASS,
  EXPERIENCE_OVERLAY_CLOSE_ICON_CLASS,
  EXPERIENCE_OVERLAY_BOTTOM_BAR_SHEET_CLASS,
  EXPERIENCE_OVERLAY_CONTENT_FRAME_CLASS,
  EXPERIENCE_OVERLAY_DESKTOP_BODY_CLASS,
  EXPERIENCE_OVERLAY_MOBILE_HOST_CLASS,
  EXPERIENCE_OVERLAY_MOBILE_SCROLL_SHEET_CLASS,
  EXPERIENCE_OVERLAY_MOBILE_SHEET_FRAME_CLASS,
  EXPERIENCE_OVERLAY_MOBILE_SHEET_SCRIM_CLASS,
  EXPERIENCE_OVERLAY_MOBILE_SHEET_ZONE_CLASS,
  EXPERIENCE_OVERLAY_MOBILE_TOP_SHADE_CLASS,
  EXPERIENCE_OVERLAY_MOBILE_TOP_SHADE_VH,
} from "@/lib/experienceOverlayTheme";
import {
  VILLA_DETAIL_PRICING_BOTTOM_BAR_CHROME_CLASS,
  VILLA_DETAIL_STICKY_TABS_CHROME_CLASS,
} from "@/lib/scrollChromeGlass";
import {
  heroSplitCardVariants,
  type HeroSplitCustom,
} from "@/lib/heroSplitCarouselVariants";
import CarouselSwipeLayer from "@/components/ui/CarouselSwipeLayer";
import { stickyCategoryTabClass } from "@/lib/stickyTabGlass";
import CategoryTabRail from "@/components/ui/CategoryTabRail";
import MeanderStrip from "@/components/ui/MeanderStrip";
import clsx from "clsx";
import {
  SCROLL_CHROME_FRAMER_INITIAL,
  SCROLL_CHROME_FRAMER_TRANSITION,
  scrollChromeAnimate,
} from "@/lib/scrollChromeMotion";
import { useScrollTabIntoView } from "@/lib/useScrollTabIntoView";
import { useOverlayMobileChrome } from "@/lib/useOverlayMobileChrome";
import { OVERLAY_MOBILE_ACTION_BAR_PB_CLASS } from "@/lib/overlayMobileChrome";
import { VILLA_DETAIL_SPACING } from "@/components/villa/villaDetailSpacing";
import VillaPricingBottomBarRow from "@/components/villa/VillaPricingBottomBarRow";

const vd = VILLA_DETAIL_SPACING;

export type VillaExperienceCarouselImage = { name?: string; image: string };

export const EXPERIENCE_OVERLAY_MD_UP_QUERY = "(min-width: 768px)";

export function isExperienceOverlayMdUp(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(EXPERIENCE_OVERLAY_MD_UP_QUERY).matches;
}

/**
 * Below `md`: top shade + stuck rounded sheet; inner scroll clips at top radius.
 * At `md` and up: full-sheet scroll (unchanged).
 */
export function VillaExperienceOverlayBody({
  pinnedTop,
  children,
  mobileFooter,
  onScroll,
  scrollRef,
  onScrollRootUpdated,
  onBackdropClick,
}: {
  pinnedTop: React.ReactNode;
  children: React.ReactNode;
  /** Pinned to bottom of mobile sheet (booking bar). */
  mobileFooter?: React.ReactNode;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  scrollRef?: React.Ref<HTMLDivElement>;
  onScrollRootUpdated?: () => void;
  /** Tap top shade to dismiss (mobile). */
  onBackdropClick?: () => void;
}) {
  useOverlayMobileChrome(true);
  const mobileScrollEl = useRef<HTMLDivElement>(null);
  const desktopScrollEl = useRef<HTMLDivElement>(null);
  const onScrollRootUpdatedRef = useRef(onScrollRootUpdated);
  onScrollRootUpdatedRef.current = onScrollRootUpdated;
  const [mdUp, setMdUp] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia(EXPERIENCE_OVERLAY_MD_UP_QUERY);
    const syncMq = () => setMdUp(mq.matches);
    syncMq();
    mq.addEventListener("change", syncMq);
    return () => mq.removeEventListener("change", syncMq);
  }, []);

  useNestedLenisPanel(mobileScrollEl, !mdUp);
  useNestedLenisPanel(desktopScrollEl, mdUp);

  useLayoutEffect(() => {
    if (!scrollRef) return;
    const refObj = scrollRef as React.MutableRefObject<HTMLDivElement | null>;
    const sync = () => {
      refObj.current = isExperienceOverlayMdUp()
        ? desktopScrollEl.current
        : mobileScrollEl.current;
      onScrollRootUpdatedRef.current?.();
    };
    sync();
    const mq = window.matchMedia(EXPERIENCE_OVERLAY_MD_UP_QUERY);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [scrollRef]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    onScroll?.(e);
  };

  const scrollContent = (
    <div data-overlay-scroll-content>
      <div className="relative z-[1]">{pinnedTop}</div>
      <div
        className={EXPERIENCE_OVERLAY_CONTENT_FRAME_CLASS}
        data-experience-overlay-content
      >
        {children}
      </div>
      {mobileFooter ? (
        <div className={EXPERIENCE_OVERLAY_BOOKING_BAR_SPACER_CLASS} aria-hidden />
      ) : null}
    </div>
  );

  return (
    <>
      {/* Mobile: top shade + stuck sheet */}
      <div className={EXPERIENCE_OVERLAY_MOBILE_HOST_CLASS}>
        <button
          type="button"
          className={`${EXPERIENCE_OVERLAY_MOBILE_TOP_SHADE_CLASS} w-full border-0 p-0 cursor-pointer relative z-20`}
          aria-label="Close overlay"
          onClick={onBackdropClick}
        />
        <div className={EXPERIENCE_OVERLAY_MOBILE_SHEET_ZONE_CLASS}>
          <div className={EXPERIENCE_OVERLAY_MOBILE_SHEET_SCRIM_CLASS} aria-hidden />
          <div className={EXPERIENCE_OVERLAY_MOBILE_SHEET_FRAME_CLASS}>
            <div
              className={EXPERIENCE_OVERLAY_MOBILE_SHEET_TOP_EDGE_SHADE_CLASS}
              aria-hidden
            />
            <div
              ref={mobileScrollEl}
              className={EXPERIENCE_OVERLAY_MOBILE_SCROLL_SHEET_CLASS}
              data-lenis-prevent
              onScroll={handleScroll}
            >
              {scrollContent}
            </div>
            {mobileFooter ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[60] bg-jade-charcoal">
                <div className="pointer-events-auto w-full">{mobileFooter}</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Desktop: full viewport scroll */}
      <div
        ref={desktopScrollEl}
        className={EXPERIENCE_OVERLAY_DESKTOP_BODY_CLASS}
        data-lenis-prevent
        onScroll={handleScroll}
      >
        {scrollContent}
      </div>
    </>
  );
}

/** Close: above sheet on phone; fixed top-right at md+. */
export function VillaExperienceOverlayCloseFramer({
  MotionButton,
  onClose,
  isHidden = false,
  variant = "fixed",
}: {
  MotionButton: typeof motion.button;
  onClose: () => void;
  isHidden?: boolean;
  variant?: "above-sheet" | "fixed";
}) {
  const button = (
    <MotionButton
      initial={
        variant === "above-sheet" ? { opacity: 0, scale: 0.9, y: 0 } : SCROLL_CHROME_FRAMER_INITIAL
      }
      animate={
        variant === "above-sheet"
          ? { opacity: 1, scale: 1, y: 0 }
          : scrollChromeAnimate(isHidden)
      }
      transition={SCROLL_CHROME_FRAMER_TRANSITION}
      onClick={onClose}
      aria-label="Close"
      className={EXPERIENCE_OVERLAY_CLOSE_BUTTON_CLASS}
    >
      <X className={EXPERIENCE_OVERLAY_CLOSE_ICON_CLASS} />
    </MotionButton>
  );

  if (variant === "above-sheet") {
    const bandCenterTop = `calc(${EXPERIENCE_OVERLAY_MOBILE_TOP_SHADE_VH}dvh / 2 - 1.25rem)`;
    return (
      <div
        className={clsx(
          "md:hidden fixed left-0 right-0 mx-auto z-[210] pointer-events-none",
          EXPERIENCE_OVERLAY_CLOSE_BUTTON_FRAME_CLASS,
        )}
        style={{
          top: `max(0.625rem, env(safe-area-inset-top, 0px), ${bandCenterTop})`,
        }}
      >
        {button}
      </div>
    );
  }

  return (
    <div className="hidden md:block fixed top-[max(1.5rem,env(safe-area-inset-top,0px))] right-[max(1.5rem,env(safe-area-inset-right,0px))] z-[200] w-12 h-12 pointer-events-none">
      {button}
    </div>
  );
}

export function VillaExperienceHeroCarousel({
  images,
  currentImageIndex,
  carouselCustom,
  onPrev,
  onNext,
  fallbackSlideLabel = "SPACE",
}: {
  images: VillaExperienceCarouselImage[];
  currentImageIndex: number;
  carouselCustom: HeroSplitCustom;
  onPrev: () => void;
  onNext: () => void;
  /** When slide has no name — default matches wedding/weekend/party cards */
  fallbackSlideLabel?: string;
}) {
  const MotionDiv = motion.div;
  const slide = images[currentImageIndex];
  const slideLabel = slide?.name?.trim() || fallbackSlideLabel;
  const hasMultiple = images.length > 1;

  return (
    <div
      className="relative w-full max-md:h-[clamp(200px,32dvh,300px)] md:h-[clamp(320px,65vh,720px)] overflow-hidden bg-black/20 group max-md:rounded-none md:rounded-none"
      style={{ perspective: "1500px" }}
    >
      <AnimatePresence mode="sync" initial={false} custom={carouselCustom}>
        <MotionDiv
          key={currentImageIndex}
          custom={carouselCustom}
          variants={heroSplitCardVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
          style={{ willChange: "transform" }}
        >
          <Image
            src={slide.image}
            alt={slide.name || "Venue"}
            fill
            className="object-cover"
          />
          {/* Match WeddingVillaCard / VillaCard: stronger base for bottom controls */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </MotionDiv>
      </AnimatePresence>

      <CarouselSwipeLayer
        onPrev={onPrev}
        onNext={onNext}
        slideCount={images.length}
        className="absolute inset-0 z-[8] touch-pan-y cursor-grab active:cursor-grabbing"
      />

      {/* Bottom bar — same pattern as experience villa cards (arrows + label + index) */}
      {hasMultiple ? (
        <div className="absolute bottom-4 md:bottom-6 left-4 right-4 z-20 flex items-center justify-between gap-2 pointer-events-none">
          <button
            type="button"
            aria-label="Previous image"
            onClick={onPrev}
            className="pointer-events-auto w-10 h-10 md:w-12 md:h-12 shrink-0 flex items-center justify-center border border-white/15 bg-transparent text-white backdrop-blur-2xl transition-all hover:border-white/35 hover:text-[#EFCD62]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center justify-center flex-1 min-w-0 px-1 pointer-events-auto">
            <span className="text-white font-manrope text-gh-label font-bold tracking-[0.25em] md:tracking-[0.3em] uppercase text-center line-clamp-2">
              {slideLabel}
            </span>
          </div>

          <button
            type="button"
            aria-label="Next image"
            onClick={onNext}
            className="pointer-events-auto w-10 h-10 md:w-12 md:h-12 shrink-0 flex items-center justify-center border border-white/15 bg-transparent text-white backdrop-blur-2xl transition-all hover:border-white/35 hover:text-[#EFCD62]"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="absolute bottom-4 md:bottom-6 left-4 right-4 z-20 flex flex-col items-center pointer-events-none">
          <span className="pointer-events-none text-white font-manrope text-gh-label font-bold tracking-[0.25em] md:tracking-[0.3em] uppercase text-center line-clamp-2">
            {slideLabel}
          </span>
        </div>
      )}
    </div>
  );
}

export function VillaExperienceGalleryCaption({ label }: { label: string }) {
  return (
    <div className="mt-5 px-4 text-center">
      <span className="text-white/50 font-manrope text-gh-label font-bold tracking-[0.12em]">
        {label}
      </span>
    </div>
  );
}

export function VillaExperienceStickyTabs({
  tabs,
  activeTab,
  onTabClick,
}: {
  tabs: string[];
  activeTab: string;
  onTabClick: (tab: string) => void;
}) {
  const trackRef = useScrollTabIntoView(activeTab);

  return (
    <>
      {/* Static meander scrolls away; tabs sticky at sheet top (no site header offset). */}
      <MeanderStrip layout="fullBleed" track="charcoal" className="relative z-40" />
      {/* Full-width chrome (like booking bottom bar); tabs align to page gutters inside. */}
      <div
        className={clsx(
          "jade-hscroll-chrome sticky top-0 z-40 mb-0",
          vd.stickyChromeOuter,
          vd.hScrollViewportEdge,
        )}
        data-experience-overlay-tabs
      >
        <div
          className={clsx(
            vd.stickyChromeOuter,
            VILLA_DETAIL_STICKY_TABS_CHROME_CLASS,
          )}
        >
          <div className={vd.stickyChromeInner}>
            <CategoryTabRail
              ref={trackRef}
              fadeFrom="#1A1C1E"
              patternFade
              mobileViewportEdge
              mobileTrackGutter
              cursorGrab
              trackClassName={vd.stickyTabTrackInset}
              trackAriaLabel="Experience sections"
            >
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                data-tab-key={tab}
                onClick={() => onTabClick(tab)}
                className={clsx(
                  stickyCategoryTabClass(activeTab === tab),
                  "flex-shrink-0 snap-start",
                )}
                aria-current={activeTab === tab ? "true" : undefined}
              >
                {tab}
              </button>
            ))}
            </CategoryTabRail>
          </div>
        </div>
      </div>
    </>
  );
}

export function VillaExperienceBookingBottomBar({
  villaId,
  onwardPrice,
  onEnquireClick,
  placement = "viewport",
}: {
  villaId: string;
  onwardPrice: string | null | undefined;
  onEnquireClick: () => void;
  placement?: "viewport" | "sheet";
}) {
  const priceMain = onwardPrice?.trim() || "Enquire";
  return (
    <div
      className={clsx(
        "jade-scroll-chrome flex w-full justify-center transition-all",
        placement === "sheet"
          ? clsx(EXPERIENCE_OVERLAY_BOTTOM_BAR_SHEET_CLASS, "bg-jade-charcoal")
          : clsx(
              "fixed bottom-0 left-0 z-[150] hidden md:flex",
              VILLA_DETAIL_PRICING_BOTTOM_BAR_CHROME_CLASS,
              "pt-4",
              OVERLAY_MOBILE_ACTION_BAR_PB_CLASS,
              "md:pb-4",
            ),
      )}
    >
      <VillaPricingBottomBarRow
        priceDisplay={priceMain}
        onEnquireClick={onEnquireClick}
        bookHref={`/book?villa=${villaId}`}
        className="relative z-[3]"
      />
    </div>
  );
}
