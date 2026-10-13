"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import { dash } from "@/lib/dashboard/dashboardClasses";

type DashSectionCardProps = {
  title: string;
  description?: string;
  badge?: string;
  compact?: boolean;
  children: ReactNode;
  className?: string;
};

export function DashSectionCard({
  title,
  description,
  badge,
  compact,
  children,
  className,
}: DashSectionCardProps) {
  return (
    <section
      className={clsx(
        dash.sectionCard,
        compact && "dash-section-card--compact",
        className,
      )}
    >
      <div className={dash.sectionCardHead}>
        <div>
          <h3 className={dash.sectionCardTitle}>{title}</h3>
          {description ? (
            <p className={dash.sectionCardDesc}>{description}</p>
          ) : null}
        </div>
        {badge ? <span className={dash.sectionCardBadge}>{badge}</span> : null}
      </div>
      <div className={dash.sectionCardBody}>{children}</div>
    </section>
  );
}
