import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
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
  const line = t.b.toUpperCase() === "#FFFFFF" || t.b.startsWith("#F") ? "rgba(0,0,0,.08)" : "rgba(255,255,255,.1)";
  const line2 = t.b.startsWith("#F") ? "rgba(0,0,0,.25)" : "rgba(255,255,255,.35)";
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
      className={["ts", mobile && "m", generating && "gen"].filter(Boolean).join(" ")}
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
        <div>
          <span className="ts-eye">{t.eye}</span>
          <h1>{t.h}</h1>
          <p>{t.p}</p>
          <div className="ts-row">
            <span className="ts-btn">{t.cta}</span>
            <span className="ts-btn o">Learn more</span>
          </div>
        </div>
        <div className="ts-art">
          <svg viewBox="0 0 480 360">{ART[t.art](t.a, t.s, t.i, t.b)}</svg>
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

/** A 4:3 frame that scales the 1200px mini site down to its own width. */
export function TemplateFrame({ t, className, label, ...siteProps }: TemplateFrameProps) {
  const ref = useRef<HTMLDivElement>(null);
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

  return (
    <div ref={ref} className={className ? `${className} tframe` : "tframe"} aria-label={label}>
      <MiniSite t={TPLS[t]} style={scale === null ? undefined : { transform: `scale(${scale})` }} {...siteProps} />
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
