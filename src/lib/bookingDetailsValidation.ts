import type { UserDetails } from "@/lib/types";
import {
  validateEmail,
  validateFullName,
  validateNotesOptional,
  validatePhone,
} from "@/lib/leadFormValidation";

export type BookingDetailsErrors = Partial<
  Record<keyof UserDetails, string>
>;

export { normalizeBookingPhoneDigits } from "@/lib/leadFormValidation";

export function bookingDetailsFieldErrors(
  details: UserDetails,
): BookingDetailsErrors {
  const errors: BookingDetailsErrors = {};

  const ne = validateFullName(details.fullName);
  if (ne) errors.fullName = ne;

  const pe = validatePhone(details.phone);
  if (pe) errors.phone = pe;

  const ee = validateEmail(details.email);
  if (ee) errors.email = ee;

  const te = validateNotesOptional(details.notes);
  if (te) errors.notes = te;

  return errors;
}

export function isBookingDetailsValid(details: UserDetails): boolean {
  return Object.keys(bookingDetailsFieldErrors(details)).length === 0;
}
