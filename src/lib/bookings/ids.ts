import crypto from "node:crypto";

export function generateBookingToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function isBookingRef(id: unknown): id is string {
  if (typeof id !== "string" || !id.trim()) return false;
  if (/^[0-9a-fA-F]{24}$/.test(id)) return true;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id,
  );
}
