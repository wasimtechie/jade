"use client";

import React, { useMemo, useState } from "react";
import { Check } from "lucide-react";
import EnquirySingleDatePicker from "@/components/enquiry/EnquirySingleDatePicker";
import {
  JADE_FORM_WARN,
  JADE_OVERLAY_FORM_STACK_CLASS,
} from "@/lib/jadeFormTokens";
import { sanitizePhoneDigitsInput } from "@/lib/phoneNumberInput";
import {
  validateEmail,
  validateFullName,
  validatePhone,
} from "@/lib/leadFormValidation";
import {
  JadeFloatingField,
  JadeFloatingTextarea,
} from "@/components/ui/form";
import JadeFormFieldError from "@/components/ui/form/JadeFormFieldError";
import PrimaryButton from "@/components/PrimaryButton";
import { VILLA_DETAIL_SPACING } from "@/components/villa/villaDetailSpacing";
import VenueEnquiryLegalFootnote from "@/components/experience/VenueEnquiryLegalFootnote";

const vd = VILLA_DETAIL_SPACING;

type Props = {
  onSuccess: () => void;
  onClosePrivacyNav?: () => void;
};

const SERVICES = [
  "Décor & Styling",
  "Catering",
  "Photography",
  "Music & Entertainment",
  "Not decided yet",
];

const EVENTS = [
  "Mehendi",
  "Haldi",
  "Sangeet",
  "Cocktail Night",
  "Bachelor / Bachelorette",
  "Pre-Wedding Shoot",
];

const SETTINGS = ["Outdoor", "Indoor", "Combination of both"];

function ToggleSet({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: Set<string>;
  onToggle: (s: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {options.map((s) => {
        const checked = selected.has(s);
        return (
          <label
            key={s}
            className="flex items-center gap-2.5 cursor-pointer group text-left min-h-[1.5rem]"
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggle(s)}
              className="sr-only"
            />
            <div
              className="w-5 h-5 shrink-0 flex items-center justify-center transition-all"
              style={{
                border: checked ? "2px solid #EFCD62" : "1.5px solid rgba(255,255,255,0.45)",
                backgroundColor: checked ? "#EFCD62" : "transparent",
              }}
            >
              {checked && (
                <Check className="w-3 h-3 text-black" strokeWidth={3.5} />
              )}
            </div>
            <span className={vd.formOptionLabel}>
              {s}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export default function WeddingVenueEnquiryForm({
  onSuccess,
  onClosePrivacyNav,
}: Props) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [services, setServices] = useState<Set<string>>(new Set());
  const [events, setEvents] = useState<Set<string>>(new Set());
  const [setting, setSetting] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const toggle = (prev: Set<string>, v: string) => {
    const next = new Set(prev);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    return next;
  };

  const fieldErrors = useMemo(() => {
    const errs: Record<string, string | undefined> = {};
    errs.fullName = validateFullName(fullName);
    errs.phone = validatePhone(phone);
    errs.email = validateEmail(email);
    if (!eventDate) errs.eventDate = "Please choose an event date.";
    return errs;
  }, [fullName, phone, email, eventDate]);

  const showErr = (key: string) =>
    attemptedSubmit && Boolean(fieldErrors[key]);

  const isValid = !Object.values(fieldErrors).some(Boolean);

  const formatEventDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  return (
    <form
      className={JADE_OVERLAY_FORM_STACK_CLASS}
      onSubmit={async (e) => {
        e.preventDefault();
        setAttemptedSubmit(true);
        if (!isValid) return;
        setSubmitting(true);
        setSubmitError(null);
        try {
          const res = await fetch("/api/leads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              source: "wedding_enquiry",
              payload: {
                fullName: fullName.trim(),
                phone: phone.trim(),
                email: email.trim(),
                eventDate: eventDate ? formatEventDate(eventDate) : "",
                services: Array.from(services),
                events: Array.from(events),
                setting: Array.from(setting),
                notes: notes.trim(),
              },
            }),
          });
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          if (!res.ok) {
            throw new Error(
              data.error || "Something went wrong. Please try again.",
            );
          }
          onSuccess();
        } catch (err) {
          setSubmitError(
            err instanceof Error ? err.message : "Unable to submit enquiry.",
          );
        } finally {
          setSubmitting(false);
        }
      }}
      noValidate
    >
      {submitError ? (
        <p
          className="text-gh-label font-manrope"
          style={{ color: JADE_FORM_WARN }}
          role="alert"
        >
          {submitError}
        </p>
      ) : null}

      <JadeFloatingField
        id="wedding-fullName"
        label="Full Name"
        value={fullName}
        onChange={setFullName}
        theme="experienceCharcoal"
        invalid={Boolean(fieldErrors.fullName)}
        showError={showErr("fullName")}
        errorMessage={fieldErrors.fullName}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <JadeFloatingField
          id="wedding-phone"
          label="Phone Number"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          value={phone}
          onChange={(v) => setPhone(sanitizePhoneDigitsInput(v))}
          theme="experienceCharcoal"
          invalid={Boolean(fieldErrors.phone)}
          showError={showErr("phone")}
          errorMessage={fieldErrors.phone}
        />
        <JadeFloatingField
          id="wedding-email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          theme="experienceCharcoal"
          invalid={Boolean(fieldErrors.email)}
          showError={showErr("email")}
          errorMessage={fieldErrors.email}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <EnquirySingleDatePicker
          label="Event date"
          theme="experienceCharcoal"
          value={eventDate}
          onChange={setEventDate}
          invalid={showErr("eventDate") && Boolean(fieldErrors.eventDate)}
        />
        {showErr("eventDate") && fieldErrors.eventDate ? (
          <JadeFormFieldError
            id="wedding-date-err"
            message={fieldErrors.eventDate}
          />
        ) : null}
      </div>

      <div className="space-y-2.5">
        <p className={vd.formGroupLabel}>
          Services Required
        </p>
        <ToggleSet
          options={SERVICES}
          selected={services}
          onToggle={(s) => setServices((prev) => toggle(prev, s))}
        />
      </div>

      <div className="space-y-2.5">
        <p className={vd.formGroupLabel}>
          Events You&apos;re Planning
        </p>
        <ToggleSet
          options={EVENTS}
          selected={events}
          onToggle={(s) => setEvents((prev) => toggle(prev, s))}
        />
      </div>

      <div className="space-y-2.5">
        <p className={vd.formGroupLabel}>
          Preferred Setting
        </p>
        <ToggleSet
          options={SETTINGS}
          selected={setting}
          onToggle={(s) => setSetting((prev) => toggle(prev, s))}
        />
      </div>

      <JadeFloatingTextarea
        id="wedding-notes"
        label="Additional requests"
        required={false}
        value={notes}
        onChange={setNotes}
        theme="experienceCharcoal"
      />

      <VenueEnquiryLegalFootnote onClosePrivacyNav={onClosePrivacyNav} />

      <PrimaryButton
        type="submit"
        width="form"
        withArrow={false}
        disabled={submitting}
      >
        {submitting ? "SENDING…" : "CONTACT US"}
      </PrimaryButton>
    </form>
  );
}
