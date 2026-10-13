import type { BookingPayment, PaymentPlan, PaymentStatus } from "./types";

export type ExternalPaymentChannel =
  | "gpay"
  | "phonepe"
  | "upi"
  | "bank_transfer"
  | "cash"
  | "other";

export const EXTERNAL_PAYMENT_CHANNELS: {
  value: ExternalPaymentChannel;
  label: string;
}[] = [
  { value: "gpay", label: "Google Pay" },
  { value: "phonepe", label: "PhonePe" },
  { value: "upi", label: "UPI (other)" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "cash", label: "Cash" },
  { value: "other", label: "Other" },
];

export function externalPaymentChannelLabel(
  channel?: ExternalPaymentChannel,
): string | undefined {
  if (!channel) return undefined;
  return EXTERNAL_PAYMENT_CHANNELS.find((c) => c.value === channel)?.label;
}

export type ResolveExternalPaymentInput = {
  paymentPlan: PaymentPlan;
  totalPaise: number;
  depositPaise: number;
  /** When omitted: deposit plan → deposit only; full plan → full total. */
  fullAmountReceived?: boolean;
  receivedPaise?: number;
};

export type ResolvedExternalPayment = {
  receivedPaise: number;
  paymentStatus: Extract<PaymentStatus, "paid" | "deposit_paid">;
  depositPaidPaise: number;
  balancePaise: number;
  amountDuePaise: number;
};

/** Compute payment fields after staff confirms an offline / external payment. */
export function resolveExternalPaymentAmounts(
  input: ResolveExternalPaymentInput,
): ResolvedExternalPayment {
  const total = input.totalPaise;
  const deposit = input.depositPaise;

  if (total <= 0) throw new Error("INVALID_TOTAL");

  let received: number;
  if (input.receivedPaise != null) {
    received = input.receivedPaise;
  } else if (input.paymentPlan === "deposit" && !input.fullAmountReceived) {
    received = deposit;
  } else {
    received = total;
  }

  if (received <= 0) throw new Error("INVALID_AMOUNT");
  if (received > total) throw new Error("AMOUNT_EXCEEDS_TOTAL");

  if (input.paymentPlan === "full" && received !== total) {
    throw new Error("FULL_PAYMENT_REQUIRED");
  }

  if (input.paymentPlan === "deposit" && received < deposit) {
    throw new Error("DEPOSIT_MINIMUM_NOT_MET");
  }

  const paidInFull = received >= total;
  return {
    receivedPaise: received,
    paymentStatus: paidInFull ? "paid" : "deposit_paid",
    depositPaidPaise: paidInFull ? total : received,
    balancePaise: paidInFull ? 0 : total - received,
    amountDuePaise: total,
  };
}

export function applyExternalPaymentToBooking(
  payment: BookingPayment,
  resolved: ResolvedExternalPayment,
  externalPaymentRef?: string,
): BookingPayment {
  return {
    ...payment,
    gateway: "external",
    status: resolved.paymentStatus,
    amountDuePaise: resolved.amountDuePaise,
    depositPaidPaise: resolved.depositPaidPaise,
    balancePaise: resolved.balancePaise,
    externalPaymentRef: externalPaymentRef?.trim() || payment.externalPaymentRef,
  };
}
