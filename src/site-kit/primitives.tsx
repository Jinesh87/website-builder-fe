import type { CSSProperties, ReactNode } from "react";
import { isExternalHref, safeHref } from "./links.ts";
import { sectionFontStyle } from "./theme.ts";
import type { GridColumns, IconName, ImageRef, LinkRef, SectionSettings } from "./types.ts";

type SiteLinkProps = {
  link: LinkRef;
  className?: string;
  children?: ReactNode;
};

export function SiteLink({ link, className, children }: SiteLinkProps) {
  const href = safeHref(link.href);
  const external = isExternalHref(href);
  return (
    <a
      href={href}
      className={className}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children ?? link.label}
    </a>
  );
}

export function SiteButton({ link, tone = "primary" }: { link: LinkRef; tone?: "primary" | "secondary" }) {
  return <SiteLink link={link} className={`wb-btn wb-btn-${tone}`} />;
}

export function SiteImage({
  image,
  className,
  priority = false,
}: {
  image: ImageRef;
  className?: string;
  priority?: boolean;
}) {
  const trimmedAlt = image.alt?.trim();
  const isGeneric = !trimmedAlt || ["image", "hero background", "photo", "picture", "website visual"].includes(trimmedAlt.toLowerCase());
  const alt = !isGeneric ? trimmedAlt : "";
  return (
    <img
      src={image.url}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}

const ICON_PATHS: Record<IconName, ReactNode> = {
  check: <polyline points="20 6 9 17 4 12" />,
  star: (
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  ),
  bolt: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  heart: (
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  ),
  chat: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />,
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </>
  ),
  user: (
    <>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  mail: (
    <>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </>
  ),
  phone: (
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  ),
  chart: (
    <>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </>
  ),
  tools: (
    <>
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </>
  ),
  wallet: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
      <circle cx="17" cy="15" r="1" />
    </>
  ),
  pointer: (
    <>
      <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
      <path d="M13 13l6 6" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>
  ),
  sparkles: (
    <>
      {/* Large 4-point star */}
      <path d="M 8.2 7.0 Q 8.2 14.2 15.4 14.2 Q 8.2 14.2 8.2 21.4 Q 8.2 14.2 1.0 14.2 Q 8.2 14.2 8.2 7.0 Z" />
      {/* Medium 4-point star */}
      <path d="M 15.2 3.2 Q 15.2 6.8 18.8 6.8 Q 15.2 6.8 15.2 10.4 Q 15.2 6.8 11.6 6.8 Q 15.2 6.8 15.2 3.2 Z" opacity="0.9" />
      {/* Small 4-point star */}
      <path d="M 19.8 9.6 Q 19.8 11.8 22.0 11.8 Q 19.8 11.8 19.8 14.0 Q 19.8 11.8 17.6 11.8 Q 19.8 11.8 19.8 9.6 Z" opacity="0.8" />
    </>
  ),
  rocket: (
    <>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
    </>
  ),
  layers: (
    <>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </>
  ),
  box: (
    <>
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </>
  ),
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </>
  ),
  cloud: <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />,
  code: (
    <>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </>
  ),
};

export function SiteIcon({ name }: { name: IconName | string }) {
  const iconPath = ICON_PATHS[name as IconName];
  if (iconPath) {
    return (
      <span className="wb-icon" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {iconPath}
        </svg>
      </span>
    );
  }
  return (
    <span className="wb-icon wb-icon-emoji" aria-hidden="true">
      {name}
    </span>
  );
}

export function MenuIcon({ className = "", style }: { className?: string; style?: CSSProperties } = {}) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className} style={{ width: "1.25em", height: "1.25em", flexShrink: 0, ...style }} aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon({ className = "", style }: { className?: string; style?: CSSProperties } = {}) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ width: "1.25em", height: "1.25em", flexShrink: 0, ...style }} aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export function ChevronDownIcon({ className = "", style }: { className?: string; style?: CSSProperties } = {}) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ width: "1em", height: "1em", flexShrink: 0, ...style }} aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function SearchIcon({ className = "", style }: { className?: string; style?: CSSProperties } = {}) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ width: "1.1em", height: "1.1em", flexShrink: 0, ...style }} aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

export function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function StarFilledIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function BottomShapeDivider({
  shape,
}: {
  shape?: "none" | "wave" | "curve" | "curved" | "slant" | "tilt" | "arch" | "normal";
}) {
  if (!shape || shape === "none" || shape === "normal") return null;
  const normalized = shape === "curved" ? "curve" : shape;
  return (
    <div className={`wb-shape-divider wb-shape-${normalized}`} aria-hidden="true">
      {normalized === "wave" && (
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0 C150,90 350,-40 500,60 C650,160 900,10 1200,40 L1200,120 L0,120 Z" fill="currentColor" />
        </svg>
      )}
      {(normalized === "curve" || normalized === "arch") && (
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0 C400,120 800,120 1200,0 L1200,120 L0,120 Z" fill="currentColor" />
        </svg>
      )}
      {normalized === "slant" && (
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M1200,0 L0,120 L1200,120 Z" fill="currentColor" />
        </svg>
      )}
      {normalized === "tilt" && (
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0 L1200,100 L1200,120 L0,120 Z" fill="currentColor" />
        </svg>
      )}
    </div>
  );
}

export function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  );
}

export function SocialIcon({ platform }: { platform: string }) {
  const p = platform.toLowerCase();
  if (p.includes("facebook") || p.includes("fb")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
      </svg>
    );
  }
  if (p.includes("twitter") || p.includes("x.com") || p === "x") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (p.includes("instagram") || p.includes("insta")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    );
  }
  if (p.includes("pinterest") || p.includes("pin")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026l.032-.026z" />
      </svg>
    );
  }
  if (p.includes("youtube") || p.includes("yt")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 00-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.016 3.016 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  }
  if (p.includes("linkedin")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 10-1.64-1.64 1.64 1.64 0 001.64 1.64m1.39 9.74V9.93H5.07v8.57z" />
      </svg>
    );
  }
  if (p.includes("github")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    );
  }
  // Generic Globe / Link
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}

export function PaymentIconsBar({ methods = ["paypal", "amex", "discover", "mastercard", "visa"] }: { methods?: string[] }) {
  return (
    <div className="wb-payment-badges" aria-label="Accepted payment methods">
      {methods.map((method) => {
        const m = method.toLowerCase();
        return (
          <span key={m} className={`wb-payment-badge wb-pay-${m}`} title={method}>
            {m === "paypal" && <span className="wb-pay-text font-bold text-[#003087]">PayPal</span>}
            {m === "amex" && <span className="wb-pay-text font-bold text-[#006fcf]">AMEX</span>}
            {m === "discover" && <span className="wb-pay-text font-bold text-[#f26522]">DISCOVER</span>}
            {m === "mastercard" && (
              <span className="wb-pay-mc-circles">
                <span className="wb-pay-mc-red" />
                <span className="wb-pay-mc-yellow" />
              </span>
            )}
            {m === "visa" && <span className="wb-pay-text font-black italic text-[#1a1f71]">VISA</span>}
            {m === "applepay" && <span className="wb-pay-text font-semibold"> Pay</span>}
            {!["paypal", "amex", "discover", "mastercard", "visa", "applepay"].includes(m) && (
              <span className="wb-pay-text uppercase text-[10px]">{method}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}

type SectionShellProps = {
  sectionId: string;
  settings: SectionSettings;
  className?: string;
  label?: string;
  children: ReactNode;
  fullWidth?: boolean;
};

export function SectionShell({ sectionId, settings, className, label, children, fullWidth }: SectionShellProps) {
  const customColors = settings.customColors;
  const customStyle: CSSProperties = {
    ...sectionFontStyle(settings.font),
    ...(customColors?.background ? { "--wb-bg": customColors.background, backgroundColor: customColors.background } : {}),
    ...(customColors?.text ? { "--wb-text": customColors.text, color: customColors.text } : {}),
    ...(customColors?.primary ? { "--wb-primary": customColors.primary } : {}),
    ...(customColors?.muted ? { "--wb-muted": customColors.muted } : {}),
    ...(customColors?.border ? { "--wb-border": customColors.border } : {}),
    ...(customColors?.gradientFrom || customColors?.gradientTo
      ? {
          "--wb-gradient": `linear-gradient(135deg, ${customColors.gradientFrom ?? "var(--wb-primary)"}, ${
            customColors.gradientTo ?? customColors.gradientFrom
          })`,
        }
      : {}),
  };

  const classes = [
    "wb-section",
    settings.background !== "default" && !customColors?.background && `wb-bg-${settings.background}`,
    customColors?.text && "wb-custom-text",
    customColors?.muted && "wb-custom-muted",
    settings.spacing && settings.spacing !== "default" && `wb-space-${settings.spacing}`,
    settings.align === "left" && "wb-align-left",
    settings.hideOnMobile && "wb-hide-mobile",
    settings.hideOnDesktop && "wb-hide-desktop",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      className={classes}
      id={settings.anchor || undefined}
      data-section-id={sectionId}
      aria-label={label}
      style={Object.keys(customStyle).length > 0 ? customStyle : undefined}
    >
      <div className={fullWidth ? "wb-container-full" : "wb-container"}>{children}</div>
    </section>
  );
}

export function parseRichText(text?: string | null): ReactNode {
  if (!text) return text ?? null;
  if (!text.includes("<") && !text.includes("**") && !text.includes("*")) {
    return text;
  }

  // Regex to match <span style="..." class="...">...</span>, <strong>, <em>, <mark>, <br>, etc.
  const tagRegex =
    /<span(?:\s+style=(['"])(.*?)\1|\s+class=(['"])(.*?)\3|[^>])*>(.*?)<\/span>|<strong>(.*?)<\/strong>|<b>(.*?)<\/b>|<em>(.*?)<\/em>|<i>(.*?)<\/i>|<mark>(.*?)<\/mark>|<br\s*\/?>/gis;

  const elements: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index));
    }

    const fullMatch = match[0];
    const styleAttr = match[2];
    const classAttr = match[4];
    const spanContent = match[5];
    const strongContent = match[6] ?? match[7];
    const emContent = match[8] ?? match[9];
    const markContent = match[10];

    if (spanContent !== undefined) {
      const inlineStyle: CSSProperties = {};
      if (styleAttr) {
        const styleRules = styleAttr.split(";");
        for (const rule of styleRules) {
          const [prop, val] = rule.split(":").map((s) => s.trim());
          if (prop && val) {
            if (prop === "color") inlineStyle.color = val;
            if (prop === "background-color" || prop === "background") inlineStyle.background = val;
            if (prop === "font-weight") inlineStyle.fontWeight = val as CSSProperties["fontWeight"];
            if (prop === "font-style") inlineStyle.fontStyle = val as CSSProperties["fontStyle"];
            if (prop === "text-decoration") inlineStyle.textDecoration = val;
          }
        }
      }
      elements.push(
        <span key={elements.length} style={inlineStyle} className={classAttr}>
          {parseRichText(spanContent)}
        </span>,
      );
    } else if (strongContent !== undefined) {
      elements.push(<strong key={elements.length}>{parseRichText(strongContent)}</strong>);
    } else if (emContent !== undefined) {
      elements.push(<em key={elements.length}>{parseRichText(emContent)}</em>);
    } else if (markContent !== undefined) {
      elements.push(
        <mark key={elements.length} className="wb-text-gradient">
          {parseRichText(markContent)}
        </mark>,
      );
    } else if (fullMatch.toLowerCase().startsWith("<br")) {
      elements.push(<br key={elements.length} />);
    }

    lastIndex = tagRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }

  return elements.length > 0 ? <>{elements}</> : text;
}

export function SectionHead({ heading, intro, eyebrow }: { heading?: string; intro?: string; eyebrow?: string }) {
  if (!heading && !intro && !eyebrow) return null;
  return (
    <div className="wb-section-head">
      {eyebrow && <p className="wb-eyebrow">{parseRichText(eyebrow)}</p>}
      {heading && <h2>{parseRichText(heading)}</h2>}
      {intro && <p className="wb-muted">{parseRichText(intro)}</p>}
    </div>
  );
}

export function gridStyle(columns: GridColumns, mobileColumns: GridColumns): CSSProperties {
  return {
    "--wb-cols": columns,
    "--wb-cols-tablet": Math.min(columns, 2),
    "--wb-cols-mobile": Math.min(mobileColumns, columns),
  } as CSSProperties;
}
