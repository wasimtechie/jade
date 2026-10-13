import crypto from "node:crypto";

export function verifyRazorpayCheckoutSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string | null | undefined;
  secret: string;
}): boolean {
  if (!params.signature) return false;
  const expected = crypto
    .createHmac("sha256", params.secret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  if (expected.length !== params.signature.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(expected, "utf8"),
    Buffer.from(params.signature, "utf8"),
  );
}
