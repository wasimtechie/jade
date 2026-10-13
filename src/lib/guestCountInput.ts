/**
 * Guest-count inputs: ASCII digits only (paste-safe). Max length avoids absurd values.
 */
export function sanitizeGuestCountInput(raw: string, maxDigits = 4): string {
  return raw.replace(/\D/g, "").slice(0, maxDigits);
}
