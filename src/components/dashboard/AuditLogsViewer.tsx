"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { dashboardFetch } from "@/lib/dashboard/dashboardFetch";
import { dash } from "@/lib/dashboard/dashboardClasses";
import { DataTable, type DataTableColumn } from "./DataTable";
import { DashboardListToolbar } from "./ui/DashboardListToolbar";
import { DashboardModuleFrame } from "./ui/DashboardModuleFrame";

type LogRow = {
  id: string;
  action: string;
  targetType: string;
  targetId: string | null;
  userId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string | null;
};

type AuditLogsViewerProps = {
  endpoint: string;
  emptyMessage: string;
  actionFilter?: "errors" | "all";
};

function fmtWhen(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function MetadataCell({ metadata }: { metadata: Record<string, unknown> }) {
  const [open, setOpen] = useState(false);
  const keys = Object.keys(metadata);
  if (keys.length === 0) {
    return <span className="text-white/30">—</span>;
  }
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 font-manrope text-xs text-[var(--dash-accent)] hover:underline"
      >
        {open ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        {keys.length} field{keys.length === 1 ? "" : "s"}
      </button>
      {open && (
        <pre className={dash.logDetail}>
          {JSON.stringify(metadata, null, 2)}
        </pre>
      )}
    </div>
  );
}

export function AuditLogsViewer({
  endpoint,
  emptyMessage,
  actionFilter = "all",
}: AuditLogsViewerProps) {
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardFetch(endpoint);
      if (!res.ok) throw new Error("Failed to load logs");
      const data = (await res.json()) as {
        logs?: LogRow[];
        errors?: LogRow[];
      };
      const raw =
        data.logs ??
        (data.errors?.map((e) => ({
          id: String((e as { _id?: string })._id ?? e.id),
          action: (e as { action: string }).action,
          targetType: (e as { targetType: string }).targetType,
          targetId: (e as { targetId?: string }).targetId ?? null,
          userId: (e as { userId?: string }).userId
            ? String((e as { userId: unknown }).userId)
            : null,
          metadata: (e as { metadata?: Record<string, unknown> }).metadata ?? {},
          createdAt: (e as { createdAt?: string }).createdAt ?? null,
        })) ??
          []);
      setRows(raw);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    load();
  }, [load]);

  const columns: DataTableColumn<LogRow>[] = [
    {
      key: "action",
      header: "Action",
      cell: (r) => (
        <span className="font-mono text-xs text-[var(--dash-accent)]">{r.action}</span>
      ),
    },
    {
      key: "target",
      header: "Target",
      cell: (r) => (
        <div className="text-sm text-white/60">
          <p>{r.targetType}</p>
          {r.targetId && (
            <p className="truncate font-mono text-xs text-white/40">
              {r.targetId}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "metadata",
      header: "Metadata",
      cell: (r) => <MetadataCell metadata={r.metadata} />,
    },
    {
      key: "when",
      header: "Time",
      cell: (r) => (
        <span className="text-sm text-white/50">{fmtWhen(r.createdAt)}</span>
      ),
    },
  ];

  return (
    <DashboardModuleFrame
      toolbar={
        <DashboardListToolbar
          meta={`${rows.length} log${rows.length === 1 ? "" : "s"}`}
          onRefresh={load}
          refreshing={loading}
        />
      }
      note={
        actionFilter === "errors" ? (
          <p className={dash.muted}>
            Showing audit entries matching failed / error / conflict actions.
          </p>
        ) : undefined
      }
      error={error}
      loading={loading}
    >
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        emptyMessage={emptyMessage}
        caption="Audit logs"
        mono
        dense
      />
    </DashboardModuleFrame>
  );
}
