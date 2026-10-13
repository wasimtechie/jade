import { describe, expect, it } from "vitest";
import { resolveExternalPaymentAmounts } from "./confirmExternalPayment";

describe("resolveExternalPaymentAmounts", () => {
  it("requires full amount for full payment plan", () => {
    const r = resolveExternalPaymentAmounts({
      paymentPlan: "full",
      totalPaise: 100_000,
      depositPaise: 30_000,
    });
    expect(r.paymentStatus).toBe("paid");
    expect(r.receivedPaise).toBe(100_000);
    expect(r.balancePaise).toBe(0);
  });

  it("rejects partial payment on full plan", () => {
    expect(() =>
      resolveExternalPaymentAmounts({
        paymentPlan: "full",
        totalPaise: 100_000,
        depositPaise: 30_000,
        receivedPaise: 50_000,
      }),
    ).toThrow("FULL_PAYMENT_REQUIRED");
  });

  it("defaults to deposit only on deposit plan", () => {
    const r = resolveExternalPaymentAmounts({
      paymentPlan: "deposit",
      totalPaise: 100_000,
      depositPaise: 30_000,
    });
    expect(r.paymentStatus).toBe("deposit_paid");
    expect(r.receivedPaise).toBe(30_000);
    expect(r.balancePaise).toBe(70_000);
  });

  it("accepts full offline payment on deposit plan", () => {
    const r = resolveExternalPaymentAmounts({
      paymentPlan: "deposit",
      totalPaise: 100_000,
      depositPaise: 30_000,
      fullAmountReceived: true,
    });
    expect(r.paymentStatus).toBe("paid");
    expect(r.balancePaise).toBe(0);
  });

  it("rejects amount below deposit", () => {
    expect(() =>
      resolveExternalPaymentAmounts({
        paymentPlan: "deposit",
        totalPaise: 100_000,
        depositPaise: 30_000,
        receivedPaise: 20_000,
      }),
    ).toThrow("DEPOSIT_MINIMUM_NOT_MET");
  });
});
