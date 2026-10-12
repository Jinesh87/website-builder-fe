import { useState, type ReactNode } from "react";
import { useStaticRender } from "../render-mode.tsx";
import {
  ChevronDownIcon,
  CloseIcon,
  MenuIcon,
  SearchIcon,
  SiteButton,
  SiteImage,
  SiteLink,
} from "../primitives.tsx";
import type { BrandDisplayMode, HeaderData, HeaderMenuItem, ImageRef, SectionSettings } from "../types.ts";
import { chromeStyle } from "./chrome.ts";

export function SiteBrand({
  siteName,
  logo,
  displayMode = "auto",
  className = "",
}: {
  siteName: string;
  logo?: ImageRef;
  displayMode?: BrandDisplayMode;
  className?: string;
}) {
  const hasLogo = Boolean(logo?.url);
  const mode = displayMode ?? "auto";

  let content: ReactNode = null;

  if (mode === "text_only" || (!hasLogo && mode !== "logo_only")) {
    content = <span className="wb-brand-text">{siteName}</span>;
  } else if (mode === "logo_only") {
    content = hasLogo ? <SiteImage image={logo!} /> : <span className="wb-brand-text">{siteName}</span>;
  } else if (mode === "logo_right") {
    content = (
      <span className="wb-brand-combo wb-brand-logo-right">
        {siteName && <span className="wb-brand-text">{siteName}</span>}
        {hasLogo && <SiteImage image={logo!} />}
      </span>
    );
  } else if (mode === "logo_top") {
    content = (
      <span className="wb-brand-combo wb-brand-logo-top">
        {hasLogo && <SiteImage image={logo!} />}
        {siteName && <span className="wb-brand-text">{siteName}</span>}
      </span>
    );
  } else if (mode === "logo_left") {
    content = (
      <span className="wb-brand-combo wb-brand-logo-left">
        {hasLogo && <SiteImage image={logo!} />}
        {siteName && <span className="wb-brand-text">{siteName}</span>}
      </span>
    );
  } else {
    content = hasLogo ? <SiteImage image={logo!} /> : <span className="wb-brand-text">{siteName}</span>;
  }

  return (
    <a href="/" className={`wb-brand ${className}`.trim()}>
      {content}
    </a>
  );
}

function NavItem({ item }: { item: HeaderMenuItem }) {
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
              {sub.description && <span className="wb-dropdown-desc">{sub.description}</span>}
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
      <SiteLink link={item} />
      {item.badge && <span className="wb-badge">{item.badge}</span>}
    </span>
  );
}

function MegaNavItem({ item }: { item: HeaderMenuItem }) {
  if (item.children && item.children.length > 0) {
    return (
      <div className="wb-mega-dropdown">
        <button type="button" className="wb-dropdown-trigger wb-mega-trigger" aria-haspopup="true">
          <span>{item.label}</span>
          {item.badge && <span className="wb-badge">{item.badge}</span>}
          <ChevronDownIcon />
        </button>
        <div className="wb-mega-menu-panel" role="menu">
          <div className="wb-mega-grid-inner">
            <div className="wb-mega-links-col">
              <span className="wb-mega-col-title">Overview & Features</span>
              <div className="wb-mega-links-list">
                {item.children.map((sub) => (
                  <a key={`${sub.label}-${sub.href}`} href={sub.href} className="wb-mega-item" role="menuitem">
                    <div className="wb-mega-item-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 2 7 12 12 22 7 12 2" />
                        <polyline points="2 17 12 22 22 17" />
                        <polyline points="2 12 12 17 22 12" />
                      </svg>
                    </div>
                    <div className="wb-mega-item-text">
                      <div className="wb-mega-item-headline">
                        <span>{sub.label}</span>
                        {sub.badge && <span className="wb-badge">{sub.badge}</span>}
                      </div>
                      {sub.description && <p className="wb-mega-item-desc">{sub.description}</p>}
                    </div>
                  </a>
                ))}
              </div>
            </div>
            <div className="wb-mega-showcase-col">
              <div className="wb-mega-feature-card">
                <span className="wb-mega-feature-badge">FEATURED RELEASE</span>
                <h4 className="wb-mega-feature-heading">Next-Gen Architecture 2026</h4>
                <p className="wb-mega-feature-desc">
                  Sub-second rendering, unified design tokens, and automated global deployment.
                </p>
                <a href={item.href} className="wb-mega-feature-link">
                  Explore documentation &rarr;
                </a>
              </div>
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
      {header.secondaryCta && <SiteButton link={header.secondaryCta} tone="secondary" />}
      {header.cta && <SiteButton link={header.cta} tone="primary" />}
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
                          <span className="wb-drawer-sublink-desc">{sub.description}</span>
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
                  <SiteButton link={header.secondaryCta} tone="secondary" />
                </div>
              )}
              {header.cta && (
                <div onClick={onClose}>
                  <SiteButton link={header.cta} tone="primary" />
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
            <div className="wb-curtain-meta">
              <span className="wb-curtain-meta-title">Direct Inquiries</span>
              <a href="mailto:hello@studio.domain" className="wb-curtain-email">hello@studio.domain</a>
            </div>
            {(header.cta || header.secondaryCta) && (
              <div className="wb-curtain-actions">
                {header.secondaryCta && (
                  <div onClick={onClose}>
                    <SiteButton link={header.secondaryCta} tone="secondary" />
                  </div>
                )}
                {header.cta && (
                  <div onClick={onClose}>
                    <SiteButton link={header.cta} tone="primary" />
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
  const classes = ["wb-header", designClass, posClass, chrome.className].filter(Boolean).join(" ");

  const brand = (
    <SiteBrand
      siteName={header.siteName}
      logo={header.logo}
      displayMode={header.logoDisplay}
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
  // 5. E-COMMERCE DESIGN (Existing)
  // =========================================================================
  if (header.design === "ecommerce") {
    return (
      <>
        {announcement}
        <header className={classes}>
          <div className="wb-container">
            <div className="wb-ecommerce-top">
              {brand}
              {header.showSearch && (
                <div className="wb-search-pill" role="search">
                  <SearchIcon />
                  <span>{header.searchPlaceholder || "Search products & categories..."}</span>
                </div>
              )}
              <div className="wb-header-actions">
                {header.showAccount && (
                  <a href="/account" className="wb-header-icon-btn" aria-label="Account">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </a>
                )}
                {header.showCart && (
                  <a href="/cart" className="wb-header-icon-btn" aria-label="Cart">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                    </svg>
                    {typeof header.cartCount === "number" && (
                      <span className="wb-cart-badge">{header.cartCount}</span>
                    )}
                  </a>
                )}
                <ActionButtons header={header} />
                {mobileToggle}
              </div>
            </div>
            {header.menu.length > 0 && (
              <div className="wb-ecommerce-bottom">
                {header.menu.map((item, idx) => (
                  <a
                    key={`${item.label}-${item.href}`}
                    href={item.href}
                    className={`wb-ecommerce-tab ${idx === 0 ? "active" : ""}`}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            )}
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
          <div className="wb-header-dock-container">
            <div className="wb-header-dock-brand">
              {brand}
              {header.badge && (
                <span className="wb-dock-status-pill">
                  <span className="wb-dock-dot" />
                  {header.badge}
                </span>
              )}
            </div>
            {header.menu.length > 0 && (
              <nav className="wb-nav wb-dock-nav" aria-label="Main">
                {header.menu.map((item) => (
                  <NavItem key={`${item.label}-${item.href}`} item={item} />
                ))}
              </nav>
            )}
            <div className="wb-header-dock-actions">
              {header.showSearch && (
                <div className="wb-search-pill wb-dock-search" role="search">
                  <SearchIcon />
                  <span>{header.searchPlaceholder || "Search..."}</span>
                  <kbd className="wb-kbd-hint">⌘K</kbd>
                </div>
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
  // 7. NEW 2: SPLIT-STACKED (2-Tier Enterprise Double Decker with Top Utility)
  // =========================================================================
  if (header.design === "split-stacked") {
    return (
      <>
        {announcement}
        <header className={classes}>
          {/* Top Utility Tier */}
          <div className="wb-stacked-top-bar">
            <div className="wb-container wb-stacked-top-inner">
              <div className="wb-stacked-status">
                <span className={`wb-status-beacon wb-status-${header.statusColor || "green"}`} />
                <span>{header.statusText || "All Systems Operational 99.99%"}</span>
              </div>
              <div className="wb-stacked-utility-links">
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
                {header.currency && <span className="wb-stacked-currency-tag">{header.currency}</span>}
              </div>
            </div>
          </div>
          {/* Main Navigation Tier */}
          <div className="wb-container wb-header-inner wb-stacked-main-inner">
            <div className="wb-stacked-brand-group">
              {brand}
              {header.tagline && <span className="wb-header-tagline-sub">{header.tagline}</span>}
            </div>
            {header.menu.length > 0 && (
              <nav className="wb-nav wb-stacked-nav" aria-label="Main">
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
  // 8. NEW 3: COMMAND-BAR (Spotlight Interactive Cmd+K Search Header)
  // =========================================================================
  if (header.design === "command-bar") {
    return (
      <>
        {announcement}
        <header className={classes}>
          <div className="wb-container wb-header-inner wb-cmd-header-inner">
            <div className="wb-cmd-left">
              {brand}
              {header.badge && <span className="wb-badge wb-cmd-version-badge">{header.badge}</span>}
            </div>
            <div className="wb-cmd-center">
              <div className="wb-command-search-bar" role="search">
                <SearchIcon />
                <span className="wb-command-search-placeholder">
                  {header.searchPlaceholder || "Quick search docs, tools, commands..."}
                </span>
                <span className="wb-command-shortcut-cluster">
                  <kbd className="wb-kbd-key">⌘</kbd>
                  <kbd className="wb-kbd-key">K</kbd>
                </span>
              </div>
            </div>
            <div className="wb-cmd-right">
              {header.menu.length > 0 && (
                <nav className="wb-nav wb-cmd-nav" aria-label="Main">
                  {header.menu.map((item) => (
                    <NavItem key={`${item.label}-${item.href}`} item={item} />
                  ))}
                </nav>
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
  // 9. NEW 4: MEGA-MENU-GRID (Architectural Bento Mega Dropdown Header)
  // =========================================================================
  if (header.design === "mega-menu-grid") {
    return (
      <>
        {announcement}
        <header className={classes}>
          <div className="wb-container wb-header-inner wb-mega-header-inner">
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
                  <SearchIcon />
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
          <div className="wb-container wb-header-inner wb-side-drawer-inner">
            <div className="wb-side-brand">{brand}</div>
            <div className="wb-side-summary-pill">
              <span className="wb-side-indicator-dot" />
              <span className="wb-side-summary-text">{header.tagline || "Digital Studio & Platform"}</span>
            </div>
            <div className="wb-side-actions">
              {header.cta && <SiteButton link={header.cta} tone="primary" />}
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="wb-side-drawer-trigger-btn"
                data-wb-menu-open=""
                aria-label="Toggle navigation menu"
              >
                <span className="wb-side-menu-label">Menu</span>
                <span className="wb-side-menu-icon-box">
                  <MenuIcon />
                </span>
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
    const liveAnnouncement = header.announcement || "🚀 New Feature Release v3.0 Live • Experience next-gen cloud scaling & tools";
    return (
      <>
        <div className="wb-headline-ticker-strip">
          <div className="wb-ticker-badge-lead">
            <span className="wb-ticker-live-dot" />
            <span>LIVE</span>
          </div>
          <div className="wb-ticker-scroller">
            <div className="wb-ticker-track">
              <span>{liveAnnouncement}</span>
              <span className="wb-ticker-star">✦</span>
              <span>{liveAnnouncement}</span>
              <span className="wb-ticker-star">✦</span>
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
  // 12. NEW 7: LUXURY-EDITORIAL (Grid Bordered Hairline Editorial Header)
  // =========================================================================
  if (header.design === "luxury-editorial") {
    return (
      <>
        {announcement}
        <header className={classes}>
          <div className="wb-editorial-header-grid">
            {/* Left Column: Index links */}
            <div className="wb-editorial-col-left">
              {header.menu.slice(0, 3).map((item, idx) => (
                <a key={`${item.label}-${item.href}`} href={item.href} className="wb-editorial-nav-item">
                  <span className="wb-editorial-idx">0{idx + 1}</span>
                  <span className="wb-editorial-label">{item.label}</span>
                </a>
              ))}
            </div>
            {/* Center Column: Masthead Brand */}
            <div className="wb-editorial-col-center">
              {brand}
              {header.tagline && <span className="wb-editorial-tagline">{header.tagline}</span>}
            </div>
            {/* Right Column: Actions / Location widget */}
            <div className="wb-editorial-col-right">
              <div className="wb-editorial-meta">
                <span>{header.statusText || "GLOBAL ATELIER"}</span>
                {header.menu.length > 3 && (
                  <div className="wb-editorial-subnav">
                    {header.menu.slice(3).map((item) => (
                      <a key={`${item.label}-${item.href}`} href={item.href} className="wb-editorial-sublink">
                        {item.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <div className="wb-editorial-actions">
                <ActionButtons header={header} />
                {mobileToggle}
              </div>
            </div>
          </div>
        </header>
        <EditorialCurtainDrawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} header={header} />
      </>
    );
  }

  // =========================================================================
  // 13. NEW 8: SAAS-CONSOLE (Developer Cloud Workspace & Console App Header)
  // =========================================================================
  if (header.design === "saas-console") {
    return (
      <>
        {announcement}
        <header className={classes}>
          <div className="wb-console-header-wrap">
            {/* Left: Brand + Workspace Switcher Pill */}
            <div className="wb-console-left">
              {brand}
              <div className="wb-console-divider" />
              <div className="wb-console-workspace-pill">
                <span className="wb-console-org-icon">⚡</span>
                <span className="wb-console-org-name">{header.badge || "Production Workspace"}</span>
                <ChevronDownIcon />
              </div>
            </div>
            {/* Center: Console Tab Navigation */}
            {header.menu.length > 0 && (
              <nav className="wb-console-nav" aria-label="Console Navigation">
                {header.menu.map((item, idx) => (
                  <a
                    key={`${item.label}-${item.href}`}
                    href={item.href}
                    className={`wb-console-tab ${idx === 0 ? "active" : ""}`}
                  >
                    <span>{item.label}</span>
                    {item.badge && <span className="wb-console-tab-badge">{item.badge}</span>}
                  </a>
                ))}
              </nav>
            )}
            {/* Right: Console Utility Tools */}
            <div className="wb-console-right">
              {header.showSearch && (
                <div className="wb-console-search-shortcut" role="search">
                  <SearchIcon />
                  <span>Search...</span>
                  <kbd>/</kbd>
                </div>
              )}
              <div className="wb-console-tool-cluster">
                <button type="button" className="wb-console-icon-btn" aria-label="Notifications">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 01-3.46 0" />
                  </svg>
                  <span className="wb-console-notif-dot" />
                </button>
              </div>
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
