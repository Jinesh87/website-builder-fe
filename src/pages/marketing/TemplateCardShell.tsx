import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import "./templates-gallery.css";

type TemplateCardShellProps = {
  name: string;
  /** Where the thumbnail and the name lead. */
  href: string;
  /** Opens `href` in a new tab instead of navigating in place. */
  newTab?: boolean;
  /** Accessible name of the thumbnail link. */
  thumbnailLabel: string;
  /** Tooltip on the name; defaults to the name. */
  nameTitle?: string;
  /** Shown in the mock browser's address bar. */
  domain: string;
  /** Small label at the right of the mock browser bar. */
  badge: ReactNode;
  thumbnail: ReactNode;
  /** Text in the pill that appears over the thumbnail on hover. */
  overlayLabel?: string;
  /** After the name, e.g. the template ID. */
  nameExtra?: ReactNode;
  /** Right of the name, e.g. the style tag. */
  tag?: ReactNode;
  /** Category and page count line. */
  hint: ReactNode;
  /** Right of the hint, e.g. colour dots. */
  hintExtra?: ReactNode;
  /** Buttons for the bottom row. */
  actions: ReactNode;
};

function CardLink({ href, newTab, className, label, title, children }: {
  href: string;
  newTab?: boolean;
  className: string;
  label?: string;
  title?: string;
  children: ReactNode;
}) {
  if (newTab) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className} aria-label={label} title={title}>
        {children}
      </a>
    );
  }
  return (
    <Link to={href} className={className} aria-label={label} title={title}>
      {children}
    </Link>
  );
}

/**
 * Thumbnails are full home pages, so they mount only once the card nears the viewport;
 * this also defers any preview request a thumbnail makes on mount.
 */
function DeferredViewport({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === "undefined");

  useEffect(() => {
    const node = ref.current;
    if (visible || !node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div ref={ref} className="tcard-viewport">
      {visible ? children : null}
    </div>
  );
}

export function TemplateCardEyeIcon({ size }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={size ? { width: size, height: size } : undefined}
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/** Gallery card frame shared by the marketing gallery and the admin template library. */
export default function TemplateCardShell({
  name,
  href,
  newTab,
  thumbnailLabel,
  nameTitle,
  domain,
  badge,
  thumbnail,
  overlayLabel = "Live Preview",
  nameExtra,
  tag,
  hint,
  hintExtra,
  actions,
}: TemplateCardShellProps) {
  return (
    <article className="tcard">
      <CardLink href={href} newTab={newTab} className="tcard-thumb" label={thumbnailLabel}>
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
            <span className="tcard-url-text">{domain}</span>
          </div>
          <span className="tcard-badge-pill">{badge}</span>
        </div>

        <DeferredViewport>{thumbnail}</DeferredViewport>

        <div className="tcard-ov">
          <span>
            <TemplateCardEyeIcon />
            {overlayLabel}
          </span>
        </div>
      </CardLink>

      <div className="tmeta">
        <div className="trow">
          <div className="tname-wrap">
            <CardLink href={href} newTab={newTab} className="tname" title={nameTitle ?? name}>
              {name}
            </CardLink>
            {nameExtra}
          </div>
          {tag}
        </div>

        <div className="trow">
          <span className="thint">{hint}</span>
          {hintExtra}
        </div>

        <div className="tacts">{actions}</div>
      </div>
    </article>
  );
}

/** "Bright Smile Dental" → "brightsmiledental.com", for the mock address bar. */
export function templateDomain(name: string): string {
  return `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
}
