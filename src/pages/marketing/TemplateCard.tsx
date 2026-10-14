import { TPLS } from "./data.ts";
import { useMarketing } from "./marketing-context.ts";
import { TemplateFrame } from "./MiniSite.tsx";

export default function TemplateCard({ index }: { index: number }) {
  const { previewTemplate, startWithTemplate } = useMarketing();
  const t = TPLS[index];
  return (
    <div className="card tpl">
      <div className="shot">
        <button className="shotbtn" type="button" aria-label={`Preview ${t.n}`} onClick={() => previewTemplate(index)}>
          <TemplateFrame t={index} />
        </button>
      </div>
      <div className="meta">
        <div className="row">
          <h3 style={{ fontSize: "17px" }}>{t.n}</h3>
          <span className={`tag c${t.c.replace(/ /g, "")}`}>{t.c}</span>
        </div>
        <p className="hint">Pages: {t.pages}</p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn" type="button" style={{ flex: 1 }} onClick={() => previewTemplate(index)}>
            Preview
          </button>
          <button className="btn p" type="button" style={{ flex: 1 }} onClick={() => startWithTemplate(index)}>
            Use template
          </button>
        </div>
      </div>
    </div>
  );
}
