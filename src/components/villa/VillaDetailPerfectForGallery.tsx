"use client";

import JadeImage from "@/components/ui/JadeImage";
import type { VillaPerfectForCard } from "@/lib/types";
import VillaDetailSection from "./VillaDetailSection";
import { VillaDetailSectionHeading } from "./VillaDetailSection";

type Props = {
  cards: VillaPerfectForCard[];
  fallbackImage?: string;
};

export default function VillaDetailPerfectForGallery({
  cards,
  fallbackImage,
}: Props) {
  if (!cards?.length) return null;

  return (
    <VillaDetailSection id="perfect-for" variant="charcoal">
      <VillaDetailSectionHeading>Perfect for</VillaDetailSectionHeading>
      <div className="grid grid-cols-2 gap-2.5 md:gap-3">
        {cards.map((item, idx) => {
          const image = item.image || fallbackImage;
          return (
            <div key={`${item.title}-${idx}`} className="relative aspect-[3/4] overflow-hidden">
              {image ? (
                <JadeImage
                  src={image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  loading="lazy"
                />
              ) : null}
              <div className="absolute inset-0 bg-black/45 z-10" />
              <div className="absolute inset-0 flex items-center justify-center z-20 p-3">
                <h4 className="text-white font-philosopher text-base md:text-lg text-center leading-tight">
                  {item.title}
                </h4>
              </div>
            </div>
          );
        })}
      </div>
    </VillaDetailSection>
  );
}
