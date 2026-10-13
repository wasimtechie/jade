"use client";

import { useCallback, useState } from "react";
import type { ZodError } from "zod";
import {
  validateManualBlock,
  validateManualBooking,
  type FieldErrors,
} from "./formValidation";

export type { FieldErrors };

export {
  validateManualBlock,
  validateManualBooking,
  normalizePhone,
} from "./formValidation";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function mapZodFlattenToFieldErrors(error: ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export function mergeFieldErrors(
  ...sources: Array<FieldErrors | undefined>
): FieldErrors {
  return Object.assign({}, ...sources.filter(Boolean));
}

export function validateLogin(input: {
  email: string;
  password: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  const email = input.email.trim().toLowerCase();
  if (!email) errors.email = "Email is required";
  else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address";
  if (!input.password) errors.password = "Password is required";
  return errors;
}

export function validateUserForm(input: {
  email: string;
  password?: string;
  confirmPassword?: string;
  isCreate: boolean;
}): FieldErrors {
  const errors: FieldErrors = {};
  const email = input.email.trim().toLowerCase();
  if (!email) errors.email = "Email is required";
  else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address";

  if (input.isCreate || input.password) {
    const pw = input.password ?? "";
    if (pw.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) {
      errors.password = "Password must include letters and numbers";
    }
    if (input.confirmPassword !== undefined && pw !== input.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
  }
  return errors;
}

export function validatePasswordReset(input: {
  password: string;
  confirmPassword: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (input.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }
  if (input.password !== input.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }
  return errors;
}

export function validateBlogEditor(input: {
  title: string;
  slug: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.title.trim()) errors.title = "Title is required";
  const slug = input.slug.trim();
  if (!slug) errors.slug = "Slug is required";
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    errors.slug = "Use lowercase letters, numbers, and hyphens only";
  }
  return errors;
}

export function validateRedirectForm(input: {
  from: string;
  to: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.from.trim()) errors.from = "Source path is required";
  if (!input.to.trim()) errors.to = "Destination is required";
  return errors;
}

export type UseDashboardFormOptions<T> = {
  validate: (values: T) => FieldErrors;
  initialTouched?: Record<string, boolean>;
};

export function useDashboardForm<T extends Record<string, unknown>>(
  options: UseDashboardFormOptions<T>,
) {
  const { validate } = options;
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>(
    options.initialTouched ?? {},
  );
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const showFieldError = useCallback(
    (key: string) => submitAttempted || Boolean(touched[key]),
    [submitAttempted, touched],
  );

  const touch = useCallback((key: string) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }, []);

  const validateAll = useCallback(
    (values: T): FieldErrors => {
      const errors = validate(values);
      setFieldErrors(errors);
      return errors;
    },
    [validate],
  );

  const validateField = useCallback(
    (key: string, values: T) => {
      const errors = validate(values);
      setFieldErrors((prev) => {
        const next = { ...prev };
        if (errors[key]) next[key] = errors[key];
        else delete next[key];
        return next;
      });
      return errors[key];
    },
    [validate],
  );

  const scrollToFirstError = useCallback((errors: FieldErrors) => {
    const firstKey = Object.keys(errors)[0];
    if (!firstKey) return;
    const el =
      document.getElementById(firstKey) ??
      document.querySelector(`[data-field="${firstKey}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const runSubmit = useCallback(
    (values: T): boolean => {
      setSubmitAttempted(true);
      const errors = validateAll(values);
      if (Object.keys(errors).length > 0) {
        scrollToFirstError(errors);
        return false;
      }
      return true;
    },
    [validateAll, scrollToFirstError],
  );

  const applyApiFieldErrors = useCallback((apiErrors: FieldErrors) => {
    setFieldErrors((prev) => mergeFieldErrors(prev, apiErrors));
    setSubmitAttempted(true);
    scrollToFirstError(apiErrors);
  }, [scrollToFirstError]);

  const resetValidation = useCallback(() => {
    setFieldErrors({});
    setTouched({});
    setSubmitAttempted(false);
  }, []);

  const isValid = Object.keys(fieldErrors).length === 0;

  return {
    fieldErrors,
    touched,
    submitAttempted,
    isValid,
    showFieldError,
    touch,
    validateAll,
    validateField,
    runSubmit,
    applyApiFieldErrors,
    resetValidation,
    setFieldErrors,
    scrollToFirstError,
  };
}
