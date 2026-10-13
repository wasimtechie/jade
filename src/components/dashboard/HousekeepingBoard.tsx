"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BedDouble, Loader2 } from "lucide-react";
import type { BookingRecord } from "@/lib/bookings/store";
import type { StayStatus } from "@/lib/bookings/types";
import { dashboardFetch } from "@/lib/dashboard/dashboardFetch";
import { todayIST } from "@/lib/bookingDates";
import { formatBookingSource } from "@/lib/bookings/sourceLabels";
import { DashboardPanel } from "./DashboardPanel";
import { EmptyState } from "./EmptyState";
import { DashStatusChip } from "./form";
import { DashboardListToolbar } from "./ui/DashboardListToolbar";
import { DashboardModuleFrame } from "./ui/DashboardModuleFrame";

const STAY_STATUSES: { value: StayStatus; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "in_house", label: "In-house" },
  { value: "departed", label: "Departed" },
  { value: "turnover", label: "Turnover" },
  { value: "ready", label: "Ready" },
];

const STATUS_VARIANT: Record<StayStatus, "info" | "success" | "warning" | "accent" | "neutral"> = {
  upcoming: "info",
  in_house: "success",
  departed: "neutral",
  turnover: "warning",
  ready: "accent",
};

type HKBooking = BookingRecord & { isAssigned?: boolean };

function fmt(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00.000Z`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function HousekeepingBoard() {
  const [bookings, setBookings] = useState<HKBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardFetch("/api/bookings");
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(d.error ?? "Failed to load stays");
      }
      const data = (await res.json()) as { bookings?: HKBooking[] };
      setBookings(data.bookings ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load stays");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const today = todayIST();
  const rows = useMemo(
    () =>
      bookings
        .filter((b) => b.status === "confirmed" && b.checkOut >= today)
        .sort((a, b) => a.checkIn.localeCompare(b.checkIn)),
    [bookings, today],
  );

  const setStatus = useCallback(
    async (booking: HKBooking, stayStatus: StayStatus) => {
      setSavingId(booking.id);
      setError(null);
      try {
        const res = await dashboardFetch(`/api/bookings/${booking.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stayStatus }),
        });
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) throw new Error(d.error ?? "Update failed");
        setBookings((prev) =>
          prev.map((b) => (b.id === booking.id ? { ...b, stayStatus } : b)),
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Update failed");
      } finally {
        setSavingId(null);
      }
    },
    [],
  );

  return (
    <DashboardModuleFrame
      toolbar={
        <DashboardListToolbar
          meta={`${rows.length} active stay${rows.length === 1 ? "" : "s"}`}
          onRefresh={load}
          refreshing={loading}
        />
      }
      error={error}
      loading={loading}
      loadingLabel="Loading stays…"
    >
      {rows.length === 0 ? (
        <EmptyState
          icon={<BedDouble />}
          title="No active stays"
          description="Confirmed bookings with checkout on or after today appear here. After a guest pays on /book, you can update stay status (upcoming → in-house → turnover → ready)."
        />
      ) : (
        <div className="housekeeping-board__grid grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((b) => {
            const current = (b.stayStatus ?? "upcoming") as StayStatus;
            const locked = b.isAssigned === false;
            return (
              <DashboardPanel key={b.id} pad>
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-philosopher text-[length:var(--fs-h3)] capitalize text-white">
                        {b.villaSlug ?? "Villa"}
                      </p>
                      <p className="font-manrope text-[length:var(--fs-desc)] text-white/50">
                        {fmt(b.checkIn)} → {fmt(b.checkOut)}
                      </p>
                      <p className="mt-1 font-manrope text-xs font-bold uppercase tracking-widest text-[color:var(--dash-text-muted)]">
                        {formatBookingSource(b.source).shortLabel}
                      </p>
                    </div>
                    <DashStatusChip variant={STATUS_VARIANT[current]}>
                      {current.replace("_", " ")}
                    </DashStatusChip>
                  </div>

                  {locked ? (
                    <p className="font-manrope text-[length:var(--fs-desc)] text-white/35">
                      Not assigned to you — read only.
                    </p>
                  ) : (
                    <div className="housekeeping-board__chips flex flex-wrap gap-1.5">
                      {STAY_STATUSES.map((s) => (
                        <button
                          key={s.value}
                          onClick={() => setStatus(b, s.value)}
                          disabled={savingId === b.id || current === s.value}
                          className={`min-h-[var(--dash-control-h)] border px-3 font-manrope text-xs font-bold uppercase tracking-widest transition-colors ${
                            current === s.value
                              ? "border-[var(--dash-accent)] bg-[var(--dash-accent)] text-[#1A1C1E]"
                              : "border-white/15 text-white/70 hover:border-white/40 hover:text-white"
                          } disabled:opacity-50`}
                        >
                          {savingId === b.id && current !== s.value ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            s.label
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </DashboardPanel>
            );
          })}
        </div>
      )}
    </DashboardModuleFrame>
  );
}
