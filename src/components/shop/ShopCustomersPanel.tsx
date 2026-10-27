import { useEffect, useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { ArrowLeft, Search } from "lucide-react";
import { errorMessage } from "../../api/http.ts";
import { shopApi, type ShopCustomer, type ShopCustomerPage, type ShopCustomerStatus } from "../../api/shop.ts";
import FormAlert from "../ui/FormAlert.tsx";

function useDebounced(value: string): string {
  const [debounced, setDebounced] = useState(value.trim());
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value.trim()), 250);
    return () => clearTimeout(timer);
  }, [value]);
  return debounced;
}

function formatWhen(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function statusLabel(status: ShopCustomerStatus): string {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "PENDING_VERIFICATION":
      return "Pending verification";
    case "SUSPENDED":
      return "Suspended";
    default:
      return status;
  }
}

function statusClass(status: ShopCustomerStatus): string {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-800 ring-emerald-200";
    case "PENDING_VERIFICATION":
      return "bg-amber-50 text-amber-800 ring-amber-200";
    case "SUSPENDED":
      return "bg-rose-50 text-rose-800 ring-rose-200";
    default:
      return "bg-ed-bg text-ink-muted ring-ed-border";
  }
}

function StatusBadge({ status }: { status: ShopCustomerStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusClass(status)}`}>
      {statusLabel(status)}
    </span>
  );
}

function CustomerDetail({
  websiteId,
  customerId,
  onBack,
}: {
  websiteId: string;
  customerId: string;
  onBack: () => void;
}) {
  const [customer, setCustomer] = useState<ShopCustomer | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setCustomer(null);
    setError(null);
    shopApi
      .customer(websiteId, customerId)
      .then((next) => {
        if (!cancelled) setCustomer(next);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [websiteId, customerId]);

  const rows = customer
    ? [
        { label: "Full name", value: customer.fullName },
        { label: "Email", value: customer.email },
        { label: "Phone", value: customer.phone || "—" },
        { label: "Status", value: <StatusBadge status={customer.status} /> },
        { label: "Email verified", value: customer.emailVerifiedAt ? formatWhen(customer.emailVerifiedAt) : "Not verified" },
        { label: "Last signed in", value: formatWhen(customer.lastSignedInAt) },
        { label: "Joined", value: formatWhen(customer.createdAt) },
        { label: "Updated", value: formatWhen(customer.updatedAt) },
      ]
    : [];

  return (
    <section className="rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4">
        <Button size="sm" variant="outline" onPress={onBack}>
          <ArrowLeft className="size-4" aria-hidden /> Back
        </Button>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-ink">{customer?.fullName || "Customer"}</h3>
          <p className="truncate text-xs text-ink-muted">{customer?.email || "Account details"}</p>
        </div>
      </div>
      {error && (
        <div className="px-5 pt-4">
          <FormAlert status="danger">{error}</FormAlert>
        </div>
      )}
      {!customer && !error && (
        <div className="grid place-items-center py-12">
          <Spinner aria-label="Loading customer" />
        </div>
      )}
      {customer && (
        <dl className="divide-y divide-line">
          {rows.map((row) => (
            <div key={row.label} className="grid gap-1 px-5 py-3 sm:grid-cols-[12rem_minmax(0,1fr)] sm:items-center">
              <dt className="text-xs font-medium text-ink-muted">{row.label}</dt>
              <dd className="min-w-0 text-sm text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

export default function ShopCustomersPanel({ websiteId }: { websiteId: string }) {
  const [search, setSearch] = useState("");
  const query = useDebounced(search);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ShopCustomerPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    shopApi
      .customers(websiteId, { search: query || undefined, page })
      .then((next) => {
        if (!cancelled) {
          setData(next);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [websiteId, query, page]);

  if (selectedId) {
    return <CustomerDetail websiteId={websiteId} customerId={selectedId} onBack={() => setSelectedId(null)} />;
  }

  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <section className="rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-ink">Customers</h3>
          <p className="mt-0.5 text-xs text-ink-muted">Shoppers who registered on this website. Click a row for details.</p>
        </div>
        <div className="relative min-w-[220px] max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search customers"
            aria-label="Search customers"
            className="h-9 w-full rounded-lg border border-ed-border bg-surface pl-9 pr-3 text-sm text-ink"
          />
        </div>
      </div>
      {error && (
        <div className="px-5 pt-4">
          <FormAlert status="danger">{error}</FormAlert>
        </div>
      )}
      {data === null && !error && (
        <div className="grid place-items-center py-12">
          <Spinner aria-label="Loading customers" />
        </div>
      )}
      {data?.customers.length === 0 && (
        <p className="px-5 py-10 text-center text-sm text-ink-muted">
          {query ? "No customers match this search." : "No customers yet. They appear here after signing up on the live shop."}
        </p>
      )}
      {data && data.customers.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-medium text-ink-muted">
                <th className="px-5 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Last signed in</th>
                <th className="px-5 py-2 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.customers.map((customer) => (
                <tr
                  key={customer.id}
                  tabIndex={0}
                  className="cursor-pointer transition-colors hover:bg-ed-bg/70 focus-visible:bg-ed-bg/70 focus-visible:outline-none"
                  onClick={() => setSelectedId(customer.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedId(customer.id);
                    }
                  }}
                >
                  <td className="px-5 py-3">
                    <p className="truncate font-medium text-ink">{customer.fullName}</p>
                    {customer.phone && <p className="truncate text-xs text-ink-muted">{customer.phone}</p>}
                  </td>
                  <td className="px-3 py-3 text-ink">{customer.email}</td>
                  <td className="px-3 py-3">
                    <StatusBadge status={customer.status} />
                  </td>
                  <td className="px-3 py-3 text-ink-muted">{formatWhen(customer.lastSignedInAt)}</td>
                  <td className="px-5 py-3 text-ink-muted">{formatWhen(customer.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && data.total > data.pageSize && (
        <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3">
          <p className="text-xs text-ink-muted">
            Page {data.page} of {pages} · {data.total} customers
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onPress={() => setPage((current) => Math.max(1, current - 1))} isDisabled={page <= 1}>
              Previous
            </Button>
            <Button size="sm" variant="outline" onPress={() => setPage((current) => current + 1)} isDisabled={page >= pages}>
              Next
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
