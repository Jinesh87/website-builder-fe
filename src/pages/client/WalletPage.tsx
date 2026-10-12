import { useCallback, useEffect, useState } from "react";
import { Button, Spinner } from "@heroui/react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Plus,
  Receipt,
  ShieldCheck,
  Wallet as WalletIcon,
} from "lucide-react";
import { errorMessage } from "../../api/http.ts";
import { formatPaise, walletApi, type Wallet, type WalletTransactionPage } from "../../api/wallet.ts";
import PageHeader from "../../components/app/PageHeader.tsx";
import CommonModal from "../../components/ui/CommonModal.tsx";
import FormAlert from "../../components/ui/FormAlert.tsx";
import TextInput from "../../components/ui/TextInput.tsx";
import { CheckoutDismissedError, openRazorpayCheckout } from "../../utils/razorpay-checkout.ts";

type Feedback = { status: "success" | "danger" | "warning"; message: string } | null;

const PRESETS_INR = [100, 500, 1000, 2000];
const PAGE_SIZE = 20;

const SOURCE_LABELS: Record<WalletTransactionPage["transactions"][number]["source"], string> = {
  TOPUP: "Top-up",
  AI_USAGE: "AI usage",
  ADJUSTMENT: "Adjustment",
};

/** Whole rupees or rupees with up to 2 decimals → paise; null when it isn't a valid amount. */
function parseInr(value: string): number | null {
  const trimmed = value.trim().replace(/,/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  return Math.round(Number(trimmed) * 100);
}

function formatDate(iso: string, withTime = true): string {
  return new Date(iso).toLocaleString("en-IN", withTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" });
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [history, setHistory] = useState<WalletTransactionPage | null>(null);
  const [page, setPage] = useState(1);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pageFeedback, setPageFeedback] = useState<Feedback>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState("500");
  const [amountError, setAmountError] = useState<string>();
  const [modalFeedback, setModalFeedback] = useState<Feedback>(null);
  const [paying, setPaying] = useState(false);

  const loadHistory = useCallback((target: number) => {
    return walletApi.transactions(target, PAGE_SIZE).then((loaded) => {
      setHistory(loaded);
      setPage(target);
    });
  }, []);

  useEffect(() => {
    Promise.all([walletApi.get().then(setWallet), loadHistory(1)]).catch((err: unknown) => setLoadError(errorMessage(err)));
  }, [loadHistory]);

  function openModal() {
    setAmountError(undefined);
    setModalFeedback(null);
    setModalOpen(true);
  }

  function changeAmount(value: string) {
    setAmount(value);
    setAmountError(undefined);
    setModalFeedback(null);
  }

  async function pay() {
    if (!wallet) return;
    const amountPaise = parseInr(amount);
    const error =
      amountPaise === null
        ? "Enter an amount in rupees, e.g. 500"
        : amountPaise < wallet.minTopupPaise || amountPaise > wallet.maxTopupPaise
          ? `Enter an amount between ${formatPaise(wallet.minTopupPaise)} and ${formatPaise(wallet.maxTopupPaise)}`
          : undefined;
    setAmountError(error);
    setModalFeedback(null);
    if (error || amountPaise === null) return;

    setPaying(true);
    try {
      const checkout = await walletApi.createTopup(amountPaise);
      // Razorpay opens its own window; ours would keep focus from it.
      setModalOpen(false);
      const payment = await openRazorpayCheckout(checkout, `Wallet top-up of ${formatPaise(amountPaise)}`);
      const result = await walletApi.confirmTopup(payment);
      setWallet(result.wallet);
      await loadHistory(1);
      setPageFeedback({ status: "success", message: `${formatPaise(amountPaise)} added to your wallet.` });
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

  const totalPages = history ? Math.max(1, Math.ceil(history.total / history.pageSize)) : 1;
  const amountPaise = parseInr(amount);
  const lastTopup = history?.transactions.find((item) => item.source === "TOPUP");

  return (
    <div className="px-6 py-8 sm:px-8">
      <PageHeader title="Wallet" description="Add money to your wallet to pay for AI usage." />

      {loadError && (
        <div className="mt-6">
          <FormAlert status="danger">{loadError}</FormAlert>
        </div>
      )}

      {!wallet && !loadError && (
        <div className="grid place-items-center py-20">
          <Spinner aria-label="Loading wallet" />
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
                  <WalletIcon className="size-4" aria-hidden />
                  Available balance
                </div>
                <p className="mt-2 text-5xl font-semibold tracking-tight">{formatPaise(wallet.balancePaise, wallet.currency)}</p>
                <p className="mt-2 text-sm text-white/70">
                  Used for AI website building and the AI assistant in the editor.
                  {lastTopup && ` Last top-up ${formatPaise(lastTopup.amountPaise)} on ${formatDate(lastTopup.createdAt, false)}.`}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Button
                  size="lg"
                  onPress={openModal}
                  isDisabled={!wallet.paymentsEnabled || paying}
                  className="bg-white font-semibold text-indigo-700 shadow-sm hover:bg-white/90"
                >
                  <Plus className="size-4" aria-hidden /> Add money
                </Button>
                {!wallet.paymentsEnabled && (
                  <p className="text-xs text-white/70">Online payments aren't available yet. Please contact support.</p>
                )}
              </div>
            </div>
          </section>

          {pageFeedback && <FormAlert status={pageFeedback.status}>{pageFeedback.message}</FormAlert>}

          <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-xs">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2 className="text-base font-semibold text-ink">Transaction history</h2>
              {history && history.total > 0 && (
                <span className="text-xs text-ink-muted">
                  {history.total} {history.total === 1 ? "transaction" : "transactions"}
                </span>
              )}
            </div>

            {!history ? (
              <div className="grid place-items-center py-16">
                <Spinner aria-label="Loading transactions" />
              </div>
            ) : history.transactions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
                <span className="grid size-10 place-items-center rounded-full bg-canvas text-ink-muted" aria-hidden>
                  <Receipt className="size-5" />
                </span>
                <p className="text-sm font-medium text-ink">No transactions yet</p>
                <p className="text-xs text-ink-muted">Top-ups and AI usage charges will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line bg-canvas/50 text-left text-xs uppercase tracking-wide text-ink-muted">
                      <th className="px-6 py-2.5 font-medium">Description</th>
                      <th className="px-4 py-2.5 font-medium">Type</th>
                      <th className="px-4 py-2.5 font-medium">Date</th>
                      <th className="px-4 py-2.5 text-right font-medium">Amount</th>
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
                            {formatPaise(item.amountPaise)}
                          </td>
                          <td className="whitespace-nowrap px-6 py-3.5 text-right text-ink-body">
                            {formatPaise(item.balanceAfterPaise)}
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
            icon: <WalletIcon className="size-4.5" />,
            title: "Add money",
            description: `Current balance ${formatPaise(wallet.balancePaise, wallet.currency)}`,
          }}
          iconTone="brand"
          size="sm"
          primaryAction={{
            label: amountPaise ? `Pay ${formatPaise(amountPaise)}` : "Pay",
            onPress: pay,
            isPending: paying,
          }}
          secondaryAction={{ label: "Cancel", onPress: () => setModalOpen(false), isDisabled: paying }}
        >
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3">
              {PRESETS_INR.map((preset) => {
                const selected = amountPaise === preset * 100;
                return (
                  <button
                    key={preset}
                    type="button"
                    aria-pressed={selected}
                    disabled={paying}
                    onClick={() => changeAmount(String(preset))}
                    className={`rounded-xl border px-4 py-3 text-left text-lg font-semibold text-ink transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
                      selected ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-line bg-surface hover:border-ink-muted/40"
                    }`}
                  >
                    {formatPaise(preset * 100)}
                  </button>
                );
              })}
            </div>

            <TextInput
              label="Or enter an amount (₹)"
              name="amount"
              value={amount}
              onChange={changeAmount}
              description={`Between ${formatPaise(wallet.minTopupPaise)} and ${formatPaise(wallet.maxTopupPaise)}`}
              error={amountError}
              isDisabled={paying}
            />

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
