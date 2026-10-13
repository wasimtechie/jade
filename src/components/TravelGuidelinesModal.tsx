"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface Guideline {
  title: string;
  desc: string;
}

const MODAL_GUIDELINES: Guideline[] = [
  {
    title: "GUEST CAPACITY",
    desc: "The caravan comfortably accommodates 6–8 guests.",
  },
  {
    title: "APPROVED HALT LOCATIONS",
    desc: "Overnight halts are permitted only at approved resorts, caravan parks or private properties with prior permission.",
  },
  {
    title: "RESPONSIBLE CELEBRATIONS",
    desc: "Alcohol consumption is permitted within legal limits, provided it remains respectful to local regulations and surroundings.",
  },
  {
    title: "NO SMOKING INSIDE",
    desc: "Smoking is strictly not permitted inside the caravan to maintain a clean and comfortable environment for all guests.",
  },
  {
    title: "SECURITY DEPOSIT",
    desc: "A refundable security deposit is collected before departure and returned after the journey subject to inspection.",
  },
  {
    title: "TRAVEL SAFETY",
    desc: "Guests are requested to follow driver and crew instructions throughout the journey for a smooth and safe experience.",
  },
];

interface TravelGuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TravelGuidelinesModal({
  isOpen,
  onClose,
}: TravelGuidelinesModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl max-h-[calc(100dvh-8rem)] mt-10 flex flex-col pointer-events-auto"
            >
              {/* Floating Close Button */}
              <button
                onClick={onClose}
                className="absolute -top-14 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#0B2C23] border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-[#EFCD62] hover:text-[#0B2C23] transition-all duration-300 shadow-2xl"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Content Box */}
              <div className="bg-[#0B2C23] border border-white/10 rounded-[24px] overflow-hidden shadow-2xl flex flex-col relative h-full">
                <div
                  className="p-8 md:p-12 overflow-y-auto custom-scrollbar h-full"
                  data-lenis-prevent
                >
                  <h2 className="text-gh-h1 font-philosopher text-white mb-8">
                    Property Details
                  </h2>

                  <div className="space-y-8">
                    {MODAL_GUIDELINES.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="mt-1.5 flex-shrink-0">
                          <div className="w-2.5 h-2.5 bg-[#EFCD62] rotate-45" />
                        </div>
                        <div>
                          <h3 className="text-[#EFCD62] text-gh-label font-bold tracking-[0.2em] uppercase font-manrope mb-2">
                            {item.title}
                          </h3>
                          <p className="text-white/80 text-gh-body leading-relaxed font-manrope">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
