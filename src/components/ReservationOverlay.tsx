"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Minus, Plus, ChevronLeft } from "lucide-react";
import Image from "next/image";
import PrimaryButton from "@/components/PrimaryButton";
import {
  OVERLAY_DISMISS_ABOVE_SHEET_MOBILE_CLASS,
  OVERLAY_DISMISS_BUTTON_VIEWPORT_TOP_CLASS,
} from "@/lib/overlayDismissButton";
import { useEffect, useState } from "react";
import { OVERLAY_MOBILE_FORM_SCROLL_PAD_CLASS } from "@/lib/overlayMobileChrome";
import { useOverlayMobileChrome } from "@/lib/useOverlayMobileChrome";

interface ReservationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: "dates" | "guests";
  guests: { adults: number; children: number; pets: number };
  setGuests: React.Dispatch<
    React.SetStateAction<{ adults: number; children: number; pets: number }>
  >;
  dates: number[];
  setDates: React.Dispatch<React.SetStateAction<number[]>>;
  onApply: () => void;
}

export default function ReservationOverlay({
  isOpen,
  onClose,
  initialView = "dates",
  guests,
  setGuests,
  dates,
  setDates,
  onApply,
}: ReservationOverlayProps) {
  const [view, setView] = useState<"dates" | "guests">(initialView);
  useOverlayMobileChrome(isOpen);

  // Sync view when opened from different buttons
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
    }
  }, [isOpen, initialView]);

  // Quick helpers
  const { adults, children, pets } = guests;

  // Simple static days for UI presentation (mimicking January 2026 from screenshot)
  const janDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const febDays = Array.from({ length: 28 }, (_, i) => i + 1);

  const updateGuests = (
    type: "adults" | "children" | "pets",
    value: number,
  ) => {
    setGuests((prev) => ({ ...prev, [type]: Math.max(0, value) }));
  };

  const handleDateToggle = (day: number) => {
    if (dates.includes(day)) {
      setDates(dates.filter((d) => d !== day));
    } else {
      setDates([...dates, day].sort((a, b) => a - b));
    }
  };

  if (!isOpen) return null;

  const handleApply = () => {
    onApply();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="relative">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Desktop: viewport-top dismiss */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={onClose}
            className={`hidden md:flex ${OVERLAY_DISMISS_BUTTON_VIEWPORT_TOP_CLASS}`}
            aria-label="Close"
          >
            <X className="w-6 h-6 stroke-[1.5]" />
          </motion.button>

          <div
            className="fixed inset-0 z-[101] flex flex-col items-center justify-end md:justify-center px-4 md:px-0 pointer-events-none"
            onWheel={(e) => e.stopPropagation()}
          >
            {/* Mobile: dismiss sits just above the sheet lip */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={onClose}
              className={OVERLAY_DISMISS_ABOVE_SHEET_MOBILE_CLASS}
              aria-label="Close"
            >
              <X className="w-6 h-6 stroke-[1.5]" />
            </motion.button>

            {/* Modal */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative pointer-events-auto w-full md:w-[600px] max-md:h-[80svh] md:h-auto bg-jade-green flex flex-col font-manrope rounded-t-2xl md:rounded-lg shadow-2xl border border-white/10 overflow-hidden md:max-h-[85vh]"
            >
              {/* NEW GLOBAL HEADER (Matches Mockup 2 - Two Tone Green) */}
              <div className="flex bg-[#0A3527] items-center justify-between px-5 md:px-6 py-4 border-b border-white/5 shrink-0 relative">
                {/* Left: Exit/Back */}
                <button
                  onClick={onClose}
                  className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="font-manrope text-gh-body pt-[4px]">
                    Exit
                  </span>
                </button>

                {/* Center: Logo & Title (Absolute centering for perfect alignment) */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
                  <div className="relative w-6 h-6">
                    <Image
                      src="/assets/Golden_Logo.png"
                      alt="Jade"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-white font-philosopher text-gh-scroll">
                    Book a Stay
                  </span>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (view === "guests") {
                        setGuests({ adults: 0, children: 0, pets: 0 });
                      } else {
                        setDates([]);
                      }
                    }}
                    className="text-[#EFCD62] text-gh-label font-manrope font-bold tracking-widest uppercase hover:text-white transition-colors pt-[4px]"
                  >
                    RESET
                  </button>
                  <a
                    href="tel:08970663366"
                    className="text-white hover:text-[#EFCD62] transition-colors relative"
                  >
                    <Phone
                      className="w-5 h-5 md:w-6 md:h-6"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </a>
                </div>
              </div>

              {/* CONTENT AREA */}
              <div className={`flex-1 bg-[#0B2C23] overflow-y-auto px-5 md:px-6 py-5 ${OVERLAY_MOBILE_FORM_SCROLL_PAD_CLASS} overflow-x-hidden scrollbar-hide`} data-lenis-prevent>
                {view === "dates" && (
                  <div className="flex flex-col gap-4">
                    <h2 className="text-white text-gh-h2 font-philosopher leading-none mb-1">
                      Select Dates
                    </h2>

                    {/* Legend */}
                    <div className="flex justify-start items-center gap-4 md:gap-6 text-gh-label text-[#A6C0B5] font-manrope font-medium mb-2">
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 md:w-5 md:h-5 bg-[#165040] rounded-[2px]" />
                        Available
                      </span>
                      <span className="flex items-center gap-2 relative">
                        <span className="w-4 h-4 md:w-5 md:h-5 bg-[#165040] rounded-[2px] overflow-hidden relative border border-[#165040]">
                          <span className="block w-[150%] h-[1px] md:h-[1.5px] bg-[#A6C0B5]/40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45" />
                        </span>
                        Unavailable
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 md:w-5 md:h-5 bg-[#EFCD62] rounded-[2px]" />
                        <span className="text-[#EFCD62]">Selected</span>
                      </span>
                    </div>

                    {/* Days Header */}
                    <div className="grid grid-cols-7 gap-1 text-center text-gh-label text-white/40 uppercase tracking-widest mb-2">
                      <div>Mon</div>
                      <div>Tue</div>
                      <div>Wed</div>
                      <div>Thu</div>
                      <div>Fri</div>
                      <div>Sat</div>
                      <div>Sun</div>
                    </div>

                    {/* January 2026 Mock Calendar */}
                    <div>
                      <h3 className="text-white font-manrope font-semibold text-gh-body mb-3">
                        January 2026
                      </h3>
                      <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
                        {/* Empty slots for start of Jan 2026 (Starts on Thursday tentatively for mockup) */}
                        <div />
                        <div />
                        <div />
                        {janDays.map((day) => {
                          const isUnavailable = [7, 8, 9].includes(day);
                          const isSelected = dates.includes(day);
                          return (
                            <button
                              key={`jan-${day}`}
                              onClick={() =>
                                !isUnavailable && handleDateToggle(day)
                              }
                              className={`w-8 h-8 md:w-10 md:h-10 mx-auto flex items-center justify-center text-gh-body transition-colors rounded-sm ${ isSelected ? "bg-[#EFCD62] text-[#0E211A] font-bold" : isUnavailable ? "text-white/20 relative overflow-hidden" : "text-white hover:bg-white/10" }`}
                            >
                              {isUnavailable && (
                                <div className="absolute inset-0 border-t border-white/20 -rotate-45 transform origin-center scale-150" />
                              )}
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* February 2026 Mock Calendar */}
                    <div>
                      <h3 className="text-white font-manrope font-semibold text-gh-body mb-3 mt-3">
                        February 2026
                      </h3>
                      <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
                        {/* Empty slots for Feb (Starts on Sunday) */}
                        <div />
                        <div />
                        <div />
                        <div />
                        <div />
                        <div />
                        {febDays.map((day) => {
                          const isUnavailable = [7, 8, 9, 10].includes(day);
                          return (
                            <button
                              key={`feb-${day}`}
                              className={`w-8 h-8 md:w-10 md:h-10 mx-auto flex items-center justify-center text-gh-body transition-colors rounded-sm ${isUnavailable ? "text-white/20 relative overflow-hidden" : "text-white hover:bg-white/10"}`}
                            >
                              {isUnavailable && (
                                <div className="absolute inset-0 border-t border-white/20 -rotate-45 transform origin-center scale-150" />
                              )}
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {view === "guests" && (
                  <div className="flex flex-col gap-6 mt-3">
                    {/* Adults */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-semibold text-gh-body">
                          Adults
                        </h4>
                        <p className="text-white/40 text-gh-desc">
                          Age 13 years and more
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateGuests("adults", adults - 1)}
                          className="w-8 h-8 rounded-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-white font-philosopher text-gh-h2 w-6 text-center">
                          {adults.toString().padStart(2, "0")}
                        </span>
                        <button
                          onClick={() => updateGuests("adults", adults + 1)}
                          className="w-8 h-8 rounded-sm bg-white/5 border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-semibold text-gh-body">
                          Children
                        </h4>
                        <p className="text-white/40 text-gh-desc">
                          Age 3 - 12 years
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateGuests("children", children - 1)}
                          className="w-8 h-8 rounded-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-white font-philosopher text-gh-h2 w-6 text-center">
                          {children.toString().padStart(2, "0")}
                        </span>
                        <button
                          onClick={() => updateGuests("children", children + 1)}
                          className="w-8 h-8 rounded-sm bg-white/5 border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Pets */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-semibold text-gh-body">
                          Pets
                        </h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateGuests("pets", pets - 1)}
                          className="w-8 h-8 rounded-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-white font-philosopher text-gh-h2 w-6 text-center">
                          {pets.toString().padStart(2, "0")}
                        </span>
                        <button
                          onClick={() => updateGuests("pets", pets + 1)}
                          className="w-8 h-8 rounded-sm bg-white/5 border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* FOOTER */}
              <div className="relative border-t border-[#EFCD62]/30 bg-[#0B2C23] px-6 py-4">
                {/* Progress Line */}
                <div className="absolute top-0 left-0 w-full h-[2px] flex">
                  <div
                    className={`h-full transition-all duration-300 ${view === "dates" ? "w-1/2 bg-[#EFCD62]" : "w-1/2 bg-[#EFCD62]/20"}`}
                  />
                  <div
                    className={`h-full transition-all duration-300 ${view === "guests" ? "w-1/2 bg-[#EFCD62]" : "w-1/2 bg-transparent"}`}
                  />
                </div>

                {view === "dates" ? (
                  <div className="flex items-center justify-between mt-2">
                    {dates.length > 0 ? (
                      <div className="text-white font-manrope text-gh-body font-semibold">
                        {dates[0]} Jan{" "}
                        {dates.length > 1 && (
                          <>
                            <span className="text-white/40 font-normal mx-2">
                              to
                            </span>{" "}
                            {dates[dates.length - 1]} Jan
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="text-white/40 font-manrope text-gh-body">
                        -- -- to -- --
                      </div>
                    )}
                    <PrimaryButton
                      withArrow={false}
                      width="compact"
                      onClick={() => setView("guests")}
                    >
                      NEXT
                    </PrimaryButton>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-2">
                    {adults > 0 || children > 0 ? (
                      <div className="text-white font-manrope text-gh-body font-semibold">
                        {adults + children} Guests
                        {pets > 0 ? `, ${pets} Pets` : ""}
                      </div>
                    ) : (
                      <div className="text-white/40 font-manrope text-gh-body">
                        -- --
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setView("dates")}
                        className="text-[#EFCD62] hover:text-white transition-colors text-gh-label font-bold tracking-widest uppercase"
                      >
                        BACK
                      </button>
                      <PrimaryButton withArrow={false} width="compact" onClick={handleApply}>
                        APPLY
                      </PrimaryButton>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
