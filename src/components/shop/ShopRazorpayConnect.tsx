import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, Chip } from "@heroui/react";
import { CheckCircle2, Link2 } from "lucide-react";
import { errorMessage } from "../../api/http.ts";
import { shopApi, type ShopPaymentConfig } from "../../api/shop.ts";
import FormAlert from "../ui/FormAlert.tsx";

type Feedback = { status: "success" | "danger"; message: string } | null;

/** App path to come back to after Razorpay, without the previous result flags. */
function currentPath(): string {
  const url = new URL(window.location.href);
  url.searchParams.delete("razorpay");
  url.searchParams.delete("razorpayMessage");
  return `${url.pathname}${url.search}`;
}

/** "Connect with Razorpay": the owner logs in to (or signs up for) Razorpay and approves; no keys or webhooks. */
export default function ShopRazorpayConnect({
  websiteId,
  config,
  onChange,
}: {
  websiteId: string;
  config: ShopPaymentConfig;
  onChange: (config: ShopPaymentConfig) => void;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [busy, setBusy] = useState(false);

  // Result of the Razorpay redirect, shown once.
  useEffect(() => {
    const result = searchParams.get("razorpay");
    if (!result) return;
    setFeedback(
      result === "connected"
        ? { status: "success", message: "Razorpay is connected. This shop can take payments." }
        : { status: "danger", message: searchParams.get("razorpayMessage") || "Razorpay didn't connect. Please try again." },
    );
    setSearchParams(
      (current) => {
        current.delete("razorpay");
        current.delete("razorpayMessage");
        return current;
      },
      { replace: true },
    );
  }, [searchParams, setSearchParams]);

  const replacesKeys = !config.connection && Boolean(config.razorpayKeyId);

  async function connect() {
    if (
      replacesKeys &&
      !window.confirm(
        "Connecting replaces the API keys and webhook secret saved below. Only one Razorpay setup can be active. Payments keep working. Continue?",
      )
    ) {
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      window.location.assign(await shopApi.connectRazorpay(websiteId, currentPath()));
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
      setBusy(false);
    }
  }

  async function disconnect() {
    if (!window.confirm("Disconnect Razorpay? The shop stops taking payments until you connect again or add API keys.")) return;
    setBusy(true);
    setFeedback(null);
    try {
      onChange(await shopApi.disconnectRazorpay(websiteId));
      setFeedback({ status: "success", message: "Razorpay disconnected." });
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  const connection = config.connection;
  if (!connection && !config.connectAvailable) return null;

  return (
    <section className="rounded-xl border border-line bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
            {connection ? <CheckCircle2 className="size-5" aria-hidden /> : <Link2 className="size-5" aria-hidden />}
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">{connection ? "Connected to Razorpay" : "Connect with Razorpay"}</h2>
            <p className="text-xs text-ink-muted">
              {connection
                ? "Shop payments go straight to this Razorpay account. Payment updates arrive automatically."
                : "Log in to Razorpay, or create a free account, and approve. No API keys or webhook setup needed."}
            </p>
          </div>
        </div>
        {connection && (
          <Chip color={connection.mode === "live" ? "success" : "accent"}>{connection.mode === "live" ? "Live mode" : "Test mode"}</Chip>
        )}
      </div>

      {connection && (
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-ink-muted">Razorpay account</dt>
            <dd className="font-mono text-ink">{connection.accountId ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">Connected</dt>
            <dd className="text-ink">{connection.connectedAt ? new Date(connection.connectedAt).toLocaleString("en-IN") : "—"}</dd>
          </div>
        </dl>
      )}

      {replacesKeys && (
        <div className="mt-4">
          <FormAlert status="warning">
            Connecting replaces your saved API keys ({config.razorpayKeyId}) and webhook secret. Only one Razorpay setup can be
            active at a time. Payments won't break: checkout switches to the connected account straight away and paid orders
            stay paid. Connect the same Razorpay account you use now so refunds on earlier orders keep working.
          </FormAlert>
        </div>
      )}

      {feedback && (
        <div className="mt-4">
          <FormAlert status={feedback.status}>{feedback.message}</FormAlert>
        </div>
      )}

      <div className="mt-5">
        {connection ? (
          <Button variant="outline" onPress={() => void disconnect()} isPending={busy}>
            Disconnect
          </Button>
        ) : (
          <Button onPress={() => void connect()} isPending={busy}>
            Connect with Razorpay
          </Button>
        )}
      </div>
    </section>
  );
}
