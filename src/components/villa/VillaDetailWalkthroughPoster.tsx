"use client";

import Image from "next/image";
import clsx from "clsx";
import { VILLA_DETAIL_SPACING } from "./villaDetailSpacing";

const vd = VILLA_DETAIL_SPACING;

type Props = {
  src: string;
  alt?: string;
};

/** Static walkthrough poster — matches villa detail video frame typography + spacing. */
export default function VillaDetailWalkthroughPoster({
  src,
  alt = "Video Cover",
}: Props) {
  return (
    <div
      className={clsx(
        vd.mediaStageFrame,
        "group relative w-full cursor-pointer overflow-hidden border border-white/10 bg-gray-900",
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover opacity-60 transition-opacity group-hover:opacity-60"
        sizes="(max-width: 768px) 100vw, 800px"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-2xl backdrop-blur-md transition-all hover:bg-white/30 md:h-20 md:w-20">
          <div className="ml-1 h-0 w-0 border-b-[10px] border-l-[18px] border-t-[10px] border-b-transparent border-l-white border-t-transparent" />
        </div>
      </div>
    </div>
  );
}
