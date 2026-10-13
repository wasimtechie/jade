"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { dash } from "@/lib/dashboard/dashboardClasses";

type DashRowEditorProps = {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function DashRowEditor({ title, actions, children }: DashRowEditorProps) {
  return (
    <div className={dash.rowEditor}>
      <div className={dash.rowEditorHead}>
        <h4 className="dash-row-editor__title">{title}</h4>
        {actions ? (
          <div className={dash.rowEditorActions}>{actions}</div>
        ) : null}
      </div>
      <div className={dash.rowEditorBody}>{children}</div>
    </div>
  );
}

export function DashRowEditorRow({ children }: { children: ReactNode }) {
  return <div className="dash-row-editor__row">{children}</div>;
}

type DashEmptyHintProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function DashEmptyHint({
  icon: Icon,
  title,
  description,
  action,
}: DashEmptyHintProps) {
  return (
    <div className={dash.emptyHint}>
      {Icon ? <Icon className="dash-empty-hint__icon" size={28} /> : null}
      <p className="dash-empty-hint__title">{title}</p>
      {description ? (
        <p className="dash-empty-hint__desc">{description}</p>
      ) : null}
      {action}
    </div>
  );
}

type DashFormNoticeProps = {
  variant?: "info" | "warning" | "success" | "danger";
  children: ReactNode;
};

export function DashFormNotice({
  variant = "info",
  children,
}: DashFormNoticeProps) {
  const cls =
    variant === "warning"
      ? dash.formNoticeWarning
      : variant === "success"
        ? dash.formNoticeSuccess
        : variant === "danger"
          ? dash.formNoticeDanger
          : dash.formNoticeInfo;
  return <div className={cls}>{children}</div>;
}
