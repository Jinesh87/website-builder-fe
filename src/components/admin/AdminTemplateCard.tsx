import type { Key } from "react";
import { Dropdown, Label } from "@heroui/react";
import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import type { AdminTemplate, PlatformTemplateStatus } from "../../api/admin-templates.ts";
import { TPLS } from "../../pages/marketing/data.ts";
import { TemplateFrame } from "../../pages/marketing/MiniSite.tsx";
import TemplateCardShell, { TemplateCardEyeIcon, templateDomain } from "../../pages/marketing/TemplateCardShell.tsx";
import { curatedTemplateIndex } from "../../pages/marketing/use-gallery-templates.ts";
import AdminTemplateThumbnail from "./AdminTemplateThumbnail.tsx";

export type AdminTemplateAction = "duplicate" | "details" | "toggle" | "copy" | "archive" | "restore" | "purge";

type MenuItem = { id: AdminTemplateAction | "preview"; label: string; danger?: boolean };

const STATUS_TAG: Record<PlatformTemplateStatus, { label: string; className: string }> = {
  LIVE: { label: "Live", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  HIDDEN: { label: "Draft", className: "border-line bg-canvas text-ink-muted" },
  ARCHIVED: { label: "Archived", className: "border-amber-200 bg-amber-50 text-amber-700" },
};

/** A built-in template that isn't live was taken out of the gallery, not drafted. */
const statusLabel = (template: AdminTemplate) =>
  template.origin === "BUILT_IN" && template.status === "HIDDEN" ? "Hidden" : STATUS_TAG[template.status].label;

const dangerButton = "text-red-600! border-red-200! hover:bg-red-50!";

type AdminTemplateCardProps = {
  template: AdminTemplate;
  /** An action on this template is in flight. */
  busy: boolean;
  onAction: (action: AdminTemplateAction) => void;
};

/**
 * The marketing gallery card with admin actions. Built-in templates keep their curated thumbnail and can
 * only be shown or hidden; admin-made templates can be edited, recategorised, deleted and restored.
 */
export default function AdminTemplateCard({ template, busy, onAction }: AdminTemplateCardProps) {
  const builtIn = template.origin === "BUILT_IN";
  const archived = template.status === "ARCHIVED";
  const live = template.status === "LIVE";
  const curatedIndex = curatedTemplateIndex(template.key);
  const curated = curatedIndex === null ? null : TPLS[curatedIndex];
  const galleryPath = `/templates/${encodeURIComponent(curated?.id ?? template.key)}`;
  // Curated designs render from code; anything else is served by the public preview, which only shows live templates.
  const inGallery = live || curated !== null;
  const editPath = template.sourceWebsiteId ? `/websites/${template.sourceWebsiteId}/edit` : null;
  const pageCount = template.pages.length;
  const status = STATUS_TAG[template.status];
  // Built-in templates use their marketing number (#2134…); admin-made ones are numbered from #3001.
  const displayNumber = curated?.id ?? template.number;
  const toggleLabel = builtIn ? (live ? "Hide from gallery" : "Show in gallery") : live ? "Unpublish (back to drafts)" : "Publish to gallery";
  const editedBy = template.updatedByName && template.updatedByName !== template.createdByName ? template.updatedByName : null;

  const menu: MenuItem[] = [
    ...(inGallery ? [{ id: "preview" as const, label: "Open in gallery" }] : []),
    // A new template can only be copied from a live one.
    ...(live ? [{ id: "duplicate" as const, label: "Use as starting point" }] : []),
    ...(!builtIn && !archived ? [{ id: "details" as const, label: "Edit details" }] : []),
    ...(!archived ? [{ id: "toggle" as const, label: toggleLabel }] : []),
    { id: "copy", label: "Copy template ID" },
    ...(!builtIn && !archived ? [{ id: "archive" as const, label: "Delete", danger: true }] : []),
  ];

  function handleMenu(key: Key) {
    if (key === "preview") {
      window.open(galleryPath, "_blank", "noopener,noreferrer");
      return;
    }
    onAction(key as AdminTemplateAction);
  }

  const primaryActions = archived ? (
    <>
      <button type="button" className={`btn-details ${dangerButton}`} disabled={busy} onClick={() => onAction("purge")}>
        Delete forever
      </button>
      <button type="button" className="btn-use" disabled={busy} onClick={() => onAction("restore")}>
        {busy ? "Restoring…" : "Restore"}
      </button>
    </>
  ) : builtIn ? (
    <>
      {inGallery && (
        <a href={galleryPath} target="_blank" rel="noreferrer" className="btn-preview" title={`Preview ${template.name}`}>
          <TemplateCardEyeIcon size={14} />
          Preview
        </a>
      )}
      <button type="button" className="btn-details" disabled={busy} onClick={() => onAction("toggle")}>
        {busy ? "Saving…" : live ? "Hide" : "Show"}
      </button>
    </>
  ) : (
    <>
      <button type="button" className="btn-details" disabled={busy} onClick={() => onAction("details")}>
        Details
      </button>
      {editPath && (
        <Link to={editPath} className="btn-use" title={`Edit the design of ${template.name}`}>
          Edit design
        </Link>
      )}
    </>
  );

  return (
    <TemplateCardShell
      name={template.name}
      href={builtIn || !editPath ? galleryPath : editPath}
      newTab={builtIn || !editPath}
      thumbnailLabel={builtIn ? `Preview ${template.name}` : `Edit ${template.name}`}
      nameTitle={`${template.name} (ID: ${template.key})`}
      domain={templateDomain(curated?.biz || template.name)}
      badge={builtIn ? "Built-in" : "Custom"}
      overlayLabel={builtIn || !editPath ? "Live Preview" : "Edit design"}
      thumbnail={
        curatedIndex !== null && builtIn ? (
          <TemplateFrame t={curatedIndex} />
        ) : (
          <AdminTemplateThumbnail source={{ kind: "template", templateId: template.id }} version={template.updatedAt} />
        )
      }
      nameExtra={
        displayNumber != null ? (
          <button
            type="button"
            className="tid-badge"
            title={`Template ID: ${template.key} (click to copy)`}
            aria-label={`Template #${displayNumber}. Copy template ID ${template.key}`}
            onClick={() => onAction("copy")}
          >
            #{displayNumber}
          </button>
        ) : undefined
      }
      tag={
        <span className="flex shrink-0 items-center gap-1.5">
          {template.hasUnpublishedChanges && !archived && (
            <span
              className="tag border border-sky-200 bg-sky-50 text-sky-700"
              title="The design was edited after it was last saved to this template. Open Edit design and click Update template to publish the edits."
            >
              Unpublished edits
            </span>
          )}
          <span className={`tag border ${status.className}`}>{statusLabel(template)}</span>
        </span>
      }
      hint={
        <>
          {template.category} · {pageCount} {pageCount === 1 ? "page" : "pages"}
          {template.createdByName ? ` · by ${template.createdByName}` : ""}
          {editedBy ? ` · edited by ${editedBy}` : ""}
        </>
      }
      actions={
        <>
          {primaryActions}
          <Dropdown>
            <Dropdown.Trigger className="btn-fav" aria-label={`More actions for ${template.name}`} isDisabled={busy}>
              <MoreHorizontal className="size-4.5" aria-hidden />
            </Dropdown.Trigger>
            <Dropdown.Popover className="min-w-48 rounded-lg border border-ed-border bg-surface p-1 shadow-ed-pop z-(--z-ed-popover)">
              <Dropdown.Menu onAction={handleMenu} className="flex flex-col gap-0.5 outline-none">
                {menu.map((item) => (
                  <Dropdown.Item
                    key={item.id}
                    id={item.id}
                    textValue={item.label}
                    className={`flex w-full cursor-pointer items-center rounded-md px-2.5 py-1.5 text-sm outline-none transition-colors select-none ${
                      item.danger ? "text-ed-danger hover:bg-ed-danger-soft" : "text-ink hover:bg-canvas"
                    }`}
                  >
                    <Label className="flex-1 cursor-pointer truncate font-inherit">{item.label}</Label>
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </>
      }
    />
  );
}
