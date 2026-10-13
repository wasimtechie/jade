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
  validateUserForm,
} from "@/lib/dashboard/dashboardFormValidation";
import {
  DashFloatingField,
  DashFloatingSelect,
  DashFormActionBar,
  DashFormShell,
} from "@/components/dashboard/form";
import { DashboardModalHeader } from "./ui/DashboardModalHeader";
import { ALL_ROLES, ROLE_LABELS, type Role } from "@/lib/auth/permissions";

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "suspended";
};

export type UserFormValues = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

type UserFormModalProps = {
  mode: "create" | "edit";
  initial?: ManagedUser | null;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => Promise<string | null>;
};

type UserFormValidation = {
  email: string;
  password: string;
  confirmPassword?: string;
};

export function UserFormModal({
  mode,
  initial,
  onClose,
  onSubmit,
}: UserFormModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>(initial?.role ?? "staff");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    fieldErrors,
    showFieldError,
    touch,
    validateField,
    runSubmit,
  } = useDashboardForm<UserFormValidation>({
    validate: (values) =>
      validateUserForm({
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        isCreate: mode === "create",
      }),
  });

  const getValues = (): UserFormValidation => ({
    email,
    password,
    confirmPassword: mode === "edit" && password ? confirmPassword : undefined,
  });

  const blur = (key: "email" | "password" | "confirmPassword") => {
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
    if (name.trim().length < 2) {
      setError("Enter the user's full name (at least 2 characters)");
      return;
    }
    setError(null);
    setSaving(true);
    const err = await onSubmit({ name, email, password, role });
    setSaving(false);
    if (err) setError(err);
    else onClose();
  };

  const roleOptions = ALL_ROLES.map((r) => ({
    value: r,
    label: ROLE_LABELS[r],
  }));

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
            title={mode === "create" ? "Create user" : "Edit user"}
            onClose={onClose}
          />
          <DashFormShell>
            <DashFloatingField
              id="name"
              label="Full name"
              value={name}
              onChange={setName}
              required
            />

            <DashFloatingField
              id="email"
              label="Email ID"
              type="email"
              value={email}
              onChange={setEmail}
              onBlur={() => blur("email")}
              invalid={Boolean(fieldErrors.email)}
              showError={showFieldError("email")}
              errorMessage={fieldErrors.email}
              required
              disabled={mode === "edit"}
              autoComplete="email"
            />
            {mode === "edit" && (
              <p className="font-manrope text-[length:var(--fs-desc)] text-white/35">
                Email cannot be changed after creation.
              </p>
            )}

            <DashFloatingField
              id="password"
              label={mode === "create" ? "Password" : "New password (optional)"}
              type="password"
              value={password}
              onChange={setPassword}
              onBlur={() => blur("password")}
              invalid={Boolean(fieldErrors.password)}
              showError={showFieldError("password")}
              errorMessage={fieldErrors.password}
              required={mode === "create"}
              autoComplete={mode === "create" ? "new-password" : "off"}
            />

            {mode === "edit" && password.length > 0 && (
              <DashFloatingField
                id="confirmPassword"
                label="Confirm new password"
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
            )}

            <DashFloatingSelect
              id="role"
              label="Role"
              value={role}
              optionItems={roleOptions}
              onChange={(value) => setRole(value as Role)}
              required
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
              ) : mode === "create" ? (
                "Create user"
              ) : (
                "Save changes"
              )}
            </button>
          </DashFormActionBar>
        </form>
      </div>
    </div>
  );
}
