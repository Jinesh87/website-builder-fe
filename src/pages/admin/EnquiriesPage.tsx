import { useCallback, useEffect, useRef, useState, type Key } from "react";
import { Button, Dropdown, Label, SearchField, Spinner } from "@heroui/react";
import { Eye, Inbox, MailWarning, MoreHorizontal, Reply } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { adminEnquiriesApi, type Enquiry, type EnquiryList, type EnquiryStatus } from "../../api/admin-enquiries.ts";
import { errorMessage } from "../../api/http.ts";
import EnquiryDetailModal from "../../components/admin/EnquiryDetailModal.tsx";
import EnquiryReplyModal from "../../components/admin/EnquiryReplyModal.tsx";
import EnquiryStatusMenu from "../../components/admin/EnquiryStatusMenu.tsx";
import { emailNotSent, ENQUIRY_STATUSES, formatWhen, STATUS_META, timeAgo } from "../../components/admin/enquiry-labels.ts";
import PageHeader from "../../components/app/PageHeader.tsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.tsx";
import FormAlert from "../../components/ui/FormAlert.tsx";
import TablePagination from "../../components/ui/TablePagination.tsx";
import { useDebouncedValue } from "../../hooks/use-debounced-value.ts";
import { announceEnquiriesChanged } from "../../hooks/use-new-enquiry-count.ts";

type Tab = EnquiryStatus | "ALL";
type Feedback = { status: "success" | "danger"; message: string } | null;
type RowAction = "toggle-read" | "resend" | "delete";

const TABS: { key: Tab; label: string }[] = [
  { key: "ALL", label: "All" },
  ...ENQUIRY_STATUSES.map((status) => ({ key: status, label: STATUS_META[status].label })),
];

const EMPTY_STATE: Record<Tab, { title: string; text: string }> = {
  ALL: { title: "No enquiries yet", text: "Messages from the contact page will show up here." },
  NEW: { title: "No new enquiries", text: "You're all caught up." },
  IN_PROGRESS: { title: "Nothing in progress", text: "Enquiries you've replied to show up here." },
  RESOLVED: { title: "No resolved enquiries", text: "Mark an enquiry Resolved once it's handled." },
  SPAM: { title: "No spam", text: "Enquiries marked as spam are kept here, out of the main list." },
};

const TH = "px-3 py-3 font-medium whitespace-nowrap first:pl-5 last:pr-5";
const TD = "px-3 py-3.5 align-top first:pl-5 last:pr-5";

function tabFromParam(value: string | null): Tab {
  const status = value?.toUpperCase();
  return ENQUIRY_STATUSES.find((option) => option === status) ?? "ALL";
}

export default function EnquiriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = tabFromParam(searchParams.get("status"));

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const [data, setData] = useState<EnquiryList | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Enquiry | null>(null);
  const [replyingTo, setReplyingTo] = useState<Enquiry | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Enquiry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const latestRequest = useRef(0);

  useEffect(() => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    setLoadError(null);
    adminEnquiriesApi
      .list({ search: debouncedSearch, status: tab === "ALL" ? undefined : tab, page, pageSize })
      .then((result) => requestId === latestRequest.current && setData(result))
      .catch((err: unknown) => requestId === latestRequest.current && setLoadError(errorMessage(err)))
      .finally(() => requestId === latestRequest.current && setLoading(false));
  }, [debouncedSearch, tab, page, pageSize, refreshKey]);

  /** Re-reads the list so counts and tab membership stay right, and updates the sidebar badge. */
  const refresh = useCallback(() => {
    setRefreshKey((key) => key + 1);
    announceEnquiriesChanged();
  }, []);

  const replaceRow = useCallback((updated: Enquiry) => {
    setData((current) =>
      current ? { ...current, items: current.items.map((row) => (row.id === updated.id ? updated : row)) } : current,
    );
  }, []);

  const handleChanged = useCallback(
    (updated: Enquiry) => {
      replaceRow(updated);
      refresh();
    },
    [replaceRow, refresh],
  );

  function switchTab(next: Tab) {
    setSearchParams(next === "ALL" ? {} : { status: next.toLowerCase() });
    setPage(1);
  }

  async function mutate(enquiry: Enquiry, action: () => Promise<Enquiry>, success?: (updated: Enquiry) => string) {
    setBusyId(enquiry.id);
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

  function handleRowAction(enquiry: Enquiry, action: RowAction) {
    if (action === "toggle-read") void mutate(enquiry, () => adminEnquiriesApi.update(enquiry.id, { read: !enquiry.read }));
    if (action === "delete") setPendingDelete(enquiry);
    if (action === "resend") {
      void mutate(
        enquiry,
        () => adminEnquiriesApi.resendEmail(enquiry.id),
        (updated) =>
          updated.emailStatus === "SENT"
            ? `Email sent to the sales inbox for ${updated.name}'s enquiry.`
            : `Still couldn't send it: ${updated.emailError ?? "check Email settings."}`,
      );
    }
  }

  function openReply(enquiry: Enquiry) {
    setViewing(null);
    setReplyingTo(enquiry);
  }

  function handleReplySent(updated: Enquiry) {
    setReplyingTo(null);
    handleChanged(updated);
    setFeedback({ status: "success", message: `Reply sent to ${updated.name} at ${updated.email}.` });
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await adminEnquiriesApi.remove(pendingDelete.id);
      setFeedback({ status: "success", message: `Deleted the enquiry from ${pendingDelete.name}.` });
      if (viewing?.id === pendingDelete.id) setViewing(null);
      setPendingDelete(null);
      refresh();
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  const counts = data?.counts;
  const empty = debouncedSearch
    ? { title: `No enquiries match "${debouncedSearch}"`, text: "Try a different name, email or word from the message." }
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
        title="Enquiries"
        description="Messages from the website contact form. View, reply by email, and track where each one stands."
      />

      <div role="tablist" aria-label="Filter by status" className="mt-6 flex items-center gap-1 overflow-x-auto border-b border-line pb-px">
        {TABS.map(({ key, label }) => {
          const active = tab === key;
          return (
            <button key={key} type="button" role="tab" aria-selected={active} onClick={() => switchTab(key)} className={tabClass(active)}>
              {label}
              {counts && (
                <span
                  className={`min-w-5 rounded-full px-1.5 text-center text-xs leading-5 ${
                    active ? "bg-ink text-white" : key === "NEW" && counts.NEW > 0 ? "bg-brand text-white" : "bg-canvas text-ink-muted"
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
          aria-label="Search enquiries"
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          className="w-full max-w-sm"
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Search name, email, phone or message" />
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
            <Spinner aria-label="Loading enquiries" />
          </div>
        ) : data && data.items.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-soft text-brand">
              <Inbox className="size-6" aria-hidden />
            </span>
            <h2 className="mt-4 text-base font-semibold text-ink">{empty.title}</h2>
            <p className="mt-1 text-sm text-ink-body">{empty.text}</p>
          </div>
        ) : (
          data && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[58rem] text-left text-sm">
                <thead className="border-b border-line bg-canvas/60 text-xs text-ink-muted">
                  <tr>
                    <th scope="col" className={TH}>Name</th>
                    <th scope="col" className={TH}>Email</th>
                    <th scope="col" className={TH}>Phone</th>
                    <th scope="col" className={TH}>Subject</th>
                    <th scope="col" className={TH}>Message</th>
                    <th scope="col" className={TH}>Status</th>
                    <th scope="col" className={`${TH} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.items.map((item) => (
                    <EnquiryRow
                      key={item.id}
                      enquiry={item}
                      busy={busyId === item.id}
                      onView={() => setViewing(item)}
                      onReply={() => openReply(item)}
                      onStatus={(status) => void mutate(item, () => adminEnquiriesApi.update(item.id, { status }))}
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
            itemLabel="enquiries"
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
        <EnquiryDetailModal
          enquiry={viewing}
          onClose={() => setViewing(null)}
          onChanged={handleChanged}
          onReply={openReply}
          onDelete={setPendingDelete}
        />
      )}

      {replyingTo && (
        <EnquiryReplyModal enquiry={replyingTo} onClose={() => setReplyingTo(null)} onSent={handleReplySent} />
      )}

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title="Delete this enquiry?"
        subtitle={pendingDelete ? `${pendingDelete.name} · ${pendingDelete.email}` : undefined}
        confirmLabel="Delete enquiry"
        tone="danger"
        isPending={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      >
        The message, its notes and its activity are removed for good. To keep it out of the list without losing it, mark
        it as Spam or Resolved instead.
      </ConfirmDialog>
    </div>
  );
}

function EnquiryRow({
  enquiry,
  busy,
  onView,
  onReply,
  onStatus,
  onAction,
}: {
  enquiry: Enquiry;
  busy: boolean;
  onView: () => void;
  onReply: () => void;
  onStatus: (status: EnquiryStatus) => void;
  onAction: (action: RowAction) => void;
}) {
  const unread = !enquiry.read;
  const strong = unread ? "font-semibold text-ink" : "font-medium text-ink";

  return (
    <tr className={unread ? "bg-brand-soft/25" : "hover:bg-canvas/40"}>
      <td className={TD}>
        <div className="flex min-w-28 items-start gap-2">
          <span className={`mt-1.5 size-2 shrink-0 rounded-full ${unread ? "bg-brand" : "bg-transparent"}`} aria-hidden />
          <div className="min-w-0 max-w-48">
            <p className={`break-words ${strong}`}>
              {enquiry.name}
              {unread && <span className="sr-only"> (unread)</span>}
            </p>
            <p className="mt-0.5 text-xs text-ink-muted" title={formatWhen(enquiry.createdAt)}>
              {timeAgo(enquiry.createdAt)}
            </p>
          </div>
        </div>
      </td>
      <td className={TD}>
        <a href={`mailto:${enquiry.email}`} className="block max-w-52 truncate text-ink-body hover:text-brand" title={enquiry.email}>
          {enquiry.email}
        </a>
      </td>
      <td className={`${TD} whitespace-nowrap`}>
        {enquiry.phone ? (
          <a href={`tel:${enquiry.phone}`} className="text-ink-body hover:text-brand">
            {enquiry.phone}
          </a>
        ) : (
          <span className="text-ink-muted">—</span>
        )}
      </td>
      <td className={TD}>
        <span className={`block min-w-24 max-w-44 break-words ${strong}`}>{enquiry.subject}</span>
      </td>
      <td className={TD}>
        <p className="line-clamp-2 min-w-40 max-w-sm break-words text-ink-body" title={enquiry.message}>
          {enquiry.message}
        </p>
      </td>
      <td className={TD}>
        <EnquiryStatusMenu status={enquiry.status} onChange={onStatus} isDisabled={busy} />
        {emailNotSent(enquiry) && (
          <p className="mt-1.5 flex items-center gap-1 text-xs whitespace-nowrap text-amber-700" title={enquiry.emailError ?? undefined}>
            <MailWarning className="size-3.5 shrink-0" aria-hidden /> Sales email not sent
          </p>
        )}
      </td>
      <td className={TD}>
        <div className="flex items-center justify-end gap-1">
          <Button size="sm" variant="outline" className="gap-1.5 px-2.5" onPress={onView} aria-label={`View ${enquiry.name}'s enquiry`}>
            <Eye className="size-4" aria-hidden /> View
          </Button>
          <Button size="sm" className="gap-1.5 px-2.5" onPress={onReply} aria-label={`Reply to ${enquiry.name}`}>
            <Reply className="size-4" aria-hidden /> Reply
          </Button>
          <RowMenu enquiry={enquiry} busy={busy} onAction={onAction} />
        </div>
      </td>
    </tr>
  );
}

function RowMenu({ enquiry, busy, onAction }: { enquiry: Enquiry; busy: boolean; onAction: (action: RowAction) => void }) {
  const items: { id: RowAction; label: string; danger?: boolean }[] = [
    { id: "toggle-read", label: enquiry.read ? "Mark as unread" : "Mark as read" },
    ...(emailNotSent(enquiry) ? [{ id: "resend" as const, label: "Resend email to sales inbox" }] : []),
    { id: "delete", label: "Delete", danger: true },
  ];

  return (
    <Dropdown>
      <Dropdown.Trigger
        aria-label={`More actions for ${enquiry.name}'s enquiry`}
        isDisabled={busy}
        className="grid size-8 cursor-pointer place-items-center rounded-lg text-ink-muted transition-colors hover:bg-canvas hover:text-ink disabled:cursor-wait disabled:opacity-60"
      >
        <MoreHorizontal className="size-4.5" aria-hidden />
      </Dropdown.Trigger>
      <Dropdown.Popover className="min-w-56 rounded-lg border border-ed-border bg-surface p-1 shadow-ed-pop z-(--z-ed-popover)">
        <Dropdown.Menu onAction={(key: Key) => onAction(key as RowAction)} className="flex flex-col gap-0.5 outline-none">
          {items.map((item) => (
            <Dropdown.Item
              key={item.id}
              id={item.id}
              textValue={item.label}
              className={`flex w-full cursor-pointer items-center rounded-md px-2.5 py-1.5 text-sm outline-none transition-colors select-none ${
                item.danger ? "hover:bg-ed-danger-soft" : "hover:bg-canvas"
              }`}
            >
              <Label className={`flex-1 cursor-pointer truncate font-inherit ${item.danger ? "text-ed-danger" : "text-ink"}`}>
                {item.label}
              </Label>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
