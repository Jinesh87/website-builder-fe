import { useState, type CSSProperties, type FormEvent } from "react";
import { safeHref } from "../links.ts";
import { SiteBrand } from "./SiteHeader.tsx";
import { PaymentIconsBar, SiteLink, SocialIcon } from "../primitives.tsx";
import type { FooterData, LinkRef, SectionSettings } from "../types.ts";
import { chromeStyle } from "./chrome.ts";

function SocialCircleLinks({ social }: { social: LinkRef[] }) {
  if (!social || social.length === 0) return null;
  return (
    <div className="wb-social" aria-label="Social links">
      {social.map((link) => (
        <a
          key={`${link.label}-${link.href}`}
          href={safeHref(link.href)}
          className="wb-social-circle-btn"
          title={link.label}
          target="_blank"
          rel="noopener noreferrer"
        >
          <SocialIcon platform={link.label} />
        </a>
      ))}
    </div>
  );
}

function ContactBlock({ contact }: { contact: NonNullable<FooterData["contact"]> }) {
  const hasDetails = contact.email || contact.phone || contact.address || contact.hours;
  if (!hasDetails) return null;
  return (
    <div className="wb-footer-contact-block">
      {contact.title && <h4 className="wb-footer-col-title">{contact.title}</h4>}
      {contact.address && <div className="wb-footer-contact-item">{contact.address}</div>}
      {contact.phone && (
        <div className="wb-footer-contact-item">
          <span>Call Us Now:</span>
          <a href={safeHref(`tel:${contact.phone.replace(/\s+/g, "")}`)}>{contact.phone}</a>
        </div>
      )}
      {contact.email && (
        <div className="wb-footer-contact-item">
          <span>Email:</span>
          <a href={safeHref(`mailto:${contact.email}`)}>{contact.email}</a>
        </div>
      )}
      {contact.hours && <div className="wb-footer-contact-item wb-muted">{contact.hours}</div>}
    </div>
  );
}

function NewsletterBox({
  newsletter,
}: {
  newsletter?: FooterData["newsletter"];
}) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  if (!newsletter?.enabled && !newsletter?.title) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  }

  return (
    <div className="wb-newsletter-box">
      {newsletter.title && <h4 className="wb-footer-col-title">{newsletter.title}</h4>}
      {newsletter.description && <p className="wb-muted">{newsletter.description}</p>}
      {subscribed ? (
        <p className="text-xs font-semibold text-emerald-500">Thank you for subscribing!</p>
      ) : (
        <form onSubmit={handleSubmit} className="wb-newsletter-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={newsletter.placeholder || "Enter email address"}
            required
            className="wb-newsletter-input"
          />
          <button type="submit" className="wb-newsletter-btn">
            {newsletter.buttonText || "Subscribe"}
          </button>
        </form>
      )}
    </div>
  );
}

function CtaBanner({ banner }: { banner?: FooterData["ctaBanner"] }) {
  if (!banner?.enabled || (!banner.heading && !banner.primaryCta)) return null;
  return (
    <div className="wb-footer-cta-card">
      <div>
        {banner.heading && <h3>{banner.heading}</h3>}
        {banner.subheading && <p className="wb-muted">{banner.subheading}</p>}
      </div>
      <div className="wb-actions">
        {banner.primaryCta && <SiteLink link={banner.primaryCta} className="wb-btn wb-btn-primary" />}
        {banner.secondaryCta && <SiteLink link={banner.secondaryCta} className="wb-btn wb-btn-secondary" />}
      </div>
    </div>
  );
}

function LegalLinksList({ legalLinks }: { legalLinks?: LinkRef[] }) {
  if (!legalLinks || legalLinks.length === 0) return null;
  return (
    <ul className="wb-legal-links">
      {legalLinks.map((link) => (
        <li key={`${link.label}-${link.href}`}>
          <SiteLink link={link} />
        </li>
      ))}
    </ul>
  );
}

export default function SiteFooter({ footer, settings }: { footer: FooterData; settings?: Partial<SectionSettings> }) {
  if (footer.hidden) return null;

  const chrome = chromeStyle(settings);
  const themeClass = [
    footer.themeMode === "dark" ? "wb-footer-dark" : footer.themeMode === "light" ? "wb-footer-light" : "",
    chrome.className,
  ]
    .filter(Boolean)
    .join(" ");

  const { contact, newsletter, ctaBanner, paymentMethods, legalLinks, menu = [] } = footer;
  const showPayments = paymentMethods?.enabled !== false;
  const paymentList = paymentMethods?.methods ?? ["paypal", "amex", "discover", "mastercard", "visa"];

  // 1. SIMPLE DESIGN
  if (footer.design === "simple") {
    return (
      <footer className={`wb-footer wb-footer-simple ${themeClass}`} style={chrome.style}>
        <div className="wb-container wb-footer-bottom">
          <div className="wb-footer-bottom-left">
            <span className="wb-footer-copyright">{footer.copyright}</span>
            <LegalLinksList legalLinks={legalLinks} />
          </div>
          <SocialCircleLinks social={footer.social} />
        </div>
      </footer>
    );
  }

  // 2. INLINE SINGLE-BAR DESIGN (Logo left, nav links middle, social icons right)
  if (footer.design === "inline") {
    return (
      <footer className={`wb-footer ${themeClass}`} style={chrome.style}>
        <div className="wb-container">
          <CtaBanner banner={ctaBanner} />
          <div className="wb-footer-inline-bar">
            <SiteBrand siteName={footer.siteName} logo={footer.logo} displayMode={footer.logoDisplay} />
            {menu.length > 0 && (
              <ul className="wb-footer-nav-row">
                {menu.map((item, idx) => (
                  <li key={`${item.label}-${item.href}`}>
                    <SiteLink link={item} className={idx === 0 ? "wb-active-nav" : ""} />
                  </li>
                ))}
              </ul>
            )}
            <SocialCircleLinks social={footer.social} />
          </div>
          <div className="wb-footer-bottom">
            <div className="wb-footer-bottom-left">
              <span className="wb-footer-copyright">{footer.copyright}</span>
              <LegalLinksList legalLinks={legalLinks} />
            </div>
            {showPayments && <PaymentIconsBar methods={paymentList} />}
          </div>
        </div>
      </footer>
    );
  }

  // 3. CENTERED BRAND DESIGN
  if (footer.design === "centered") {
    return (
      <footer className={`wb-footer ${themeClass}`} style={chrome.style}>
        <div className="wb-container">
          <CtaBanner banner={ctaBanner} />
          <div className="wb-footer-centered-wrap">
            <SiteBrand siteName={footer.siteName} logo={footer.logo} displayMode={footer.logoDisplay} />
            {footer.tagline && <span className="wb-footer-tagline">{footer.tagline}</span>}
            {menu.length > 0 && (
              <ul className="wb-footer-nav-row justify-center">
                {menu.map((item, idx) => (
                  <li key={`${item.label}-${item.href}`}>
                    <SiteLink link={item} className={idx === 0 ? "wb-active-nav" : ""} />
                  </li>
                ))}
              </ul>
            )}
            <SocialCircleLinks social={footer.social} />
            {contact && (contact.address || contact.phone || contact.email) && (
              <div className="wb-muted text-xs flex flex-wrap justify-center gap-x-4 gap-y-1">
                {contact.address && <span>{contact.address}</span>}
                {contact.phone && <span>Call: {contact.phone}</span>}
                {contact.email && <span>Email: {contact.email}</span>}
              </div>
            )}
          </div>
          <div className="wb-footer-bottom justify-center flex-col sm:flex-row gap-4 text-center">
            <span className="wb-footer-copyright">{footer.copyright}</span>
            <LegalLinksList legalLinks={legalLinks} />
            {showPayments && <PaymentIconsBar methods={paymentList} />}
          </div>
        </div>
      </footer>
    );
  }

  // 4. NEWSLETTER & NAVIGATION DESIGN (Logo/social left, Horizontal links + contact center, Newsletter right)
  if (footer.design === "newsletter") {
    return (
      <footer className={`wb-footer ${themeClass}`} style={chrome.style}>
        <div className="wb-container">
          <CtaBanner banner={ctaBanner} />
          <div className="wb-footer-newsletter-grid">
            <div className="wb-footer-about">
              <SiteBrand siteName={footer.siteName} logo={footer.logo} displayMode={footer.logoDisplay} />
              {footer.tagline && <span className="wb-footer-tagline">{footer.tagline}</span>}
              {footer.description && <p className="wb-muted">{footer.description}</p>}
              <SocialCircleLinks social={footer.social} />
            </div>

            <div className="flex flex-col gap-5">
              {menu.length > 0 && (
                <ul className="wb-footer-nav-row">
                  {menu.map((item, idx) => (
                    <li key={`${item.label}-${item.href}`}>
                      <SiteLink link={item} className={idx === 0 ? "wb-active-nav" : ""} />
                    </li>
                  ))}
                </ul>
              )}
              {contact && <ContactBlock contact={contact} />}
            </div>

            <div className="flex flex-col gap-4">
              <NewsletterBox newsletter={newsletter} />
              {showPayments && <PaymentIconsBar methods={paymentList} />}
            </div>
          </div>

          <div className="wb-footer-bottom">
            <div className="wb-footer-bottom-left">
              <span className="wb-footer-copyright">{footer.copyright}</span>
              <LegalLinksList legalLinks={legalLinks} />
            </div>
            <SocialCircleLinks social={footer.social} />
          </div>
        </div>
      </footer>
    );
  }

  // 5. SPLIT DESIGN (Logo/social left, Nav links middle, Contact + payments right)
  if (footer.design === "split") {
    return (
      <footer className={`wb-footer ${themeClass}`} style={chrome.style}>
        <div className="wb-container">
          <CtaBanner banner={ctaBanner} />
          <div className="wb-footer-split-grid">
            <div className="wb-footer-about">
              <SiteBrand siteName={footer.siteName} logo={footer.logo} displayMode={footer.logoDisplay} />
              {footer.tagline && <span className="wb-footer-tagline">{footer.tagline}</span>}
              <SocialCircleLinks social={footer.social} />
              <span className="wb-footer-copyright wb-muted text-xs mt-2">{footer.copyright}</span>
            </div>

            <div>
              {menu.length > 0 && (
                <ul className="wb-footer-nav-row">
                  {menu.map((item, idx) => (
                    <li key={`${item.label}-${item.href}`}>
                      <SiteLink link={item} className={idx === 0 ? "wb-active-nav" : ""} />
                    </li>
                  ))}
                </ul>
              )}
              {footer.columns.length > 0 && (
                <div className="wb-footer-grid mt-6" style={{ "--wb-footer-cols": footer.columns.length } as CSSProperties}>
                  {footer.columns.map((col) => (
                    <div key={col.title}>
                      <h4>{col.title}</h4>
                      <ul>
                        {col.links.map((link) => (
                          <li key={`${link.label}-${link.href}`}>
                            <SiteLink link={link} className="wb-muted" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {contact && <ContactBlock contact={contact} />}
              {showPayments && <PaymentIconsBar methods={paymentList} />}
            </div>
          </div>

          <div className="wb-footer-bottom">
            <LegalLinksList legalLinks={legalLinks} />
          </div>
        </div>
      </footer>
    );
  }

  // 6. MEGA / E-COMMERCE FOOTER & 7. CTA-BANNER & 8. STANDARD MULTI-COLUMN
  const isMega = footer.design === "mega";
  const hasContact = Boolean(contact && (contact.email || contact.phone || contact.address || contact.hours));

  return (
    <footer className={`wb-footer ${themeClass}`} style={chrome.style}>
      <div className="wb-container">
        <CtaBanner banner={ctaBanner} />

        <div
          className={isMega ? "wb-footer-mega-grid" : "wb-footer-grid"}
          style={{ "--wb-footer-cols": Math.max(footer.columns.length, 1) } as CSSProperties}
        >
          {/* Brand Col */}
          <div className="wb-footer-about">
            <SiteBrand siteName={footer.siteName} logo={footer.logo} displayMode={footer.logoDisplay} />
            {footer.tagline && <span className="wb-footer-tagline">{footer.tagline}</span>}
            {footer.description && <p className="wb-muted">{footer.description}</p>}
            <SocialCircleLinks social={footer.social} />
          </div>

          {/* Dynamic Link Columns */}
          {footer.columns.map((column) => (
            <div key={column.title}>
              <h4>{column.title}</h4>
              <ul>
                {column.links.map((link) => (
                  <li key={`${link.label}-${link.href}`}>
                    <SiteLink link={link} className="wb-muted" />
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Col */}
          {hasContact && contact && (
            <div>
              <h4>{contact.title || "Contact Us"}</h4>
              <ContactBlock contact={contact} />
            </div>
          )}

          {/* Newsletter Box (if enabled and not already top banner) */}
          {isMega && newsletter?.enabled && (
            <div>
              <NewsletterBox newsletter={newsletter} />
            </div>
          )}
        </div>

        {/* Bottom Bar with Copyright & Payment Badges */}
        <div className="wb-footer-bottom">
          <div className="wb-footer-bottom-left">
            <span className="wb-footer-copyright">{footer.copyright}</span>
            <LegalLinksList legalLinks={legalLinks} />
          </div>
          {showPayments && <PaymentIconsBar methods={paymentList} />}
        </div>
      </div>
    </footer>
  );
}
