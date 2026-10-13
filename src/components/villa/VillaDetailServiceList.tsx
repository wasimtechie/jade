"use client";

import { ArrowRight } from "lucide-react";
import type { VillaService } from "@/lib/types";
import { getVillaDetailIcon } from "@/lib/villaDetailIcons";
import VillaDetailSection from "./VillaDetailSection";
import { VillaDetailSectionHeading } from "./VillaDetailSection";

type Props = {
  services: VillaService[];
  onSeeMore: () => void;
  previewCount?: number;
};

export default function VillaDetailServiceList({
  services,
  onSeeMore,
  previewCount = 4,
}: Props) {
  if (!services?.length) return null;

  const preview = services.slice(0, previewCount);

  return (
    <VillaDetailSection id="services" variant="charcoal">
      <VillaDetailSectionHeading as="h3">Services</VillaDetailSectionHeading>
      {preview.map((service, idx) => {
        const Icon = getVillaDetailIcon(service.icon, service.title);
        return (
          <div key={idx} className="flex gap-3 md:gap-5 group">
            <div className="w-12 h-12 md:w-16 md:h-16 flex-shrink-0 border border-[#EFCD62] flex items-center justify-center p-2.5 md:p-3">
              <Icon strokeWidth={1} className="w-full h-full text-[#EFCD62]" />
            </div>
            <div>
              <h4 className="text-gh-sl font-semibold font-manrope text-white mb-1">
                {service.title}
              </h4>
              <p className="text-white/80 text-gh-body mb-2 leading-relaxed">
                {service.description}
              </p>
              {service.footer ? (
                <p className="text-white/45 text-[12px] md:text-[13px] font-manrope leading-relaxed">
                  {service.footer}
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
      {services.length > previewCount ? (
        <button
          type="button"
          onClick={onSeeMore}
          className="flex items-center gap-2 text-[#EFCD62] text-gh-label font-bold tracking-widest uppercase hover:text-white transition-colors"
        >
          SEE MORE <ArrowRight className="w-3 h-3" />
        </button>
      ) : null}
    </VillaDetailSection>
  );
}
