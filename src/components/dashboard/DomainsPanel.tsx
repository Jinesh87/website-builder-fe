import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Button, Chip, Spinner } from "@heroui/react";
import { Check, Copy, ExternalLink, Globe, RefreshCw, Star, Trash2 } from "lucide-react";
import { errorMessage } from "../../api/http.ts";
import { websitesApi, type DnsRecord, type WebsiteDetail, type WebsiteDomain } from "../../api/websites.ts";
import { env } from "../../config/env.ts";
import { getLiveSiteUrl } from "../../utils/live-url.ts";
import CommonModal from "../ui/CommonModal.tsx";
import FormAlert from "../ui/FormAlert.tsx";
import TextInput from "../ui/TextInput.tsx";
import { formatDateTime } from "../websites/website-labels.tsx";

type DomainsPanelProps = {
  website: WebsiteDetail;
  /** Called after a change that can move the site's main address. */
  onChanged: () => void;
};

function DomainStatusChip({ status }: { status: WebsiteDomain["status"] }) {
  if (status === "ACTIVE") {
    return (
      <Chip size="sm" color="success">
        Connected
      </Chip>
    );
  }
  if (status === "FAILED") {
    return (
      <Chip size="sm" color="danger" variant="soft">
        Verification failed
      </Chip>
    );
  }
  return (
    <Chip size="sm" color="warning" variant="soft">
      Waiting for DNS
    </Chip>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard
          .writeText(value)
          .then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          })
          .catch(() => {});
      }}
      className="grid size-7 shrink-0 place-items-center rounded-md text-ink-muted transition-colors hover:bg-canvas hover:text-ink"
      aria-label={`Copy ${label}`}
      title={`Copy ${label}`}
    >
      {copied ? <Check className="size-3.5 text-emerald-600" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
    </button>
  );
}

function RecordsTable({ records }: { records: DnsRecord[] }) {
  const hasRouting = records.some((record) => record.purpose === "routing");
  return (
    <div className="space-y-2">
      <p className="text-sm text-ink-body">
        Add {records.length === 1 ? "this record" : "these records"} at the company where you bought the domain (GoDaddy,
        Namecheap, Cloudflare…).
        {records.length > 1 && " If there are other A, AAAA or CNAME records for this name, remove them."}
      </p>
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-canvas text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {records.map((record) => (
              <tr key={`${record.type}-${record.name}-${record.value}`}>
                <td className="px-3 py-2 font-mono text-xs font-semibold text-ink">{record.type}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <span className="break-all font-mono text-xs text-ink">{record.name}</span>
                    <CopyButton value={record.name} label="record name" />
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <span className="break-all font-mono text-xs text-ink">{record.value}</span>
                    <CopyButton value={record.value} label="record value" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-ink-muted">
        Some providers add your domain to the name automatically. If so, enter only the part before it.
        {hasRouting && " On Cloudflare, set the proxy status to “DNS only” (grey cloud)."} We check automatically every
        few minutes; changes can take up to a few hours to show up.
      </p>
    </div>
  );
}

export default function DomainsPanel({ website, onChanged }: DomainsPanelProps) {
  const [domains, setDomains] = useState<WebsiteDomain[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hostname, setHostname] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<WebsiteDomain | null>(null);
  const [removePending, setRemovePending] = useState(false);

  const load = useCallback(
    () =>
      websitesApi
        .domains(website.id)
        .then((list) => {
          setDomains(list.domains);
          setLoadError(null);
        })
        .catch((err: unknown) => setLoadError(errorMessage(err))),
    [website.id],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const freeUrl = getLiveSiteUrl(website.subdomain);
  const isLive = website.status === "PUBLISHED";

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    if (!hostname.trim()) {
      setAddError("Enter a domain name like www.yourbusiness.com.");
      return;
    }
    setAdding(true);
    setAddError(null);
    try {
      const domain = await websitesApi.addDomain(website.id, hostname.trim());
      setDomains((current) => [...(current ?? []), domain]);
      setHostname("");
    } catch (err) {
      setAddError(errorMessage(err));
    } finally {
      setAdding(false);
    }
  }

  async function runAction(domain: WebsiteDomain, action: () => Promise<unknown>) {
    setBusyId(domain.id);
    setActionError(null);
    try {
      await action();
      await load();
      onChanged();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemove() {
    if (!removing) return;
    setRemovePending(true);
    setActionError(null);
    try {
      await websitesApi.removeDomain(website.id, removing.id);
      setRemoving(null);
      await load();
      onChanged();
    } catch (err) {
      setActionError(errorMessage(err));
      setRemoving(null);
    } finally {
      setRemovePending(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <section className="rounded-xl border border-line bg-surface shadow-xs">
        <div className="border-b border-line px-6 py-4">
          <h2 className="text-base font-semibold text-ink">Free address</h2>
          <p className="mt-0.5 text-sm text-ink-muted">Every website keeps this address, even with your own domain connected.</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
          <span className="min-w-0 break-all font-mono text-sm text-ink">
            {env.hasPublicSiteDomain ? `${website.subdomain}.${env.publicSiteDomain}` : freeUrl}
          </span>
          {isLive ? (
            <a
              href={freeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
            >
              Open <ExternalLink className="size-3.5" aria-hidden />
            </a>
          ) : (
            <span className="text-sm text-ink-muted">Publish to go live</span>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-line bg-surface shadow-xs">
        <div className="border-b border-line px-6 py-4">
          <h2 className="text-base font-semibold text-ink">Custom domains</h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            Use a domain you own. Secure HTTPS is set up automatically once it's connected.
          </p>
        </div>

        <form onSubmit={handleAdd} className="flex flex-wrap items-start gap-3 border-b border-line px-6 py-5" noValidate>
          <div className="min-w-0 flex-1 basis-64">
            <TextInput
              label="Domain"
              name="hostname"
              value={hostname}
              onChange={(value) => {
                setHostname(value);
                setAddError(null);
              }}
              placeholder="www.yourbusiness.com"
              error={addError ?? undefined}
            />
          </div>
          <Button type="submit" size="sm" isPending={adding} className="mt-6">
            Connect domain
          </Button>
        </form>

        <div className="px-6 py-5">
          {actionError && (
            <div className="mb-4">
              <FormAlert status="danger">{actionError}</FormAlert>
            </div>
          )}
          {loadError && <FormAlert status="danger">{loadError}</FormAlert>}
          {!loadError && domains === null && (
            <div className="grid place-items-center py-6">
              <Spinner size="sm" aria-label="Loading domains" />
            </div>
          )}
          {domains?.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <Globe className="size-6 text-ink-muted" aria-hidden />
              <p className="text-sm text-ink-muted">No custom domains yet.</p>
            </div>
          )}
          {domains && domains.length > 0 && (
            <ul className="space-y-4">
              {domains.map((domain) => {
                const busy = busyId === domain.id;
                const active = domain.status === "ACTIVE";
                return (
                  <li key={domain.id} className="rounded-lg border border-line p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        {active && isLive ? (
                          <a
                            href={`https://${domain.hostname}`}
                            target="_blank"
                            rel="noreferrer"
                            className="break-all font-mono text-sm font-medium text-ink hover:underline"
                          >
                            {domain.hostname}
                          </a>
                        ) : (
                          <span className="break-all font-mono text-sm font-medium text-ink">{domain.hostname}</span>
                        )}
                        <DomainStatusChip status={domain.status} />
                        {domain.isPrimary && (
                          <Chip size="sm" variant="soft">
                            Main address
                          </Chip>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {active && !domain.isPrimary && (
                          <Button
                            size="sm"
                            variant="outline"
                            isPending={busy}
                            onPress={() => runAction(domain, () => websitesApi.makePrimaryDomain(website.id, domain.id))}
                          >
                            <Star className="size-4" aria-hidden /> Make main
                          </Button>
                        )}
                        {!active && (
                          <Button
                            size="sm"
                            isPending={busy}
                            onPress={() => runAction(domain, () => websitesApi.verifyDomain(website.id, domain.id))}
                          >
                            <RefreshCw className="size-4" aria-hidden /> Verify now
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          isDisabled={busy}
                          onPress={() => setRemoving(domain)}
                          className="border-ed-danger/40 text-ed-danger hover:bg-ed-danger-soft"
                          aria-label={`Remove ${domain.hostname}`}
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </Button>
                      </div>
                    </div>

                    {active ? (
                      <p className="mt-2 text-xs text-ink-muted">
                        {domain.isPrimary
                          ? "Visitors to your other addresses are sent here."
                          : `Connected${domain.verifiedAt ? ` ${formatDateTime(domain.verifiedAt)}` : ""}.`}
                        {domain.lastError && ` Last check: ${domain.lastError}`}
                      </p>
                    ) : (
                      <div className="mt-4 space-y-3">
                        {domain.lastError && domain.lastCheckedAt && (
                          <FormAlert status="warning" title={`Checked ${formatDateTime(domain.lastCheckedAt)}`}>
                            {domain.lastError}
                          </FormAlert>
                        )}
                        <RecordsTable records={domain.records} />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <CommonModal
        isOpen={removing !== null}
        onClose={() => !removePending && setRemoving(null)}
        headerDetails={{
          icon: <Trash2 className="size-4.5" />,
          title: "Remove domain",
          description: removing?.hostname,
        }}
        iconTone="danger"
        size="sm"
        primaryAction={{ label: "Remove domain", onPress: handleRemove, isPending: removePending, tone: "danger" }}
        secondaryAction={{ label: "Cancel", onPress: () => setRemoving(null), isDisabled: removePending }}
      >
        <p>
          Your website will stop loading at <strong className="font-semibold text-ink">{removing?.hostname}</strong>. You
          can connect it again later.
        </p>
      </CommonModal>
    </div>
  );
}
