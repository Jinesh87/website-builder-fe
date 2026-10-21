import { useCallback, useEffect, useState } from "react";
import { Button, SearchField, Spinner } from "@heroui/react";
import { Globe, Trash2, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { errorMessage } from "../../../api/http.ts";
import { websitesApi, type BuilderType, type WebsiteList, type WebsiteStatus, type WebsiteSummary } from "../../../api/websites.ts";
import AiSparklesIcon from "../../icons/AiSparklesIcon.tsx";
import CommonModal from "../../ui/CommonModal.tsx";
import FormAlert from "../../ui/FormAlert.tsx";
import SelectInput, { type SelectOption } from "../../ui/SelectInput.tsx";
import { WebsiteStatusChip } from "../../websites/website-labels.tsx";
import { useDebouncedValue } from "../../../hooks/use-debounced-value.ts";
import { formatDate } from "../client-labels.tsx";

const PAGE_SIZE = 20;

const BUILDER_OPTIONS: SelectOption<BuilderType | "">[] = [
  { value: "", label: "Any builder" },
  { value: "MANUAL", label: "Manual" },
  { value: "AI", label: "AI" },
];

const STATUS_OPTIONS: SelectOption<WebsiteStatus | "">[] = [
  { value: "", label: "Any status" },
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "UNPUBLISHED", label: "Unpublished" },
];

/** Every website as one flat list; `?clientId=` narrows it to one client. */
export default function WebsitesListView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const clientId = searchParams.get("clientId") ?? "";

  const [search, setSearch] = useState("");
  const [builderType, setBuilderType] = useState<BuilderType | "">("");
  const [status, setStatus] = useState<WebsiteStatus | "">("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const [data, setData] = useState<WebsiteList | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [websiteToDelete, setWebsiteToDelete] = useState<WebsiteSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setData(
        await websitesApi.list({
          search: debouncedSearch,
          clientId: clientId || undefined,
          builderType: builderType || undefined,
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
  }, [debouncedSearch, clientId, builderType, status, page]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDeleteConfirm() {
    if (!websiteToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await websitesApi.delete(websiteToDelete.id);
      setWebsiteToDelete(null);
      void load();
    } catch (err) {
      setDeleteError(errorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  }

  function resetPageAnd<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const hasFilters = Boolean(debouncedSearch || clientId || builderType || status);
  const filteredClientName = clientId ? data?.items[0]?.clientName : undefined;
  const isDraft = websiteToDelete?.status === "DRAFT";

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <SearchField aria-label="Search websites" value={search} onChange={resetPageAnd(setSearch)} className="w-full max-w-xs">
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Search websites or clients" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <SelectInput ariaLabel="Filter by builder" value={builderType} onChange={resetPageAnd(setBuilderType)} options={BUILDER_OPTIONS} />
        <SelectInput ariaLabel="Filter by status" value={status} onChange={resetPageAnd(setStatus)} options={STATUS_OPTIONS} />
        {clientId && (
          <button
            type="button"
            onClick={() => {
              setSearchParams({ view: "websites" });
              setPage(1);
            }}
            className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-3 py-1 text-sm text-brand"
          >
            Client: {filteredClientName ?? "selected"} <X className="size-3.5" aria-label="Clear client filter" />
          </button>
        )}
        {loading && data && <Spinner size="sm" aria-label="Updating" />}
      </div>

      {loadError && (
        <div className="mt-4 max-w-2xl">
          <FormAlert status="danger">{loadError}</FormAlert>
        </div>
      )}

      <section className="mt-4 overflow-hidden rounded-xl border border-line bg-surface">
        {!data && loading ? (
          <div className="grid place-items-center py-16">
            <Spinner aria-label="Loading websites" />
          </div>
        ) : data && data.items.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-soft text-brand">
              <Globe className="size-6" aria-hidden />
            </span>
            <h2 className="mt-4 text-base font-semibold text-ink">
              {hasFilters ? "No websites match these filters" : "No websites yet"}
            </h2>
            <p className="mt-1 text-sm text-ink-body">
              {hasFilters ? "Try a different search or filter." : "Websites appear here when clients or you create them."}
            </p>
          </div>
        ) : (
          data && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-canvas/60 text-xs font-medium text-ink-muted">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-medium">Website</th>
                    <th scope="col" className="px-5 py-3 font-medium">Client</th>
                    <th scope="col" className="px-5 py-3 font-medium">Builder</th>
                    <th scope="col" className="px-5 py-3 font-medium">Status</th>
                    <th scope="col" className="px-5 py-3 font-medium">Updated</th>
                    <th scope="col" className="px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.items.map((website) => (
                    <tr key={website.id} className="hover:bg-canvas/40">
                      <td className="px-5 py-3">
                        <Link to={`/websites/${website.id}`} className="font-medium text-ink hover:text-brand transition-colors">
                          {website.name}
                        </Link>
                        <p className="font-mono text-xs text-ink-muted">{website.subdomain}</p>
                      </td>
                      <td className="px-5 py-3">
                        <Link to={`/admin/websites/clients/${website.clientId}`} className="text-ink-body hover:text-brand">
                          {website.clientName}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-ink-body">
                        {website.builderType === "AI" ? (
                          <span className="inline-flex items-center gap-1 font-medium text-brand">
                            <AiSparklesIcon className="size-3.5" variant="glossy" /> AI
                          </span>
                        ) : (
                          "Manual"
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <WebsiteStatusChip website={website} />
                      </td>
                      <td className="px-5 py-3 text-ink-body">{formatDate(website.updatedAt)}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Link to={`/websites/${website.id}`} className="font-medium text-brand hover:underline">
                            Dashboard
                          </Link>
                          <Link to={`/websites/${website.id}/edit`} className="font-medium text-ink hover:text-brand">
                            Edit
                          </Link>
                          <Link to={`/websites/${website.id}/preview`} className="font-medium text-ink-body hover:text-ink">
                            Preview
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError(null);
                              setWebsiteToDelete(website);
                            }}
                            className="font-medium text-ed-danger hover:underline"
                          >
                            Delete
                          </button>
                        </div>
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
            Page {data.page} of {totalPages} · {data.total} websites
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

      <CommonModal
        isOpen={Boolean(websiteToDelete)}
        onClose={() => {
          if (!isDeleting) {
            setWebsiteToDelete(null);
            setDeleteError(null);
          }
        }}
        headerDetails={{
          icon: <Trash2 className="size-4.5" />,
          title: isDraft ? "Delete draft" : "Delete website",
          description: websiteToDelete ? `Client: ${websiteToDelete.clientName} · ${websiteToDelete.subdomain}` : undefined,
        }}
        iconTone="danger"
        size="sm"
        primaryAction={{
          label: isDraft ? "Delete draft" : "Delete website",
          onPress: handleDeleteConfirm,
          isPending: isDeleting,
          tone: "danger",
        }}
        secondaryAction={{
          label: "Cancel",
          onPress: () => {
            setWebsiteToDelete(null);
            setDeleteError(null);
          },
          isDisabled: isDeleting,
        }}
      >
        <div className="space-y-2.5">
          <p>
            Are you sure you want to delete{" "}
            <strong className="font-semibold text-ink">“{websiteToDelete?.name}”</strong>? This action cannot be undone
            and all pages and configuration will be permanently deleted.
          </p>
          {deleteError && <FormAlert status="danger">{deleteError}</FormAlert>}
        </div>
      </CommonModal>
    </>
  );
}
