import { Link } from "react-router-dom";
import type { WebsiteTemplate } from "../../api/websites.ts";
import TemplateThumbnail from "../../components/websites/TemplateThumbnail.tsx";
import { CAT_LABEL } from "./data.ts";
import TemplateCardShell, { TemplateCardEyeIcon, templateDomain } from "./TemplateCardShell.tsx";

interface PlatformTemplateCardProps {
  template: WebsiteTemplate;
}

/** Card for a platform template without a curated marketing design; previews its live home page. */
export default function PlatformTemplateCard({ template }: PlatformTemplateCardProps) {
  const templatePath = `/templates/${encodeURIComponent(template.key)}`;
  const useTemplatePath = `/websites/new?templateKey=${encodeURIComponent(template.key)}`;
  const pageCount = template.pages.length;

  return (
    <TemplateCardShell
      name={template.name}
      href={templatePath}
      thumbnailLabel={`Open ${template.name}`}
      domain={templateDomain(template.name)}
      badge={template.category}
      thumbnail={<TemplateThumbnail template={template} />}
      hint={
        <>
          {CAT_LABEL[template.category] ?? template.category} · {pageCount} {pageCount === 1 ? "page" : "pages"}
        </>
      }
      actions={
        <>
          <Link to={templatePath} className="btn-preview" title={`Preview ${template.name}`}>
            <TemplateCardEyeIcon size={14} />
            Preview
          </Link>
          <Link to={useTemplatePath} className="btn-use" title={`Use template ${template.name}`}>
            Use template →
          </Link>
        </>
      }
    />
  );
}
