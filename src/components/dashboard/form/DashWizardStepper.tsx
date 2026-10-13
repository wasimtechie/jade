"use client";

import { Check } from "lucide-react";
import clsx from "clsx";
import { dash } from "@/lib/dashboard/dashboardClasses";

export type WizardStepState = "pending" | "active" | "done" | "error";

export type WizardStepItem = {
  id: string;
  label: string;
  shortLabel?: string;
  state: WizardStepState;
};

type DashWizardStepperProps = {
  steps: WizardStepItem[];
  onStepClick?: (index: number) => void;
};

export function DashWizardStepper({ steps, onStepClick }: DashWizardStepperProps) {
  return (
    <nav className={dash.wizardStepper} aria-label="Wizard progress">
      {steps.map((step, index) => {
        const stepClass =
          step.state === "active"
            ? dash.wizardStepActive
            : step.state === "done"
              ? dash.wizardStepDone
              : step.state === "error"
                ? dash.wizardStepError
                : dash.wizardStep;
        return (
          <button
            key={step.id}
            type="button"
            className={stepClass}
            onClick={() => onStepClick?.(index)}
            aria-current={step.state === "active" ? "step" : undefined}
          >
            <span className="dash-wizard-step__num" aria-hidden>
              {step.state === "done" ? (
                <Check size={10} strokeWidth={3} />
              ) : (
                index + 1
              )}
            </span>
            <span className="hidden sm:inline">{step.label}</span>
            <span className="sm:hidden">{step.shortLabel ?? step.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

type DashStatusChipProps = {
  variant?: "success" | "warning" | "danger" | "info" | "accent" | "neutral";
  children: React.ReactNode;
  className?: string;
};

export function DashStatusChip({
  variant = "neutral",
  children,
  className,
}: DashStatusChipProps) {
  const variantClass =
    variant === "success"
      ? dash.statusChipSuccess
      : variant === "warning"
        ? dash.statusChipWarning
        : variant === "danger"
          ? dash.statusChipDanger
          : variant === "info"
            ? dash.statusChipInfo
            : variant === "accent"
              ? dash.statusChipAccent
              : dash.statusChip;
  return (
    <span className={clsx(variantClass, className)}>{children}</span>
  );
}
