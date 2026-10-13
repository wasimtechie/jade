"use client";

import { Fragment } from "react";
import { GlassChromePanel } from "./GlassChromePanel";

export interface HeroStat {
  value: string;
  label: string;
}

interface GlassStatsBannerProps {
  stats: HeroStat[];
  className?: string;
  /** Gap between the stats bar and the next element. Default is mb-16 */
  marginBottom?: string;
}

/** Vertical rule between stat columns (~45% banner height), centered — not full-height. */
function StatColumnSeparator() {
  return (
    <div
      aria-hidden
      className="pointer-events-none flex w-px shrink-0 flex-col items-center justify-center self-stretch"
    >
      <div
        className="min-h-[2rem] max-h-[3.25rem] w-px shrink-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.26)_42%,rgba(255,255,255,0.32)_52%,rgba(255,255,255,0.26)_62%,rgba(255,255,255,0)_100%)]"
        style={{ height: "46%" }}
      />
    </div>
  );
}

const GlassStatsBanner = ({
  stats,
  className = "",
  marginBottom = "mb-16",
}: GlassStatsBannerProps) => {
  return (
    <div className={`relative w-full px-0 ${marginBottom} ${className}`}>
      <GlassChromePanel
        className="flex w-full min-h-[88px] h-[88px] md:min-h-[96px] md:h-[96px] lg:min-h-[108px] lg:h-[108px]"
        contentClassName="h-full min-h-[inherit]"
      >
        {stats.map((stat, index) => (
          <Fragment key={index}>
            {index > 0 ? <StatColumnSeparator /> : null}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-1 px-2 py-2 text-center md:px-3 md:py-3">
              <span className="w-full truncate text-[14px] font-manrope font-semibold tabular-nums leading-none tracking-tight text-white/90 xs:text-[16px] md:text-[20px] lg:text-[24px]">
                {stat.value}
              </span>
              <span className="line-clamp-2 w-full hyphens-auto break-words text-[10px] font-manrope font-medium uppercase leading-snug tracking-[0.11em] text-white/82 [overflow-wrap:anywhere]">
                {stat.label}
              </span>
            </div>
          </Fragment>
        ))}
      </GlassChromePanel>
    </div>
  );
};

export default GlassStatsBanner;
