"use client";

import { motion, AnimatePresence } from "framer-motion";
import OverlayEnquirySuccessContent from "@/components/overlays/OverlayEnquirySuccessContent";
import {
  EXPERIENCE_OVERLAY_MOBILE_SHEET_SCRIM_CLASS,
  EXPERIENCE_OVERLAY_MOBILE_SHEET_ZONE_CLASS,
  EXPERIENCE_OVERLAY_MOBILE_TOP_SHADE_VH,
} from "@/lib/experienceOverlayTheme";
import { FORM_OVERLAY_MOBILE_SHEET_FRAME_CLASS } from "@/lib/formOverlayTheme";

type OverlayEnquirySuccessLayerProps = {
  open: boolean;
  onOkay: () => void;
};

/**
 * Know More / venue overlay success — same shell as Partner & Enquire:
 * mobile 92svh jade-green sheet (below 8svh dismiss band), desktop centered green modal.
 */
export default function OverlayEnquirySuccessLayer({
  open,
  onOkay,
}: OverlayEnquirySuccessLayerProps) {
  const mobileSheetTop = `${EXPERIENCE_OVERLAY_MOBILE_TOP_SHADE_VH}svh`;

  return (
    <AnimatePresence>
      {open ? (
        <>
          {/* Mobile — fills Know More sheet zone; top dismiss band + close stay visible */}
          <motion.div
            key="overlay-enquiry-success-mobile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden fixed inset-x-0 bottom-0 z-[220] flex min-h-0 flex-col pointer-events-auto"
            style={{ top: mobileSheetTop }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="overlay-success-title"
          >
            <div
              className={`relative flex min-h-0 flex-1 flex-col ${EXPERIENCE_OVERLAY_MOBILE_SHEET_ZONE_CLASS}`}
            >
              <div
                className={EXPERIENCE_OVERLAY_MOBILE_SHEET_SCRIM_CLASS}
                aria-hidden
              />
              <div
                className={`relative flex min-h-0 flex-1 flex-col overflow-hidden ${FORM_OVERLAY_MOBILE_SHEET_FRAME_CLASS}`}
              >
                <div className="relative z-[1] flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain">
                  <OverlayEnquirySuccessContent onOkay={onOkay} embedded />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Desktop — dimmed scrim + centered green modal */}
          <motion.div
            key="overlay-enquiry-success-desktop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="hidden md:flex fixed inset-0 z-[220] items-center justify-center p-6 pointer-events-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="overlay-success-title"
          >
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              aria-hidden
            />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 flex max-h-[min(85dvh,650px)] w-full max-w-lg min-h-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-jade-green shadow-2xl"
            >
              <div className="relative z-[1] flex min-h-0 flex-1 flex-col overflow-y-auto">
                <OverlayEnquirySuccessContent onOkay={onOkay} embedded />
              </div>
            </motion.div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
