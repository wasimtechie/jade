"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  GLASS_CHROME_FRAME_CLASS,
  GLASS_INNER_SURFACE,
} from "@/lib/glassChrome";
import { dash } from "@/lib/dashboard/dashboardClasses";
import {
  useDashboardForm,
  validatePasswordReset,
} from "@/lib/dashboard/dashboardFormValidation";
import {
  DashFloatingField,
  DashFormActionBar,
  DashFormShell,
} from "@/components/dashboard/form";
import { DashboardModalHeader } from "./ui/DashboardModalHeader";

type PasswordResetModalProps = {
  userName: string;
  userEmail: string;
  onClose: () => void;
  onSubmit: (password: string) => Promise<string | null>;
};

export function PasswordResetModal({
  userName,
  userEmail,
  onClose,
  onSubmit,
}: PasswordResetModalProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    fieldErrors,
    showFieldError,
    touch,
    validateField,
    runSubmit,
  } = useDashboardForm({
    validate: validatePasswordReset,
  });

  const getValues = () => ({ password, confirmPassword });

  const blur = (key: "password" | "confirmPassword") => {
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
    if (!runSubmit(getValues())) {
      setError(null);
      return;
    }
    setError(null);
    setSaving(true);
    const err = await onSubmit(password);
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
            section="Staff"
            title="Reset password"
            description={`Set a new password for ${userName} (${userEmail})`}
            onClose={onClose}
          />
          <DashFormShell>
            <DashFloatingField
              id="password"
              label="New password"
              type="password"
              value={password}
              onChange={setPassword}
              onBlur={() => blur("password")}
              invalid={Boolean(fieldErrors.password)}
              showError={showFieldError("password")}
              errorMessage={fieldErrors.password}
              required
              autoComplete="new-password"
            />
            <DashFloatingField
              id="confirmPassword"
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              onBlur={() => blur("confirmPassword")}
              invalid={Boolean(fieldErrors.confirmPassword)}
              showError={showFieldError("confirmPassword")}
              errorMessage={fieldErrors.confirmPassword}
              required
              autoComplete="new-password"
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
                "Update password"
              )}
            </button>
          </DashFormActionBar>
        </form>
      </div>
    </div>
  );
}
