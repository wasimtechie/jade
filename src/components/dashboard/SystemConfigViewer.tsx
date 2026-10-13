"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { dashboardFetch } from "@/lib/dashboard/dashboardFetch";
import { DashboardPanel } from "./DashboardPanel";
import { DashboardListToolbar } from "./ui/DashboardListToolbar";
import { DashboardModuleFrame } from "./ui/DashboardModuleFrame";

type SystemData = {
  environment: string;
  nextAuthUrl: string | null;
  mongo: { ok: boolean; error: string | null };
  secrets: Record<string, "set" | "missing">;
  features: { bookingsStoreFallback: boolean };
};

function StatusIcon({ ok }: { ok: boolean }) {
  return ok ? (
    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
  ) : (
    <XCircle className="h-5 w-5 text-red-400" />
  );
}

export function SystemConfigViewer() {
  const [data, setData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardFetch("/api/dashboard/dev/system");
      if (!res.ok) throw new Error("Failed to load system config");
      setData((await res.json()) as SystemData);
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
      loadingLabel="Loading system status…"
    >
      {data && (
        <>
          <DashboardPanel pad>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <StatusIcon ok={data.mongo.ok} />
                <div>
                  <p className="font-bold text-white">MongoDB</p>
                  <p className="text-sm text-white/50">
                    {data.mongo.ok
                      ? "Connected"
                      : data.mongo.error ?? "Unavailable"}
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40">
                    Environment
                  </p>
                  <p className="mt-1 text-white">{data.environment}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40">
                    NextAuth URL
                  </p>
                  <p className="mt-1 font-mono text-sm text-white/70">
                    {data.nextAuthUrl ?? "—"}
                  </p>
                </div>
              </div>
            </div>
          </DashboardPanel>

          <DashboardPanel pad>
            <p className="mb-4 font-manrope text-xs font-bold uppercase tracking-widest text-white/40">
              Secrets (set / missing only — values never shown)
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(data.secrets).map(([key, status]) => (
                <div
                  key={key}
                  className="flex items-center justify-between border border-white/10 bg-white/[0.02] px-3 py-2"
                >
                  <span className="font-mono text-xs text-white/60">{key}</span>
                  <span
                    className={`text-xs font-bold uppercase ${status === "set" ? "text-emerald-300" : "text-amber-300"}`}
                  >
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </DashboardPanel>
        </>
      )}
    </DashboardModuleFrame>
  );
}
