"use client";

import { useState } from "react";
import clsx from "clsx";
import {
  getFieldShellClass,
  getFloatingLabelFloatedClass,
  getTextareaFloatingLabelClass,
  JADE_FORM_INPUT_CLASS,
  JADE_FORM_INPUT_FOOTER_CLASS,
  JADE_FORM_WARN,
  themeToVariant,
  type JadeFormTheme,
} from "@/lib/jadeFormTokens";
import JadeFormFieldError from "./JadeFormFieldError";

export type JadeFloatingTextareaProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  rows?: number;
  name?: string;
  required?: boolean;
  invalid?: boolean;
  showError?: boolean;
  errorMessage?: string;
  theme: JadeFormTheme;
  className?: string;
};

export default function JadeFloatingTextarea({
  id,
  label,
  value,
  onChange,
  onBlur,
  rows = 4,
  name,
  required,
  invalid = false,
  showError = false,
  errorMessage,
  theme,
  className,
}: JadeFloatingTextareaProps) {
  const [focused, setFocused] = useState(false);
  const variant = themeToVariant(theme);
  const indicating = invalid && showError;
  const errId = `${id}-err`;
  const hasValue = Boolean(value.trim());
  const labelFloated = hasValue || focused;
  const inputClass =
    variant === "footer" ? JADE_FORM_INPUT_FOOTER_CLASS : JADE_FORM_INPUT_CLASS;

  return (
    <div className={className}>
      <div
        className={getFieldShellClass({
          invalid,
          showError,
          variant,
        })}
      >
        <textarea
          id={id}
          name={name}
          rows={rows}
          required={required}
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          onChange={(e) => onChange(e.target.value)}
          placeholder=" "
          aria-invalid={indicating}
          aria-describedby={indicating && errorMessage ? errId : undefined}
          className={clsx(inputClass, "h-20 resize-none pt-5")}
        />
        <label
          htmlFor={id}
          className={
            labelFloated
              ? getFloatingLabelFloatedClass(theme)
              : getTextareaFloatingLabelClass(theme)
          }
        >
          {label}
          {indicating && required ? (
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
