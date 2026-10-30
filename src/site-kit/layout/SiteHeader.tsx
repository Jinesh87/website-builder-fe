import { parseRichText } from "../rich-text.tsx";
import { useState, type CSSProperties, type ReactNode } from "react";
import { useIsCurrentPage } from "../current-page.ts";
import { useStaticRender } from "../render-mode.tsx";
import {
  ChevronDownIcon,
  CloseIcon,
  EmailLink,
  MenuIcon,
  SearchIcon,
  SiteButton,
  SiteImage,
  SiteLink,
} from "../primitives.tsx";
import { useShopCatalog } from "../shop-catalog.tsx";
import type { BrandDisplayMode, HeaderData, HeaderMenuItem, ImageRef, LinkRef, SectionSettings } from "../types.ts";
import { chromeStyle } from "./chrome.ts";

function normalizeSitePath(href: string | undefined): string {
  const raw = (href || "").trim().split("?")[0].split("#")[0];
  const withoutLive = raw.replace(/^\/live\/[^/]+/i, "");
  const path = (withoutLive.startsWith("/") ? withoutLive : `/${withoutLive}`).replace(/\/+$/, "");
  return path || "/";
}

/** Header CTAs that open the shop login page should disappear once the customer is signed in. */
function isShopLoginLink(link: LinkRef | undefined, authHref: string): boolean {
  if (!link?.href) return false;
  const path = normalizeSitePath(link.href);
  const auth = normalizeSitePath(authHref || "/login");
  if (path === auth) return true;
  if (path === "/login" || path.endsWith("/login")) return true;
  const label = (link.label || "").trim().toLowerCase();
  return label === "login" || label === "log in" || label === "sign in";
}

function HeaderCtaButton({ link, tone }: { link: LinkRef; tone: "primary" | "secondary" }) {
  const catalog = useShopCatalog();
  const hideWhenAuthed = Boolean(catalog?.live && catalog.websiteId && isShopLoginLink(link, catalog.authHref || "/login"));
  return <SiteButton link={link} tone={tone} hideWhenAuthed={hideWhenAuthed} />;
}

export function SiteBrand({
  siteName,
  logo,
  displayMode = "auto",
  className = "",
  logoHeight,
}: {
  siteName: string;
  logo?: ImageRef;
  displayMode?: BrandDisplayMode;
  className?: string;
  logoHeight?: number;
}) {
  const hasLogo = Boolean(logo?.url);
  const mode = displayMode ?? "auto";

  const resolvedHeight = typeof logoHeight === "number" && logoHeight > 0 ? logoHeight : undefined;
  const imageStyle: CSSProperties | undefined = resolvedHeight
    ? {
        height: `${resolvedHeight}px`,
        maxHeight: `${resolvedHeight}px`,
        width: "auto",
        objectFit: "contain",
      }
    : undefined;

  let content: ReactNode = null;

  if (mode === "text_only" || (!hasLogo && mode !== "logo_only")) {
    content = <span className="wb-brand-text">{siteName}</span>;
  } else if (mode === "logo_only") {
    content = hasLogo ? <SiteImage image={logo!} style={imageStyle} /> : <span className="wb-brand-text">{siteName}</span>;
  } else if (mode === "logo_right") {
    content = (
      <span className="wb-brand-combo wb-brand-logo-right">
        {siteName && <span className="wb-brand-text">{siteName}</span>}
        {hasLogo && <SiteImage image={logo!} style={imageStyle} />}
      </span>
    );
  } else if (mode === "logo_top") {
    content = (
      <span className="wb-brand-combo wb-brand-logo-top">
        {hasLogo && <SiteImage image={logo!} style={imageStyle} />}
        {siteName && <span className="wb-brand-text">{siteName}</span>}
      </span>
    );
  } else if (mode === "logo_left") {
    content = (
      <span className="wb-brand-combo wb-brand-logo-left">
        {hasLogo && <SiteImage image={logo!} style={imageStyle} />}
        {siteName && <span className="wb-brand-text">{siteName}</span>}
      </span>
    );
  } else {
    content = hasLogo ? <SiteImage image={logo!} style={imageStyle} /> : <span className="wb-brand-text">{siteName}</span>;
  }

  return (
    <a
      href="/"
      className={`wb-brand ${className}`.trim()}
      style={resolvedHeight ? ({ "--wb-logo-height": `${resolvedHeight}px` } as CSSProperties) : undefined}
    >
      {content}
    </a>
  );
}

function NavItem({ item }: { item: HeaderMenuItem }) {
  const isCurrent = useIsCurrentPage(item.href);
  if (item.children && item.children.length > 0) {
    return (
      <div className="wb-dropdown">
        <button type="button" className="wb-dropdown-trigger" aria-haspopup="true">
          <span>{item.label}</span>
          {item.badge && <span className="wb-badge">{item.badge}</span>}
          <ChevronDownIcon />
        </button>
        <div className="wb-dropdown-menu" role="menu">
          {item.children.map((sub) => (
            <a key={`${sub.label}-${sub.href}`} href={sub.href} className="wb-dropdown-item" role="menuitem">
              <span className="wb-dropdown-item-title">
                <span>{sub.label}</span>
                {sub.badge && <span className="wb-badge">{sub.badge}</span>}
              </span>
              {sub.description && <span className="wb-dropdown-desc">{parseRichText(sub.description)}</span>}
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0" data-wb-current={isCurrent || undefined}>
      <SiteLink link={item} />
      {item.badge && <span className="wb-badge">{item.badge}</span>}
    </span>
  );
}

function MegaNavItem({ item }: { item: HeaderMenuItem }) {
  if (item.children && item.children.length > 0) {
    const half = Math.ceil(item.children.length / 2);
    const col1 = item.children.slice(0, half);
    const col2 = item.children.slice(half);

    return (
      <div className="wb-mega-nav-item wb-mega-dropdown">
        <button type="button" className="wb-mega-trigger-btn wb-dropdown-trigger wb-mega-trigger" aria-haspopup="true">
          <span>{item.label}</span>
          {item.badge && <span className="wb-badge">{item.badge}</span>}
          <ChevronDownIcon style={{ width: "13px", height: "13px" }} />
        </button>
        <div className="wb-mega-panel wb-mega-menu-panel" role="menu">
          <div className="wb-mega-panel-grid wb-mega-grid-inner">
            <div className="wb-mega-column">
              <span className="wb-mega-col-title">Overview</span>
              {col1.map((sub) => (
                <a key={`${sub.label}-${sub.href}`} href={sub.href} className="wb-mega-link-card wb-mega-item" role="menuitem">
                  <div className="wb-mega-link-title">
                    <span>{sub.label}</span>
                    {sub.badge && <span className="wb-badge">{sub.badge}</span>}
                  </div>
                  {sub.description && <div className="wb-mega-link-desc">{parseRichText(sub.description)}</div>}
                </a>
              ))}
            </div>
            <div className="wb-mega-column">
              <span className="wb-mega-col-title">Features</span>
              {col2.length > 0 ? (
                col2.map((sub) => (
                  <a key={`${sub.label}-${sub.href}`} href={sub.href} className="wb-mega-link-card wb-mega-item" role="menuitem">
                    <div className="wb-mega-link-title">
                      <span>{sub.label}</span>
                      {sub.badge && <span className="wb-badge">{sub.badge}</span>}
                    </div>
                    {sub.description && <div className="wb-mega-link-desc">{parseRichText(sub.description)}</div>}
                  </a>
                ))
              ) : (
                <a href={item.href} className="wb-mega-link-card wb-mega-item" role="menuitem">
                  <div className="wb-mega-link-title">
                    <span>All Capabilities</span>
                  </div>
                  <div className="wb-mega-link-desc">Explore the full catalog and platform integrations.</div>
                </a>
              )}
            </div>
            <div className="wb-mega-featured-card wb-mega-showcase-col">
              <div>
                <span className="wb-mega-featured-badge">FEATURED RELEASE</span>
                <h4 className="wb-mega-featured-title">Next-Gen Architecture 2026</h4>
                <p className="wb-mega-featured-desc">
                  Sub-second rendering, unified design tokens, and automated global deployment.
                </p>
              </div>
              <a href={item.href} className="wb-mega-featured-action">
                Explore documentation &rarr;
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <NavItem item={item} />;
}

function ActionButtons({ header }: { header: HeaderData }) {
  if (!header.cta && !header.secondaryCta) return null;
  return (
    <div className="wb-header-cta">
      {header.secondaryCta && <HeaderCtaButton link={header.secondaryCta} tone="secondary" />}
      {header.cta && <HeaderCtaButton link={header.cta} tone="primary" />}
    </div>
  );
}

function MobileDrawer({
  isOpen,
  onClose,
  header,
}: {
  isOpen: boolean;
  onClose: () => void;
  header: HeaderData;
}) {
  const isStatic = useStaticRender();
  if (!isOpen && !isStatic) return null;

  return (
    <div className="wb-drawer-portal" data-wb-menu="" hidden={!isOpen}>
      <div className="wb-drawer-backdrop" onClick={onClose} aria-hidden="true" data-wb-menu-close="" />
      <div className="wb-drawer-panel" role="dialog" aria-modal="true" aria-label="Navigation Menu">
        {/* Drawer Header: Brand + Clear Close X Button */}
        <div className="wb-drawer-header">
          <SiteBrand
            siteName={header.siteName}
            logo={header.logo}
            displayMode={header.logoDisplay}
            logoHeight={header.logoHeight ?? header.logoSize}
          />
          <button
            type="button"
            onClick={onClose}
            className="wb-drawer-close-btn"
            data-wb-menu-close=""
            aria-label="Close navigation menu"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Drawer Body: Navigation Items & Submenus */}
        <div className="wb-drawer-body">
          <nav className="wb-drawer-nav" aria-label="Mobile Navigation">
            {header.menu.map((item) => (
              <div key={`${item.label}-${item.href}`} className="wb-drawer-item-group">
                <a
                  href={item.href}
                  onClick={onClose}
                  className="wb-drawer-link"
                >
                  <span>{item.label}</span>
                  {item.badge && <span className="wb-badge">{item.badge}</span>}
                </a>
                {item.children && item.children.length > 0 && (
                  <div className="wb-drawer-submenu">
                    {item.children.map((sub) => (
                      <a
                        key={`${sub.label}-${sub.href}`}
                        href={sub.href}
                        onClick={onClose}
                        className="wb-drawer-sublink"
                      >
                        <span className="wb-drawer-sublink-title">
                          <span>{sub.label}</span>
                          {sub.badge && <span className="wb-badge ml-1.5">{sub.badge}</span>}
                        </span>
                        {sub.description && (
                          <span className="wb-drawer-sublink-desc">{parseRichText(sub.description)}</span>
                        )}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Drawer Footer Actions */}
          {(header.secondaryCta || header.cta) && (
            <div className="wb-drawer-actions">
              {header.secondaryCta && (
                <div onClick={onClose}>
                  <HeaderCtaButton link={header.secondaryCta} tone="secondary" />
                </div>
              )}
              {header.cta && (
                <div onClick={onClose}>
                  <HeaderCtaButton link={header.cta} tone="primary" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EditorialCurtainDrawer({
  isOpen,
  onClose,
  header,
}: {
  isOpen: boolean;
  onClose: () => void;
  header: HeaderData;
}) {
  const isStatic = useStaticRender();
  if (!isOpen && !isStatic) return null;

  return (
    <div className="wb-curtain-portal" data-wb-menu="" hidden={!isOpen}>
      <div className="wb-curtain-backdrop" onClick={onClose} aria-hidden="true" data-wb-menu-close="" />
      <div className="wb-curtain-panel" role="dialog" aria-modal="true" aria-label="Explore Menu">
        <div className="wb-curtain-header">
          <SiteBrand
            siteName={header.siteName}
            logo={header.logo}
            displayMode={header.logoDisplay}
            logoHeight={header.logoHeight ?? header.logoSize}
          />
          <button
            type="button"
            onClick={onClose}
            className="wb-curtain-close-btn"
            data-wb-menu-close=""
            aria-label="Close navigation curtain"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="wb-curtain-body">
          <nav className="wb-curtain-nav" aria-label="Editorial Navigation">
            {header.menu.map((item, idx) => (
              <a
                key={`${item.label}-${item.href}`}
                href={item.href}
                onClick={onClose}
                className="wb-curtain-link"
              >
                <span className="wb-curtain-link-num">0{idx + 1}</span>
                <span className="wb-curtain-link-text">{item.label}</span>
                {item.badge && <span className="wb-badge ml-3">{item.badge}</span>}
              </a>
            ))}
          </nav>
          <div className="wb-curtain-footer">
            {header.contactEmail?.trim() && (
              <div className="wb-curtain-meta">
                <span className="wb-curtain-meta-title">{header.contactLabel || "Get in touch"}</span>
                <EmailLink value={header.contactEmail} className="wb-curtain-email" />
              </div>
            )}
            {(header.cta || header.secondaryCta) && (
              <div className="wb-curtain-actions">
                {header.secondaryCta && (
                  <div onClick={onClose}>
                    <HeaderCtaButton link={header.secondaryCta} tone="secondary" />
                  </div>
                )}
                {header.cta && (
                  <div onClick={onClose}>
                    <HeaderCtaButton link={header.cta} tone="primary" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SiteHeader({ header, settings }: { header: HeaderData; settings?: Partial<SectionSettings> }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  if (header.hidden) return null;

  const position = header.position ?? (header.sticky ? "sticky" : "static");

  let posClass = "wb-pos-static";
  if (position === "fixed") {
    posClass = "wb-pos-fixed";
  } else if (position === "floating") {
    posClass = "wb-pos-floating";
  } else if (position === "sticky") {
    posClass = "wb-pos-sticky";
  }

  const isTransparent = position === "static" && (header.design === "transparent" || header.overlay);
  const designClass = isTransparent ? "wb-header-transparent" : `wb-header-${header.design}`;
  const chrome = chromeStyle(settings);
  const navAlign = header.navAlign ?? settings?.align;
  const classes = [
    "wb-header",
    designClass,
    posClass,
    navAlign && `wb-nav-align-${navAlign}`,
    chrome.className,
  ]
    .filter(Boolean)
    .join(" ");

  const brand = (
    <SiteBrand
      siteName={header.siteName}
      logo={header.logo}
      displayMode={header.logoDisplay}
      logoHeight={header.logoHeight ?? header.logoSize}
    />
  );

  const announcement = header.announcement && (
    <div className="wb-announcement">
      <span>{header.announcement}</span>
      {header.announcementLink && (
        <a href={header.announcementLink.href}>{header.announcementLink.label} &rarr;</a>
      )}
    </div>
  );

  const mobileToggle = (
    <button
      type="button"
      onClick={() => setMobileOpen(true)}
      className="wb-mobile-toggle-btn"
      data-wb-menu-open=""
      aria-label="Open menu"
    >
      <MenuIcon />
    </button>
  );

  // =========================================================================
  // 1. FLOATING PILL DESIGN (Existing)
  // =========================================================================
  if (header.design === "floating") {
    return (
      <>
        {announcement}
        <header className={classes} style={chrome.style}>
          <div className="wb-header-floating-pill">
            {brand}
            {header.menu.length > 0 && (
              <nav className="wb-nav" aria-label="Main">
                {header.menu.map((item) => (
                  <NavItem key={`${item.label}-${item.href}`} item={item} />
                ))}
              </nav>
            )}
            <div className="wb-header-actions">
              <ActionButtons header={header} />
              {mobileToggle}
            </div>
          </div>
        </header>
        <MobileDrawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} header={header} />
      </>
    );
  }

  // =========================================================================
  // 2. MINIMALIST DESIGN (Existing)
  // =========================================================================
  if (header.design === "minimalist") {
    return (
      <>
        {announcement}
        <header className={classes} style={chrome.style}>
          <div className="wb-container wb-header-inner">
            <div className="wb-nav-left">
              {header.menu.map((item) => (
                <NavItem key={`${item.label}-${item.href}`} item={item} />
              ))}
            </div>
            <div className="wb-brand-center">{brand}</div>
            <div className="wb-actions-right">
              <ActionButtons header={header} />
              {mobileToggle}
            </div>
          </div>
        </header>
        <MobileDrawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} header={header} />
      </>
    );
  }

  // =========================================================================
  // 3. CLASSICAL DESIGN (Existing)
  // =========================================================================
  if (header.design === "classical") {
    return (
      <>
        {announcement}
        <header className={classes} style={chrome.style}>
          <div className="wb-container wb-header-inner">
            {brand}
            {header.menu.length > 0 && (
              <nav className="wb-nav" aria-label="Main">
                {header.menu.map((item) => (
                  <NavItem key={`${item.label}-${item.href}`} item={item} />
                ))}
              </nav>
            )}
            <div className="wb-header-actions">
              <ActionButtons header={header} />
              {mobileToggle}
            </div>
          </div>
        </header>
        <MobileDrawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} header={header} />
      </>
    );
  }

  // =========================================================================
  // 4. COMPREHENSIVE DESIGN (Existing)
  // =========================================================================
  if (header.design === "comprehensive") {
    return (
      <>
        {announcement}
        <header className={classes} style={chrome.style}>
          <div className="wb-container wb-header-inner">
            {brand}
            {header.menu.length > 0 && (
              <nav className="wb-nav" aria-label="Main">
                {header.menu.map((item) => (
                  <NavItem key={`${item.label}-${item.href}`} item={item} />
                ))}
              </nav>
            )}
            <div className="wb-header-actions">
              <ActionButtons header={header} />
              {mobileToggle}
            </div>
          </div>
        </header>
        <MobileDrawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} header={header} />
      </>
    );
  }


  // =========================================================================
  // 6. NEW 1: GLASS-DOCK (Segmented Floating Island Capsule)
  // =========================================================================
  if (header.design === "glass-dock") {
    return (
      <>
        {announcement}
        <header className={classes}>
          <div className="wb-dock-container wb-header-dock-container">
            <div className="wb-dock-bar">
              <div className="wb-dock-brand wb-header-dock-brand">
                {brand}
                {header.badge && (
                  <span className="wb-dock-status wb-dock-status-pill">
                    <span className="wb-dock-dot wb-pulse-dot" />
                    {header.badge}
                  </span>
                )}
              </div>
              <div className="wb-dock-divider" />
              {header.menu.length > 0 && (
                <nav className="wb-nav wb-dock-nav" aria-label="Main">
                  {header.menu.map((item) => (
                    <NavItem key={`${item.label}-${item.href}`} item={item} />
                  ))}
                </nav>
              )}
              <div className="wb-dock-actions wb-header-dock-actions">
                {header.showSearch && (
                  <div className="wb-search-pill wb-dock-search" role="search">
                    <SearchIcon style={{ width: "14px", height: "14px", flexShrink: 0 }} />
                    <span>{header.searchPlaceholder || "Search..."}</span>
                    <kbd className="wb-kbd-hint">⌘K</kbd>
                  </div>
                )}
                <ActionButtons header={header} />
                {mobileToggle}
              </div>
            </div>
          </div>
        </header>
        <MobileDrawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} header={header} />
      </>
    );
  }

  // =========================================================================
  // 7. NEW 2: SPLIT-STACKED (2-Tier Enterprise Double Decker with Top Utility)
  // =========================================================================
  if (header.design === "split-stacked") {
    return (
      <>
        {announcement}
        <header className={classes}>
          {/* Top Utility Tier */}
          <div className="wb-utility-topbar wb-stacked-top-bar wb-stacked-top">
            <div className="wb-container wb-utility-inner wb-stacked-top-inner">
              <div className="wb-utility-status wb-stacked-status">
                <span className={`wb-status-beacon wb-pulse-dot wb-status-${header.statusColor || "green"}`} />
                <span>{header.statusText || "All Systems Operational 99.99%"}</span>
              </div>
              <div className="wb-utility-links wb-stacked-utility-links wb-stacked-utility">
                {header.utilityLinks && header.utilityLinks.length > 0 ? (
                  header.utilityLinks.map((ulink) => (
                    <a key={`${ulink.label}-${ulink.href}`} href={ulink.href} className="wb-stacked-utility-link">
                      {ulink.label}
                    </a>
                  ))
                ) : (
                  <>
                    <a href="/docs" className="wb-stacked-utility-link">Documentation</a>
                    <a href="/changelog" className="wb-stacked-utility-link">Changelog</a>
                    <a href="/support" className="wb-stacked-utility-link">Support</a>
                  </>
                )}
                {header.currency && <span className="wb-stacked-currency wb-stacked-currency-tag">{header.currency}</span>}
              </div>
            </div>
          </div>
          {/* Main Navigation Tier */}
          <div className="wb-stacked-main">
            <div className="wb-container wb-stacked-inner wb-header-inner wb-stacked-main-inner">
              <div className="wb-stacked-brand wb-stacked-brand-group">
                {brand}
                {header.tagline && <span className="wb-utility-tagline wb-header-tagline-sub wb-stacked-tagline">{parseRichText(header.tagline)}</span>}
              </div>
              {header.menu.length > 0 && (
                <nav className="wb-nav wb-stacked-nav" aria-label="Main">
                  {header.menu.map((item) => (
                    <NavItem key={`${item.label}-${item.href}`} item={item} />
                  ))}
                </nav>
              )}
              <div className="wb-stacked-actions wb-header-actions">
                <ActionButtons header={header} />
                {mobileToggle}
              </div>
            </div>
          </div>
        </header>
        <MobileDrawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} header={header} />
      </>
    );
  }


  // =========================================================================
  // 9. NEW 4: MEGA-MENU-GRID (Architectural Bento Mega Dropdown Header)
  // =========================================================================
  if (header.design === "mega-menu-grid") {
    return (
      <>
        {announcement}
        <header className={classes}>
          <div className="wb-container wb-mega-header-inner wb-header-inner wb-mega-bar">
            <div className="wb-mega-brand-col">
              {brand}
            </div>
            {header.menu.length > 0 && (
              <nav className="wb-nav wb-mega-nav" aria-label="Main">
                {header.menu.map((item) => (
                  <MegaNavItem key={`${item.label}-${item.href}`} item={item} />
                ))}
              </nav>
            )}
            <div className="wb-header-actions wb-mega-actions">
              {header.showSearch && (
                <button type="button" className="wb-header-icon-btn" aria-label="Search">
                  <SearchIcon style={{ width: "16px", height: "16px" }} />
                </button>
              )}
              <ActionButtons header={header} />
              {mobileToggle}
            </div>
          </div>
        </header>
        <MobileDrawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} header={header} />
      </>
    );
  }

  // =========================================================================
  // 10. NEW 5: SIDE-DRAWER (Off-Canvas Modern App Shell with Slide-Over Curtain)
  // =========================================================================
  if (header.design === "side-drawer") {
    return (
      <>
        {announcement}
        <header className={classes}>
          <div className="wb-container wb-drawer-header-inner wb-header-inner wb-side-drawer-inner">
            <div className="wb-side-brand">{brand}</div>
            <div className="wb-side-summary-pill wb-side-tagline">
              <span className="wb-pulse-dot wb-side-indicator-dot" />
              <span className="wb-side-summary-text">{parseRichText(header.tagline || "Digital Studio & Platform")}</span>
            </div>
            <div className="wb-side-actions">
              {header.cta && <HeaderCtaButton link={header.cta} tone="primary" />}
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="wb-curtain-trigger-btn wb-side-drawer-trigger-btn"
                data-wb-menu-open=""
                aria-label="Toggle navigation menu"
              >
                <span className="wb-curtain-hamburger">
                  <span />
                  <span />
                </span>
                <span className="wb-side-menu-label">Menu</span>
              </button>
            </div>
          </div>
        </header>
        <EditorialCurtainDrawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} header={header} />
      </>
    );
  }

  // =========================================================================
  // 11. NEW 6: HEADLINE-TICKER (Live Announcement Broadcast Banner Header)
  // =========================================================================
  if (header.design === "headline-ticker") {
    const liveAnnouncement = header.announcement || "Spring 2026 Release is live • Early access unlocked • Join 100,000+ creators building on Modulus";
    return (
      <>
        <div className="wb-ticker-bar wb-headline-ticker-strip">
          <div className="wb-ticker-badge wb-ticker-badge-lead">
            <span className="wb-ticker-live-dot wb-pulse-dot" />
            <span>LIVE</span>
          </div>
          <div className="wb-ticker-track wb-ticker-scroller">
            <div className="wb-ticker-content wb-ticker-track-inner">
              <span>{liveAnnouncement}</span>
              <span className="wb-ticker-star" style={{ margin: "0 14px", opacity: 0.6 }}>✦</span>
              <span>{liveAnnouncement}</span>
              <span className="wb-ticker-star" style={{ margin: "0 14px", opacity: 0.6 }}>✦</span>
              <span>{liveAnnouncement}</span>
            </div>
          </div>
          {header.announcementLink && (
            <a href={header.announcementLink.href} className="wb-ticker-link">
              {header.announcementLink.label} &rarr;
            </a>
          )}
        </div>
        <header className={classes}>
          <div className="wb-container wb-ticker-main-inner wb-header-inner">
            {brand}
            {header.menu.length > 0 && (
              <nav className="wb-nav" aria-label="Main">
                {header.menu.map((item) => (
                  <NavItem key={`${item.label}-${item.href}`} item={item} />
                ))}
              </nav>
            )}
            <div className="wb-header-actions">
              <ActionButtons header={header} />
              {mobileToggle}
            </div>
          </div>
        </header>
        <MobileDrawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} header={header} />
      </>
    );
  }

  // =========================================================================
  // 12. VINTAGE EDITORIAL (Dark Cinema Navbar + Newspaper Editorial Sub-Bar)
  // =========================================================================
  if (header.design === "vintage-editorial") {
    const vol = header.editorialIssue;
    const comp = header.editorialCompany;
    const tags = header.editorialTags;
    return (
      <>
        <header className={`${classes} wb-header-vintage-editorial`} style={chrome.style}>
          <div className="wb-container wb-header-inner">
            {brand}
            {header.menu.length > 0 && (
              <nav className="wb-nav" aria-label="Main">
                {header.menu.map((item) => (
                  <NavItem key={`${item.label}-${item.href}`} item={item} />
                ))}
              </nav>
            )}
            <div className="wb-header-actions">
              <ActionButtons header={header} />
              {mobileToggle}
            </div>
          </div>
        </header>
        {(vol || comp || tags) && (
          <div className="wb-container">
            <div className="wb-editorial-subbar">
              <span>{vol}</span>
              <span className="wb-editorial-subbar-center">{comp}</span>
              <span>{tags}</span>
            </div>
          </div>
        )}
        <MobileDrawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} header={header} />
      </>
    );
  }

  // =========================================================================
  // 14. STANDARD & TRANSPARENT (logo-left, centered, transparent)
  // =========================================================================
  return (
    <>
      {announcement}
      <header className={classes} style={chrome.style}>
        <div className="wb-container wb-header-inner">
          {brand}
          {header.menu.length > 0 && (
            <nav className="wb-nav" aria-label="Main">
              {header.menu.map((item) => (
                <NavItem key={`${item.label}-${item.href}`} item={item} />
              ))}
            </nav>
          )}
          <div className="wb-header-actions">
            <ActionButtons header={header} />
            {mobileToggle}
          </div>
        </div>
      </header>
      <MobileDrawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} header={header} />
    </>
  );
}
