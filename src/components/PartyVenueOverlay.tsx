"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  Share2,
  Users,
  Home,
  Play,
  Waves,
  ShieldCheck,
  Wifi,
  Wind,
  Dribbble,
  Presentation,
  Trees,
  Mountain,
  PartyPopper,
  Bath,
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
  Heart,
  Coffee,
  Search,
  Mic,
  Music,
  Info,
  Download,
} from "lucide-react";
import OverlayEnquirySuccessLayer from "@/components/overlays/OverlayEnquirySuccessLayer";
import { sanitizePhoneDigitsInput } from "@/lib/phoneNumberInput";
import {
  validateEmail,
  validateFullName,
  validatePhone,
} from "@/lib/leadFormValidation";
import {
  JADE_FORM_WARN,
  JADE_OVERLAY_FORM_STACK_CLASS,
} from "@/lib/jadeFormTokens";
import EnquirySingleDatePicker from "@/components/enquiry/EnquirySingleDatePicker";
import {
  JadeFloatingField,
  JadeFloatingSelect,
} from "@/components/ui/form";
import JadeFormFieldError from "@/components/ui/form/JadeFormFieldError";

// Icon mapping helper matching villa detail page
const getIcon = (iconName?: string, title?: string) => {
  const icons: any = {
    Wifi,
    Car: Users, // fallback Car to Users if needed, or import Car
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
    Phone: Users,
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
import PrimaryButton from "@/components/PrimaryButton";
import { buildVillaGalleryItems } from "@/lib/villaGallery";
import {
  formatIntroBhkStat,
  formatIntroEventStat,
  formatIntroStayStat,
} from "@/lib/villaDisplay";
import { getOverlayVillaData } from "@/lib/overlayVillaData";
import type { HeroSplitCustom } from "@/lib/heroSplitCarouselVariants";
import { getVillaGoogleMapsUrl } from "@/lib/googleMapsLinks";
import {
  EXPERIENCE_OVERLAY_FLOATING_LABEL_CLASS,
  EXPERIENCE_OVERLAY_ROOT_CLASS,
} from "@/lib/experienceOverlayTheme";
import { useOverlayScrollChromeHide } from "@/lib/useOverlayScrollChromeHide";
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
import VillaDetailMeanderStrip from "@/components/villa/VillaDetailMeanderStrip";
import VillaOverlayFaqPolicies from "@/components/villa/VillaOverlayFaqPolicies";
import VillaOverlayIntroAmenities from "@/components/villa/VillaOverlayIntroAmenities";
import VillaDetailPerfectForTags from "@/components/villa/VillaDetailPerfectForTags";
import VillaDetailWalkthroughPoster from "@/components/villa/VillaDetailWalkthroughPoster";
import VenueEnquiryLegalFootnote from "@/components/experience/VenueEnquiryLegalFootnote";
import clsx from "clsx";
import {
  VILLA_DETAIL_CHARCOAL,
  VILLA_DETAIL_GREEN,
  VILLA_DETAIL_SPACING,
} from "@/components/villa/villaDetailSpacing";
import VillaPricingBlocks, {
  buildPartyOverlayPricingBlocks,
} from "@/components/experience/VillaPricingBlocks";
import VillaDetailAmenityGrid from "@/components/villa/VillaDetailAmenityGrid";
import VillaDetailLocationBlock from "@/components/villa/VillaDetailLocationBlock";

const vd = VILLA_DETAIL_SPACING;

interface PartyVenueOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  villa: any;
  overlayPage?: "party";
}

const PartyVenueOverlay: React.FC<PartyVenueOverlayProps> = ({
  isOpen,
  onClose,
  villa,
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
  const [partyFullName, setPartyFullName] = useState("");
  const [partyPhone, setPartyPhone] = useState("");
  const [partyEmail, setPartyEmail] = useState("");
  const [partyDate, setPartyDate] = useState<Date | null>(null);
  const [partyType, setPartyType] = useState("Birthday Party");
  const [partyFormError, setPartyFormError] = useState<string | null>(null);
  const [partyAttempted, setPartyAttempted] = useState(false);
  const [partyFieldErrors, setPartyFieldErrors] = useState<
    Record<string, string | undefined>
  >({});

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

  const overlayVilla = getOverlayVillaData((overlayPage ?? "party") as any, villa?.id);
  const v = overlayVilla ?? villa;
  const mapsHref = getVillaGoogleMapsUrl(v);
  const partyPricingBlocks = buildPartyOverlayPricingBlocks(v);

  const images = (() => {
    const gallery = buildVillaGalleryItems(v, 8);
    if (gallery.length > 0) return gallery;
    if (v?.spaces?.length > 0) return v.spaces;
    return [{ name: "Main", image: v?.image }];
  })();

  const displayPrice = (overlayVilla as any)?.overlay?.onwardsPrice ?? null;

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
              onwardPrice={displayPrice}
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
                  eyebrow={villa.type || "PARTY VILLA"}
                  title={villa.name}
                  mapsHref={mapsHref}
                  locationLabel={villa.location?.split("·")[0] ?? ""}
                  statsRow={
                    <div className={VILLA_DETAIL_SPACING.introStatsRow}>
                      <div className="flex items-center gap-2.5 whitespace-nowrap flex-shrink-0">
                        <Users className="w-4 h-4 md:w-5 md:h-5 text-[#EFCD62]" strokeWidth={1.5} />
                        <span>{formatIntroEventStat(villa, "30 Guests")}</span>
                      </div>
                      <div className="w-[4px] h-[4px] rounded-full bg-white/30 flex-shrink-0" />
                      <div className="flex items-center gap-2.5 whitespace-nowrap flex-shrink-0">
                        <Home className="w-4 h-4 md:w-5 md:h-5 text-[#EFCD62]" strokeWidth={1.5} />
                        <span>{formatIntroBhkStat(villa, "4 BHK")}</span>
                      </div>
                      <div className="w-[4px] h-[4px] rounded-full bg-white/30 flex-shrink-0" />
                      <div className="flex items-center gap-2.5 whitespace-nowrap flex-shrink-0">
                        <Home className="w-4 h-4 md:w-5 md:h-5 text-[#EFCD62]" strokeWidth={1.5} />
                        <span>{formatIntroStayStat(villa, "15 Stay")}</span>
                      </div>
                    </div>
                  }
                  amenityHighlights={<VillaOverlayIntroAmenities villa={villa} />}
                >
                  <p className={VILLA_DETAIL_SPACING.introDescription}>{villa.description}</p>
                  <VillaDetailPerfectForTags
                    tags={
                      villa.perfectForTags?.length
                        ? villa.perfectForTags
                        : ["Birthdays", "Anniversaries", "Pool Parties", "Reunions"]
                    }
                  />
                </VillaDetailIntroSection>
              </div>
            </div>

            {/* ── STICKY TABS ─────────────────────────────────────────────── */}
            <VillaExperienceStickyTabs tabs={tabs} activeTab={activeTab} onTabClick={(tab) => scrollToSection(tab)} />

            <VillaDetailAmenityGrid
              amenities={
                villa.amenities || [
                  { label: "Private Pool" },
                  { label: "Music System" },
                  { label: "BBQ Setup" },
                  { label: "Indoor Games" },
                  { label: "Kitchen Access" },
                ]
              }
              title="Villa Amenities"
              showSeeMore={false}
            />

            {partyPricingBlocks.length > 0 ? (
              <section id="pricing" className={VILLA_DETAIL_GREEN}>
                <div className={vd.sectionShell}>
                  <div className={clsx(vd.content, vd.stack)}>
                    <VillaPricingBlocks
                      variant="villa-detail"
                      sectionTitle="Party Pricing"
                      blocks={partyPricingBlocks}
                      footnote={
                        <p className={vd.pricingFootnote}>
                          Note: All party pricing is exclusive of GST. Custom packages available.
                        </p>
                      }
                    />
                  </div>
                </div>
              </section>
            ) : null}

            <section id="location" className={VILLA_DETAIL_CHARCOAL}>
              <VillaDetailMeanderStrip />
              <div className={vd.sectionShell}>
                <div className={clsx(vd.content, vd.stack)}>
                  <h3 className={vd.heading}>Location</h3>
                  <VillaDetailLocationBlock
                    mapsHref={mapsHref}
                    locationDetails={{
                      mapImage: v.locationDetails?.mapImage,
                      address: v.locationDetails?.address || v.location,
                      distance:
                        v.locationDetails?.distance ||
                        "Approximately 45 minutes from Bangalore City Center",
                    }}
                    fallbackMapImage="/Villa_Retreats/Magnolia/Spaces/Villa.webp"
                  />
                </div>
              </div>
            </section>

            <section id="walkthrough" className={VILLA_DETAIL_CHARCOAL}>
              <div className={vd.sectionShell}>
                <div className={clsx(vd.content, vd.stack)}>
                  <h3 className={vd.heading}>Video Walkthrough</h3>
                  <VillaDetailWalkthroughPoster src="/Villa_Retreats/Magnolia/Hero/hero.webp" />
                </div>
              </div>
              <VillaDetailMeanderStrip />
            </section>

            <VillaOverlayFaqPolicies
              faqItems={(villa.faq || []).map((item: any) => ({
                question: item.question,
                answer: item.answer,
              }))}
              policies={[
                {
                  title: "Check-in / Check-out",
                  desc: "Standard check-in at 2:00 PM and check-out at 11:00 AM. Early check-in subject to availability.",
                },
                {
                  title: "Music & Noise",
                  desc: "Outdoor music allowed till 10:00 PM as per local regulations. Indoor music can continue at moderate levels.",
                },
                {
                  title: "Refund Policy",
                  desc: "Full refund for cancellations made 15 days prior to check-in. No refunds within 7 days of booking.",
                },
              ]}
            />

            <section id="enquiry" className={VILLA_DETAIL_CHARCOAL} ref={formRef}>
              <div className={vd.sectionShell}>
                <div className={clsx(vd.content, vd.stack)}>
                        <h3 className={vd.heading}>Plan Your Celebration</h3>
                        <p className={vd.enquirySectionLead}>
                          Share a few details. Our concierge team will help you pick
                          the perfect villa for your party.
                        </p>

                        <form
                          className={JADE_OVERLAY_FORM_STACK_CLASS}
                          onSubmit={(e) => {
                            e.preventDefault();
                            setPartyAttempted(true);
                            const errs: Record<string, string | undefined> = {
                              fullName: validateFullName(partyFullName),
                              phone: validatePhone(partyPhone),
                              email: partyEmail.trim()
                                ? validateEmail(partyEmail)
                                : undefined,
                              eventDate: !partyDate
                                ? "Please choose an event date."
                                : undefined,
                            };
                            setPartyFieldErrors(errs);
                            if (Object.values(errs).some(Boolean)) return;
                            setPartyFormError(null);
                            setView("success");
                          }}
                          noValidate
                        >
                          {partyFormError ? (
                            <p
                              className="text-gh-label font-manrope"
                              style={{ color: JADE_FORM_WARN }}
                              role="alert"
                            >
                              {partyFormError}
                            </p>
                          ) : null}
                          <JadeFloatingField
                            id="party-fullName"
                            label="Full Name"
                            value={partyFullName}
                            onChange={setPartyFullName}
                            theme="experienceCharcoal"
                            invalid={Boolean(partyFieldErrors.fullName)}
                            showError={
                              partyAttempted && Boolean(partyFieldErrors.fullName)
                            }
                            errorMessage={partyFieldErrors.fullName}
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <JadeFloatingField
                              id="party-phone"
                              label="Phone"
                              type="tel"
                              inputMode="numeric"
                              autoComplete="tel"
                              value={partyPhone}
                              onChange={(v) =>
                                setPartyPhone(sanitizePhoneDigitsInput(v))
                              }
                              theme="experienceCharcoal"
                              invalid={Boolean(partyFieldErrors.phone)}
                              showError={
                                partyAttempted && Boolean(partyFieldErrors.phone)
                              }
                              errorMessage={partyFieldErrors.phone}
                            />
                            <div className="flex min-w-0 flex-col gap-1.5">
                              <EnquirySingleDatePicker
                                label="Event date"
                                theme="experienceCharcoal"
                                value={partyDate}
                                onChange={setPartyDate}
                                invalid={
                                  partyAttempted &&
                                  Boolean(partyFieldErrors.eventDate)
                                }
                                className="min-w-0"
                              />
                              {partyAttempted && partyFieldErrors.eventDate ? (
                                <JadeFormFieldError
                                  id="party-date-err"
                                  message={partyFieldErrors.eventDate}
                                />
                              ) : null}
                            </div>
                          </div>
                          <JadeFloatingField
                            id="party-email"
                            label="Email (optional)"
                            type="email"
                            required={false}
                            autoComplete="email"
                            value={partyEmail}
                            onChange={setPartyEmail}
                            theme="experienceCharcoal"
                            invalid={Boolean(partyFieldErrors.email)}
                            showError={
                              partyAttempted && Boolean(partyFieldErrors.email)
                            }
                            errorMessage={partyFieldErrors.email}
                          />
                          <JadeFloatingSelect
                            id="party-type"
                            label="Celebration Type"
                            value={partyType}
                            onChange={setPartyType}
                            options={[
                              "Birthday Party",
                              "Anniversary",
                              "Pool Party",
                              "Get-together",
                              "Other",
                            ]}
                            theme="experienceCharcoal"
                            required={false}
                          />

                          <VenueEnquiryLegalFootnote onClosePrivacyNav={onClose} />

                          <PrimaryButton type="submit" width="form" withArrow={false}>
                            ENQUIRE NOW
                          </PrimaryButton>
                        </form>
                </div>
              </div>
            </section>
      </VillaExperienceOverlayBody>

      {view === "form" ? (
        <VillaExperienceBookingBottomBar
          villaId={v.id}
          onwardPrice={displayPrice}
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

export default PartyVenueOverlay;
