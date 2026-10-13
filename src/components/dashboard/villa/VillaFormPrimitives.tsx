"use client";

import type { ReactNode } from "react";
import {
  DashSectionCard,
  DashFormNotice,
  DashToggle,
  DashFloatingSelect,
  DashFloatingField,
  DashFloatingTextarea,
  DashFloatingNumber,
} from "@/components/dashboard/form";
import { dash } from "@/lib/dashboard/dashboardClasses";

type VillaFormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  badge?: string;
  compact?: boolean;
};

/** Grouped card section — delegates to DashSectionCard. */
export function VillaFormSection(props: VillaFormSectionProps) {
  return <DashSectionCard {...props} />;
}

type VillaFormFieldProps = {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
};

export function VillaFormField({
  label,
  htmlFor,
  hint,
  children,
  className,
}: VillaFormFieldProps) {
  return (
    <div className={className ?? "villa-form-field"}>
      <label htmlFor={htmlFor} className={dash.label}>
        {label}
      </label>
      {children}
      {hint && <p className="villa-form-field__hint">{hint}</p>}
    </div>
  );
}

type VillaFormGridProps = {
  children: ReactNode;
  cols?: 1 | 2 | 3;
};

export function VillaFormGrid({ children, cols = 2 }: VillaFormGridProps) {
  const gridClass =
    cols === 3
      ? "villa-form-grid villa-form-grid--3"
      : cols === 1
        ? "villa-form-grid"
        : dash.formGrid2;
  return <div className={gridClass}>{children}</div>;
}

type VillaFormToggleProps = {
  label: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
};

export function VillaFormToggle(props: VillaFormToggleProps) {
  return <DashToggle {...props} />;
}

type VillaFormSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; hint?: string }[];
  hint?: string;
  id?: string;
  invalid?: boolean;
  showError?: boolean;
  errorMessage?: string;
  onBlur?: () => void;
};

export function VillaFormSelect({
  label,
  value,
  onChange,
  options,
  id = "villa-form-select",
  invalid,
  showError,
  errorMessage,
  onBlur,
}: VillaFormSelectProps) {
  return (
    <DashFloatingSelect
      id={id}
      label={label}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      invalid={invalid}
      showError={showError}
      errorMessage={errorMessage}
      optionItems={options.map((o) => ({ value: o.value, label: o.label }))}
    />
  );
}

type VillaFormNoticeProps = {
  tone?: "info" | "warning" | "success" | "danger";
  children: ReactNode;
};

export function VillaFormNotice({
  tone = "info",
  children,
}: VillaFormNoticeProps) {
  const variant =
    tone === "success"
      ? "success"
      : tone === "warning"
        ? "warning"
        : tone === "danger"
          ? "danger"
          : "info";
  return <DashFormNotice variant={variant}>{children}</DashFormNotice>;
}

export {
  DashFloatingField as VillaFormTextInput,
  DashFloatingNumber as VillaFormNumberInput,
  DashFloatingTextarea as VillaFormTextarea,
};

export const villaFormInputClass = dash.inputUnified;
export const villaFormTextareaClass = `${dash.inputUnified} min-h-[100px] resize-y`;
