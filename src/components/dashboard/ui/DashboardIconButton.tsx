"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { dash } from "@/lib/dashboard/dashboardClasses";

type DashboardIconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  label: string;
  variant?: "default" | "ghost";
  size?: "default" | "compact";
};

export function DashboardIconButton({
  children,
  label,
  variant = "default",
  size = "default",
  className = "",
  type = "button",
  ...props
}: DashboardIconButtonProps) {
  const base =
    variant === "ghost"
      ? dash.btnGhost
      : size === "compact"
        ? dash.btnCompact
        : dash.btnIcon;
  return (
    <button
      type={type}
      aria-label={label}
      className={`${base} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

type DashboardTextButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function DashboardTextButton({
  children,
  className = "",
  type = "button",
  ...props
}: DashboardTextButtonProps) {
  return (
    <button
      type={type}
      className={`${dash.btn} ${dash.btnText} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
