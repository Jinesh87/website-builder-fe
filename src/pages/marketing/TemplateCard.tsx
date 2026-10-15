import { Link } from "react-router-dom";
import { TPLS, CAT_LABEL } from "./data.ts";
import { useMarketing } from "./marketing-context.ts";
import { TemplateFrame } from "./MiniSite.tsx";

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
  const pagesList = t.pages.split(", ");
  const pageCount = pagesList.length;
  const templatePath = `/templates/${t.id}`;

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
    <article className="tcard">
      <Link
        to={templatePath}
        className="tcard-thumb"
        aria-label={`Open ${t.n} (ID: ${t.id})`}
      >
        <TemplateFrame t={index} />
        <div className="tcard-ov">
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
            </svg>
            Expand preview
          </span>
        </div>
      </Link>

      <div className="tmeta">
        <div className="trow">
          <Link
            to={templatePath}
            className="tname"
            title={`${t.n} (ID: ${t.id})`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            {t.n}
          </Link>
          <span className={`tag ${styleClass}`}>
            {t.style ?? "Classic"}
          </span>
        </div>

        <div className="trow">
          <span className="thint">
            {CAT_LABEL[t.c] ?? t.c} · {pageCount} {pageCount === 1 ? "page" : "pages"}
          </span>
          <span className="dots" aria-hidden="true">
            <i style={{ background: t.a }} title={t.a} />
            <i style={{ background: t.s }} title={t.s} />
            <i style={{ background: t.i }} title={t.i} />
          </span>
        </div>

        <div className="tacts">
          <Link
            to={templatePath}
            className="btn-details"
            title={`Open template (ID: ${t.id})`}
          >
            ID: {t.id}
          </Link>
          <Link
            to={templatePath}
            className="btn-use"
            title={`Preview and use ${t.n}`}
          >
            Use template
          </Link>
          <button
            className="btn-fav"
            type="button"
            aria-label={isShortlisted ? `Remove ${t.n} from shortlist` : `Add ${t.n} to shortlist`}
            aria-pressed={isShortlisted}
            onClick={handleHeartClick}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
