"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Briefcase, Download, Loader2 } from "lucide-react";
import { dashboardFetch } from "@/lib/dashboard/dashboardFetch";
import { dash } from "@/lib/dashboard/dashboardClasses";
import { roleCanWrite, type Role } from "@/lib/auth/permissions";
import { DataTable, type DataTableColumn } from "./DataTable";
import { DashStatusChip } from "./form";
import { EmptyState } from "./EmptyState";
import { DashboardListToolbar } from "./ui/DashboardListToolbar";
import { DashboardModuleFrame } from "./ui/DashboardModuleFrame";
import { DashboardPanel } from "./DashboardPanel";

export type CareerRow = {
  id: string;
  jobId: string;
  jobTitle: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: string;
  statusLabel: string;
  resumeFilename: string | null;
  hasResume: boolean;
  sourcePage: string | null;
  createdAt: string | null;
};

const STATUS_VARIANT: Record<string, "info" | "success" | "warning" | "danger" | "accent" | "neutral"> = {
  new: "info",
  reviewing: "warning",
  shortlisted: "accent",
  rejected: "danger",
  hired: "success",
};

export function CareersManager() {
  const { data: session } = useSession();
  const role = session?.user?.role as Role | undefined;
  const canWrite = role ? roleCanWrite("/dashboard/careers", role) : false;

  const [rows, setRows] = useState<CareerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<CareerRow | null>(null);
  const [statusDraft, setStatusDraft] = useState("new");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardFetch("/api/dashboard/careers?limit=80");
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(d.error ?? "Failed to load applications");
      }
      const data = (await res.json()) as { applications?: CareerRow[] };
      setRows(data.applications ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (selected) setStatusDraft(selected.status);
  }, [selected]);

  const saveStatus = async () => {
    if (!selected || !canWrite) return;
    setSaving(true);
    setError(null);
    try {
      const res = await dashboardFetch("/api/dashboard/careers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selected.id,
          status: statusDraft,
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

  const downloadResume = async (row: CareerRow) => {
    try {
      const res = await dashboardFetch(
        `/api/dashboard/careers/${row.id}/resume`,
      );
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = row.resumeFilename ?? `resume-${row.id.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed");
    }
  };

  const columns: DataTableColumn<CareerRow>[] = [
    {
      key: "when",
      header: "Applied",
      cell: (r) => (
        <span className="text-xs text-white/55">
          {r.createdAt
            ? new Date(r.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </span>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (r) => (
        <div>
          <p className="font-semibold text-white">{r.jobTitle}</p>
          <p className="font-mono text-xs text-white/40">{r.jobId}</p>
        </div>
      ),
    },
    {
      key: "applicant",
      header: "Applicant",
      cell: (r) => (
        <div>
          <p className="text-white">{r.fullName}</p>
          <p className="text-xs text-white/50">{r.email ?? "—"}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => (
        <DashStatusChip variant={STATUS_VARIANT[r.status] ?? "neutral"}>
          {r.statusLabel}
        </DashStatusChip>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (r) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSelected(r)}
            className="font-manrope text-xs font-bold uppercase tracking-widest text-[var(--dash-accent)] hover:underline"
          >
            View
          </button>
          {r.hasResume ? (
            <button
              type="button"
              onClick={() => void downloadResume(r)}
              className="inline-flex items-center gap-1 font-manrope text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white"
            >
              <Download className="h-3.5 w-3.5" />
              CV
            </button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <DashboardModuleFrame
      toolbar={
        <DashboardListToolbar
          meta={`${rows.length} application${rows.length === 1 ? "" : "s"}`}
          onRefresh={load}
          refreshing={loading}
        />
      }
      error={error}
      loading={loading}
      loadingLabel="Loading applications…"
    >
      {rows.length === 0 ? (
        <EmptyState
          icon={<Briefcase />}
          title="No applications yet"
          description="Careers form submissions from /careers appear here with résumé download."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          caption="Career applications"
          dense
        />
      )}

      {selected ? (
        <div className={`${dash.modalOverlay} items-end sm:items-center`}>
          <DashboardPanel pad className="w-full max-w-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--dash-accent)]">
                  {selected.jobTitle}
                </p>
                <h3 className="font-philosopher text-xl text-white">
                  {selected.fullName}
                </h3>
                <p className="text-sm text-white/55">{selected.email}</p>
                {selected.phone ? (
                  <p className="text-sm text-white/45">{selected.phone}</p>
                ) : null}
                {selected.company ? (
                  <p className="text-sm text-white/45">{selected.company}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className={`${dash.btn} ${dash.btnGhost} ${dash.btnDense}`}
              >
                Close
              </button>
            </div>

            {canWrite ? (
              <div className="mt-4 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-widest text-white/40">
                  Status
                  <select
                    value={statusDraft}
                    onChange={(e) => setStatusDraft(e.target.value)}
                    className={`${dash.inputCompact} mt-1 w-full`}
                  >
                    <option value="new">New</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                    <option value="hired">Hired</option>
                  </select>
                </label>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void saveStatus()}
                  className={`${dash.btn} ${dash.btnAccent} w-full`}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Update status
                </button>
              </div>
            ) : null}

            {selected.hasResume ? (
              <button
                type="button"
                onClick={() => void downloadResume(selected)}
                className={`${dash.btn} ${dash.btnGhost} mt-4 w-full`}
              >
                <Download className="h-4 w-4" />
                Download résumé
              </button>
            ) : null}
          </DashboardPanel>
        </div>
      ) : null}
    </DashboardModuleFrame>
  );
}
