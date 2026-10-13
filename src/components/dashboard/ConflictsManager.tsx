"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { AlertTriangle, ExternalLink, Loader2 } from "lucide-react";
import { dashboardFetch } from "@/lib/dashboard/dashboardFetch";
import { dash } from "@/lib/dashboard/dashboardClasses";
import { formatPaise } from "@/lib/money";
import { roleCanWrite, type Role } from "@/lib/auth/permissions";
import { DataTable, type DataTableColumn } from "./DataTable";
import { DashStatusChip } from "./form";
import { EmptyState } from "./EmptyState";
import { DashboardListToolbar } from "./ui/DashboardListToolbar";
import { DashboardModuleFrame } from "./ui/DashboardModuleFrame";

export type ConflictRow = {
  id: string;
  bookingToken: string;
  villaName: string;
  villaSlug: string | null;
  guestName: string;
  guestEmail: string | null;
  checkIn: string;
  checkOut: string;
  source: string;
  totalPaise: number;
  paymentStatus: string;
  paymentId: string | null;
  axisRoomsReservationId: string | null;
  axisRoomsLastError: string | null;
  notes: string | null;
  updatedAt: string | null;
};

function fmtDate(dateStr: string): string {
  return new Date(`${dateStr.split("T")[0]}T00:00:00.000Z`).toLocaleDateString(
    "en-IN",
    { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" },
  );
}

function fmtSource(source: string): string {
  return source
    .replace(/^axisrooms_/, "Axis Rooms · ")
    .replace(/^staah_/, "Axis Rooms · ")
    .replace(/_/g, " ");
}

const PAYMENT_VARIANT: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  paid: "success",
  deposit_paid: "info",
  refunded: "warning",
  partially_refunded: "warning",
  failed: "danger",
};

export function ConflictsManager() {
  const { data: session } = useSession();
  const role = session?.user?.role as Role | undefined;
  const canWrite = role ? roleCanWrite("/dashboard/conflicts", role) : false;

  const [conflicts, setConflicts] = useState<ConflictRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardFetch("/api/dashboard/conflicts");
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(d.error ?? "Failed to load conflicts");
      }
      const data = (await res.json()) as { conflicts?: ConflictRow[] };
      setConflicts(data.conflicts ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load conflicts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resolve = useCallback(
    async (
      row: ConflictRow,
      action: "refund" | "confirm_manual" | "cancel",
    ) => {
      const labels = {
        refund: "Refund guest payment and cancel this booking",
        confirm_manual: "Override conflict and confirm this booking",
        cancel: "Cancel without issuing a refund",
      };
      if (!window.confirm(`${labels[action]}?\n\n${row.guestName} · ${row.villaName}`)) {
        return;
      }

      setBusyId(row.id);
      setError(null);
      try {
        const res = await dashboardFetch("/api/dashboard/conflicts", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId: row.id, action }),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) throw new Error(data.error ?? "Resolution failed");
        await load();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Resolution failed");
      } finally {
        setBusyId(null);
      }
    },
    [load],
  );

  const columns: DataTableColumn<ConflictRow>[] = [
    {
      key: "villa",
      header: "Booking",
      cell: (row) => (
        <div>
          <p className="font-bold text-white">{row.villaName}</p>
          <p className="text-[length:var(--fs-desc)] text-white/40">
            {row.guestName} · {fmtDate(row.checkIn)} → {fmtDate(row.checkOut)}
          </p>
          <p className="text-xs text-white/30">{row.bookingToken}</p>
        </div>
      ),
    },
    {
      key: "source",
      header: "Source",
      cell: (row) => (
        <span className="text-[length:var(--fs-desc)] capitalize text-white/60">
          {fmtSource(row.source)}
        </span>
      ),
    },
    {
      key: "payment",
      header: "Payment",
      cell: (row) => (
        <div className="text-[length:var(--fs-desc)] text-white/60">
          <p>{formatPaise(row.totalPaise)}</p>
          <DashStatusChip variant={PAYMENT_VARIANT[row.paymentStatus] ?? "neutral"}>
            {row.paymentStatus.replace(/_/g, " ")}
          </DashStatusChip>
        </div>
      ),
    },
    {
      key: "axisrooms",
      header: "Channel",
      cell: (row) =>
        row.axisRoomsReservationId || row.axisRoomsLastError ? (
          <div className="max-w-[200px] text-[length:var(--fs-desc)] text-white/50">
            {row.axisRoomsReservationId && (
              <p className="truncate">ID: {row.axisRoomsReservationId}</p>
            )}
            {row.axisRoomsLastError && (
              <p className="truncate text-red-300/80" title={row.axisRoomsLastError}>
                {row.axisRoomsLastError}
              </p>
            )}
          </div>
        ) : (
          <span className="text-white/30">—</span>
        ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (row) => {
        const busy = busyId === row.id;
        return (
          <div className="flex flex-col items-end gap-2">
            <Link
              href={`/dashboard/bookings/${row.id}`}
              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[var(--dash-accent)] hover:text-white"
            >
              Folio
              <ExternalLink className="h-3 w-3" />
            </Link>
            {canWrite && (
              <div className="flex flex-wrap justify-end gap-1">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => resolve(row, "confirm_manual")}
                  className={`${dash.btn} ${dash.btnSuccess} ${dash.btnDense}`}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => resolve(row, "refund")}
                  className={`${dash.btn} ${dash.btnWarning} ${dash.btnDense}`}
                >
                  Refund
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => resolve(row, "cancel")}
                  className={`${dash.btn} ${dash.btnText} ${dash.btnDense}`}
                >
                  Cancel
                </button>
              </div>
            )}
            {busy && <Loader2 className="h-4 w-4 animate-spin text-[var(--dash-accent)]" />}
          </div>
        );
      },
    },
  ];

  return (
    <DashboardModuleFrame
      toolbar={
        <DashboardListToolbar
          meta={`${conflicts.length} conflict${conflicts.length === 1 ? "" : "s"}`}
          onRefresh={load}
          refreshing={loading}
        />
      }
      error={error}
      loading={loading}
      loadingLabel="Loading conflicts…"
    >
      {conflicts.length === 0 ? (
        <EmptyState
          icon={<AlertTriangle />}
          title="No conflicts queued"
          description="When Axis Rooms OTA reservations overlap direct bookings, conflict rows appear here for audited refund, confirm, or cancel actions."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={conflicts}
          rowKey={(r) => r.id}
          caption="Booking conflicts"
          stickyFirstColumn
          dense
        />
      )}
    </DashboardModuleFrame>
  );
}
