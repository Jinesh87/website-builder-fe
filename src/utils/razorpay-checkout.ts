import type { TopupCheckout, TopupConfirmation } from "../api/wallet.ts";

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

type RazorpaySuccess = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayFailure = { error: { description?: string; reason?: string } };

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", handler: (response: RazorpayFailure) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

let loading: Promise<void> | null = null;

function loadCheckout(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  loading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loading = null;
      script.remove();
      reject(new Error("Couldn't load Razorpay. Check your connection and try again."));
    };
    document.body.appendChild(script);
  });
  return loading;
}

export class CheckoutDismissedError extends Error {
  constructor() {
    super("Payment cancelled.");
    this.name = "CheckoutDismissedError";
  }
}

/**
 * Opens Razorpay Checkout for a top-up order. Resolves with what the server needs to verify the payment;
 * rejects with CheckoutDismissedError when the user closes it without paying.
 */
export async function openRazorpayCheckout(checkout: TopupCheckout, description: string): Promise<TopupConfirmation> {
  await loadCheckout();
  const Razorpay = window.Razorpay;
  if (!Razorpay) throw new Error("Couldn't load Razorpay. Please try again.");

  return new Promise<TopupConfirmation>((resolve, reject) => {
    let lastFailure: string | null = null;
    const instance = new Razorpay({
      key: checkout.keyId,
      order_id: checkout.orderId,
      amount: checkout.amountPaise,
      currency: checkout.currency,
      name: checkout.businessName,
      description,
      prefill: checkout.prefill,
      theme: { color: "#4f46e5" },
      handler: (response: RazorpaySuccess) =>
        resolve({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        }),
      modal: {
        // Checkout lets the user retry after a failure, so only give up when they close it.
        ondismiss: () => reject(lastFailure ? new Error(lastFailure) : new CheckoutDismissedError()),
      },
    });
    instance.on("payment.failed", (response) => {
      lastFailure = response.error.description || "The payment failed. Please try again.";
    });
    instance.open();
  });
}
