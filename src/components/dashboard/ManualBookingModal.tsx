"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  GLASS_CHROME_FRAME_CLASS,
  GLASS_INNER_SURFACE,
} from "@/lib/glassChrome";
import { dash } from "@/lib/dashboard/dashboardClasses";
import {
  normalizePhone,
  useDashboardForm,
  validateManualBooking,
} from "@/lib/dashboard/dashboardFormValidation";
import {
  DashFloatingDate,
  DashFloatingField,
  DashFloatingNumber,
  DashFloatingSelect,
  DashFloatingTextarea,
  DashFormActionBar,
  DashFormShell,
} from "@/components/dashboard/form";
import { DashboardModalHeader } from "./ui/DashboardModalHeader";
import { addDays, todayIST } from "@/lib/bookingDates";
import type { VillaOption } from "./BlockFormModal";

type ManualBookingFormProps = {
  villas: VillaOption[];
  onClose: () => void;
  onSubmit: (values: {
    villaSlug: string;
    checkIn: string;
    checkOut: string;
    fullName: string;
    email: string;
    phone: string;
    guests: number;
    externalPaymentRef: string;
    balanceDueDate: string;
    notes: string;
  }) => Promise<string | null>;
};

export function ManualBookingModal({
  villas,
  onClose,
  onSubmit,
}: ManualBookingFormProps) {
  const [villaSlug, setVillaSlug] = useState(villas[0]?.slug ?? "");
  const [checkIn, setCheckIn] = useState(todayIST());
  const [checkOut, setCheckOut] = useState(addDays(todayIST(), 1));
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState(4);
  const [externalPaymentRef, setExternalPaymentRef] = useState("");
  const [balanceDueDate, setBalanceDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedVilla = useMemo(
    () => villas.find((v) => v.slug === villaSlug),
    [villas, villaSlug],
  );
  const maxGuests = selectedVilla?.stayMaxPax ?? 500;

  const {
    fieldErrors,
    showFieldError,
    touch,
    validateField,
    runSubmit,
  } = useDashboardForm({
    validate: validateManualBooking,
  });

  const villaOptions = useMemo(
    () => villas.map((v) => ({ value: v.slug, label: v.name })),
    [villas],
  );

  const getValues = () => ({
    villaSlug,
    checkIn,
    checkOut,
    fullName: fullName.trim(),
    email: email.trim(),
    phone: normalizePhone(phone),
    guests,
    notes: notes.trim(),
    maxGuests,
  });

  const blur = (key: keyof ReturnType<typeof getValues>) => {
    touch(key);
    validateField(key, getValues());
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (guests > maxGuests) setGuests(maxGuests);
  }, [maxGuests, guests]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = getValues();
    if (!runSubmit(trimmed)) {
      setError(null);
      return;
    }
    setError(null);
    setSaving(true);
    const err = await onSubmit({
      ...trimmed,
      externalPaymentRef: externalPaymentRef.trim(),
      balanceDueDate: balanceDueDate.trim(),
      notes: trimmed.notes,
    });
    setSaving(false);
    if (err) setError(err);
    else onClose();
  };

  const guestsLabel =
    maxGuests < 500 ? `Guests (max ${maxGuests})` : "Guests";

  return (
    <div className={dash.modalOverlay} onClick={onClose} role="presentation">
      <div
        className={`${GLASS_CHROME_FRAME_CLASS} ${dash.modalWide}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="manual-booking-title"
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
            section="Calendar"
            title="Reserve dates"
            description="Payment is collected externally. OTAs are blocked as soon as you place the hold."
            onClose={onClose}
            titleId="manual-booking-title"
          />
          <DashFormShell>
            <div
              className="flex items-start gap-3 border border-amber-400/30 bg-amber-500/10 px-4 py-3 font-manrope text-sm text-amber-100"
              role="status"
            >
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-300"
                aria-hidden
              />
              <p>
                These dates block Airbnb and Booking.com immediately. Confirm or
                cancel from the booking folio after external payment is settled.
              </p>
            </div>

            <DashFloatingSelect
              id="villaSlug"
              label="Villa"
              value={villaSlug}
              optionItems={villaOptions}
              onChange={setVillaSlug}
              onBlur={() => blur("villaSlug")}
              invalid={Boolean(fieldErrors.villaSlug)}
              showError={showFieldError("villaSlug")}
              errorMessage={fieldErrors.villaSlug}
              required
            />

            <div className={dash.formGrid2}>
              <DashFloatingDate
                id="checkIn"
                label="Check-in"
                value={checkIn}
                min={todayIST()}
                onChange={(value) => {
                  setCheckIn(value);
                  if (value >= checkOut) setCheckOut(addDays(value, 1));
                }}
                onBlur={() => blur("checkIn")}
                invalid={Boolean(fieldErrors.checkIn)}
                showError={showFieldError("checkIn")}
                errorMessage={fieldErrors.checkIn}
                required
              />
              <DashFloatingDate
                id="checkOut"
                label="Check-out"
                value={checkOut}
                min={addDays(checkIn, 1)}
                onChange={setCheckOut}
                onBlur={() => blur("checkOut")}
                invalid={Boolean(fieldErrors.checkOut)}
                showError={showFieldError("checkOut")}
                errorMessage={fieldErrors.checkOut}
                required
              />
            </div>

            <DashFloatingField
              id="fullName"
              label="Guest name"
              value={fullName}
              onChange={setFullName}
              onBlur={() => blur("fullName")}
              autoComplete="name"
              invalid={Boolean(fieldErrors.fullName)}
              showError={showFieldError("fullName")}
              errorMessage={fieldErrors.fullName}
              required
            />

            <div className={dash.formGrid2}>
              <DashFloatingField
                id="email"
                label="Email (for booking confirmation)"
                type="email"
                value={email}
                onChange={setEmail}
                onBlur={() => blur("email")}
                autoComplete="email"
                invalid={Boolean(fieldErrors.email)}
                showError={showFieldError("email")}
                errorMessage={fieldErrors.email}
                required
              />
              <DashFloatingField
                id="phone"
                label="Phone"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={setPhone}
                onBlur={() => blur("phone")}
                autoComplete="tel"
                invalid={Boolean(fieldErrors.phone)}
                showError={showFieldError("phone")}
                errorMessage={fieldErrors.phone}
                required
              />
            </div>

            <DashFloatingNumber
              id="guests"
              label={guestsLabel}
              value={String(guests)}
              onChange={(value) => {
                const n = Number(value);
                setGuests(Number.isFinite(n) ? n : 1);
              }}
              onBlur={() => blur("guests")}
              invalid={Boolean(fieldErrors.guests)}
              showError={showFieldError("guests")}
              errorMessage={fieldErrors.guests}
              required
            />

            <div className={dash.formGrid2}>
              <DashFloatingField
                id="externalPaymentRef"
                label="External payment ref (optional)"
                value={externalPaymentRef}
                onChange={setExternalPaymentRef}
              />
              <DashFloatingDate
                id="balanceDueDate"
                label="Balance due date (optional)"
                value={balanceDueDate}
                min={todayIST()}
                onChange={setBalanceDueDate}
              />
            </div>

            <DashFloatingTextarea
              id="notes"
              label="Notes"
              value={notes}
              onChange={setNotes}
              onBlur={() => blur("notes")}
              invalid={Boolean(fieldErrors.notes)}
              showError={showFieldError("notes")}
              errorMessage={fieldErrors.notes}
            />

            {error && (
              <p className={dash.errorText} role="alert">
                {error}
              </p>
            )}
          </DashFormShell>

          <DashFormActionBar>
            <button
              type="submit"
              disabled={saving}
              className={`${dash.btn} ${dash.btnAccent}`}
            >
              {saving ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-label="Saving" />
              ) : (
                "Place on hold"
              )}
            </button>
          </DashFormActionBar>
        </form>
      </div>
    </div>
  );
}
