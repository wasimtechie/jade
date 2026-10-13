/**
 * Client-side Razorpay Checkout (Standard). Loads checkout.js once, then opens the modal.
 */

const SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

type RazorpayHandlerResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export type RazorpaySuccessPayload = RazorpayHandlerResponse;

function loadCheckoutScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay Checkout is browser-only"));
  }
  if (window.Razorpay) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Razorpay Checkout")),
        { once: true },
      );
      return;
    }

    const s = document.createElement("script");
    s.src = SCRIPT_URL;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Razorpay Checkout"));
    document.body.appendChild(s);
  });
}

export type OpenRazorpayCheckoutParams = {
  keyId: string;
  amountPaise: number;
  currency: string;
  orderId: string;
  name: string;
  description: string;
  prefill: { name?: string; email?: string; contact?: string };
};

/** Resolves when the user pays; rejects on modal dismiss without payment. */
export function openRazorpayCheckout(
  params: OpenRazorpayCheckoutParams,
): Promise<RazorpaySuccessPayload> {
  const {
    keyId,
    amountPaise,
    currency,
    orderId,
    name,
    description,
    prefill,
  } = params;

  return loadCheckoutScript().then(
    () =>
      new Promise((resolve, reject) => {
        const Rzp = window.Razorpay;
        if (!Rzp) {
          reject(new Error("Razorpay SDK missing after load"));
          return;
        }

        const opt = {
          key: keyId,
          amount: amountPaise,
          currency,
          name,
          description,
          order_id: orderId,
          prefill,
          handler(response: RazorpayHandlerResponse) {
            resolve(response);
          },
          modal: {
            ondismiss() {
              reject(new Error("checkout_dismissed"));
            },
          },
        };

        const inst = new Rzp(opt);
        inst.open();
      }),
  );
}

declare global {
  interface Window {
    Razorpay?: new (
      options: Record<string, unknown>,
    ) => {
      open: () => void;
    };
  }
}
