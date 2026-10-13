import { addDays } from "@/lib/bookingDates";
import type { BookingPayment, BookingPricing, BookingType } from "./types";

export function normalizeModifyCheckOut(
  bookingType: BookingType,
  checkIn: string,
  checkOut: string,
): string {
  if (bookingType === "day_out") return addDays(checkIn, 1);
  if (checkOut <= checkIn) {
    throw new Error("INVALID_DATES");
  }
  return checkOut;
}

export function recalcPaymentAfterModify(params: {
  payment: BookingPayment;
  oldPricing: BookingPricing;
  newPricing: BookingPricing;
  newDepositPaise: number;
}): { payment: BookingPayment; warning?: string } {
  const { payment, oldPricing, newPricing, newDepositPaise } = params;
  const newTotal = newPricing.totalPaise;
  const updated: BookingPayment = {
    ...payment,
    amountDuePaise: newTotal,
  };

  let warning: string | undefined;

  const captured = (() => {
    switch (payment.status) {
      case "pending":
      case "failed":
        return 0;
      case "deposit_paid":
        return payment.depositPaidPaise ?? 0;
      case "paid":
      case "external":
        return oldPricing.totalPaise;
      case "partially_refunded":
        return Math.max(
          0,
          (payment.depositPaidPaise ?? oldPricing.totalPaise) -
            (payment.refundedPaise ?? 0),
        );
      case "refunded":
      case "not_applicable":
        return 0;
      default:
        return 0;
    }
  })();

  if (payment.status === "pending") {
    updated.depositPaise = newDepositPaise;
    updated.balancePaise =
      payment.paymentPlan === "deposit"
        ? Math.max(0, newTotal - newDepositPaise)
        : 0;
    if (
      payment.orderId &&
      payment.depositPaise !== undefined &&
      payment.depositPaise !== newDepositPaise
    ) {
      warning =
        "Existing Razorpay order amount may be stale — guest may need a new payment link.";
    }
  } else if (payment.status === "deposit_paid") {
    updated.balancePaise = Math.max(0, newTotal - (payment.depositPaidPaise ?? 0));
  } else if (
    payment.status === "paid" ||
    payment.status === "external" ||
    payment.status === "partially_refunded"
  ) {
    updated.balancePaise = Math.max(0, newTotal - captured);
  } else {
    updated.balancePaise = 0;
    if (payment.status === "not_applicable") {
      updated.depositPaise = newDepositPaise;
    }
  }

  return { payment: updated, warning };
}

export function axisWillSyncOnModify(
  source: string | undefined,
  status: string,
  axisRoomsSynced?: boolean,
): boolean {
  if (source?.startsWith("axisrooms_")) return false;
  if (status === "on_hold" || status === "confirmed") return true;
  return Boolean(axisRoomsSynced);
}
