"use client";

import type { ReactNode } from "react";
import { dash } from "@/lib/dashboard/dashboardClasses";

const accentClass: Record<string, string> = {
  gold: "",
  sky: "dashboard-stat__icon--sky",
  amber: "dashboard-stat__icon--amber",
  red: "dashboard-stat__icon--red",
};
import { DashboardPanel } from "../DashboardPanel";

type DashboardStatCardProps = {
  label: string;
  value: string | number;
  icon: ReactNode;
  accent?: "gold" | "sky" | "amber" | "red";
};

export function DashboardStatCard({
  label,
  value,
  icon,
  accent = "gold",
}: DashboardStatCardProps) {
  return (
    <div className={dash.statsItem}>
      <div className={dash.statRow}>
        <span className={`${dash.statIcon} ${accentClass[accent] ?? ""}`.trim()}>
          {icon}
        </span>
        <div className="min-w-0">
          <p className={dash.statLabel}>{label}</p>
          <p className={dash.statValue}>{value}</p>
        </div>
      </div>
    </div>
  );
}

type DashboardStatsStripProps = {
  children: ReactNode;
  subtitle?: string;
};

export function DashboardStatsStrip({
  children,
  subtitle,
}: DashboardStatsStripProps) {
  return (
    <DashboardPanel>
      {subtitle && <div className={dash.panelHeader}>{subtitle}</div>}
      <div className={dash.stats}>{children}</div>
    </DashboardPanel>
  );
}
