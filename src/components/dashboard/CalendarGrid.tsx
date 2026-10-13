"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, ChevronRight } from "lucide-react";
import {
  addDays,
  expandDateRangeInclusive,
  todayIST,
} from "@/lib/bookingDates";
import { lastOccupiedNight } from "@/lib/calendar/stats";
import type {
  CalendarBlock,
  CalendarMeta,
  CalendarResponse,
  CalendarStats,
  CalendarVilla,
  DayOccupancy,
} from "@/lib/calendar/types";
import type { BookingRecord } from "@/lib/bookings/store";
import type { BookingStatus, StayStatus } from "@/lib/bookings/types";
import { useSession } from "next-auth/react";
import { roleCanWrite, type Role } from "@/lib/auth/permissions";
import { dashboardFetch } from "@/lib/dashboard/dashboardFetch";
import { dash } from "@/lib/dashboard/dashboardClasses";
import {
  BlockFormModal,
  type BlockFormValues,
  type VillaOption,
} from "./BlockFormModal";
import { ManualBookingModal } from "./ManualBookingModal";
import { CalendarStatsBar } from "./CalendarStatsBar";
import {
  CalendarToolbar,
  type CalendarFilters,
  type CalendarWindowDays,
} from "./CalendarToolbar";
import { EmptyState } from "./EmptyState";
import { DashboardPanel } from "./DashboardPanel";
import { DashStatusChip } from "./form";

const STATUS_LEGEND: Record<
  BookingStatus,
  { className: string; label: string; variant: "success" | "warning" | "danger" | "info" | "accent" | "neutral" }
> = {
  confirmed: { className: "dashboard-cal-booking--confirmed", label: "Confirmed", variant: "success" },
  on_hold: { className: "dashboard-cal-booking--on-hold", label: "On hold", variant: "accent" },
  pending: { className: "dashboard-cal-booking--pending", label: "Pending", variant: "warning" },
  conflict: { className: "dashboard-cal-booking--conflict", label: "Conflict", variant: "danger" },
  cancelled: { className: "dashboard-cal-booking--cancelled", label: "Cancelled", variant: "neutral" },
  expired: { className: "dashboard-cal-booking--expired", label: "Expired", variant: "neutral" },
};

const STAY_STRIPE: Record<StayStatus, string> = {
  upcoming: "bg-sky-400",
  in_house: "bg-emerald-400",
  departed: "bg-white/30",
  turnover: "bg-amber-400",
  ready: "bg-emerald-300",
};

const BOOKING_TYPE_LABEL: Record<string, string> = {
  stay: "Stay",
  day_out: "Day",
  event: "Event",
};

function fmtDayLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function fmtRange(from: string, to: string): string {
  return `${fmtDayLabel(from)} — ${fmtDayLabel(to)}`;
}

function isWeekend(dateStr: string): boolean {
  const d = new Date(`${dateStr}T00:00:00.000Z`).getUTCDay();
  return d === 0 || d === 6;
}

function coversNight(
  checkIn: string,
  checkOut: string,
  night: string,
): boolean {
  return night >= checkIn && night < checkOut;
}

function occupancyBarClass(pct: number): string {
  if (pct >= 85) return `${dash.calOccBar} dashboard-cal-occ-bar--high`;
  if (pct >= 50) return `${dash.calOccBar} dashboard-cal-occ-bar--mid`;
  if (pct > 0) return `${dash.calOccBar} dashboard-cal-occ-bar--low`;
  return `${dash.calOccBar} dashboard-cal-occ-bar--0`;
}

function dayCellClass(day: string, today: string): string {
  if (day === today) return dash.calCellToday;
  if (isWeekend(day)) return dash.calCellWeekend;
  return dash.calCell;
}

function dayHeaderClass(day: string, today: string): string {
  if (day === today) return dash.calDayToday;
  if (isWeekend(day)) return dash.calDayWeekend;
  return dash.calDay;
}

type BlockDraft = {
  villaSlug: string;
  checkIn: string;
  checkOut: string;
};

type CalendarGridProps = {
  onRefreshReady?: (refresh: () => void) => void;
  onLoadingChange?: (loading: boolean) => void;
};

export function CalendarGrid({
  onRefreshReady,
  onLoadingChange,
}: CalendarGridProps) {
  const [villas, setVillas] = useState<CalendarVilla[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [blocks, setBlocks] = useState<CalendarBlock[]>([]);
  const [stats, setStats] = useState<CalendarStats | null>(null);
  const [occupancy, setOccupancy] = useState<DayOccupancy[]>([]);
  const [meta, setMeta] = useState<CalendarMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rangeStart, setRangeStart] = useState(() => todayIST());
  const [windowDays, setWindowDays] = useState<CalendarWindowDays>(14);
  const [filters, setFilters] = useState<CalendarFilters>({
    search: "",
    bookableOnly: false,
    weddingOnly: false,
    hideOffline: false,
  });
  const [blockDraft, setBlockDraft] = useState<BlockDraft | null>(null);
  const [manualBookingOpen, setManualBookingOpen] = useState(false);
  const { data: session } = useSession();
  const role = session?.user?.role as Role | undefined;
  const canCreateBooking = role
    ? roleCanWrite("/dashboard/bookings", role)
    : false;

  const rangeEnd = useMemo(
    () => addDays(rangeStart, windowDays - 1),
    [rangeStart, windowDays],
  );

  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    onLoadingChange?.(true);
    setError(null);

    const qs = new URLSearchParams({ from: rangeStart, to: rangeEnd });

    try {
      const res = await dashboardFetch(`/api/dashboard/calendar?${qs}`);
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Failed to load calendar");
      }
      const data = (await res.json()) as CalendarResponse;
      setVillas(data.villas ?? []);
      setBookings(data.bookings ?? []);
      setBlocks(data.blocks ?? []);
      setStats(data.stats ?? null);
      setOccupancy(data.occupancy ?? []);
      setMeta(data.meta ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load calendar");
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  }, [onLoadingChange, rangeEnd, rangeStart]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  useEffect(() => {
    onRefreshReady?.(fetchCalendar);
  }, [fetchCalendar, onRefreshReady]);

  const days = useMemo(
    () => expandDateRangeInclusive(rangeStart, rangeEnd),
    [rangeStart, rangeEnd],
  );

  const filteredVillas = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return villas.filter((v) => {
      if (filters.bookableOnly && v.bookable === false) return false;
      if (filters.hideOffline && v.bookable === false) return false;
      if (filters.weddingOnly && !v.weddingVenue) return false;
      if (!q) return true;
      return (
        v.name.toLowerCase().includes(q) || v.slug.toLowerCase().includes(q)
      );
    });
  }, [villas, filters]);

  const villaOptions: VillaOption[] = useMemo(
    () =>
      filteredVillas.map((v) => ({
        slug: v.slug,
        name: v.name,
        stayMaxPax: v.stayMaxPax,
      })),
    [filteredVillas],
  );

  const cellBooking = useCallback(
    (villaId: string, day: string): BookingRecord | undefined =>
      bookings.find(
        (b) =>
          b.villaId === villaId && coversNight(b.checkIn, b.checkOut, day),
      ),
    [bookings],
  );

  const cellBlock = useCallback(
    (villaId: string, day: string): CalendarBlock | undefined =>
      blocks.find(
        (bl) =>
          bl.villaId === villaId && coversNight(bl.checkIn, bl.checkOut, day),
      ),
    [blocks],
  );

  const shiftRange = (delta: number) => {
    setRangeStart((prev) => addDays(prev, delta));
  };

  const handleFiltersChange = (patch: Partial<CalendarFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const createManualBooking = async (values: {
    villaSlug: string;
    checkIn: string;
    checkOut: string;
    fullName: string;
    email: string;
    phone: string;
    guests: number;
    externalPaymentRef: string;
    balanceDueDate: string;
    notes: string;
  }): Promise<string | null> => {
    const res = await dashboardFetch("/api/dashboard/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        villaSlug: values.villaSlug,
        bookingType: "stay",
        checkIn: values.checkIn,
        checkOut: values.checkOut,
        guests: values.guests,
        adults: values.guests,
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        notes: values.notes,
        externalPaymentRef: values.externalPaymentRef || undefined,
        balanceDueDate: values.balanceDueDate || undefined,
        paymentPlan: "full",
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) return data.error ?? "Failed to create booking";
    await fetchCalendar();
    return null;
  };

  const createBlock = async (
    values: BlockFormValues,
  ): Promise<string | null> => {
    const res = await dashboardFetch("/api/dashboard/blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      axisSync?: { ok: boolean; error?: string };
    };
    if (!res.ok) return data.error ?? "Failed to create block";
    if (data.axisSync && !data.axisSync.ok) {
      window.alert(
        `Block saved. OTA sync ${data.axisSync.error ? `failed: ${data.axisSync.error}` : "pending — check Axis Rooms mapping"}.`,
      );
    }
    await fetchCalendar();
    return null;
  };

  const openQuickBlock = (villaSlug: string, night: string) => {
    setBlockDraft({
      villaSlug,
      checkIn: night,
      checkOut: addDays(night, 1),
    });
  };

  const renderBookingCell = (booking: BookingRecord, day: string) => {
    const canName = meta?.canViewGuestDetails && booking.guestDetails.name;
    const label = canName
      ? booking.guestDetails.name.split(" ")[0] || "Guest"
      : "Occupied";
    const isCheckIn = day === booking.checkIn;
    const isLast = day === lastOccupiedNight(booking.checkIn, booking.checkOut);
    const stayStripe = booking.stayStatus
      ? STAY_STRIPE[booking.stayStatus]
      : null;

    const title = [
      canName ? booking.guestDetails.name : "Occupied",
      booking.status,
      booking.bookingType,
      booking.stayStatus,
      `${booking.checkIn} → ${booking.checkOut}`,
    ]
      .filter(Boolean)
      .join(" · ");

    const className = [
      dash.calBooking,
      `dashboard-cal-booking--${booking.status}`,
      isCheckIn ? "dashboard-cal-booking--checkin" : "",
      isLast ? "dashboard-cal-booking--checkout" : "",
      "relative",
    ]
      .filter(Boolean)
      .join(" ");

    const inner = (
      <>
        <span className="sr-only">{title}</span>
        <span aria-hidden className="truncate max-w-full px-0.5">
          {label}
        </span>
        <span aria-hidden className="dashboard-cal-booking__type">
          {BOOKING_TYPE_LABEL[booking.bookingType] ?? booking.bookingType}
        </span>
        {stayStripe && (
          <span
            aria-hidden
            className={`absolute bottom-0 left-0 right-0 h-0.5 ${stayStripe}`}
          />
        )}
      </>
    );

    if (meta?.canOpenFolio) {
      return (
        <Link href={`/dashboard/bookings/${booking.id}`} className={className} title={title}>
          {inner}
        </Link>
      );
    }

    return (
      <div className={className} title={title}>
        {inner}
      </div>
    );
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--dash-accent)]" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Could not load calendar"
        description={error}
        action={
          <button
            type="button"
            onClick={fetchCalendar}
            className="min-h-[var(--dash-touch)] border border-[var(--dash-accent-border)] px-5 py-2 font-manrope text-xs font-bold uppercase tracking-widest text-[var(--dash-accent)] transition-colors hover:bg-[var(--dash-accent-muted)]"
          >
            Retry
          </button>
        }
      />
    );
  }

  const rangeLabel = fmtRange(days[0]!, days[days.length - 1]!);
  const today = todayIST();

  return (
    <div className="calendar-module">
      {stats && <CalendarStatsBar stats={stats} rangeLabel={`Snapshot · ${rangeLabel}`} />}

      <DashboardPanel
        fill
        pad
        className="calendar-module__panel dashboard-panel--menu-host min-h-[320px] w-full sm:min-h-[420px]"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <CalendarToolbar
            rangeLabel={rangeLabel}
            propertyCount={filteredVillas.length}
            bookableCount={filteredVillas.filter((v) => v.bookable !== false).length}
            windowDays={windowDays}
            onWindowDaysChange={setWindowDays}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onPrev={() => shiftRange(-windowDays)}
            onNext={() => shiftRange(windowDays)}
            onToday={() => setRangeStart(todayIST())}
            onRefresh={fetchCalendar}
            refreshing={loading}
            onManualBooking={
              canCreateBooking ? () => setManualBookingOpen(true) : undefined
            }
          />

          <div className="calendar-legend" role="list" aria-label="Booking status legend">
            {Object.entries(STATUS_LEGEND).map(([status, style]) => (
              <DashStatusChip
                key={status}
                variant={style.variant}
                className="calendar-legend__chip calendar-legend__item"
              >
                <span
                  className={`calendar-legend__swatch ${style.className}`}
                  aria-hidden
                />
                {style.label}
              </DashStatusChip>
            ))}
            <DashStatusChip variant="neutral" className="calendar-legend__chip calendar-legend__item">
              <span
                className="calendar-legend__swatch border border-[var(--dash-border-strong)] bg-zinc-500/50"
                aria-hidden
              />
              Blocked
            </DashStatusChip>
            <DashStatusChip variant="neutral" className="calendar-legend__chip calendar-legend__item">
              <span
                className="calendar-legend__swatch border border-dashed border-white/20 bg-white/5"
                aria-hidden
              />
              Offline
            </DashStatusChip>
            <DashStatusChip variant="accent" className="calendar-legend__chip calendar-legend__item">
              <span
                className="calendar-legend__swatch border border-l-[3px] border-l-[var(--dash-accent)] bg-white/10"
                aria-hidden
              />
              Check-in
            </DashStatusChip>
          </div>

          {filteredVillas.length === 0 ? (
            <EmptyState
              title="No villas match filters"
              description="Adjust search or filter options to see properties on the grid."
            />
          ) : (
            <>
              <p className={dash.calScrollHint}>
                <ChevronRight className="h-4 w-4" aria-hidden />
                Swipe horizontally for dates
              </p>
              <div className={dash.tableWrap}>
                <table className={dash.calTable}>
                  <thead>
                    <tr>
                      <th scope="col" className={dash.calVillaHead}>
                        Villa
                      </th>
                      {days.map((day) => {
                        const occ = occupancy.find((o) => o.date === day);
                        return (
                          <th key={day} scope="col" className={dayHeaderClass(day, today)}>
                            <span className="block">{fmtDayLabel(day)}</span>
                            {occ && (
                              <span className={dash.calDaySub}>
                                {occ.occupancyPct}% · {occ.bookedVillas}/
                                {occ.bookableTotal}
                              </span>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                    <tr>
                      <th scope="row" className={`${dash.calVilla} ${dash.calOccLabel}`}>
                        Occupancy
                      </th>
                      {days.map((day) => {
                        const occ = occupancy.find((o) => o.date === day);
                        const pct = occ?.occupancyPct ?? 0;
                        return (
                          <td key={day} className={dayCellClass(day, today)}>
                            <div
                              className={occupancyBarClass(pct)}
                              title={
                                occ
                                  ? `${occ.bookedVillas} booked, ${occ.blockedVillas} blocked`
                                  : undefined
                              }
                            >
                              {pct}%
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVillas.map((villa) => {
                      const offline = villa.bookable === false;
                      const maintenance = villa.status === "maintenance";
                      return (
                        <tr key={villa.id} className={offline ? "opacity-70" : ""}>
                          <th scope="row" className={dash.calVilla}>
                            <span className={dash.calVillaName}>{villa.name}</span>
                            <span className={dash.calVillaMeta}>
                              {villa.slug}
                              {villa.location ? ` · ${villa.location}` : ""}
                              {offline && " · offline"}
                              {maintenance && " · maintenance"}
                              {villa.weddingVenue && " · wedding"}
                            </span>
                          </th>
                          {days.map((day) => {
                            const cellClass = dayCellClass(day, today);

                            if (offline) {
                              return (
                                <td key={day} className={cellClass}>
                                  <div className={dash.calCellOffline} title="Not bookable online">
                                    <span aria-hidden>—</span>
                                  </div>
                                </td>
                              );
                            }

                            const booking = cellBooking(villa.id, day);
                            const block =
                              !booking ? cellBlock(villa.id, day) : undefined;

                            if (booking) {
                              return (
                                <td key={day} className={cellClass}>
                                  {renderBookingCell(booking, day)}
                                </td>
                              );
                            }

                            if (block) {
                              return (
                                <td key={day} className={cellClass}>
                                  <div
                                    className={dash.calCellBlock}
                                    title={block.reason || "Manual block"}
                                  >
                                    <span className="sr-only">Blocked</span>
                                    <span aria-hidden>Blk</span>
                                  </div>
                                </td>
                              );
                            }

                            return (
                              <td key={day} className={cellClass}>
                                {meta?.canCreateBlocks ? (
                                  <button
                                    type="button"
                                    onClick={() => openQuickBlock(villa.slug, day)}
                                    className={dash.calCellEmpty}
                                    title={`Block ${villa.name} on ${day}`}
                                  >
                                    <Plus className="h-4 w-4 opacity-40" aria-hidden />
                                    <span className="sr-only">Create block for {day}</span>
                                  </button>
                                ) : (
                                  <div className={dash.calCellEmpty} aria-hidden>
                                    <span className="opacity-30">·</span>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {meta?.role === "team" && (
            <p className="font-manrope text-[length:var(--fs-desc)] text-[color:var(--dash-text-muted)]">
              Team view — guest names and folio links are hidden. Assigned villas
              only when configured on your account.
            </p>
          )}
        </div>
      </DashboardPanel>

      {manualBookingOpen && villaOptions.length > 0 && (
        <ManualBookingModal
          villas={villaOptions}
          onClose={() => setManualBookingOpen(false)}
          onSubmit={createManualBooking}
        />
      )}

      {blockDraft && villaOptions.length > 0 && (
        <BlockFormModal
          villas={villaOptions}
          title="Quick block from calendar"
          initialValues={blockDraft}
          onClose={() => setBlockDraft(null)}
          onSubmit={createBlock}
        />
      )}
    </div>
  );
}
