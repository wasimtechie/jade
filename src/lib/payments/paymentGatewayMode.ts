/**
 * Payment gateway mode — switch between simulated test, Razorpay sandbox, and production.
 *
 * | Mode            | Env value       | Use when |
 * |-----------------|-----------------|----------|
 * | Simulated test  | `test`          | Local UAT without Razorpay keys — Pay confirms instantly |
 * | Razorpay sandbox| `razorpay_test` | Razorpay test keys + optional webhook |
 * | Production      | `production`    | Live Razorpay keys at go-live |
 *
 * Revert to production: set both vars to `production` and use live Razorpay keys.
 * See DEPLOYMENT.md → "Payment gateway modes".
 */

export type PaymentGatewayMode = "test" | "razorpay_test" | "production";

const MODE_ALIASES: Record<string, PaymentGatewayMode> = {
  test: "test",
  simulate: "test",
  simulated: "test",
  mock: "test",
  razorpay_test: "razorpay_test",
  razorpay: "razorpay_test",
  sandbox: "razorpay_test",
  staging: "razorpay_test",
  production: "production",
  prod: "production",
  live: "production",
};

function parseMode(raw: string | undefined): PaymentGatewayMode | null {
  if (!raw) return null;
  return MODE_ALIASES[raw.trim().toLowerCase()] ?? null;
}

function razorpayKeysConfigured(): boolean {
  return !!(
    process.env.RAZORPAY_KEY_ID?.trim() &&
    process.env.RAZORPAY_KEY_SECRET?.trim()
  );
}

function publicRazorpayKeyConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_KEY?.trim();
}

function allowSimulatedPaymentsOnProduction(): boolean {
  return (
    process.env.ALLOW_SIMULATED_PAYMENTS_IN_PRODUCTION === "1" ||
    process.env.NEXT_PUBLIC_ALLOW_SIMULATED_PAYMENTS_IN_PRODUCTION === "1"
  );
}

/** Server-side effective mode (defaults to `test` when Razorpay keys are missing). */
export function getPaymentGatewayMode(): PaymentGatewayMode {
  const explicit = parseMode(process.env.PAYMENT_GATEWAY_MODE);
  if (explicit) return explicit;
  if (razorpayKeysConfigured()) {
    return process.env.NODE_ENV === "production" ? "production" : "razorpay_test";
  }
  return "test";
}

/**
 * Simulated Pay — enabled when mode is `test`.
 * On production builds: allowed when explicitly opted in, or when Razorpay keys
 * are not configured (UAT / Vercel without gateway — otherwise Pay is a dead button).
 */
export function isSimulatedPaymentEnabled(): boolean {
  if (getPaymentGatewayMode() !== "test") return false;
  if (process.env.NODE_ENV !== "production") return true;
  if (allowSimulatedPaymentsOnProduction()) return true;
  // No Razorpay secrets → cannot charge; allow simulated confirm so UAT Pay works.
  return !razorpayKeysConfigured();
}

/**
 * Client-visible mode (NEXT_PUBLIC_PAYMENT_GATEWAY_MODE mirrors PAYMENT_GATEWAY_MODE).
 * Never remaps `test` → `production` when there is no public Razorpay key — that left
 * the UI calling /razorpay-order while the server returned 501 in simulated mode.
 */
export function getClientPaymentGatewayMode(): PaymentGatewayMode {
  const explicit =
    parseMode(process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_MODE) ??
    parseMode(process.env.PAYMENT_GATEWAY_MODE);

  if (explicit === "test") {
    if (
      process.env.NODE_ENV === "production" &&
      !allowSimulatedPaymentsOnProduction() &&
      publicRazorpayKeyConfigured()
    ) {
      // Production site with Razorpay key published — hide simulated UI.
      return "production";
    }
    return "test";
  }

  if (explicit) return explicit;
  if (publicRazorpayKeyConfigured()) return "razorpay_test";
  return "test";
}

export function paymentModeLabel(mode: PaymentGatewayMode): string {
  switch (mode) {
    case "test":
      return "Simulated test";
    case "razorpay_test":
      return "Razorpay sandbox";
    case "production":
      return "Production";
  }
}
