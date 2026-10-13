"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  split?: boolean;
  compact?: boolean;
  className?: string;
};

export function DashboardFilterBar({
  children,
  meta,
  actions,
  split = false,
  compact = false,
  className = "",
}: Props) {
  const compactClass = compact ? "dash-filter-bar--compact" : "";

  if (split) {
    return (
      <div
        className={`dash-filter-bar dash-filter-bar--split ${compactClass} ${className}`.trim()}
      >
        <div className="dash-filter-bar__controls">{children}</div>
        {(actions != null || meta != null) && (
          <div className="dash-filter-bar__actions-row">
            {actions}
            {meta != null && <div className="dash-filter-bar__meta">{meta}</div>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`dash-filter-bar ${compactClass} ${className}`.trim()}>
      {children}
      {meta != null && <div className="dash-filter-bar__meta">{meta}</div>}
    </div>
  );
}
