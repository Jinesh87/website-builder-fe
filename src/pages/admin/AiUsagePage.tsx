import { useCallback, useEffect, useState } from "react";
import { Button, Chip, SearchField, Spinner } from "@heroui/react";
import {
  Activity,
  ArrowUpDown,
  Cpu,
  DollarSign,
  Users,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MONTH_OPTIONS, YEAR_OPTIONS, currentMonth, currentYear } from "./ai-usage-period.ts";
import AiSparklesIcon from "../../components/icons/AiSparklesIcon.tsx";
import {
  adminAiUsageApi,
  type AiUsageListResponse,
  type AiUsageSortBy,
  type SortOrder,
} from "../../api/admin-ai-usage.ts";
import { errorMessage } from "../../api/http.ts";
import PageHeader from "../../components/app/PageHeader.tsx";
import FormAlert from "../../components/ui/FormAlert.tsx";
import SelectInput, { type SelectOption } from "../../components/ui/SelectInput.tsx";
import TablePagination from "../../components/ui/TablePagination.tsx";
import { useDebouncedValue } from "../../hooks/use-debounced-value.ts";

const DEFAULT_PAGE_SIZE = 10;

const SORT_OPTIONS: SelectOption<AiUsageSortBy>[] = [
  { value: "totalTokens", label: "Most tokens" },
  { value: "estimatedCost", label: "Highest cost" },
  { value: "totalRequests", label: "Most requests" },
  { value: "lastUsedAt", label: "Recently used" },
  { value: "businessName", label: "Client name" },
];

function formatNumber(num: number): string {
  return num.toLocaleString();
}

function formatCurrency(amount: number): string {
  if (!amount || amount === 0) return "$0.00";
  if (amount < 0.01) return `< $0.01`;
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDetailedCost(amount: number): string {
  if (!amount || amount === 0) return "$0.00";
  if (amount < 0.001) return `$${amount.toFixed(4)}`;
  return `$${amount.toFixed(3)}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AiUsagePage() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [month, setMonth] = useState<string>(searchParams.get("month") ?? String(currentMonth));
  const [year, setYear] = useState<string>(searchParams.get("year") ?? String(currentYear));
  const [sortBy, setSortBy] = useState<AiUsageSortBy>("totalTokens");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const [data, setData] = useState<AiUsageListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await adminAiUsageApi.list({
        search: debouncedSearch || undefined,
        month: month ? Number(month) : undefined,
        year: year ? Number(year) : undefined,
        sortBy,
        sortOrder,
        page,
        pageSize,
      });
      setData(res);
    } catch (err) {
      setLoadError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, month, year, sortBy, sortOrder, page, pageSize]);

  useEffect(() => {
    void load();
  }, [load]);

  function resetPageAnd<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  const callsPath = (clientId: string) =>
    `/admin/ai-usage/${clientId}?${new URLSearchParams({ month, year }).toString()}`;

  const hasFilters = Boolean(debouncedSearch || month !== String(currentMonth) || year !== String(currentYear));

  return (
    <div className="px-6 py-8 sm:px-8">
      <PageHeader
        title="AI Usage"
        description="Monitor OpenAI token consumption, estimated dollar cost, and generation activity across clients."
      />

      {/* KPI Overview Cards */}
      {data && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink-muted">Total Estimated Cost</span>
              <span className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <DollarSign className="size-4" aria-hidden />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-ink">
              {formatCurrency(data.summary.totalEstimatedCost)}
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              {data.summary.totalEstimatedCost > 0
                ? `${formatDetailedCost(data.summary.totalEstimatedCost)} accurate sum`
                : "Based on OpenAI API rates"}
            </p>
          </div>

          <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink-muted">Total Tokens</span>
              <span className="grid size-8 place-items-center rounded-lg bg-brand-soft text-brand">
                <Cpu className="size-4" aria-hidden />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-ink">
              {formatNumber(data.summary.totalTokens)}
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              {formatNumber(data.summary.promptTokens)} prompt · {formatNumber(data.summary.completionTokens)} completion
            </p>
          </div>

          <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink-muted">AI Requests</span>
              <span className="grid size-8 place-items-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                <Activity className="size-4" aria-hidden />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-ink">
              {formatNumber(data.summary.totalRequests)}
            </p>
            <p className="mt-1 text-xs text-ink-muted">Total prompt generations</p>
          </div>

          <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink-muted">Active Clients</span>
              <span className="grid size-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                <Users className="size-4" aria-hidden />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-ink">
              {formatNumber(data.summary.activeClientsCount)}
            </p>
            <p className="mt-1 text-xs text-ink-muted">Clients using AI in selected period</p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <SearchField
          aria-label="Search clients by name or email"
          value={search}
          onChange={resetPageAnd(setSearch)}
          className="w-full max-w-xs"
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Search client name or email" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>

        <SelectInput
          ariaLabel="Filter by Month"
          value={month}
          onChange={resetPageAnd(setMonth)}
          options={MONTH_OPTIONS}
        />

        <SelectInput
          ariaLabel="Filter by Year"
          value={year}
          onChange={resetPageAnd(setYear)}
          options={YEAR_OPTIONS}
        />

        <SelectInput
          ariaLabel="Sort by"
          value={sortBy}
          onChange={resetPageAnd(setSortBy)}
          options={SORT_OPTIONS}
        />

        <Button
          size="sm"
          variant="secondary"
          onPress={() => {
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
            setPage(1);
          }}
          className="h-9 gap-1.5 px-3"
          aria-label={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
        >
          <ArrowUpDown className="size-3.5 text-ink-muted" />
          <span className="text-xs font-medium">{sortOrder === "asc" ? "Asc" : "Desc"}</span>
        </Button>

        {loading && data && <Spinner size="sm" aria-label="Updating" />}
      </div>

      {loadError && (
        <div className="mt-4 max-w-2xl">
          <FormAlert status="danger">{loadError}</FormAlert>
        </div>
      )}

      {/* Main Table */}
      <section className="mt-4 overflow-hidden rounded-xl border border-line bg-surface">
        {!data && loading ? (
          <div className="grid place-items-center py-16">
            <Spinner aria-label="Loading AI usage" />
          </div>
        ) : data && data.items.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-soft text-brand">
              <AiSparklesIcon className="size-6" variant="glossy" />
            </span>
            <h2 className="mt-4 text-base font-semibold text-ink">
              {hasFilters ? "No AI usage matches these filters" : "No AI usage recorded yet"}
            </h2>
            <p className="mt-1 text-sm text-ink-body">
              {hasFilters
                ? "Try adjusting your search, month, or year selection."
                : "Client AI generations and token consumption will be logged here automatically."}
            </p>
          </div>
        ) : (
          data && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-canvas/60 text-xs font-medium text-ink-muted">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-medium">Client</th>
                    <th scope="col" className="px-5 py-3 font-medium">Est. Cost (USD)</th>
                    <th scope="col" className="px-5 py-3 font-medium">Total Tokens</th>
                    <th scope="col" className="px-5 py-3 font-medium">Token Breakdown</th>
                    <th scope="col" className="px-5 py-3 font-medium">Requests</th>
                    <th scope="col" className="px-5 py-3 font-medium">Primary Model</th>
                    <th scope="col" className="px-5 py-3 font-medium">Last Active</th>
                    <th scope="col" className="px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.items.map((row) => (
                    <tr
                      key={row.clientId}
                      onClick={() => navigate(callsPath(row.clientId))}
                      title="View cost of each call"
                      className="cursor-pointer hover:bg-canvas/40"
                    >
                      <td className="px-5 py-3">
                        <Link
                          to={`/admin/clients/${row.clientId}`}
                          onClick={(event) => event.stopPropagation()}
                          className="font-medium text-ink hover:text-brand"
                        >
                          {row.businessName}
                        </Link>
                        <p className="text-xs text-ink-muted">
                          {row.owner ? `${row.owner.fullName} · ${row.owner.email}` : "No login account"}
                        </p>
                      </td>

                      <td className="px-5 py-3">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatDetailedCost(row.estimatedCost)}
                        </span>
                      </td>

                      <td className="px-5 py-3">
                        <span className="font-semibold text-ink">
                          {formatNumber(row.totalTokens)}
                        </span>
                      </td>

                      <td className="px-5 py-3 text-xs text-ink-muted">
                        <span>{formatNumber(row.promptTokens)} prompt</span>
                        <span className="mx-1.5 text-line-strong">/</span>
                        <span>{formatNumber(row.completionTokens)} completion</span>
                      </td>

                      <td className="px-5 py-3 text-ink-body">
                        {row.totalRequests > 0 ? (
                          <Chip size="sm" variant="soft" color="accent">
                            {formatNumber(row.totalRequests)} {row.totalRequests === 1 ? "call" : "calls"}
                          </Chip>
                        ) : (
                          <span className="text-xs text-ink-muted">0 calls</span>
                        )}
                      </td>

                      <td className="px-5 py-3">
                        {row.topModel ? (
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-canvas px-2 py-0.5 font-mono text-xs text-ink-body border border-line">
                            <AiSparklesIcon className="size-3.5" variant="glossy" />
                            {row.topModel}
                          </span>
                        ) : (
                          <span className="text-xs text-ink-muted">—</span>
                        )}
                      </td>

                      <td className="px-5 py-3 text-xs text-ink-body">
                        {formatDate(row.lastUsedAt)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-3">
                        <Link
                          to={callsPath(row.clientId)}
                          onClick={(event) => event.stopPropagation()}
                          className="font-medium text-brand hover:underline"
                        >
                          Call details
                        </Link>
                        <span className="mx-2 text-line-strong">·</span>
                        <Link
                          to={`/admin/websites?clientId=${encodeURIComponent(row.clientId)}`}
                          onClick={(event) => event.stopPropagation()}
                          className="font-medium text-brand hover:underline"
                        >
                          Websites
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </section>

      {data && data.total > 0 && (
        <div className="mt-4">
          <TablePagination
            page={data.page}
            pageSize={data.pageSize}
            total={data.total}
            itemLabel="clients"
            isDisabled={loading}
            onPageChange={setPage}
            onPageSizeChange={resetPageAnd(setPageSize)}
          />
        </div>
      )}
    </div>
  );
}
