"use client";

import { useCallback, useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { dashboardFetch } from "@/lib/dashboard/dashboardFetch";
import { formatPaise } from "@/lib/money";
import { DashboardPanel } from "./DashboardPanel";
import { DashboardListToolbar } from "./ui/DashboardListToolbar";
import { DashboardModuleFrame } from "./ui/DashboardModuleFrame";

type AnalyticsData = {
  periodDays: number;
  bookings: { total: number; confirmed: number; pending: number };
  leadsLast30Days: number;
  paidRevenuePaise: number;
  googleAnalyticsId: string | null;
};

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardFetch("/api/dashboard/seo/analytics");
      if (!res.ok) throw new Error("Failed to load analytics");
      setData((await res.json()) as AnalyticsData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <DashboardModuleFrame
      toolbar={
        <DashboardListToolbar onRefresh={load} refreshing={loading} />
      }
      error={error}
      loading={loading || !data}
      loadingLabel="Loading analytics…"
    >
      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Total bookings",
                value: data.bookings.total,
                hint: "All time",
              },
              {
                label: "Confirmed",
                value: data.bookings.confirmed,
                hint: "Paid / confirmed",
              },
              {
                label: "Pending holds",
                value: data.bookings.pending,
                hint: "Awaiting payment",
              },
              {
                label: `Leads (${data.periodDays}d)`,
                value: data.leadsLast30Days,
                hint: "Enquiry forms",
              },
            ].map((card) => (
              <DashboardPanel key={card.label} pad>
                <p className="text-xs font-bold uppercase tracking-widest text-[color:var(--dash-text-muted)]">
                  {card.label}
                </p>
                <p className="mt-2 font-philosopher text-3xl text-white">
                  {card.value}
                </p>
                <p className="mt-1 text-sm text-[color:var(--dash-text-secondary)]">{card.hint}</p>
              </DashboardPanel>
            ))}
          </div>

          <DashboardPanel pad>
            <div className="flex items-start gap-3">
              <BarChart3 className="mt-1 h-6 w-6 text-[var(--dash-accent)]" />
              <div>
                <p className="font-bold text-white">Paid revenue (confirmed)</p>
                <p className="mt-1 font-philosopher text-2xl text-[var(--dash-accent)]">
                  {formatPaise(data.paidRevenuePaise)}
                </p>
                <p className="mt-3 text-sm text-[color:var(--dash-text-secondary)]">
                  Google Analytics:{" "}
                  {data.googleAnalyticsId ? (
                    <code className="text-[color:var(--dash-text-muted)]">
                      {data.googleAnalyticsId}
                    </code>
                  ) : (
                    "Set NEXT_PUBLIC_GA_ID for live traffic charts"
                  )}
                </p>
              </div>
            </div>
          </DashboardPanel>
        </>
      )}
    </DashboardModuleFrame>
  );
}
