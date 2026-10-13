/**
 * Phone / mobile fields: ASCII digits only (paste-safe).
 * 15-digit cap aligns with E.164 national significant number length.
 */
export function sanitizePhoneDigitsInput(raw: string, maxDigits = 15): string {
  return raw.replace(/\D/g, "").slice(0, maxDigits);
}
