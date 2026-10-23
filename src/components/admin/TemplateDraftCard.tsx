import { Link } from "react-router-dom";
import type { TemplateDraft } from "../../api/admin-templates.ts";
import TemplateCardShell, { templateDomain } from "../../pages/marketing/TemplateCardShell.tsx";
import { formatDate } from "./client-labels.tsx";
import AdminTemplateThumbnail from "./AdminTemplateThumbnail.tsx";

const dangerButton = "text-red-600! border-red-200! hover:bg-red-50!";

type TemplateDraftCardProps = {
  draft: TemplateDraft;
  /** Discarding is in flight. */
  busy: boolean;
  onDiscard: () => void;
};

/** Work in progress in Template Studio that hasn't been saved as a template; clients never see it. */
export default function TemplateDraftCard({ draft, busy, onDiscard }: TemplateDraftCardProps) {
  const editPath = `/websites/${draft.websiteId}/edit`;

  return (
    <TemplateCardShell
      name={draft.name}
      href={editPath}
      thumbnailLabel={`Continue editing ${draft.name}`}
      domain={templateDomain(draft.name)}
      badge="Not saved"
      overlayLabel="Continue editing"
      thumbnail={<AdminTemplateThumbnail source={{ kind: "draft", websiteId: draft.websiteId }} version={draft.updatedAt} />}
      tag={
        <span
          className="tag border border-dashed border-line-strong bg-canvas text-ink-muted"
          title="Not saved as a template yet. Open it and use Save as template to keep it as a draft or publish it."
        >
          Unsaved draft
        </span>
      }
      hint={
        <>
          {draft.pageCount} {draft.pageCount === 1 ? "page" : "pages"}
          {draft.createdByName ? ` · by ${draft.createdByName}` : ""} · edited {formatDate(draft.updatedAt)}
        </>
      }
      actions={
        <>
          <button type="button" className={`btn-details ${dangerButton}`} disabled={busy} onClick={onDiscard}>
            {busy ? "Discarding…" : "Discard"}
          </button>
          <Link to={editPath} className="btn-use" title={`Continue editing ${draft.name}`}>
            Continue editing
          </Link>
        </>
      }
    />
  );
}
