import { parseRecipients } from "@/lib/email/parseRecipients";

/** Locked staff inbox — all operational notifications (bookings, leads, careers, partner, conflicts). */
export const STAFF_NOTIFY_INBOX = "Enquiry@jaderetreats.com";

/** Staff alert recipients. Always `Enquiry@jaderetreats.com` unless `STAFF_NOTIFY_EMAIL` overrides for dev. */
export function getStaffNotifyRecipients(): string[] {
  const configured = parseRecipients(process.env.STAFF_NOTIFY_EMAIL);
  if (configured.length > 0) return configured;
  return parseRecipients(STAFF_NOTIFY_INBOX);
}

export function firstStaffRecipient(): string {
  return getStaffNotifyRecipients()[0] ?? STAFF_NOTIFY_INBOX.toLowerCase();
}
