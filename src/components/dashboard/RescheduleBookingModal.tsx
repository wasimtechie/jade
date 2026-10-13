"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  GLASS_CHROME_FRAME_CLASS,
  GLASS_INNER_SURFACE,
} from "@/lib/glassChrome";
import { dash } from "@/lib/dashboard/dashboardClasses";
import { dashboardFetch } from "@/lib/dashboard/dashboardFetch";
import { addDays } from "@/lib/bookingDates";
import { nightCount } from "@/lib/bookingDates";
import type { BookingRecord } from "@/lib/bookings/store";
import type { ModifyBookingPreview } from "@/lib/bookings/store";
import { formatPaise } from "@/lib/money";
import {
  DashFloatingDate,
  DashFormActionBar,
  DashFormShell,
} from "@/components/dashboard/form";
import { DashboardModalHeader } from "./ui/DashboardModalHeader";

type RescheduleBookingModalProps = {
  booking: BookingRecord & { villaName?: string };
  onClose: () => void;
  onSuccess: () => void;
};

function fmtDate(dateStr: string): string {
  const d = new Date(`${dateStr.split("T")[0]}T00:00:00.000Z`);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function RescheduleBookingModal({
  booking,
  onClose,
  onSuccess,
}: RescheduleBookingModalProps) {
  const [checkIn, setCheckIn] = useState(booking.checkIn);
  const [checkOut, setCheckOut] = useState(booking.checkOut);
  const [preview, setPreview] = useState<ModifyBookingPreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDayOut = booking.bookingType === "day_out";

  const fetchPreview = useCallback(async () => {
    if (checkOut <= checkIn && !isDayOut) {
      setPreview(null);
      setPreviewError("Check-out must be after check-in");
      return;
    }

    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const res = await dashboardFetch(
        `/api/dashboard/bookings/${booking.id}/modify-preview`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checkIn, checkOut }),
        },
      );
      const data = (await res.json().catch(() => ({}))) as ModifyBookingPreview & {
        error?: string;
        conflictingDate?: string;
      };
      if (!res.ok) {
        if (data.current && data.proposed) {
          setPreview(data);
        } else {
          setPreview(null);
        }
        setPreviewError(
          data.error ??
            (data.conflictingDate
              ? `Conflict on ${fmtDate(data.conflictingDate)}`
              : "Unable to preview new pricing"),
        );
        return;
      }
      setPreview(data);
      setPreviewError(null);
    } catch {
      setPreviewError("Failed to load pricing preview");
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  }, [booking.id, checkIn, checkOut, isDayOut]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void fetchPreview();
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fetchPreview]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!preview?.available || preview.unchanged) {
      onClose();
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const res = await dashboardFetch(`/api/dashboard/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "modify_dates", checkIn, checkOut }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        paymentWarning?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Failed to update dates");
        return;
      }
      onSuccess();
      onClose();
    } catch {
      setError("Failed to update dates");
    } finally {
      setSaving(false);
    }
  };

  const proposedNights = preview
    ? nightCount(preview.proposed.checkIn, preview.proposed.checkOut)
    : nightCount(checkIn, checkOut);
  const canConfirm =
    preview?.available && !preview.unchanged && !previewLoading && !previewError;

  return (
    <div className={dash.modalOverlay} onClick={onClose} role="presentation">
      <div
        className={`${GLASS_CHROME_FRAME_CLASS} ${dash.modalWide}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reschedule-booking-title"
      >
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-px block ${GLASS_INNER_SURFACE}`}
        />
        <form
          onSubmit={handleSubmit}
          className={`${dash.modalFrame} flex min-h-0 flex-col`}
          noValidate
        >
          <DashboardModalHeader
            section="Booking folio"
            title="Change dates"
            description={
              booking.villaName
                ? `${booking.villaName} · ${booking.bookingToken}`
                : booking.bookingToken
            }
            onClose={onClose}
            titleId="reschedule-booking-title"
          />
          <DashFormShell>
            <div className={dash.formGrid2}>
              <DashFloatingDate
                id="modifyCheckIn"
                label="Check-in"
                value={checkIn}
                onChange={(value) => {
                  setCheckIn(value);
                  if (!isDayOut && value >= checkOut) {
                    setCheckOut(addDays(value, 1));
                  }
                }}
                required
              />
              {!isDayOut && (
                <DashFloatingDate
                  id="modifyCheckOut"
                  label="Check-out"
                  value={checkOut}
                  min={addDays(checkIn, 1)}
                  onChange={setCheckOut}
                  required
                />
              )}
            </div>

            {isDayOut && (
              <p className="font-manrope text-sm text-white/55">
                Day-out bookings use a single date; check-out is set automatically.
              </p>
            )}

            <div
              className="rounded border border-white/10 bg-white/5 p-4 font-manrope text-sm"
              aria-live="polite"
              aria-atomic="true"
            >
              {previewLoading && (
                <p className="inline-flex items-center gap-2 text-white/60">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Calculating new pricing…
                </p>
              )}
              {!previewLoading && previewError && (
                <p className="text-red-300">{previewError}</p>
              )}
              {!previewLoading && preview && !previewError && (
                <div className="space-y-3 text-white/80">
                  <p>
                    <span className="text-white/50">Current: </span>
                    {fmtDate(preview.current.checkIn)} →{" "}
                    {fmtDate(preview.current.checkOut)} (
                    {formatPaise(preview.current.pricing.totalPaise)})
                  </p>
                  <p>
                    <span className="text-white/50">Proposed: </span>
                    {fmtDate(preview.proposed.checkIn)} →{" "}
                    {fmtDate(preview.proposed.checkOut)} · {proposedNights}{" "}
                    night{proposedNights === 1 ? "" : "s"} (
                    {formatPaise(preview.proposed.pricing.totalPaise)})
                  </p>
                  <p
                    className={
                      preview.deltaPaise >= 0 ? "text-amber-200" : "text-emerald-300"
                    }
                  >
                    Price change:{" "}
                    {preview.deltaPaise >= 0 ? "+" : ""}
                    {formatPaise(preview.deltaPaise)}
                  </p>
                  <p>
                    <span className="text-white/50">New balance due: </span>
                    {formatPaise(preview.paymentPreview.balancePaise)}
                  </p>
                  {preview.paymentWarning && (
                    <div
                      className="flex items-start gap-2 border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-amber-100"
                      role="status"
                    >
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                      <span>{preview.paymentWarning}</span>
                    </div>
                  )}
                  {preview.axisWillSync && (
                    <p className="text-white/55">
                      Axis Rooms will open the old dates and close the new dates on
                      OTAs after you confirm.
                    </p>
                  )}
                  {preview.unchanged && (
                    <p className="text-white/55">Dates unchanged from current booking.</p>
                  )}
                </div>
              )}
            </div>

            {error && (
              <p className="font-manrope text-sm text-red-300" role="alert">
                {error}
              </p>
            )}
          </DashFormShell>

          <DashFormActionBar>
              <button
                type="button"
                onClick={onClose}
                className={`${dash.btn} ${dash.btnGhost}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || (!preview?.unchanged && !canConfirm)}
                className={`${dash.btn} ${dash.btnAccent}`}
              >
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-label="Saving" />
                ) : preview?.unchanged ? (
                  "Close"
                ) : (
                  "Confirm new dates"
                )}
              </button>
            </DashFormActionBar>
        </form>
      </div>
    </div>
  );
}
