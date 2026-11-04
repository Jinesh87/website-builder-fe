import { Chip } from "@heroui/react";
import type { WebsiteVersion } from "../../api/websites.ts";
import { formatDateTime } from "../websites/website-labels.tsx";

const STATUS = {
  SUCCEEDED: { label: "Ready", dot: "bg-emerald-500" },
  PENDING: { label: "Publishing", dot: "bg-amber-500" },
  FAILED: { label: "Failed", dot: "bg-ed-danger" },
} as const satisfies Record<WebsiteVersion["status"], { label: string; dot: string }>;

type DeploymentListProps = {
  versions: WebsiteVersion[];
  /** Drops the outer card so the list can sit inside another panel. */
  embedded?: boolean;
  onRestore?: (version: WebsiteVersion) => void;
  restoringVersionId?: string | null;
  emptyTitle?: string;
  emptyText?: string;
};

/** Publish history, newest first. */
export default function DeploymentList({
  versions,
  embedded = false,
  onRestore,
  restoringVersionId = null,
  emptyTitle = "No deployments yet",
  emptyText = "Publish your website to create the first deployment.",
}: DeploymentListProps) {
  const frame = embedded ? "" : "rounded-xl border border-line bg-surface shadow-xs";

  if (versions.length === 0) {
    return (
      <div className={`px-6 py-12 text-center ${embedded ? "" : "rounded-xl border border-dashed border-line-strong bg-surface"}`}>
        <p className="text-sm font-medium text-ink">{emptyTitle}</p>
        <p className="mt-1 text-sm text-ink-muted">{emptyText}</p>
      </div>
    );
  }

  const backupDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <ul className={`divide-y divide-line overflow-hidden ${frame}`}>
      {versions.map((version) => {
        const status = STATUS[version.status];
        return (
          <li key={version.id} className="flex flex-wrap items-center gap-x-5 gap-y-1.5 px-5 py-3.5 text-sm">
            <span className="w-24 font-medium text-ink">{backupDate(version.createdAt)}</span>
            <span className="flex items-center gap-2 text-ink-body">
              <span className={`size-2 rounded-full ${status.dot}`} aria-hidden />
              {status.label}
            </span>
            {version.isLive && (
              <Chip size="sm" color="success">
                Live
              </Chip>
            )}
            {version.source === "BACKUP" && <Chip size="sm" variant="soft">Backup</Chip>}
            {!version.isLive && onRestore && version.status === "SUCCEEDED" && (
              <button
                type="button"
                onClick={() => onRestore(version)}
                disabled={restoringVersionId === version.id}
                className="rounded-md border border-line px-2 py-1 text-xs text-ink-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
              >
                {restoringVersionId === version.id ? "Restoring..." : "Restore"}
              </button>
            )}
            <span className="ml-auto text-right text-ink-muted">
              {formatDateTime(version.createdAt)}
              {version.publishedByName && (
                <>
                  {" · "}
                  <span className="text-ink-body">{version.publishedByName}</span>
                </>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
