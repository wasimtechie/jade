import React, { useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";
import TravelGuidelinesModal from "./TravelGuidelinesModal";
import {
  EXPERIENCE_SECTION_CTA_CONTAINER_CLASS,
  EXPERIENCE_SECTION_CTA_DIMENSIONS_MD,
} from "@/lib/experienceSectionCta";
import { JADE_BTN_HEIGHT } from "@/lib/jadeButtonTokens";

const GUIDELINES = [
  {
    title: "GUEST CAPACITY",
    desc: "The caravan comfortably accommodates 6–8 guests.",
  },
  {
    title: "APPROVED HALT LOCATIONS",
    desc: "Overnight halts are permitted only at approved resorts, caravan parks or private properties with prior permission.",
  },
  {
    title: "NO SMOKING INSIDE",
    desc: "Smoking is strictly not permitted inside the caravan to maintain a clean and comfortable environment for all guests.",
  },
];

export default function TravelGuidelinesSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="bg-[#0B2C23] lg:h-[100dvh] min-h-[600px] flex flex-col lg:flex-row overflow-hidden relative">
      <div className="max-w-[1920px] mx-auto w-full h-full flex flex-col lg:flex-row">
        {/* Left Side: Image Banner */}
        <div className="relative w-full lg:w-1/2 h-[50dvh] lg:h-full overflow-hidden">
          <Image
            src="/Experiences/Caravan/2-Spaces/19.webp"
            alt="Rathaa Caravan Interior"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
          {/* Subtle gradient overlay to blend into the dark green base */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent lg:hidden" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0B2C23]/40 lg:hidden" />
        </div>

        {/* Right Side: Content */}
        <div className="w-full lg:w-1/2 h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 lg:py-0 relative z-10">
          <div className="max-w-xl">
            <h2 className="text-gh-h2 md:text-gh-h1 font-philosopher text-white leading-tight mb-10">
              Important <br />
              Travel Guidelines
            </h2>

            <div className="space-y-8 mb-11">
              {GUIDELINES.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 group">
                  <div className="mt-1.5 flex-shrink-0">
                    <div className="w-3 h-3 bg-[#EFCD62] rotate-45 transition-transform duration-500 group-hover:rotate-[225deg]" />
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

            <div className={EXPERIENCE_SECTION_CTA_CONTAINER_CLASS}>
              <button
                type="button"
                className={clsx(
                  "flex items-center justify-center gap-2.5",
                  JADE_BTN_HEIGHT,
                  "text-[#EFCD62] text-gh-label font-bold tracking-[0.2em] uppercase font-manrope",
                  "group bg-white/5 hover:bg-white/10 border border-[#EFCD62]/30",
                  "transition-all duration-300",
                  "w-full md:w-auto",
                  EXPERIENCE_SECTION_CTA_DIMENSIONS_MD,
                )}
                onClick={() => setIsModalOpen(true)}
              >
                SEE ALL GUIDELINES
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <TravelGuidelinesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}
