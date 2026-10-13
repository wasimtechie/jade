"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  GLASS_CHROME_FRAME_CLASS,
  GLASS_INNER_SURFACE,
} from "@/lib/glassChrome";
import { dash } from "@/lib/dashboard/dashboardClasses";
import {
  useDashboardForm,
  validateManualBlock,
} from "@/lib/dashboard/dashboardFormValidation";
import {
  DashFloatingDate,
  DashFloatingField,
  DashFloatingSelect,
  DashFormActionBar,
  DashFormShell,
} from "@/components/dashboard/form";
import { DashboardModalHeader } from "./ui/DashboardModalHeader";
import { addDays, todayIST } from "@/lib/bookingDates";

export type VillaOption = {
  slug: string;
  name: string;
  stayMaxPax?: number;
};

export type BlockFormValues = {
  villaSlug: string;
  checkIn: string;
  checkOut: string;
  reason: string;
};

type BlockFormModalProps = {
  villas: VillaOption[];
  onClose: () => void;
  onSubmit: (values: BlockFormValues) => Promise<string | null>;
  initialValues?: Partial<BlockFormValues>;
  title?: string;
};

export function BlockFormModal({
  villas,
  onClose,
  onSubmit,
  initialValues,
  title = "New manual block",
}: BlockFormModalProps) {
  const [villaSlug, setVillaSlug] = useState(
    initialValues?.villaSlug ?? villas[0]?.slug ?? "",
  );
  const [checkIn, setCheckIn] = useState(
    initialValues?.checkIn ?? todayIST(),
  );
  const [checkOut, setCheckOut] = useState(
    initialValues?.checkOut ?? addDays(initialValues?.checkIn ?? todayIST(), 1),
  );
  const [reason, setReason] = useState(initialValues?.reason ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    fieldErrors,
    showFieldError,
    touch,
    validateField,
    runSubmit,
  } = useDashboardForm({
    validate: validateManualBlock,
  });

  const villaOptions = useMemo(
    () => villas.map((v) => ({ value: v.slug, label: v.name })),
    [villas],
  );

  const getValues = () => ({
    villaSlug,
    checkIn,
    checkOut,
    reason: reason.trim(),
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const values = getValues();
    if (!runSubmit(values)) {
      setError(null);
      return;
    }
    setError(null);
    setSaving(true);
    const err = await onSubmit(values);
    setSaving(false);
    if (err) setError(err);
    else onClose();
  };

  return (
    <div className={dash.modalOverlay} onClick={onClose}>
      <div
        className={`${GLASS_CHROME_FRAME_CLASS} ${dash.modal}`}
        onClick={(e) => e.stopPropagation()}
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
            section="Operations"
            title={title}
            onClose={onClose}
          />
          <DashFormShell>
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
                onChange={setCheckIn}
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
                onChange={setCheckOut}
                onBlur={() => blur("checkOut")}
                invalid={Boolean(fieldErrors.checkOut)}
                showError={showFieldError("checkOut")}
                errorMessage={fieldErrors.checkOut}
                required
              />
            </div>

            <DashFloatingField
              id="reason"
              label="Reason (optional)"
              value={reason}
              onChange={setReason}
              onBlur={() => blur("reason")}
              invalid={Boolean(fieldErrors.reason)}
              showError={showFieldError("reason")}
              errorMessage={fieldErrors.reason}
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
              disabled={saving || !villaSlug}
              className={`${dash.btn} ${dash.btnAccent} ${
                saving ? "cursor-not-allowed opacity-40" : ""
              }`}
            >
              {saving ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-label="Saving" />
              ) : (
                "Create block"
              )}
            </button>
          </DashFormActionBar>
        </form>
      </div>
    </div>
  );
}
