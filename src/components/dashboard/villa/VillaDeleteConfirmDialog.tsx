"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { createPortal } from "react-dom";
import { dash } from "@/lib/dashboard/dashboardClasses";
import { DashboardModalHeader } from "../ui/DashboardModalHeader";

type VillaDeleteConfirmDialogProps = {
  open: boolean;
  propertyName: string;
  slug: string;
  busy?: boolean;
  error?: string | null;
  onConfirm: (confirmedName: string) => void;
  onCancel: () => void;
};

export function VillaDeleteConfirmDialog({
  open,
  propertyName,
  slug,
  busy,
  error,
  onConfirm,
  onCancel,
}: VillaDeleteConfirmDialogProps) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (!open) {
      setTyped("");
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, busy, onCancel]);

  const nameMatches = typed.trim() === propertyName.trim();
  const canDelete = nameMatches && !busy;

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className={dash.modalOverlay} onClick={busy ? undefined : onCancel} role="presentation">
      <div
        className={`${dash.modal} dash-confirm-dialog dash-delete-confirm`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="villa-delete-title"
      >
        <div className={`${dash.modalFrame} flex min-h-0 flex-col`}>
          <DashboardModalHeader
            title={`Delete property: ${propertyName}`}
            onClose={() => {
              if (!busy) onCancel();
            }}
            titleId="villa-delete-title"
          />
          <div className={dash.modalBody}>
            <div className={dash.formNoticeDanger}>
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
              <span>
                This operation will delete the property and remove it from the
                public website and dashboard.
              </span>
            </div>

            <p className="dash-confirm-dialog__message mt-4">
              Are you sure you want to delete this property?
            </p>
            <p className="mt-2 font-mono text-xs text-white/45">{slug}</p>

            <label className="mt-5 block font-manrope text-sm text-white/70">
              Please enter the property name to continue.
              <input
                type="text"
                value={typed}
                disabled={busy}
                autoComplete="off"
                autoFocus
                placeholder="Enter property name"
                onChange={(e) => setTyped(e.target.value)}
                className={`${dash.inputCompact} mt-2 w-full`}
              />
            </label>

            {error ? (
              <p className="mt-3 font-manrope text-sm text-red-400">{error}</p>
            ) : null}

            <div className="dash-confirm-dialog__actions">
              <button
                type="button"
                onClick={onCancel}
                disabled={busy}
                className={`${dash.btn} ${dash.btnText} ${dash.btnDense}`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!canDelete}
                onClick={() => onConfirm(typed.trim())}
                className={`${dash.btn} ${dash.btnDense} ${
                  canDelete
                    ? "border-red-400/50 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                    : "cursor-not-allowed border-white/10 bg-white/5 text-white/30"
                }`}
              >
                {busy ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
