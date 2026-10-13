"use client";

import type { ReactNode } from "react";

export type DashboardTab = {
  id: string;
  label: string;
  count?: number;
  icon?: ReactNode;
};

type Props = {
  tabs: DashboardTab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
};

export function DashboardTabBar({ tabs, active, onChange, className = "" }: Props) {
  return (
    <div className="dash-tab-bar-scroll">
      <div className={`dash-tab-bar ${className}`.trim()} role="tablist">
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`dash-tab-bar__tab ${isActive ? "dash-tab-bar__tab--active" : ""}`}
              onClick={() => onChange(tab.id)}
            >
              {tab.icon}
              {tab.label}
              {tab.count != null && (
                <span className="dash-tab-bar__count">{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
