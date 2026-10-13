"use client";

import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import JadeImage from "@/components/ui/JadeImage";
import Link from "next/link";
import PrimaryButton from "@/components/PrimaryButton";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Bed,
  Users,
  Home,
  Trees,
  Projector,
  Maximize,
  Wifi,
  Car,
  Wind,
  Waves,
  Dribbble,
  Presentation,
  Download,
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
  Calendar,
  Info,
  HelpCircle,
  Facebook,
  Instagram,
  Youtube,
  LayoutGrid,
  Leaf,
  HandPlatter,
  Bell,
  Sparkles,
  ShieldCheck,
  Heart,
  Search,
  Settings,
  Coffee,
  Mic,
  Music,
  Headset,
} from "lucide-react"; // Import all potentially used icons
import CallToEnquireLink from "@/components/ui/CallToEnquireLink";
import { isVillaRecordBookable } from "@/lib/villaBooking";
import ScrollHideTopChrome from "@/components/ui/ScrollHideTopChrome";
import Footer from "@/components/Footer";
import DetailsDrawer from "@/components/DetailsDrawer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { VILLAS } from "@/lib/mockData";
import type { Villa } from "@/lib/types";
import { prettyMediaLabel } from "@/lib/mediaLabels";
import { DOME_VIDEO_URLS, getYouTubeId } from "@/lib/videoUtils";
import { getWalkthroughPosterForVilla } from "@/lib/walkthroughPosters";
import {
  DOME_COLOR_META,
  DOME_COLOR_ORDER,
  getDomeColorFromVillaId,
  isDomeEstateId,
} from "@/lib/domeVillaIds";
import { useAnimation } from "@/context/AnimationContext";
import { resolveVillaMedia } from "@/lib/villas/villaMediaResolution";
import { getVillaSocialProof } from "@/lib/villaSocialProof";
import { getVillaGoogleMapsUrl } from "@/lib/googleMapsLinks";
import VillaPricingBlocks, {
  buildDetailPagePricingBlocks,
} from "@/components/experience/VillaPricingBlocks";
import VillaDetailMeanderStrip from "@/components/villa/VillaDetailMeanderStrip";
import VillaDetailLocationBlock from "@/components/villa/VillaDetailLocationBlock";
import VillaDetailStickyTabs from "@/components/villa/VillaDetailStickyTabs";
import VillaDetailAmenityHighlights from "@/components/villa/VillaDetailAmenityHighlights";
import { amenityHighlightsFrom } from "@/lib/villaDetailData";
import { scrollToElement } from "@/lib/lenis";
import { VILLA_DETAIL_SCROLL_TO_DURATION } from "@/lib/lenisConfig";
import { isScrollSpyLocked, lockScrollSpy } from "@/lib/scrollSpyLock";
import VillaDetailIntroSection from "@/components/villa/VillaDetailIntroSection";
import VillaDetailFaqList from "@/components/villa/VillaDetailFaqList";
import { VILLA_DETAIL_PRICING_BOTTOM_BAR_CHROME_CLASS } from "@/lib/scrollChromeGlass";
import VillaDetailImageFrame from "@/components/villa/VillaDetailImageFrame";
import VillaDetailCarouselControls from "@/components/villa/VillaDetailCarouselControls";
import VillaDetailExperienceCarousel from "@/components/villa/VillaDetailExperienceCarousel";
import {
  VILLA_DETAIL_CHARCOAL,
  VILLA_DETAIL_SPACING,
} from "@/components/villa/villaDetailSpacing";
import clsx from "clsx";
import { EXPERIENCE_SECTION_CTA_CONTAINER_CLASS } from "@/lib/experienceSectionCta";
import { usePreloadNeighborImages } from "@/lib/carouselMotion";
import { villaListingPath } from "@/lib/appRoutes";
import { useSafeBack } from "@/lib/safeBackNavigation";
import { getVillaRetreatLogoSrc } from "@/lib/villaRetreatLogos";
import VillaRetreatHeroLogo from "@/components/villa/VillaRetreatHeroLogo";

const vd = VILLA_DETAIL_SPACING;

// Icon mapping helper
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

  // Semantic fallbacks based on name or title
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

const splitAmenityLabel = (label: string) => {
  const words = label.trim().split(/\s+/);
  if (words.length <= 1) return { line1: label, line2: "" };
  const mid = Math.ceil(words.length / 2);
  return {
    line1: words.slice(0, mid).join(" "),
    line2: words.slice(mid).join(" "),
  };
};

export default function VillaDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const staticVilla = VILLAS.find((v) => v.id === id) as Villa | undefined;
  const [liveVilla, setLiveVilla] = useState<Villa | null>(null);
  const [liveFetchDone, setLiveFetchDone] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLiveFetchDone(false);
    fetch(`/api/public/villas/${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { villa?: Villa } | null) => {
        if (!cancelled && data?.villa) setLiveVilla(data.villa);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLiveFetchDone(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const villa = useMemo(() => {
    if (liveVilla) return liveVilla;
    return staticVilla;
  }, [liveVilla, staticVilla]);
  const villaBookable = villa ? isVillaRecordBookable(villa) : false;
  const retreatLogoSrc = getVillaRetreatLogoSrc(id);
  const { setEnquireOverlayOpen, isEnquireOverlayOpen } = useAnimation();
  const goBack = useSafeBack(villaListingPath());

  const [media, setMedia] = useState<{
    hero: string[];
    spaces: string[];
    experiences: string[];
    categorizedSpaces: any[];
  } | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerData, setDrawerData] = useState({
    title: "",
    items: [] as any[],
  });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentSpaceIndex, setCurrentSpaceIndex] = useState(0);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("spaces");
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [activeDomeVideo, setActiveDomeVideo] = useState<
    "red" | "blue" | "yellow"
  >("blue");
  const [activeDomeSpaceTab, setActiveDomeSpaceTab] = useState<
    "blue" | "red" | "yellow"
  >("blue");
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const mapsHref = useMemo(
    () => getVillaGoogleMapsUrl(villa ?? {}),
    [villa],
  );

  const detailPricingBlocks = useMemo(
    () =>
      villa?.pricing
        ? buildDetailPagePricingBlocks(villa.pricing as any)
        : [],
    [villa?.pricing],
  );

  const villaFooterPriceDisplay = useMemo(() => {
    const p = villa?.pricing as Record<string, unknown> | undefined;
    const stayPkg = (p?.stay as { packages?: { price?: string }[] })?.packages?.[0]
      ?.price;
    const eventPkg = (p?.event as { packages?: { price?: string }[] })?.packages?.[0]
      ?.price;
    const raw = stayPkg || eventPkg;
    if (!raw) return null;
    return String(raw).replace(/\s*\+\s*taxes\s*/i, "").trim();
  }, [villa?.pricing]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const scrollFrameRef = useRef<number>();
  const isAutoScrolling = useRef(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/villas/${id}/media?v=2`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setMedia(data);
      } catch {
        // ignore
      }
    }
    if (id) load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const resolvedMedia = useMemo(() => {
    if (!villa) return null;
    return resolveVillaMedia(
      {
        id: villa.id,
        name: villa.name,
        image: villa.image,
        images: villa.images,
        spaces: villa.spaces,
        activities: villa.activities,
        categorizedSpaces: villa.categorizedSpaces,
        perfectForCards: villa.perfectForCards,
        portfolioSource: villa.portfolioSource,
      },
      villa.id,
    );
  }, [villa]);

  const heroImages =
    media?.hero?.length ? media.hero : resolvedMedia?.hero ?? [];
  const spaceImages =
    media?.spaces?.length ? media.spaces : resolvedMedia?.spaces ?? [];
  const experienceImages =
    media?.experiences?.length
      ? media.experiences
      : resolvedMedia?.experiences ?? [];

  const domeColor = villa ? getDomeColorFromVillaId(villa.id) : null;
  const isDomeEstate = villa ? isDomeEstateId(villa.id) : false;

  // Per-color pages: filter spaces to one dome. Estate page: optional tab filter.
  const domeSpaceFilter = useMemo(() => {
    if (domeColor) return DOME_COLOR_META[domeColor].pathNeedle;
    if (!isDomeEstate) return null;
    const label =
      activeDomeSpaceTab === "blue"
        ? "Blue"
        : activeDomeSpaceTab === "red"
          ? "Red"
          : "Yellow";
    return `/Villa_Retreats/Dome/Dome Villa_s - ${label}/`;
  }, [domeColor, isDomeEstate, activeDomeSpaceTab]);

  const derivedSpaces = useMemo(() => {
    let list = spaceImages.length
      ? spaceImages
      : (villa?.spaces || []).map((s) => s.image).filter(Boolean);
    if (!list.length && villa?.categorizedSpaces?.length) {
      list = villa.categorizedSpaces.flatMap((g) => g.images ?? []).filter(Boolean);
    }
    if (
      !list.length &&
      villa?.images?.length &&
      !resolvedMedia?.dashboardAuthored
    ) {
      list = villa.images.filter(Boolean);
    }
    if (domeSpaceFilter) {
      list = list.filter((img) => img && img.includes(domeSpaceFilter));
    }
    return list.map((img) => ({
      name: prettyMediaLabel({ url: img, fallback: "Space", kind: "space" }),
      image: img,
    }));
  }, [
    spaceImages,
    villa?.spaces,
    villa?.categorizedSpaces,
    villa?.images,
    domeSpaceFilter,
    resolvedMedia?.dashboardAuthored,
  ]);

  useEffect(() => {
    setCurrentSpaceIndex(0);
  }, [activeDomeSpaceTab]);

  useEffect(() => {
    setIsPlayingVideo(false);
  }, [activeDomeVideo]);

  const derivedActivities = useMemo(() => {
    const list = experienceImages.length
      ? experienceImages
      : (villa?.activities || []).map((a) => a.image);
    return list.map((img) => ({
      title: prettyMediaLabel({
        url: img,
        fallback: "Experience",
        kind: "experience",
      }),
      image: img,
    }));
  }, [experienceImages, villa?.activities]);

  // Filter out empty strings — "" is truthy in JS so we must check length
  const validImg = (s: string | undefined) => s && s.length > 0;
  const imagesList = (() => {
    const gallery = heroImages.filter(
      (img: string | undefined): img is string => validImg(img) === true,
    );
    if (gallery.length > 0) return gallery; // hero only, as requested
    if (validImg(villa?.image)) return [villa!.image];
    return [];
  })();

  const activeHeroSrc =
    imagesList.length > 0 && imagesList[currentImageIndex]
      ? imagesList[currentImageIndex]
      : "";

  usePreloadNeighborImages(imagesList, currentImageIndex);

  const spaceImageUrls = useMemo(
    () =>
      derivedSpaces
        .map((s) => s.image)
        .filter((img): img is string => validImg(img) === true),
    [derivedSpaces],
  );
  usePreloadNeighborImages(spaceImageUrls, currentSpaceIndex);

  const activityImageUrls = useMemo(
    () =>
      derivedActivities
        .map((a) => a.image)
        .filter((img): img is string => validImg(img) === true),
    [derivedActivities],
  );
  usePreloadNeighborImages(activityImageUrls, currentActivityIndex);

  const handlePrevImage = () => {
    if (imagesList.length <= 1) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? imagesList.length - 1 : prev - 1,
    );
  };

  const handleNextImage = () => {
    if (imagesList.length <= 1) return;
    setCurrentImageIndex((prev) => (prev + 1) % imagesList.length);
  };

  const handlePrevSpace = () => {
    if (derivedSpaces && derivedSpaces.length > 0) {
      setCurrentSpaceIndex((prev) =>
        prev === 0 ? derivedSpaces.length - 1 : prev - 1,
      );
    }
  };

  const handleNextSpace = () => {
    if (derivedSpaces && derivedSpaces.length > 0) {
      setCurrentSpaceIndex((prev) => (prev + 1) % derivedSpaces.length);
    }
  };

  const handlePrevActivity = () => {
    if (derivedActivities && derivedActivities.length > 0) {
      setCurrentActivityIndex((prev) =>
        prev === 0 ? derivedActivities.length - 1 : prev - 1,
      );
    }
  };

  const handleNextActivity = () => {
    if (derivedActivities && derivedActivities.length > 0) {
      setCurrentActivityIndex((prev) => (prev + 1) % derivedActivities.length);
    }
  };

  const currentSpace =
    derivedSpaces && derivedSpaces.length > 0
      ? derivedSpaces[currentSpaceIndex % derivedSpaces.length]
      : null;

  const currentActivity =
    derivedActivities && derivedActivities.length > 0
      ? derivedActivities[currentActivityIndex % derivedActivities.length]
      : null;

  const openDrawer = (title: string, items: any[]) => {
    setDrawerData({ title, items });
    setIsDrawerOpen(true);
  };

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (!element) return;

    lockScrollSpy(VILLA_DETAIL_SCROLL_TO_DURATION * 1000 + 80);
    scrollToElement(element, {
      offset: -96,
      duration: VILLA_DETAIL_SCROLL_TO_DURATION,
    });
  };

  // Scroll-Spy Effect for Navigation Tabs
  const visibleSections = useRef<Set<string>>(new Set());

  useEffect(() => {
    const sectionIds = [
      "spaces",
      "experiences",
      "details",
      "video-walkthrough",
      "services",
      "amenities",
      "pricing",
      "location",
      "perfect-for",
      "faq",
    ];

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -35% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      if (isScrollSpyLocked()) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visibleSections.current.add(entry.target.id);
        } else {
          visibleSections.current.delete(entry.target.id);
        }
      });

      // Pick the topmost visible section (earliest in DOM order)
      for (const id of sectionIds) {
        if (visibleSections.current.has(id)) {
          setActiveTab(id);
          break;
        }
      }
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions,
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Only start auto-scroll if the URL parameter is present
    const shouldAutoScroll = searchParams?.get("autoScroll") === "true";

    if (shouldAutoScroll) {
      isAutoScrolling.current = true;
      let lastTime = performance.now();
      const scrollSpeed = 0.5; // pixels per millisecond (adjust for speed)

      const autoScroll = (currentTime: number) => {
        if (!isAutoScrolling.current) return;

        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        // Scroll down slightly
        window.scrollBy({ top: scrollSpeed, left: 0, behavior: "auto" });

        // Continue the animation frame
        scrollFrameRef.current = requestAnimationFrame(autoScroll);
      };

      // Start the animation immediately (optionally add a small delay if needed)
      setTimeout(() => {
        lastTime = performance.now();
        scrollFrameRef.current = requestAnimationFrame(autoScroll);
      }, 500); // 500ms delay to let the page load visually first
    }

    // Stop scrolling on any user interaction
    const stopScroll = () => {
      if (isAutoScrolling.current) {
        isAutoScrolling.current = false;
        if (scrollFrameRef.current) {
          cancelAnimationFrame(scrollFrameRef.current);
        }
      }
    };

    // Attach interaction listeners
    window.addEventListener("wheel", stopScroll);
    window.addEventListener("touchstart", stopScroll);
    window.addEventListener("mousedown", stopScroll);
    window.addEventListener("keydown", stopScroll);

    return () => {
      stopScroll();
      window.removeEventListener("wheel", stopScroll);
      window.removeEventListener("touchstart", stopScroll);
      window.removeEventListener("mousedown", stopScroll);
      window.removeEventListener("keydown", stopScroll);
    };
  }, [searchParams]);

  const domeVideoUrls = DOME_VIDEO_URLS;

  if (!villa && !liveFetchDone) {
    return (
      <div className="min-h-screen bg-[#0B2C23] flex items-center justify-center text-white font-manrope text-sm">
        Loading villa…
      </div>
    );
  }

  if (!villa) {
    return (
      <div className="min-h-screen bg-[#0B2C23] flex items-center justify-center text-white font-philosopher text-2xl">
        Villa Not Found
      </div>
    );
  }

  return (
    <main className="bg-jade-charcoal min-h-screen relative">
      <ScrollHideTopChrome
        shellVariant="transparent"
        className={clsx(vd.actionHeaderRow, vd.gutterX)}
      >
        <button
          type="button"
          onClick={goBack}
          className={clsx(
            vd.actionHeaderControl,
            "flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-white/10 transition-all",
          )}
          aria-label="Go back"
        >
          <ArrowLeft className={vd.actionHeaderIcon} strokeWidth={1.5} />
        </button>
        <div className="flex items-center gap-2 md:gap-2.5">
          {/* Mobile: Dialer */}
          <CallToEnquireLink
            ariaLabel="Call support"
            className={clsx(
              "md:hidden flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-white/10 transition-all",
              vd.actionHeaderControl,
            )}
          />
          {/* Desktop: Contact Page */}
          <Link
            href="/contact"
            className={clsx(
              "hidden md:flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-white/10 transition-all",
              vd.actionHeaderControl,
            )}
            aria-label="Contact support"
          >
            <Headset className={vd.actionHeaderIcon} strokeWidth={1.5} />
          </Link>
          <button
            type="button"
            onClick={() => setEnquireOverlayOpen(true)}
            className={clsx(
              vd.actionHeaderEnquire,
              "bg-black/40 backdrop-blur-md border border-white/20 text-white text-[9px] md:text-[10px] font-bold tracking-[0.35em] uppercase hover:bg-white hover:text-black transition-all",
            )}
          >
            ENQUIRE NOW
          </button>
        </div>
      </ScrollHideTopChrome>
      {/* HERO / CAROUSEL SECTION */}
      <section className="relative h-[60vh] md:h-[80vh] w-full bg-jade-green">
        {/* Image (Interactive Carousel) */}
        <div className="absolute inset-0">
          {activeHeroSrc && (
            <JadeImage
              src={activeHeroSrc}
              alt={villa.name}
              fill
              className="object-cover object-center"
              priority
              sizes="100vw"
            />
          )}
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
        </div>

        {/* Carousel Controls */}
        {/* Hero Overlays */}
        <div className="absolute inset-0 z-20 pointer-events-none flex justify-center">
          <div className="max-w-7xl mx-auto h-full relative w-full">
            {/* Bottom Controls */}
            <div
              className={clsx(
                "absolute inset-x-0 pointer-events-none",
                vd.heroBottom,
              )}
            >
              <button
                type="button"
                onClick={handlePrevImage}
                className={clsx(
                  "pointer-events-auto absolute bottom-0 z-10 w-11 h-11 md:w-16 md:h-16 flex items-center justify-center bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white hover:text-black transition-all rounded-none",
                  vd.heroArrowLeft,
                )}
                aria-label="Previous photo"
              >
                <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              <div className="pointer-events-auto absolute left-1/2 bottom-0 z-10 flex w-[min(100%,calc(100vw-8.5rem))] sm:w-[min(100%,calc(100vw-10rem))] -translate-x-1/2 flex-col items-center gap-3 md:gap-4 md:max-w-3xl px-4 sm:px-6">
                <div className="flex w-full flex-col items-center gap-2">
                  <div className="w-16 md:w-28 h-px bg-gradient-to-r from-transparent via-[#EFCD62] to-transparent opacity-90" />
                  {retreatLogoSrc ? (
                    <VillaRetreatHeroLogo
                      src={retreatLogoSrc}
                      alt={`${villa.name} logo`}
                    />
                  ) : (
                    <h2 className="text-[#EFCD62] font-philosopher text-xl sm:text-2xl md:text-4xl uppercase tracking-[0.28em] md:tracking-[0.35em] text-center drop-shadow-lg leading-tight px-1">
                      {villa.name}
                    </h2>
                  )}
                  <div className="w-16 md:w-28 h-px bg-gradient-to-r from-transparent via-[#EFCD62] to-transparent opacity-90" />
                </div>
                <Link
                  href={`/retreat/${id}/spaces/`}
                  className={clsx(
                    vd.heroGalleryCta,
                    "border border-white/30 bg-black/40 backdrop-blur-md text-white text-[9px] md:text-[11px] font-bold tracking-[0.18em] md:tracking-[0.25em] uppercase hover:bg-white hover:text-black transition-all",
                  )}
                >
                  <LayoutGrid className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" strokeWidth={1.5} />
                  VIEW ALL PICTURES
                </Link>
              </div>

              <button
                type="button"
                onClick={handleNextImage}
                className={clsx(
                  "pointer-events-auto absolute bottom-0 z-10 w-11 h-11 md:w-16 md:h-16 flex items-center justify-center bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white hover:text-black transition-all rounded-none",
                  vd.heroArrowRight,
                )}
                aria-label="Next photo"
              >
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* CONTENT SECTION */}
      <div className="relative bg-jade-charcoal w-full z-10">
        <section id="overview" className={VILLA_DETAIL_CHARCOAL}>
        <div className={vd.sectionShell}>
        <VillaDetailIntroSection
          eyebrow={villa.type}
          title={villa.name}
          mapsHref={mapsHref}
          locationLabel={villa.location}
          eyebrowPrefix={
            domeColor ? (
              <Link
                href="/retreat/dome-villas/"
                className="text-[#EFCD62]/90 text-[10px] md:text-gh-label font-bold tracking-[0.2em] uppercase hover:text-[#EFCD62] inline-flex items-center gap-1.5 w-fit"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Dome Villas Estate
              </Link>
            ) : undefined
          }
          statsRow={
            <div className={vd.introStatsRow}>
              <div className="flex items-center gap-2.5 whitespace-nowrap flex-shrink-0">
                <Bed
                  className="w-4 h-4 md:w-5 md:h-5 text-[#EFCD62]"
                  strokeWidth={1.5}
                />
                <span>
                  {villa.stats.stay.toLowerCase().includes("stay")
                    ? villa.stats.stay
                    : `${villa.stats.stay} Stay`}
                </span>
              </div>
              <div className="w-[4px] h-[4px] rounded-full bg-white/30 flex-shrink-0" />
              <div className="flex items-center gap-2.5 whitespace-nowrap flex-shrink-0">
                <Users
                  className="w-4 h-4 md:w-5 md:h-5 text-[#EFCD62]"
                  strokeWidth={1.5}
                />
                <span>
                  {villa.stats.events.toLowerCase().includes("event")
                    ? villa.stats.events
                    : `${villa.stats.events} Event`}
                </span>
              </div>
              <div className="w-[4px] h-[4px] rounded-full bg-white/30 flex-shrink-0" />
              <div className="flex items-center gap-2.5 whitespace-nowrap flex-shrink-0">
                <Home
                  className="w-4 h-4 md:w-5 md:h-5 text-[#EFCD62]"
                  strokeWidth={1.5}
                />
                <span>{villa.stats.bhk}</span>
              </div>
            </div>
          }
          amenityHighlights={
            <VillaDetailAmenityHighlights
              highlights={
                villa.amenityHighlights?.length
                  ? villa.amenityHighlights
                  : amenityHighlightsFrom(villa.amenities ?? [])
              }
            />
          }
        >
        {getVillaSocialProof(villa) ? (
          <p className="mb-4 font-manrope text-sm tracking-wide text-[#EFCD62]/90">
            {getVillaSocialProof(villa)}
          </p>
        ) : null}
        <p className={vd.introDescription}>{villa.description}</p>

        {villa.perfectForTags.length > 0 && (
          <div className={vd.stackSm}>
            <h4 className="text-white font-manrope font-medium text-gh-body">
              Perfect for:
            </h4>
            <div className="flex flex-wrap gap-2">
              {villa.perfectForTags.map((label, idx) => (
                <span
                  key={`${label}-${idx}`}
                  className="px-4 py-2 bg-white/5 border border-white/15 text-white/90 text-[11px] md:text-gh-label font-manrope"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {isDomeEstate ? (
          <div className={vd.stackSm}>
            <span className={clsx(vd.eyebrow, "block")}>
              Explore Each Dome
            </span>
            <div className={clsx(vd.hScrollBleed, vd.hScrollTrack)}>
              {[
                {
                  name: "Blue Dome",
                  image: "/Villa_Retreats/Dome/Dome Villa_s - Blue/Spaces/Glamping_Experince.webp",
                  brochure: "/All Properties - Jade Hospitainment.pdf",
                },
                {
                  name: "Red Dome",
                  image: "/Villa_Retreats/Dome/Dome Villa_s - Red/Spaces/Bath_Tub.webp",
                  brochure: "/All Properties - Jade Hospitainment.pdf",
                },
                {
                  name: "Yellow Dome",
                  image: "/Villa_Retreats/Dome/Dome Villa_s - Yellow/Spaces/Greek_Style_Bath.webp",
                  brochure: "/All Properties - Jade Hospitainment.pdf",
                },
              ].map((dome, idx) => (
                <Link
                  key={idx}
                  href={`/retreat/${DOME_COLOR_META[DOME_COLOR_ORDER[idx]].id}/`}
                  className="relative flex-shrink-0 w-[240px] h-[240px] md:w-[280px] md:h-[280px] snap-start group overflow-hidden rounded-sm border border-white/10"
                >
                  {/* Background Image with Hover Zoom */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out scale-100 group-hover:scale-110"
                    style={{ backgroundImage: `url('${dome.image}')` }}
                  />
                  {/* Dark Elegant Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/25 group-hover:via-black/50 group-hover:from-black/90 transition-all duration-300" />
                  
                  {/* Content Centered */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
                    <h3 className="font-philosopher text-[24px] md:text-[28px] text-white leading-tight mb-2 select-none">
                      {dome.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-white/95 text-[10px] font-bold tracking-[0.2em] font-manrope uppercase mt-1 group-hover:text-[#EFCD62] transition-colors duration-300">
                      <span>View Villa</span>
                      <ArrowRight className="w-3.5 h-3.5 text-white/60 group-hover:text-[#EFCD62] transition-colors duration-300" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <a
              href="/All Properties - Jade Hospitainment.pdf"
              download
              className="w-full bg-white/5 border border-white/10 text-white px-8 py-4 uppercase tracking-[0.2em] text-[11px] font-bold hover:bg-white hover:text-black transition-all flex items-center justify-between group rounded-sm"
            >
              <span>Download Estate Brochure</span>
              <Download className="w-4 h-4 text-white/40 group-hover:text-black transition-colors" />
            </a>
          </div>
        ) : (
          <a
            href={
              villa.brochureUrl ?? "/All Properties - Jade Hospitainment.pdf"
            }
            download={
              villa.brochureFilename ||
              (villa.brochureUrl ? undefined : "Jade-Hospitainment-Brochure.pdf")
            }
            className="w-full bg-white/5 border border-white/10 text-white px-8 py-4 uppercase tracking-[0.2em] text-[11px] font-bold hover:bg-white hover:text-black transition-all flex items-center justify-between group rounded-sm"
          >
            <span>
              {villa.brochureFilename
                ? `Download ${villa.brochureFilename.replace(/\.[^.]+$/, "")}`
                : "Download Brochure"}
            </span>
            <Download className="w-4 h-4 text-white/40 group-hover:text-black transition-colors" />
          </a>
        )}
        </VillaDetailIntroSection>
        </div>
        </section>
      </div>
      <VillaDetailStickyTabs activeTab={activeTab} onTabClick={scrollToSection} />

      {/* SPACES — Green */}
      {(domeColor ||
        isDomeEstate ||
        derivedSpaces.length > 0 ||
        (villa?.categorizedSpaces?.length ?? 0) > 0) && (
        <section id="spaces" className={VILLA_DETAIL_CHARCOAL}>
          <div className={vd.sectionShell}>
            <div className={clsx(vd.content, vd.mediaSectionStack)}>
              <div className="flex flex-wrap items-center gap-3 md:gap-5">
                <h3 className={vd.heading}>Spaces</h3>
                {isDomeEstate && (
                  <div className="flex flex-wrap items-center gap-2">
                    {([ { id: "blue", label: "Blue Dome", dot: "#3b82f6" }, { id: "red", label: "Red Dome", dot: "#ef4444" }, { id: "yellow", label: "Yellow Dome", dot: "#eab308" } ] as const).map((t) => {
                      const isActive = activeDomeSpaceTab === t.id;
                      return (
                        <button key={t.id} type="button" onClick={() => setActiveDomeSpaceTab(t.id)}
                          className={`flex items-center gap-2 px-3 md:px-4 py-2 text-[10px] md:text-[11px] uppercase tracking-[0.25em] font-bold border transition-colors ${isActive ? "bg-[#EFCD62] text-black border-[#EFCD62]" : "bg-white/5 text-white/70 border-white/10 hover:text-white hover:bg-white/10"}`}>
                          <span className="inline-block w-2.5 h-2.5 rounded-full border border-white/30" style={{ backgroundColor: t.dot }} />
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              {currentSpace ? (
                <VillaDetailImageFrame
                  imageKey={`${currentSpaceIndex}-${validImg(currentSpace.image) ? currentSpace.image : villa.image}`}
                  src={validImg(currentSpace.image) ? currentSpace.image : villa.image}
                  alt={currentSpace.name || "Space"}
                  onPrev={handlePrevSpace}
                  onNext={handleNextSpace}
                  slideCount={derivedSpaces?.length ?? 0}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-jade-charcoal/80 via-transparent to-transparent opacity-90 z-[5] pointer-events-none" />
                  <VillaDetailCarouselControls
                    label={currentSpace.name || "Lawn"}
                    slideCount={derivedSpaces?.length ?? 0}
                    onPrev={handlePrevSpace}
                    onNext={handleNextSpace}
                  />
                </VillaDetailImageFrame>
              ) : (
                <div className={clsx(vd.mediaStageFrame, "relative w-full rounded-none overflow-hidden bg-emerald-900/20 flex items-center justify-center text-white/40 italic")}>Loading spaces…</div>
              )}
              <div className={EXPERIENCE_SECTION_CTA_CONTAINER_CLASS}>
                <PrimaryButton
                  href={`/retreat/${id}/spaces/`}
                  width="section"
                  withArrow={false}
                  className="!bg-white/5 !ring-0 border border-white/20 !text-white hover:!bg-white hover:!text-black"
                >
                  <LayoutGrid className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                  VIEW ALL SPACES
                </PrimaryButton>
              </div>
            </div>
          </div>
        </section>
      )}

      {currentActivity ? (
        <section id="experiences" className={VILLA_DETAIL_CHARCOAL}>
        <div className={vd.sectionShell}>
          <div className={clsx(vd.content, vd.stack)}>
            <VillaDetailExperienceCarousel
              activity={currentActivity}
              slideCount={derivedActivities?.length ?? 0}
              activityIndex={currentActivityIndex}
              fallbackImage={villa.image}
              onPrev={handlePrevActivity}
              onNext={handleNextActivity}
              onEnquire={() => setEnquireOverlayOpen(true)}
              isValidImage={(url) => Boolean(validImg(url))}
            />
          </div>
        </div>
        </section>
      ) : null}

      {/* PROPERTY DETAILS — Green */}
      <section id="details" className={VILLA_DETAIL_CHARCOAL}>
        <div className={vd.sectionShell}>
          <div className={clsx(vd.content, vd.stack)}>
            <h3 className={vd.heading}>Property Details</h3>
            <div className="flex flex-col gap-8">
              {villa.propertyDetails?.slice(0, 4).map((detail, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="mt-2 w-1.5 h-1.5 rotate-45 bg-[#EFCD62] flex-shrink-0" />
                  <div>
                    <h4 className="text-gh-body text-white font-manrope font-semibold mb-2">{(detail as any).label || (detail as any).title}</h4>
                    <p className="text-white/60 text-gh-body leading-relaxed">{detail.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-4">
              <button onClick={() => openDrawer("Property Details", villa.propertyDetails || [])} className="flex items-center gap-2 text-[#EFCD62] text-gh-label font-bold tracking-widest uppercase hover:text-white transition-colors">
                SEE MORE <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* VIDEO WALKTHROUGH — Charcoal */}
      {villa.video && (
        <section id="video-walkthrough" className={VILLA_DETAIL_CHARCOAL}>
          <div className={vd.sectionShell}>
            <div className={clsx(vd.content, vd.stack)}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h3 className={vd.heading}>Video Walkthrough</h3>
                {isDomeEstate && (
                  <div className="flex items-center gap-2">
                    {([ { id: "blue", label: "Blue Dome", dot: "#3b82f6" }, { id: "red", label: "Red Dome", dot: "#ef4444" }, { id: "yellow", label: "Yellow Dome", dot: "#eab308" } ] as const).map((t) => {
                      const isActive = activeDomeVideo === t.id;
                      return (
                        <button key={t.id} onClick={() => setActiveDomeVideo(t.id)} className={`flex items-center gap-2 px-4 py-2 text-[10px] md:text-[11px] uppercase tracking-[0.25em] font-bold border transition-colors ${isActive ? "bg-[#EFCD62] text-black border-[#EFCD62]" : "bg-white/5 text-white/70 border-white/10 hover:text-white hover:bg-white/10"}`}>
                          <span className="inline-block w-2.5 h-2.5 rounded-full border border-white/30" style={{ backgroundColor: t.dot }} />
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              {(() => {
                const chosenUrl = domeColor
                  ? DOME_VIDEO_URLS[domeColor]
                  : isDomeEstate
                    ? domeVideoUrls[activeDomeVideo]
                    : typeof villa.video === "object"
                      ? villa.video.youtubeUrl
                      : "";
                const ytId = chosenUrl ? getYouTubeId(chosenUrl) : "";
                const walkthroughPoster = getWalkthroughPosterForVilla(
                  villa.id,
                  isDomeEstate ? activeDomeVideo : domeColor ?? undefined,
                );
                if (!ytId) return null;
                if (isPlayingVideo) {
                  return (
                    <div className={clsx(vd.mediaStageFrame, "relative w-full bg-gray-900 overflow-hidden border border-white/10")}>
                      <iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1`} title={`${villa.name} Walkthrough`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 w-full h-full" />
                    </div>
                  );
                }
                return (
                  <div className={clsx(vd.mediaStageFrame, "relative w-full bg-gray-900 overflow-hidden group border border-white/10 cursor-pointer")} onClick={() => setIsPlayingVideo(true)}>
                    {walkthroughPoster ? (
                      <Image src={walkthroughPoster} alt={`${villa.name} Video Walkthrough`} fill className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 100vw, 800px" priority={false} />
                    ) : null}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center hover:bg-white/30 transition-all group shadow-2xl">
                        <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1" />
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
          <VillaDetailMeanderStrip />
        </section>
      )}

      {/* SERVICES — Charcoal */}
      <section id="services" className={VILLA_DETAIL_CHARCOAL}>
        <div className={vd.sectionShell}>
          <div className={clsx(vd.content, vd.stack)}>
            <h3 className={vd.subheading}>Services</h3>
            {villa.services?.slice(0, 4).map((service, idx) => {
                const Icon = getIcon(service.icon, service.title);
                return (
                  <div key={idx} className="flex gap-4 md:gap-6 group">
                    <div className="w-12 h-12 md:w-16 md:h-16 flex-shrink-0 border border-[#EFCD62] flex items-center justify-center p-2.5 md:p-3">
                      <Icon strokeWidth={1} className="w-full h-full text-[#EFCD62]" />
                    </div>
                    <div>
                      <h4 className="text-gh-sl font-semibold font-manrope text-white mb-1">{service.title}</h4>
                      <p className="text-white/80 text-gh-body mb-2 leading-relaxed">{service.description}</p>
                      {service.footer ? (
                        <p className="text-white/45 text-[12px] md:text-[13px] font-manrope leading-relaxed">{service.footer}</p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            <button onClick={() => openDrawer("Services", villa.services || [])} className="flex items-center gap-2 text-[#EFCD62] text-gh-label font-bold tracking-widest uppercase hover:text-white transition-colors">
              SEE MORE <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </section>

      {/* AMENITIES — Charcoal */}
      <section id="amenities" className={VILLA_DETAIL_CHARCOAL}>
        <div className={vd.sectionShell}>
          <div className={clsx(vd.content, vd.stack)}>
            <h3 className={vd.heading}>Amenities</h3>
            <div className={vd.amenitiesGrid}>
              {villa.amenities?.map((amenity, idx) => {
                const Icon = getIcon(amenity.icon);
                const { line1, line2 } = splitAmenityLabel(amenity.label);
                return (
                  <div
                    key={idx}
                    className={clsx(
                      "flex items-start gap-3",
                      idx >= 8 && "hidden lg:flex",
                    )}
                  >
                    <div className="w-10 h-10 shrink-0 border border-[#EFCD62]/70 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#EFCD62]" strokeWidth={1} />
                    </div>
                    <div className="text-white font-manrope text-sm leading-snug pt-1">
                      <span className="block">{line1}</span>
                      {line2 ? <span className="block">{line2}</span> : null}
                    </div>
                  </div>
                );
              })}
            </div>
            {(villa.amenities?.length ?? 0) > 8 ? (
              <button
                type="button"
                onClick={() => openDrawer("Amenities", villa.amenities || [])}
                className="flex items-center gap-2 text-[#EFCD62] text-gh-label font-bold tracking-widest uppercase hover:text-white transition-colors lg:hidden"
              >
                SEE MORE <ArrowRight className="w-3 h-3" />
              </button>
            ) : null}
          </div>
        </div>
        <VillaDetailMeanderStrip accentLine="green" />
      </section>

      {/* PRICING — Green */}
      {detailPricingBlocks.length > 0 && (
        <section id="pricing" className="w-full bg-jade-green text-white">
          <div className={vd.sectionShell}>
            <div className={clsx(vd.content, vd.stack)}>
              <VillaPricingBlocks
                variant="villa-detail"
                sectionTitle="Pricing"
                blocks={detailPricingBlocks}
                footnote={
                  <p className={vd.pricingFootnote}>
                    Note: Prices are base rates and may vary based on season, day of week, and specific requirements. Additional charges may apply for decorations, catering, and extended hours.
                  </p>
                }
              />
            </div>
          </div>
        </section>
      )}

      {/* LOCATION — Charcoal */}
      {villa.locationDetails && (
        <section id="location" className={VILLA_DETAIL_CHARCOAL}>
          <VillaDetailMeanderStrip />
          <div className={vd.sectionShell}>
            <div className={clsx(vd.content, vd.stack)}>
              <h3 className={vd.heading}>Location</h3>
              <VillaDetailLocationBlock
                mapsHref={mapsHref}
                locationDetails={villa.locationDetails}
                fallbackMapImage={villa.image}
              />
            </div>
          </div>
        </section>
      )}

      {/* PERFECT FOR — Charcoal */}
      {villa.perfectForCards.length > 0 && (
        <section id="perfect-for" className={VILLA_DETAIL_CHARCOAL}>
          <div className={vd.sectionShell}>
            <div className={clsx(vd.content, vd.mediaSectionStack)}>
              <h3 className={vd.heading}>Perfect for</h3>
              <div className="grid grid-cols-2 gap-3 md:gap-4 lg:gap-5">
                {villa.perfectForCards.map((item, idx) => (
                    <div key={`${item.title}-${idx}`} className={vd.perfectForCard}>
                      {item.image && (
                        <JadeImage
                          src={item.image}
                          alt={item.title ?? "Occasion"}
                          fill
                          className="object-cover transition-transform duration-700 hover:scale-105"
                          sizes="(max-width: 768px) 50vw, 25vw"
                          loading="lazy"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/45 z-10" />
                      <div className="absolute inset-0 flex items-center justify-center z-20 p-3">
                        <h4 className="text-white font-philosopher text-base md:text-lg text-center leading-tight">
                          {item.title}
                        </h4>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ — Charcoal */}
      <section id="faq" className={VILLA_DETAIL_CHARCOAL}>
        <div className={vd.sectionShell}>
          <div className={clsx(vd.content, vd.stack)}>
            <h3 className={vd.heading}>FAQ</h3>
            {villa.faq?.length ? (
              <VillaDetailFaqList
                items={villa.faq.map((item) => ({
                  question: item.question,
                  answer: item.answer,
                }))}
              />
            ) : null}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer stickyBottomBar />
      {!isEnquireOverlayOpen ? (
      <div
        className={clsx(
          "jade-scroll-chrome fixed bottom-0 left-0 w-full z-50 transition-all flex justify-center",
          VILLA_DETAIL_PRICING_BOTTOM_BAR_CHROME_CLASS,
          "pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-4",
        )}
      >
        <div className={clsx(vd.contentInsetShell, "flex justify-between items-center gap-4")}>
          <div className="flex flex-col font-manrope leading-tight">
            <span className={vd.pricingBarLabel}>Starting from</span>
            <span className={vd.pricingBarPrice}>{villaFooterPriceDisplay ?? "Contact for pricing"}</span>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <button onClick={() => setEnquireOverlayOpen(true)} className="text-[#EFCD62] text-gh-label font-bold tracking-[0.2em] uppercase hover:text-white transition-colors whitespace-nowrap">ENQUIRE</button>
            {villaBookable ? (
              <PrimaryButton
                href={`/book?villa=${villa.id}`}
                withArrow={false}
                width="compact"
                className="!px-6 md:!px-10 whitespace-nowrap"
              >
                BOOK VILLA
              </PrimaryButton>
            ) : null}
          </div>
        </div>
      </div>
      ) : null}
      <DetailsDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title={drawerData.title} items={drawerData.items} />
    </main>
  );
}
