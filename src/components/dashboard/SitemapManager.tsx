"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { dashboardFetch, readDashboardApiError } from "@/lib/dashboard/dashboardFetch";
import { DataTable, type DataTableColumn } from "./DataTable";
import { DashboardListToolbar } from "./ui/DashboardListToolbar";
import { DashboardModuleFrame } from "./ui/DashboardModuleFrame";

type SitemapRow = {
  loc: string;
  type: string;
  priority: number;
};

export function SitemapManager() {
  const [rows, setRows] = useState<SitemapRow[]>([]);
  const [base, setBase] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardFetch("/api/dashboard/seo/sitemap");
      if (!res.ok) throw new Error(await readDashboardApiError(res, "Failed to load sitemap"));
      const data = (await res.json()) as {
        urls?: SitemapRow[];
        base?: string;
      };
      setRows(data.urls ?? []);
      setBase(data.base ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columns: DataTableColumn<SitemapRow>[] = [
    {
      key: "type",
      header: "Type",
      cell: (r) => (
        <span className="text-xs font-bold uppercase tracking-widest text-white/45">
          {r.type}
        </span>
      ),
    },
    {
      key: "url",
      header: "URL",
      cell: (r) => (
        <a
          href={r.loc}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex max-w-md items-center gap-1 truncate font-mono text-xs text-[var(--dash-accent)] hover:underline"
        >
          {r.loc.replace(base, "") || "/"}
          <ExternalLink className="h-3 w-3 shrink-0" />
        </a>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      className: "text-right",
      cell: (r) => (
        <span className="text-sm text-white/50">{r.priority.toFixed(2)}</span>
      ),
    },
  ];

  return (
    <DashboardModuleFrame
      toolbar={
        <DashboardListToolbar
          meta={`${rows.length} URL${rows.length === 1 ? "" : "s"} in sitemap`}
          onRefresh={load}
          refreshing={loading}
        />
      }
      error={error}
      loading={loading}
    >
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.loc}
        emptyMessage="No URLs"
        caption="Sitemap URLs"
        stickyFirstColumn
        dense
      />
    </DashboardModuleFrame>
  );
}
