import { useEffect, useState, type FormEvent } from "react";
import { Button, Spinner } from "@heroui/react";
import { IndianRupee, RefreshCw } from "lucide-react";
import { errorMessage } from "../../api/http.ts";
import { adminBillingApi, formatConnectsNumber, type BillingSettings } from "../../api/wallet.ts";
import FormAlert from "../ui/FormAlert.tsx";

type Feedback = { status: "success" | "danger"; message: string } | null;

const MARGIN_PATTERN = /^\d{1,4}(\.\d{1,2})?$/;
const BALANCE_PATTERN = /^\d{1,7}(\.\d{1,3})?$/;

function formatRupees(value: number): string {
  return `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatFetched(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

/** USD→INR rate fetched daily, plus the rupee margin the super admin adds per dollar of AI usage. */
export default function AiBillingRatePanel() {
  const [billing, setBilling] = useState<BillingSettings | null>(null);
  const [margin, setMargin] = useState("");
  const [minBalance, setMinBalance] = useState("");
  const [marginError, setMarginError] = useState<string>();
  const [minBalanceError, setMinBalanceError] = useState<string>();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  function apply(loaded: BillingSettings) {
    setBilling(loaded);
    setMargin(String(loaded.margin));
    setMinBalance(String(loaded.minAiBalance));
  }

  useEffect(() => {
    adminBillingApi
      .get()
      .then(apply)
      .catch((err: unknown) => setLoadError(errorMessage(err)));
  }, []);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = margin.trim();
    const balanceText = minBalance.trim();
    const error = MARGIN_PATTERN.test(trimmed) ? undefined : "Enter rupees with up to 2 decimals, e.g. 5 or 4.50";
    const balanceError = BALANCE_PATTERN.test(balanceText) ? undefined : "Enter connects, up to 3 decimals";
    setMarginError(error);
    setMinBalanceError(balanceError);
    setFeedback(null);
    if (error || balanceError) return;

    setSaving(true);
    try {
      apply(await adminBillingApi.update({ margin: Number(trimmed), minBalance: Number(balanceText) }));
      setFeedback({ status: "success", message: "Saved. New AI requests use these settings straight away." });
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    setFeedback(null);
    try {
      const loaded = await adminBillingApi.refreshRate();
      setBilling(loaded);
      setFeedback({ status: "success", message: `Rate checked: $1 = ${formatRupees(loaded.market.rate)}.` });
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setRefreshing(false);
    }
  }

  const previewMargin = MARGIN_PATTERN.test(margin.trim()) ? Number(margin) : (billing?.margin ?? 0);
  const previewRate = billing ? billing.market.rate + previewMargin : 0;
  const previewConnects = billing ? previewRate * billing.connectsPerRupee : 0;

  return (
    <form onSubmit={handleSave} noValidate className="rounded-xl border border-line bg-surface p-6 shadow-xs">
      <div className="flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
          <IndianRupee className="size-5" aria-hidden />
        </div>
        <div>
          <h2 className="text-base font-semibold text-ink">Usage charge rate</h2>
          <p className="text-xs text-ink-muted">
            How the dollar cost of each AI request becomes rupees, and then connects.
          </p>
        </div>
      </div>

      {loadError && (
        <div className="mt-5">
          <FormAlert status="danger">{loadError}</FormAlert>
        </div>
      )}

      {!billing && !loadError && (
        <div className="grid place-items-center py-12">
          <Spinner aria-label="Loading charge rate" />
        </div>
      )}

      {billing && (
        <div className="mt-5 flex flex-col gap-5">
          <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-line bg-canvas/40 p-4">
            <div>
              <p className="text-xs font-medium text-ink-muted">Today's market rate</p>
              <p className="mt-1 text-xl font-semibold text-ink">$1 = {formatRupees(billing.market.rate)}</p>
              <p className="mt-1 text-xs text-ink-muted">
                {billing.market.rateDate
                  ? `Published ${billing.market.rateDate} · ${billing.market.source}`
                  : billing.market.source}
                {billing.market.fetchedAt && ` · checked ${formatFetched(billing.market.fetchedAt)}`}
              </p>
            </div>
            <Button size="sm" variant="outline" onPress={handleRefresh} isPending={refreshing} isDisabled={saving}>
              <RefreshCw className="size-3.5" aria-hidden /> Check now
            </Button>
          </div>

          <div>
            <label htmlFor="usd-inr-margin" className="mb-1 block text-sm font-medium text-ink">
              Your margin per US dollar
            </label>
            <div
              className={`flex h-9 w-36 items-center rounded-lg border bg-surface shadow-ed-xs focus-within:ring-2 ${
                marginError
                  ? "border-ed-danger focus-within:ring-ed-danger/15"
                  : "border-ed-border focus-within:border-ed-accent focus-within:ring-ed-accent/15"
              }`}
            >
              <span className="pl-3 text-sm text-ink-muted" aria-hidden>
                ₹
              </span>
              <input
                id="usd-inr-margin"
                inputMode="decimal"
                value={margin}
                disabled={saving}
                aria-invalid={Boolean(marginError)}
                onChange={(event) => {
                  setMargin(event.target.value.replace(/[^\d.]/g, ""));
                  setMarginError(undefined);
                  setFeedback(null);
                }}
                className="w-full min-w-0 bg-transparent px-2 text-sm text-ink focus:outline-none"
              />
            </div>
            {marginError ? (
              <p className="mt-1 text-xs text-ed-danger">{marginError}</p>
            ) : (
              <p className="mt-1 text-xs text-ink-muted">Added to the market rate. The rate updates daily; your margin stays fixed.</p>
            )}
          </div>

          <div>
            <label htmlFor="min-ai-balance" className="mb-1 block text-sm font-medium text-ink">
              Minimum connects to use AI
            </label>
            <input
              id="min-ai-balance"
              inputMode="decimal"
              value={minBalance}
              disabled={saving}
              aria-invalid={Boolean(minBalanceError)}
              onChange={(event) => {
                setMinBalance(event.target.value.replace(/[^\d.]/g, ""));
                setMinBalanceError(undefined);
                setFeedback(null);
              }}
              className={`h-9 w-36 rounded-lg border bg-surface px-3 text-sm text-ink shadow-ed-xs focus:outline-none focus:ring-2 ${
                minBalanceError
                  ? "border-ed-danger focus:ring-ed-danger/15"
                  : "border-ed-border focus:border-ed-accent focus:ring-ed-accent/15"
              }`}
            />
            {minBalanceError ? (
              <p className="mt-1 text-xs text-ed-danger">{minBalanceError}</p>
            ) : (
              <p className="mt-1 text-xs text-ink-muted">
                Applies to every company. 0 means any balance above zero. AI still deducts the real cost afterwards.
              </p>
            )}
          </div>

          <div className="rounded-lg bg-brand-soft/60 p-4 text-sm text-ink">
            <p>
              Clients are charged <span className="font-semibold">$1 = {formatRupees(previewRate)}</span>
              <span className="text-ink-muted">
                {" "}
                ({formatRupees(billing.market.rate)} + {formatRupees(previewMargin)} margin)
              </span>
            </p>
            <p className="mt-1 text-ink-body">
              So every $1 of AI usage costs <span className="font-semibold">{formatConnectsNumber(previewConnects)} connects</span>{" "}
              (₹1 = {billing.connectsPerRupee} connects).
            </p>
          </div>

          {feedback && <FormAlert status={feedback.status}>{feedback.message}</FormAlert>}

          <div>
            <Button
              type="submit"
              isPending={saving}
              isDisabled={refreshing || (Number(margin) === billing.margin && Number(minBalance) === billing.minAiBalance)}
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
