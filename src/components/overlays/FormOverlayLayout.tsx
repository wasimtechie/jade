"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import clsx from "clsx";
import { useNestedLenisPanel } from "@/lib/nestedLenisPanel";
import { useFormOverlayScrollLock } from "@/lib/useFormOverlayScrollLock";
import {
  EXPERIENCE_OVERLAY_MOBILE_SHEET_SCRIM_CLASS,
  EXPERIENCE_OVERLAY_MOBILE_SHEET_TOP_EDGE_SHADE_CLASS,
  EXPERIENCE_OVERLAY_MOBILE_SHEET_ZONE_CLASS,
  EXPERIENCE_OVERLAY_MOBILE_TOP_SHADE_CLASS,
  EXPERIENCE_OVERLAY_MOBILE_SCROLL_SHEET_CLASS,
} from "@/lib/experienceOverlayTheme";
import { useOverlayMobileChrome } from "@/lib/useOverlayMobileChrome";
import {
  FORM_OVERLAY_MOBILE_SCROLL_PAD_CLASS,
  FORM_OVERLAY_ROOT_CLASS,
} from "@/lib/formOverlayTheme";
import { OVERLAY_DISMISS_BUTTON_BASE } from "@/lib/overlayDismissButton";
import {
  EXPERIENCE_OVERLAY_MD_UP_QUERY,
  VillaExperienceOverlayCloseFramer,
} from "@/components/experience/VillaExperienceOverlayLayout";

const MotionButton = motion.button;

type FormOverlayLayoutProps = {
  onClose: () => void;
  canDismiss?: boolean;
  children: React.ReactNode;
  scrollClassName?: string;
  desktopModalClassName?: string;
  /** Override mobile sheet surface (e.g. careers `#0B2C23`). */
  sheetFrameClassName?: string;
  /** Lip shadow at rounded sheet top — off for success screens (ref. Know More shell). */
  showSheetTopEdgeShade?: boolean;
};

/**
 * Shared shell for form-filling overlays.
 * Mobile: Know More pattern (8vh dismiss band + 92vh rounded sheet + body scroll lock).
 * Desktop: centered modal.
 */
export default function FormOverlayLayout({
  onClose,
  canDismiss = true,
  children,
  scrollClassName,
  desktopModalClassName,
  sheetFrameClassName,
  showSheetTopEdgeShade = true,
}: FormOverlayLayoutProps) {
  useFormOverlayScrollLock(true);
  useOverlayMobileChrome(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mdUp, setMdUp] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia(EXPERIENCE_OVERLAY_MD_UP_QUERY);
    const sync = () => setMdUp(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useNestedLenisPanel(scrollRef, true);

  const handleDismiss = canDismiss ? onClose : undefined;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={clsx(
        FORM_OVERLAY_ROOT_CLASS,
        "flex flex-col md:items-center md:justify-center",
      )}
      data-lenis-prevent
    >
      {/* Mobile: full-viewport scrim so fixed page chrome (pricing bar) is covered */}
      <div
        className="absolute inset-0 z-0 bg-black/60 backdrop-blur-sm md:hidden"
        onClick={handleDismiss}
        aria-hidden
      />

      <div
        className="absolute inset-0 hidden md:block bg-black/60 backdrop-blur-sm"
        onClick={handleDismiss}
        aria-hidden={!mdUp}
      />

      {canDismiss ? (
        <>
          <VillaExperienceOverlayCloseFramer
            MotionButton={MotionButton}
            onClose={onClose}
            variant="above-sheet"
          />
          <MotionButton
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={onClose}
            className={`hidden md:flex fixed left-0 right-0 mx-auto top-[max(0.75rem,env(safe-area-inset-top,0px))] z-[200] ${OVERLAY_DISMISS_BUTTON_BASE} pointer-events-auto`}
            aria-label="Close"
          >
            <X className="w-6 h-6 stroke-[1.5]" />
          </MotionButton>
        </>
      ) : null}

      {/* Mobile top dismiss band */}
      <button
        type="button"
        className={`md:hidden ${EXPERIENCE_OVERLAY_MOBILE_TOP_SHADE_CLASS} w-full shrink-0 border-0 p-0 ${canDismiss ? "cursor-pointer" : "cursor-default"}`}
        aria-label="Close overlay"
        onClick={handleDismiss}
        disabled={!canDismiss}
      />

      {/* Sheet / modal — single content tree */}
      <div
        className={clsx(
          "relative z-[1] flex min-h-0 w-full flex-col pointer-events-auto",
          "md:h-auto md:max-h-[min(85dvh,760px)] md:max-w-[600px] md:mx-4",
          EXPERIENCE_OVERLAY_MOBILE_SHEET_ZONE_CLASS,
          "md:bg-transparent md:h-auto md:min-h-0",
        )}
      >
        <div
          className={clsx(
            EXPERIENCE_OVERLAY_MOBILE_SHEET_SCRIM_CLASS,
            "md:hidden",
          )}
          aria-hidden
        />
        <motion.div
          initial={mdUp ? { opacity: 0, y: 24 } : { y: "100%" }}
          animate={mdUp ? { opacity: 1, y: 0 } : { y: 0 }}
          exit={mdUp ? { opacity: 0, y: 24 } : { y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={clsx(
            "relative z-10 flex h-full min-h-0 flex-col overflow-hidden",
            "rounded-t-[32px] bg-jade-green border border-white/10",
            "md:rounded-lg md:shadow-2xl md:h-auto md:max-h-[min(85dvh,760px)]",
            sheetFrameClassName,
            desktopModalClassName,
          )}
        >
          {showSheetTopEdgeShade ? (
            <div
              className={clsx(
                EXPERIENCE_OVERLAY_MOBILE_SHEET_TOP_EDGE_SHADE_CLASS,
                "md:hidden",
              )}
              aria-hidden
            />
          ) : null}
          <div
            ref={scrollRef}
            className={clsx(
              EXPERIENCE_OVERLAY_MOBILE_SCROLL_SHEET_CLASS,
              "enquiry-overlay-scroll",
              !showSheetTopEdgeShade ? "max-md:pt-0" : "max-md:pt-6",
              scrollClassName,
              FORM_OVERLAY_MOBILE_SCROLL_PAD_CLASS,
            )}
            data-lenis-prevent
          >
            {children}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
