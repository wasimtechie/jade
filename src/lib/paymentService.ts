/**
 * PAYMENT SERVICE
 * Calls `POST /api/payments/razorpay-order` when Razorpay env keys exist (server returns 501 if not).
 * Client UI can open Razorpay Checkout with `NEXT_PUBLIC_PAYMENT_GATEWAY_KEY` as `key` + returned `orderId`.
 */

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export interface PaymentSession {
  orderId: string;
  amount: number;
  /** INR whole rupees (UI convenience mirror of amount sent to Razorpay) */
  amountRupees: number;
  /** INR paise returned from order API — pass to Razorpay Checkout `amount` */
  amountSubunits?: number;
  status: "pending" | "processing" | "success" | "failed";
  razorpayOrderId?: string;
  razorpayKeyId?: string;
  /** False when Razorpay is not configured — UI should keep demo / manual flows */
  gatewayConfigured?: boolean;
}

export interface InitiatePaymentOptions {
  /** Links the Razorpay order to booking — amount derived server-side */
  bookingId?: string;
  bookingToken?: string;
}

export async function initiatePayment(
  amountRupees: number,
  referenceId: string,
  opts?: InitiatePaymentOptions,
): Promise<PaymentSession> {
  try {
    const body: Record<string, unknown> = {};
    if (opts?.bookingId) {
      body.bookingId = opts.bookingId;
    } else if (opts?.bookingToken) {
      body.bookingToken = opts.bookingToken;
    } else {
      body.receipt = referenceId.replace(/[^\w-]/g, "").slice(0, 40) || `rc${Date.now()}`;
      body.amountSubunits = Math.max(100, Math.round(amountRupees * 100));
    }

    const res = await fetch("/api/payments/razorpay-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = (await res.json().catch(() => ({}))) as {
      configured?: boolean;
      orderId?: string;
      keyId?: string;
      amount?: number;
      error?: string;
    };

    if (res.ok && data.orderId) {
      const amtSub =
        typeof data.amount === "number"
          ? data.amount
          : Math.max(100, Math.round(amountRupees * 100));
      return {
        orderId: referenceId,
        amount: amountRupees,
        amountRupees,
        amountSubunits: amtSub,
        status: "pending",
        razorpayOrderId: data.orderId,
        razorpayKeyId: data.keyId,
        gatewayConfigured: true,
      };
    }

    console.info("[PaymentService] Gateway unavailable — mock session", data.error ?? res.status);
  } catch (e) {
    console.warn("[PaymentService] Order request failed, using mock:", e);
  }

  await delay(400);

  return {
    orderId: referenceId,
    amount: amountRupees,
    amountRupees,
    amountSubunits: Math.max(100, Math.round(amountRupees * 100)),
    status: "pending",
    gatewayConfigured: false,
  };
}

export async function processPayment(
  _session: PaymentSession,
): Promise<"success" | "failed"> {
  await delay(1200);
  return "success";
}

export function handleSuccess(orderId: string): void {
  console.info("[PaymentService] Payment confirmed:", orderId);
}

export function handleFailure(reason: string): void {
  console.warn("[PaymentService] Payment failed:", reason);
}
