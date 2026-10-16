import { Link } from "react-router-dom";
import { TPLS, CAT_LABEL } from "./data.ts";
import { useMarketing } from "./marketing-context.ts";
import { TemplateFrame } from "./MiniSite.tsx";
import "./templates-gallery.css";

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

  const templateDomain = `${(t.biz || t.n).toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;

  return (
    <article className="tcard">
      <Link
        to={templatePath}
        className="tcard-thumb"
        aria-label={`Open ${t.n} (ID: ${t.id})`}
      >
        {/* Browser Mockup Chrome Bar */}
        <div className="tcard-browser-bar">
          <div className="tcard-dots">
            <span className="dot dot-r" />
            <span className="dot dot-y" />
            <span className="dot dot-g" />
          </div>
          <div className="tcard-url-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="tcard-lock" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="tcard-url-text">{templateDomain}</span>
          </div>
          <span className="tcard-badge-pill">{t.style ?? "2026"}</span>
        </div>

        {/* Viewport Area */}
        <div className="tcard-viewport">
          <TemplateFrame t={index} />
        </div>

        {/* Floating Hover Glass Pill */}
        <div className="tcard-ov">
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Live Preview
          </span>
        </div>
      </Link>

      <div className="tmeta">
        <div className="trow">
          <div className="tname-wrap">
            <Link
              to={templatePath}
              className="tname"
              title={`${t.n} (ID: ${t.id})`}
            >
              {t.n}
            </Link>
            <span className="tid-badge">#{t.id}</span>
          </div>
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
            className="btn-preview"
            title={`Preview ${t.n}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: 14, height: 14 }}>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Preview
          </Link>
          <Link
            to={templatePath}
            className="btn-use"
            title={`Preview and use ${t.n}`}
          >
            Use template →
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
        </div>
      </div>
    </article>
  );
}
