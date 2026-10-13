"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Loader2,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { nightCount } from "@/lib/bookingDates";
import type { BookingHistoryEntry } from "@/lib/bookings/bookingHistory";
import type { BookingRecord } from "@/lib/bookings/store";
import { formatBookingSource } from "@/lib/bookings/sourceLabels";
import { useSession } from "next-auth/react";
import { roleCanWrite, type Role } from "@/lib/auth/permissions";
import { dashboardFetch } from "@/lib/dashboard/dashboardFetch";
import { dash } from "@/lib/dashboard/dashboardClasses";
import { formatPaise } from "@/lib/money";
import { BookingFolioHistory } from "./BookingFolioHistory";
import { RescheduleBookingModal } from "./RescheduleBookingModal";
import { ConfirmExternalPaymentModal } from "./ConfirmExternalPaymentModal";
import { DashboardPanel } from "./DashboardPanel";
import { EmptyState } from "./EmptyState";
import { DashSectionCard, DashStatusChip } from "./form";
import { DashboardModuleFrame } from "./ui/DashboardModuleFrame";

type FolioBooking = BookingRecord & {
  villaSlug?: string;
  villaName?: string;
  axisRoomsReservationId?: string;
};

const CHANNEL_VARIANT: Record<string, "info" | "accent" | "warning"> = {
  direct: "info",
  staff: "accent",
  ota: "warning",
};

const STATUS_VARIANT: Record<string, "success" | "accent" | "warning" | "danger" | "neutral"> = {
  confirmed: "success",
  on_hold: "accent",
  pending: "warning",
  conflict: "danger",
  cancelled: "neutral",
  expired: "neutral",
};

function axisSyncVariant(booking: BookingRecord): {
  text: string;
  variant: "success" | "danger" | "warning";
} {
  if (booking.axisRoomsSynced) {
    return { text: "Axis Rooms · synced", variant: "success" };
  }
  if (booking.axisRoomsLastError) {
    return { text: "Axis Rooms · sync failed", variant: "danger" };
  }
  return { text: "Axis Rooms · pending", variant: "warning" };
}

function fmtDate(dateStr: string): string {
  const d = new Date(`${dateStr.split("T")[0]}T00:00:00.000Z`);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

type BookingFolioProps = {
  bookingId: string;
};

function FolioSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <DashSectionCard title={title} compact className="h-full w-full">
      {children}
    </DashSectionCard>
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-white/5 py-3 last:border-0">
      <dt className="font-manrope text-[length:var(--fs-label)] uppercase tracking-widest text-[color:var(--dash-text-muted)]">
        {label}
      </dt>
      <dd className="font-manrope text-[length:var(--fs-body)] text-white/85 break-words">
        {value}
      </dd>
    </div>
  );
}

export function BookingFolio({ bookingId }: BookingFolioProps) {
  const { data: session } = useSession();
  const role = session?.user?.role as Role | undefined;
  const canWrite = role ? roleCanWrite("/dashboard/bookings", role) : false;

  const [booking, setBooking] = useState<FolioBooking | null>(null);
  const [history, setHistory] = useState<BookingHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [confirmPaymentOpen, setConfirmPaymentOpen] = useState(false);

  const fetchBooking = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await dashboardFetch(`/api/dashboard/bookings/${bookingId}`);
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Booking not found");
      }
      const data = (await res.json()) as {
        booking: FolioBooking;
        history: BookingHistoryEntry[];
      };
      setBooking(data.booking);
      setHistory(data.history ?? []);
      setNotesDraft(data.booking.notes ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load booking");
      setBooking(null);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const runAction = async (
    body: Record<string, unknown>,
    confirmMsg: string,
  ) => {
    if (!window.confirm(confirmMsg)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await dashboardFetch(`/api/dashboard/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Action failed");
      await fetchBooking();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <DashboardModuleFrame loading loadingLabel="Loading booking folio…">
        <></>
      </DashboardModuleFrame>
    );
  }

  if (error || !booking) {
    return (
      <EmptyState
        title="Booking unavailable"
        description={error ?? "This folio could not be loaded."}
        action={
          <Link
            href="/dashboard"
            className={`${dash.btn} ${dash.btnAccent}`}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to calendar
          </Link>
        }
      />
    );
  }

  const nights = nightCount(booking.checkIn, booking.checkOut);
  const axisSync = axisSyncVariant(booking);
  const hasRazorpayPayment = Boolean(booking.payment.paymentId);
  const canConfirmOfflinePayment =
    canWrite &&
    booking.status === "pending" &&
    booking.payment.status === "pending";
  const sourceInfo = formatBookingSource(booking.source);
  const channelVariant = CHANNEL_VARIANT[sourceInfo.channel] ?? "info";
  const statusVariant = STATUS_VARIANT[booking.status] ?? "neutral";

  return (
    <DashboardModuleFrame error={error}>
      <div className="booking-folio flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard"
          className={`${dash.btn} ${dash.btnText} ${dash.btnGhost}`}
        >
          <ArrowLeft className="h-4 w-4" />
          Calendar
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <DashStatusChip variant={channelVariant}>
            {sourceInfo.shortLabel}
          </DashStatusChip>
          <DashStatusChip variant={statusVariant}>
            {booking.status.replace("_", " ")}
          </DashStatusChip>
          <span title={booking.axisRoomsLastError ?? undefined}>
            <DashStatusChip variant={axisSync.variant}>
              {axisSync.text}
            </DashStatusChip>
          </span>
        </div>
      </div>

      {canWrite && booking.status === "on_hold" && (
        <DashboardPanel pad>
          <p className="mb-3 font-manrope text-sm text-white/70">
            This hold blocks OTAs. Confirm after external payment is received, or
            cancel to release inventory.
          </p>
          <div className="booking-folio__actions flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                runAction(
                  { action: "confirm_hold" },
                  "Confirm this booking? External payment should be settled.",
                )
              }
              className={`${dash.btn} ${dash.btnSuccess}`}
            >
              Confirm booking
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                runAction(
                  { action: "confirm_hold", waivePayment: true },
                  "Confirm as comp / waived payment?",
                )
              }
              className={`${dash.btn} ${dash.btnText}`}
            >
              Confirm (waive payment)
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                runAction(
                  { action: "cancel" },
                  "Cancel this hold? OTAs will be reopened for these dates.",
                )
              }
              className={`${dash.btn} ${dash.btnDanger}`}
            >
              Cancel hold
            </button>
          </div>
        </DashboardPanel>
      )}

      {canConfirmOfflinePayment && (
        <DashboardPanel pad>
          <p className="mb-3 font-manrope text-sm text-white/70">
            Payment is pending. If the guest paid offline via UPI, GPay, PhonePe,
            bank transfer, or cash, confirm here so the booking is marked
            confirmed, OTAs are blocked, and the guest receives confirmation
            email.
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => setConfirmPaymentOpen(true)}
            className={`${dash.btn} ${dash.btnSuccess}`}
          >
            Confirm payment received
          </button>
        </DashboardPanel>
      )}

      {canWrite && booking.status !== "cancelled" && (
        <div className="booking-folio__actions flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => setRescheduleOpen(true)}
            className={`${dash.btn} ${dash.btnAccent}`}
          >
            Change dates
          </button>
          {booking.status !== "on_hold" && (
            <>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              runAction(
                { action: "cancel" },
                "Cancel this booking? OTAs will be reopened if inventory was synced.",
              )
            }
            className={`${dash.btn} ${dash.btnDanger}`}
          >
            Cancel
          </button>
          {hasRazorpayPayment &&
            (booking.payment.status === "paid" ||
              booking.payment.status === "deposit_paid") && (
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                runAction(
                  { action: "refund", reason: "staff_manual" },
                  "Issue full Razorpay refund?",
                )
              }
              className={`${dash.btn} ${dash.btnWarning}`}
            >
              Refund
            </button>
          )}
            </>
          )}
        </div>
      )}

      {rescheduleOpen && (
        <RescheduleBookingModal
          booking={booking}
          onClose={() => setRescheduleOpen(false)}
          onSuccess={() => void fetchBooking()}
        />
      )}

      {confirmPaymentOpen && (
        <ConfirmExternalPaymentModal
          booking={booking}
          onClose={() => setConfirmPaymentOpen(false)}
          onSuccess={() => void fetchBooking()}
        />
      )}

      {canWrite && (
        <DashboardPanel pad>
          <label className={`${dash.label} mb-2 block`}>Staff notes</label>
          <textarea
            className={`${dash.input} min-h-[80px] w-full`}
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => runAction({ action: "notes", notes: notesDraft }, "Save notes?")}
            className={`${dash.btn} ${dash.btnAccent} mt-3`}
          >
            Save notes
          </button>
        </DashboardPanel>
      )}


      <div className="grid gap-4 lg:grid-cols-2">
        <FolioSection title="Guest">
          <dl>
            <DetailRow
              label="Name"
              value={
                <span className="inline-flex items-center gap-2">
                  <User className="h-4 w-4 text-[var(--dash-accent)]" aria-hidden />
                  {booking.guestDetails.name}
                </span>
              }
            />
            <DetailRow
              label="Email"
              value={
                <a
                  href={`mailto:${booking.guestDetails.email}`}
                  className="inline-flex items-center gap-2 text-[var(--dash-accent)] hover:underline"
                >
                  <Mail className="h-4 w-4" aria-hidden />
                  {booking.guestDetails.email}
                </a>
              }
            />
            <DetailRow
              label="Phone"
              value={
                <a
                  href={`tel:${booking.guestDetails.phone}`}
                  className="inline-flex items-center gap-2 text-[var(--dash-accent)] hover:underline"
                >
                  <Phone className="h-4 w-4" aria-hidden />
                  {booking.guestDetails.phone}
                </a>
              }
            />
            <DetailRow label="Guests" value={booking.guests} />
            {booking.stayStatus && (
              <DetailRow label="Stay status" value={booking.stayStatus} />
            )}
          </dl>
        </FolioSection>

        <FolioSection title="Stay">
          <dl>
            <DetailRow
              label="Villa"
              value={booking.villaName ?? booking.villaSlug ?? booking.villaId}
            />
            <DetailRow label="Channel" value={sourceInfo.label} />
            <DetailRow label="Type" value={booking.bookingType} />
            <DetailRow
              label="Dates"
              value={
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[var(--dash-accent)]" aria-hidden />
                  {fmtDate(booking.checkIn)} → {fmtDate(booking.checkOut)} (
                  {nights} night{nights === 1 ? "" : "s"})
                </span>
              }
            />
            <DetailRow label="Booking ID" value={booking.id} />
            <DetailRow
              label="Guest reference"
              value={
                <span className="font-mono text-sm">{booking.bookingToken}</span>
              }
            />
            {booking.axisRoomsReservationId && (
              <DetailRow
                label="OTA / Axis reservation #"
                value={
                  <span className="font-mono text-sm">
                    {booking.axisRoomsReservationId}
                  </span>
                }
              />
            )}
            <DetailRow
              label="Created"
              value={new Date(booking.createdAt).toLocaleString("en-IN")}
            />
          </dl>
        </FolioSection>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <FolioSection title="Pricing">
          <dl>
            <DetailRow
              label="Base"
              value={formatPaise(booking.pricing.basePaise)}
            />
            {booking.pricing.extraPaxPaise > 0 && (
              <DetailRow
                label="Extra guests"
                value={formatPaise(booking.pricing.extraPaxPaise)}
              />
            )}
            {booking.pricing.eventPaise > 0 && (
              <DetailRow
                label="Event"
                value={formatPaise(booking.pricing.eventPaise)}
              />
            )}
            {booking.pricing.addOnPaise > 0 && (
              <DetailRow
                label="Add-ons"
                value={formatPaise(booking.pricing.addOnPaise)}
              />
            )}
            <DetailRow
              label="GST"
              value={formatPaise(booking.pricing.taxPaise)}
            />
            <DetailRow
              label="Total"
              value={
                <span className="font-philosopher text-xl text-[var(--dash-accent)]">
                  {formatPaise(booking.pricing.totalPaise)}
                </span>
              }
            />
          </dl>
        </FolioSection>

        <FolioSection title="Payment">
          <dl>
            <DetailRow
              label="Status"
              value={
                <span className="inline-flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-[var(--dash-accent)]" aria-hidden />
                  {booking.payment.status}
                </span>
              }
            />
            <DetailRow
              label="Plan"
              value={booking.payment.paymentPlan}
            />
            <DetailRow
              label="Amount due"
              value={formatPaise(booking.payment.amountDuePaise)}
            />
            <DetailRow
              label="Deposit"
              value={formatPaise(booking.payment.depositPaise)}
            />
            {booking.payment.orderId && (
              <DetailRow
                label="Razorpay order"
                value={
                  <span className="break-all font-mono text-sm">
                    {booking.payment.orderId}
                  </span>
                }
              />
            )}
            {booking.payment.paymentId && (
              <DetailRow
                label="Razorpay payment"
                value={
                  <span className="break-all font-mono text-sm">
                    {booking.payment.paymentId}
                  </span>
                }
              />
            )}
            {booking.payment.externalPaymentRef && (
              <DetailRow
                label="External payment ref"
                value={booking.payment.externalPaymentRef}
              />
            )}
            {booking.payment.balanceDueDate && (
              <DetailRow
                label="Balance due"
                value={fmtDate(booking.payment.balanceDueDate)}
              />
            )}
            {booking.axisRoomsLastError && (
              <DetailRow
                label="Axis sync error"
                value={
                  <span className="text-red-300">{booking.axisRoomsLastError}</span>
                }
              />
            )}
          </dl>
        </FolioSection>
      </div>

      <BookingFolioHistory entries={history} />
      </div>
    </DashboardModuleFrame>
  );
}
