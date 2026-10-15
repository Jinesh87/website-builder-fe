import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Button, Spinner } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import {
  ArrowLeft,
  ArrowUpRight,
  CloudOff,
  Code2,
  Eye,
  FileText,
  Globe,
  Pencil,
  Rocket,
  Trash2,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApiError, errorMessage } from "../../api/http.ts";
import {
  websitesApi,
  type WebsiteDetail,
  type WebsiteVersion,
} from "../../api/websites.ts";
import { useAuth } from "../../auth/auth-context.ts";
import DeploymentList from "../../components/dashboard/DeploymentList.tsx";
import DomainsPanel from "../../components/dashboard/DomainsPanel.tsx";
import ProjectSettingsPanel from "../../components/dashboard/ProjectSettingsPanel.tsx";
import ProjectTabs, {
  type ProjectTab,
} from "../../components/dashboard/ProjectTabs.tsx";
import SitePreviewCard from "../../components/dashboard/SitePreviewCard.tsx";
import CommonModal from "../../components/ui/CommonModal.tsx";
import FormAlert from "../../components/ui/FormAlert.tsx";
import DownloadCodeDialog from "../../components/websites/DownloadCodeDialog.tsx";
import {
  BUILDER_LABELS,
  WebsiteStatusChip,
  formatDateTime,
} from "../../components/websites/website-labels.tsx";
import PublishSeoAudit from "../../components/websites/PublishSeoAudit.tsx";
import type { SiteData } from "../../site-kit/index.ts";
import { getLiveSiteDomain, getLiveSiteUrl } from "../../utils/live-url.ts";

const RECENT_DEPLOYMENTS = 3;

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-sm">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium text-ink">
        {children}
      </dd>
    </div>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line bg-surface shadow-xs">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function ProjectDashboardPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "SUPER_ADMIN";
  const backTo = isAdmin ? "/admin/websites" : "/websites";

  const [tab, setTab] = useState<ProjectTab>("overview");
  const [website, setWebsite] = useState<WebsiteDetail | null>(null);
  const [versions, setVersions] = useState<WebsiteVersion[]>([]);
  const [loadError, setLoadError] = useState<{
    notFound: boolean;
    message: string;
  } | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);
  const [unpublishError, setUnpublishError] = useState<string | null>(null);

  const loadVersions = useCallback(
    () => websitesApi.versions(id).then(setVersions),
    [id],
  );

  useEffect(() => {
    let cancelled = false;
    setWebsite(null);
    setLoadError(null);
    Promise.all([websitesApi.get(id), websitesApi.versions(id)])
      .then(([loadedWebsite, loadedVersions]) => {
        if (cancelled) return;
        setWebsite(loadedWebsite);
        setVersions(loadedVersions);
      })
      .catch(
        (err: unknown) =>
          !cancelled &&
          setLoadError({
            notFound: err instanceof ApiError && err.status === 404,
            message: errorMessage(err),
          }),
      );
    return () => {
      cancelled = true;
    };
  }, [id]);

  const site = useMemo<SiteData | null>(
    () =>
      website && {
        theme: website.draft.theme,
        header: website.draft.header,
        footer: website.draft.footer,
        pages: website.draft.pages.filter((page) => page.visible),
      },
    [website],
  );

  async function handlePublish() {
    if (!website) return;
    setPublishing(true);
    setPublishError(null);
    try {
      setWebsite(
        await websitesApi.publish(website.id, website.draft.draftUpdatedAt),
      );
      await loadVersions();
      setConfirmPublish(false);
    } catch (err) {
      setPublishError(errorMessage(err));
    } finally {
      setPublishing(false);
    }
  }

  async function handleUnpublish() {
    if (!website) return;
    setUnpublishing(true);
    setUnpublishError(null);
    try {
      setWebsite(await websitesApi.unpublish(website.id));
      setConfirmUnpublish(false);
    } catch (err) {
      setUnpublishError(errorMessage(err));
    } finally {
      setUnpublishing(false);
    }
  }

  const refreshWebsite = useCallback(() => {
    websitesApi.get(id).then(setWebsite).catch(() => {});
  }, [id]);

  async function handleDelete() {
    if (!website) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await websitesApi.delete(website.id);
      navigate(backTo, { replace: true });
    } catch (err) {
      setDeleteError(errorMessage(err));
      setDeleting(false);
    }
  }

  function closeDelete() {
    if (deleting) return;
    setConfirmDelete(false);
    setDeleteError(null);
  }

  if (loadError) {
    return (
      <div className="grid min-h-[70vh] place-items-center px-6 text-center">
        <div className="max-w-sm">
          <h1 className="text-xl font-semibold text-ink">
            {loadError.notFound ? "Website not found" : "Couldn't load website"}
          </h1>
          <p className="mt-2 text-sm text-ink-body">
            {loadError.notFound
              ? "It may have been deleted, or you don't have access to it."
              : loadError.message}
          </p>
          <Link
            to={backTo}
            className={`${buttonVariants({ variant: "outline" })} mt-6`}
          >
            <ArrowLeft className="size-4" aria-hidden /> Back to websites
          </Link>
        </div>
      </div>
    );
  }

  if (!website || !site) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <Spinner size="lg" aria-label="Loading website" />
      </div>
    );
  }

  const previewUrl = `/websites/${website.id}/preview`;
  const editUrl = `/websites/${website.id}/edit`;
  const liveSiteUrl = getLiveSiteUrl(website.subdomain, website.customDomain);
  const needsPublish =
    website.status !== "PUBLISHED" || website.hasUnpublishedChanges;
  const visiblePages = website.draft.pages.filter((page) => page.visible);

  return (
    <div className="px-6 py-8 sm:px-8">
      <div className="space-y-6">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-sm"
        >
          <Link
            to={backTo}
            className="inline-flex items-center gap-1.5 text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {isAdmin ? "All websites" : "My websites"}
          </Link>
          <span className="text-line-strong" aria-hidden>
            /
          </span>
          <span className="truncate font-medium text-ink">{website.name}</span>
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="truncate text-2xl font-semibold tracking-tight text-ink">
                {website.name}
              </h1>
              <WebsiteStatusChip website={website} />
            </div>
            <p className="mt-1 font-mono text-sm text-ink-muted">
              {website.subdomain}
              {isAdmin && (
                <span className="font-sans"> · {website.clientName}</span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {website.status === "PUBLISHED" && (
              <a
                href={liveSiteUrl}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ size: "sm", variant: "secondary" })}
                title="Visit live published site"
              >
                <Globe className="size-4 text-emerald-500" aria-hidden /> Visit
                live site
              </a>
            )}
            <Button
              size="sm"
              variant="outline"
              onPress={() => setDownloadOpen(true)}
            >
              <Code2 className="size-4" aria-hidden /> Download code
            </Button>
            <Link
              to={previewUrl}
              className={buttonVariants({ size: "sm", variant: "outline" })}
            >
              <Eye className="size-4" aria-hidden /> Preview
            </Link>
            <Link
              to={editUrl}
              className={buttonVariants({
                size: "sm",
                variant: needsPublish ? "outline" : "primary",
              })}
            >
              <Pencil className="size-4" aria-hidden /> Edit site
            </Link>
            {needsPublish && (
              <Button
                size="sm"
                onPress={() => {
                  setPublishError(null);
                  setConfirmPublish(true);
                }}
                isPending={publishing}
              >
                <Rocket className="size-4" aria-hidden /> Publish
              </Button>
            )}
          </div>
        </div>

        {publishError && <FormAlert status="danger">{publishError}</FormAlert>}

        <ProjectTabs value={tab} onChange={setTab} />

        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <SitePreviewCard
                site={site}
                address={website.subdomain}
                previewUrl={previewUrl}
              />

              <Panel title="Details">
                <dl className="divide-y divide-line px-5">
                  <DetailRow label="Status">
                    <WebsiteStatusChip website={website} />
                  </DetailRow>
                  <DetailRow label="Address">
                    <span className="font-mono text-ed-sm">
                      {website.subdomain}
                    </span>
                  </DetailRow>
                  <DetailRow label="Builder">
                    {BUILDER_LABELS[website.builderType]}
                  </DetailRow>
                  <DetailRow label="Last published">
                    {website.publishedAt
                      ? formatDateTime(website.publishedAt)
                      : "Never"}
                  </DetailRow>
                  <DetailRow label="Last edited">
                    {formatDateTime(website.draft.draftUpdatedAt)}
                  </DetailRow>
                  <DetailRow label="Created">
                    {formatDateTime(website.createdAt)}
                  </DetailRow>
                </dl>
              </Panel>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Panel
                title={`Pages · ${visiblePages.length}`}
                action={
                  <Link
                    to={editUrl}
                    className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
                  >
                    Manage <ArrowUpRight className="size-3.5" aria-hidden />
                  </Link>
                }
              >
                <ul className="divide-y divide-line">
                  {website.draft.pages.map((page) => (
                    <li
                      key={page.id}
                      className="flex items-center gap-3 px-5 py-3 text-sm"
                    >
                      <FileText
                        className="size-4 shrink-0 text-ink-muted"
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1 truncate font-medium text-ink">
                        {page.name}
                      </span>
                      {!page.visible && (
                        <span className="text-xs text-ink-muted">Hidden</span>
                      )}
                      <span className="font-mono text-xs text-ink-muted">
                        {page.slug}
                      </span>
                    </li>
                  ))}
                </ul>
              </Panel>

              <Panel
                title="Recent deployments"
                action={
                  versions.length > RECENT_DEPLOYMENTS && (
                    <button
                      type="button"
                      onClick={() => setTab("deployments")}
                      className="text-sm text-ink-muted hover:text-ink"
                    >
                      View all
                    </button>
                  )
                }
              >
                <DeploymentList
                  versions={versions.slice(0, RECENT_DEPLOYMENTS)}
                  embedded
                />
              </Panel>
            </div>
          </div>
        )}

        {tab === "deployments" && <DeploymentList versions={versions} />}

        {tab === "domains" && (
          <DomainsPanel website={website} onChanged={refreshWebsite} />
        )}

        {tab === "settings" && (
          <ProjectSettingsPanel
            website={website}
            onSaved={setWebsite}
            onDelete={() => setConfirmDelete(true)}
            onUnpublish={() => {
              setUnpublishError(null);
              setConfirmUnpublish(true);
            }}
          />
        )}
      </div>

      <CommonModal
        isOpen={confirmDelete}
        onClose={closeDelete}
        headerDetails={{
          icon: <Trash2 className="size-4.5" />,
          title: "Delete website",
          description: `${website.name} · ${website.subdomain}`,
        }}
        iconTone="danger"
        size="sm"
        primaryAction={{
          label: "Delete website",
          onPress: handleDelete,
          isPending: deleting,
          tone: "danger",
        }}
        secondaryAction={{
          label: "Cancel",
          onPress: closeDelete,
          isDisabled: deleting,
        }}
      >
        <div className="space-y-2.5">
          <p>
            Are you sure you want to delete{" "}
            <strong className="font-semibold text-ink">“{website.name}”</strong>
            ? All pages and deployments will be permanently removed. This can't
            be undone.
          </p>
          {deleteError && <FormAlert status="danger">{deleteError}</FormAlert>}
        </div>
      </CommonModal>

      <CommonModal
        isOpen={confirmPublish}
        onClose={() => !publishing && setConfirmPublish(false)}
        headerDetails={{
          icon: <Rocket className="size-4.5" />,
          title: "Publish website",
          description: `${website.name} · ${website.subdomain}`,
        }}
        size="lg"
        primaryAction={{
          label: "Confirm & Publish",
          onPress: handlePublish,
          isPending: publishing,
        }}
        secondaryAction={{
          label: "Cancel",
          onPress: () => setConfirmPublish(false),
          isDisabled: publishing,
        }}
      >
        <div className="space-y-3.5">
          <p className="text-xs text-ink-body">
            A new production snapshot will be generated from your draft and
            published live at{" "}
            <strong className="font-mono text-ink">
              {getLiveSiteDomain(website.subdomain, website.customDomain)}
            </strong>
            .
          </p>
          <PublishSeoAudit website={website} />
          {publishError && (
            <FormAlert status="danger">{publishError}</FormAlert>
          )}
        </div>
      </CommonModal>

      <CommonModal
        isOpen={confirmUnpublish}
        onClose={() => !unpublishing && setConfirmUnpublish(false)}
        headerDetails={{
          icon: <CloudOff className="size-4.5" />,
          title: "Unpublish website",
          description: `${website.name} · ${website.subdomain}`,
        }}
        iconTone="danger"
        size="sm"
        primaryAction={{
          label: "Unpublish",
          onPress: handleUnpublish,
          isPending: unpublishing,
          tone: "danger",
        }}
        secondaryAction={{
          label: "Cancel",
          onPress: () => setConfirmUnpublish(false),
          isDisabled: unpublishing,
        }}
      >
        <div className="space-y-2.5">
          <p>
            Visitors will see a "not found" page on every address of this
            website, including connected domains. Publish again at any time to
            bring it back.
          </p>
          {unpublishError && (
            <FormAlert status="danger">{unpublishError}</FormAlert>
          )}
        </div>
      </CommonModal>

      <DownloadCodeDialog
        websiteId={website.id}
        isOpen={downloadOpen}
        onClose={() => setDownloadOpen(false)}
      />
    </div>
  );
}
