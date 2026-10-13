"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import clsx from "clsx";
import { useNestedLenisPanel } from "@/lib/nestedLenisPanel";
import { useOverlayMobileChrome } from "@/lib/useOverlayMobileChrome";
import {
  EXPERIENCE_OVERLAY_MOBILE_SCROLL_SHEET_CLASS,
  EXPERIENCE_OVERLAY_MOBILE_SHEET_SCRIM_CLASS,
  EXPERIENCE_OVERLAY_MOBILE_SHEET_TOP_EDGE_SHADE_CLASS,
  EXPERIENCE_OVERLAY_MOBILE_SHEET_ZONE_CLASS,
  EXPERIENCE_OVERLAY_MOBILE_TOP_SHADE_CLASS,
} from "@/lib/experienceOverlayTheme";
import { FORM_OVERLAY_ROOT_CLASS } from "@/lib/formOverlayTheme";
import { OVERLAY_DISMISS_BUTTON_BASE } from "@/lib/overlayDismissButton";
import {
  EXPERIENCE_OVERLAY_MD_UP_QUERY,
  VillaExperienceOverlayCloseFramer,
} from "@/components/experience/VillaExperienceOverlayLayout";

const MotionButton = motion.button;

interface DetailItem {
  label: string;
  icon: string;
  description?: string;
  footer?: string;
}

interface DetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: DetailItem[];
}

function DetailDiamondRow({
  title,
  description,
  footer,
}: {
  title: string;
  description?: string;
  footer?: string;
}) {
  return (
    <div className="m-0">
      <div className="flex items-start gap-2.5">
        <span
          className="mt-2 h-2 w-2 shrink-0 rotate-45 bg-[#EFCD62] opacity-90"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-manrope text-gh-body font-semibold leading-snug text-white">
            {title}
          </h3>
          {description ? (
            <p className="mt-2 font-manrope text-gh-desc leading-relaxed text-white/50">
              {description}
            </p>
          ) : null}
          {footer ? (
            <p className="mt-2 font-manrope text-gh-label font-bold uppercase tracking-[0.2em] text-[#EFCD62]">
              {footer}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const DetailsDrawer: React.FC<DetailsDrawerProps> = ({
  isOpen,
  onClose,
  title,
  items,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mdUp, setMdUp] = useState(false);

  useOverlayMobileChrome(isOpen);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    const mq = window.matchMedia(EXPERIENCE_OVERLAY_MD_UP_QUERY);
    const sync = () => setMdUp(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useNestedLenisPanel(scrollRef, isOpen);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="details-drawer-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={clsx(
            FORM_OVERLAY_ROOT_CLASS,
            "flex flex-col md:items-center md:justify-center",
          )}
          data-lenis-prevent
        >
          <div
            className="absolute inset-0 hidden bg-black/60 backdrop-blur-sm md:block"
            onClick={onClose}
            aria-hidden={!mdUp}
          />

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
            className={`pointer-events-auto fixed left-0 right-0 top-[max(0.75rem,env(safe-area-inset-top,0px))] z-[200] mx-auto hidden md:flex ${OVERLAY_DISMISS_BUTTON_BASE}`}
            aria-label="Close"
          >
            <X className="h-6 w-6 stroke-[1.5]" aria-hidden />
          </MotionButton>

          <button
            type="button"
            className={`w-full shrink-0 border-0 p-0 md:hidden ${EXPERIENCE_OVERLAY_MOBILE_TOP_SHADE_CLASS} cursor-pointer`}
            aria-label="Close overlay"
            onClick={onClose}
          />

          <div
            className={clsx(
              "pointer-events-auto relative z-[1] flex min-h-0 w-full flex-col",
              "md:mx-4 md:h-auto md:max-h-[min(85dvh,760px)] md:max-w-[600px] md:min-h-0 md:bg-transparent",
              EXPERIENCE_OVERLAY_MOBILE_SHEET_ZONE_CLASS,
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
              className="relative z-10 flex h-full min-h-0 flex-col overflow-hidden rounded-t-[32px] border border-white/10 bg-jade-green md:h-auto md:max-h-[min(85dvh,760px)] md:rounded-lg md:shadow-2xl"
            >
              <div
                className={clsx(
                  EXPERIENCE_OVERLAY_MOBILE_SHEET_TOP_EDGE_SHADE_CLASS,
                  "md:hidden",
                )}
                aria-hidden
              />
              <div
                ref={scrollRef}
                className={clsx(
                  EXPERIENCE_OVERLAY_MOBILE_SCROLL_SHEET_CLASS,
                  "px-6 py-6 md:px-8 md:py-8",
                )}
                data-lenis-prevent
                onWheel={(e) => e.stopPropagation()}
              >
                <h2
                  id="details-drawer-title"
                  className="mb-6 font-philosopher text-gh-h2 leading-tight text-white"
                >
                  {title}
                </h2>
                <div className="flex flex-col gap-6">
                  {items.map((item, idx) => {
                    const itemTitle =
                      item.label ||
                      (item as { title?: string }).title ||
                      (item as { question?: string }).question ||
                      "";
                    const description =
                      item.description || (item as { answer?: string }).answer;

                    return (
                      <DetailDiamondRow
                        key={idx}
                        title={itemTitle}
                        description={description}
                        footer={item.footer}
                      />
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default DetailsDrawer;
