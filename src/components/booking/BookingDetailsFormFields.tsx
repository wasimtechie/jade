"use client";

import { useMemo, useState } from "react";
import type { UserDetails } from "@/lib/types";
import { bookingDetailsFieldErrors } from "@/lib/bookingDetailsValidation";
import { sanitizePhoneDigitsInput } from "@/lib/phoneNumberInput";
import {
  JadeFloatingField,
  JadeFloatingTextarea,
} from "@/components/ui/form";

type TouchedKey = keyof UserDetails;

const initialTouched = (): Record<TouchedKey, boolean> => ({
  fullName: false,
  phone: false,
  email: false,
  notes: false,
});

export default function BookingDetailsFormFields({
  details,
  setDetails,
  forceShowErrors,
  idPrefix = "booking",
}: {
  details: UserDetails;
  setDetails: (d: UserDetails) => void;
  forceShowErrors: boolean;
  idPrefix?: string;
}) {
  const [touched, setTouched] = useState(initialTouched);

  const errors = useMemo(
    () => bookingDetailsFieldErrors(details),
    [details],
  );

  const show = (key: TouchedKey) =>
    Boolean(errors[key]) && (forceShowErrors || touched[key]);

  const markTouched = (key: TouchedKey) =>
    setTouched((t) => ({ ...t, [key]: true }));

  const fieldProps = (key: TouchedKey) => ({
    invalid: Boolean(errors[key]),
    showError: show(key),
    errorMessage: show(key) ? errors[key] : undefined,
    onBlur: () => markTouched(key),
    theme: "book" as const,
  });

  return (
    <div className="space-y-4">
      <JadeFloatingField
        id={`${idPrefix}-fullName`}
        name="fullName"
        label="Full Name"
        autoComplete="name"
        value={details.fullName}
        onChange={(v) => setDetails({ ...details, fullName: v })}
        {...fieldProps("fullName")}
      />

      <JadeFloatingField
        id={`${idPrefix}-phone`}
        name="phone"
        label="Phone Number"
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        value={details.phone}
        onChange={(v) =>
          setDetails({
            ...details,
            phone: sanitizePhoneDigitsInput(v),
          })
        }
        {...fieldProps("phone")}
      />

      <JadeFloatingField
        id={`${idPrefix}-email`}
        name="email"
        label="Email (for booking confirmation)"
        type="email"
        autoComplete="email"
        value={details.email}
        onChange={(v) => setDetails({ ...details, email: v })}
        {...fieldProps("email")}
      />

      <JadeFloatingTextarea
        id={`${idPrefix}-notes`}
        name="notes"
        label="Additional requests (optional)"
        value={details.notes}
        onChange={(v) => setDetails({ ...details, notes: v })}
        required={false}
        {...fieldProps("notes")}
      />
    </div>
  );
}
