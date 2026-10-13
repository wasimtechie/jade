"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import JadeFloatingField from "@/components/ui/form/JadeFloatingField";
import JadeFloatingSelect from "@/components/ui/form/JadeFloatingSelect";
import { DASH_FORM_THEME } from "@/lib/dashboard/dashboardClasses";
import {
  getDashboardInputClass,
  getFieldShellClass,
  getFloatingLabelClass,
  getFloatingLabelFloatedClass,
  getTextareaFloatingLabelClass,
  JADE_FORM_WARN,
  themeToVariant,
} from "@/lib/jadeFormTokens";
import JadeFormFieldError from "@/components/ui/form/JadeFormFieldError";

const THEME = DASH_FORM_THEME;

function DashFloatWrap({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`dash-float-field w-full min-w-0${className ? ` ${className}` : ""}`}
      data-field={id}
    >
      {children}
    </div>
  );
}

type DashFieldBase = {
  id: string;
  label: string;
  invalid?: boolean;
  showError?: boolean;
  errorMessage?: string;
  onBlur?: () => void;
  className?: string;
};

export function DashFloatingField(
  props: DashFieldBase & {
    value: string;
    onChange: (value: string) => void;
    type?: "text" | "tel" | "email" | "password" | "url";
    inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
    required?: boolean;
    disabled?: boolean;
    autoComplete?: string;
    name?: string;
  },
) {
  const { id, className, ...rest } = props;
  return (
    <DashFloatWrap id={id} className={className}>
      <JadeFloatingField {...rest} id={id} theme={THEME} type={props.type === "url" ? "text" : props.type} />
    </DashFloatWrap>
  );
}

export function DashFloatingSelect(
  props: DashFieldBase & {
    value: string;
    onChange: (value: string) => void;
    options?: readonly string[];
    optionItems?: readonly { value: string; label: string }[];
    required?: boolean;
    disabled?: boolean;
  },
) {
  const { id, className, ...rest } = props;
  return (
    <DashFloatWrap id={id} className={className}>
      <JadeFloatingSelect {...rest} id={id} theme={THEME} />
    </DashFloatWrap>
  );
}

export function DashFloatingTextarea(
  props: DashFieldBase & {
    value: string;
    onChange: (value: string) => void;
    rows?: number;
    required?: boolean;
  },
) {
  const {
    id,
    label,
    value,
    onChange,
    onBlur,
    invalid,
    showError,
    errorMessage,
    rows = 4,
    required,
    className,
  } = props;
  const [focused, setFocused] = useState(false);
  const variant = themeToVariant(THEME);
  const indicating = invalid && showError;
  const errId = `${id}-err`;
  const hasValue = Boolean(value.trim());
  const labelFloated = focused || hasValue;

  return (
    <DashFloatWrap id={id} className={className}>
      <div
        className={getFieldShellClass({
          invalid: Boolean(invalid),
          showError: Boolean(showError),
          variant,
          theme: THEME,
        })}
      >
        <textarea
          id={id}
          value={value}
          rows={rows}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          onChange={(e) => onChange(e.target.value)}
          placeholder=" "
          aria-invalid={indicating}
          aria-describedby={indicating && errorMessage ? errId : undefined}
          className={`${getDashboardInputClass(THEME)} min-h-[5.5rem] resize-y py-3`}
        />
        <label
          htmlFor={id}
          className={
            labelFloated
              ? getFloatingLabelFloatedClass(THEME)
              : getTextareaFloatingLabelClass(THEME)
          }
        >
          {label}
          {indicating && required !== false ? (
            <span className="ml-1" style={{ color: JADE_FORM_WARN }}>
              *
            </span>
          ) : null}
        </label>
      </div>
      {showError && errorMessage ? (
        <JadeFormFieldError id={errId} message={errorMessage} />
      ) : null}
    </DashFloatWrap>
  );
}

export function DashFloatingNumber(
  props: DashFieldBase & {
    value: string;
    onChange: (value: string) => void;
    min?: number;
    max?: number;
    required?: boolean;
  },
) {
  const { id, className, ...rest } = props;
  return (
    <DashFloatWrap id={id} className={className}>
      <JadeFloatingField
        {...rest}
        id={id}
        theme={THEME}
        inputMode="numeric"
      />
    </DashFloatWrap>
  );
}

export function DashFloatingDate(
  props: DashFieldBase & {
    value: string;
    onChange: (value: string) => void;
    min?: string;
    max?: string;
    required?: boolean;
  },
) {
  const {
    id,
    label,
    value,
    onChange,
    onBlur,
    invalid,
    showError,
    errorMessage,
    required,
    min,
    max,
    className,
  } = props;
  const variant = themeToVariant(THEME);
  const indicating = invalid && showError;
  const errId = `${id}-err`;

  return (
    <DashFloatWrap id={id} className={className}>
      <div
        className={getFieldShellClass({
          invalid: Boolean(invalid),
          showError: Boolean(showError),
          variant,
          theme: THEME,
        })}
      >
        <input
          id={id}
          type="date"
          value={value}
          min={min}
          max={max}
          required={required}
          onBlur={onBlur}
          onChange={(e) => onChange(e.target.value)}
          placeholder=" "
          aria-invalid={indicating}
          aria-describedby={indicating && errorMessage ? errId : undefined}
          className={`${getDashboardInputClass(THEME)} [color-scheme:dark]`}
        />
        <label htmlFor={id} className={getFloatingLabelClass(THEME)}>
          {label}
          {indicating && required !== false ? (
            <span className="ml-1" style={{ color: JADE_FORM_WARN }}>
              *
            </span>
          ) : null}
        </label>
      </div>
      {showError && errorMessage ? (
        <JadeFormFieldError id={errId} message={errorMessage} />
      ) : null}
    </DashFloatWrap>
  );
}

type DashToggleProps = {
  label: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
};

export function DashToggle({
  label,
  description,
  checked,
  disabled,
  onChange,
}: DashToggleProps) {
  return (
    <label
      className={`dash-toggle-field${disabled ? " opacity-50 pointer-events-none" : ""}`}
    >
      <span
        className={checked ? "dash-toggle-pill dash-toggle-pill--on" : "dash-toggle-pill"}
      >
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
      </span>
      <span>
        <span className="dash-toggle-field__label">{label}</span>
        {description ? (
          <p className="dash-toggle-field__desc">{description}</p>
        ) : null}
      </span>
    </label>
  );
}
