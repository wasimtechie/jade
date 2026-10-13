"use client";

import type { ReactNode } from "react";
import { dash } from "@/lib/dashboard/dashboardClasses";

type DashboardPanelProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  fill?: boolean;
  pad?: boolean;
  /** Allow action menus / popovers to escape the glass overflow clip */
  menuHost?: boolean;
  header?: string;
};

export function DashboardPanel({
  children,
  className = "",
  contentClassName = "",
  fill = false,
  pad = false,
  menuHost = false,
  header,
}: DashboardPanelProps) {
  const panelClass = [
    dash.panel,
    pad ? "dashboard-panel--pad" : "",
    fill ? "dashboard-panel--fill" : "",
    menuHost ? dash.panelMenuHost : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={panelClass}>
      <div className={`${dash.panelBody} ${contentClassName}`.trim()}>
        {header && <div className={dash.panelHeader}>{header}</div>}
        {children}
      </div>
    </div>
  );
}

export { DashboardPanel as GlassPanel };
