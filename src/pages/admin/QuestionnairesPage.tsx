import { useCallback, useEffect, useRef, useState, type Key } from "react";
import { Button, Dropdown, Label, SearchField, Spinner } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import {
  ClipboardList,
  Eye,
  MailWarning,
  MoreHorizontal,
  Plus,
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
import QuestionnaireStatusMenu from "../../components/admin/QuestionnaireStatusMenu.tsx";
import {
  emailNotSent,
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
type RowAction = "toggle-read" | "resend" | "delete";

const TABS: { key: Tab; label: string }[] = [
  { key: "ALL", label: "All" },
  ...QUESTIONNAIRE_STATUSES.map((st) => ({
    key: st,
    label: STATUS_META[st].label,
  })),
];

const EMPTY_STATE: Record<Tab, { title: string; text: string }> = {
  ALL: {
    title: "No questionnaires yet",
    text: "Submissions from the public brief or clients will show up here.",
  },
  NEW: {
    title: "No new questionnaires",
    text: "You're all caught up with submitted briefs.",
  },
  IN_PROGRESS: {
    title: "Nothing in progress",
    text: "Questionnaires you're reviewing or working on will show up here.",
  },
  WEBSITE_CREATED: {
    title: "No websites created yet",
    text: "Briefs that have been converted into AI websites will show up here.",
  },
  DONE: {
    title: "No completed questionnaires",
    text: "Mark a questionnaire Done once it's delivered to the client.",
  },
  SPAM: {
    title: "No spam",
    text: "Questionnaires marked as spam are kept here, out of the main list.",
  },
};

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
  const [busyId, setBusyId] = useState<string | null>(null);
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

  async function mutate(
    item: Questionnaire,
    action: () => Promise<Questionnaire>,
    success?: (updated: Questionnaire) => string,
  ) {
    setBusyId(item.id);
    setFeedback(null);
    try {
      const updated = await action();
      handleChanged(updated);
      if (success) setFeedback({ status: "success", message: success(updated) });
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setBusyId(null);
    }
  }

  function handleRowAction(item: Questionnaire, action: RowAction) {
    if (action === "toggle-read") {
      void mutate(item, () =>
        adminQuestionnairesApi.update(item.id, { read: !item.read }),
      );
    }
    if (action === "delete") setPendingDelete(item);
    if (action === "resend") {
      void mutate(
        item,
        () => adminQuestionnairesApi.resendEmail(item.id),
        () => `Resent email notification for ${item.businessName}.`,
      );
    }
  }

  function handleBuildWebsite(item: Questionnaire) {
    const clientIdParam = item.clientId ? `&clientId=${item.clientId}` : "";
    navigate(`/websites/new?mode=ai${clientIdParam}&questionnaireId=${item.id}`);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await adminQuestionnairesApi.remove(pendingDelete.id);
      setFeedback({
        status: "success",
        message: `Deleted the questionnaire for "${pendingDelete.businessName}".`,
      });
      if (viewing?.id === pendingDelete.id) setViewing(null);
      setPendingDelete(null);
      refresh();
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setDeleting(false);
    }
  }

  const counts = data?.counts;
  const empty = debouncedSearch
    ? {
        title: `No questionnaires match "${debouncedSearch}"`,
        text: "Try a different business name, contact, email or phone number.",
      }
    : EMPTY_STATE[tab];

  const tabClass = (active: boolean) =>
    `-mb-px flex shrink-0 cursor-pointer items-center gap-2 rounded-t-lg border-b-2 px-4 py-2.5 text-sm whitespace-nowrap transition-all ${
      active
        ? "border-primary bg-surface font-semibold text-ink shadow-xs"
        : "border-transparent font-medium text-ink-muted hover:bg-surface/50 hover:text-ink"
    }`;

  return (
    <div className="px-6 py-8 sm:px-8">
      <PageHeader
        title="Website Questionnaires"
        description="Review prospective client briefs, inspect requirements, and turn them into AI websites."
        actions={
          <a
            href="/start"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ size: "sm" })}
          >
            <Plus className="size-4" aria-hidden /> Open public questionnaire
          </a>
        }
      />

      <div
        role="tablist"
        aria-label="Filter by status"
        className="mt-6 flex items-center gap-1 overflow-x-auto border-b border-line pb-px"
      >
        {TABS.map(({ key, label }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => switchTab(key)}
              className={tabClass(active)}
            >
              {label}
              {counts && (
                <span
                  className={`min-w-5 rounded-full px-1.5 text-center text-xs leading-5 ${
                    active
                      ? "bg-ink text-white"
                      : key === "NEW" && counts.NEW > 0
                        ? "bg-brand text-white"
                        : "bg-canvas text-ink-muted"
                  }`}
                >
                  {counts[key]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <SearchField
          aria-label="Search questionnaires"
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          className="w-full max-w-sm"
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Search business, name, email or phone" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        {loading && data && <Spinner size="sm" aria-label="Updating" />}
      </div>

      {feedback && (
        <div className="mt-4 max-w-2xl">
          <FormAlert status={feedback.status}>{feedback.message}</FormAlert>
        </div>
      )}
      {loadError && (
        <div className="mt-4 max-w-2xl">
          <FormAlert status="danger">{loadError}</FormAlert>
        </div>
      )}

      <section className="mt-4 overflow-hidden rounded-xl border border-line bg-surface">
        {!data && loading ? (
          <div className="grid place-items-center py-16">
            <Spinner aria-label="Loading questionnaires" />
          </div>
        ) : data && data.items.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-soft text-brand">
              <ClipboardList className="size-6" aria-hidden />
            </span>
            <h2 className="mt-4 text-base font-semibold text-ink">{empty.title}</h2>
            <p className="mt-1 text-sm text-ink-body">{empty.text}</p>
          </div>
        ) : (
          data && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[62rem] text-left text-sm">
                <thead className="border-b border-line bg-canvas/60 text-xs text-ink-muted">
                  <tr>
                    <th scope="col" className={TH}>Business &amp; Client</th>
                    <th scope="col" className={TH}>Type &amp; Pages</th>
                    <th scope="col" className={TH}>Look &amp; Style</th>
                    <th scope="col" className={TH}>Status</th>
                    <th scope="col" className={TH}>Submitted</th>
                    <th scope="col" className={`${TH} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.items.map((item) => (
                    <QuestionnaireRow
                      key={item.id}
                      questionnaire={item}
                      busy={busyId === item.id}
                      onView={() => setViewing(item)}
                      onBuild={() => handleBuildWebsite(item)}
                      onStatus={(status) =>
                        void mutate(item, () =>
                          adminQuestionnairesApi.update(item.id, { status }),
                        )
                      }
                      onAction={(action) => handleRowAction(item, action)}
                    />
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
            itemLabel="questionnaires"
            isDisabled={loading}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </div>
      )}

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

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title="Delete this questionnaire?"
        subtitle={
          pendingDelete
            ? `${pendingDelete.businessName} · ${pendingDelete.email}`
            : undefined
        }
        confirmLabel="Delete questionnaire"
        tone="danger"
        isPending={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      >
        The brief, its answers, and its activity history will be permanently deleted.
        To keep it out of the active list without losing it, consider marking it as
        Spam or Done instead.
      </ConfirmDialog>
    </div>
  );
}

function QuestionnaireRow({
  questionnaire,
  busy,
  onView,
  onBuild,
  onStatus,
  onAction,
}: {
  questionnaire: Questionnaire;
  busy: boolean;
  onView: () => void;
  onBuild: () => void;
  onStatus: (status: QuestionnaireStatus) => void;
  onAction: (action: RowAction) => void;
}) {
  const unread = !questionnaire.read;
  const strong = unread ? "font-semibold text-ink" : "font-medium text-ink";
  const { answers } = questionnaire;

  return (
    <tr className={unread ? "bg-brand-soft/25" : "hover:bg-canvas/40"}>
      <td className={TD}>
        <div className="flex min-w-36 items-start gap-2.5">
          <span
            className={`mt-1.5 size-2 shrink-0 rounded-full ${
              unread ? "bg-brand" : "bg-transparent"
            }`}
            aria-hidden
          />
          <div className="min-w-0 max-w-56 space-y-0.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className={`break-words text-sm ${strong}`}>
                {questionnaire.businessName}
                {unread && <span className="sr-only"> (unread)</span>}
              </p>
            </div>
            <p className="text-xs text-ink-body">
              {questionnaire.name} · {questionnaire.phone}
            </p>
            <a
              href={`mailto:${questionnaire.email}`}
              className="block truncate text-xs text-ink-muted hover:text-brand"
              title={questionnaire.email}
            >
              {questionnaire.email}
            </a>
            {questionnaire.clientBusinessName && (
              <span className="inline-block rounded bg-canvas px-1.5 py-0.2 text-[10px] font-medium text-ink-muted">
                Client: {questionnaire.clientBusinessName}
              </span>
            )}
          </div>
        </div>
      </td>

      <td className={TD}>
        <div className="space-y-1 max-w-44">
          <span className="inline-block rounded-md bg-canvas px-2 py-0.5 text-xs font-medium text-ink">
            {answers?.businessType}
          </span>
          {answers?.pages && answers.pages.length > 0 && (
            <p className="line-clamp-2 text-xs text-ink-muted" title={answers.pages.join(", ")}>
              {answers.pages.slice(0, 3).join(", ")}
              {answers.pages.length > 3 && ` +${answers.pages.length - 3} more`}
            </p>
          )}
        </div>
      </td>

      <td className={TD}>
        <div className="space-y-0.5 max-w-44 text-xs">
          <p className="font-medium text-ink">
            {answers?.look} · {answers?.style}
          </p>
          <p className="text-ink-muted">Palette: {answers?.palette}</p>
        </div>
      </td>

      <td className={TD}>
        <QuestionnaireStatusMenu
          status={questionnaire.status}
          onChange={onStatus}
          isDisabled={busy}
        />
        {emailNotSent(questionnaire) && (
          <p
            className="mt-1.5 flex items-center gap-1 text-xs whitespace-nowrap text-amber-700"
            title={questionnaire.emailError ?? undefined}
          >
            <MailWarning className="size-3.5 shrink-0" aria-hidden /> Email not sent
          </p>
        )}
      </td>

      <td className={`${TD} whitespace-nowrap`}>
        <span
          title={formatWhen(questionnaire.createdAt)}
          className="text-xs text-ink-muted"
        >
          {timeAgo(questionnaire.createdAt)}
        </span>
      </td>

      <td className={TD}>
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 px-2.5 text-xs"
            onPress={onView}
            aria-label={`View brief for ${questionnaire.businessName}`}
          >
            <Eye className="size-4" aria-hidden /> View
          </Button>
          <Button
            size="sm"
            className="gap-1.5 px-2.5 text-xs font-semibold bg-brand text-white shadow-xs hover:bg-brand-hover"
            onPress={onBuild}
            aria-label={`Build website for ${questionnaire.businessName}`}
          >
            <Plus className="size-4" aria-hidden /> Build
          </Button>
          <RowMenu questionnaire={questionnaire} busy={busy} onAction={onAction} />
        </div>
      </td>
    </tr>
  );
}

function RowMenu({
  questionnaire,
  busy,
  onAction,
}: {
  questionnaire: Questionnaire;
  busy: boolean;
  onAction: (action: RowAction) => void;
}) {
  const items: { id: RowAction; label: string; danger?: boolean }[] = [
    {
      id: "toggle-read",
      label: questionnaire.read ? "Mark as unread" : "Mark as read",
    },
    ...(emailNotSent(questionnaire)
      ? [{ id: "resend" as const, label: "Resend email notification" }]
      : []),
    { id: "delete", label: "Delete", danger: true },
  ];

  return (
    <Dropdown>
      <Dropdown.Trigger
        aria-label={`More actions for ${questionnaire.businessName}`}
        isDisabled={busy}
        className="grid size-8 cursor-pointer place-items-center rounded-lg text-ink-muted transition-colors hover:bg-canvas hover:text-ink disabled:cursor-wait disabled:opacity-60"
      >
        <MoreHorizontal className="size-4.5" aria-hidden />
      </Dropdown.Trigger>
      <Dropdown.Popover className="min-w-56 rounded-lg border border-ed-border bg-surface p-1 shadow-ed-pop z-(--z-ed-popover)">
        <Dropdown.Menu
          onAction={(key: Key) => onAction(key as RowAction)}
          className="flex flex-col gap-0.5 outline-none"
        >
          {items.map((item) => (
            <Dropdown.Item
              key={item.id}
              id={item.id}
              textValue={item.label}
              className={`flex w-full cursor-pointer items-center rounded-md px-2.5 py-1.5 text-sm outline-none transition-colors select-none ${
                item.danger ? "hover:bg-ed-danger-soft" : "hover:bg-canvas"
              }`}
            >
              <Label
                className={`flex-1 cursor-pointer truncate font-inherit ${
                  item.danger ? "text-ed-danger" : "text-ink"
                }`}
              >
                {item.label}
              </Label>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
