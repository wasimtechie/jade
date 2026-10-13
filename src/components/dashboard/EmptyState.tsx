"use client";

import type { ReactNode } from "react";
import { dash } from "@/lib/dashboard/dashboardClasses";
import { DashboardPanel } from "./DashboardPanel";

type EmptyTone = "neutral" | "info" | "success" | "warning";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: EmptyTone;
  compact?: boolean;
};

const TONE_CLASS: Record<Exclude<EmptyTone, "neutral">, string> = {
  info: "dash-empty-hint--info",
  success: "dash-empty-hint--success",
  warning: "dash-empty-hint--warning",
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  tone = "neutral",
  compact = false,
}: EmptyStateProps) {
  const toneClass = tone !== "neutral" ? TONE_CLASS[tone] : "";
  const compactClass = compact ? "dash-empty-hint--compact" : "";

  return (
    <DashboardPanel pad className="w-full">
      <div className={`${dash.emptyHint} ${toneClass} ${compactClass}`.trim()}>
        {icon ? <div className="dash-empty-hint__icon" aria-hidden>{icon}</div> : null}
        <p className="dash-empty-hint__title">{title}</p>
        {description ? <p className="dash-empty-hint__desc">{description}</p> : null}
        {action}
      </div>
    </DashboardPanel>
  );
}
