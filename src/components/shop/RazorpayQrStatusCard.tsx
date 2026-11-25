import { useEffect, useRef, useState } from "react";
import { Button } from "@heroui/react";
import { CheckCircle2, ExternalLink, QrCode } from "lucide-react";
import { errorMessage } from "../../api/http.ts";
import { shopApi, type ShopPaymentConfig } from "../../api/shop.ts";
import FormAlert from "../ui/FormAlert.tsx";

const RAZORPAY_QR_CODES_URL = "https://dashboard.razorpay.com/app/qr_codes";

/**
 * Whether the POS till can take Razorpay QR payments. Razorpay switches QR Codes on per account,
 * only from its dashboard (creating any QR once), so when it's off we walk the owner through it.
 */
export default function RazorpayQrStatusCard({
  websiteId,
  config,
  onChange,
}: {
  websiteId: string;
  config: ShopPaymentConfig;
  onChange: (config: ShopPaymentConfig) => void;
}) {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoChecked = useRef(false);

  async function check() {
    setChecking(true);
    setError(null);
    try {
      onChange(await shopApi.checkRazorpayQrCodes(websiteId));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setChecking(false);
    }
  }

  // Just connected or keys just saved: ask Razorpay once instead of showing "not checked".
  useEffect(() => {
    if (config.qrCodes !== "unknown" || autoChecked.current) return;
    autoChecked.current = true;
    void check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.qrCodes]);

  const ready = config.qrCodes === "enabled";
  return (
    <section className="rounded-xl border border-line bg-surface p-6">
      <div className="flex items-start gap-3">
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
            ready ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          {ready ? <CheckCircle2 className="size-5" aria-hidden /> : <QrCode className="size-5" aria-hidden />}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-ink">
            {ready ? "QR payments ready" : config.qrCodes === "disabled" ? "Turn on QR payments" : "Checking QR payments…"}
          </h2>
          <p className="mt-0.5 text-sm text-ink-body">
            {ready
              ? "At the POS till, Razorpay QR shows a one-time QR for each sale's exact amount, and the sale completes when the customer pays."
              : config.qrCodes === "disabled"
                ? "Razorpay QR Codes is off for this Razorpay account, so the POS till can't show payment QRs yet. Razorpay only lets you turn it on from its dashboard, once:"
                : "Asking Razorpay whether QR codes are turned on for this account."}
          </p>
        </div>
      </div>

      {config.qrCodes === "disabled" && (
        <ol className="mt-4 list-decimal space-y-1.5 pl-12 text-sm text-ink-body">
          <li>
            Open <span className="font-medium text-ink">Razorpay → QR Codes</span> (in Live mode for real payments).
          </li>
          <li>
            Click <span className="font-medium text-ink">Create QR Codes</span> and create any UPI QR. This switches QR Codes on.
            You can close that QR afterwards.
          </li>
          <li>
            If Razorpay says UPI isn't enabled, turn on UPI under Account &amp; Settings → Payment methods, or ask Razorpay
            support.
          </li>
          <li>
            Come back here and click <span className="font-medium text-ink">Check again</span>.
          </li>
        </ol>
      )}

      {error && (
        <div className="mt-4">
          <FormAlert status="danger">{error}</FormAlert>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 pl-12">
        {config.qrCodes === "disabled" && (
          <a
            href={RAZORPAY_QR_CODES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-3 text-sm font-medium text-white hover:opacity-90"
          >
            Open Razorpay QR Codes <ExternalLink className="size-3.5" aria-hidden />
          </a>
        )}
        <Button size="sm" variant="outline" onPress={() => void check()} isPending={checking}>
          {ready ? "Check again" : config.qrCodes === "disabled" ? "Check again" : "Check now"}
        </Button>
        {config.qrCheckedAt && (
          <span className="text-xs text-ink-muted">
            Last checked {new Date(config.qrCheckedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
          </span>
        )}
      </div>
    </section>
  );
}
