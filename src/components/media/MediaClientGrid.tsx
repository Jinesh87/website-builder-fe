import { useEffect, useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { Building2, ChevronLeft, ChevronRight, LayoutTemplate } from "lucide-react";
import { errorMessage } from "../../api/http.ts";
import { formatBytes, mediaApi, type MediaClientList, type MediaClientSummary } from "../../api/media.ts";
import { useDebouncedValue } from "../../hooks/use-debounced-value.ts";
import ShopSearchField from "../shop/ShopSearchField.tsx";
import FormAlert from "../ui/FormAlert.tsx";

function ClientCard({ client, onOpen }: { client: MediaClientSummary; onOpen: () => void }) {
  const percent = client.limitBytes > 0 ? Math.min(100, (client.usedBytes / client.limitBytes) * 100) : 0;
  const Icon = client.internal ? LayoutTemplate : Building2;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 text-left transition-colors hover:border-brand/50 hover:bg-canvas"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
          <Icon className="size-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink" title={client.name}>
            {client.name}
          </p>
          <p className="text-xs text-ink-muted">
            {client.internal ? "Platform templates · " : ""}
            {client.files === 0 ? "No files yet" : `${client.files.toLocaleString("en-IN")} file${client.files === 1 ? "" : "s"}`}
          </p>
        </div>
      </div>
      <div>
        <div className="h-1.5 overflow-hidden rounded-full bg-canvas">
          <div className={`h-full rounded-full ${percent >= 90 ? "bg-danger" : "bg-brand"}`} style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-1 text-xs text-ink-muted">
          {formatBytes(client.usedBytes)} of {formatBytes(client.limitBytes)} used
        </p>
      </div>
    </button>
  );
}

/** Super Admin's media landing: every client as a card; opening one shows only that client's files. */
export default function MediaClientGrid({ onOpen }: { onOpen: (client: MediaClientSummary) => void }) {
  const [search, setSearch] = useState("");
  const query = useDebouncedValue(search.trim(), 250);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<MediaClientList | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setPage(1), [query]);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    mediaApi
      .clients({ search: query, page })
      .then((next) => !cancelled && setData(next))
      .catch((err: unknown) => !cancelled && setError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [query, page]);

  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="flex flex-col gap-4">
      <ShopSearchField value={search} onChange={setSearch} label="Search clients" />
      {error && <FormAlert status="danger">{error}</FormAlert>}
      {!data && !error && (
        <div className="grid place-items-center py-16">
          <Spinner aria-label="Loading clients" />
        </div>
      )}
      {data?.clients.length === 0 && (
        <p className="py-12 text-center text-sm text-ink-muted">{query ? "No clients match this search." : "No clients yet."}</p>
      )}
      {data && data.clients.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.clients.map((client) => (
            <ClientCard key={client.id} client={client} onOpen={() => onOpen(client)} />
          ))}
        </div>
      )}
      {data && pages > 1 && (
        <div className="flex items-center justify-between text-sm text-ink-muted">
          <span>
            Page {data.page} of {pages} · {data.total.toLocaleString("en-IN")} clients
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onPress={() => setPage((p) => Math.max(1, p - 1))} isDisabled={data.page <= 1}>
              <ChevronLeft className="size-4" aria-hidden /> Previous
            </Button>
            <Button size="sm" variant="outline" onPress={() => setPage((p) => p + 1)} isDisabled={data.page >= pages}>
              Next <ChevronRight className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
