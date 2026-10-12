import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Spinner } from "@heroui/react";
import { Activity, ArrowLeft, Cpu, DollarSign } from "lucide-react";
import { adminAiUsageApi, type ClientAiCallsResponse } from "../../api/admin-ai-usage.ts";
import { errorMessage } from "../../api/http.ts";
import PageHeader from "../../components/app/PageHeader.tsx";
import FormAlert from "../../components/ui/FormAlert.tsx";
import SelectInput from "../../components/ui/SelectInput.tsx";
import TablePagination, { PAGE_SIZE_OPTIONS } from "../../components/ui/TablePagination.tsx";
import { MONTH_OPTIONS, YEAR_OPTIONS, currentMonth, currentYear } from "./ai-usage-period.ts";

const DEFAULT_PAGE_SIZE = 10;

const FEATURE_LABELS: Record<string, string> = {
  site_copilot: "Site copilot",
  site_copilot_image: "Copilot image",
  media_image_variations: "Image variations",
  site_plan: "Site plan",
  site_page: "Page generation",
  plan: "Page plan",
  page: "Page edit",
  section: "Section edit",
  section_add: "Add section",
};

function featureLabel(scope: string): string {
  return FEATURE_LABELS[scope] ?? scope.replace(/_/g, " ").replace(/^\w/, (char) => char.toUpperCase());
}

function usd(amount: number): string {
  if (!amount) return "$0.00";
  return `$${amount.toFixed(amount < 0.1 ? 4 : 3)}`;
}

function duration(ms: number): string {
  if (!ms) return "—";
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`;
}

function dateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

/** Per-call cost breakdown for one client in the selected period. */
export default function AiUsageClientPage() {
  const { clientId = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const month = searchParams.get("month") ?? String(currentMonth);
  const year = searchParams.get("year") ?? String(currentYear);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const requestedSize = Number(searchParams.get("pageSize"));
  const pageSize = PAGE_SIZE_OPTIONS.find((size) => size === requestedSize) ?? DEFAULT_PAGE_SIZE;

  const [data, setData] = useState<ClientAiCallsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    adminAiUsageApi
      .clientCalls(clientId, { month: month || undefined, year, page, pageSize })
      .then((result) => !cancelled && setData(result))
      .catch((err: unknown) => !cancelled && setError(errorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [clientId, month, year, page, pageSize]);

  /** Changing the period or page size goes back to the first page. */
  function update(next: { month?: string; year?: string; page?: number; pageSize?: number }) {
    setSearchParams({
      month: next.month ?? month,
      year: next.year ?? year,
      page: String(next.page ?? 1),
      pageSize: String(next.pageSize ?? pageSize),
    });
  }
  const periodLabel = month ? `${MONTH_OPTIONS.find((option) => option.value === month)?.label} ${year}` : year;
  const totalTokens = data?.byFeature.reduce((sum, feature) => sum + feature.totalTokens, 0) ?? 0;

  return (
    <div className="px-6 py-8 sm:px-8">
      <Link
        to={`/admin/ai-usage?${new URLSearchParams({ month, year }).toString()}`}
        className="mb-3 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden /> AI Usage
      </Link>
      <PageHeader
        title={data ? `${data.client.businessName} · AI calls` : "AI calls"}
        description={`Cost of each AI call in ${periodLabel}, at OpenAI's list prices.`}
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <SelectInput ariaLabel="Filter by Month" value={month} onChange={(value) => update({ month: value })} options={MONTH_OPTIONS} />
        <SelectInput ariaLabel="Filter by Year" value={year} onChange={(value) => update({ year: value })} options={YEAR_OPTIONS} />
        {loading && data && <Spinner size="sm" aria-label="Updating" />}
      </div>

      {error && (
        <div className="mt-4 max-w-2xl">
          <FormAlert status="danger">{error}</FormAlert>
        </div>
      )}

      {!data && loading && (
        <div className="grid place-items-center py-20">
          <Spinner aria-label="Loading AI calls" />
        </div>
      )}

      {data && (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Estimated cost" value={usd(data.totalCost)} icon={<DollarSign className="size-4" aria-hidden />} tone="bg-emerald-50 text-emerald-600" />
            <StatCard label="AI calls" value={data.total.toLocaleString()} icon={<Activity className="size-4" aria-hidden />} tone="bg-blue-50 text-blue-600" />
            <StatCard label="Tokens" value={totalTokens.toLocaleString()} icon={<Cpu className="size-4" aria-hidden />} tone="bg-brand-soft text-brand" />
          </div>

          {data.total === 0 ? (
            <p className="mt-6 rounded-xl border border-line bg-surface py-14 text-center text-sm text-ink-muted">No AI calls in {periodLabel}.</p>
          ) : (
            <>
              <section aria-label="Cost by feature" className="mt-6">
                <h2 className="mb-2 text-sm font-semibold text-ink">Cost by feature</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {data.byFeature.map((feature) => (
                    <div key={feature.scope} className="rounded-xl border border-line bg-surface px-4 py-3 shadow-xs">
                      <p className="truncate text-xs font-medium text-ink-muted">{featureLabel(feature.scope)}</p>
                      <p className="mt-1 text-lg font-semibold text-emerald-600">{usd(feature.cost)}</p>
                      <p className="text-xs text-ink-muted">
                        {feature.calls} {feature.calls === 1 ? "call" : "calls"} · {feature.totalTokens.toLocaleString()} tokens
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section aria-label="Calls" className="mt-6 overflow-hidden rounded-xl border border-line bg-surface">
                <div className="overflow-x-auto">
                  <table className={`w-full text-left text-sm ${loading ? "opacity-60" : ""}`}>
                    <thead className="border-b border-line bg-canvas/60 text-xs text-ink-muted">
                      <tr>
                        <th scope="col" className="px-5 py-3 font-medium">Time</th>
                        <th scope="col" className="px-5 py-3 font-medium">Feature</th>
                        <th scope="col" className="px-5 py-3 font-medium">Model</th>
                        <th scope="col" className="px-5 py-3 font-medium">Website · User</th>
                        <th scope="col" className="px-5 py-3 text-right font-medium">Input</th>
                        <th scope="col" className="px-5 py-3 text-right font-medium">Output</th>
                        <th scope="col" className="px-5 py-3 text-right font-medium">Duration</th>
                        <th scope="col" className="px-5 py-3 text-right font-medium">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {data.calls.map((call) => (
                        <tr key={call.id} className="hover:bg-canvas/40">
                          <td className="whitespace-nowrap px-5 py-3 text-xs text-ink-body">{dateTime(call.createdAt)}</td>
                          <td className="whitespace-nowrap px-5 py-3 font-medium text-ink">{featureLabel(call.scope)}</td>
                          <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-ink-body">{call.model}</td>
                          <td className="max-w-56 px-5 py-3 text-xs">
                            <p className="truncate text-ink-body">{call.websiteName ?? "—"}</p>
                            <p className="truncate text-ink-muted">{call.userName ?? "System"}</p>
                          </td>
                          <td className="whitespace-nowrap px-5 py-3 text-right text-xs">
                            <p className="text-ink">{call.promptTokens.toLocaleString()} tokens</p>
                            <p className="text-ink-muted">{usd(call.inputCost)}</p>
                          </td>
                          <td className="whitespace-nowrap px-5 py-3 text-right text-xs">
                            <p className="text-ink">{call.completionTokens.toLocaleString()} tokens</p>
                            <p className="text-ink-muted">{usd(call.outputCost)}</p>
                          </td>
                          <td className="whitespace-nowrap px-5 py-3 text-right text-xs text-ink-body">{duration(call.durationMs)}</td>
                          <td className="whitespace-nowrap px-5 py-3 text-right font-semibold text-emerald-600">{usd(call.cost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="mt-4">
                <TablePagination
                  page={data.page}
                  pageSize={data.pageSize}
                  total={data.total}
                  itemLabel="calls"
                  isDisabled={loading}
                  onPageChange={(next) => update({ page: next })}
                  onPageSizeChange={(size) => update({ pageSize: size })}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, tone }: { label: string; value: string; icon: ReactNode; tone: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-ink-muted">{label}</span>
        <span className={`grid size-8 place-items-center rounded-lg ${tone}`}>{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-ink">{value}</p>
    </div>
  );
}
