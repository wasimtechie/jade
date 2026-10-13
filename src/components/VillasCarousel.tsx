"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { VILLAS, CATEGORIES } from "@/lib/mockData";
import { villaMatchesCategory } from "@/lib/villaCategoryMatch";
import { usePublicVillas } from "@/lib/villas/usePublicVillas";
import ReservationOverlay from "./ReservationOverlay";
import VillaCard from "./VillaCard";
import BookingBanner from "./BookingBanner";
import PrimaryButton from "@/components/PrimaryButton";
import { useBooking } from "@/context/BookingContext";
import { compareBookingCalendarDates } from "@/lib/bookingUiDates";
import { scrollToElement } from "@/lib/lenis";
import { sortVillasForDirectory } from "@/lib/villasDirectoryOrder";
import HorizontalScrollRail from "@/components/ui/HorizontalScrollRail";
import { STICKY_BELOW_GLOBAL_NAV_CLASS } from "@/lib/scrollChromeLayout";
import {
  VILLA_LISTING_FOCUS_PARAM,
  VILLA_LISTING_FOCUS_RESULTS,
} from "@/lib/appRoutes";

// Navbar height to offset the sticky filter bar
const NAVBAR_HEIGHT = 72;

// Unavailable date ranges (month name → array of unavailable days)
const VILLA_UNAVAILABLE: Record<string, number[]> = {
  "January 2026": [7, 8, 9, 21, 22],
  "February 2026": [7, 8, 9, 10, 21, 22],
  "March 2026": [14, 15, 21, 22, 28, 29, 30, 31],
  "April 2026": [1, 2, 3, 4, 5, 18, 19, 20],
};

const VILLA_MONTHS = [
  { name: "January 2026", month: 0 },
  { name: "February 2026", month: 1 },
  { name: "March 2026", month: 2 },
  { name: "April 2026", month: 3 },
];

const NEXT_AVAILABLE = [
  { label: "25 Mar - 27 Mar" },
  { label: "5 Apr - 7 Apr" },
  { label: "3 Apr - 5 Apr" },
];

export default function VillasCarousel() {
  const { villas, loading: villasLoading } = usePublicVillas();
  const [activeCategory, setActiveCategory] = useState("All");
  const searchParams = useSearchParams();

  // Cold load / external deep link — sync ?category= and scroll to results when
  // ?focus=listing (post book dates/guests) or category deep-link. Navbar /retreats/
  // stays on the hero (no focus param).
  useEffect(() => {
    const categoryParam = searchParams?.get("category");
    const focusListing =
      searchParams?.get(VILLA_LISTING_FOCUS_PARAM) ===
      VILLA_LISTING_FOCUS_RESULTS;

    if (categoryParam) {
      const validCategory = CATEGORIES.find(
        (c) => c.toLowerCase() === categoryParam.toLowerCase(),
      );
      if (validCategory) setActiveCategory(validCategory);
    }

    if (!categoryParam && !focusListing) return;

    const scrollToResults = () => {
      const el = document.getElementById("VILLAS-carousel");
      if (el) {
        scrollToElement(el, { offset: -(NAVBAR_HEIGHT + 20) });
      }
    };

    const timers = [100, 350, 600].map((delay) =>
      window.setTimeout(scrollToResults, delay),
    );

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount / full navigation only
  }, []);

  // Browser back/forward — keep tab state in sync without scrolling.
  useEffect(() => {
    const syncCategoryFromUrl = () => {
      const categoryParam = new URLSearchParams(window.location.search).get(
        "category",
      );
      if (!categoryParam) {
        setActiveCategory("All");
        return;
      }
      const validCategory = CATEGORIES.find(
        (c) => c.toLowerCase() === categoryParam.toLowerCase(),
      );
      if (validCategory) setActiveCategory(validCategory);
    };

    window.addEventListener("popstate", syncCategoryFromUrl);
    return () => window.removeEventListener("popstate", syncCategoryFromUrl);
  }, []);

  // Overlay states
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [overlayView, setOverlayView] = useState<"dates" | "guests">("dates");

  // Dynamic Search State
  const [guests, setGuests] = useState({ adults: 2, children: 0, pets: 0 });
  const [dates, setDates] = useState<number[]>([]);

  // Format strings for inputs
  const formatDates = () => {
    if (dates.length === 0) return "";
    if (dates.length === 1) return `${dates[0]} Jan`;
    return `${dates[0]} Jan - ${dates[dates.length - 1]} Jan`;
  };

  const formatGuests = () => {
    const total = guests.adults + guests.children;
    if (total === 0) return "";
    let str = `${total} Guest${total > 1 ? "s" : ""}`;
    if (guests.pets > 0)
      str += `, ${guests.pets} Pet${guests.pets > 1 ? "s" : ""}`;
    return str;
  };

  const { dateRange, setDateRange, guests: contextGuests } = useBooking();

  // Check if booking dateRange overlaps any unavailable days
  const hasDateConflict = (() => {
    const { checkIn, checkOut } = dateRange;
    if (!checkIn || !checkOut) return false;
    const from = checkIn.iso;
    const to = checkOut.iso;
    for (const month of VILLA_MONTHS) {
      const days = VILLA_UNAVAILABLE[month.name] ?? [];
      for (const d of days) {
        const date = new Date();
        const candidateYear = date.getFullYear();
        const val = `${candidateYear}-${String(month.month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        if (val >= from && val < to) return true;
      }
    }
    return false;
  })();

  const filteredVillas = sortVillasForDirectory(
    villas.filter(
      (villa) =>
        !(villa as { hideFromVillasDirectory?: boolean })
          .hideFromVillasDirectory && villaMatchesCategory(villa, activeCategory),
    ),
  );

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    const params = new URLSearchParams(window.location.search);
    if (category === "All") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    const query = params.toString();
    const nextUrl = query ? `/retreats/?${query}` : "/retreats/";
    window.history.replaceState(window.history.state, "", nextUrl);
  };

  // Auto-scroll to the carousel section when there is a date conflict
  useEffect(() => {
    if (!hasDateConflict) return;
    const el = document.getElementById("VILLAS-carousel");
    if (!el) return;
    scrollToElement(el, { offset: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasDateConflict]);

  const handleSearch = () => {
    const el = document.getElementById("VILLAS-carousel");
    if (el) {
      scrollToElement(el, { offset: -(NAVBAR_HEIGHT + 20) });
    }
  };

  return (
    <section id="VILLAS-carousel" className="relative bg-[#1A1C1E]">
      {/* STICKY FILTERS BAR */}
      <div
        className={`sticky z-30 bg-[#1A1C1E]/95 backdrop-blur-md border-b border-white/10 ${STICKY_BELOW_GLOBAL_NAV_CLASS}`}
      >
        <div className="max-w-[1920px] mx-auto px-2 md:px-8 lg:px-16 pt-3 md:pt-5 pb-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-start gap-2.5 md:gap-5">
            {/* SEARCH BAR - Left Side on Desktop */}
            <div className="order-1 lg:order-1 w-full lg:w-auto flex justify-start">
              <BookingBanner onSearch={handleSearch} />
            </div>

            {/* CATEGORIES - Right Side on Desktop (Scrollable, edge-to-edge) */}
            <HorizontalScrollRail
              fadeFrom="#1A1C1E"
              patternFade
              mobileViewportEdge
              mobileTrackGutter
              cursorGrab
              className="order-2 lg:order-2 flex-1 min-w-0 md:-mr-8 lg:-mr-16"
              trackClassName="items-center gap-2 md:gap-2.5 pb-1 md:scroll-pr-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]"
            >
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryChange(category)}
                  className={`whitespace-nowrap flex-shrink-0 px-4 py-2 text-gh-label font-manrope font-medium transition-all duration-300 ${ activeCategory === category ? "bg-[#EFCD62] text-[#1A1C1E] border border-[#EFCD62]" : "bg-transparent text-white/60 border border-white/20 hover:border-white/50 hover:text-white" }`}
                >
                  {category}
                </button>
              ))}
            </HorizontalScrollRail>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      {hasDateConflict ? (
        /* ── No Results UI — full viewport height ── */
        <div className="flex flex-col items-center justify-center h-[100svh] text-center gap-5 px-6">
          <div className="w-40 h-40 md:w-52 md:h-52 opacity-40">
            <svg
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <ellipse
                cx="100"
                cy="115"
                rx="60"
                ry="30"
                fill="#888"
                opacity="0.3"
              />
              <circle
                cx="85"
                cy="80"
                r="40"
                stroke="#aaa"
                strokeWidth="5"
                fill="#444"
                fillOpacity="0.4"
              />
              <line
                x1="118"
                y1="113"
                x2="155"
                y2="150"
                stroke="#aaa"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <circle cx="74" cy="68" r="10" fill="#666" fillOpacity="0.5" />
              <rect
                x="140"
                y="40"
                width="22"
                height="16"
                rx="2"
                stroke="#aaa"
                strokeWidth="2"
                fill="none"
                opacity="0.5"
              />
              <polyline
                points="140,40 151,50 162,40"
                stroke="#aaa"
                strokeWidth="2"
                opacity="0.5"
              />
              <circle
                cx="148"
                cy="95"
                r="5"
                stroke="#aaa"
                strokeWidth="2"
                fill="none"
                opacity="0.5"
              />
              <line
                x1="148"
                y1="100"
                x2="148"
                y2="108"
                stroke="#aaa"
                strokeWidth="2"
                opacity="0.5"
              />
            </svg>
          </div>
          <p className="text-white/40 text-gh-desc font-manrope tracking-wide">
            No matching search results
          </p>
          <h2 className="text-white text-gh-h2 font-philosopher leading-tight">
            Next Available Dates:
          </h2>
          <div className="flex flex-wrap justify-center gap-2.5">
            {NEXT_AVAILABLE.map((d) => (
              <button
                key={d.label}
                onClick={() => setDateRange({ checkIn: null, checkOut: null })}
                className="border border-white/25 text-white text-gh-desc font-manrope px-5 py-2.5 rounded-[2px] hover:bg-white/10 transition-colors"
              >
                {d.label}
              </button>
            ))}
          </div>
          <p className="text-white/30 text-gh-label font-manrope">or</p>
          <PrimaryButton
            width="compact"
            withArrow={false}
            onClick={() => {
              setDateRange({ checkIn: null, checkOut: null });
              handleCategoryChange("All");
            }}
          >
            CLEAR ALL FILTERS
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </PrimaryButton>
        </div>
      ) : (
        <div className="max-w-[1920px] mx-auto px-4 md:px-8 lg:px-16 w-full mt-10 pb-8 min-h-screen">
          {villasLoading ? (
            <div className="flex flex-col gap-10">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="h-[420px] animate-pulse rounded-sm bg-white/5"
                  aria-hidden
                />
              ))}
            </div>
          ) : filteredVillas.length > 0 ? (
            <div className="flex flex-col">
              {filteredVillas.map((villa, index) => (
                <div key={villa.id}>
                  <VillaCard villa={villa} />
                  {index < filteredVillas.length - 1 && (
                    <hr className="my-10 border-0 border-t border-white/10" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
              <span className="text-white/40 font-manrope text-gh-body">
                No VILLAS found for &quot;{activeCategory}&quot;.
              </span>
              <button
                type="button"
                onClick={() => handleCategoryChange("All")}
                className="mt-3 text-[#EFCD62] font-manrope underline underline-offset-4"
              >
                View All Villas
              </button>
            </div>
          )}
        </div>
      )}

      <ReservationOverlay
        isOpen={isOverlayOpen}
        onClose={() => setIsOverlayOpen(false)}
        initialView={overlayView}
        guests={guests}
        setGuests={setGuests}
        dates={dates}
        setDates={setDates}
        onApply={() =>
          console.log("Search applying:", {
            dates,
            guests,
            category: activeCategory,
          })
        }
      />
    </section>
  );
}
