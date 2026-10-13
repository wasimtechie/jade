/**
 * Villa detail page — 8pt spatial system (mobile-first).
 *
 * Scale: 8 · 16 · 24 · 32 · 40 · 48 · 64
 * - Gutter: 16px (base) → 20px (sm) → 24px (lg) — shared by content, tabs, pricing bar
 * - Section padding: 40px top & bottom → 64px (lg) via .villa-section-pad-block
 * - In-section stacks: 32px between major blocks · 16px for tight groups
 */

import { JADE_BTN_CHROME_HEIGHT } from "@/lib/jadeButtonTokens";

export const VILLA_DETAIL_SPACING = {
  gutterX: "px-4 sm:px-5 lg:px-6",
  /**
   * Edge-bleed horizontal scroll tracks — left inset matches gutterX (pl + scroll-pl).
   * Use on Spaces category nav + image rails; do not combine with hScrollTrackMobileGutter.
   */
  hScrollTrackInset:
    "pl-4 sm:pl-5 lg:pl-6 scroll-pl-4 sm:scroll-pl-5 lg:scroll-pl-6 scroll-pr-0",
  /** Symmetric block padding — see --villa-section-pad-block in globals.css */
  sectionY: "villa-section-pad-block",
  page: "max-w-7xl mx-auto w-full",
  /** Section body inside sectionShell — full column width (aligns with tabs + pricing bar). */
  content: "w-full min-w-0",
  /** Horizontal inset matching sectionShell — pricing bar, sticky tabs (lg+), chrome rows. */
  contentInsetShell: "max-w-7xl mx-auto w-full px-4 sm:px-5 lg:px-6",
  /** Equal vertical + horizontal section padding */
  sectionShell:
    "px-4 sm:px-5 lg:px-6 villa-section-pad-block max-w-7xl mx-auto w-full",
  stack: "flex flex-col gap-6",
  /** Spaces / Experiences / Perfect for — tighter vertical rhythm on desktop */
  mediaSectionStack: "flex flex-col gap-6 lg:gap-4 min-h-0",
  /** Carousel + video frames — taller stage on desktop (dynamic vh cap) */
  mediaStageFrame:
    "aspect-[3/4] md:aspect-[16/9] lg:aspect-auto lg:h-[min(68dvh,760px)]",
  /** Perfect for cards — shorter than portrait mobile; capped on desktop */
  perfectForCard:
    "relative w-full overflow-hidden aspect-[3/4] lg:aspect-auto lg:h-[min(38dvh,380px)]",
  /** Amenities — 2 cols mobile; 3 cols desktop (no see-more needed at lg+) */
  amenitiesGrid:
    "grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-6",
  stackSm: "flex flex-col gap-4",
  stackTight: "flex flex-col gap-2",
  /**
   * Section 1 intro (detail + know-more overlays).
   * Rhythm: 12px eyebrow→title · 16px title→location · 24px location→stats · 32px stats→amenities · 32px amenities→body
   */
  introHeader: "flex flex-col gap-3",
  introEyebrow:
    "text-[#EFCD62] text-[10px] md:text-gh-label font-bold tracking-[0.2em] uppercase",
  introTitle:
    "text-[28px] md:text-[32px] font-philosopher text-white leading-tight m-0",
  introLocation:
    "group mt-4 flex w-fit max-w-full items-center gap-2 text-white/90 rounded-sm outline-none transition-colors hover:text-[#EFCD62] focus-visible:ring-2 focus-visible:ring-[#EFCD62]/60",
  introStats: "mt-6 w-full min-w-0",
  introStatsRow:
    "jade-hscroll-track flex flex-nowrap w-max max-w-full gap-x-4 items-center text-white/90 text-[10px] md:text-[12px] lg:text-[14px] font-normal font-manrope tracking-wide",
  introAmenity: "mt-8 w-full min-w-0",
  introBody: "mt-8 flex flex-col gap-6",
  introDescription:
    "font-manrope text-white/70 text-gh-body leading-relaxed whitespace-pre-line text-justify",
  /** Intro block — full section width (no max-w-4xl narrowing; aligns with tabs + pricing). */
  introContent: "w-full min-w-0",
  row: "flex flex-wrap gap-4",
  hScrollBleed: "-mx-4 px-4 sm:-mx-5 sm:px-5 lg:-mx-6 lg:px-6",
  hScrollTrack: "flex gap-4 overflow-x-auto pb-2 snap-x scrollbar-none",
  /** Stats chips row — stays inside page gutters (no viewport bleed). */
  statsTagsRail: "w-full min-w-0 overflow-x-auto scrollbar-none",
  /** Shared mobile: shell flush to device edges; track uses 16px inner gutter (see globals.css). */
  hScrollViewportEdge: "max-sm:jade-hscroll-viewport--edge",
  hScrollTrackMobileGutter: "max-sm:jade-hscroll-track--mobile-gutter",
  /**
   * Sticky category chrome — full-width background; inner inset at lg+ only.
   * Pair with MeanderStrip layout="fullBleed" + stickyChromeInner + CategoryTabRail.
   */
  stickyChromeOuter: "w-full min-w-0",
  /** Desktop/laptop: tab row aligns with sectionShell; below lg unchanged (track inset). */
  stickyChromeInner: "w-full lg:max-w-7xl lg:mx-auto lg:px-6",
  /** Tab track gutters — mobile/tablet only (lg+ defers to stickyChromeInner). */
  stickyTabTrackInset:
    "pl-4 sm:pl-5 scroll-pl-4 sm:scroll-pl-5 lg:pl-0 lg:scroll-pl-0 scroll-pr-0",
  /** @deprecated Use stickyChromeOuter + stickyChromeInner */
  stickyChromeShell: "w-full min-w-0 lg:max-w-7xl lg:mx-auto lg:px-6",
  /**
   * Horizontal scroll rail — edge-to-edge on mobile; inset gutters at md+.
   * See `.amenity-highlight-*` in globals.css.
   */
  amenityHighlightViewportShell:
    "amenity-highlight-rail amenity-highlight-viewport w-full min-w-0",
  /** Mobile: viewport edge-to-edge; sm+: full sectionShell column width. */
  amenityHighlightViewportEdge:
    "max-sm:amenity-highlight-viewport--edge max-sm:jade-hscroll-viewport--edge",
  amenityHighlightViewportInset:
    "sm:amenity-highlight-viewport--content-inset",
  /** Villa detail amenity row — layout mode is container-driven, not viewport lg. */
  amenityHighlightTrackFullBleed:
    "amenity-highlight-track--responsive jade-hscroll-track max-sm:jade-hscroll-track--mobile-gutter scrollbar-none",
  /** Same row in experience overlays — right-edge scroll bleed + extra left inset on the track. */
  amenityHighlightTrackOverlay:
    "amenity-highlight-track--responsive jade-hscroll-track flex w-full min-w-0 gap-4 overflow-x-auto pb-8 mb-8 snap-x scrollbar-none scroll-pl-0 scroll-pr-4 sm:scroll-pr-6 md:scroll-pr-12 max-sm:-mr-4 max-sm:pr-4 sm:-mr-6 sm:pr-6 md:-mr-12 md:pr-12",
  /**
   * Overlay sticky category bar — same viewport + track contract as intro amenity highlights.
   * Edge bleed + 16px insets: globals.css `[data-experience-overlay-tabs]` (max-width 767px).
   */
  overlayCategoryRailViewport:
    "amenity-highlight-rail amenity-highlight-viewport w-full min-w-0",
  overlayCategoryRailTrack:
    "amenity-highlight-track--responsive jade-hscroll-track flex w-full min-w-0 gap-4 overflow-x-auto snap-x scrollbar-none overscroll-x-contain py-3 sm:py-4",
  /** Villa detail + venue overlay section titles (Spaces, Experiences, FAQ, etc.) */
  heading: "text-[32px] font-philosopher text-white leading-tight",
  /** Alias — section titles (Experiences, Spaces, FAQ, etc.) */
  sectionHeading: "text-[32px] font-philosopher text-white leading-tight",
  subheading: "text-[32px] font-philosopher text-white leading-tight",
  /** Carousel / image frame primary label (subordinate to sectionHeading) */
  mediaCaption:
    "text-white text-sm md:text-base uppercase tracking-[0.2em] font-bold font-manrope",
  /** Secondary line below mediaCaption */
  mediaDescription:
    "text-white/70 text-[13px] md:text-[15px] font-manrope leading-relaxed",
  eyebrow: "text-[#EFCD62] text-gh-label font-bold tracking-[0.2em] uppercase",
  /** Pricing section legal note — fluid ~8px (see --fs-pricing-footnote) */
  pricingFootnote:
    "text-white/70 font-manrope text-gh-pricing-footnote leading-snug",
  /** Venue overlay enquiry section lead copy */
  enquirySectionLead: "text-white/60 text-gh-body font-manrope",
  /** Venue overlay form group labels (toggle / checkbox sections) */
  formGroupLabel:
    "text-white/60 text-gh-label font-bold uppercase tracking-widest",
  /** Venue overlay form option labels (toggle / checkbox items) */
  formOptionLabel:
    "text-white/80 text-gh-desc leading-snug group-hover:text-white transition-colors",
  /** Venue overlay enquiry legal footnote */
  formLegalFootnote:
    "text-[11px] text-white/30 pt-2 text-center font-manrope leading-snug",
  /** Fixed pricing bar — "Starting from" label */
  pricingBarLabel:
    "text-white/60 text-[10px] sm:text-[12px] md:text-[13px] font-bold font-manrope leading-tight",
  /** Fixed pricing bar — price value (2 lines on phone, single line md+) */
  pricingBarPrice:
    "text-white text-[13px] sm:text-[15px] md:text-[18px] lg:text-[20px] font-extrabold font-manrope leading-tight line-clamp-2 sm:line-clamp-1 sm:truncate",
  /** Pricing bar inner row — price column shrinks; actions stay fixed width */
  pricingBarRow:
    "relative z-[3] grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 sm:gap-x-4 md:gap-x-6",
  pricingBarPriceCol: "min-w-0 overflow-hidden pr-0.5 sm:pr-1",
  pricingBarActions: "flex shrink-0 items-center gap-1.5 sm:gap-3 md:gap-6",
  pricingBarEnquire:
    "text-[#EFCD62] text-[10px] sm:text-gh-label font-bold tracking-[0.1em] sm:tracking-[0.2em] uppercase hover:text-white transition-colors whitespace-nowrap shrink-0",
  pricingBarBookCta:
    "!px-2.5 sm:!px-4 md:!px-5 !tracking-[0.1em] sm:!tracking-[0.15em]",
  heroInsetX: "px-4 sm:px-5 lg:px-6",
  /**
   * View villa detail — fixed action header (transparent shell).
   * Row: py-2 (16px) + 44px controls = 60px total.
   */
  actionHeaderRow:
    "flex justify-between items-center w-full py-2",
  actionHeaderControl: `${JADE_BTN_CHROME_HEIGHT} w-11 min-w-[44px] max-w-[44px] shrink-0 flex items-center justify-center`,
  actionHeaderIcon: "w-4 h-4 md:w-[18px] md:h-[18px]",
  actionHeaderEnquire: `${JADE_BTN_CHROME_HEIGHT} shrink-0 px-3 md:px-4 flex items-center justify-center whitespace-nowrap`,
  heroGalleryCta: `${JADE_BTN_CHROME_HEIGHT} shrink-0 inline-flex max-w-full items-center justify-center gap-1.5 px-3 md:px-4 py-0 whitespace-nowrap`,
  /** @deprecated Use STICKY_BELOW_VILLA_ACTION_COMPACT_CLASS from scrollChromeLayout */
  actionHeaderStickyTop: "top-[60px]",
  heroBottom: "bottom-8 lg:bottom-12",
  /** Carousel arrows — align to page gutter (not flush to viewport) */
  heroArrowLeft: "left-4 sm:left-5 lg:left-6",
  heroArrowRight: "right-4 sm:right-5 lg:right-6",
} as const;

export const VILLA_DETAIL_CHARCOAL = "w-full bg-jade-charcoal text-white";
export const VILLA_DETAIL_GREEN = "w-full bg-jade-green text-white";
