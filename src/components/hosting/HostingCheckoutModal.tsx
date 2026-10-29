import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { CreditCard, Pencil, Server, Wallet } from "lucide-react";
import { hostingApi, type CollectInput, type PlanChoice, type WebsiteHosting } from "../../api/hosting.ts";
import { errorMessage } from "../../api/http.ts";
import { formatConnects, formatPaise } from "../../api/wallet.ts";
import { connectsForPaise, CYCLES, defaultPlan } from "../../utils/hosting-pricing.ts";
import { CheckoutDismissedError, openRazorpayCheckout } from "../../utils/razorpay-checkout.ts";
import CommonModal from "../ui/CommonModal.tsx";
import FormAlert from "../ui/FormAlert.tsx";
import SelectInput from "../ui/SelectInput.tsx";
import TextInput from "../ui/TextInput.tsx";
import { CYCLE_LABELS, CYCLE_PERIOD, formatBillingDate, formatPeriod, formatPlanPrice, METHOD_LABELS } from "./hosting-labels.tsx";
import PlanPicker from "./PlanPicker.tsx";
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
  /** Called when the admin changes this website's custom price from the dialog. */
  onHostingChange?: (hosting: WebsiteHosting) => void;
  /** Preselected package and cycle. */
  initialPlan?: PlanChoice | null;
  /** The plan was already chosen in an earlier step: show it as a summary, and this goes back to change it. */
  onChangePlan?: () => void;
};

type ClientMethod = "RAZORPAY" | "WALLET";
type AdminMethod = CollectInput["method"];
type Feedback = { status: "danger" | "warning" | "success"; message: string } | null;

const OFFLINE_METHODS: AdminMethod[] = ["CASH", "UPI", "BANK_TRANSFER"];

export default function HostingCheckoutModal({
  isOpen,
  onClose,
  hosting: initialHosting,
  isAdmin,
  onPaid,
  title,
  notice,
  onHostingChange,
  initialPlan,
  onChangePlan,
}: HostingCheckoutModalProps) {
  const [hosting, setHosting] = useState(initialHosting);
  const [plan, setPlan] = useState<PlanChoice | null>(initialPlan ?? defaultPlan(initialHosting));
  const [clientMethod, setClientMethod] = useState<ClientMethod>("RAZORPAY");
  const [adminMethod, setAdminMethod] = useState<AdminMethod>("CASH");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [editingPrice, setEditingPrice] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [paying, setPaying] = useState(false);
  /** Razorpay opens its own window; ours would keep focus from it. */
  const [razorpayOpen, setRazorpayOpen] = useState(false);

  const { payment: options } = hosting;

  /** Admins set the price straight away when they pick a custom plan that has none for that cycle. */
  function needsCustomPrice(source: WebsiteHosting, choice: PlanChoice | null): boolean {
    const pkg = choice && source.packages.find((item) => item.id === choice.packageId);
    return isAdmin && Boolean(pkg?.isCustom) && pkg!.prices[choice!.cycle] === null;
  }

  // Reset when the dialog opens, not when the parent passes back a price change made in here.
  const openedFor = isOpen ? initialHosting.website.id : null;
  useEffect(() => {
    if (!openedFor) return;
    const initial = initialPlan ?? defaultPlan(initialHosting);
    setHosting(initialHosting);
    setPlan(initial);
    setClientMethod(initialHosting.payment.razorpay || !initialHosting.payment.connects ? "RAZORPAY" : "WALLET");
    setAdminMethod("CASH");
    setReference("");
    setNote("");
    setEditingPrice(needsCustomPrice(initialHosting, initial));
    setFeedback(null);
  }, [openedFor, initialPlan?.packageId, initialPlan?.cycle]);

  const selected = plan ? hosting.packages.find((pkg) => pkg.id === plan.packageId) : undefined;
  const price = selected && plan ? selected.prices[plan.cycle] : null;
  const period = plan ? hosting.nextPeriods[plan.cycle] : null;
  const connects = price === null ? 0 : connectsForPaise(price, options.connectsPerRupee);
  const autopayRenews =
    !isAdmin &&
    hosting.subscription?.status === "ACTIVE" &&
    (hosting.autopay?.status === "AUTHENTICATED" || hosting.autopay?.status === "ACTIVE");
  const blocked = hosting.renewalOpensAt !== null || autopayRenews;

  const usesConnects = price !== null && price > 0 && (isAdmin ? adminMethod === "WALLET" : clientMethod === "WALLET");
  const shortBy = usesConnects ? Math.max(0, connects - options.balance) : 0;
  const cannotPayOnline = !isAdmin && clientMethod === "RAZORPAY" && price !== null && price > 0 && !options.razorpay;

  function choosePlan(next: PlanChoice) {
    setPlan(next);
    setEditingPrice(needsCustomPrice(hosting, next));
    setFeedback(null);
  }

  /** The new price is selected, on the cycle the admin was looking at when it offers that cycle. */
  function handlePriceSaved(updated: WebsiteHosting) {
    setHosting(updated);
    setEditingPrice(false);
    onHostingChange?.(updated);
    const custom = updated.packages.find((pkg) => pkg.isCustom);
    if (!custom) return;
    const wanted = plan?.cycle ?? "YEARLY";
    const cycle = custom.prices[wanted] !== null ? wanted : (CYCLES.find((option) => custom.prices[option] !== null) ?? wanted);
    setPlan({ packageId: custom.id, cycle });
  }

  async function payOnline(chosen: PlanChoice) {
    const result = await hostingApi.checkout(hosting.website.id, chosen);
    if (result.status === "PAID") return result.hosting;
    setRazorpayOpen(true);
    try {
      const confirmation = await openRazorpayCheckout(result.checkout, result.checkout.description);
      return await hostingApi.confirmCheckout(hosting.website.id, confirmation);
    } finally {
      setRazorpayOpen(false);
    }
  }

  async function pay() {
    if (!plan) return;
    setFeedback(null);
    setPaying(true);
    try {
      const updated = isAdmin
        ? await hostingApi.collect(hosting.website.id, { ...plan, method: adminMethod, reference: reference.trim(), note: note.trim() })
        : clientMethod === "WALLET"
          ? await hostingApi.payWithConnects(hosting.website.id, plan)
          : await payOnline(plan);
      onPaid(updated);
    } catch (err) {
      setFeedback(
        err instanceof CheckoutDismissedError
          ? { status: "warning", message: "Payment cancelled. No money was taken." }
          : { status: "danger", message: err instanceof Error && err.constructor === Error ? err.message : errorMessage(err) },
      );
    } finally {
      setPaying(false);
    }
  }

  const primaryLabel =
    price === null
      ? selected?.isCustom && isAdmin
        ? "Set the price first"
        : "Choose a plan"
      : isAdmin
        ? `Record ${price === 0 ? "free plan" : formatPaise(price)}`
        : price === 0
          ? "Activate free plan"
          : clientMethod === "WALLET"
            ? `Pay ${formatConnects(connects)}`
            : `Pay ${formatPaise(price)}`;

  const contactUs = (
    <a href="/contact" target="_blank" rel="noreferrer" className={buttonVariants({ size: "sm", variant: "outline", className: "w-full" })}>
      Contact us
    </a>
  );

  return (
    <CommonModal
      isOpen={isOpen && !razorpayOpen}
      onClose={() => !paying && onClose()}
      headerDetails={{
        icon: <Server className="size-4.5" />,
        title: title ?? (hosting.subscription?.currentPeriodEnd ? "Renew hosting" : "Activate hosting"),
        description: `${hosting.website.name} · ${hosting.website.subdomain}`,
      }}
      iconTone="brand"
      size="lg"
      primaryAction={{
        label: primaryLabel,
        onPress: pay,
        isPending: paying,
        isDisabled: blocked || price === null || shortBy > 0 || cannotPayOnline || editingPrice,
      }}
      secondaryAction={{ label: "Cancel", onPress: onClose, isDisabled: paying }}
    >
      <div className="flex flex-col gap-4">
        {notice}
        {autopayRenews ? (
          <FormAlert status="warning">
            Autopay renews this plan on {formatBillingDate(hosting.subscription!.currentPeriodEnd!)}. Turn autopay off in the
            Hosting tab to pay another way.
          </FormAlert>
        ) : (
          blocked && (
            <FormAlert status="warning">
              Paid until {formatBillingDate(hosting.subscription!.currentPeriodEnd!)}. You can renew from{" "}
              {formatBillingDate(hosting.renewalOpensAt!)}.
            </FormAlert>
          )
        )}

        {hosting.packages.length === 0 ? (
          <FormAlert status="warning">No hosting packages are available yet. Please contact support.</FormAlert>
        ) : onChangePlan && selected && plan ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand/30 bg-brand-soft/30 px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs text-ink-muted">Selected plan</p>
              <p className="text-sm font-semibold text-ink">
                {selected.name} · {CYCLE_LABELS[plan.cycle]}
              </p>
              <p className="text-xs text-ink-muted">
                {price === null ? "No price set for this website yet" : `${formatPlanPrice(price)} per ${CYCLE_PERIOD[plan.cycle]}`}
              </p>
            </div>
            <div className="flex gap-2">
              {isAdmin && selected.isCustom && !editingPrice && (
                <Button size="sm" variant="ghost" onPress={() => setEditingPrice(true)} isDisabled={paying}>
                  <Pencil className="size-3.5" aria-hidden /> Adjust price
                </Button>
              )}
              <Button size="sm" variant="outline" onPress={onChangePlan} isDisabled={paying}>
                Change plan
              </Button>
            </div>
          </div>
        ) : (
          <PlanPicker
            packages={hosting.packages}
            value={plan}
            onChange={choosePlan}
            currentPackageId={hosting.subscription?.packageId}
            customAction={isAdmin ? undefined : contactUs}
            onEditCustom={isAdmin ? () => setEditingPrice(true) : undefined}
            isDisabled={paying}
          />
        )}

        {isAdmin && editingPrice && (
          <div className="rounded-xl border border-brand/30 bg-brand-soft/30 p-4">
            <p className="text-sm font-semibold text-ink">Price for this website</p>
            <p className="mb-3 mt-0.5 text-xs text-ink-muted">Starts from the default price. Save a change, then record the payment.</p>
            <WebsitePriceEditor
              hosting={hosting}
              onSaved={handlePriceSaved}
              onCancel={() => setEditingPrice(false)}
              preferredCycle={plan?.cycle}
              autoFocus
            />
          </div>
        )}

        {period && price !== null && (
          <dl className="divide-y divide-line rounded-lg border border-line text-sm">
            <div className="flex justify-between gap-4 px-4 py-2.5">
              <dt className="text-ink-muted">Covers</dt>
              <dd className="font-medium text-ink">{formatPeriod(period.start, period.end)}</dd>
            </div>
            <div className="flex justify-between gap-4 px-4 py-2.5">
              <dt className="text-ink-muted">Total</dt>
              <dd className="font-semibold text-ink">{price === 0 ? "Free" : formatPaise(price)}</dd>
            </div>
          </dl>
        )}

        {!isAdmin && price !== null && price > 0 && (options.connects || !options.razorpay) && (
          <div role="radiogroup" aria-label="Payment method" className="grid gap-2 sm:grid-cols-2">
            <MethodOption
              selected={clientMethod === "RAZORPAY"}
              onSelect={() => setClientMethod("RAZORPAY")}
              icon={<CreditCard className="size-4" aria-hidden />}
              title="Pay online"
              detail={options.razorpay ? "Card, UPI or net banking" : "Not available yet"}
              isDisabled={!options.razorpay}
            />
            {options.connects && (
              <MethodOption
                selected={clientMethod === "WALLET"}
                onSelect={() => setClientMethod("WALLET")}
                icon={<Wallet className="size-4" aria-hidden />}
                title={`Use ${formatConnects(connects)}`}
                detail={`Balance ${formatConnects(options.balance)}`}
              />
            )}
          </div>
        )}

        {isAdmin && price !== null && (
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput
              label="Payment"
              value={adminMethod}
              onChange={(value) => {
                setAdminMethod(value);
                setFeedback(null);
              }}
              options={[
                ...OFFLINE_METHODS.map((value) => ({ value, label: `Collected · ${METHOD_LABELS[value]}` })),
                ...(options.connects ? [{ value: "WALLET" as const, label: "Charge client's connects" }] : []),
              ]}
            />
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-ink">{usesConnects ? "Charged from wallet" : "Amount to collect"}</span>
              <p className="flex h-9 items-center rounded-lg border border-line bg-canvas/60 px-3 text-sm font-semibold text-ink">
                {usesConnects ? formatConnects(connects) : price === 0 ? "Free" : formatPaise(price)}
              </p>
              <span className="text-xs text-ink-muted">
                {usesConnects ? `Client has ${formatConnects(options.balance)}` : "The plan's price for this period"}
              </span>
            </div>
            <TextInput label="Reference (optional)" name="reference" value={reference} onChange={setReference} placeholder="Receipt or UPI ref" />
            <TextInput label="Note (optional)" name="note" value={note} onChange={setNote} />
          </div>
        )}

        {cannotPayOnline && (
          <FormAlert status="warning">
            Online payments aren't set up yet.{options.connects ? " Pay with connects, or contact support." : " Please contact support."}
          </FormAlert>
        )}
        {shortBy > 0 && !blocked && (
          <FormAlert status="warning">
            {isAdmin
              ? `The client needs ${formatConnects(shortBy)} more. Record money you collected instead.`
              : `You need ${formatConnects(shortBy)} more. Pay online instead, or buy connects.`}
          </FormAlert>
        )}
        {!isAdmin && shortBy > 0 && !blocked && (
          <Link to="/connects" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Buy connects
          </Link>
        )}

        {feedback && <FormAlert status={feedback.status}>{feedback.message}</FormAlert>}
      </div>
    </CommonModal>
  );
}

function MethodOption({
  selected,
  onSelect,
  icon,
  title,
  detail,
  isDisabled,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  title: string;
  detail: string;
  isDisabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={isDisabled}
      onClick={onSelect}
      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        selected ? "border-brand bg-brand-soft/40 ring-1 ring-brand/30" : "border-line hover:border-line-strong"
      }`}
    >
      <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${selected ? "bg-brand text-white" : "bg-canvas text-ink-muted"}`}>
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink">{title}</span>
        <span className="block text-xs text-ink-muted">{detail}</span>
      </span>
    </button>
  );
}
