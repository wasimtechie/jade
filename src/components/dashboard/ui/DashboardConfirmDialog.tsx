"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { dash } from "@/lib/dashboard/dashboardClasses";
import { DashboardModalHeader } from "./DashboardModalHeader";

type DashboardConfirmDialogProps = {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DashboardConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  danger,
  busy,
  onConfirm,
  onCancel,
}: DashboardConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onCancel]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className={dash.modalOverlay} onClick={onCancel} role="presentation">
      <div
        className={`${dash.modal} dash-confirm-dialog`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dash-confirm-title"
      >
        <div className={`${dash.modalFrame} flex min-h-0 flex-col`}>
          <DashboardModalHeader
            title={title}
            onClose={onCancel}
            titleId="dash-confirm-title"
          />
          <div className={dash.modalBody}>
          <p className="dash-confirm-dialog__message">{message}</p>
          <div className="dash-confirm-dialog__actions">
            <button
              type="button"
              onClick={onCancel}
              className={`${dash.btn} ${dash.btnText} ${dash.btnDense}`}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onConfirm}
              className={`${dash.btn} ${dash.btnDense} ${
                danger
                  ? "border-red-400/50 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                  : dash.btnAccent
              }`}
            >
              {busy ? "Working…" : confirmLabel}
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
