import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SitePage, SiteStyles, type SiteData } from "../../site-kit/index.ts";
import { getTemplateSite } from "../../site-kit/templates/index.ts";
import { ART } from "./art.tsx";
import { TPLS, type Template } from "./data.ts";

export type SitePart = "nav" | "hero" | "cards" | "band";

interface MiniSiteProps {
  t: Template;
  mobile?: boolean;
  /** Overrides the template accent colour */
  accent?: string;
  /** Section outlined as selected, like in the editor */
  selected?: SitePart;
  /** While generating, only `shown` parts are visible */
  generating?: boolean;
  shown?: SitePart[];
  style?: CSSProperties;
}

/** A small sample website drawn from a template, laid out at 1200px wide. */
export function MiniSite({ t, mobile, accent, selected, generating, shown = [], style }: MiniSiteProps) {
  const dark = !/^#F/i.test(t.b);
  const line = dark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.08)";
  const line2 = dark ? "rgba(255,255,255,.35)" : "rgba(0,0,0,.25)";
  const vars = {
    "--b": t.b,
    "--i": t.i,
    "--a": accent ?? t.a,
    "--o": t.o,
    "--s": t.s,
    "--l": line,
    "--l2": line2,
    "--f": `${t.f},system-ui,sans-serif`,
    "--hf": `${t.hf},Georgia,serif`,
    "--rad": t.rad,
    ...style,
  } as CSSProperties;
  const pages = t.pages.split(", ");
  const part = (key: SitePart, base: string) =>
    [base, selected === key && "sel", shown.includes(key) && "show"].filter(Boolean).join(" ");

  return (
    <div
      className={[
        "ts",
        mobile && "m",
        generating && "gen",
        t.L && `L${t.L}`,
        t.C && `C${t.C}`,
        dark && "dk",
      ]
        .filter(Boolean)
        .join(" ")}
      style={vars}
      aria-hidden="true"
    >
      <div className={part("nav", "ts-nav")}>
        <div className="ts-logo">
          <i />
          {t.biz}
        </div>
        <nav>
          <span>Home</span>
          {pages.slice(1, 4).map((page) => (
            <span key={page}>{page}</span>
          ))}
        </nav>
        <span className="ts-btn">{t.cta}</span>
        <span className="ts-burger" />
      </div>
      <div className={part("hero", "ts-hero")} data-s="hero">
        <div className="ts-copy">
          <span className="ts-eye">{t.eye}</span>
          <h1>{t.h}</h1>
          <p>{t.p}</p>
          <div className="ts-row">
            <span className="ts-btn">{t.cta}</span>
            <span className="ts-btn o">Learn more</span>
          </div>
        </div>
        <div className="ts-visual">
          <div className="ts-art">
            <svg viewBox="0 0 480 360">{ART[t.art] ? ART[t.art](accent ?? t.a, t.s, t.i, t.b) : null}</svg>
          </div>
        </div>
      </div>
      <div className={part("cards", "ts-sec")} data-s="cards">
        <h2>{t.sec}</h2>
        <div className="ts-grid">
          {t.cards.map(([title, text]) => (
            <div className="ts-card" key={title}>
              <i />
              <b>{title}</b>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={part("band", "ts-band")} data-s="band">
        <h3>{t.band}</h3>
        <span className="ts-btn">{t.cta}</span>
      </div>
      <div className="ts-foot">
        © {t.biz} · {pages.join(" · ")}
      </div>
    </div>
  );
}

interface TemplateFrameProps extends Omit<MiniSiteProps, "t" | "mobile" | "style"> {
  /** Index into TPLS */
  t: number;
  className?: string;
  label?: string;
}

const homeMarkupCache = new Map<string, string>();
const MARKUP_VERSION = "2026-v4";

/**
 * Static HTML of a template's real home page. Rendered as markup rather than live
 * components so the thumbnail can sit inside links and buttons without nesting them.
 */
function templateHomeMarkup(templateId: string, site: SiteData): string {
  const cacheKey = `${templateId}-${MARKUP_VERSION}`;
  let markup = homeMarkupCache.get(cacheKey);
  if (markup === undefined) {
    markup = renderToStaticMarkup(
      <>
        <SiteStyles />
        <SitePage site={site} page={site.pages[0]} />
      </>,
    );
    homeMarkupCache.set(cacheKey, markup);
  }
  return markup;
}

/** A 4:3 frame that scales the 1200px mini site (or the template's real home page) down to its own width. */
export function TemplateFrame({ t, className, label, ...siteProps }: TemplateFrameProps) {
  const ref = useRef<HTMLDivElement>(null);
  const template = TPLS[t];
  const animated = Boolean(siteProps.generating || siteProps.selected || siteProps.accent);
  const realSite = animated ? null : getTemplateSite(template.id);
  const [scale, setScale] = useState<number | null>(null);

  useLayoutEffect(() => {
    const frame = ref.current;
    if (!frame) return;
    const fit = () => setScale(frame.clientWidth / 1200);
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const scaleStyle = scale === null ? undefined : { transform: `scale(${scale})` };

  return (
    <div ref={ref} className={className ? `${className} tframe` : "tframe"} aria-label={label}>
      {realSite ? (
        <div
          className="tsite"
          style={scaleStyle}
          aria-hidden="true"
          inert
          dangerouslySetInnerHTML={{ __html: templateHomeMarkup(template.id, realSite) }}
        />
      ) : (
        <MiniSite t={template} style={scaleStyle} {...siteProps} />
      )}
    </div>
  );
}

export function MediaTile({ art }: { art: string }) {
  const [kind, accent, soft, ink, bg] = art.split("|");
  return (
    <div className="mtile" data-art={art}>
      <svg viewBox="0 0 480 360" aria-hidden="true">
        {ART[kind](accent, soft, ink, bg)}
      </svg>
    </div>
  );
}
