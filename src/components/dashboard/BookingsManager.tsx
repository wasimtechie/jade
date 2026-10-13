"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { formatBookingSource } from "@/lib/bookings/sourceLabels";
import { dashboardFetch } from "@/lib/dashboard/dashboardFetch";
import { dash } from "@/lib/dashboard/dashboardClasses";
import { formatPaise } from "@/lib/money";
import { DataTable, type DataTableColumn } from "./DataTable";
import { DashStatusChip } from "./form";
import { DashboardFilterBar } from "./ui/DashboardFilterBar";
import { DashboardListToolbar } from "./ui/DashboardListToolbar";
import { DashboardModuleFrame } from "./ui/DashboardModuleFrame";
import { DashboardTabBar } from "./ui/DashboardTabBar";

export type BookingListRow = {
  id: string;
  bookingToken: string;
  villaName: string;
  villaSlug: string | null;
  guestName: string;
  guestEmail: string | null;
  checkIn: string;
  checkOut: string;
  status: string;
  source: string;
  paymentStatus: string;
  totalPaise: number;
  axisRoomsReservationId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

const STATUS_STYLE: Record<string, "success" | "warning" | "danger" | "accent" | "neutral"> = {
  confirmed: "success",
  on_hold: "accent",
  pending: "warning",
  conflict: "danger",
  cancelled: "neutral",
  expired: "neutral",
};

const STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  { value: "confirmed", label: "Confirmed" },
  { value: "on_hold", label: "On hold" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
  { value: "conflict", label: "Conflict" },
] as const;

const SOURCE_FILTERS = [
  { value: "", label: "All channels" },
  { value: "website", label: "Direct" },
  { value: "admin_manual", label: "Staff manual" },
  { value: "axisrooms_airbnb", label: "Airbnb OTA" },
  { value: "axisrooms_booking_com", label: "Booking.com OTA" },
] as const;

function fmtDate(dateStr: string): string {
  return new Date(`${dateStr.split("T")[0]}T00:00:00.000Z`).toLocaleDateString(
    "en-IN",
    { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" },
  );
}

function fmtWhen(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function BookingsManager() {
  const [rows, setRows] = useState<BookingListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (sourceFilter) params.set("source", sourceFilter);
      const qs = params.toString();
      const res = await dashboardFetch(
        `/api/dashboard/bookings${qs ? `?${qs}` : ""}`,
      );
      if (!res.ok) throw new Error("Failed to load bookings");
      const data = (await res.json()) as { bookings?: BookingListRow[] };
      setRows(data.bookings ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, sourceFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const columns: DataTableColumn<BookingListRow>[] = useMemo(
    () => [
      {
        key: "guest",
        header: "Guest / Villa",
        cell: (r) => (
          <div className="min-w-0">
            <p className="truncate font-bold text-white" title={r.guestName}>
              {r.guestName}
            </p>
            <p
              className="truncate text-sm text-[color:var(--dash-text-secondary)]"
              title={r.villaName}
            >
              {r.villaName}
            </p>
          </div>
        ),
      },
      {
        key: "dates",
        header: "Stay",
        cell: (r) => (
          <span className="font-manrope text-sm text-white/75">
            {fmtDate(r.checkIn)} → {fmtDate(r.checkOut)}
          </span>
        ),
      },
      {
        key: "channel",
        header: "Channel",
        cell: (r) => (
          <span className="font-manrope text-xs font-bold uppercase tracking-widest text-[color:var(--dash-text-muted)]">
            {formatBookingSource(r.source).shortLabel}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (r) => (
          <DashStatusChip variant={STATUS_STYLE[r.status] ?? "neutral"}>
            {r.status.replace(/_/g, " ")}
          </DashStatusChip>
        ),
      },
      {
        key: "total",
        header: "Total",
        cell: (r) => (
          <span className="font-philosopher text-base text-white">
            {formatPaise(r.totalPaise)}
          </span>
        ),
      },
      {
        key: "folio",
        header: "",
        cell: (r) => (
          <Link
            href={`/dashboard/bookings/${r.id}`}
            className={`${dash.btn} ${dash.btnText} ${dash.btnDense}`}
          >
            Open folio
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </Link>
        ),
      },
    ],
    [],
  );

  return (
    <DashboardModuleFrame
      toolbar={
        <DashboardListToolbar
          meta={
            <span className="font-manrope text-sm text-white/55">
              {rows.length} booking{rows.length === 1 ? "" : "s"}
              {statusFilter || sourceFilter ? " (filtered)" : ""}
            </span>
          }
          onRefresh={load}
          refreshing={loading}
        />
      }
      error={error}
      loading={loading}
      loadingLabel="Loading booking records…"
    >
      <DashboardFilterBar compact className="mb-4">
        <DashboardTabBar
          tabs={STATUS_FILTERS.map((f) => ({
            id: f.value || "all",
            label: f.label,
          }))}
          active={statusFilter || "all"}
          onChange={(id) => setStatusFilter(id === "all" ? "" : id)}
        />
        <DashboardTabBar
          tabs={SOURCE_FILTERS.map((f) => ({
            id: f.value || "all",
            label: f.label,
          }))}
          active={sourceFilter || "all"}
          onChange={(id) => setSourceFilter(id === "all" ? "" : id)}
        />
      </DashboardFilterBar>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        emptyMessage="No bookings match these filters."
        caption="Booking records — direct, staff, and OTA"
        stickyFirstColumn
        dense
      />
      {!loading && rows.length > 0 && (
        <p className="mt-3 font-manrope text-xs text-[color:var(--dash-text-muted)]">
          Last updated {fmtWhen(rows[0]?.updatedAt ?? null)} on most recent row.
          Open any row for full folio and activity history.
        </p>
      )}
    </DashboardModuleFrame>
  );
}
