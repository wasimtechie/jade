"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MediaLibraryManager } from "@/components/dashboard/MediaLibraryManager";
import { DashboardModalHeader } from "@/components/dashboard/ui/DashboardModalHeader";
import { dash } from "@/lib/dashboard/dashboardClasses";
import {
  GLASS_CHROME_FRAME_CLASS,
  GLASS_INNER_SURFACE,
} from "@/lib/glassChrome";
import "@/styles/media-library.css";

type MediaPickerModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string, meta?: { alt?: string }) => void;
  contextSlug?: string;
  title?: string;
};

export function MediaPickerModal({
  open,
  onClose,
  onSelect,
  contextSlug = "general",
  title = "Select from Media Library",
}: MediaPickerModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className={`${dash.modalOverlay} dashboard-modal-overlay--elevated`}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`${GLASS_CHROME_FRAME_CLASS} dashboard-modal dashboard-modal--picker media-picker-modal`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-picker-title"
        aria-describedby="media-picker-desc"
      >
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-px block ${GLASS_INNER_SURFACE}`}
        />
        <div className={`${dash.modalBody} dashboard-modal__body--picker`}>
          <DashboardModalHeader
            section="Media library"
            title={title}
            description="Browse uploads or public folders, then click an image to select it."
            onClose={onClose}
            titleId="media-picker-title"
            descriptionId="media-picker-desc"
          />

          <div className="media-picker-modal__content">
            <MediaLibraryManager
              key={open ? "open" : "closed"}
              mode="picker"
              contextSlug={contextSlug}
              initialSource="static"
              onPick={(url, meta) => {
                onSelect(url, meta);
                onClose();
              }}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
