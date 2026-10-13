"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { dashboardFetch } from "@/lib/dashboard/dashboardFetch";
import { dash } from "@/lib/dashboard/dashboardClasses";
import { DataTable, type DataTableColumn } from "./DataTable";
import { DashboardListToolbar } from "./ui/DashboardListToolbar";
import { DashboardModuleFrame } from "./ui/DashboardModuleFrame";

type WebhookRow = {
  _id?: string;
  eventId: string;
  source: string;
  status: string;
  createdAt: string | null;
  payloadPreview?: string | null;
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

function PayloadCell({ eventId, preview }: { eventId: string; preview?: string | null }) {
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<string | null>(preview ?? null);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (payload && payload.length > 200) return;
    setLoading(true);
    try {
      const res = await dashboardFetch(
        `/api/dashboard/dev/logs/webhooks?eventId=${encodeURIComponent(eventId)}`,
      );
      if (res.ok) {
        const data = (await res.json()) as { event?: { payload?: unknown } };
        setPayload(JSON.stringify(data.event?.payload ?? {}, null, 2));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center gap-1 font-manrope text-xs text-[var(--dash-accent)] hover:underline"
      >
        {open ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        Payload
      </button>
      {open && (
        <pre className={dash.logDetail}>
          {loading ? "Loading…" : payload ?? "—"}
        </pre>
      )}
    </div>
  );
}

export function WebhookLogsManager() {
  const [rows, setRows] = useState<WebhookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardFetch("/api/dashboard/dev/logs/webhooks");
      if (!res.ok) throw new Error("Failed to load webhooks");
      const data = (await res.json()) as { events?: WebhookRow[] };
      setRows(data.events ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columns: DataTableColumn<WebhookRow>[] = [
    {
      key: "source",
      header: "Source",
      cell: (r) => (
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--dash-accent)]">
          {r.source}
        </span>
      ),
    },
    {
      key: "eventId",
      header: "Event ID",
      cell: (r) => (
        <span className="font-mono text-xs text-white/60">{r.eventId}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <span className="text-sm text-white/70">{r.status}</span>,
    },
    {
      key: "payload",
      header: "Payload",
      cell: (r) => (
        <PayloadCell eventId={r.eventId} preview={r.payloadPreview} />
      ),
    },
    {
      key: "when",
      header: "Received",
      cell: (r) => (
        <span className="text-sm text-white/50">{fmtWhen(r.createdAt)}</span>
      ),
    },
  ];

  return (
    <DashboardModuleFrame
      toolbar={
        <DashboardListToolbar
          meta={`${rows.length} event${rows.length === 1 ? "" : "s"}`}
          onRefresh={load}
          refreshing={loading}
        />
      }
      error={error}
      loading={loading}
      loadingLabel="Loading webhook events…"
    >
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.eventId + r.source}
        emptyMessage="No webhook events recorded yet."
        caption="Webhook events"
        stickyFirstColumn
        dense
        mono
      />
    </DashboardModuleFrame>
  );
}
