import type { HeaderData, HeaderMenuItem } from "./types.ts";

export type ContactHeaderPreset = { key: string; label: string; description: string; data: () => Partial<HeaderData> };

const SERVICE_MENU = (): HeaderMenuItem[] => [
  { label: "Home", href: "/" },
  {
    label: "Services",
    href: "/services",
    children: [
      { label: "Repairs", href: "/services/repairs", description: "Same-day fixes" },
      { label: "Installations", href: "/services/installations", description: "New fittings and upgrades" },
      { label: "Maintenance", href: "/services/maintenance", description: "Yearly service plans" },
    ],
  },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Contact", href: "/contact" },
];

const CONTACT = {
  phone: "+91 98765 43210",
  contactEmail: "hello@example.com",
  contactHours: "Mon–Sat, 9am–7pm",
  contactAddress: "12 MG Road, Bengaluru",
};

/** Phone-first headers for service businesses; every contact item can be edited or cleared. */
export const CONTACT_HEADER_PRESETS: ContactHeaderPreset[] = [
  {
    key: "header-contact-topbar",
    label: "Contact top bar header",
    description: "Thin top strip with phone, email, hours and address; logo, menu and button below.",
    data: () => ({
      design: "contact-topbar",
      siteName: "Brightline Services",
      menu: SERVICE_MENU(),
      ...CONTACT,
      utilityLinks: [{ label: "FAQ", href: "/faq" }],
      cta: { label: "Get a quote", href: "/contact" },
      sticky: true,
    }),
  },
  {
    key: "header-call-now",
    label: "Call now header",
    description: "Logo, menu, and a large \"Call us\" phone number beside the main button.",
    data: () => ({
      design: "call-now",
      siteName: "Brightline Services",
      menu: SERVICE_MENU(),
      phone: CONTACT.phone,
      phoneLabel: "Call us 24/7",
      cta: { label: "Book now", href: "/contact" },
      sticky: true,
    }),
  },
  {
    key: "header-contact-stacked",
    label: "Contact stacked header",
    description: "Logo with phone, email and hours cards on top; a coloured menu bar with a button below.",
    data: () => ({
      design: "contact-stacked",
      siteName: "Brightline Services",
      menu: SERVICE_MENU(),
      phone: CONTACT.phone,
      contactEmail: CONTACT.contactEmail,
      contactHours: CONTACT.contactHours,
      cta: { label: "Free estimate", href: "/contact" },
    }),
  },
  {
    key: "header-centered-phone",
    label: "Centered logo with phone header",
    description: "Phone on the left, logo in the middle, button on the right; menu centred underneath.",
    data: () => ({
      design: "centered-phone",
      siteName: "Brightline Services",
      menu: SERVICE_MENU(),
      phone: CONTACT.phone,
      phoneLabel: "Reservations",
      cta: { label: "Book a table", href: "/contact" },
    }),
  },
];
