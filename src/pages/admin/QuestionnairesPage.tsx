import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Spinner } from "@heroui/react";
import {
  Eye,
  Sparkles,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { errorMessage } from "../../api/http.ts";
import PageHeader from "../../components/app/PageHeader.tsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.tsx";
import FormAlert from "../../components/ui/FormAlert.tsx";
import TablePagination from "../../components/ui/TablePagination.tsx";
import { useDebouncedValue } from "../../hooks/use-debounced-value.ts";
import { announceQuestionnairesChanged } from "../../hooks/use-new-questionnaire-count.ts";
import QuestionnaireDetailModal from "../../components/admin/QuestionnaireDetailModal.tsx";
import {
  formatWhen,
  QUESTIONNAIRE_STATUSES,
  STATUS_META,
  timeAgo,
} from "../../components/admin/questionnaire-labels.ts";
import {
  adminQuestionnairesApi,
  type Questionnaire,
  type QuestionnaireList,
  type QuestionnaireStatus,
} from "../../features/questionnaire/api.ts";

type Tab = QuestionnaireStatus | "ALL";
type Feedback = { status: "success" | "danger"; message: string } | null;

const TABS: { key: Tab; label: string }[] = [
  { key: "ALL", label: "All" },
  ...QUESTIONNAIRE_STATUSES.map((st) => ({
    key: st,
    label: STATUS_META[st].label,
  })),
];

const TH = "px-3 py-3 font-medium whitespace-nowrap first:pl-5 last:pr-5";
const TD = "px-3 py-3.5 align-top first:pl-5 last:pr-5";

function tabFromParam(value: string | null): Tab {
  const status = value?.toUpperCase();
  return (
    QUESTIONNAIRE_STATUSES.find((option) => option === status) ?? "ALL"
  );
}

export default function QuestionnairesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = tabFromParam(searchParams.get("status"));

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const [data, setData] = useState<QuestionnaireList | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [viewing, setViewing] = useState<Questionnaire | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Questionnaire | null>(null);
  const [deleting, setDeleting] = useState(false);
  const latestRequest = useRef(0);

  useEffect(() => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    setLoadError(null);
    adminQuestionnairesApi
      .list({
        search: debouncedSearch,
        status: tab === "ALL" ? undefined : tab,
        page,
        pageSize,
      })
      .then((result) => requestId === latestRequest.current && setData(result))
      .catch((err: unknown) => requestId === latestRequest.current && setLoadError(errorMessage(err)))
      .finally(() => requestId === latestRequest.current && setLoading(false));
  }, [debouncedSearch, tab, page, pageSize, refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey((key) => key + 1);
    announceQuestionnairesChanged();
  }, []);

  const replaceRow = useCallback((updated: Questionnaire) => {
    setData((current) =>
      current
        ? {
            ...current,
            items: current.items.map((row) =>
              row.id === updated.id ? updated : row,
            ),
          }
        : current,
    );
  }, []);

  const handleChanged = useCallback(
    (updated: Questionnaire) => {
      replaceRow(updated);
      refresh();
    },
    [replaceRow, refresh],
  );

  function switchTab(next: Tab) {
    setSearchParams(next === "ALL" ? {} : { status: next.toLowerCase() });
    setPage(1);
  }

  async function handleDeleteConfirm() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await adminQuestionnairesApi.remove(pendingDelete.id);
      setPendingDelete(null);
      if (viewing?.id === pendingDelete.id) setViewing(null);
      setFeedback({ status: "success", message: "Questionnaire deleted." });
      refresh();
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Website Questionnaires"
        description="Review prospective client briefs, inspect requirements, and turn them into AI websites."
        actions={
          <Button
            size="sm"
            className="gap-1.5 bg-brand font-semibold text-white shadow hover:bg-brand-hover"
            onPress={() => window.open(`${window.location.origin}/start`, "_blank")}
          >
            <Sparkles className="size-4" /> Open Public Questionnaire
          </Button>
        }
      />

      {feedback && (
        <FormAlert status={feedback.status}>{feedback.message}</FormAlert>
      )}
      {loadError && <FormAlert status="danger">{loadError}</FormAlert>}

      {/* Tabs and search bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 rounded-xl border border-line bg-surface p-1">
          {TABS.map(({ key, label }) => {
            const count = data?.counts[key] ?? 0;
            const active = tab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => switchTab(key)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-brand text-white shadow-sm"
                    : "text-ink-body hover:bg-canvas hover:text-ink"
                }`}
              >
                {label}
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    active ? "bg-white/20 text-white" : "bg-canvas text-ink-muted"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="w-full sm:w-72">
          <input
            type="search"
            placeholder="Search questionnaires..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-9 w-full rounded-lg border border-line bg-surface px-3 text-xs text-ink placeholder-ink-muted outline-none focus:border-brand"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-line bg-canvas text-ink-muted uppercase tracking-wider text-[11px]">
              <tr>
                <th className={TH}>Business &amp; Client</th>
                <th className={TH}>Type &amp; Pages</th>
                <th className={TH}>Look &amp; Style</th>
                <th className={TH}>Status</th>
                <th className={TH}>Submitted</th>
                <th className={TH}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading && !data ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Spinner size="md" />
                  </td>
                </tr>
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-ink-muted">
                    No questionnaires found.
                  </td>
                </tr>
              ) : (
                data?.items.map((row) => {
                  const meta = STATUS_META[row.status] || STATUS_META.NEW;
                  const isUnread = !row.read;
                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-canvas/50 transition-colors ${
                        isUnread ? "bg-brand-soft/20 font-medium" : ""
                      }`}
                    >
                      <td className={TD}>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-ink text-sm">
                              {row.businessName}
                            </span>
                            {isUnread && (
                              <span className="rounded-full bg-brand px-1.5 py-0.2 text-[10px] font-bold text-white">
                                NEW
                              </span>
                            )}
                          </div>
                          <p className="text-ink-body">
                            {row.name} · {row.phone}
                          </p>
                          <p className="text-ink-muted">{row.email}</p>
                        </div>
                      </td>

                      <td className={TD}>
                        <div className="space-y-1">
                          <span className="inline-block rounded bg-canvas px-2 py-0.5 font-medium text-ink">
                            {row.answers?.businessType}
                          </span>
                          <p className="text-ink-muted">
                            {row.answers?.pages?.slice(0, 3).join(", ")}
                            {(row.answers?.pages?.length ?? 0) > 3 &&
                              ` +${row.answers.pages.length - 3} more`}
                          </p>
                        </div>
                      </td>

                      <td className={TD}>
                        <div className="space-y-0.5">
                          <p className="text-ink">
                            {row.answers?.look} · {row.answers?.style}
                          </p>
                          <p className="text-ink-muted">
                            Palette: {row.answers?.palette}
                          </p>
                        </div>
                      </td>

                      <td className={TD}>
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                            meta.tone === "brand"
                              ? "bg-brand/10 text-brand"
                              : meta.tone === "warning"
                                ? "bg-amber-500/10 text-amber-500"
                                : meta.tone === "success"
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : "bg-canvas text-ink-muted"
                          }`}
                        >
                          {meta.label}
                        </span>
                      </td>

                      <td className={TD}>
                        <span title={formatWhen(row.createdAt)} className="text-ink-muted">
                          {timeAgo(row.createdAt)}
                        </span>
                      </td>

                      <td className={TD}>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onPress={() => setViewing(row)}
                            className="gap-1 text-xs"
                          >
                            <Eye className="size-3.5" /> View
                          </Button>
                          <Button
                            size="sm"
                            className="gap-1 bg-brand text-white text-xs font-semibold"
                            onPress={() => {
                              const clientIdParam = row.clientId ? `&clientId=${row.clientId}` : "";
                              navigate(
                                `/websites/new?mode=ai${clientIdParam}&questionnaireId=${row.id}`,
                              );
                            }}
                          >
                            <Sparkles className="size-3.5" /> Build
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {data && data.total > pageSize && (
          <div className="border-t border-line p-3">
            <TablePagination
              page={page}
              pageSize={pageSize}
              total={data.total}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}
      </div>

      {viewing && (
        <QuestionnaireDetailModal
          questionnaire={viewing}
          onClose={() => setViewing(null)}
          onChanged={handleChanged}
          onDelete={(sub) => {
            setViewing(null);
            setPendingDelete(sub);
          }}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          isOpen
          title="Delete Questionnaire"
          confirmLabel="Delete"
          tone="danger"
          isPending={deleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setPendingDelete(null)}
        >
          {`Are you sure you want to delete the questionnaire for "${pendingDelete.businessName}"? This cannot be undone.`}
        </ConfirmDialog>
      )}
    </div>
  );
}
