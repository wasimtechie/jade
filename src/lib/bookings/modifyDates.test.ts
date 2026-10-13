import { describe, expect, it } from "vitest";
import {
  axisWillSyncOnModify,
  normalizeModifyCheckOut,
  recalcPaymentAfterModify,
} from "./modifyDates";
import type { BookingPayment, BookingPricing } from "./types";

const basePricing = (totalPaise: number): BookingPricing => ({
  basePaise: totalPaise,
  extraPaxPaise: 0,
  eventPaise: 0,
  addOnPaise: 0,
  taxPaise: 0,
  totalPaise,
  snapshot: {
    basePricePaise: totalPaise,
    dayOutBasePricePaise: totalPaise,
    stayBasePax: 4,
    dayOutBasePax: 4,
    extraPaxStayPaise: 0,
    extraPaxDayOutPaise: 0,
    chargeableHeadsRule: { childFreeAgeLimit: 5, countInfants: false },
    cleaningFeePaise: 0,
    securityDepositPaise: 0,
    taxPercent: 18,
  },
});

const basePayment = (overrides: Partial<BookingPayment> = {}): BookingPayment => ({
  gateway: "razorpay",
  paymentPlan: "deposit",
  amountDuePaise: 100_000,
  depositPaise: 30_000,
  depositPaidPaise: 0,
  balancePaise: 70_000,
  status: "pending",
  ...overrides,
});

describe("normalizeModifyCheckOut", () => {
  it("forces day_out check-out to next day", () => {
    expect(
      normalizeModifyCheckOut("day_out", "2026-08-01", "2026-08-05"),
    ).toBe("2026-08-02");
  });

  it("rejects invalid stay range", () => {
    expect(() =>
      normalizeModifyCheckOut("stay", "2026-08-05", "2026-08-01"),
    ).toThrow("INVALID_DATES");
  });
});

describe("recalcPaymentAfterModify", () => {
  it("recalculates pending deposit plan balances", () => {
    const oldPricing = basePricing(100_000);
    const newPricing = basePricing(150_000);
    const { payment } = recalcPaymentAfterModify({
      payment: basePayment(),
      oldPricing,
      newPricing,
      newDepositPaise: 45_000,
    });
    expect(payment.amountDuePaise).toBe(150_000);
    expect(payment.depositPaise).toBe(45_000);
    expect(payment.balancePaise).toBe(105_000);
  });

  it("warns when Razorpay order deposit changes", () => {
    const { warning } = recalcPaymentAfterModify({
      payment: basePayment({ orderId: "order_abc", depositPaise: 30_000 }),
      oldPricing: basePricing(100_000),
      newPricing: basePricing(120_000),
      newDepositPaise: 36_000,
    });
    expect(warning).toMatch(/Razorpay order amount may be stale/);
  });

  it("keeps deposit paid and updates balance for deposit_paid", () => {
    const { payment } = recalcPaymentAfterModify({
      payment: basePayment({
        status: "deposit_paid",
        depositPaidPaise: 30_000,
        balancePaise: 70_000,
      }),
      oldPricing: basePricing(100_000),
      newPricing: basePricing(130_000),
      newDepositPaise: 39_000,
    });
    expect(payment.depositPaidPaise).toBe(30_000);
    expect(payment.balancePaise).toBe(100_000);
  });

  it("treats paid bookings as fully captured at old total", () => {
    const { payment } = recalcPaymentAfterModify({
      payment: basePayment({
        status: "paid",
        paymentPlan: "full",
        depositPaidPaise: 100_000,
        balancePaise: 0,
      }),
      oldPricing: basePricing(100_000),
      newPricing: basePricing(80_000),
      newDepositPaise: 80_000,
    });
    expect(payment.balancePaise).toBe(0);
  });
});

describe("axisWillSyncOnModify", () => {
  it("skips OTA-sourced bookings", () => {
    expect(axisWillSyncOnModify("axisrooms_airbnb", "confirmed", true)).toBe(
      false,
    );
  });

  it("syncs on_hold direct bookings", () => {
    expect(axisWillSyncOnModify("admin_manual", "on_hold", false)).toBe(true);
  });

  it("syncs confirmed website bookings", () => {
    expect(axisWillSyncOnModify("website", "confirmed", true)).toBe(true);
  });

  it("skips pending without prior axis sync", () => {
    expect(axisWillSyncOnModify("website", "pending", false)).toBe(false);
  });
});
