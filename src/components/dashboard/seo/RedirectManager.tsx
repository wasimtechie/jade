"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { dashboardFetch } from "@/lib/dashboard/dashboardFetch";
import { dash } from "@/lib/dashboard/dashboardClasses";
import { roleCanWrite, type Role } from "@/lib/auth/permissions";
import { DataTable, type DataTableColumn } from "../DataTable";
import { DashboardListToolbar } from "../ui/DashboardListToolbar";
import { DashboardModuleFrame } from "../ui/DashboardModuleFrame";
import { DashboardFilterBar } from "../ui/DashboardFilterBar";
import { DashboardStatusBadge, type StatusTone } from "../ui/DashboardStatusBadge";

const STATUS_TONE: Record<string, StatusTone> = {
  active: "success",
  broken: "danger",
  conflict: "warning",
  loop: "danger",
  untested: "neutral",
};

type RedirectRow = {
  _id: string;
  fromPath: string;
  toPath: string;
  type: "301" | "302";
  status: string;
  testStatus: string;
  testMessage?: string;
  note?: string;
};

export function RedirectManager() {
  const { data: session } = useSession();
  const role = session?.user?.role as Role | undefined;
  const canWrite = role ? roleCanWrite("/dashboard/seo/redirects", role) : false;

  const [rows, setRows] = useState<RedirectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromPath, setFromPath] = useState("");
  const [toPath, setToPath] = useState("");
  const [type, setType] = useState<"301" | "302">("301");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardFetch("/api/dashboard/seo/redirects");
      if (!res.ok) throw new Error("Failed to load redirects");
      const data = (await res.json()) as { redirects?: RedirectRow[] };
      setRows(data.redirects ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const create = async () => {
    if (!fromPath.trim() || !toPath.trim()) return;
    setSaving(true);
    try {
      const res = await dashboardFetch("/api/dashboard/seo/redirects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromPath, toPath, type }),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(d.error ?? "Create failed");
      }
      setFromPath("");
      setToPath("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    const res = await dashboardFetch(`/api/dashboard/seo/redirects/${id}`, {
      method: "DELETE",
    });
    if (res.ok) await load();
  };

  const columns: DataTableColumn<RedirectRow>[] = [
    {
      key: "from",
      header: "Old URL",
      cell: (r) => <code className="text-sm text-white/80">{r.fromPath}</code>,
    },
    {
      key: "arrow",
      header: "",
      cell: () => <span className="text-white/30">↓</span>,
    },
    {
      key: "to",
      header: "New URL",
      cell: (r) => <code className="text-sm text-[var(--dash-accent)]">{r.toPath}</code>,
    },
    {
      key: "type",
      header: "Type",
      cell: (r) => <span className="font-mono text-sm">{r.type}</span>,
    },
    {
      key: "status",
      header: "Test",
      cell: (r) => (
        <DashboardStatusBadge tone={STATUS_TONE[r.testStatus] ?? "neutral"}>
          {r.testStatus}
        </DashboardStatusBadge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (r) =>
        canWrite ? (
          <button type="button" onClick={() => void remove(r._id)} className="text-red-300 hover:text-red-200">
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null,
    },
  ];

  return (
    <DashboardModuleFrame
      toolbar={
        <DashboardListToolbar
          meta={`${rows.length} redirect${rows.length === 1 ? "" : "s"}`}
          onRefresh={load}
          refreshing={loading}
        />
      }
      error={error}
      loading={loading && rows.length === 0}
      loadingLabel="Loading redirects…"
    >
      {canWrite && (
        <DashboardFilterBar
          split
          actions={
            <button
              type="button"
              disabled={saving}
              onClick={() => void create()}
              className={`${dash.btn} ${dash.btnAccent} ${dash.btnDense}`}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add
            </button>
          }
        >
          <input
            className={`${dash.inputCompact} flex-1 min-w-[8rem]`}
            placeholder="/old-blog-url"
            value={fromPath}
            onChange={(e) => setFromPath(e.target.value)}
          />
          <input
            className={`${dash.inputCompact} flex-1 min-w-[8rem]`}
            placeholder="/new-blog-url"
            value={toPath}
            onChange={(e) => setToPath(e.target.value)}
          />
          <select
            className={`${dash.inputCompact} ${dash.filterSelect}`}
            value={type}
            onChange={(e) => setType(e.target.value as "301" | "302")}
          >
            <option value="301">301 Permanent</option>
            <option value="302">302 Temporary</option>
          </select>
        </DashboardFilterBar>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r._id}
        emptyMessage="No redirects yet. Create one when slugs change or URLs move."
        caption="Redirects"
        stickyFirstColumn
        dense
      />

      {!canWrite && (
        <p className={`${dash.muted} mt-4`}>
          Editors have read-only access. SEO Managers and Admins can create redirects.
        </p>
      )}
    </DashboardModuleFrame>
  );
}
