"use client";

import Link from "next/link";
import { ExternalLink, LogOut, Menu, RefreshCw } from "lucide-react";
import { dash } from "@/lib/dashboard/dashboardClasses";
import {
  DashboardIconButton,
  DashboardTextButton,
} from "./ui/DashboardIconButton";

type DashboardHeaderProps = {
  pageTitle: string;
  section: string | null;
  description?: string;
  onOpenNav: () => void;
  onLogout: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
};

export function DashboardHeader({
  pageTitle,
  section,
  description,
  onOpenNav,
  onLogout,
  onRefresh,
  refreshing = false,
}: DashboardHeaderProps) {
  return (
    <header className={dash.header}>
      <div className={dash.headerInner}>
        <div className={dash.headerBrand}>
          <DashboardIconButton
            label="Open navigation"
            onClick={onOpenNav}
            className={dash.hiddenLg}
            variant="ghost"
          >
            <Menu className="h-5 w-5" />
          </DashboardIconButton>

          <div className={dash.headerTitleBlock}>
            {section && <p className={dash.headerSection}>{section}</p>}
            <h1 className={dash.headerTitle}>{pageTitle}</h1>
            {description && (
              <p className={dash.headerDesc}>{description}</p>
            )}
          </div>
        </div>

        <div className={dash.headerActions}>
          <div className="dashboard-header__assist--hidden" aria-hidden />

          {onRefresh && (
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
          )}

          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={`${dash.btn} ${dash.btnText} ${dash.lgOnly}`}
            aria-label="View public website"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            Website
          </Link>

          <DashboardIconButton
            label="Sign out"
            onClick={onLogout}
            className={dash.smHidden}
            size="compact"
          >
            <LogOut className="h-4 w-4" />
          </DashboardIconButton>

          <DashboardTextButton
            onClick={onLogout}
            className={`${dash.lgOnly} ${dash.btnText}`}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </DashboardTextButton>
        </div>
      </div>
    </header>
  );
}
