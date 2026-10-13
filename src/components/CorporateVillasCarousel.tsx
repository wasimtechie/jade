"use client";

import { useState } from "react";
import { VILLAS } from "@/lib/mockData";
import { getOverlayVillaData } from "@/lib/overlayVillaData";
import { CORPORATE_VILLA_IDS } from "@/data/overlays_data/corporate/villas/index";
import CorporateVillaCard from "./CorporateVillaCard";
import CorporateVenueOverlay from "./CorporateVenueOverlay";
import { AnimatePresence } from "framer-motion";

const CORPORATE_VILLAS = CORPORATE_VILLA_IDS.map((id) => {
  const base = VILLAS.find((v) => v.id === id);
  return getOverlayVillaData("corporate", id) ?? base ?? null;
}).filter((villa): villa is NonNullable<typeof villa> => villa != null);

export default function CorporateVillasCarousel() {
  const [selectedVilla, setSelectedVilla] = useState<any>(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const handleKnowMore = (villa: any) => {
    setSelectedVilla(villa);
    setIsOverlayOpen(true);
  };

  return (
    <section
      id="featured-venues"
      className="jade-section relative bg-[#1A1C1E]"
    >
      <div className="max-w-[1920px] mx-auto px-4 md:px-8 lg:px-16 w-full overflow-hidden">
        <div className="flex flex-col gap-11">
          {CORPORATE_VILLAS.map((villa) => (
            <CorporateVillaCard
              key={villa.id}
              villa={villa}
              onKnowMore={() => handleKnowMore(villa)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isOverlayOpen && (
          <CorporateVenueOverlay
            isOpen={isOverlayOpen}
            onClose={() => setIsOverlayOpen(false)}
            villa={selectedVilla}
            overlayPage="corporate"
          />
        )}
      </AnimatePresence>
    </section>
  );
}
