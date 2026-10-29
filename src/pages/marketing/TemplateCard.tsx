import { Link } from "react-router-dom";
import { TPLS, CAT_LABEL } from "./data.ts";
import { useMarketing } from "./marketing-context.ts";
import { TemplateFrame } from "./MiniSite.tsx";
import TemplateCardShell, { TemplateCardEyeIcon, templateDomain } from "./TemplateCardShell.tsx";
import { getTemplateKey } from "../../site-kit/templates/index.ts";

interface TemplateCardProps {
  index: number;
  isShortlisted?: boolean;
  onToggleShortlist?: (index: number) => void;
}

export default function TemplateCard({ index, isShortlisted, onToggleShortlist }: TemplateCardProps) {
  const { toast } = useMarketing();
  const t = TPLS[index];
  if (!t) return null;

  const styleClass = `tag-${(t.style ?? "classic").toLowerCase()}`;
  const pageCount = t.pages.split(", ").length;
  const templatePath = `/templates/${t.id}`;
  const templateKey = getTemplateKey(t.id) ?? t.id;
  const useTemplatePath = `/websites/new?templateKey=${encodeURIComponent(templateKey)}`;

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleShortlist) {
      onToggleShortlist(index);
    } else {
      toast(`Updated shortlist for ${t.n}`);
    }
  };

  return (
    <TemplateCardShell
      name={t.n}
      href={templatePath}
      thumbnailLabel={`Open ${t.n} (ID: ${t.id})`}
      nameTitle={`${t.n} (ID: ${t.id})`}
      domain={templateDomain(t.biz || t.n)}
      badge={t.style ?? "2026"}
      thumbnail={<TemplateFrame t={index} />}
      nameExtra={<span className="tid-badge">#{t.id}</span>}
      tag={<span className={`tag ${styleClass}`}>{t.style ?? "Classic"}</span>}
      hint={
        <>
          {CAT_LABEL[t.c] ?? t.c} · {pageCount} {pageCount === 1 ? "page" : "pages"}
        </>
      }
      hintExtra={
        <span className="dots" aria-hidden="true">
          <i style={{ background: t.a }} title={t.a} />
          <i style={{ background: t.s }} title={t.s} />
          <i style={{ background: t.i }} title={t.i} />
        </span>
      }
      actions={
        <>
          <Link to={useTemplatePath} className="btn-use" title={`Use template ${t.n}`}>
            Use template →
          </Link>
          <Link to={templatePath} className="btn-preview" title={`Preview ${t.n}`}>
            <TemplateCardEyeIcon size={14} />
            Preview
          </Link>
          <button
            className="btn-fav"
            type="button"
            aria-label={isShortlisted ? `Remove ${t.n} from shortlist` : `Add ${t.n} to shortlist`}
            aria-pressed={isShortlisted}
            onClick={handleHeartClick}
          >
            <svg viewBox="0 0 24 24" fill={isShortlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z" />
            </svg>
          </button>
        </>
      }
    />
  );
}
