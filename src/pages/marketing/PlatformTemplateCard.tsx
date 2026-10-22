import { Link } from "react-router-dom";
import type { WebsiteTemplate } from "../../api/websites.ts";
import TemplateThumbnail from "../../components/websites/TemplateThumbnail.tsx";
import { CAT_LABEL } from "./data.ts";
import "./templates-gallery.css";

interface PlatformTemplateCardProps {
  template: WebsiteTemplate;
}

/** Card for a platform template without a curated marketing design; previews its live home page. */
export default function PlatformTemplateCard({ template }: PlatformTemplateCardProps) {
  const templatePath = `/templates/${encodeURIComponent(template.key)}`;
  const useTemplatePath = `/websites/new?templateKey=${encodeURIComponent(template.key)}`;
  const pageCount = template.pages.length;
  const templateDomain = `${template.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;

  return (
    <article className="tcard">
      <Link to={templatePath} className="tcard-thumb" aria-label={`Open ${template.name}`}>
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
          <span className="tcard-badge-pill">{template.category}</span>
        </div>

        <div className="tcard-viewport">
          <TemplateThumbnail template={template} />
        </div>

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
            <Link to={templatePath} className="tname" title={template.name}>
              {template.name}
            </Link>
          </div>
        </div>

        <div className="trow">
          <span className="thint">
            {CAT_LABEL[template.category] ?? template.category} · {pageCount} {pageCount === 1 ? "page" : "pages"}
          </span>
        </div>

        <div className="tacts">
          <Link to={templatePath} className="btn-preview" title={`Preview ${template.name}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: 14, height: 14 }}>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Preview
          </Link>
          <Link to={useTemplatePath} className="btn-use" title={`Use template ${template.name}`}>
            Use template →
          </Link>
        </div>
      </div>
    </article>
  );
}
