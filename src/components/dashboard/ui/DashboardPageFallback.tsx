"use client";

import { Loader2 } from "lucide-react";
import { dash } from "@/lib/dashboard/dashboardClasses";

type DashboardPageFallbackProps = {
  label?: string;
};

export function DashboardPageFallback({
  label = "Loading…",
}: DashboardPageFallbackProps) {
  return (
    <div
      className={`${dash.loadingRow} dash-page-fallback`}
      role="status"
      aria-live="polite"
    >
      <Loader2
        className="h-5 w-5 animate-spin text-[var(--dash-accent)]"
        aria-hidden
      />
      <span className={dash.muted}>{label}</span>
    </div>
  );
}
