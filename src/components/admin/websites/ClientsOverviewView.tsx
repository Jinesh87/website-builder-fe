import { useEffect, useState } from "react";
import { Button, SearchField, Spinner } from "@heroui/react";
import { AlarmClock, CloudOff, Globe, Plus, UserCog, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { adminHostingApi, type ClientAttention, type ClientOverview, type ClientOverviewList } from "../../../api/hosting.ts";
import { errorMessage } from "../../../api/http.ts";
import { formatConnects, formatPaise } from "../../../api/wallet.ts";
import { useDebouncedValue } from "../../../hooks/use-debounced-value.ts";
import { daysUntil, formatBillingDate } from "../../hosting/hosting-labels.tsx";
import FormAlert from "../../ui/FormAlert.tsx";
import SelectInput, { type SelectOption } from "../../ui/SelectInput.tsx";
import StatCard from "../StatCard.tsx";
import { IconLink, RowActions } from "./RowActions.tsx";

const PAGE_SIZE = 20;

const ATTENTION_OPTIONS: SelectOption<ClientAttention | "">[] = [
  { value: "", label: "All clients" },
  { value: "DUE_SOON", label: "Renewal due soon" },
  { value: "GRACE", label: "In grace" },
  { value: "SUSPENDED", label: "Offline · unpaid" },
  { value: "NO_PLAN", label: "Websites without a plan" },
];

function Pill({ tone, children }: { tone: string; children: string }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>{children}</span>;
}

function HostingPills({ hosting }: { hosting: ClientOverview["hosting"] }) {
  const pills = [
    hosting.active > 0 && <Pill key="active" tone="bg-emerald-500/10 text-emerald-700">{`${hosting.active} active`}</Pill>,
    hosting.dueSoon > 0 && <Pill key="due" tone="bg-amber-500/10 text-amber-700">{`${hosting.dueSoon} due soon`}</Pill>,
    hosting.grace > 0 && <Pill key="grace" tone="bg-orange-500/10 text-orange-700">{`${hosting.grace} in grace`}</Pill>,
    hosting.suspended > 0 && <Pill key="offline" tone="bg-rose-500/10 text-rose-700">{`${hosting.suspended} offline`}</Pill>,
    hosting.awaitingPayment > 0 && (
      <Pill key="awaiting" tone="bg-indigo-500/10 text-indigo-700">{`${hosting.awaitingPayment} awaiting`}</Pill>
    ),
    hosting.withoutPlan > 0 && <Pill key="none" tone="bg-canvas text-ink-muted">{`${hosting.withoutPlan} no plan`}</Pill>,
  ].filter(Boolean);
  return pills.length ? <div className="flex max-w-56 flex-wrap gap-1">{pills}</div> : <span className="text-ink-muted">—</span>;
}

function websiteBreakdown(websites: ClientOverview["websites"]): string {
  const parts = [
    websites.published && `${websites.published} live`,
    websites.draft && `${websites.draft} draft`,
    websites.unpublished && `${websites.unpublished} offline`,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "No websites";
}

/** One row per client; the globe opens that client's websites with hosting and payments. */
export default function ClientsOverviewView() {
  const [search, setSearch] = useState("");
  const [attention, setAttention] = useState<ClientAttention | "">("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const [data, setData] = useState<ClientOverviewList | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    adminHostingApi
      .clients({ search: debouncedSearch || undefined, attention, page, pageSize: PAGE_SIZE })
      .then((loaded) => !cancelled && setData(loaded))
      .catch((err: unknown) => !cancelled && setLoadError(errorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, attention, page]);

  function resetPageAnd<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  const toggleAttention = (value: ClientAttention) => () => resetPageAnd(setAttention)(attention === value ? "" : value);
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const hasFilters = Boolean(debouncedSearch || attention);

  return (
    <>
      {data && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Clients"
            value={String(data.summary.clients)}
            hint="Workspaces on the platform"
            icon={<Users className="size-4" aria-hidden />}
            tone="bg-indigo-50 text-indigo-600"
          />
          <StatCard
            label="Websites"
            value={String(data.summary.websites)}
            hint={`${data.summary.liveWebsites} live right now`}
            icon={<Globe className="size-4" aria-hidden />}
            tone="bg-brand-soft text-brand"
          />
          <StatCard
            label="Renewals due"
            value={String(data.summary.dueSoon)}
            hint={`Plans ending within ${data.summary.dueSoonDays} days`}
            icon={<AlarmClock className="size-4" aria-hidden />}
            tone="bg-amber-50 text-amber-600"
            onPress={toggleAttention("DUE_SOON")}
            active={attention === "DUE_SOON"}
          />
          <StatCard
            label="Offline · unpaid"
            value={String(data.summary.suspended)}
            hint="Taken offline after grace"
            icon={<CloudOff className="size-4" aria-hidden />}
            tone="bg-rose-50 text-rose-600"
            onPress={toggleAttention("SUSPENDED")}
            active={attention === "SUSPENDED"}
          />
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <SearchField aria-label="Search clients" value={search} onChange={resetPageAnd(setSearch)} className="w-full max-w-xs">
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Search client, login or website" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <SelectInput ariaLabel="Needs attention" value={attention} onChange={resetPageAnd(setAttention)} options={ATTENTION_OPTIONS} />
        {loading && data && <Spinner size="sm" aria-label="Updating" />}
      </div>

      {loadError && (
        <div className="mt-4 max-w-2xl">
          <FormAlert status="danger">{loadError}</FormAlert>
        </div>
      )}

      <section className="mt-4 overflow-hidden rounded-xl border border-line bg-surface">
        {!data ? (
          <div className="grid place-items-center py-16">{loading && <Spinner aria-label="Loading clients" />}</div>
        ) : data.items.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-soft text-brand">
              <Users className="size-6" aria-hidden />
            </span>
            <h2 className="mt-4 text-base font-semibold text-ink">{hasFilters ? "No clients match these filters" : "No clients yet"}</h2>
            <p className="mt-1 text-sm text-ink-body">
              {hasFilters ? "Try a different search or filter." : "Clients appear here once they sign up or you add them."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-canvas/60 text-xs text-ink-muted">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">Client</th>
                  <th scope="col" className="px-5 py-3 font-medium">Websites</th>
                  <th scope="col" className="px-5 py-3 font-medium">Hosting</th>
                  <th scope="col" className="px-5 py-3 font-medium">Next renewal</th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">Hosting paid</th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">Wallet</th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.items.map((item) => {
                  const websitesHref = `/admin/websites/clients/${item.client.id}`;
                  const renewalDays = item.nextRenewal && daysUntil(item.nextRenewal.date);
                  return (
                    <tr key={item.client.id} className="hover:bg-canvas/40">
                      <td className="px-5 py-3">
                        <Link to={websitesHref} className="font-medium text-ink hover:text-brand">
                          {item.client.businessName}
                        </Link>
                        {item.owner && (
                          <p className="text-xs text-ink-muted">
                            {[item.owner.fullName, item.owner.username ? `@${item.owner.username}` : item.owner.email]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-ink">{item.websites.total}</p>
                        <p className="text-xs text-ink-muted">{websiteBreakdown(item.websites)}</p>
                      </td>
                      <td className="px-5 py-3">
                        <HostingPills hosting={item.hosting} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-3">
                        {item.nextRenewal ? (
                          <>
                            <p className={renewalDays !== null && renewalDays <= 7 ? "font-medium text-amber-700" : "text-ink"}>
                              {formatBillingDate(item.nextRenewal.date)}
                            </p>
                            <p className="max-w-44 truncate text-xs text-ink-muted">
                              {item.nextRenewal.websiteName}
                              {renewalDays !== null && renewalDays >= 0 && ` · ${renewalDays}d`}
                            </p>
                          </>
                        ) : (
                          <span className="text-ink-muted">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-right">
                        <p className="font-semibold text-ink">{item.paid.connects.toLocaleString("en-IN")}</p>
                        <p className="text-xs text-ink-muted">
                          {item.paid.payments} {item.paid.payments === 1 ? "payment" : "payments"}
                          {item.paid.collectedPaise > 0 && ` · ${formatPaise(item.paid.collectedPaise)}`}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-right text-ink-body">{formatConnects(item.balance)}</td>
                      <td className="px-5 py-3">
                        <RowActions>
                          <IconLink to={websitesHref} label="Websites & hosting" icon={Globe} tone="brand" />
                          <IconLink to={`/admin/clients/${item.client.id}`} label="Client details" icon={UserCog} />
                          <IconLink
                            to={`/websites/new?clientId=${encodeURIComponent(item.client.id)}`}
                            label="Create website"
                            icon={Plus}
                          />
                        </RowActions>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {data && data.total > data.pageSize && (
        <div className="mt-4 flex items-center justify-between text-sm text-ink-body">
          <span>
            Page {data.page} of {totalPages} · {data.total} clients
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" isDisabled={page <= 1 || loading} onPress={() => setPage(page - 1)}>
              Previous
            </Button>
            <Button size="sm" variant="outline" isDisabled={page >= totalPages || loading} onPress={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
