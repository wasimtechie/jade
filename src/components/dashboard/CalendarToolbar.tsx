"use client";

import {
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Search,
} from "lucide-react";
import { dash } from "@/lib/dashboard/dashboardClasses";
import {
  DashboardIconButton,
  DashboardTextButton,
} from "./ui/DashboardIconButton";
import { DashboardTabBar } from "./ui/DashboardTabBar";

export type CalendarWindowDays = 7 | 14 | 21 | 30;

export type CalendarFilters = {
  search: string;
  bookableOnly: boolean;
  weddingOnly: boolean;
  hideOffline: boolean;
};

type CalendarToolbarProps = {
  rangeLabel: string;
  propertyCount: number;
  bookableCount: number;
  windowDays: CalendarWindowDays;
  onWindowDaysChange: (days: CalendarWindowDays) => void;
  filters: CalendarFilters;
  onFiltersChange: (patch: Partial<CalendarFilters>) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onRefresh: () => void;
  refreshing?: boolean;
  onManualBooking?: () => void;
};

const WINDOW_OPTIONS: CalendarWindowDays[] = [7, 14, 21, 30];

export function CalendarToolbar({
  rangeLabel,
  propertyCount,
  bookableCount,
  windowDays,
  onWindowDaysChange,
  filters,
  onFiltersChange,
  onPrev,
  onNext,
  onToday,
  onRefresh,
  refreshing = false,
  onManualBooking,
}: CalendarToolbarProps) {
  return (
    <div className={`${dash.toolbar} calendar-toolbar-compact`}>
      <div className={dash.toolbarMeta}>
        <p className={dash.label}>Availability grid</p>
        <p
          className="mt-0.5 font-philosopher leading-tight"
          style={{
            fontSize: "var(--dash-fs-body)",
            color: "var(--dash-text)",
          }}
        >
          {rangeLabel}
        </p>
        <p className={`${dash.muted} mt-0.5 text-xs`}>
          {propertyCount} properties · {bookableCount} bookable
        </p>
      </div>

      <div
        className={`${dash.toolbarActions} dashboard-toolbar__actions--list dashboard-toolbar__actions--bordered calendar-toolbar-compact__actions`}
        role="toolbar"
        aria-label="Calendar controls"
      >
        <div className={`${dash.toolbarSegment} calendar-window-tabs`}>
          <span className="sr-only">Days visible</span>
          <DashboardTabBar
            tabs={WINDOW_OPTIONS.map((d) => ({
              id: String(d),
              label: `${d}d`,
            }))}
            active={String(windowDays)}
            onChange={(id) => onWindowDaysChange(Number(id) as CalendarWindowDays)}
          />
        </div>

        <div className={`${dash.toolbarSegment} ${dash.toolbarNav}`}>
          <DashboardIconButton
            label="Previous period"
            onClick={onPrev}
            size="compact"
          >
            <ChevronLeft className="h-4 w-4" />
          </DashboardIconButton>
          <DashboardTextButton onClick={onToday} className={dash.toolbarTodayBtn}>
            Today
          </DashboardTextButton>
          {onManualBooking && (
            <DashboardTextButton onClick={onManualBooking}>
              + Booking
            </DashboardTextButton>
          )}
          <DashboardIconButton label="Next period" onClick={onNext} size="compact">
            <ChevronRight className="h-4 w-4" />
          </DashboardIconButton>
          <DashboardIconButton
            label="Refresh calendar"
            onClick={onRefresh}
            disabled={refreshing}
            size="compact"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </DashboardIconButton>
        </div>

        <div className={`${dash.toolbarSegment} ${dash.toolbarSearch}`}>
          <Search className={dash.inputIcon} aria-hidden />
          <input
            type="search"
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            placeholder="Search villa…"
            className={dash.inputIconLeft}
          />
        </div>

        <div className={`${dash.toolbarSegment} ${dash.toolbarFilters}`}>
          <span
            className={`${dash.label} inline-flex shrink-0 items-center gap-2`}
          >
            <Filter
              className="h-3.5 w-3.5"
              style={{ color: "var(--dash-accent)" }}
              aria-hidden
            />
            Filters
          </span>
          <label className={dash.chip}>
            <input
              type="checkbox"
              checked={filters.bookableOnly}
              onChange={(e) =>
                onFiltersChange({ bookableOnly: e.target.checked })
              }
              className="accent-[var(--dash-accent)]"
            />
            Bookable only
          </label>
          <label className={dash.chip}>
            <input
              type="checkbox"
              checked={filters.weddingOnly}
              onChange={(e) =>
                onFiltersChange({ weddingOnly: e.target.checked })
              }
              className="accent-[var(--dash-accent)]"
            />
            Wedding venues
          </label>
          <label className={dash.chip}>
            <input
              type="checkbox"
              checked={filters.hideOffline}
              onChange={(e) =>
                onFiltersChange({ hideOffline: e.target.checked })
              }
              className="accent-[var(--dash-accent)]"
            />
            Hide offline
          </label>
        </div>
      </div>
    </div>
  );
}
