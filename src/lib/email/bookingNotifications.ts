import { createElement } from "react";
import { BookingConflictNotificationEmail } from "@/emails/BookingConflictNotification";
import { GuestBookingConfirmationEmail } from "@/emails/GuestBookingConfirmation";
import { GuestBookingModifiedEmail } from "@/emails/GuestBookingModified";
import { StaffBookingModifiedEmail } from "@/emails/StaffBookingModified";
import { StaffBookingNotificationEmail } from "@/emails/StaffBookingNotification";
import { getAddOn } from "@/lib/bookings/addOnCatalog";
import { formatBookingSource } from "@/lib/bookings/sourceLabels";
import type { AddOnLine, PaymentPlan } from "@/lib/bookings/types";
import {
  formatInrFromPaise,
  formatPricingDeltaLabel,
} from "@/lib/email/dateChangeEmail";
import { renderEmail } from "@/lib/email/renderEmail";
import { sendTransactionalEmail } from "@/lib/email/resendOutbound";
import {
  firstStaffRecipient,
  getStaffNotifyRecipients,
} from "@/lib/email/staffRecipients";
import { getSiteBaseUrl } from "@/lib/siteUrl";

export type BookingConfirmedEmailParams = {
  bookingId: string;
  villaName: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guests?: number;
  adults?: number;
  children?: number;
  pets?: number;
  bookingType?: "stay" | "day_out" | "event";
  paymentPlan?: PaymentPlan;
  notes?: string;
  addOns?: AddOnLine[];
  basePaise?: number;
  extraPaxPaise?: number;
  eventPaise?: number;
  addOnPaise?: number;
  taxPaise?: number;
  quoteOnlyAddOnIds?: string[];
  totalPaise: number;
  paymentStatus: string;
  source?: string;
};

function paymentStatusLabel(status: string): string {
  switch (status) {
    case "paid":
      return "Paid in full";
    case "deposit_paid":
      return "Deposit paid";
    case "external":
      return "External / offline payment";
    case "not_applicable":
      return "Complimentary / waived";
    case "pending":
      return "Payment pending";
    default:
      return status.replace(/_/g, " ");
  }
}

function paymentPlanLabel(plan?: PaymentPlan): string | undefined {
  if (!plan) return undefined;
  return plan === "deposit" ? "Deposit" : "Full payment";
}

function guestSummary(params: {
  guests?: number;
  adults?: number;
  children?: number;
  pets?: number;
}): string | undefined {
  const parts = [];
  if (params.guests != null) parts.push(`${params.guests} total`);
  if (params.adults != null) parts.push(`${params.adults} adults`);
  if (params.children) parts.push(`${params.children} children`);
  if (params.pets) parts.push(`${params.pets} pets`);
  return parts.length ? parts.join(" · ") : undefined;
}

function addOnSummary(
  addOns: AddOnLine[] | undefined,
  guestCount: number,
  quoteOnlyIds: string[] | undefined,
): string | undefined {
  const lines: string[] = [];
  for (const line of addOns ?? []) {
    const entry = getAddOn(line.id);
    if (!entry) {
      lines.push(`${line.id} × ${Math.max(1, line.quantity)}`);
      continue;
    }
    if (entry.mode === "flat") {
      const subtotal = entry.pricePaise * Math.max(1, line.quantity);
      lines.push(
        `${entry.label} × ${Math.max(1, line.quantity)} — ${formatInrFromPaise(subtotal)}`,
      );
      continue;
    }
    if (entry.mode === "perPerson") {
      const pax = Math.max(Math.max(1, line.quantity), guestCount, entry.minPax);
      const subtotal = entry.pricePerPersonPaise * pax;
      lines.push(
        `${entry.label} — ${formatInrFromPaise(
          entry.pricePerPersonPaise,
        )} per person × ${pax} = ${formatInrFromPaise(subtotal)}`,
      );
      continue;
    }
    lines.push(`${entry.label} — Quote on request`);
  }
  for (const id of quoteOnlyIds ?? []) {
    if ((addOns ?? []).some((line) => line.id === id)) continue;
    const entry = getAddOn(id);
    lines.push(`${entry?.label ?? id} — Quote on request`);
  }
  return lines.length ? lines.join("\n") : undefined;
}

type PricingSummaryParams = {
  basePaise?: number;
  extraPaxPaise?: number;
  eventPaise?: number;
  addOnPaise?: number;
  taxPaise?: number;
  totalPaise: number;
};

function pricingSummary(params: PricingSummaryParams): string | undefined {
  const lines: string[] = [];
  if ((params.basePaise ?? 0) > 0) {
    lines.push(`Stay / package — ${formatInrFromPaise(params.basePaise ?? 0)}`);
  }
  if ((params.extraPaxPaise ?? 0) > 0) {
    lines.push(
      `Extra guest charges — ${formatInrFromPaise(params.extraPaxPaise ?? 0)}`,
    );
  }
  if ((params.eventPaise ?? 0) > 0) {
    lines.push(`Event package — ${formatInrFromPaise(params.eventPaise ?? 0)}`);
  }
  if ((params.addOnPaise ?? 0) > 0) {
    lines.push(`Add-ons — ${formatInrFromPaise(params.addOnPaise ?? 0)}`);
  }
  if ((params.taxPaise ?? 0) > 0) {
    lines.push(`Taxes — ${formatInrFromPaise(params.taxPaise ?? 0)}`);
  }
  lines.push(`Total — ${formatInrFromPaise(params.totalPaise)}`);
  return lines.join("\n");
}

/** Staff + guest emails when a booking reaches confirmed status. */
export async function notifyBookingConfirmed(
  params: BookingConfirmedEmailParams,
): Promise<void> {
  const staffTo = getStaffNotifyRecipients();
  const skipGuestEmail =
    process.env.BOOKING_GUEST_CONFIRM_EMAIL === "false";
  const sourceLabel = formatBookingSource(params.source).label;
  const totalInr = formatInrFromPaise(params.totalPaise);
  const payLabel = paymentStatusLabel(params.paymentStatus);
  const payPlanLabel = paymentPlanLabel(params.paymentPlan);
  const dashboardUrl = `${getSiteBaseUrl()}/dashboard/bookings/${params.bookingId}`;
  const guestEmail = params.guestEmail?.trim().toLowerCase() ?? "";
  const guestMix = guestSummary(params);
  const addOnsText = addOnSummary(
    params.addOns,
    params.guests ?? params.adults ?? 1,
    params.quoteOnlyAddOnIds,
  );
  const pricingText = pricingSummary(params);

  if (staffTo.length > 0) {
    const staffRendered = await renderEmail(
      createElement(StaffBookingNotificationEmail, {
        bookingId: params.bookingId,
        villaName: params.villaName,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        guestName: params.guestName,
        guestEmail,
        guestPhone: params.guestPhone,
        guests: params.guests,
        guestMix,
        totalInr,
        paymentStatus: payLabel,
        paymentPlan: payPlanLabel,
        sourceLabel,
        bookingType: params.bookingType,
        notes: params.notes,
        addOnsText,
        pricingText,
        dashboardUrl,
      }),
    );
    const r = await sendTransactionalEmail({
      to: staffTo,
      subject: `[Jade] Booking confirmed — ${params.villaName}`,
      text: staffRendered.text,
      html: staffRendered.html,
      replyTo: guestEmail || undefined,
    });
    if (!r.sent) console.warn("[booking email staff]", r.reason);
  }

  if (!skipGuestEmail && guestEmail) {
    const guestRendered = await renderEmail(
      createElement(GuestBookingConfirmationEmail, {
        guestName: params.guestName,
        bookingId: params.bookingId,
        villaName: params.villaName,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        paymentStatus: payLabel,
        paymentPlan: payPlanLabel,
        totalInr,
        guestMix,
        notes: params.notes,
        addOnsText,
        pricingText,
        contactPhone: "+91 80 1234 5678",
        cancellationNote:
          "Cancellation terms apply as per your booking agreement. Contact us for changes.",
      }),
    );
    const r = await sendTransactionalEmail({
      to: [guestEmail],
      subject: `Your booking is confirmed — ${params.villaName}`,
      text: guestRendered.text,
      html: guestRendered.html,
      replyTo: firstStaffRecipient(),
    });
    if (!r.sent) console.warn("[booking email guest]", r.reason);
  }
}

export type BookingDatesModifiedEmailParams = {
  bookingId: string;
  villaName: string;
  oldCheckIn: string;
  oldCheckOut: string;
  newCheckIn: string;
  newCheckOut: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guests?: number;
  adults?: number;
  children?: number;
  pets?: number;
  bookingType?: "stay" | "day_out" | "event";
  paymentPlan?: PaymentPlan;
  notes?: string;
  addOns?: AddOnLine[];
  basePaise?: number;
  extraPaxPaise?: number;
  eventPaise?: number;
  addOnPaise?: number;
  taxPaise?: number;
  quoteOnlyAddOnIds?: string[];
  oldTotalPaise: number;
  newTotalPaise: number;
  paymentStatus: string;
  source?: string;
};

/** Staff + guest emails when staff changes stay dates. */
export async function notifyBookingDatesModified(
  params: BookingDatesModifiedEmailParams,
): Promise<void> {
  const staffTo = getStaffNotifyRecipients();
  const skipGuestEmail =
    process.env.BOOKING_GUEST_CONFIRM_EMAIL === "false";
  const sourceLabel = formatBookingSource(params.source).label;
  const previousTotalInr = formatInrFromPaise(params.oldTotalPaise);
  const newTotalInr = formatInrFromPaise(params.newTotalPaise);
  const pricingDeltaLabel = formatPricingDeltaLabel(
    params.oldTotalPaise,
    params.newTotalPaise,
  );
  const payLabel = paymentStatusLabel(params.paymentStatus);
  const payPlanLabel = paymentPlanLabel(params.paymentPlan);
  const dashboardUrl = `${getSiteBaseUrl()}/dashboard/bookings/${params.bookingId}`;
  const guestEmail = params.guestEmail?.trim().toLowerCase() ?? "";
  const guestMix = guestSummary(params);
  const addOnsText = addOnSummary(
    params.addOns,
    params.guests ?? params.adults ?? 1,
    params.quoteOnlyAddOnIds,
  );
  const pricingText = pricingSummary({
    ...params,
    totalPaise: params.newTotalPaise,
  });

  if (staffTo.length > 0) {
    const staffRendered = await renderEmail(
      createElement(StaffBookingModifiedEmail, {
        bookingId: params.bookingId,
        villaName: params.villaName,
        previousCheckIn: params.oldCheckIn,
        previousCheckOut: params.oldCheckOut,
        newCheckIn: params.newCheckIn,
        newCheckOut: params.newCheckOut,
        guestName: params.guestName,
        guestEmail,
        guestPhone: params.guestPhone,
        guests: params.guests,
        guestMix,
        previousTotalInr,
        newTotalInr,
        pricingDeltaLabel,
        paymentStatus: payLabel,
        paymentPlan: payPlanLabel,
        sourceLabel,
        bookingType: params.bookingType,
        notes: params.notes,
        addOnsText,
        pricingText,
        dashboardUrl,
      }),
    );
    const r = await sendTransactionalEmail({
      to: staffTo,
      subject: `[Jade] Booking dates modified — ${params.villaName}`,
      text: staffRendered.text,
      html: staffRendered.html,
      replyTo: guestEmail || undefined,
    });
    if (!r.sent) console.warn("[booking modify email staff]", r.reason);
  }

  if (!skipGuestEmail && guestEmail) {
    const guestRendered = await renderEmail(
      createElement(GuestBookingModifiedEmail, {
        guestName: params.guestName,
        bookingId: params.bookingId,
        villaName: params.villaName,
        previousCheckIn: params.oldCheckIn,
        previousCheckOut: params.oldCheckOut,
        newCheckIn: params.newCheckIn,
        newCheckOut: params.newCheckOut,
        paymentStatus: payLabel,
        paymentPlan: payPlanLabel,
        previousTotalInr,
        newTotalInr,
        pricingDeltaLabel,
        guestMix,
        notes: params.notes,
        addOnsText,
        pricingText,
        contactPhone: "+91 80 1234 5678",
        cancellationNote:
          "Cancellation terms continue to apply as per your booking agreement. Contact us if you did not request this change.",
      }),
    );
    const r = await sendTransactionalEmail({
      to: [guestEmail],
      subject: `Your stay dates were updated — ${params.villaName}`,
      text: guestRendered.text,
      html: guestRendered.html,
      replyTo: firstStaffRecipient(),
    });
    if (!r.sent) console.warn("[booking modify email guest]", r.reason);
  }
}

export async function notifyBookingConflict(params: {
  bookingId: string;
  villaName: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  source: string;
  reason?: string;
}): Promise<void> {
  const to = getStaffNotifyRecipients();
  if (to.length === 0) return;

  const conflictsUrl = `${getSiteBaseUrl()}/dashboard/conflicts`;
  const rendered = await renderEmail(
    createElement(BookingConflictNotificationEmail, {
      ...params,
      conflictsUrl,
    }),
  );

  const r = await sendTransactionalEmail({
    to,
    subject: `[Jade] Booking conflict — ${params.villaName}`,
    text: rendered.text,
    html: rendered.html,
  });
  if (!r.sent) console.warn("[conflict email]", r.reason);
}
