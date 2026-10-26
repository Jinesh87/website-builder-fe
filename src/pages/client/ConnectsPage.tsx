import { useCallback, useEffect, useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, Coins, Minus, Plus, Receipt, Repeat, ShieldCheck } from "lucide-react";
import { errorMessage } from "../../api/http.ts";
import {
  connectsPriceInPaise,
  formatConnects,
  formatConnectsNumber,
  formatPaise,
  isAutopayLive,
  walletApi,
  type AiUsageSummary,
  type AutoTopup,
  type Wallet,
  type WalletTransactionPage,
} from "../../api/wallet.ts";
import PageHeader from "../../components/app/PageHeader.tsx";
import CommonModal from "../../components/ui/CommonModal.tsx";
import FormAlert from "../../components/ui/FormAlert.tsx";
import { CheckoutDismissedError, openRazorpayCheckout, openRazorpaySubscriptionCheckout } from "../../utils/razorpay-checkout.ts";

type Feedback = { status: "success" | "danger" | "warning"; message: string } | null;

/** Buy a pack once, or start a monthly auto top-up of it. */
type PurchaseMode = "ONCE" | "MONTHLY";

const PRESET_CONNECTS = [150, 300, 1500, 3000];
const PAGE_SIZE = 20;

const SOURCE_LABELS: Record<WalletTransactionPage["transactions"][number]["source"], string> = {
  TOPUP: "Purchase",
  AI_USAGE: "AI usage",
  ADJUSTMENT: "Adjustment",
  HOSTING: "Hosting",
};

/** Nearest whole pack within the purchase limits, so 101 becomes 100 and 130 becomes 150. */
function snapToPack(connects: number, wallet: Wallet): number {
  const packs = Math.round(connects / wallet.packSize) * wallet.packSize;
  return Math.min(wallet.maxPurchase, Math.max(wallet.minPurchase, packs));
}

function formatDate(iso: string, withTime = true): string {
  return new Date(iso).toLocaleString("en-IN", withTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" });
}

function autoTopupDetail(autoTopup: AutoTopup): string | null {
  switch (autoTopup.status) {
    case "PENDING":
      return "The last charge failed. Razorpay is retrying it.";
    case "HALTED":
      return "Stopped after failed payments. Turn it off, then set it up again with another card or UPI ID.";
    case "PAUSED":
      return "Paused at Razorpay, so nothing is charged.";
    default:
      return autoTopup.nextChargeAt ? `Next top-up on ${formatDate(autoTopup.nextChargeAt, false)}.` : null;
  }
}

export default function ConnectsPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [history, setHistory] = useState<WalletTransactionPage | null>(null);
  const [usage, setUsage] = useState<AiUsageSummary | null>(null);
  const [page, setPage] = useState(1);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pageFeedback, setPageFeedback] = useState<Feedback>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(300);
  /** What's typed in the box; snapped to a whole pack when it loses focus. */
  const [draft, setDraft] = useState("300");
  const [modalFeedback, setModalFeedback] = useState<Feedback>(null);
  const [paying, setPaying] = useState(false);
  const [mode, setMode] = useState<PurchaseMode>("ONCE");
  const [stoppingAutoTopup, setStoppingAutoTopup] = useState(false);

  const loadHistory = useCallback((target: number) => {
    return walletApi.transactions(target, PAGE_SIZE).then((loaded) => {
      setHistory(loaded);
      setPage(target);
    });
  }, []);

  useEffect(() => {
    Promise.all([walletApi.get().then(setWallet), walletApi.usage().then(setUsage), loadHistory(1)]).catch((err: unknown) =>
      setLoadError(errorMessage(err)),
    );
  }, [loadHistory]);

  function openModal(next: PurchaseMode) {
    setMode(next);
    setModalFeedback(null);
    setModalOpen(true);
  }

  function changeQuantity(value: number) {
    if (!wallet) return;
    const snapped = snapToPack(value, wallet);
    setQuantity(snapped);
    setDraft(String(snapped));
    setModalFeedback(null);
  }

  /** Applies whatever is typed, falling back to the last valid amount when the box is empty. */
  function commitDraft(): number {
    if (!wallet) return quantity;
    const typed = Number(draft);
    const snapped = draft && Number.isFinite(typed) ? snapToPack(typed, wallet) : quantity;
    setQuantity(snapped);
    setDraft(String(snapped));
    return snapped;
  }

  async function pay() {
    if (!wallet) return;
    const connects = commitDraft();
    setModalFeedback(null);

    setPaying(true);
    try {
      if (mode === "MONTHLY") {
        const checkout = await walletApi.setupAutoTopup(connects);
        // Razorpay opens its own window; ours would keep focus from it.
        setModalOpen(false);
        setWallet(await walletApi.confirmAutoTopup(await openRazorpaySubscriptionCheckout(checkout)));
        await loadHistory(1);
        setPageFeedback({ status: "success", message: `Auto top-up is on: ${formatConnects(connects)} every month.` });
        return;
      }
      const checkout = await walletApi.createTopup(connects);
      setModalOpen(false);
      const payment = await openRazorpayCheckout(checkout, formatConnects(connects));
      const result = await walletApi.confirmTopup(payment);
      setWallet(result.wallet);
      await loadHistory(1);
      setPageFeedback({ status: "success", message: `${formatConnects(connects)} added to your account.` });
    } catch (err) {
      const message =
        err instanceof CheckoutDismissedError
          ? "Payment cancelled. No money was taken."
          : err instanceof Error && err.constructor === Error
            ? err.message
            : errorMessage(err);
      setModalFeedback({ status: err instanceof CheckoutDismissedError ? "warning" : "danger", message });
      setModalOpen(true);
    } finally {
      setPaying(false);
    }
  }

  async function turnOffAutoTopup() {
    setStoppingAutoTopup(true);
    setPageFeedback(null);
    try {
      setWallet(await walletApi.cancelAutoTopup());
      setPageFeedback({ status: "success", message: "Auto top-up is off. Connects you already bought stay in your account." });
    } catch (err) {
      setPageFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setStoppingAutoTopup(false);
    }
  }

  const totalPages = history ? Math.max(1, Math.ceil(history.total / history.pageSize)) : 1;
  const price = wallet ? connectsPriceInPaise(quantity, wallet.connectsPerRupee) : 0;
  const lastPurchase = history?.transactions.find((item) => item.source === "TOPUP");

  return (
    <div className="px-6 py-8 sm:px-8">
      <PageHeader title="Connects" description="Buy connects to use AI website building and the AI assistant." />

      {loadError && (
        <div className="mt-6">
          <FormAlert status="danger">{loadError}</FormAlert>
        </div>
      )}

      {!wallet && !loadError && (
        <div className="grid place-items-center py-20">
          <Spinner aria-label="Loading connects" />
        </div>
      )}

      {wallet && (
        <div className="mt-8 flex flex-col gap-6">
          <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-indigo-600 via-indigo-700 to-violet-800 p-7 text-white shadow-md">
            <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/10" aria-hidden />
            <div className="pointer-events-none absolute -bottom-24 right-48 size-48 rounded-full bg-white/5" aria-hidden />
            <div className="relative flex flex-wrap items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                  <Coins className="size-4" aria-hidden />
                  Available connects
                </div>
                <p className="mt-2 text-5xl font-semibold tracking-tight">{formatConnectsNumber(wallet.balance)}</p>
                <p className="mt-2 text-sm text-white/70">
                  ₹1 = {wallet.connectsPerRupee} connects. Sold in packs of {wallet.packSize}.
                  {lastPurchase && ` Last bought ${formatConnects(lastPurchase.amount)} on ${formatDate(lastPurchase.createdAt, false)}.`}
                </p>
                {(wallet.balance <= 0 || (wallet.minAiBalance > 0 && wallet.balance < wallet.minAiBalance)) && (
                  <p className="mt-3 inline-flex rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium">
                    {wallet.minAiBalance > 0 && wallet.balance < wallet.minAiBalance
                      ? `You need at least ${formatConnects(wallet.minAiBalance)} to use AI.`
                      : wallet.balance < 0
                        ? "Your last AI request cost more than you had left. Buy connects to keep using AI."
                        : "Buy connects to start using AI."}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <Button
                  size="lg"
                  onPress={() => openModal("ONCE")}
                  isDisabled={!wallet.paymentsEnabled || paying}
                  className="bg-white font-semibold text-indigo-700 shadow-sm hover:bg-white/90"
                >
                  <Plus className="size-4" aria-hidden /> Buy connects
                </Button>
                {!wallet.paymentsEnabled && (
                  <p className="text-xs text-white/70">Online payments aren't available yet. Please contact support.</p>
                )}
              </div>
            </div>
          </section>

          {pageFeedback && <FormAlert status={pageFeedback.status}>{pageFeedback.message}</FormAlert>}

          {(wallet.paymentsEnabled || wallet.autoTopup) && (
            <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface px-6 py-5 shadow-xs">
              <div className="flex min-w-0 items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-indigo-500/10 text-indigo-600" aria-hidden>
                  <Repeat className="size-4" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-ink">Auto top-up</h2>
                  <p className="mt-0.5 text-sm text-ink-body">
                    {wallet.autoTopup
                      ? `${formatConnects(wallet.autoTopup.connects)} for ${formatPaise(wallet.autoTopup.amountPaise)} every month, by card or UPI autopay.`
                      : "Buy the same pack every month by card or UPI autopay, so AI never runs out. Turn it off any time."}
                  </p>
                  {wallet.autoTopup && autoTopupDetail(wallet.autoTopup) && (
                    <p className={`mt-1 text-xs ${isAutopayLive(wallet.autoTopup.status) ? "text-ink-muted" : "text-ed-danger"}`}>
                      {autoTopupDetail(wallet.autoTopup)}
                    </p>
                  )}
                </div>
              </div>
              {wallet.autoTopup ? (
                <Button size="sm" variant="outline" onPress={turnOffAutoTopup} isPending={stoppingAutoTopup}>
                  Turn off
                </Button>
              ) : (
                <Button size="sm" variant="outline" onPress={() => openModal("MONTHLY")} isDisabled={paying}>
                  Set up auto top-up
                </Button>
              )}
            </section>
          )}

          {usage && (
            <section className="rounded-2xl border border-line bg-surface px-6 py-5 shadow-xs">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold text-ink">AI usage this month</h2>
                <p className="text-sm text-ink-body">
                  <span className="font-semibold text-ink">{formatConnects(usage.connects)}</span> across {usage.calls}{" "}
                  {usage.calls === 1 ? "AI request" : "AI requests"}
                </p>
              </div>
              {usage.byFeature.length === 0 ? (
                <p className="mt-3 text-sm text-ink-muted">You haven't used AI this month.</p>
              ) : (
                <ul className="mt-4 flex flex-col gap-3">
                  {usage.byFeature.map((feature) => (
                    <li key={feature.scope}>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-ink">{feature.label}</span>
                        <span className="text-ink-body">
                          {formatConnectsNumber(feature.connects)}
                          <span className="ml-1.5 text-xs text-ink-muted">
                            · {feature.calls} {feature.calls === 1 ? "request" : "requests"}
                          </span>
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-canvas" aria-hidden>
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{ width: `${usage.connects > 0 ? Math.max(2, (feature.connects / usage.connects) * 100) : 0}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-xs">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2 className="text-base font-semibold text-ink">Connects history</h2>
              {history && history.total > 0 && (
                <span className="text-xs text-ink-muted">
                  {history.total} {history.total === 1 ? "entry" : "entries"}
                </span>
              )}
            </div>

            {!history ? (
              <div className="grid place-items-center py-16">
                <Spinner aria-label="Loading history" />
              </div>
            ) : history.transactions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
                <span className="grid size-10 place-items-center rounded-full bg-canvas text-ink-muted" aria-hidden>
                  <Receipt className="size-5" />
                </span>
                <p className="text-sm font-medium text-ink">No activity yet</p>
                <p className="text-xs text-ink-muted">Connects you buy and spend on AI will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line bg-canvas/50 text-left text-xs uppercase tracking-wide text-ink-muted">
                      <th className="px-6 py-2.5 font-medium">Description</th>
                      <th className="px-4 py-2.5 font-medium">Type</th>
                      <th className="px-4 py-2.5 font-medium">Date</th>
                      <th className="px-4 py-2.5 text-right font-medium">Connects</th>
                      <th className="px-6 py-2.5 text-right font-medium">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {history.transactions.map((item) => {
                      const credit = item.type === "CREDIT";
                      return (
                        <tr key={item.id} className="hover:bg-canvas/40">
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-3">
                              <span
                                className={`grid size-8 shrink-0 place-items-center rounded-full ${
                                  credit ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                                }`}
                                aria-hidden
                              >
                                {credit ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                              </span>
                              <span className="font-medium text-ink">{item.description}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="rounded-full bg-canvas px-2 py-0.5 text-xs font-medium text-ink-body">
                              {SOURCE_LABELS[item.source]}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-ink-body">{formatDate(item.createdAt)}</td>
                          <td
                            className={`whitespace-nowrap px-4 py-3.5 text-right font-semibold ${credit ? "text-emerald-600" : "text-ink"}`}
                          >
                            {credit ? "+" : "−"}
                            {formatConnectsNumber(item.amount)}
                          </td>
                          <td className="whitespace-nowrap px-6 py-3.5 text-right text-ink-body">
                            {formatConnectsNumber(item.balanceAfter)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {history && totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-line px-6 py-3">
                <Button size="sm" variant="ghost" isDisabled={page <= 1} onPress={() => void loadHistory(page - 1)}>
                  <ChevronLeft className="size-4" aria-hidden /> Newer
                </Button>
                <span className="text-xs text-ink-muted">
                  Page {page} of {totalPages}
                </span>
                <Button size="sm" variant="ghost" isDisabled={page >= totalPages} onPress={() => void loadHistory(page + 1)}>
                  Older <ChevronRight className="size-4" aria-hidden />
                </Button>
              </div>
            )}
          </section>
        </div>
      )}

      {wallet && (
        <CommonModal
          isOpen={modalOpen}
          onClose={() => !paying && setModalOpen(false)}
          headerDetails={{
            icon: mode === "MONTHLY" ? <Repeat className="size-4.5" /> : <Coins className="size-4.5" />,
            title: mode === "MONTHLY" ? "Set up auto top-up" : "Buy connects",
            description: `You have ${formatConnects(wallet.balance)}`,
          }}
          iconTone="brand"
          size="sm"
          primaryAction={{
            label: mode === "MONTHLY" ? `Start for ${formatPaise(price)} / month` : `Pay ${formatPaise(price)}`,
            onPress: pay,
            isPending: paying,
          }}
          secondaryAction={{ label: "Cancel", onPress: () => setModalOpen(false), isDisabled: paying }}
        >
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3">
              {PRESET_CONNECTS.map((preset) => {
                const selected = quantity === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    aria-pressed={selected}
                    disabled={paying}
                    onClick={() => changeQuantity(preset)}
                    className={`rounded-xl border px-4 py-3 text-left transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
                      selected ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-line bg-surface hover:border-ink-muted/40"
                    }`}
                  >
                    <span className="block text-lg font-semibold text-ink">{preset.toLocaleString("en-IN")}</span>
                    <span className="block text-xs text-ink-muted">
                      {formatPaise(connectsPriceInPaise(preset, wallet.connectsPerRupee))}
                    </span>
                  </button>
                );
              })}
            </div>

            <div>
              <label htmlFor="connects-quantity" className="mb-1 block text-sm font-medium text-ink">
                Or choose how many
              </label>
              <div className="inline-flex h-9 items-stretch overflow-hidden rounded-lg border border-ed-border bg-surface shadow-ed-xs focus-within:border-ed-accent focus-within:ring-2 focus-within:ring-ed-accent/15">
                <button
                  type="button"
                  aria-label={`${wallet.packSize} fewer connects`}
                  disabled={paying || quantity <= wallet.minPurchase}
                  onClick={() => changeQuantity(quantity - wallet.packSize)}
                  className="grid w-9 cursor-pointer place-items-center text-ink transition-colors hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Minus className="size-4" aria-hidden />
                </button>
                <input
                  id="connects-quantity"
                  inputMode="numeric"
                  value={draft}
                  disabled={paying}
                  onChange={(event) => setDraft(event.target.value.replace(/\D/g, "").slice(0, 7))}
                  onBlur={commitDraft}
                  onKeyDown={(event) => event.key === "Enter" && commitDraft()}
                  className="w-24 border-x border-ed-border bg-transparent text-center text-sm font-semibold text-ink focus:outline-none disabled:bg-canvas"
                />
                <button
                  type="button"
                  aria-label={`${wallet.packSize} more connects`}
                  disabled={paying || quantity >= wallet.maxPurchase}
                  onClick={() => changeQuantity(quantity + wallet.packSize)}
                  className="grid w-9 cursor-pointer place-items-center text-ink transition-colors hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="size-4" aria-hidden />
                </button>
              </div>
              <p className="mt-1 text-xs text-ink-muted">
                In steps of {wallet.packSize}. {formatConnects(quantity)} for {formatPaise(price)}
                {mode === "MONTHLY" ? ", charged now and on this day every month." : "."}
              </p>
            </div>

            {modalFeedback && <FormAlert status={modalFeedback.status}>{modalFeedback.message}</FormAlert>}

            <p className="flex items-center gap-1.5 text-xs text-ink-muted">
              <ShieldCheck className="size-3.5 shrink-0 text-emerald-600" aria-hidden />
              Secured by Razorpay. Pay with UPI, cards, net banking or wallets.
            </p>
          </div>
        </CommonModal>
      )}
    </div>
  );
}
