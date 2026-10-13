/** Client-side validation for dashboard forms — mirrors server Zod rules where possible. */

export type FieldErrors = Record<string, string>;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizePhone(raw: string): string {
  return raw.replace(/[^\d+]/g, "").trim();
}

export function validateManualBooking(input: {
  villaSlug: string;
  checkIn: string;
  checkOut: string;
  fullName: string;
  email: string;
  phone: string;
  guests: number;
  notes?: string;
  maxGuests?: number;
}): FieldErrors {
  const errors: FieldErrors = {};

  if (!input.villaSlug?.trim()) {
    errors.villaSlug = "Select a villa";
  }

  if (!ISO_DATE.test(input.checkIn)) {
    errors.checkIn = "Enter a valid check-in date";
  }
  if (!ISO_DATE.test(input.checkOut)) {
    errors.checkOut = "Enter a valid check-out date";
  }
  if (
    ISO_DATE.test(input.checkIn) &&
    ISO_DATE.test(input.checkOut) &&
    input.checkIn >= input.checkOut
  ) {
    errors.checkOut = "Check-out must be after check-in";
  }

  const name = input.fullName.trim();
  if (name.length < 2) {
    errors.fullName = "Enter the guest's full name (at least 2 characters)";
  } else if (name.length > 200) {
    errors.fullName = "Name is too long (max 200 characters)";
  }

  const email = input.email.trim().toLowerCase();
  if (!email) {
    errors.email = "Email is required";
  } else if (!EMAIL_RE.test(email) || email.length > 254) {
    errors.email = "Enter a valid email address";
  }

  const phone = normalizePhone(input.phone);
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) {
    errors.phone = "Enter a valid phone number (at least 10 digits)";
  } else if (phone.length > 32) {
    errors.phone = "Phone number is too long";
  }

  const max = input.maxGuests ?? 500;
  if (!Number.isFinite(input.guests) || input.guests < 1) {
    errors.guests = "At least 1 guest is required";
  } else if (input.guests > max) {
    errors.guests = `Maximum ${max} guests for this villa`;
  }

  const notes = (input.notes ?? "").trim();
  if (notes.length > 2000) {
    errors.notes = "Notes cannot exceed 2000 characters";
  }

  return errors;
}

export function validateManualBlock(input: {
  villaSlug: string;
  checkIn: string;
  checkOut: string;
  reason?: string;
}): FieldErrors {
  const errors: FieldErrors = {};

  if (!input.villaSlug?.trim()) {
    errors.villaSlug = "Select a villa";
  }
  if (!ISO_DATE.test(input.checkIn)) {
    errors.checkIn = "Enter a valid start date";
  }
  if (!ISO_DATE.test(input.checkOut)) {
    errors.checkOut = "Enter a valid end date";
  }
  if (
    ISO_DATE.test(input.checkIn) &&
    ISO_DATE.test(input.checkOut) &&
    input.checkIn >= input.checkOut
  ) {
    errors.checkOut = "End date must be after start date";
  }
  const reason = (input.reason ?? "").trim();
  if (reason.length > 500) {
    errors.reason = "Reason cannot exceed 500 characters";
  }

  return errors;
}
