import { useEffect, useRef, useState } from "react";
import { Banknote, CreditCard, QrCode, Smartphone } from "lucide-react";
import { ApiError, errorMessage } from "../../../api/http.ts";
import type { ShopOrder } from "../../../api/shop.ts";
import { POS_METHOD_LABEL, shopPosApi, type PosPaymentMethod, type PosSaleInput } from "../../../api/shop-pos.ts";
import { formatCountdown, useCountdown } from "../../../hooks/use-countdown.ts";
import CommonModal from "../../ui/AppModal.tsx";
import FormAlert from "../../ui/FormAlert.tsx";
import TextInput from "../../ui/TextInput.tsx";
import { formatInr } from "../shop-format.ts";
import type { PosCustomer } from "./PosCustomerDialog.tsx";
import { rupeesToPaise, type PosCartLine, type PosDiscount } from "./pos-cart.ts";

const QR_POLL_MS = 3000;

/** Errors that mean the catalogue on screen is out of date. */
const STALE_CODES = new Set(["INSUFFICIENT_STOCK", "VARIANT_NOT_FOUND", "STOCK_HELD", "STOCK_UNAVAILABLE_REFUNDED"]);

const METHODS: { id: PosPaymentMethod; icon: typeof Banknote; hint: string }[] = [
  { id: "cash", icon: Banknote, hint: "Count the cash" },
  { id: "upi", icon: Smartphone, hint: "Your own UPI QR" },
  { id: "card", icon: CreditCard, hint: "Your card machine" },
  { id: "razorpay_qr", icon: QrCode, hint: "Confirmed automatically" },
];

type Props = {
  websiteId: string;
  cart: PosCartLine[];
  discount: PosDiscount | null;
  totalPaise: number;
  customer: PosCustomer;
  razorpayQrAvailable: boolean;
  onComplete: (order: ShopOrder) => void;
  /** Stock changed under us: the till should reload the catalogue. */
  onStale: () => void;
  onClose: () => void;
};

/** Quick cash buttons: exact, then the next round notes above the total. */
function cashSuggestions(totalPaise: number): number[] {
  const rupees = Math.ceil(totalPaise / 100);
  const rounded = [100, 500, 2000].map((note) => Math.ceil(rupees / note) * note * 100);
  return [...new Set([totalPaise, ...rounded])].filter((amount) => amount >= totalPaise).slice(0, 4);
}

function toCustomerInput(customer: PosCustomer): PosSaleInput["customer"] {
  if (customer.kind === "account") return { customerId: customer.id };
  const { name, phone, email } = customer;
  return name || phone || email ? { name, phone, email } : null;
}

export default function PosPaymentDialog({
  websiteId,
  cart,
  discount,
  totalPaise,
  customer,
  razorpayQrAvailable,
  onComplete,
  onStale,
  onClose,
}: Props) {
  const [method, setMethod] = useState<PosPaymentMethod>("cash");
  const [cashText, setCashText] = useState("");
  const [reference, setReference] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [qr, setQr] = useState<{ orderId: string; imageUrl: string; expiresAt: string } | null>(null);
  const [qrMessage, setQrMessage] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [secondsLeft, setSecondsLeft] = useCountdown(0);
  const done = useRef(false);

  const cashPaise = rupeesToPaise(cashText);
  const cashShort = method === "cash" && cashPaise != null && cashPaise < totalPaise;
  const changePaise = method === "cash" && cashPaise != null && !cashShort ? cashPaise - totalPaise : null;

  function finish(order: ShopOrder) {
    if (done.current) return;
    done.current = true;
    onComplete(order);
  }

  // While the QR is up, ask the server every few seconds whether it has been paid.
  useEffect(() => {
    if (!qr) return;
    let cancelled = false;
    const timer = setInterval(() => {
      shopPosApi
        .checkQr(websiteId, qr.orderId)
        .then((result) => {
          if (cancelled || !result.qr) return;
          if (result.qr.state === "paid") finish(result.order);
          else if (result.qr.state !== "waiting") {
            setQr(null);
            setQrMessage("The QR expired before it was paid. The sale was cancelled; you can try again.");
          }
        })
        .catch((err: unknown) => {
          if (!cancelled && err instanceof ApiError && STALE_CODES.has(err.code)) {
            setQr(null);
            setError(err.message);
            onStale();
          }
        });
    }, QR_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
    // finish/onStale are stable for the dialog's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qr, websiteId]);

  async function submit() {
    setError(null);
    setQrMessage(null);
    if (method === "cash" && cashShort) {
      setError("Cash received is less than the total.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await shopPosApi.createSale(websiteId, {
        items: cart.map((line) => ({ variantId: line.variantId, quantity: line.quantity })),
        discount,
        customer: toCustomerInput(customer),
        payment: {
          method,
          cashReceivedPaise: method === "cash" ? (cashPaise ?? totalPaise) : null,
          reference: method === "upi" || method === "card" ? reference.trim() : "",
        },
      });
      if (result.qr?.imageUrl) {
        setQr({ orderId: result.order.id, imageUrl: result.qr.imageUrl, expiresAt: result.qr.expiresAt });
        setSecondsLeft(Math.max(0, Math.round((new Date(result.qr.expiresAt).getTime() - Date.now()) / 1000)));
      } else {
        finish(result.order);
      }
    } catch (err) {
      setError(errorMessage(err));
      if (err instanceof ApiError && STALE_CODES.has(err.code)) onStale();
    } finally {
      setSubmitting(false);
    }
  }

  async function cancelQr() {
    if (!qr) return;
    setCancelling(true);
    try {
      const result = await shopPosApi.cancelQr(websiteId, qr.orderId);
      if (result.qr?.state === "paid") {
        finish(result.order);
        return;
      }
      setQr(null);
      setQrMessage("QR cancelled. Choose another way to pay.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setCancelling(false);
    }
  }

  if (qr) {
    return (
      <CommonModal
        isOpen
        isDismissable={false}
        title={`Scan to pay ${formatInr(totalPaise)}`}
        subtitle="Ask the customer to scan with any UPI app. This screen updates by itself when the payment arrives."
        icon={<QrCode className="size-5" />}
        iconTone="brand"
        size="sm"
        secondaryAction={{ label: "Cancel QR", onPress: () => void cancelQr(), isPending: cancelling }}
      >
        <div className="flex flex-col items-center">
          <img src={qr.imageUrl} alt="Razorpay UPI QR code" className="w-64 max-w-full rounded-lg border border-line" />
          <p className="mt-3 text-sm text-ink-body">
            Waiting for payment… <span className="font-medium text-ink">{formatCountdown(secondsLeft)}</span> left
          </p>
          {error && (
            <div className="mt-3 w-full">
              <FormAlert status="danger">{error}</FormAlert>
            </div>
          )}
        </div>
      </CommonModal>
    );
  }

  return (
    <CommonModal
      isOpen
      onClose={onClose}
      title={`Charge ${formatInr(totalPaise)}`}
      subtitle="How is the customer paying?"
      size="md"
      primaryAction={{
        label: method === "razorpay_qr" ? "Show QR" : `Complete sale`,
        onPress: () => void submit(),
        isPending: submitting,
        isDisabled: cashShort,
      }}
      secondaryAction={{ label: "Back", onPress: onClose }}
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Payment method">
        {METHODS.map(({ id, icon: Icon, hint }) => {
          const disabled = id === "razorpay_qr" && !razorpayQrAvailable;
          const active = method === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              title={disabled ? "Connect Razorpay in Shop → Razorpay to use this" : undefined}
              onClick={() => setMethod(id)}
              className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-center transition disabled:cursor-not-allowed disabled:opacity-40 ${
                active ? "border-brand bg-brand-soft text-ink" : "border-line text-ink-body hover:border-line-strong"
              }`}
            >
              <Icon className="size-5" aria-hidden />
              <span className="text-sm font-medium">{POS_METHOD_LABEL[id]}</span>
              <span className="text-[11px] text-ink-muted">{disabled ? "Razorpay not connected" : hint}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        {method === "cash" && (
          <div className="flex flex-col gap-3">
            <TextInput
              label="Cash received (₹)"
              name="cashReceived"
              placeholder={String(totalPaise / 100)}
              value={cashText}
              onChange={setCashText}
              error={cashShort ? "Less than the total" : undefined}
              autoFocus
            />
            <div className="flex flex-wrap gap-2">
              {cashSuggestions(totalPaise).map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setCashText(String(amount / 100))}
                  className="rounded-md border border-line-strong px-3 py-1.5 text-sm font-medium text-ink hover:border-brand"
                >
                  {amount === totalPaise ? `Exact ${formatInr(amount)}` : formatInr(amount)}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between rounded-lg bg-canvas px-4 py-3">
              <span className="text-sm text-ink-body">Change to give</span>
              <span className="text-xl font-semibold text-ink">{formatInr(changePaise ?? 0)}</span>
            </div>
          </div>
        )}

        {(method === "upi" || method === "card") && (
          <TextInput
            label={method === "upi" ? "UPI reference (optional)" : "Card slip / last 4 digits (optional)"}
            name="paymentReference"
            description="Check the payment has come through before completing the sale."
            value={reference}
            onChange={setReference}
            autoFocus
          />
        )}

        {method === "razorpay_qr" && (
          <p className="rounded-lg bg-canvas px-4 py-3 text-sm text-ink-body">
            A one-time UPI QR for exactly {formatInr(totalPaise)} appears on screen. The items are held for 10 minutes while
            the customer pays, and the sale completes by itself when Razorpay confirms the payment.
          </p>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {qrMessage && <FormAlert status="warning">{qrMessage}</FormAlert>}
        {error && <FormAlert status="danger">{error}</FormAlert>}
      </div>
    </CommonModal>
  );
}
