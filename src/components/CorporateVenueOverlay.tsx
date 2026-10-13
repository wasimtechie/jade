"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  Share2,
  Users,
  Home,
  ArrowRight,
  Calendar,
  ChevronRight,
  Play,
  Facebook,
  Instagram,
  Youtube,
  Check,
} from "lucide-react";
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
  buildCorporateOverlayPricingBlocks,
} from "@/components/experience/VillaPricingBlocks";
import VillaDetailAmenityGrid from "@/components/villa/VillaDetailAmenityGrid";
import VillaDetailLocationBlock from "@/components/villa/VillaDetailLocationBlock";
import VillaDetailMeanderStrip from "@/components/villa/VillaDetailMeanderStrip";
import VillaOverlayFaqPolicies from "@/components/villa/VillaOverlayFaqPolicies";
import VillaOverlayIntroAmenities from "@/components/villa/VillaOverlayIntroAmenities";
import VillaDetailPerfectForTags from "@/components/villa/VillaDetailPerfectForTags";
import VillaDetailWalkthroughPoster from "@/components/villa/VillaDetailWalkthroughPoster";
import VenueEnquiryLegalFootnote from "@/components/experience/VenueEnquiryLegalFootnote";
import {
  EXPERIENCE_OVERLAY_FLOATING_LABEL_CLASS,
  EXPERIENCE_OVERLAY_ROOT_CLASS,
} from "@/lib/experienceOverlayTheme";
import { useOverlayScrollChromeHide } from "@/lib/useOverlayScrollChromeHide";
import OverlayEnquirySuccessLayer from "@/components/overlays/OverlayEnquirySuccessLayer";
import { useVenueOverlaySectionNav } from "@/lib/useVenueOverlaySectionNav";
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
  JadeFloatingTextarea,
} from "@/components/ui/form";
import JadeFormFieldError from "@/components/ui/form/JadeFormFieldError";
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

interface CorporateVenueOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  villa: any;
  overlayPage?: OverlayPageKey;
}

const CorporateVenueOverlay: React.FC<CorporateVenueOverlayProps> = ({
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
  const tabsRef = useRef<HTMLDivElement>(null);
  const [corpFullName, setCorpFullName] = useState("");
  const [corpCompany, setCorpCompany] = useState("");
  const [corpPhone, setCorpPhone] = useState("");
  const [corpEmail, setCorpEmail] = useState("");
  const [corpTeamSize, setCorpTeamSize] = useState("");
  const [corpDate, setCorpDate] = useState<Date | null>(null);
  const [corpFormats, setCorpFormats] = useState<Set<string>>(new Set());
  const [corpServices, setCorpServices] = useState<Set<string>>(new Set());
  const [corpPref, setCorpPref] = useState<Set<string>>(new Set());
  const [corpNotes, setCorpNotes] = useState("");
  const [corpError, setCorpError] = useState<string | null>(null);
  const [corpAttempted, setCorpAttempted] = useState(false);
  const [corpFieldErrors, setCorpFieldErrors] = useState<
    Record<string, string | undefined>
  >({});

  const corpToggle = (
    setFn: React.Dispatch<React.SetStateAction<Set<string>>>,
    label: string,
  ) => {
    setFn((prev) => {
      const n = new Set(prev);
      if (n.has(label)) n.delete(label);
      else n.add(label);
      return n;
    });
  };

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

  const overlayVilla = getOverlayVillaData(overlayPage ?? "corporate", villa?.id);
  const v = overlayVilla ?? villa;
  const mapsHref = getVillaGoogleMapsUrl(v);
  const corporatePricingBlocks = buildCorporateOverlayPricingBlocks(v);
  const { images: listingImages, primaryImage } = useVillaListingImages(
    v?.id ? { id: v.id, name: v.name, image: v.image } : villa,
  );

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
              onwardPrice={(v as { overlay?: { onwardsPrice?: string } })?.overlay?.onwardsPrice ?? null}
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
            fallbackSlideLabel="Property"
          />
        }
      >
            <div className={VILLA_DETAIL_CHARCOAL}>
              <div className={vd.sectionShell}>
                <VillaDetailIntroSection
                  eyebrow={v.type || "CORPORATE RETREAT"}
                  title={v.name}
                  mapsHref={mapsHref}
                  locationLabel={v.location?.split("·")[0] ?? v.location ?? ""}
                  statsRow={
                    <div className={VILLA_DETAIL_SPACING.introStatsRow}>
                      <div className="flex items-center gap-2.5 whitespace-nowrap flex-shrink-0">
                        <Users className="w-4 h-4 md:w-5 md:h-5 text-[#EFCD62]" strokeWidth={1.5} />
                        <span>{formatIntroEventStat(v, "500 Guests")}</span>
                      </div>
                      <div className="w-[4px] h-[4px] rounded-full bg-white/30 flex-shrink-0" />
                      <div className="flex items-center gap-2.5 whitespace-nowrap flex-shrink-0">
                        <Home className="w-4 h-4 md:w-5 md:h-5 text-[#EFCD62]" strokeWidth={1.5} />
                        <span>{formatIntroStayStat(v, "20 Stay")}</span>
                      </div>
                      <div className="w-[4px] h-[4px] rounded-full bg-white/30 flex-shrink-0" />
                      <div className="flex items-center gap-2.5 whitespace-nowrap flex-shrink-0">
                        <Calendar className="w-4 h-4 md:w-5 md:h-5 text-[#EFCD62]" strokeWidth={1.5} />
                        <span>{v.stats?.lawn || v.stats?.villaArea || "Private Lawn"}</span>
                      </div>
                    </div>
                  }
                  amenityHighlights={<VillaOverlayIntroAmenities villa={v} />}
                >
                  <p className={VILLA_DETAIL_SPACING.introDescription}>
                    {v.description ||
                      `${v.name} by Jade is an expansive corporate retreat featuring private spaces, lush lawns, and dedicated outdoor areas. Designed for corporate offsites, team celebrations, and immersive workations, the venue balances structured productivity with open-air engagement.`}
                  </p>
                  <VillaDetailPerfectForTags
                    tags={
                      v.perfectForTags?.length
                        ? v.perfectForTags
                        : [
                            "Corporate Offsites",
                            "Leadership Retreats",
                            "Team Outings",
                            "Workations",
                            "Recognition Events",
                          ]
                    }
                  />
                </VillaDetailIntroSection>
              </div>
            </div>

            <VillaExperienceStickyTabs
              tabs={tabs}
              activeTab={activeTab}
              onTabClick={(tab) => scrollToSection(tab)}
            />


            <VillaDetailAmenityGrid
              amenities={
                v.amenities || [
                  { label: "Conference Room" },
                  { label: "High-speed Wi-Fi" },
                  { label: "AV Equipment" },
                  { label: "Team Building Areas" },
                  { label: "Dining Hall" },
                ]
              }
              title="Corporate Amenities"
              showSeeMore={false}
            />

            {corporatePricingBlocks.length > 0 ? (
              <section id="pricing" className={VILLA_DETAIL_GREEN}>
                <div className={vd.sectionShell}>
                  <div className={clsx(vd.content, vd.stack)}>
                    <VillaPricingBlocks
                      variant="villa-detail"
                      sectionTitle="Corporate Pricing"
                      blocks={corporatePricingBlocks}
                      footnote={
                        <p className={vd.pricingFootnote}>
                          Note: All corporate pricing is exclusive of GST. Custom packages for team building activities available.
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
                    fallbackMapImage={
                      primaryImage || "/Villa_Retreats/Magnolia/Spaces/Villa.webp"
                    }
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
              faqItems={(villa.faq || []).map((item: any) => ({
                question: item.question,
                answer: item.answer,
              }))}
              policies={[
                {
                  title: "AV Equipment",
                  desc: "Projectors, screens, and basic sound systems are included. Specialized equipment on request.",
                },
                {
                  title: "Catering",
                  desc: "In-house culinary team provides all meals. Customized corporate menus available.",
                },
                {
                  title: "Booking Policy",
                  desc: "50% advance required to block dates. Full payment due week before the event.",
                },
              ]}
            />

            <section id="enquiry" className={VILLA_DETAIL_CHARCOAL} ref={formRef}>
              <div className={vd.sectionShell}>
                <div className={clsx(vd.content, vd.stack)}>
                    <h3 className={vd.heading}>Plan Your Corporate Retreat</h3>
                    <p className={vd.enquirySectionLead}>
                      Share a few details. Our corporate team will guide you
                      through venues &amp; pricing.
                    </p>

                    <form
                      className={JADE_OVERLAY_FORM_STACK_CLASS}
                      noValidate
                      onSubmit={(e) => {
                        e.preventDefault();
                        setCorpAttempted(true);
                        const errs: Record<string, string | undefined> = {
                          fullName: validateFullName(corpFullName),
                          company: !corpCompany.trim()
                            ? "Please enter your company name."
                            : undefined,
                          phone: validatePhone(corpPhone),
                          email: validateEmail(corpEmail),
                          teamSize: !corpTeamSize.trim()
                            ? "Please enter an approximate team size."
                            : undefined,
                          eventDate: !corpDate
                            ? "Please choose an event date."
                            : undefined,
                        };
                        setCorpFieldErrors(errs);
                        if (Object.values(errs).some(Boolean)) return;
                        setCorpError(null);
                        setView("success");
                      }}
                    >
                      {corpError ? (
                        <p
                          className="text-gh-label font-manrope"
                          style={{ color: JADE_FORM_WARN }}
                          role="alert"
                        >
                          {corpError}
                        </p>
                      ) : null}

                      <JadeFloatingField
                        id="corp-fullName"
                        label="Full Name"
                        value={corpFullName}
                        onChange={setCorpFullName}
                        theme="experienceCharcoal"
                        invalid={Boolean(corpFieldErrors.fullName)}
                        showError={corpAttempted && Boolean(corpFieldErrors.fullName)}
                        errorMessage={corpFieldErrors.fullName}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <JadeFloatingField
                          id="corp-company"
                          label="Company Name"
                          value={corpCompany}
                          onChange={setCorpCompany}
                          theme="experienceCharcoal"
                          invalid={Boolean(corpFieldErrors.company)}
                          showError={corpAttempted && Boolean(corpFieldErrors.company)}
                          errorMessage={corpFieldErrors.company}
                        />
                        <JadeFloatingField
                          id="corp-phone"
                          label="Phone Number"
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel"
                          value={corpPhone}
                          onChange={(v) =>
                            setCorpPhone(sanitizePhoneDigitsInput(v))
                          }
                          theme="experienceCharcoal"
                          invalid={Boolean(corpFieldErrors.phone)}
                          showError={corpAttempted && Boolean(corpFieldErrors.phone)}
                          errorMessage={corpFieldErrors.phone}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <JadeFloatingField
                          id="corp-email"
                          label="Email"
                          type="email"
                          autoComplete="email"
                          value={corpEmail}
                          onChange={setCorpEmail}
                          theme="experienceCharcoal"
                          invalid={Boolean(corpFieldErrors.email)}
                          showError={corpAttempted && Boolean(corpFieldErrors.email)}
                          errorMessage={corpFieldErrors.email}
                        />
                        <JadeFloatingField
                          id="corp-teamSize"
                          label="Team Size"
                          value={corpTeamSize}
                          onChange={setCorpTeamSize}
                          theme="experienceCharcoal"
                          invalid={Boolean(corpFieldErrors.teamSize)}
                          showError={corpAttempted && Boolean(corpFieldErrors.teamSize)}
                          errorMessage={corpFieldErrors.teamSize}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <EnquirySingleDatePicker
                          label="Event date"
                          theme="experienceCharcoal"
                          value={corpDate}
                          onChange={setCorpDate}
                          invalid={
                            corpAttempted &&
                            Boolean(corpFieldErrors.eventDate)
                          }
                        />
                        {corpAttempted && corpFieldErrors.eventDate ? (
                          <JadeFormFieldError
                            id="corp-date-err"
                            message={corpFieldErrors.eventDate}
                          />
                        ) : null}
                      </div>

                      <div className="space-y-2.5">
                        <p className={vd.formGroupLabel}>Retreat Format</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {[
                            "Leadership Retreat",
                            "Day Outing / Team Outing",
                            "Recognition Programme",
                            "Offsite (Overnight)",
                            "Conference / Workshop",
                            "Success Party",
                          ].map((label) => {
                            const checked = corpFormats.has(label);
                            return (
                              <label
                                key={label}
                                className="flex items-center gap-2.5 cursor-pointer min-h-[1.5rem] group"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => corpToggle(setCorpFormats, label)}
                                  className="sr-only"
                                />
                                <div
                                  className="w-5 h-5 shrink-0 flex items-center justify-center transition-all"
                                  style={{
                                    border: checked ? "2px solid #EFCD62" : "1.5px solid rgba(255,255,255,0.45)",
                                    backgroundColor: checked ? "#EFCD62" : "transparent",
                                  }}
                                >
                                  {checked && (
                                    <Check className="w-3 h-3 text-black" strokeWidth={3.5} />
                                  )}
                                </div>
                                <span className={vd.formOptionLabel}>
                                  {label}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <p className={vd.formGroupLabel}>Services Required</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {[
                            "Décor & Event Setup",
                            "AV & Presentation Setup",
                            "Emcee / Host",
                            "Photography/Videography",
                            "Catering & F&B",
                            "Team-Building Activities",
                            "DJ & Entertainment",
                            "Not Sure Yet",
                          ].map((label) => {
                            const checked = corpServices.has(label);
                            return (
                              <label
                                key={label}
                                className="flex items-center gap-2.5 cursor-pointer min-h-[1.5rem] group"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => corpToggle(setCorpServices, label)}
                                  className="sr-only"
                                />
                                <div
                                  className="w-5 h-5 shrink-0 flex items-center justify-center transition-all"
                                  style={{
                                    border: checked ? "2px solid #EFCD62" : "1.5px solid rgba(255,255,255,0.45)",
                                    backgroundColor: checked ? "#EFCD62" : "transparent",
                                  }}
                                >
                                  {checked && (
                                    <Check className="w-3 h-3 text-black" strokeWidth={3.5} />
                                  )}
                                </div>
                                <span className={vd.formOptionLabel}>
                                  {label}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <p className={vd.formGroupLabel}>Preferred Setting</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {[
                            "Outdoor Lawn Setup",
                            "Poolside / Informal Setup",
                            "Indoor Conference Setup",
                            "Indoor & Outdoor",
                          ].map((label) => {
                            const checked = corpPref.has(label);
                            return (
                              <label
                                key={label}
                                className="flex items-center gap-2.5 cursor-pointer min-h-[1.5rem] group"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => corpToggle(setCorpPref, label)}
                                  className="sr-only"
                                />
                                <div
                                  className="w-5 h-5 shrink-0 flex items-center justify-center transition-all"
                                  style={{
                                    border: checked ? "2px solid #EFCD62" : "1.5px solid rgba(255,255,255,0.45)",
                                    backgroundColor: checked ? "#EFCD62" : "transparent",
                                  }}
                                >
                                  {checked && (
                                    <Check className="w-3 h-3 text-black" strokeWidth={3.5} />
                                  )}
                                </div>
                                <span className={vd.formOptionLabel}>
                                  {label}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <JadeFloatingTextarea
                        id="corp-notes"
                        label="Additional requests"
                        required={false}
                        value={corpNotes}
                        onChange={setCorpNotes}
                        theme="experienceCharcoal"
                      />

                      <VenueEnquiryLegalFootnote onClosePrivacyNav={onClose} />

                      <PrimaryButton type="submit" width="form" withArrow={false}>
                        SUBMIT ENQUIRE
                      </PrimaryButton>
                    </form>
                </div>
              </div>
            </section>
      </VillaExperienceOverlayBody>

      {view === "form" ? (
        <VillaExperienceBookingBottomBar
          villaId={v.id}
          onwardPrice={(overlayVilla as any)?.overlay?.onwardsPrice ?? null}
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

export default CorporateVenueOverlay;
