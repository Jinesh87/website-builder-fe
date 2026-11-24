import { useEffect, useState } from "react";
import { Spinner } from "@heroui/react";
import { Search, UserRound } from "lucide-react";
import { errorMessage } from "../../../api/http.ts";
import { shopApi, type ShopCustomer } from "../../../api/shop.ts";
import { validateEmail } from "../../../auth/validation.ts";
import { useDebouncedValue } from "../../../hooks/use-debounced-value.ts";
import CommonModal from "../../ui/AppModal.tsx";
import FormAlert from "../../ui/FormAlert.tsx";
import TextInput from "../../ui/TextInput.tsx";

/** Who the sale is for: nobody (walk-in), typed details, or an existing shop account. */
export type PosCustomer =
  | { kind: "walk-in"; name: string; phone: string; email: string }
  | { kind: "account"; id: string; fullName: string; email: string; phone: string | null };

type WalkInCustomer = Extract<PosCustomer, { kind: "walk-in" }>;

export const WALK_IN: WalkInCustomer = { kind: "walk-in", name: "", phone: "", email: "" };

export function customerLabel(customer: PosCustomer): string {
  if (customer.kind === "account") return customer.fullName;
  return customer.name.trim() || customer.phone.trim() || "Walk-in customer";
}

export function customerEmail(customer: PosCustomer): string {
  return customer.email.trim();
}

type Props = {
  websiteId: string;
  value: PosCustomer;
  onChange: (customer: PosCustomer) => void;
  onClose: () => void;
};

export default function PosCustomerDialog({ websiteId, value, onChange, onClose }: Props) {
  const [tab, setTab] = useState<"walk-in" | "account">(value.kind);
  const [details, setDetails] = useState<WalkInCustomer>(value.kind === "walk-in" ? value : WALK_IN);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search.trim(), 300);
  const [results, setResults] = useState<ShopCustomer[] | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    if (tab !== "account") return;
    let cancelled = false;
    setSearchError(null);
    shopApi
      .customers(websiteId, { search: debounced })
      .then((page) => !cancelled && setResults(page.customers))
      .catch((err: unknown) => !cancelled && setSearchError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [websiteId, tab, debounced]);

  function saveWalkIn() {
    const email = details.email.trim();
    const error = email ? validateEmail(email) : undefined;
    setEmailError(error);
    if (error) return;
    onChange({ kind: "walk-in", name: details.name.trim(), phone: details.phone.trim(), email });
    onClose();
  }

  const tabClass = (active: boolean) =>
    `flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${active ? "bg-surface text-ink shadow-xs" : "text-ink-muted hover:text-ink"}`;

  return (
    <CommonModal
      isOpen
      onClose={onClose}
      title="Customer"
      subtitle="Optional. Add details to put a name on the receipt or email the invoice."
      icon={<UserRound className="size-5" />}
      iconTone="brand"
      size="md"
      {...(tab === "walk-in"
        ? {
            primaryAction: { label: "Use these details", onPress: saveWalkIn },
            secondaryAction: {
              label: "Clear (walk-in)",
              onPress: () => {
                onChange(WALK_IN);
                onClose();
              },
            },
          }
        : { disableFooter: true })}
    >
      <div className="flex gap-1 rounded-lg bg-canvas p-1" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "walk-in"} className={tabClass(tab === "walk-in")} onClick={() => setTab("walk-in")}>
          Walk-in
        </button>
        <button type="button" role="tab" aria-selected={tab === "account"} className={tabClass(tab === "account")} onClick={() => setTab("account")}>
          Existing customer
        </button>
      </div>

      {tab === "walk-in" ? (
        <div className="mt-4 flex flex-col gap-4">
          <TextInput label="Name" name="posName" value={details.name} onChange={(name) => setDetails({ ...details, name })} autoFocus />
          <TextInput
            label="Phone"
            name="posPhone"
            type="tel"
            value={details.phone}
            onChange={(phone) => setDetails({ ...details, phone })}
          />
          <TextInput
            label="Email"
            name="posEmail"
            type="email"
            description="If they already have an account in your shop, the sale is added to it."
            value={details.email}
            onChange={(email) => setDetails({ ...details, email })}
            error={emailError}
          />
        </div>
      ) : (
        <div className="mt-4">
          <label className="relative block">
            <span className="sr-only">Search customers</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, email or phone"
              className="h-10 w-full rounded-lg border border-line-strong bg-surface pl-9 pr-3 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              autoFocus
            />
          </label>
          {searchError && (
            <div className="mt-3">
              <FormAlert status="danger">{searchError}</FormAlert>
            </div>
          )}
          {!results && !searchError ? (
            <div className="grid place-items-center py-8">
              <Spinner size="sm" aria-label="Loading customers" />
            </div>
          ) : (
            <ul className="mt-3 max-h-72 divide-y divide-line overflow-y-auto rounded-lg border border-line">
              {results?.length === 0 && <li className="px-4 py-6 text-center text-sm text-ink-muted">No customers found.</li>}
              {results?.map((customer) => (
                <li key={customer.id}>
                  <button
                    type="button"
                    className="w-full px-4 py-3 text-left hover:bg-canvas"
                    onClick={() => {
                      onChange({
                        kind: "account",
                        id: customer.id,
                        fullName: customer.fullName,
                        email: customer.email,
                        phone: customer.phone,
                      });
                      onClose();
                    }}
                  >
                    <span className="block truncate text-sm font-medium text-ink">{customer.fullName}</span>
                    <span className="block truncate text-xs text-ink-muted">
                      {[customer.email, customer.phone].filter(Boolean).join(" · ")}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </CommonModal>
  );
}
