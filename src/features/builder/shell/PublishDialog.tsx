import { useEffect, useState } from "react";
import { Button, Modal } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { History, Rocket } from "lucide-react";
import { hostingApi, type PlanChoice, type WebsiteHosting } from "../../../api/hosting.ts";
import { ApiError, errorMessage } from "../../../api/http.ts";
import { formatPaise } from "../../../api/wallet.ts";
import { websitesApi, type WebsiteDetail, type WebsiteVersion } from "../../../api/websites.ts";
import HostingCheckoutModal from "../../../components/hosting/HostingCheckoutModal.tsx";
import HostingRequiredCard from "../../../components/hosting/HostingRequiredCard.tsx";
import { hostingBlocksPublish } from "../../../components/hosting/hosting-labels.tsx";
import PlanPicker from "../../../components/hosting/PlanPicker.tsx";
import FormAlert from "../../../components/ui/FormAlert.tsx";
import PublishSeoAudit from "../../../components/websites/PublishSeoAudit.tsx";
import { defaultPlan } from "../../../utils/hosting-pricing.ts";
import { getLiveSiteDomain } from "../../../utils/live-url.ts";
import { useEditor } from "../editor-context.ts";

type PublishDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onPublished: (website: WebsiteDetail, hosting: WebsiteHosting | null) => void;
};

function formatDate(value: string): string {
  return new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export default function PublishDialog({ isOpen, onClose, onPublished }: PublishDialogProps) {
  const { website, draft, autosave, role } = useEditor();
  const isAdmin = role === "SUPER_ADMIN";
  const [versions, setVersions] = useState<WebsiteVersion[] | null>(null);
  const [hosting, setHosting] = useState<WebsiteHosting | null>(null);
  const [hostingLoaded, setHostingLoaded] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanChoice | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setError(null);
    setHostingLoaded(false);
    websitesApi
      .versions(website.id)
      .then((loaded) => !cancelled && setVersions(loaded))
      .catch(() => !cancelled && setVersions([]));
    hostingApi
      .get(website.id)
      .then((loaded) => {
        if (!cancelled) {
          setHosting(loaded);
          setSelectedPlan(defaultPlan(loaded));
        }
      })
      .catch(() => !cancelled && setHosting(null))
      .finally(() => !cancelled && setHostingLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [isOpen, website.id]);

  const visiblePages = draft.pages.filter((page) => page.visible);
  const hiddenSections = visiblePages.reduce((count, page) => count + page.sections.filter((section) => section.hidden).length, 0);
  const needsPlan = hostingBlocksPublish(hosting);
  const selectedPrice =
    selectedPlan && hosting?.packages.find((pkg) => pkg.id === selectedPlan.packageId)?.prices[selectedPlan.cycle];

  async function publish(currentHosting: WebsiteHosting | null = hosting) {
    setError(null);
    setPublishing(true);
    try {
      if (!(await autosave.flush())) {
        setError("Your latest changes couldn't be saved yet. Resolve the save problem shown in the toolbar, then publish.");
        return;
      }
      const published = await websitesApi.publish(website.id, autosave.token());
      onPublished(published, currentHosting);
    } catch (err) {
      if (err instanceof ApiError && err.code === "HOSTING_REQUIRED") {
        // Hosting changed since the dialog opened; show the plan step instead of a bare error.
        setHosting(await hostingApi.get(website.id).catch(() => hosting));
        return;
      }
      setError(errorMessage(err));
    } finally {
      setPublishing(false);
    }
  }

  function handlePaid(updated: WebsiteHosting) {
    setHosting(updated);
    setCheckoutOpen(false);
    void publish(updated);
  }

  return (
    <>
      <Modal.Backdrop isOpen={isOpen && !checkoutOpen} onOpenChange={(open) => !open && !publishing && onClose()}>
        <Modal.Container size="lg">
          <Modal.Dialog aria-label="Publish website">
            <Modal.Header>
              <Modal.Heading>Publish “{website.name}”?</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="flex flex-col gap-4 text-sm text-ink-body">
                {needsPlan && hosting && (
                  <>
                    <HostingRequiredCard hosting={hosting} isAdmin={isAdmin} />
                    <PlanPicker
                      packages={hosting.packages}
                      value={selectedPlan}
                      onChange={setSelectedPlan}
                      currentPackageId={hosting.subscription?.packageId}
                      onEditCustom={isAdmin ? () => setCheckoutOpen(true) : undefined}
                      customAction={
                        isAdmin ? undefined : (
                          <a
                            href="/contact"
                            target="_blank"
                            rel="noreferrer"
                            className={buttonVariants({ size: "sm", variant: "outline", className: "w-full" })}
                          >
                            Contact us
                          </a>
                        )
                      }
                    />
                  </>
                )}

                <p>
                  A new version is created from your saved draft and goes live at{" "}
                  <span className="font-mono text-ink">{getLiveSiteDomain(website.subdomain, website.customDomain)}</span>. Your
                  draft stays editable, and the live site only changes when you publish again.
                </p>

                {website.seoToolsEnabled && <PublishSeoAudit website={website} />}
                <ul className="grid grid-cols-2 gap-2 text-xs">
                  <li className="rounded-md border border-line px-3 py-2">
                    <span className="block text-ink-muted">Pages going live</span>
                    <span className="text-base font-semibold text-ink">{visiblePages.length}</span>
                  </li>
                  <li className="rounded-md border border-line px-3 py-2">
                    <span className="block text-ink-muted">Hidden sections left out</span>
                    <span className="text-base font-semibold text-ink">{hiddenSections}</span>
                  </li>
                </ul>
                <div>
                  <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-ink">
                    <History className="size-3.5" aria-hidden /> Recent versions
                  </h3>
                  {versions === null ? (
                    <p className="text-xs text-ink-muted">Loading…</p>
                  ) : versions.length === 0 ? (
                    <p className="text-xs text-ink-muted">This will be the first published version.</p>
                  ) : (
                    <ul className="flex max-h-36 flex-col divide-y divide-line overflow-y-auto rounded-md border border-line text-xs">
                      {versions.slice(0, 5).map((version) => (
                        <li key={version.id} className="flex items-center gap-2 px-3 py-1.5">
                          <span className="font-mono text-ink">v{version.version}</span>
                          <span className="text-ink-muted">{formatDate(version.createdAt)}</span>
                          {version.publishedByName && <span className="truncate text-ink-muted">· {version.publishedByName}</span>}
                          {version.isLive && <span className="ml-auto rounded bg-ed-success-soft px-1.5 text-ed-success">Live</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {error && <FormAlert status="danger">{error}</FormAlert>}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline" onPress={onClose} isDisabled={publishing}>
                Cancel
              </Button>
              {!hostingLoaded ? (
                <Button isPending>Checking hosting…</Button>
              ) : needsPlan ? (
                <Button onPress={() => setCheckoutOpen(true)} isDisabled={publishing}>
                  {isAdmin
                    ? "Record payment & publish"
                    : selectedPrice == null
                      ? "Choose plan & publish"
                      : `Continue · ${selectedPrice === 0 ? "Free" : formatPaise(selectedPrice)}`}
                </Button>
              ) : (
                <Button onPress={() => void publish()} isPending={publishing}>
                  <Rocket className="size-4" aria-hidden /> Publish now
                </Button>
              )}
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      {hosting && (
        <HostingCheckoutModal
          isOpen={isOpen && checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          hosting={hosting}
          isAdmin={isAdmin}
          initialPlan={selectedPlan}
          onChangePlan={() => setCheckoutOpen(false)}
          onPaid={handlePaid}
          onHostingChange={setHosting}
          title="Choose a hosting plan to publish"
        />
      )}
    </>
  );
}
