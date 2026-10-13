"use client";

import type { CalendarStats } from "@/lib/calendar/types";

type CalendarStatsBarProps = {
  stats: CalendarStats;
  rangeLabel: string;
};

export function CalendarStatsBar({ stats, rangeLabel }: CalendarStatsBarProps) {
  const occupancyPct =
    stats.bookableVillas > 0
      ? Math.round((stats.occupiedTonight / stats.bookableVillas) * 100)
      : 0;

  return (
    <div className="dash-kpi-strip" role="group" aria-label={rangeLabel}>
      <div className="dash-kpi">
        <span className="dash-kpi__label">In house</span>
        <span className="dash-kpi__value">{stats.inHouse}</span>
      </div>
      <div className="dash-kpi dash-kpi--info">
        <span className="dash-kpi__label">Arrivals</span>
        <span className="dash-kpi__value">{stats.arrivals}</span>
      </div>
      <div className="dash-kpi dash-kpi--info">
        <span className="dash-kpi__label">Departures</span>
        <span className="dash-kpi__value">{stats.departures}</span>
      </div>
      <div className="dash-kpi dash-kpi--accent">
        <span className="dash-kpi__label">Tonight</span>
        <span className="dash-kpi__value">
          {stats.occupiedTonight}/{stats.bookableVillas}
        </span>
      </div>
      <div className="dash-kpi dash-kpi--success">
        <span className="dash-kpi__label">Occupancy</span>
        <span className="dash-kpi__value">{occupancyPct}%</span>
      </div>
      {stats.pendingCount > 0 && (
        <div className="dash-kpi dash-kpi--warning">
          <span className="dash-kpi__label">Pending</span>
          <span className="dash-kpi__value">{stats.pendingCount}</span>
        </div>
      )}
      {stats.conflictCount > 0 && (
        <div className="dash-kpi dash-kpi--danger">
          <span className="dash-kpi__label">Conflicts</span>
          <span className="dash-kpi__value">{stats.conflictCount}</span>
        </div>
      )}
    </div>
  );
}
