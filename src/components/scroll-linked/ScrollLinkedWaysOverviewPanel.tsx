"use client";

import { useRef } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import JadeImage from "@/components/ui/JadeImage";
import Link from "next/link";
import PrimaryButton from "@/components/PrimaryButton";
import NavbarThemeTrigger from "@/components/NavbarThemeTrigger";
import { experiencePanelTextOpacity } from "@/lib/experiencePanelMotion";
import { useScrollLinkedMobileCardScale } from "@/lib/scrollLinkedMobileCardScale";
import { useMediaMinLg } from "@/lib/useMediaMinLg";
import { useScrollLinkedPanelOffset } from "@/lib/useScrollLinkedPanelOffset";
import {
  useScrollLinkedAxisMotion,
  useScrollLinkedSlideAxis,
} from "@/lib/useScrollLinkedSlideAxis";
import {
  scrollLinkedPanelImageFrameClass,
  scrollLinkedPanelOuterClass,
  scrollLinkedPanelSlideClass,
  scrollLinkedPanelSlideInteractiveClass,
  scrollLinkedPanelStackClass,
  scrollLinkedPanelStackWrapClass,
  scrollLinkedPanelTextBlockClass,
} from "@/lib/scrollLinkedPanelLayout";
import type { WaysJadeOverviewTile } from "@/lib/waysJadeOverviewTiles";

export type ScrollLinkedWaysOverviewPanelProps = {
  tiles: WaysJadeOverviewTile[];
  index: number;
  panelProgress: MotionValue<number>;
  totalSteps: number;
  panelCount: number;
  ctaHref: string;
  ctaLabel?: string;
  /** Matches section charcoal so tile gaps don’t read as a black window. */
  gapBgClassName?: string;
  snapCentered?: boolean;
};

export default function ScrollLinkedWaysOverviewPanel({
  tiles,
  index,
  panelProgress,
  totalSteps,
  panelCount,
  ctaHref,
  ctaLabel = "SEE ALL EXPERIENCES",
  gapBgClassName = "bg-[#25282C]",
  snapCentered = true,
}: ScrollLinkedWaysOverviewPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const isLg = useMediaMinLg();
  const axis = useScrollLinkedSlideAxis();
  const stackWrapRef = useRef<HTMLDivElement>(null);
  const { offsetPx } = useScrollLinkedPanelOffset(stackWrapRef, {
    variant: "standard",
    snapCentered: snapCentered && !isLg,
    mobileAxis: axis,
  });

  const slideOffset = useTransform(
    panelProgress,
    (p: number) => (index - p * totalSteps) * offsetPx,
  );
  const { x, y } = useScrollLinkedAxisMotion(slideOffset, axis);
  const scale = useScrollLinkedMobileCardScale(
    panelProgress,
    index,
    totalSteps,
  );

  const zIndex = useTransform(panelProgress, (p: number) => {
    const centered = Math.min(Math.round(p * totalSteps), panelCount - 1);
    return index === centered ? 100 : index * 10;
  });

  const textOpacity = useTransform(panelProgress, (p: number) =>
    experiencePanelTextOpacity(p, index, totalSteps),
  );

  return (
    <motion.div
      style={{ x, y, zIndex, willChange: "transform" }}
      className={`${scrollLinkedPanelSlideClass} bg-transparent`}
    >
      <div className={scrollLinkedPanelSlideInteractiveClass}>
        <NavbarThemeTrigger theme="white" sectionRef={panelRef} />
        <div className={scrollLinkedPanelOuterClass}>
          <div ref={stackWrapRef} className={scrollLinkedPanelStackWrapClass}>
            <motion.div
              style={{ scale }}
              className="w-full origin-center will-change-transform"
            >
              <div className={scrollLinkedPanelStackClass}>
                <div className={scrollLinkedPanelImageFrameClass}>
                  <div
                    className={`absolute inset-0 grid h-full w-full grid-cols-2 grid-rows-2 gap-[3px] sm:gap-1 ${gapBgClassName}`}
                  >
                    {tiles.map((tile) => (
                      <Link
                        key={tile.id}
                        href={tile.href}
                        className="group relative block h-full min-h-0 w-full overflow-hidden"
                        aria-label={tile.title}
                      >
                        <JadeImage
                          src={tile.image}
                          alt={tile.title}
                          fill
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 35vw, 280px"
                        />
                        <div className="absolute inset-0 bg-black/40 transition-colors duration-300 group-hover:bg-black/28" />
                        <span className="absolute inset-0 z-[1] flex items-center justify-center px-2 text-center font-philosopher text-[clamp(0.8125rem,2.2vw,1.35rem)] leading-tight text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.65)]">
                          {tile.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/*
                  Min-height ≈ sibling title + body + link so the image frame
                  shares the same vertical band when stacks are centred.
                */}
                <motion.div
                  style={{ opacity: textOpacity }}
                  className={`${scrollLinkedPanelTextBlockClass} min-h-[clamp(6.75rem,15vh,10rem)]`}
                >
                  <div className="flex w-full flex-1 items-start justify-center pt-0.5 lg:pt-1">
                    <PrimaryButton
                      href={ctaHref}
                      width="section"
                      className="w-full justify-center"
                    >
                      {ctaLabel}
                    </PrimaryButton>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
