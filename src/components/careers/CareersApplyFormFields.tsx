"use client";

import type { Ref } from "react";
import PrimaryButton from "@/components/PrimaryButton";
import { JadeFloatingField } from "@/components/ui/form";
import { JADE_FORM_WARN } from "@/lib/jadeFormTokens";
import {
  careersApplyFieldErrors,
  isCareersApplyFormValid,
  type CareersApplyFieldKey,
} from "@/lib/leadFormValidation";
import { sanitizePhoneDigitsInput } from "@/lib/phoneNumberInput";
import { CAREER_RESUME_REQUIRED_MSG } from "@/lib/careerResumeValidation";
import CareersResumeUpload from "@/components/careers/CareersResumeUpload";

export type CareersApplyFormFieldsProps = {
  idPrefix: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  onFullNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onCompanyChange: (v: string) => void;
  selectedFileName: string | null;
  resumeFile: File | null;
  resumeError: string | null;
  resumeInputRef: Ref<HTMLInputElement>;
  onResumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResumeClear: () => void;
  applyError: string | null;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
};

export default function CareersApplyFormFields({
  idPrefix,
  fullName,
  email,
  phone,
  company,
  onFullNameChange,
  onEmailChange,
  onPhoneChange,
  onCompanyChange,
  selectedFileName,
  resumeFile,
  resumeError,
  resumeInputRef,
  onResumeChange,
  onResumeClear,
  applyError,
  submitting,
  onSubmit,
}: CareersApplyFormFieldsProps) {
  const fieldErrors = careersApplyFieldErrors({ fullName, email, phone });
  const textValid =
    Object.keys(careersApplyFieldErrors({ fullName, email, phone })).length ===
    0;

  const hasResume = Boolean(resumeFile && resumeFile.size > 0);

  const resumeMessage =
    resumeError ??
    (!hasResume && textValid ? CAREER_RESUME_REQUIRED_MSG : null);

  const formValid = isCareersApplyFormValid(
    { fullName, email, phone },
    resumeError,
    resumeFile,
  );

  const showFieldError = (key: CareersApplyFieldKey) => {
    if (!fieldErrors[key]) return false;
    if (key === "fullName") return fullName.trim().length > 0;
    if (key === "phone") return phone.trim().length > 0;
    if (key === "email") return email.trim().length > 0;
    return false;
  };

  const showResumeError =
    Boolean(resumeMessage) && (hasResume || textValid);

  return (
    <form className="flex flex-col gap-4 w-full" noValidate onSubmit={onSubmit}>
      {applyError ? (
        <p
          className="text-sm font-manrope -mb-1"
          style={{ color: JADE_FORM_WARN }}
          role="alert"
        >
          {applyError}
        </p>
      ) : null}

      <JadeFloatingField
        id={`${idPrefix}-fullName`}
        label="Full Name"
        value={fullName}
        onChange={onFullNameChange}
        theme="book"
        invalid={Boolean(fieldErrors.fullName)}
        showError={showFieldError("fullName")}
        errorMessage={fieldErrors.fullName}
      />
      <JadeFloatingField
        id={`${idPrefix}-phone`}
        label="Phone Number"
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        value={phone}
        onChange={(v) => onPhoneChange(sanitizePhoneDigitsInput(v))}
        theme="book"
        invalid={Boolean(fieldErrors.phone)}
        showError={showFieldError("phone")}
        errorMessage={fieldErrors.phone}
      />
      <JadeFloatingField
        id={`${idPrefix}-email`}
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={onEmailChange}
        theme="book"
        invalid={Boolean(fieldErrors.email)}
        showError={showFieldError("email")}
        errorMessage={fieldErrors.email}
      />
      <JadeFloatingField
        id={`${idPrefix}-company`}
        label="Company/Organization (optional)"
        required={false}
        value={company}
        onChange={onCompanyChange}
        theme="book"
      />

      <CareersResumeUpload
        selectedFileName={selectedFileName}
        error={resumeMessage}
        showError={showResumeError}
        inputRef={resumeInputRef}
        onFileChange={onResumeChange}
        onClear={onResumeClear}
      />

      <PrimaryButton
        type="submit"
        width="form"
        withArrow={false}
        disabled={!formValid || submitting}
        className="mt-1"
      >
        {submitting ? "SUBMITTING…" : "SUBMIT APPLICATION"}
      </PrimaryButton>
    </form>
  );
}
