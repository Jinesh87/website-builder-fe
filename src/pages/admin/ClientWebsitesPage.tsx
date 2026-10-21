import { useCallback, useEffect, useState } from "react";
import { Chip, Spinner } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import {
  ArrowLeft,
  CircleCheck,
  Coins,
  CreditCard,
  Eye,
  Globe,
  History,
  LayoutDashboard,
  Pencil,
  Plus,
  SquarePen,
  UserCog,
  Wallet,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { adminHostingApi, hostingApi, type ClientHosting, type ClientHostingWebsite, type WebsiteHosting } from "../../api/hosting.ts";
import { errorMessage } from "../../api/http.ts";
import { formatConnects, formatPaise } from "../../api/wallet.ts";
import StatCard from "../../components/admin/StatCard.tsx";
import { SOURCE_LABELS } from "../../components/admin/client-labels.tsx";
import { IconButton, IconLink, RowActions } from "../../components/admin/websites/RowActions.tsx";
import HostingCheckoutModal from "../../components/hosting/HostingCheckoutModal.tsx";
import {
  CYCLE_LABELS,
  daysUntil,
  formatBillingDate,
  HostingStatusChip,
  METHOD_LABELS,
  PAYER_LABELS,
  PRICE_SOURCE_LABELS,
  remainingLabel,
} from "../../components/hosting/hosting-labels.tsx";
import WebsitePaymentsModal from "../../components/hosting/WebsitePaymentsModal.tsx";
import WebsitePriceEditor from "../../components/hosting/WebsitePriceEditor.tsx";
import CommonModal from "../../components/ui/CommonModal.tsx";
import FormAlert from "../../components/ui/FormAlert.tsx";
import { WebsiteStatusChip } from "../../components/websites/website-labels.tsx";

type Feedback = { status: "success" | "danger"; message: string } | null;

/** Super Admin: one client's websites with their hosting dates, payments and actions. */
export default function ClientWebsitesPage() {
  const { clientId = "" } = useParams();
  const [data, setData] = useState<ClientHosting | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  /** The website being paid for or re-priced, loaded on demand. */
  const [active, setActive] = useState<{ mode: "pay" | "price"; hosting: WebsiteHosting } | null>(null);
  const [opening, setOpening] = useState<string | null>(null);
  const [historyFor, setHistoryFor] = useState<ClientHostingWebsite | null>(null);

  const load = useCallback(
    () =>
      adminHostingApi
        .client(clientId)
        .then((loaded) => {
          setData(loaded);
          setLoadError(null);
        })
        .catch((err: unknown) => setLoadError(errorMessage(err))),
    [clientId],
  );

  useEffect(() => {
    setData(null);
    void load();
  }, [load]);

  async function open(website: ClientHostingWebsite, mode: "pay" | "price") {
    setOpening(website.id);
    setFeedback(null);
    try {
      setActive({ mode, hosting: await hostingApi.get(website.id) });
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setOpening(null);
    }
  }

  function handlePaid(updated: WebsiteHosting) {
    setActive(null);
    setFeedback({ status: "success", message: `Payment recorded for ${updated.website.name}.` });
    void load();
  }

  function handlePriceSaved() {
    setActive(null);
    setFeedback({ status: "success", message: "Price saved. It applies from each website's next payment." });
    void load();
  }

  if (loadError && !data) {
    return (
      <div className="px-6 py-8 sm:px-8">
        <BackLink />
        <div className="mt-6 max-w-2xl">
          <FormAlert status="danger">{loadError}</FormAlert>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Spinner size="lg" aria-label="Loading client websites" />
      </div>
    );
  }

  const { client, websites, totals } = data;
  const live = websites.filter((website) => website.status === "PUBLISHED").length;
  const activePlans = websites.filter((website) => website.subscription?.status === "ACTIVE").length;
  const needsAttention = websites.filter((website) =>
    ["GRACE", "SUSPENDED", "AWAITING_PAYMENT"].includes(website.subscription?.status ?? ""),
  ).length;
  const nextRenewal = websites
    .filter((website) => website.subscription?.status === "ACTIVE" && website.subscription.currentPeriodEnd)
    .map((website) => ({ name: website.name, date: website.subscription!.currentPeriodEnd! }))
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const owner = client.owner;

  return (
    <div className="px-6 py-8 sm:px-8">
      <BackLink />

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="truncate text-2xl font-semibold tracking-tight text-ink">{client.businessName}</h1>
            <Chip size="sm" variant="soft">
              {SOURCE_LABELS[client.source]}
            </Chip>
          </div>
          {owner && (
            <p className="mt-1 text-sm text-ink-body">
              {[owner.fullName, owner.username ? `@${owner.username}` : owner.email, owner.phone].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/admin/clients/${client.id}`} className={buttonVariants({ size: "sm", variant: "outline" })}>
            <UserCog className="size-4" aria-hidden /> Client details & prices
          </Link>
          <Link to={`/websites/new?clientId=${encodeURIComponent(client.id)}`} className={buttonVariants({ size: "sm" })}>
            <Plus className="size-4" aria-hidden /> Create website
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Websites"
          value={String(websites.length)}
          hint={`${live} live · ${websites.length - live} not live`}
          icon={<Globe className="size-4" aria-hidden />}
          tone="bg-brand-soft text-brand"
        />
        <StatCard
          label="Active plans"
          value={String(activePlans)}
          hint={
            nextRenewal
              ? `Next: ${nextRenewal.name}, ${formatBillingDate(nextRenewal.date)}`
              : needsAttention
                ? `${needsAttention} need attention`
                : "No upcoming renewal"
          }
          icon={<CircleCheck className="size-4" aria-hidden />}
          tone="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Hosting paid"
          value={totals.connects.toLocaleString("en-IN")}
          hint={`${totals.payments} ${totals.payments === 1 ? "payment" : "payments"}${
            totals.collectedPaise > 0 ? ` · ${formatPaise(totals.collectedPaise)} offline` : ""
          }`}
          icon={<Coins className="size-4" aria-hidden />}
          tone="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          label="Wallet"
          value={formatConnects(data.balance)}
          hint="Used for hosting renewals and AI"
          icon={<Wallet className="size-4" aria-hidden />}
          tone="bg-amber-50 text-amber-600"
        />
      </div>

      {feedback && (
        <div className="mt-4 max-w-3xl">
          <FormAlert status={feedback.status}>{feedback.message}</FormAlert>
        </div>
      )}

      <section className="mt-6 overflow-hidden rounded-xl border border-line bg-surface">
        {websites.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-soft text-brand">
              <Globe className="size-6" aria-hidden />
            </span>
            <h2 className="mt-4 text-base font-semibold text-ink">No websites yet</h2>
            <p className="mt-1 text-sm text-ink-body">Create the first website for this client.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-canvas/60 text-xs text-ink-muted">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">Website</th>
                  <th scope="col" className="px-5 py-3 font-medium">Status</th>
                  <th scope="col" className="px-5 py-3 font-medium">Plan</th>
                  <th scope="col" className="px-5 py-3 font-medium">Start</th>
                  <th scope="col" className="px-5 py-3 font-medium">End</th>
                  <th scope="col" className="px-5 py-3 font-medium">Hosting</th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">Price</th>
                  <th scope="col" className="px-5 py-3 font-medium">Last payment</th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {websites.map((website) => (
                  <WebsiteRow
                    key={website.id}
                    website={website}
                    isOpening={opening === website.id}
                    onRecordPayment={() => void open(website, "pay")}
                    onEditPrice={() => void open(website, "price")}
                    onHistory={() => setHistoryFor(website)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {active?.mode === "pay" && (
        <HostingCheckoutModal isOpen onClose={() => setActive(null)} hosting={active.hosting} isAdmin onPaid={handlePaid} />
      )}

      {active?.mode === "price" && (
        <CommonModal
          isOpen
          onClose={() => setActive(null)}
          headerDetails={{
            icon: <Pencil className="size-4.5" />,
            title: "Hosting price",
            description: `${active.hosting.website.name} · ${active.hosting.website.subdomain}`,
          }}
          iconTone="brand"
          size="md"
          disableFooter
        >
          <WebsitePriceEditor
            hosting={active.hosting}
            onSaved={handlePriceSaved}
            onCancel={() => setActive(null)}
          />
        </CommonModal>
      )}

      {historyFor && (
        <WebsitePaymentsModal
          isOpen
          onClose={() => setHistoryFor(null)}
          website={historyFor}
          subscription={historyFor.subscription}
        />
      )}
    </div>
  );
}

function WebsiteRow({
  website,
  isOpening,
  onRecordPayment,
  onEditPrice,
  onHistory,
}: {
  website: ClientHostingWebsite;
  isOpening: boolean;
  onRecordPayment: () => void;
  onEditPrice: () => void;
  onHistory: () => void;
}) {
  const { subscription, lastPayment } = website;
  const price = website.prices[subscription?.cycle ?? "QUARTERLY"];
  const remaining = subscription && remainingLabel(subscription);
  const endSoon = subscription?.status === "ACTIVE" && subscription.currentPeriodEnd && daysUntil(subscription.currentPeriodEnd) <= 7;

  return (
    <tr className="hover:bg-canvas/40">
      <td className="px-5 py-3">
        <Link to={`/websites/${website.id}`} className="font-medium text-ink hover:text-brand">
          {website.name}
        </Link>
        <p className="font-mono text-xs text-ink-muted">{website.subdomain}</p>
      </td>
      <td className="px-5 py-3">
        <WebsiteStatusChip website={{ status: website.status, hasUnpublishedChanges: false }} />
        {website.offlineReason === "BILLING" ? (
          <p className="mt-1 text-xs text-rose-700">Offline for non-payment</p>
        ) : (
          website.publishedAt && <p className="mt-1 text-xs text-ink-muted">Published {formatBillingDate(website.publishedAt)}</p>
        )}
      </td>
      <td className="px-5 py-3 text-ink-body">
        {subscription ? CYCLE_LABELS[subscription.cycle] : "—"}
        {subscription && !subscription.autoRenew && <p className="text-xs text-ink-muted">Auto-renew off</p>}
      </td>
      <td className="whitespace-nowrap px-5 py-3 text-ink-body">
        {subscription?.currentPeriodStart ? formatBillingDate(subscription.currentPeriodStart) : "—"}
      </td>
      <td className="whitespace-nowrap px-5 py-3">
        {subscription?.currentPeriodEnd ? (
          <>
            <p className={endSoon ? "font-medium text-amber-700" : "text-ink-body"}>{formatBillingDate(subscription.currentPeriodEnd)}</p>
            {remaining && <p className="text-xs text-ink-muted">{remaining}</p>}
          </>
        ) : (
          <span className="text-ink-muted">—</span>
        )}
      </td>
      <td className="px-5 py-3">
        <HostingStatusChip subscription={subscription} />
      </td>
      <td className="whitespace-nowrap px-5 py-3">
        <div className="flex items-center justify-end gap-1">
          <div className="text-right">
            <p className="font-semibold text-ink">{price.amount.toLocaleString("en-IN")}</p>
            <p className={`text-xs ${price.source === "WEBSITE" ? "font-medium text-brand" : "text-ink-muted"}`}>
              {PRICE_SOURCE_LABELS[price.source]}
            </p>
          </div>
          <IconButton onPress={onEditPrice} label="Edit website price" icon={Pencil} isDisabled={isOpening} />
        </div>
      </td>
      <td className="whitespace-nowrap px-5 py-3">
        {lastPayment ? (
          <>
            <p className="text-ink">{formatBillingDate(lastPayment.createdAt)}</p>
            <p className="text-xs text-ink-muted">
              {PAYER_LABELS[lastPayment.paidBy]} · {METHOD_LABELS[lastPayment.method]}
              {lastPayment.collectedPaise !== null && ` · ${formatPaise(lastPayment.collectedPaise)}`}
            </p>
          </>
        ) : (
          <span className="text-ink-muted">Never</span>
        )}
      </td>
      <td className="px-5 py-3">
        <RowActions>
          <IconLink to={`/websites/${website.id}`} label="Dashboard" icon={LayoutDashboard} tone="brand" />
          <IconLink to={`/websites/${website.id}/edit`} label="Edit site" icon={SquarePen} />
          <IconLink to={`/websites/${website.id}/preview`} label="Preview" icon={Eye} />
          <IconButton onPress={onRecordPayment} label="Record payment" icon={CreditCard} isDisabled={isOpening} />
          <IconButton onPress={onHistory} label="Payment history" icon={History} />
        </RowActions>
      </td>
    </tr>
  );
}

function BackLink() {
  return (
    <Link to="/admin/websites" className="inline-flex items-center gap-1 text-sm text-brand hover:underline">
      <ArrowLeft className="size-4" aria-hidden /> All websites
    </Link>
  );
}
