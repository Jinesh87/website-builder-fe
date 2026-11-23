import type { CSSProperties, ReactNode } from "react";
import { telHref } from "../links.ts";
import { BRAND_ICONS } from "../brand-icons.ts";
import { EmailLink, PhoneLink } from "../primitives.tsx";
import type { HeaderData, HeaderDesign, HeaderPhoneIcon } from "../types.ts";

/** Header designs built around the business phone number (plus optional email, hours and address). */
export const CONTACT_HEADER_DESIGNS = [
  "contact-topbar",
  "call-now",
  "contact-stacked",
  "centered-phone",
] as const satisfies readonly HeaderDesign[];

export type ContactHeaderDesign = (typeof CONTACT_HEADER_DESIGNS)[number];

export function isContactHeaderDesign(design: HeaderDesign): design is ContactHeaderDesign {
  return (CONTACT_HEADER_DESIGNS as readonly string[]).includes(design);
}

type IconName = "phone" | "mail" | "clock" | "pin";

const ICON_PATHS: Record<IconName, ReactNode> = {
  phone: (
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  ),
  mail: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 6l-10 7L2 6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  pin: (
    <>
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
};

const HANDSET =
  "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z";

/** Outline icons for the phone; "phone-solid" and "whatsapp" are filled. */
const PHONE_ICON_PATHS: Record<Exclude<HeaderPhoneIcon, "phone-solid" | "whatsapp">, ReactNode> = {
  phone: <path d={HANDSET} />,
  "phone-call": (
    <>
      <path d={HANDSET} />
      <path d="M14.05 2a9 9 0 018 7.94M14.05 6A5 5 0 0118 10" />
    </>
  ),
  smartphone: (
    <>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M12 18h.01" />
    </>
  ),
  headset: (
    <>
      <path d="M3 11h3a2 2 0 012 2v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-5zm0 0a9 9 0 1118 0m0 0v5a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3z" />
      <path d="M21 16v2a4 4 0 01-4 4h-5" />
    </>
  ),
};

/** The phone icon the owner picked for this header (default: outline handset). */
function PhoneIcon({ header }: { header: HeaderData }) {
  const style = header.phoneIcon ?? "phone";
  if (style === "phone-solid" || style === "whatsapp") {
    const d = style === "whatsapp" ? BRAND_ICONS.whatsapp!.path : HANDSET;
    return (
      <svg className="wb-ch-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d={d} />
      </svg>
    );
  }
  return (
    <svg
      className="wb-ch-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PHONE_ICON_PATHS[style] ?? PHONE_ICON_PATHS.phone}
    </svg>
  );
}

function ContactIcon({ name }: { name: IconName }) {
  return (
    <svg
      className="wb-ch-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

function clean(value: string | undefined): string | undefined {
  const text = value?.trim();
  return text ? text : undefined;
}

/** The filled-in contact details; anything left empty is simply not shown. */
function contactOf(header: HeaderData) {
  return {
    phone: clean(header.phone),
    phoneLabel: clean(header.phoneLabel),
    email: clean(header.contactEmail),
    hours: clean(header.contactHours),
    address: clean(header.contactAddress),
  };
}

/** Inline "icon + value" items for top strips: phone, email, hours, address. */
function ContactInline({ header, include }: { header: HeaderData; include: IconName[] }) {
  const contact = contactOf(header);
  const items: ReactNode[] = [];
  if (include.includes("phone") && contact.phone) {
    items.push(
      <PhoneLink key="phone" value={contact.phone} className="wb-ch-item wb-ch-item-phone">
        <PhoneIcon header={header} />
        <span>{contact.phone}</span>
      </PhoneLink>,
    );
  }
  if (include.includes("mail") && contact.email) {
    items.push(
      <EmailLink key="mail" value={contact.email} className="wb-ch-item">
        <ContactIcon name="mail" />
        <span>{contact.email}</span>
      </EmailLink>,
    );
  }
  if (include.includes("clock") && contact.hours) {
    items.push(
      <span key="clock" className="wb-ch-item">
        <ContactIcon name="clock" />
        <span>{contact.hours}</span>
      </span>,
    );
  }
  if (include.includes("pin") && contact.address) {
    items.push(
      <span key="pin" className="wb-ch-item">
        <ContactIcon name="pin" />
        <span>{contact.address}</span>
      </span>,
    );
  }
  return items.length ? <div className="wb-ch-inline">{items}</div> : null;
}

/** Phone with a round icon; the small label above the number ("Call us 24/7") shows only when set. */
function PhoneBlock({ header, compact = false }: { header: HeaderData; compact?: boolean }) {
  const { phone, phoneLabel } = contactOf(header);
  if (!phone) return null;
  return (
    <PhoneLink value={phone} className={`wb-ch-phone-block${compact ? " wb-ch-phone-compact" : ""}`}>
      <span className="wb-ch-phone-icon">
        <PhoneIcon header={header} />
      </span>
      <span className="wb-ch-phone-text">
        {phoneLabel && <span className="wb-ch-phone-label">{phoneLabel}</span>}
        <span className="wb-ch-phone-number">{phone}</span>
      </span>
    </PhoneLink>
  );
}

/** Stacked info card (icon, small label, value) for the stacked design's top row. */
function InfoCard({ icon, label, children }: { icon: ReactNode; label?: string; children: ReactNode }) {
  return (
    <div className="wb-ch-card">
      <span className="wb-ch-card-icon">{icon}</span>
      <span className="wb-ch-card-text">
        {label && <span className="wb-ch-card-label">{label}</span>}
        <span className="wb-ch-card-value">{children}</span>
      </span>
    </div>
  );
}

function InfoCards({ header }: { header: HeaderData }) {
  const contact = contactOf(header);
  const cards: ReactNode[] = [];
  if (contact.phone) {
    cards.push(
      <InfoCard key="phone" icon={<PhoneIcon header={header} />} label={contact.phoneLabel}>
        <PhoneLink value={contact.phone} />
      </InfoCard>,
    );
  }
  if (contact.email) {
    cards.push(
      <InfoCard key="mail" icon={<ContactIcon name="mail" />} label="Email us">
        <EmailLink value={contact.email} />
      </InfoCard>,
    );
  }
  if (contact.hours) {
    cards.push(
      <InfoCard key="clock" icon={<ContactIcon name="clock" />} label="Opening hours">
        {contact.hours}
      </InfoCard>,
    );
  }
  if (contact.address) {
    cards.push(
      <InfoCard key="pin" icon={<ContactIcon name="pin" />} label="Visit us">
        {contact.address}
      </InfoCard>,
    );
  }
  return cards.length ? <div className="wb-ch-cards">{cards}</div> : null;
}

/** Round tap-to-call button shown next to the menu button on phones and tablets. */
function MobileCallButton({ header }: { header: HeaderData }) {
  const href = header.mobileCallButton === false ? null : telHref(header.phone);
  if (!href) return null;
  return (
    <a href={href} className="wb-ch-call-btn" aria-label={`Call ${header.phone?.trim()}`}>
      <PhoneIcon header={header} />
    </a>
  );
}

function UtilityLinks({ header }: { header: HeaderData }) {
  const links = header.utilityLinks?.filter((link) => link.label.trim()) ?? [];
  if (!links.length) return null;
  return (
    <div className="wb-ch-utility">
      {links.map((link) => (
        <a key={`${link.label}-${link.href}`} href={link.href}>
          {link.label}
        </a>
      ))}
    </div>
  );
}

/** Phone, email and hours at the bottom of the mobile menu, for every header design. */
export function DrawerContact({ header }: { header: HeaderData }) {
  const contact = contactOf(header);
  if (!contact.phone && !(isContactHeaderDesign(header.design) && (contact.email || contact.hours))) return null;
  return (
    <div className="wb-ch-drawer">
      <ContactInline header={header} include={isContactHeaderDesign(header.design) ? ["phone", "mail", "clock"] : ["phone"]} />
    </div>
  );
}

export type ContactHeaderSlots = {
  header: HeaderData & { design: ContactHeaderDesign };
  className: string;
  style?: CSSProperties;
  brand: ReactNode;
  /** Main navigation (null when the menu is empty). */
  nav: ReactNode;
  /** CTA buttons. */
  actions: ReactNode;
  mobileToggle: ReactNode;
  announcement: ReactNode;
  drawer: ReactNode;
};

/** Renders the phone-first header designs; SiteHeader passes in the shared brand, nav, buttons and drawer. */
export function ContactHeader({ header, className, style, brand, nav, actions, mobileToggle, announcement, drawer }: ContactHeaderSlots) {
  const mobile = (
    <>
      <MobileCallButton header={header} />
      {mobileToggle}
    </>
  );

  let body: ReactNode;
  switch (header.design) {
    case "contact-topbar": {
      const contact = <ContactInline header={header} include={["phone", "mail", "clock", "pin"]} />;
      const utility = <UtilityLinks header={header} />;
      body = (
        <>
          {(contact || utility) && (
            <div className="wb-ch-topbar">
              <div className="wb-container wb-ch-topbar-inner">
                {contact}
                {utility}
              </div>
            </div>
          )}
          <div className="wb-container wb-header-inner">
            {brand}
            {nav}
            <div className="wb-header-actions">
              {actions}
              {mobile}
            </div>
          </div>
        </>
      );
      break;
    }
    case "call-now":
      body = (
        <div className="wb-container wb-header-inner">
          {brand}
          {nav}
          <div className="wb-header-actions">
            <div className="wb-ch-desktop-only">
              <PhoneBlock header={header} />
            </div>
            {actions}
            {mobile}
          </div>
        </div>
      );
      break;
    case "contact-stacked":
      body = (
        <>
          <div className="wb-container wb-ch-stacked-top">
            {brand}
            <InfoCards header={header} />
            <div className="wb-ch-mobile-only wb-header-actions">{mobile}</div>
          </div>
          <div className="wb-ch-navbar">
            <div className="wb-container wb-ch-navbar-inner">
              {nav}
              {actions}
            </div>
          </div>
        </>
      );
      break;
    case "centered-phone":
      body = (
        <>
          <div className="wb-container wb-ch-centered-top">
            <div className="wb-ch-centered-side">
              <PhoneBlock header={header} compact />
            </div>
            <div className="wb-ch-centered-brand">{brand}</div>
            <div className="wb-ch-centered-side wb-ch-centered-end">
              {actions}
              {mobile}
            </div>
          </div>
          {nav && (
            <div className="wb-ch-centered-nav">
              <div className="wb-container">{nav}</div>
            </div>
          )}
        </>
      );
      break;
  }

  return (
    <>
      {announcement}
      <header className={className} style={style}>
        {body}
      </header>
      {drawer}
    </>
  );
}
