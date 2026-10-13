"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Database } from "lucide-react";
import { dashboardFetch } from "@/lib/dashboard/dashboardFetch";
import { dash } from "@/lib/dashboard/dashboardClasses";
import { DataTable, type DataTableColumn } from "./DataTable";
import { DashboardListToolbar } from "./ui/DashboardListToolbar";
import { DashboardModuleFrame } from "./ui/DashboardModuleFrame";

type CollectionRow = { name: string; count: number };

export function DatabaseExplorer() {
  const [database, setDatabase] = useState<string | null>(null);
  const [rows, setRows] = useState<CollectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sampleCollection, setSampleCollection] = useState<string | null>(null);
  const [samples, setSamples] = useState<unknown[] | null>(null);
  const [samplesLoading, setSamplesLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardFetch("/api/dashboard/dev/database");
      if (!res.ok) throw new Error("Failed to load database stats");
      const data = (await res.json()) as {
        database?: string;
        collections?: CollectionRow[];
      };
      setDatabase(data.database ?? null);
      setRows(data.collections ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSamples = async (name: string) => {
    if (sampleCollection === name) {
      setSampleCollection(null);
      setSamples(null);
      return;
    }
    setSampleCollection(name);
    setSamplesLoading(true);
    setSamples(null);
    try {
      const res = await dashboardFetch(
        `/api/dashboard/dev/database?collection=${encodeURIComponent(name)}&sample=5`,
      );
      if (!res.ok) throw new Error("Failed to load samples");
      const data = (await res.json()) as {
        samples?: { documents?: unknown[] };
      };
      setSamples(data.samples?.documents ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load samples");
      setSampleCollection(null);
    } finally {
      setSamplesLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [load]);

  const columns: DataTableColumn<CollectionRow>[] = [
    {
      key: "name",
      header: "Collection",
      cell: (r) => (
        <button
          type="button"
          onClick={() => loadSamples(r.name)}
          className="inline-flex items-center gap-1 font-mono text-sm text-white/80 hover:text-[var(--dash-accent)]"
        >
          {sampleCollection === r.name ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
          {r.name}
        </button>
      ),
    },
    {
      key: "count",
      header: "Documents",
      className: "text-right",
      cell: (r) => (
        <span className="font-philosopher text-xl text-white">
          {r.count.toLocaleString("en-IN")}
        </span>
      ),
    },
  ];

  return (
    <DashboardModuleFrame
      toolbar={
        <DashboardListToolbar
          meta={
            <span className="inline-flex items-center gap-2">
              <Database className="h-4 w-4 text-[var(--dash-accent)]" />
              <span>
                Read-only overview
                {database && (
                  <>
                    {" "}
                    · <span className="text-white">{database}</span>
                  </>
                )}
              </span>
            </span>
          }
          onRefresh={load}
          refreshing={loading}
        />
      }
      error={error}
      loading={loading}
      loadingLabel="Loading collections…"
    >
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.name}
        emptyMessage="No collections found."
        caption="MongoDB collections"
      />
      {sampleCollection && (
        <div className="mt-4">
          <p className={`${dash.label} mb-2`}>
            Sample documents — {sampleCollection}
          </p>
          {samplesLoading ? (
            <p className={dash.muted}>Loading samples…</p>
          ) : (
            <pre className={dash.logDetail}>
              {JSON.stringify(samples ?? [], null, 2)}
            </pre>
          )}
        </div>
      )}
    </DashboardModuleFrame>
  );
}
