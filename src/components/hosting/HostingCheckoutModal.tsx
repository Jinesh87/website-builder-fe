import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { buttonVariants } from "@heroui/styles";
import { Check, Pencil, Server } from "lucide-react";
import {
  hostingApi,
  type BillingCycle,
  type HostingPaymentMethod,
  type WebsiteHosting,
} from "../../api/hosting.ts";
import { ApiError, errorMessage } from "../../api/http.ts";
import { connectsPriceInPaise, formatConnects, formatPaise } from "../../api/wallet.ts";
import CommonModal from "../ui/CommonModal.tsx";
import FormAlert from "../ui/FormAlert.tsx";
import SelectInput from "../ui/SelectInput.tsx";
import TextInput from "../ui/TextInput.tsx";
import { CYCLE_LABELS, CYCLE_PERIOD, formatBillingDate, formatPeriod, METHOD_LABELS, PRICE_SOURCE_LABELS } from "./hosting-labels.tsx";
import WebsitePriceEditor from "./WebsitePriceEditor.tsx";

type HostingCheckoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  hosting: WebsiteHosting;
  isAdmin: boolean;
  onPaid: (hosting: WebsiteHosting) => void;
  /** E.g. "Choose a plan to publish". */
  title?: string;
  /** Shown above the plans, e.g. why a plan is needed. */
  notice?: ReactNode;
  /** Called when the admin changes this website's price from the dialog. */
  onHostingChange?: (hosting: WebsiteHosting) => void;
};

const CYCLES: BillingCycle[] = ["QUARTERLY", "YEARLY"];
const ADMIN_METHODS: HostingPaymentMethod[] = ["CASH", "UPI", "BANK_TRANSFER", "WALLET"];
const RUPEES_PATTERN = /^\d{1,8}(\.\d{1,2})?$/;

function rupeesFor(connects: number, connectsPerRupee: number): string {
  const paise = connectsPriceInPaise(connects, connectsPerRupee);
  return paise % 100 === 0 ? String(paise / 100) : (paise / 100).toFixed(2);
}

export default function HostingCheckoutModal({
  isOpen,
  onClose,
  hosting: initialHosting,
  isAdmin,
  onPaid,
  title,
  notice,
  onHostingChange,
}: HostingCheckoutModalProps) {
  const [hosting, setHosting] = useState(initialHosting);
  const [editingPrice, setEditingPrice] = useState(false);
  const [cycle, setCycle] = useState<BillingCycle>(initialHosting.subscription?.cycle ?? "QUARTERLY");
  const [method, setMethod] = useState<HostingPaymentMethod>("CASH");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [amountError, setAmountError] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const price = hosting.prices[cycle].amount;
  const period = hosting.nextPeriods[cycle];

  // Reset when the dialog opens, not when the parent passes back a price change made in here.
  const openedFor = isOpen ? initialHosting.website.id : null;
  useEffect(() => {
    if (!openedFor) return;
    const initial = initialHosting.subscription?.cycle ?? "QUARTERLY";
    setHosting(initialHosting);
    setEditingPrice(false);
    setCycle(initial);
    setMethod("CASH");
    setAmount(rupeesFor(initialHosting.prices[initial].amount, initialHosting.connectsPerRupee));
    setReference("");
    setNote("");
    setAmountError(undefined);
    setError(null);
  }, [openedFor]);

  function chooseCycle(next: BillingCycle) {
    setCycle(next);
    setAmount(rupeesFor(hosting.prices[next].amount, hosting.connectsPerRupee));
    setError(null);
  }

  function handlePriceSaved(updated: WebsiteHosting) {
    setHosting(updated);
    setEditingPrice(false);
    setAmount(rupeesFor(updated.prices[cycle].amount, updated.connectsPerRupee));
    onHostingChange?.(updated);
  }

  const offline = isAdmin && method !== "WALLET";
  const collectedPaise = offline && RUPEES_PATTERN.test(amount) ? Math.round(Number(amount) * 100) : 0;
  // Same rule as the server: collecting exactly the plan's rupee price credits exactly the price.
  const creditConnects =
    collectedPaise === 0
      ? 0
      : price > 0 && collectedPaise === connectsPriceInPaise(price, hosting.connectsPerRupee)
        ? price
        : Math.round(collectedPaise * hosting.connectsPerRupee * 10) / 1000;
  const shortBy = Math.max(0, price - hosting.balance - creditConnects);
  const blocked = hosting.renewalOpensAt !== null;

  async function pay() {
    setError(null);
    if (offline && !(RUPEES_PATTERN.test(amount) && Number(amount) > 0)) {
      setAmountError("Enter the rupees you collected");
      return;
    }
    setPaying(true);
    try {
      const updated = isAdmin
        ? await hostingApi.collect(
            hosting.website.id,
            method === "WALLET"
              ? { cycle, method, reference: reference.trim(), note: note.trim() }
              : { cycle, method, amountRupees: Number(amount), reference: reference.trim(), note: note.trim() },
          )
        : await hostingApi.pay(hosting.website.id, cycle);
      onPaid(updated);
    } catch (err) {
      setError(err instanceof ApiError && err.fieldErrors().amountRupees ? err.fieldErrors().amountRupees! : errorMessage(err));
    } finally {
      setPaying(false);
    }
  }

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={() => !paying && onClose()}
      headerDetails={{
        icon: <Server className="size-4.5" />,
        title: title ?? (hosting.subscription?.currentPeriodEnd ? "Renew hosting" : "Activate hosting"),
        description: `${hosting.website.name} · ${hosting.website.subdomain}`,
      }}
      iconTone="brand"
      size="md"
      primaryAction={{
        label: isAdmin ? "Record payment" : `Pay ${formatConnects(price)}`,
        onPress: pay,
        isPending: paying,
        isDisabled: blocked || (!offline && shortBy > 0),
      }}
      secondaryAction={{ label: "Cancel", onPress: onClose, isDisabled: paying }}
    >
      <div className="flex flex-col gap-4">
        {notice}
        {blocked && (
          <FormAlert status="warning">
            Paid until {formatBillingDate(hosting.subscription!.currentPeriodEnd!)}. You can renew from{" "}
            {formatBillingDate(hosting.renewalOpensAt!)}.
          </FormAlert>
        )}

        <div role="radiogroup" aria-label="Billing cycle" className="grid gap-3 sm:grid-cols-2">
          {CYCLES.map((option) => {
            const selected = option === cycle;
            const optionPrice = hosting.prices[option];
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => chooseCycle(option)}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  selected ? "border-brand bg-brand-soft/50 ring-1 ring-brand/30" : "border-line hover:border-line-strong"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">{CYCLE_LABELS[option]}</span>
                  {selected && <Check className="size-4 text-brand" aria-hidden />}
                </div>
                <p className="mt-2 text-lg font-bold text-ink">{formatConnects(optionPrice.amount)}</p>
                <p className="text-xs text-ink-muted">
                  {formatPaise(connectsPriceInPaise(optionPrice.amount, hosting.connectsPerRupee))} per {CYCLE_PERIOD[option]}
                  {optionPrice.source !== "GLOBAL" && ` · ${PRICE_SOURCE_LABELS[optionPrice.source]}`}
                </p>
              </button>
            );
          })}
        </div>

        {isAdmin &&
          (editingPrice ? (
            <div className="rounded-xl border border-brand/30 bg-brand-soft/30 p-4">
              <p className="mb-3 text-sm font-semibold text-ink">Set price</p>
              <WebsitePriceEditor
                hosting={hosting}
                cycle={cycle}
                onSaved={handlePriceSaved}
                onCancel={() => setEditingPrice(false)}
              />
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-line-strong px-3 py-2">
              <p className="min-w-0 text-xs text-ink-body">
                <span className="font-medium text-ink">Price:</span> {PRICE_SOURCE_LABELS[hosting.prices[cycle].source]}
                <span className="text-ink-muted">
                  {" "}
                  · Q {hosting.prices.QUARTERLY.amount.toLocaleString("en-IN")} / Y {hosting.prices.YEARLY.amount.toLocaleString("en-IN")}
                </span>
              </p>
              <button
                type="button"
                onClick={() => setEditingPrice(true)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand-soft"
              >
                <Pencil className="size-3.5" aria-hidden /> Change price
              </button>
            </div>
          ))}

        <dl className="divide-y divide-line rounded-lg border border-line text-sm">
          <div className="flex justify-between gap-4 px-4 py-2.5">
            <dt className="text-ink-muted">Covers</dt>
            <dd className="font-medium text-ink">{formatPeriod(period.start, period.end)}</dd>
          </div>
          <div className="flex justify-between gap-4 px-4 py-2.5">
            <dt className="text-ink-muted">{isAdmin ? "Client's connects" : "Your connects"}</dt>
            <dd className="font-medium text-ink">{formatConnects(hosting.balance)}</dd>
          </div>
        </dl>

        {isAdmin && (
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput
              label="Payment"
              value={method}
              onChange={(value) => {
                setMethod(value);
                setError(null);
              }}
              options={ADMIN_METHODS.map((value) => ({
                value,
                label: value === "WALLET" ? "Charge client's connects" : `Collected · ${METHOD_LABELS[value]}`,
              }))}
            />
            {offline && (
              <div>
                <TextInput
                  label="Amount collected (₹)"
                  name="amountRupees"
                  value={amount}
                  onChange={(value) => {
                    setAmount(value.replace(/[^\d.]/g, ""));
                    setAmountError(undefined);
                  }}
                  error={amountError}
                  description={`Credited as ${formatConnects(creditConnects)}, then charged`}
                />
              </div>
            )}
            <TextInput label="Reference (optional)" name="reference" value={reference} onChange={setReference} placeholder="Receipt or UPI ref" />
            <TextInput label="Note (optional)" name="note" value={note} onChange={setNote} />
          </div>
        )}

        {shortBy > 0 && !blocked && (
          <FormAlert status="warning">
            {isAdmin
              ? offline
                ? `The collected amount is ${formatConnects(shortBy)} short of the price, and the client's connects don't cover the rest.`
                : `The client needs ${formatConnects(shortBy)} more. Record money you collected instead, or ask them to add connects.`
              : `You need ${formatConnects(shortBy)} more for this plan.`}
          </FormAlert>
        )}
        {!isAdmin && shortBy > 0 && !blocked && (
          <Link to="/connects" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Buy connects
          </Link>
        )}

        {error && <FormAlert status="danger">{error}</FormAlert>}
      </div>
    </CommonModal>
  );
}
