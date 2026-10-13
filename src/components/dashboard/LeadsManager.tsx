"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Inbox } from "lucide-react";
import { dashboardFetch } from "@/lib/dashboard/dashboardFetch";
import { dash } from "@/lib/dashboard/dashboardClasses";
import { roleCanWrite, type Role } from "@/lib/auth/permissions";
import { summarizeLeadPayload } from "@/lib/leads/presentation";
import { LEAD_SOURCE_LABELS } from "@/lib/leads/sourceLabels";
import { DataTable, type DataTableColumn } from "./DataTable";
import { DashStatusChip } from "./form";
import { EmptyState } from "./EmptyState";
import { LeadDetailView } from "./leads/LeadDetailView";
import { DashboardListToolbar } from "./ui/DashboardListToolbar";
import { DashboardModuleFrame } from "./ui/DashboardModuleFrame";
import { DashboardTabBar } from "./ui/DashboardTabBar";

export type LeadRow = {
  id: string;
  kind: "enquiry" | "partner";
  source: string;
  sourceLabel: string;
  email: string | null;
  name: string;
  phone: string | null;
  status: string;
  staffNotes: string;
  payload: Record<string, unknown>;
  photoCount?: number;
  createdAt: string | null;
};

const STATUS_VARIANT: Record<string, "info" | "success" | "warning" | "neutral"> = {
  new: "info",
  contacted: "warning",
  closed: "success",
};

type TabKind = "enquiry" | "partner";

export function LeadsManager() {
  const { data: session } = useSession();
  const role = session?.user?.role as Role | undefined;
  const canWrite = role ? roleCanWrite("/dashboard/leads", role) : false;

  const [tab, setTab] = useState<TabKind>("enquiry");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<LeadRow | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [statusDraft, setStatusDraft] = useState("new");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ kind: tab, limit: "80" });
      if (tab === "enquiry" && sourceFilter !== "all") {
        params.set("source", sourceFilter);
      }
      const res = await dashboardFetch(`/api/dashboard/leads?${params}`);
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(d.error ?? "Failed to load leads");
      }
      const data = (await res.json()) as { leads?: LeadRow[] };
      setRows(data.leads ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [tab, sourceFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (selected) {
      setNotesDraft(selected.staffNotes);
      setStatusDraft(selected.status);
    }
  }, [selected]);

  const saveLead = async () => {
    if (!selected || !canWrite) return;
    setSaving(true);
    setError(null);
    try {
      const res = await dashboardFetch("/api/dashboard/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: selected.kind,
          leadId: selected.id,
          status: statusDraft,
          staffNotes: notesDraft,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      setSelected(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const sourceTabs = useMemo(
    () => [
      { id: "all", label: "All sources" },
      ...Object.entries(LEAD_SOURCE_LABELS).map(([id, label]) => ({
        id,
        label,
      })),
    ],
    [],
  );

  const displayRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (!needle) return true;
      const summary = summarizeLeadPayload(row.payload, row.kind).join(" ");
      return (
        row.name.toLowerCase().includes(needle) ||
        row.sourceLabel.toLowerCase().includes(needle) ||
        (row.email?.toLowerCase().includes(needle) ?? false) ||
        (row.phone?.toLowerCase().includes(needle) ?? false) ||
        summary.toLowerCase().includes(needle)
      );
    });
  }, [query, rows, statusFilter]);

  const columns: DataTableColumn<LeadRow>[] = [
    {
      key: "when",
      header: "Received",
      cell: (r) => (
        <span className="text-xs text-white/55">
          {r.createdAt
            ? new Date(r.createdAt).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—"}
        </span>
      ),
    },
    {
      key: "source",
      header: "Source",
      cell: (r) => (
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--dash-accent)]">
          {r.sourceLabel}
        </span>
      ),
    },
    {
      key: "guest",
      header: "Contact",
      cell: (r) => (
        <div>
          <p className="font-semibold text-white">{r.name}</p>
          <p className="text-xs text-[color:var(--dash-text-muted)]">{r.email ?? r.phone ?? "—"}</p>
        </div>
      ),
    },
    {
      key: "details",
      header: "Details",
      cell: (r) => {
        const summary = summarizeLeadPayload(r.payload, r.kind);
        return summary.length ? (
          <div className="space-y-1">
            {summary.map((item) => (
              <p key={item} className="text-xs leading-5 text-white/70">
                {item}
              </p>
            ))}
          </div>
        ) : (
          <span className="text-xs text-[color:var(--dash-text-muted)]">Open lead to view details</span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => (
        <DashStatusChip variant={STATUS_VARIANT[r.status] ?? "neutral"}>
          {r.status}
        </DashStatusChip>
      ),
    },
    {
      key: "action",
      header: "",
      cell: (r) => (
        <button
          type="button"
          onClick={() => setSelected(r)}
          className="font-manrope text-xs font-bold uppercase tracking-widest text-[var(--dash-accent)] hover:underline"
        >
          View
        </button>
      ),
    },
  ];

  return (
    <DashboardModuleFrame
      toolbar={
        <DashboardListToolbar
          meta={`${displayRows.length} of ${rows.length} lead${rows.length === 1 ? "" : "s"}`}
          onRefresh={load}
          refreshing={loading}
        >
          <div className={dash.toolbarSegment}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, source, date, guests…"
              className={`${dash.inputCompact} min-w-[220px]`}
            />
          </div>
          <div className={dash.toolbarSegment}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`${dash.inputCompact} min-w-[140px]`}
            >
              <option value="all">All statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </DashboardListToolbar>
      }
      error={error}
      loading={loading}
      loadingLabel="Loading leads…"
    >
      <DashboardTabBar
        tabs={[
          { id: "enquiry", label: "Enquiries" },
          { id: "partner", label: "Partner leads" },
        ]}
        active={tab}
        onChange={(id) => {
          setTab(id as TabKind);
          setSelected(null);
        }}
        className="mb-4"
      />

      {tab === "enquiry" ? (
        <DashboardTabBar
          tabs={sourceTabs}
          active={sourceFilter}
          onChange={setSourceFilter}
          className="mb-4"
        />
      ) : null}

      {displayRows.length === 0 ? (
        <EmptyState
          icon={<Inbox />}
          title={rows.length === 0 ? "No leads yet" : "No matching leads"}
          description={
            rows.length === 0
              ? "Enquiry form submissions from the public site appear here with their page tag (Wedding, Party villas, etc.)."
              : "Try a different search term or reset the status filter."
          }
        />
      ) : (
        <DataTable
          columns={columns}
          rows={displayRows}
          rowKey={(r) => `${r.kind}-${r.id}`}
          caption="Leads and enquiries"
          dense
        />
      )}

      {selected ? (
        <LeadDetailView
          lead={selected}
          notesDraft={notesDraft}
          statusDraft={statusDraft}
          canWrite={canWrite}
          saving={saving}
          onNotesChange={setNotesDraft}
          onStatusChange={setStatusDraft}
          onSave={() => void saveLead()}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </DashboardModuleFrame>
  );
}
