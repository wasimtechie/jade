import { createHmac, timingSafeEqual } from "node:crypto";

/** Validates `X-Razorpay-Signature` on the raw webhook body (HMAC SHA256, hex-encoded). */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (
    typeof rawBody !== "string" ||
    !signatureHeader ||
    typeof secret !== "string" ||
    !secret.trim()
  ) {
    return false;
  }

  const expectedHex = createHmac("sha256", secret.trim())
    .update(rawBody, "utf8")
    .digest("hex");

  const sigClean = signatureHeader.trim().toLowerCase();
  const expClean = expectedHex.toLowerCase();

  if (!/^[0-9a-f]{64}$/.test(sigClean) || !/^[0-9a-f]{64}$/.test(expClean)) {
    return false;
  }

  try {
    const sigBuf = Buffer.from(sigClean, "hex");
    const expBuf = Buffer.from(expClean, "hex");
    if (sigBuf.length !== expBuf.length) return false;
    return timingSafeEqual(sigBuf, expBuf);
  } catch {
    return false;
  }
}
