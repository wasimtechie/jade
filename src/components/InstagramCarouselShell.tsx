"use client";

import { Instagram } from "lucide-react";
import { JADE_CHARCOAL } from "@/lib/jadeSectionColors";

/** Tiny shell — kept separate so LandingPage does not import the full carousel bundle. */
export function InstagramCarouselShell() {
  return (
    <div
      className="jade-section min-h-[80dvh] flex flex-col justify-center items-center px-6"
      style={{ background: JADE_CHARCOAL }}
      aria-hidden
    >
      <div className="flex items-center gap-2 mb-3">
        <Instagram className="w-5 h-5 text-jade-gold/60" />
        <span className="font-manrope text-gh-label tracking-[0.3em] uppercase text-jade-gold/60">
          Featured on Instagram
        </span>
      </div>
      <h2 className="font-philosopher text-gh-h1 text-white/40 mb-8">
        Moments as they unfold
      </h2>
      <div className="w-full max-w-4xl h-48 rounded-lg bg-white/5" />
    </div>
  );
}
