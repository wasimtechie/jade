"use client";

import { RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { dash } from "@/lib/dashboard/dashboardClasses";
import { DashboardIconButton, DashboardTextButton } from "./DashboardIconButton";

type DashboardListToolbarProps = {
  meta?: ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
  bordered?: boolean;
  children?: ReactNode;
};

export function DashboardListToolbar({
  meta,
  onRefresh,
  refreshing = false,
  bordered = true,
  children,
}: DashboardListToolbarProps) {
  const actionsClass = [
    dash.toolbarActions,
    "dashboard-toolbar__actions--list",
    bordered ? "dashboard-toolbar__actions--bordered" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={actionsClass} role="toolbar" data-shrink-label>
      {meta != null && meta !== "" && (
        <div className={dash.toolbarSegment}>
          {typeof meta === "string" ? (
            <p className={dash.muted}>{meta}</p>
          ) : (
            meta
          )}
        </div>
      )}
      {children}
      {onRefresh && (
        <div className={dash.toolbarSegment}>
          <DashboardIconButton
            label="Refresh"
            onClick={onRefresh}
            disabled={refreshing}
            size="compact"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </DashboardIconButton>
          <DashboardTextButton onClick={onRefresh} disabled={refreshing}>
            Refresh
          </DashboardTextButton>
        </div>
      )}
    </div>
  );
}
