import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getClientPaymentGatewayMode,
  getPaymentGatewayMode,
  isSimulatedPaymentEnabled,
} from "@/lib/payments/paymentGatewayMode";

const envBackup = { ...process.env };

afterEach(() => {
  vi.unstubAllEnvs();
  process.env = { ...envBackup };
});

describe("getPaymentGatewayMode", () => {
  it("defaults to test when Razorpay keys are missing", () => {
    delete process.env.PAYMENT_GATEWAY_MODE;
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;
    expect(getPaymentGatewayMode()).toBe("test");
  });

  it("honours explicit production", () => {
    process.env.PAYMENT_GATEWAY_MODE = "production";
    expect(getPaymentGatewayMode()).toBe("production");
  });

  it("honours razorpay_test alias sandbox", () => {
    process.env.PAYMENT_GATEWAY_MODE = "sandbox";
    expect(getPaymentGatewayMode()).toBe("razorpay_test");
  });
});

describe("isSimulatedPaymentEnabled", () => {
  it("is on for test mode in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    process.env.PAYMENT_GATEWAY_MODE = "test";
    expect(isSimulatedPaymentEnabled()).toBe(true);
  });

  it("is off in production when Razorpay keys exist and override is unset", () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.PAYMENT_GATEWAY_MODE = "test";
    process.env.RAZORPAY_KEY_ID = "rzp_test_x";
    process.env.RAZORPAY_KEY_SECRET = "secret";
    delete process.env.ALLOW_SIMULATED_PAYMENTS_IN_PRODUCTION;
    delete process.env.NEXT_PUBLIC_ALLOW_SIMULATED_PAYMENTS_IN_PRODUCTION;
    expect(isSimulatedPaymentEnabled()).toBe(false);
  });

  it("is on in production for UAT when mode is test and Razorpay keys are missing", () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.PAYMENT_GATEWAY_MODE = "test";
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;
    delete process.env.ALLOW_SIMULATED_PAYMENTS_IN_PRODUCTION;
    expect(isSimulatedPaymentEnabled()).toBe(true);
  });

  it("can be explicitly re-enabled in production for controlled UAT", () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.PAYMENT_GATEWAY_MODE = "test";
    process.env.RAZORPAY_KEY_ID = "rzp_test_x";
    process.env.RAZORPAY_KEY_SECRET = "secret";
    process.env.ALLOW_SIMULATED_PAYMENTS_IN_PRODUCTION = "1";
    expect(isSimulatedPaymentEnabled()).toBe(true);
  });

  it("is off when mode is razorpay_test", () => {
    vi.stubEnv("NODE_ENV", "development");
    process.env.PAYMENT_GATEWAY_MODE = "razorpay_test";
    expect(isSimulatedPaymentEnabled()).toBe(false);
  });
});

describe("getClientPaymentGatewayMode", () => {
  it("reads NEXT_PUBLIC_PAYMENT_GATEWAY_MODE", () => {
    process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_MODE = "razorpay_test";
    expect(getClientPaymentGatewayMode()).toBe("razorpay_test");
  });

  it("keeps simulated mode on production UAT when no public Razorpay key is set", () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_MODE = "test";
    delete process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_KEY;
    delete process.env.NEXT_PUBLIC_ALLOW_SIMULATED_PAYMENTS_IN_PRODUCTION;
    expect(getClientPaymentGatewayMode()).toBe("test");
  });

  it("hides simulated mode on production when a public Razorpay key is published", () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_MODE = "test";
    process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_KEY = "rzp_test_key";
    delete process.env.NEXT_PUBLIC_ALLOW_SIMULATED_PAYMENTS_IN_PRODUCTION;
    expect(getClientPaymentGatewayMode()).toBe("production");
  });
});
