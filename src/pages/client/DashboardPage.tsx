import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Spinner } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { ArrowRight, Globe, Image, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { errorMessage } from "../../api/http.ts";
import { formatBytes, mediaApi, type StorageUsage } from "../../api/media.ts";
import { websitesApi, type WebsiteSummary } from "../../api/websites.ts";
import { useAuth } from "../../auth/auth-context.ts";
import PageHeader from "../../components/app/PageHeader.tsx";
import HostingAlert, {
  hostingAlertFromAttention,
  resolveHostingAlert,
} from "../../components/hosting/HostingAlert.tsx";
import CommonModal from "../../components/ui/CommonModal.tsx";
import FormAlert from "../../components/ui/FormAlert.tsx";
import BuilderChoices from "../../components/websites/BuilderChoices.tsx";
import WebsiteCard from "../../components/websites/WebsiteCard.tsx";

const RECENT_COUNT = 3;

type Overview = {
  websites: WebsiteSummary[];
  totalWebsites: number;
  mediaFiles: number;
  storage: StorageUsage | null;
};

function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
<div className="rounded-xl border border-line bg-surface p-5">
      <p className="text-sm text-ink-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [websiteToDelete, setWebsiteToDelete] = useState<WebsiteSummary | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([websitesApi.list({ pageSize: 100 }), mediaApi.list({ pageSize: 1 })])
      .then(([websites, media]) => {
        if (cancelled) return;
        setOverview({ websites: websites.items, totalWebsites: websites.total, mediaFiles: media.total, storage: media.usage });
      })
      .catch((err: unknown) => !cancelled && setLoadError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDeleteConfirm() {
    if (!websiteToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await websitesApi.delete(websiteToDelete.id);
      setOverview((prev) =>
        prev
          ? {
              ...prev,
              websites: prev.websites.filter((w) => w.id !== websiteToDelete.id),
              totalWebsites: Math.max(0, prev.totalWebsites - 1),
            }
          : prev,
      );
      setWebsiteToDelete(null);
    } catch (err) {
      setDeleteError(errorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  }

  const isDraft = websiteToDelete?.status === "DRAFT";
  const published = overview?.websites.filter((website) => website.status === "PUBLISHED").length ?? 0;
  const pendingChanges = overview?.websites.filter((website) => website.hasUnpublishedChanges).length ?? 0;
  const recent = overview?.websites.slice(0, RECENT_COUNT) ?? [];
  const hostingAlerts = useMemo(() => {
    if (!overview) return [];
    return overview.websites.flatMap((website) => {
      if (!website.hostingAttention) return [];
      const source = hostingAlertFromAttention(website.id, website.name, website.hostingAttention);
      return resolveHostingAlert(source) ? [source] : [];
    });
  }, [overview]);

  return (
    <div className="px-6 py-8 sm:px-8">
      <PageHeader
        title={`Welcome, ${user?.fullName ?? ""}`}
        description="An overview of your websites and media."
        actions={
          <Link to="/websites/new" className={buttonVariants()}>
            <Plus className="size-4" aria-hidden /> Create website
          </Link>
        }
      />

      {loadError && (
        <div className="mt-6 max-w-2xl">
          <FormAlert status="danger">{loadError}</FormAlert>
        </div>
      )}

      {!overview && !loadError && (
        <div className="grid place-items-center py-20">
          <Spinner aria-label="Loading dashboard" />
        </div>
      )}

      {overview && (
        <>
          {hostingAlerts.length > 0 && (
            <section aria-label="Hosting alerts" className="mt-6 space-y-3">
              {hostingAlerts.map((source) => (
                <HostingAlert
                  key={source.websiteId}
                  source={source}
                  href={`/websites/${source.websiteId}?tab=hosting`}
                />
              ))}
            </section>
          )}

          <section aria-label="Summary" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Websites" value={overview.totalWebsites} />
            <Stat label="Published" value={published} hint={published === 0 ? "Publish a website to put it online" : undefined} />
            <Stat label="Unpublished changes" value={pendingChanges} hint={pendingChanges > 0 ? "Publish to update the live site" : undefined} />
            <Stat
              label="Media files"
              value={overview.mediaFiles}
              hint={overview.storage ? `${formatBytes(overview.storage.usedBytes)} of ${formatBytes(overview.storage.limitBytes)} used` : undefined}
            />
          </section>

          {overview.totalWebsites === 0 ? (
            <section className="mt-8 rounded-xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-soft text-brand">
                <Plus className="size-6" aria-hidden />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-ink">Create your first website</h2>
              <p className="mt-1 text-sm text-ink-body">Choose how you'd like to start.</p>
              <BuilderChoices />
            </section>
          ) : (
            <section aria-labelledby="recent-websites" className="mt-8">
              <div className="flex items-center justify-between gap-4">
                <h2 id="recent-websites" className="text-lg font-semibold text-ink">
                  Recently edited
                </h2>
                <Link to="/websites" className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">
                  View all websites <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
              <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {recent.map((website) => (
                  <WebsiteCard
                    key={website.id}
                    website={website}
                    onDelete={(target) => {
                      setDeleteError(null);
                      setWebsiteToDelete(target);
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          <section aria-label="Quick links" className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link to="/websites" className="flex items-center gap-4 rounded-xl border border-line bg-surface p-5 transition-colors hover:border-brand">
              <span className="grid size-10 place-items-center rounded-full bg-brand-soft text-brand">
                <Globe className="size-5" aria-hidden />
              </span>
              <span>
                <span className="block font-medium text-ink">My websites</span>
                <span className="block text-sm text-ink-body">Edit, preview and manage all your websites.</span>
              </span>
            </Link>
            <Link to="/media" className="flex items-center gap-4 rounded-xl border border-line bg-surface p-5 transition-colors hover:border-brand">
              <span className="grid size-10 place-items-center rounded-full bg-brand-soft text-brand">
                <Image className="size-5" aria-hidden />
              </span>
              <span>
                <span className="block font-medium text-ink">Media library</span>
                <span className="block text-sm text-ink-body">Upload and organise images, videos and documents.</span>
              </span>
            </Link>
          </section>
        </>
      )}

      {/* Reusable HeroUI Delete Confirmation Modal */}
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
          description: websiteToDelete
            ? `${websiteToDelete.name} · ${websiteToDelete.subdomain}`
            : undefined,
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
            <strong className="font-semibold text-ink">
              “{websiteToDelete?.name}”
            </strong>
            ? This action cannot be undone and all associated draft pages and
            customizations will be permanently removed.
          </p>
          {deleteError && <FormAlert status="danger">{deleteError}</FormAlert>}
        </div>
      </CommonModal>
    </div>
  );
}
