"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { dash } from "@/lib/dashboard/dashboardClasses";
import { DashboardIconButton } from "./DashboardIconButton";

type DashboardModalHeaderProps = {
  section?: string;
  title: string;
  description?: string;
  onClose: () => void;
  titleId?: string;
  descriptionId?: string;
  actions?: ReactNode;
};

export function DashboardModalHeader({
  section,
  title,
  description,
  onClose,
  titleId,
  descriptionId,
  actions,
}: DashboardModalHeaderProps) {
  return (
    <header className={`${dash.modalHeader} relative z-[2]`}>
      <div className={dash.headerTitleBlock}>
        {section && <p className={dash.headerSection}>{section}</p>}
        <h2
          id={titleId}
          className="dash-modal-header__title font-philosopher leading-tight"
        >
          {title}
        </h2>
        {description && (
          <p id={descriptionId} className="dash-modal-header__desc">
            {description}
          </p>
        )}
      </div>
      <div className="dash-modal-header__actions">
        {actions}
        <DashboardIconButton
          label="Close"
          onClick={onClose}
          variant="ghost"
          className="shrink-0 min-h-[var(--dash-touch)] min-w-[var(--dash-touch)]"
        >
          <X className="h-5 w-5" />
        </DashboardIconButton>
      </div>
    </header>
  );
}
