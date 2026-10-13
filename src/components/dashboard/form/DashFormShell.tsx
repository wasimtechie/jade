"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import { dash } from "@/lib/dashboard/dashboardClasses";

type DashFormShellProps = {
  children: ReactNode;
  twoColumn?: boolean;
  drawer?: boolean;
  fluid?: boolean;
  className?: string;
};

export function DashFormShell({
  children,
  twoColumn,
  drawer,
  fluid,
  className,
}: DashFormShellProps) {
  return (
    <div
      className={clsx(
        dash.formShell,
        twoColumn && "dash-form-shell--two-col",
        drawer && "dash-form-shell--drawer",
        fluid && "dash-form-shell--fluid",
        className,
      )}
    >
      {children}
    </div>
  );
}

type DashFormActionBarProps = {
  children: ReactNode;
  dirty?: boolean;
  saved?: boolean;
};

export function DashFormActionBar({
  children,
  dirty,
  saved,
}: DashFormActionBarProps) {
  return (
    <div className={dash.formActionBar}>
      <div className={dash.formActionBarInner}>
        {dirty && !saved ? (
          <span className={dash.formActionBarDirty}>Unsaved changes</span>
        ) : null}
        {saved ? (
          <span className="dash-form-action-bar__saved">Saved</span>
        ) : null}
        {children}
      </div>
    </div>
  );
}
