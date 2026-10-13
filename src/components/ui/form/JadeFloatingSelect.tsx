"use client";

import { useState } from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import {
  getDashboardSelectClass,
  getFieldShellClass,
  getFieldTrailingIconClass,
  getFloatingLabelFloatedClass,
  getFloatingLabelIdleClass,
  getSelectOptionBg,
  JADE_FORM_SELECT_CLASS,
  JADE_FORM_SELECT_FOOTER_CLASS,
  JADE_FORM_WARN,
  themeToVariant,
  type JadeFormTheme,
} from "@/lib/jadeFormTokens";
import JadeFormFieldError from "./JadeFormFieldError";

export type JadeFloatingSelectProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options?: readonly string[];
  optionItems?: readonly { value: string; label: string }[];
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  showError?: boolean;
  errorMessage?: string;
  theme: JadeFormTheme;
  className?: string;
};

export default function JadeFloatingSelect({
  id,
  label,
  value,
  onChange,
  onBlur,
  options = [],
  optionItems,
  required,
  disabled,
  invalid = false,
  showError = false,
  errorMessage,
  theme,
  className,
}: JadeFloatingSelectProps) {
  const [focused, setFocused] = useState(false);
  const variant = themeToVariant(theme);
  const indicating = invalid && showError;
  const errId = `${id}-err`;
  const optionBg = getSelectOptionBg(theme);
  const isRequired = required !== false;
  const hasValue = Boolean(value.trim());
  /** `peer-valid` is unreliable on `<select>` — float label when value or focus (matches text inputs). */
  const labelFloated = hasValue || focused;

  const inputClass = clsx(
    theme === "dashboardCharcoal"
      ? getDashboardSelectClass(theme)
      : variant === "footer"
        ? JADE_FORM_SELECT_FOOTER_CLASS
        : JADE_FORM_SELECT_CLASS,
    hasValue
      ? variant === "footer"
        ? "text-white/80"
        : "text-white"
      : "text-transparent",
  );

  return (
    <div className={className}>
      <div
        className={getFieldShellClass({
          invalid,
          showError,
          variant,
          theme,
        })}
      >
        <select
          id={id}
          required={isRequired}
          disabled={disabled}
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={indicating}
          aria-describedby={indicating && errorMessage ? errId : undefined}
          className={inputClass}
        >
          <option value="" disabled hidden>
            {"\u200b"}
          </option>
          {(optionItems ?? options.map((opt) => ({ value: opt, label: opt }))).map(
            (opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className={`${optionBg} text-white`}
              >
                {opt.label}
              </option>
            ),
          )}
        </select>
        <ChevronDown
          aria-hidden
          className={getFieldTrailingIconClass(focused || hasValue)}
        />
        <label
          htmlFor={id}
          className={
            labelFloated
              ? getFloatingLabelFloatedClass(theme)
              : getFloatingLabelIdleClass(theme)
          }
        >
          {label}
          {indicating && isRequired ? (
            <span className="ml-1" style={{ color: JADE_FORM_WARN }}>
              *
            </span>
          ) : null}
        </label>
      </div>
      {showError && errorMessage ? (
        <JadeFormFieldError id={errId} message={errorMessage} />
      ) : null}
    </div>
  );
}
