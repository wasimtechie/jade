"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { dashboardFetch } from "@/lib/dashboard/dashboardFetch";
import { formatPaise } from "@/lib/money";
import { DataTable, type DataTableColumn } from "./DataTable";
import { DashStatusChip } from "./form";
import { DashboardListToolbar } from "./ui/DashboardListToolbar";
import { DashboardModuleFrame } from "./ui/DashboardModuleFrame";

type PaymentRow = {
  id: string;
  bookingToken: string;
  villaName: string;
  guestName: string;
  paymentStatus: string;
  orderId: string | null;
  paymentId: string | null;
  totalPaise: number;
  refundedPaise: number;
  updatedAt: string | null;
};

function fmtWhen(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  paid: "success",
  deposit_paid: "info",
  refunded: "warning",
  partially_refunded: "warning",
  failed: "danger",
};

export function PaymentsManager() {
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardFetch("/api/dashboard/payments");
      if (!res.ok) throw new Error("Failed to load payments");
      const data = (await res.json()) as { payments?: PaymentRow[] };
      setRows(data.payments ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columns: DataTableColumn<PaymentRow>[] = [
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
      key: "amount",
      header: "Amount",
      cell: (r) => (
        <span className="font-philosopher text-lg text-white">
          {formatPaise(r.totalPaise)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => (
        <DashStatusChip variant={STATUS_VARIANT[r.paymentStatus] ?? "neutral"}>
          {r.paymentStatus.replace(/_/g, " ")}
        </DashStatusChip>
      ),
    },
    {
      key: "razorpay",
      header: "Razorpay",
      cell: (r) => (
        <div className="font-mono text-xs text-[color:var(--dash-text-secondary)]">
          {r.paymentId ? (
            <p className="max-w-[12rem] truncate sm:max-w-[16rem]" title={r.paymentId}>
              {r.paymentId}
            </p>
          ) : (
            <p>—</p>
          )}
          {r.refundedPaise > 0 && (
            <p className="text-amber-300/80">
              Refunded {formatPaise(r.refundedPaise)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "when",
      header: "Updated",
      cell: (r) => (
        <span className="text-sm text-[color:var(--dash-text-muted)]">{fmtWhen(r.updatedAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (r) => (
        <div className="flex flex-wrap justify-end gap-3">
          <Link
            href={`/dashboard/bookings/${r.id}`}
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[var(--dash-accent)] hover:underline"
          >
            Folio
            <ExternalLink className="h-3 w-3" />
          </Link>
          {(r.paymentStatus === "paid" || r.paymentStatus === "deposit_paid") &&
            r.refundedPaise < r.totalPaise && (
              <Link
                href={`/dashboard/bookings/${r.id}`}
                className="text-xs font-bold uppercase tracking-wider text-amber-200 hover:underline"
              >
                Refund
              </Link>
            )}
        </div>
      ),
    },
  ];

  return (
    <DashboardModuleFrame
      toolbar={
        <DashboardListToolbar
          meta={`${rows.length} payment record${rows.length === 1 ? "" : "s"}`}
          onRefresh={load}
          refreshing={loading}
        />
      }
      error={error}
      loading={loading}
      loadingLabel="Loading payments…"
    >
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        emptyMessage="No payment activity yet. Confirmed Razorpay bookings will appear here."
        caption="Payment activity"
        stickyFirstColumn
        dense
      />
    </DashboardModuleFrame>
  );
}
