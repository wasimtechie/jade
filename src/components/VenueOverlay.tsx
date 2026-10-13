"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  Share2,
  Users,
  Car,
  Home,
  Play,
  Phone,
  Mail,
  User,
  Facebook,
  Instagram,
  Youtube,
  Wifi,
  Wind,
  Waves,
  Dribbble,
  Presentation,
  Trees,
  Mountain,
  PartyPopper,
  Bath,
  Sun,
  ChefHat,
  SprayCan,
  Check,
  Zap,
  LayoutGrid,
  Leaf,
  HandPlatter,
  Bell,
  Sparkles,
  ShieldCheck,
  Heart,
  Coffee,
  Search,
  Mic,
  Music,
  Info,
  Download,
} from "lucide-react";

// Icon mapping helper matching villa detail page
const getIcon = (iconName?: string, title?: string) => {
  const icons: any = {
    Wifi,
    Car,
    Wind,
    Waves,
    Dribbble,
    Presentation,
    Trees,
    Mountain,
    PartyPopper,
    Bath,
    Home,
    Sun,
    ChefHat,
    SprayCan,
    User,
    Phone,
    Check,
    Zap,
    LayoutGrid,
    Leaf,
    HandPlatter,
    Bell,
    Sparkles,
    ShieldCheck,
    Heart,
    Coffee,
    Search,
    Mic,
    Music,
  };

  const name = iconName?.toLowerCase() || "";
  const t = title?.toLowerCase() || "";

  if (icons[iconName || ""]) return icons[iconName || ""];

  if (name.includes("chef") || t.includes("chef") || t.includes("cooking"))
    return ChefHat;
  if (name.includes("butler") || t.includes("butler") || t.includes("service"))
    return HandPlatter;
  if (
    name.includes("housekeeping") ||
    t.includes("housekeeping") ||
    t.includes("cleaning")
  )
    return Sparkles;
  if (
    name.includes("concierge") ||
    t.includes("concierge") ||
    t.includes("help") ||
    t.includes("phone")
  )
    return Bell;
  if (name.includes("security") || t.includes("security")) return ShieldCheck;
  if (name.includes("wellness") || t.includes("wellness") || t.includes("spa"))
    return Heart;
  if (
    name.includes("breakfast") ||
    t.includes("breakfast") ||
    t.includes("coffee")
  )
    return Coffee;

  return icons[iconName || ""] || Info;
};
import { usePathname } from "next/navigation";
import PrimaryButton from "@/components/PrimaryButton";
import { useVillaListingImages } from "@/lib/useVillaListingImages";
import {
  formatIntroEventStat,
  formatIntroStayStat,
} from "@/lib/villaDisplay";
import type { OverlayPageKey } from "@/lib/overlayVillaData";
import { getOverlayVillaData } from "@/lib/overlayVillaData";
import type { HeroSplitCustom } from "@/lib/heroSplitCarouselVariants";
import { getVillaGoogleMapsUrl } from "@/lib/googleMapsLinks";
import VillaPricingBlocks, {
  buildWeddingWeekendOverlayPricingBlocks,
} from "@/components/experience/VillaPricingBlocks";
import VillaDetailAmenityGrid from "@/components/villa/VillaDetailAmenityGrid";
import VillaDetailLocationBlock from "@/components/villa/VillaDetailLocationBlock";
import VillaDetailMeanderStrip from "@/components/villa/VillaDetailMeanderStrip";
import VillaOverlayFaqPolicies from "@/components/villa/VillaOverlayFaqPolicies";
import VillaOverlayIntroAmenities from "@/components/villa/VillaOverlayIntroAmenities";
import VillaDetailPerfectForTags from "@/components/villa/VillaDetailPerfectForTags";
import VillaDetailWalkthroughPoster from "@/components/villa/VillaDetailWalkthroughPoster";
import WeddingVenueEnquiryForm from "@/components/experience/WeddingVenueEnquiryForm";
import { EXPERIENCE_OVERLAY_ROOT_CLASS } from "@/lib/experienceOverlayTheme";
import { useOverlayScrollChromeHide } from "@/lib/useOverlayScrollChromeHide";
import OverlayEnquirySuccessLayer from "@/components/overlays/OverlayEnquirySuccessLayer";
import { useVenueOverlaySectionNav } from "@/lib/useVenueOverlaySectionNav";
import {
  VillaExperienceBookingBottomBar,
  VillaExperienceHeroCarousel,
  VillaExperienceOverlayCloseFramer,
  VillaExperienceOverlayBody,
  VillaExperienceStickyTabs,
  isExperienceOverlayMdUp,
} from "@/components/experience/VillaExperienceOverlayLayout";
import VillaDetailIntroSection from "@/components/villa/VillaDetailIntroSection";
import clsx from "clsx";
import {
  VILLA_DETAIL_CHARCOAL,
  VILLA_DETAIL_GREEN,
  VILLA_DETAIL_SPACING,
} from "@/components/villa/villaDetailSpacing";

const vd = VILLA_DETAIL_SPACING;

interface VenueOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  villa: any;
  context?: "wedding" | "weekend";
  overlayPage?: OverlayPageKey;
}

const VenueOverlay: React.FC<VenueOverlayProps> = ({
  isOpen,
  onClose,
  villa,
  context,
  overlayPage,
}) => {
  const MotionDiv = motion.div;
  const MotionButton = motion.button;
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("Amenities");
  const [view, setView] = useState<"form" | "success">("form");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const reducedMotion = useReducedMotion();
  const { isHidden: isCloseButtonHidden, onScroll: handleScrollBase } =
    useOverlayScrollChromeHide(150);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!isExperienceOverlayMdUp()) return;
    handleScrollBase(e);
  };

  const overlayCarouselCustom: HeroSplitCustom = {
    dir: direction,
    lowFx: !!reducedMotion,
  };
  const formRef = useRef<HTMLDivElement>(null);
  const overlayScrollRef = useRef<HTMLDivElement>(null);
  const [overlayScrollRootGen, setOverlayScrollRootGen] = useState(0);
  const pathname = usePathname();

  const resolvedContext: VenueOverlayProps["context"] =
    context ??
    (pathname?.includes("/weekend-getaways")
      ? "weekend"
      : pathname?.includes("/weddings")
        ? "wedding"
        : undefined);

  const resolvedPage: OverlayPageKey =
    overlayPage ?? (resolvedContext === "weekend" ? "weekend" : "wedding");

  const overlayVilla = getOverlayVillaData(resolvedPage, villa?.id);
  const v = overlayVilla ?? villa;
  const mapsHref = getVillaGoogleMapsUrl(v);
  const { images: listingImages, primaryImage } = useVillaListingImages(
    v?.id ? { id: v.id, name: v.name, image: v.image } : villa,
  );

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentImageIndex(0);
    setDirection(0);
    setView("form");
    setActiveTab("Amenities");
  }, [isOpen, villa?.id]);

  const images =
    listingImages.filter((i) => i.image).length > 0
      ? listingImages.filter((i) => i.image)
      : [{ name: "Main", image: v?.image || "" }];
  const walkthroughCover = primaryImage || v?.image || "";

  const nextImage = () => {
    setDirection(1);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setDirection(-1);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const tabs = ["Amenities", "Pricing", "Location", "Walkthrough", "FAQ"];

  const { scrollToSection } = useVenueOverlaySectionNav(
    overlayScrollRef,
    setActiveTab,
    isOpen && mounted,
    overlayScrollRootGen,
  );

  const price = (overlayVilla as any)?.overlay?.onwardsPrice ?? null;

  if (!mounted || !isOpen || !villa) return null;

  return createPortal(
    <MotionDiv
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={EXPERIENCE_OVERLAY_ROOT_CLASS}
      data-lenis-prevent
    >
      <VillaExperienceOverlayCloseFramer
        MotionButton={MotionButton}
        onClose={onClose}
        variant="above-sheet"
      />
      <VillaExperienceOverlayCloseFramer
        MotionButton={MotionButton}
        onClose={onClose}
        isHidden={isCloseButtonHidden}
        variant="fixed"
      />

      <VillaExperienceOverlayBody
        scrollRef={overlayScrollRef}
        onScroll={handleScroll}
        onScrollRootUpdated={() => setOverlayScrollRootGen((g) => g + 1)}
        onBackdropClick={view === "form" ? onClose : undefined}
        mobileFooter={
          view === "form" ? (
            <VillaExperienceBookingBottomBar
              placement="sheet"
              villaId={v.id}
              onwardPrice={price}
              onEnquireClick={() => scrollToSection("enquiry")}
            />
          ) : undefined
        }
        pinnedTop={
          <VillaExperienceHeroCarousel
            images={images}
            currentImageIndex={currentImageIndex}
            carouselCustom={overlayCarouselCustom}
            onPrev={prevImage}
            onNext={nextImage}
          />
        }
      >
            <div className={VILLA_DETAIL_CHARCOAL}>
              <div className={vd.sectionShell}>
                <VillaDetailIntroSection
                  eyebrow={v.type || "VILLA"}
                  title={v.name}
                  mapsHref={mapsHref}
                  locationLabel={v.location?.split("·")[0] ?? ""}
                  statsRow={
                    <div className={VILLA_DETAIL_SPACING.introStatsRow}>
                      <div className="flex items-center gap-2.5 whitespace-nowrap flex-shrink-0">
                        <Users className="w-4 h-4 md:w-5 md:h-5 text-[#EFCD62]" strokeWidth={1.5} />
                        <span>
                          {formatIntroEventStat(
                            v,
                            resolvedContext === "weekend" ? "15+ Guests" : "600 Guests",
                          )}
                        </span>
                      </div>
                      <div className="w-[4px] h-[4px] rounded-full bg-white/30 flex-shrink-0" />
                      <div className="flex items-center gap-2.5 whitespace-nowrap flex-shrink-0">
                        <Home className="w-4 h-4 md:w-5 md:h-5 text-[#EFCD62]" strokeWidth={1.5} />
                        <span>
                          {formatIntroStayStat(
                            v,
                            resolvedContext === "weekend" ? "6-12 Stay" : "20 Stay",
                          )}
                        </span>
                      </div>
                      <div className="w-[4px] h-[4px] rounded-full bg-white/30 flex-shrink-0" />
                      <div className="flex items-center gap-2.5 whitespace-nowrap flex-shrink-0">
                        <Car className="w-4 h-4 md:w-5 md:h-5 text-[#EFCD62]" strokeWidth={1.5} />
                        <span>{(overlayVilla as any)?.overlay?.parking ?? (resolvedContext === "weekend" ? "20+ Parking" : "80 Parking")}</span>
                      </div>
                    </div>
                  }
                  amenityHighlights={<VillaOverlayIntroAmenities villa={v} />}
                >
                  <p className={VILLA_DETAIL_SPACING.introDescription}>{v.description}</p>
                  <VillaDetailPerfectForTags tags={v.perfectForTags ?? []} />
                </VillaDetailIntroSection>
              </div>
            </div>

            {/* ── STICKY TABS ─────────────────────────────────────────────── */}
            <VillaExperienceStickyTabs tabs={tabs} activeTab={activeTab} onTabClick={(tab) => scrollToSection(tab)} />

            <VillaDetailAmenityGrid
              amenities={
                v.amenities || [
                  { label: "Lawn Space" },
                  { label: "Private Pool" },
                  { label: "Stay Accommodation" },
                  { label: "Kitchen Access" },
                  { label: "Parking" },
                ]
              }
              title="Venue Amenities"
              showSeeMore={false}
            />

            <section id="pricing" className={VILLA_DETAIL_GREEN}>
              <div className={vd.sectionShell}>
                <div className={clsx(vd.content, vd.stack)}>
                  <VillaPricingBlocks
                    variant="villa-detail"
                    sectionTitle="Pricing"
                    blocks={buildWeddingWeekendOverlayPricingBlocks(v)}
                    footnote={
                      <p className={vd.pricingFootnote}>
                        Note: Prices are base rates and may vary based on season, day of week, and specific requirements. Additional charges may apply for decorations, catering, and extended hours.
                      </p>
                    }
                  />
                </div>
              </div>
            </section>

            <section id="location" className={VILLA_DETAIL_CHARCOAL}>
              <VillaDetailMeanderStrip />
              <div className={vd.sectionShell}>
                <div className={clsx(vd.content, vd.stack)}>
                  <h3 className={vd.heading}>Location</h3>
                  <VillaDetailLocationBlock
                    mapsHref={mapsHref}
                    locationDetails={{
                      mapImage: v.locationDetails?.mapImage,
                      address:
                        v.locationDetails?.address ||
                        "Tranquil Woods, Kanakapura Road, Bangalore - 560062",
                      distance:
                        v.locationDetails?.distance ||
                        "Approximately 45 minutes from Bangalore City Center",
                      nearby: v.locationDetails?.nearby,
                    }}
                    fallbackMapImage={primaryImage || "/Villa_Retreats/Magnolia/Spaces/Villa.webp"}
                  />
                </div>
              </div>
            </section>

            <section id="walkthrough" className={VILLA_DETAIL_CHARCOAL}>
              <div className={vd.sectionShell}>
                <div className={clsx(vd.content, vd.stack)}>
                  <h3 className={vd.heading}>Video Walkthrough</h3>
                  <VillaDetailWalkthroughPoster
                    src={walkthroughCover || "/Villa_Retreats/Magnolia/Hero/hero.webp"}
                  />
                </div>
              </div>
              <VillaDetailMeanderStrip />
            </section>

            <VillaOverlayFaqPolicies
              faqItems={(v.faq || []).map((item: any) => ({
                question: item.question,
                answer: item.answer,
              }))}
              policies={[
                {
                  title: "Cancellation Policy",
                  desc: "Full refund if cancelled 90+ days before. 50% refund for 30-90 days. No refund within 30 days.",
                },
                {
                  title: "Booking Requirements",
                  desc: "30% advance payment required. Balance due 15 days before event. Refundable security deposit applicable.",
                },
                {
                  title: "Outside Vendors",
                  desc: "You can bring your own caterers, decorators, and photographers. Coordination required.",
                },
              ]}
            />

            <section id="enquiry" className={VILLA_DETAIL_CHARCOAL} ref={formRef}>
              <div className={vd.sectionShell}>
                <div className={clsx(vd.content, vd.stack)}>
                        <h3 className={vd.heading}>Plan Your Wedding at Jade</h3>
                        <p className={vd.enquirySectionLead}>
                          Share a few details. Our wedding team will guide you through venues &amp; pricing.
                        </p>
                        <WeddingVenueEnquiryForm onSuccess={() => setView("success")} onClosePrivacyNav={onClose} />
                </div>
              </div>
            </section>
      </VillaExperienceOverlayBody>

      {view === "form" ? (
        <VillaExperienceBookingBottomBar
          villaId={v.id}
          onwardPrice={price}
          onEnquireClick={() => scrollToSection("enquiry")}
        />
      ) : null}

      <OverlayEnquirySuccessLayer
        open={view === "success"}
        onOkay={() => {
          onClose();
          setView("form");
        }}
      />
    </MotionDiv>,
    document.body,
  );
};

export default VenueOverlay;
