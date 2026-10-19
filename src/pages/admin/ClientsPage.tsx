import { useCallback, useEffect, useState } from "react";
import { Button, SearchField, Spinner } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { Plus, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { adminClientsApi, type Client, type ClientList, type ClientSource } from "../../api/admin-clients.ts";
import type { UserStatus } from "../../api/auth.ts";
import { errorMessage } from "../../api/http.ts";
import {
  ClientStatusChip,
  formatDate,
  ownerLabel,
  SOURCE_LABELS,
  STATUS_LABELS,
} from "../../components/admin/client-labels.tsx";
import PageHeader from "../../components/app/PageHeader.tsx";
import FormAlert from "../../components/ui/FormAlert.tsx";
import SelectInput, { type SelectOption } from "../../components/ui/SelectInput.tsx";
import { useDebouncedValue } from "../../hooks/use-debounced-value.ts";

const PAGE_SIZE = 20;

type Feedback = { status: "success" | "danger"; message: string } | null;

const SOURCE_OPTIONS: SelectOption<ClientSource | "">[] = [
  { value: "", label: "All sources" },
  { value: "SELF_SIGNUP", label: SOURCE_LABELS.SELF_SIGNUP },
  { value: "ADMIN_CREATED", label: SOURCE_LABELS.ADMIN_CREATED },
];

const STATUS_OPTIONS: SelectOption<UserStatus | "">[] = [
  { value: "", label: "All statuses" },
  { value: "ACTIVE", label: STATUS_LABELS.ACTIVE },
  { value: "PENDING_VERIFICATION", label: STATUS_LABELS.PENDING_VERIFICATION },
  { value: "SUSPENDED", label: STATUS_LABELS.SUSPENDED },
];

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [source, setSource] = useState<ClientSource | "">("");
  const [status, setStatus] = useState<UserStatus | "">("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const [data, setData] = useState<ClientList | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setData(
        await adminClientsApi.list({
          search: debouncedSearch,
          source: source || undefined,
          status: status || undefined,
          page,
          pageSize: PAGE_SIZE,
        }),
      );
    } catch (err) {
      setLoadError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, source, status, page]);

  useEffect(() => {
    void load();
  }, [load]);

  function resetPageAnd<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  async function runAction(client: Client, action: "resend" | "reactivate") {
    setBusyId(client.id);
    setFeedback(null);
    try {
      if (action === "resend") {
        const { emailSent } = await adminClientsApi.resendEmail(client.id);
        setFeedback(
          emailSent
            ? { status: "success", message: `Email sent to ${client.owner?.email}.` }
            : { status: "danger", message: "The email couldn't be sent. Check Email settings." },
        );
      } else {
        await adminClientsApi.reactivate(client.id);
        setFeedback({ status: "success", message: `${client.businessName} has been reactivated.` });
        await load();
      }
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setBusyId(null);
    }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const hasFilters = Boolean(debouncedSearch || source || status);

  return (
    <div className="px-6 py-8 sm:px-8">
      <PageHeader
        title="Clients"
        description="Self-signup and admin-created clients in one list."
        actions={
          <Link to="/admin/clients/new" className={buttonVariants()}>
            <Plus className="size-4" aria-hidden /> Add client
          </Link>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <SearchField
          aria-label="Search clients"
          value={search}
          onChange={resetPageAnd(setSearch)}
          className="w-full max-w-xs"
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Search by name, email or username" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <SelectInput ariaLabel="Filter by source" value={source} onChange={resetPageAnd(setSource)} options={SOURCE_OPTIONS} />
        <SelectInput ariaLabel="Filter by status" value={status} onChange={resetPageAnd(setStatus)} options={STATUS_OPTIONS} />
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
            <Spinner aria-label="Loading clients" />
          </div>
        ) : data && data.items.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-soft text-brand">
              <Users className="size-6" aria-hidden />
            </span>
            <h2 className="mt-4 text-base font-semibold text-ink">
              {hasFilters ? "No clients match these filters" : "No clients yet"}
            </h2>
            <p className="mt-1 text-sm text-ink-body">
              {hasFilters ? "Try a different search or filter." : "Clients appear here when they sign up or you add them."}
            </p>
          </div>
        ) : (
          data && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-canvas/60 text-xs font-medium text-ink-muted">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-medium">Client</th>
                    <th scope="col" className="px-5 py-3 font-medium">Source</th>
                    <th scope="col" className="px-5 py-3 font-medium">Status</th>
                    <th scope="col" className="px-5 py-3 font-medium">Joined</th>
                    <th scope="col" className="px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.items.map((client) => (
                    <tr key={client.id} className="hover:bg-canvas/40">
                      <td className="px-5 py-3">
                        <Link to={`/admin/clients/${client.id}`} className="font-medium text-ink hover:text-brand">
                          {client.businessName}
                        </Link>
                        <p className="text-xs text-ink-muted">
                          {client.owner ? ownerLabel(client.owner) : "No login account"}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-ink-body">{SOURCE_LABELS[client.source]}</td>
                      <td className="px-5 py-3">
                        <ClientStatusChip status={client.owner?.status} />
                      </td>
                      <td className="px-5 py-3 text-ink-body">{formatDate(client.createdAt)}</td>
                      <td className="px-5 py-3">
                        <RowAction client={client} busy={busyId === client.id} onAction={runAction} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
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
    </div>
  );
}

function RowAction({
  client,
  busy,
  onAction,
}: {
  client: Client;
  busy: boolean;
  onAction: (client: Client, action: "resend" | "reactivate") => void;
}) {
  const status = client.owner?.status;
  const actionClass = "font-medium text-brand hover:underline disabled:cursor-wait disabled:opacity-60";

  if (status === "PENDING_VERIFICATION") {
    return (
      <button type="button" className={actionClass} disabled={busy} onClick={() => onAction(client, "resend")}>
        {busy ? "Sending…" : "Resend email"}
      </button>
    );
  }
  if (status === "SUSPENDED") {
    return (
      <button type="button" className={actionClass} disabled={busy} onClick={() => onAction(client, "reactivate")}>
        {busy ? "Reactivating…" : "Reactivate"}
      </button>
    );
  }
  return (
    <Link to={`/admin/clients/${client.id}`} className={actionClass}>
      Edit
    </Link>
  );
}
