"use client";

import { useState } from "react";
import { VILLAS } from "@/lib/mockData";
import PartyVillaCard from "./PartyVillaCard";
import PartyVenueOverlay from "./PartyVenueOverlay";
import { AnimatePresence } from "framer-motion";

// Filter VILLAS for Party page: Dome, Emerald, Magnolia, Tranquil Woods, Wonderland Treehouse
const PARTY_VILLA_IDS = [
  "dome-villas",
  "emerald",
  "magnolia",
  "tranquil",
  "wonderland",
];

const PARTY_VILLAS = VILLAS.filter((villa) =>
  PARTY_VILLA_IDS.includes(villa.id),
).sort((a, b) => PARTY_VILLA_IDS.indexOf(a.id) - PARTY_VILLA_IDS.indexOf(b.id));

export default function PartyVillasCarousel() {
  const [selectedVilla, setSelectedVilla] = useState<any>(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const handleKnowMore = (villa: any) => {
    setSelectedVilla(villa);
    setIsOverlayOpen(true);
  };

  return (
    <section
      id="party-villas-section"
      className="jade-section relative bg-[#25282C]"
    >
      <div className="max-w-[1920px] mx-auto px-4 md:px-8 lg:px-16 w-full overflow-hidden">
        <div className="flex flex-col gap-11">
          {PARTY_VILLAS.map((villa) => (
            <PartyVillaCard
              key={villa.id}
              villa={villa}
              onKnowMore={() => handleKnowMore(villa)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isOverlayOpen && (
          <PartyVenueOverlay
            isOpen={isOverlayOpen}
            onClose={() => setIsOverlayOpen(false)}
            villa={selectedVilla}
            overlayPage="party"
          />
        )}
      </AnimatePresence>
    </section>
  );
}
