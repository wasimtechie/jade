import { timingSafeEqual } from "node:crypto";

/** Constant-time comparison for secrets (admin keys, bearer tokens). Length mismatch returns false quickly. */
export function timingSafeStringEqual(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
