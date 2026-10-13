"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Headset } from "lucide-react";
import CallToEnquireLink from "@/components/ui/CallToEnquireLink";
import ScrollHideTopChrome from "@/components/ui/ScrollHideTopChrome";
import {
  STICKY_BELOW_VILLA_ACTION_FULL_CLASS,
  VILLA_ACTION_CHROME_PAD_TOP_CLASS,
} from "@/lib/scrollChromeLayout";
import { useEffect, useMemo, useState } from "react";
import { VILLAS } from "@/lib/mockData";
import { Villa, VillaSpaceGroup } from "@/lib/types";
import {
  DOME_VIDEO_URLS,
  type DomeVideoKey,
  getYouTubeId,
} from "@/lib/videoUtils";
import {
  getDomeColorFromVillaId,
  isDomeEstateId,
} from "@/lib/domeVillaIds";
import CategoryTabRail from "@/components/ui/CategoryTabRail";
import { stickyCategoryTabClass } from "@/lib/stickyTabGlass";
import { VILLA_DETAIL_STICKY_TABS_CHROME_CLASS } from "@/lib/scrollChromeGlass";
import { VILLA_DETAIL_SPACING } from "@/components/villa/villaDetailSpacing";
import SpacesImageSection from "@/components/villa/SpacesImageSection";
import clsx from "clsx";
import { villaDetailPath } from "@/lib/appRoutes";
import { useSafeBack } from "@/lib/safeBackNavigation";
import { spaceMatchesCategory } from "@/lib/villaCategoryMatch";

const vd = VILLA_DETAIL_SPACING;

const HEADER_ACTION_CLASS =
  "flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-white/10 transition-all shrink-0";

export default function VillaSpacesPage() {
  const params = useParams();
  const id = params?.id as string;
  const goBack = useSafeBack(villaDetailPath(id));
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

  const villa = liveVilla ?? staticVilla;

  const domeColor = getDomeColorFromVillaId(id);
  const isDomeEstate = isDomeEstateId(id);

  const [activeCategory, setActiveCategory] = useState(
    isDomeEstate ? "Blue Dome" : "All",
  );
  const [activeDomeVideo, setActiveDomeVideo] = useState<DomeVideoKey>("blue");
  const [overrideSpaces, setOverrideSpaces] = useState<
    VillaSpaceGroup[] | null
  >(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/villas/${id}/media?v=2`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data?.categorizedSpaces)) {
          setOverrideSpaces(data.categorizedSpaces);
        }
      } catch {
        // ignore
      }
    }
    if (id) load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const categories = useMemo(() => {
    const base = overrideSpaces || villa?.categorizedSpaces || [];
    const cats = Array.from(
      new Set(base.map((s: VillaSpaceGroup) => s.category)),
    ).filter((c) => typeof c === "string" && c.length > 0) as string[];
    if (isDomeEstate) return [...cats, "Video"];
    return ["All", ...cats, "Video"];
  }, [overrideSpaces, villa?.categorizedSpaces, isDomeEstate]);

  const filteredSpaces = useMemo(() => {
    const base = overrideSpaces || villa?.categorizedSpaces;
    if (!base) return [];
    if (activeCategory === "All") return base;
    if (activeCategory === "Video") return [];
    return base.filter((s: VillaSpaceGroup) =>
      spaceMatchesCategory(s.category, activeCategory),
    );
  }, [villa, activeCategory, overrideSpaces]);

  if (!villa && !liveFetchDone) {
    return (
      <div className="min-h-screen bg-[#1A1C1E] flex items-center justify-center text-white font-manrope text-sm">
        Loading spaces…
      </div>
    );
  }

  if (!villa) {
    return (
      <div className="min-h-screen bg-[#1A1C1E] flex items-center justify-center text-white font-philosopher text-2xl">
        Villa Not Found
      </div>
    );
  }

  return (
    <main
      className={clsx(
        "bg-[#1A1C1E] min-h-screen",
        VILLA_ACTION_CHROME_PAD_TOP_CLASS,
      )}
    >
      <ScrollHideTopChrome zIndex="z-50">
        <header
          className={clsx(
            "w-full pt-4 pb-4 sm:pt-6 flex items-center justify-between border-b border-white/5",
            vd.gutterX,
          )}
        >
          <div className="flex items-center gap-4 min-w-0">
            <button
              type="button"
              onClick={goBack}
              className="w-11 h-11 md:w-12 md:h-12 flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-white/10 transition-all shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
            </button>
            <h1 className="text-white font-philosopher text-xl md:text-2xl capitalize truncate">
              {villa.name}
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <CallToEnquireLink
              ariaLabel="Call to enquire"
              className={clsx(
                HEADER_ACTION_CLASS,
                "lg:hidden w-11 h-11 md:w-12 md:h-12",
              )}
            />
            <Link
              href="/contact"
              className={clsx(
                HEADER_ACTION_CLASS,
                "hidden lg:flex w-12 h-12",
              )}
              aria-label="Contact us"
              title="Contact"
            >
              <Headset className="w-5 h-5" strokeWidth={1.5} />
            </Link>
          </div>
        </header>
      </ScrollHideTopChrome>

      <nav
        className={clsx(
          "jade-hscroll-chrome sticky z-40 min-w-0 w-full bg-[#1A1C1E]",
          STICKY_BELOW_VILLA_ACTION_FULL_CLASS,
        )}
      >
        <div className={clsx("w-full", VILLA_DETAIL_STICKY_TABS_CHROME_CLASS)}>
          <CategoryTabRail
            viewportEdgeAll
            fadeFrom="#1A1C1E"
            patternFade
            cursorGrab
            trackPreset="spaces"
            trackAriaLabel="Space categories"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                data-tab-key={cat}
                onClick={() => setActiveCategory(cat)}
                className={clsx(
                  stickyCategoryTabClass(activeCategory === cat),
                  "flex-shrink-0",
                )}
              >
                {cat}
              </button>
            ))}
          </CategoryTabRail>
        </div>
      </nav>

      <div className={clsx("flex flex-col gap-8", vd.sectionY)}>
        {activeCategory === "Video" ? (
          <section
            className={clsx(
              "flex flex-col gap-8 max-w-7xl mx-auto w-full",
              vd.gutterX,
            )}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-white font-philosopher text-3xl md:text-4xl">
                Video Walkthrough
              </h2>

              {isDomeEstate && (
                <CategoryTabRail
                  fadeFrom="#1A1C1E"
                  showFade={false}
                  trackAriaLabel="Dome video"
                  trackClassName="gap-2 py-0"
                  className="w-full max-w-full md:max-w-xl"
                >
                  {(
                    [
                      { id: "blue", label: "Blue Dome", dot: "#3b82f6" },
                      { id: "red", label: "Red Dome", dot: "#ef4444" },
                      { id: "yellow", label: "Yellow Dome", dot: "#eab308" },
                    ] as const
                  ).map((t) => {
                    const isActive = activeDomeVideo === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        data-tab-key={t.id}
                        onClick={() => setActiveDomeVideo(t.id)}
                        className={clsx(
                          stickyCategoryTabClass(isActive),
                          "flex-shrink-0 inline-flex items-center gap-2",
                        )}
                      >
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full border border-white/30"
                          style={{ backgroundColor: t.dot }}
                        />
                        {t.label}
                      </button>
                    );
                  })}
                </CategoryTabRail>
              )}
            </div>

            {(() => {
              const chosenUrl = domeColor
                ? DOME_VIDEO_URLS[domeColor]
                : isDomeEstate
                  ? DOME_VIDEO_URLS[activeDomeVideo]
                  : (villa.video?.youtubeUrl ?? "");
              const ytId = getYouTubeId(chosenUrl);

              if (ytId) {
                return (
                  <div className="relative aspect-video w-full bg-gray-900 overflow-hidden border border-white/10">
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}`}
                      title={`${villa.name} Walkthrough`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                    {villa.video?.duration && !isDomeEstate && !domeColor && (
                      <div className="absolute bottom-4 right-4 bg-black/60 px-2 py-1 text-[10px] text-white font-bold pointer-events-none">
                        {villa.video.duration}
                      </div>
                    )}
                  </div>
                );
              }

              if (villa.video) {
                return (
                  <div className="relative aspect-video w-full group overflow-hidden border border-white/10">
                    {(villa.video.thumbnail || villa.image) && (
                      <Image
                        src={villa.video.thumbnail || villa.image || ""}
                        alt="Video Thumbnail"
                        fill
                        className="object-cover opacity-60"
                        sizes="(max-width: 768px) 100vw, 1200px"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center shadow-2xl">
                        <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1" />
                      </div>
                    </div>
                    {villa.video.duration && (
                      <div className="absolute bottom-4 right-4 bg-black/60 px-2 py-1 text-[10px] text-white font-bold">
                        {villa.video.duration}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div className="h-64 border border-white/10 flex items-center justify-center text-white/40 italic">
                  Video not available for this retreat.
                </div>
              );
            })()}
          </section>
        ) : filteredSpaces.length > 0 ? (
          filteredSpaces.map((space: VillaSpaceGroup) => (
            <SpacesImageSection key={space.id} space={space} />
          ))
        ) : (
          <div
            className={clsx(
              "h-64 border border-white/10 flex items-center justify-center text-white/40 italic max-w-7xl mx-auto",
              vd.gutterX,
            )}
          >
            No spaces found for this category.
          </div>
        )}
      </div>
    </main>
  );
}

