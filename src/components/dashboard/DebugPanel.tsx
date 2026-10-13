"use client";

import { useCallback, useState } from "react";
import { Loader2, Play } from "lucide-react";
import { dashboardFetch } from "@/lib/dashboard/dashboardFetch";
import { dash } from "@/lib/dashboard/dashboardClasses";
import { DashboardPanel } from "./DashboardPanel";
import { DashboardListToolbar } from "./ui/DashboardListToolbar";
import { DashboardModuleFrame } from "./ui/DashboardModuleFrame";

type CheckResult = {
  label: string;
  ok: boolean;
  detail: string;
};

export function DebugPanel() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<CheckResult[]>([]);

  const runChecks = useCallback(async () => {
    setRunning(true);
    const out: CheckResult[] = [];

    try {
      const sys = await dashboardFetch("/api/dashboard/dev/system");
      const sysData = sys.ok
        ? ((await sys.json()) as { mongo?: { ok: boolean; error?: string } })
        : null;
      out.push({
        label: "MongoDB connection",
        ok: sysData?.mongo?.ok ?? false,
        detail: sysData?.mongo?.ok
          ? "connectDB() succeeded"
          : (sysData?.mongo?.error ?? `HTTP ${sys.status}`),
      });
    } catch (e) {
      out.push({
        label: "MongoDB connection",
        ok: false,
        detail: e instanceof Error ? e.message : "Request failed",
      });
    }

    try {
      const cal = await dashboardFetch("/api/dashboard/calendar");
      out.push({
        label: "Calendar API",
        ok: cal.ok,
        detail: cal.ok ? "GET /api/dashboard/calendar OK" : `HTTP ${cal.status}`,
      });
    } catch (e) {
      out.push({
        label: "Calendar API",
        ok: false,
        detail: e instanceof Error ? e.message : "Request failed",
      });
    }

    try {
      const villas = await dashboardFetch("/api/dashboard/villas?all=1");
      const d = villas.ok
        ? ((await villas.json()) as { villas?: unknown[] })
        : null;
      out.push({
        label: "Villa portfolio API",
        ok: villas.ok,
        detail: villas.ok
          ? `${d?.villas?.length ?? 0} villas loaded`
          : `HTTP ${villas.status}`,
      });
    } catch (e) {
      out.push({
        label: "Villa portfolio API",
        ok: false,
        detail: e instanceof Error ? e.message : "Request failed",
      });
    }

    try {
      const pub = await fetch("/api/public/villas");
      out.push({
        label: "Public villas API",
        ok: pub.ok,
        detail: pub.ok ? "GET /api/public/villas OK" : `HTTP ${pub.status}`,
      });
    } catch (e) {
      out.push({
        label: "Public villas API",
        ok: false,
        detail: e instanceof Error ? e.message : "Request failed",
      });
    }

    setResults(out);
    setRunning(false);
  }, []);

  return (
    <DashboardModuleFrame
      toolbar={
        <DashboardListToolbar
          bordered
          meta="Run smoke checks against core APIs (read-only)."
        >
          <div className={dash.toolbarSegment}>
            <button
              type="button"
              onClick={runChecks}
              disabled={running}
              className={`${dash.btn} ${dash.btnAccent}`}
            >
              {running ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Run checks
            </button>
          </div>
        </DashboardListToolbar>
      }
    >
      {results.length > 0 && (
        <DashboardPanel pad className="dash-debug-results">
          <ul className="space-y-3">
            {results.map((r) => (
              <li
                key={r.label}
                className="flex flex-col gap-2 border-b border-white/5 pb-3 last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
              >
                <div className="min-w-0">
                  <p className="font-bold text-[var(--dash-text)]">{r.label}</p>
                  <p className="mt-1 break-all font-mono text-xs text-[var(--dash-text-muted)]">
                    {r.detail}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-xs font-bold uppercase tracking-widest ${r.ok ? "text-emerald-300" : "text-red-400"}`}
                >
                  {r.ok ? "Pass" : "Fail"}
                </span>
              </li>
            ))}
          </ul>
        </DashboardPanel>
      )}
    </DashboardModuleFrame>
  );
}
