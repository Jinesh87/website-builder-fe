import { useState } from "react";
import { Modal } from "@heroui/react";
import { AlertCircle, Check, Copy, Eye, Globe, Plus, X } from "lucide-react";
import { errorMessage } from "../../../api/http.ts";
import {
  websitesApi,
  type ThemeOption,
  type WebsiteDetail,
  type WebsitePage,
} from "../../../api/websites.ts";
import { AiSparklesIcon } from "../../../components/icons/AiSparklesIcon.tsx";

import {
  DEFAULT_FONT,
  isFontKey,
  type FooterData,
  type HeaderData,
  type HeaderFeatured,
  type HeaderMenuItem,
  type HeaderStatusColor,
  type HeaderSubMenuItem,
  type IconName,
  type LinkRef,
  type ThemeSettings,
} from "../../../site-kit/index.ts";
import {
  LIMITS,
  menuFromPages,
  PAGE_SLUG_PATTERN,
  type PageMetaPatch,
} from "./editor-state.ts";
import {
  CheckboxField,
  ColorField,
  FormGroup,
  ImageField,
  ItemList,
  LinkField,
  OptionalLinkField,
  SelectField,
  TextAreaField,
  TextField,
} from "./fields.tsx";
import { FontPicker } from "./FontPicker.tsx";
import { getLiveSiteDomain } from "../../../utils/live-url.ts";

/** Mirrors the API's page validator. */
const MAX_SEO_KEYWORDS = 10;
const MAX_SEO_KEYWORD_LENGTH = 60;

const linkTitle = (link: { label: string }) => link.label;
const newLink = (): LinkRef => ({ label: "Link", href: "/" });
const renderLink = (item: LinkRef, update: (item: LinkRef) => void) => (
  <LinkField label="Link" value={item} onChange={update} />
);
const newMenuItem = (): HeaderMenuItem => ({ label: "New link", href: "/" });
const newSubMenuItem = (): HeaderSubMenuItem => ({
  label: "Submenu item",
  href: "/",
});

const MENU_ICON_OPTIONS: { value: IconName | ""; label: string }[] = [
  { value: "", label: "Default (Layers)" },
  { value: "layers", label: "Layers" },
  { value: "box", label: "Box / Product" },
  { value: "bolt", label: "Lightning / Speed" },
  { value: "rocket", label: "Rocket / Launch" },
  { value: "sparkles", label: "Sparkles / AI" },
  { value: "chart", label: "Chart / Analytics" },
  { value: "wallet", label: "Wallet / Payments" },
  { value: "shield", label: "Shield / Security" },
  { value: "lock", label: "Lock / Privacy" },
  { value: "cloud", label: "Cloud / Hosting" },
  { value: "code", label: "Code / API" },
  { value: "tools", label: "Tools / Integrations" },
  { value: "gear", label: "Settings" },
  { value: "user", label: "User / Account" },
  { value: "chat", label: "Chat / Support" },
  { value: "mail", label: "Mail / Contact" },
  { value: "phone", label: "Phone" },
  { value: "bell", label: "Bell / Alerts" },
  { value: "clock", label: "Clock / History" },
  { value: "help", label: "Help / Docs" },
  { value: "star", label: "Star / Featured" },
  { value: "heart", label: "Heart / Community" },
  { value: "check", label: "Check / Verified" },
  { value: "pointer", label: "Pointer / Interactive" },
];

const STATUS_COLOR_OPTIONS: { value: HeaderStatusColor; label: string }[] = [
  { value: "green", label: "Green (Online / Healthy)" },
  { value: "blue", label: "Blue (Info)" },
  { value: "orange", label: "Orange (Degraded)" },
  { value: "purple", label: "Purple (Beta / Preview)" },
  { value: "red", label: "Red (Live / Incident)" },
];

const DESIGNS_WITH_STATUS_COLOR: HeaderData["design"][] = [
  "glass-dock",
  "split-stacked",
  "headline-ticker",
];
const DESIGNS_WITH_SEARCH: HeaderData["design"][] = [
  "glass-dock",
  "command-bar",
  "mega-menu-grid",
  "ecommerce",
];
const DESIGNS_WITH_CURTAIN: HeaderData["design"][] = [
  "side-drawer",
  "luxury-editorial",
];

function MenuItemEditor({
  item,
  onChange,
}: {
  item: HeaderMenuItem;
  onChange: (item: HeaderMenuItem) => void;
}) {
  const [showSubmenu, setShowSubmenu] = useState(
    () => (item.children?.length ?? 0) > 0,
  );

  return (
    <div className="flex flex-col gap-2.5">
      <LinkField
        label="Link"
        value={item}
        onChange={(patch) => onChange({ ...item, ...patch })}
      />
      <TextField
        label="Description (optional)"
        value={item.description ?? ""}
        onChange={(description) =>
          onChange({ ...item, description: description.trim() || undefined })
        }
        maxLength={140}
        placeholder="Shown in curtain menus and mega menu intros"
      />
      <TextField
        label="Badge (optional)"
        value={item.badge ?? ""}
        onChange={(badge) =>
          onChange({ ...item, badge: badge.trim() || undefined })
        }
        maxLength={20}
        placeholder="New, Pro, Hot..."
      />

      <div className="pt-1">
        <CheckboxField
          label="Enable dropdown submenu"
          checked={showSubmenu}
          onChange={(enabled) => {
            setShowSubmenu(enabled);
            if (!enabled) {
              onChange({ ...item, children: undefined });
            } else if (!item.children || item.children.length === 0) {
              onChange({ ...item, children: [newSubMenuItem()] });
            }
          }}
        />
      </div>

      {showSubmenu && (
        <div className="rounded-md border border-ed-border/80 bg-ed-subtle/40 p-2">
          <ItemList
            label="Dropdown items"
            items={item.children ?? []}
            max={12}
            onChange={(children) => onChange({ ...item, children })}
            create={newSubMenuItem}
            itemTitle={(sub) => sub.label}
            addLabel="Add dropdown item"
            renderItem={(sub, update) => (
              <div className="flex flex-col gap-2">
                <LinkField
                  label="Submenu link"
                  value={sub}
                  onChange={(patch) => update({ ...sub, ...patch })}
                />
                <TextField
                  label="Description (optional)"
                  value={sub.description ?? ""}
                  onChange={(description) =>
                    update({
                      ...sub,
                      description: description.trim() || undefined,
                    })
                  }
                  maxLength={100}
                  placeholder="Short subtext under item"
                />
                <TextField
                  label="Badge (optional)"
                  value={sub.badge ?? ""}
                  onChange={(badge) =>
                    update({ ...sub, badge: badge.trim() || undefined })
                  }
                  maxLength={20}
                  placeholder="New, Hot..."
                />
                <SelectField
                  label="Icon (mega menu)"
                  value={(sub.icon ?? "") as IconName | ""}
                  options={MENU_ICON_OPTIONS}
                  onChange={(icon) =>
                    update({ ...sub, icon: icon || undefined })
                  }
                />
              </div>
            )}
          />
        </div>
      )}
    </div>
  );
}

export function HeaderForm({
  header,
  pages = [],
  onChange,
}: {
  header: HeaderData;
  pages?: WebsitePage[];
  onChange: (header: HeaderData) => void;
}) {
  const { design, featured } = header;
  const statusColor =
    STATUS_COLOR_OPTIONS.find((option) => option.value === header.statusColor)
      ?.value ?? (design === "headline-ticker" ? "red" : "green");
  const updateFeatured = (patch: Partial<HeaderFeatured>) =>
    onChange({
      ...header,
      featured: { title: featured?.title ?? "", ...featured, ...patch },
    });

  return (
    <>
      <FormGroup title="Header design & layout">
        <SelectField
          label="Design layout"
          value={header.design}
          options={[
            {
              value: "glass-dock",
              label: "Glass dock (Segmented liquid glass island)",
            },
            {
              value: "split-stacked",
              label: "Split stacked (2-tier enterprise double-decker)",
            },
            {
              value: "command-bar",
              label: "Command bar (Centered spotlight search)",
            },
            {
              value: "mega-menu-grid",
              label: "Mega menu grid (Bento multi-column mega menu)",
            },
            {
              value: "side-drawer",
              label: "Side drawer (Slide-over off-canvas curtain)",
            },
            {
              value: "headline-ticker",
              label: "Headline ticker (Live broadcast marquee strip)",
            },
            {
              value: "luxury-editorial",
              label: "Luxury editorial (Numbered grid index & masthead)",
            },
            {
              value: "clean-transparent",
              label: "Clean transparent (Minimal header over your hero)",
            },
            {
              value: "classical",
              label: "Classical (Logo left, nav center, dual buttons)",
            },
            {
              value: "minimalist",
              label: "Minimalist (Nav left, centered logo, CTA right)",
            },
            {
              value: "comprehensive",
              label: "Comprehensive (Mega nav, CTA buttons)",
            },
            {
              value: "ecommerce",
              label: "E-commerce (Top search & cart bar, category tabs)",
            },
            {
              value: "floating",
              label: "Floating pill (Blurred floating island)",
            },
            {
              value: "transparent",
              label: "Transparent overlay (Hero overlay)",
            },
            { value: "logo-left", label: "Standard (Logo left, nav right)" },
            { value: "centered", label: "Standard (Logo & nav centered)" },
          ]}
          onChange={(design) =>
            onChange({ ...header, design: design as HeaderData["design"] })
          }
        />
        <SelectField
          label="Position & behavior"
          value={header.position ?? (header.sticky ? "sticky" : "static")}
          options={[
            { value: "static", label: "Static (Scrolls with page)" },
            { value: "sticky", label: "Sticky (Stays at top while scrolling)" },
            { value: "fixed", label: "Fixed (Fixed at top of screen)" },
            { value: "floating", label: "Floating (Floating island bar)" },
          ]}
          onChange={(position) =>
            onChange({
              ...header,
              position: position as HeaderData["position"],
              sticky: position === "sticky" || position === "floating",
            })
          }
        />
        <TextField
          label="Site name / Brand"
          value={header.siteName}
          onChange={(siteName) => onChange({ ...header, siteName })}
          maxLength={120}
          required
        />
        <TextField
          label="Tagline / Sub-label"
          value={header.tagline ?? ""}
          onChange={(tagline) =>
            onChange({ ...header, tagline: tagline || undefined })
          }
          maxLength={150}
          hint="Optional secondary brand subtitle or editorial volume label."
        />
        <TextField
          label="Badge / Version / Workspace"
          value={header.badge ?? ""}
          onChange={(badge) =>
            onChange({ ...header, badge: badge || undefined })
          }
          maxLength={40}
          hint="Optional pill badge (e.g. 'v2.6', 'Pro', 'ACME Corp')."
        />
        <TextField
          label="Status text"
          value={header.statusText ?? ""}
          onChange={(statusText) =>
            onChange({ ...header, statusText: statusText || undefined })
          }
          maxLength={60}
          hint="Optional status text (e.g. 'All systems online'). Also used as the ticker label and editorial edition line."
        />
        <TextField
          label="Announcement bar / Marquee"
          value={header.announcement ?? ""}
          onChange={(announcement) =>
            onChange({ ...header, announcement: announcement || undefined })
          }
          maxLength={200}
          hint={
            design === "headline-ticker"
              ? "Ticker headlines. Separate multiple headlines with | or •."
              : "Optional banner message displayed above the header."
          }
        />
        <OptionalLinkField
          label="Announcement link"
          value={header.announcementLink}
          onChange={(announcementLink) =>
            onChange({ ...header, announcementLink })
          }
          fallback={{ label: "Learn more", href: "/" }}
        />
      </FormGroup>

      {(DESIGNS_WITH_STATUS_COLOR.includes(design) ||
        DESIGNS_WITH_SEARCH.includes(design) ||
        DESIGNS_WITH_CURTAIN.includes(design) ||
        design === "split-stacked" ||
        design === "mega-menu-grid") && (
        <FormGroup title="Design content">
          {DESIGNS_WITH_STATUS_COLOR.includes(design) && (
            <SelectField
              label="Status indicator color"
              value={statusColor}
              options={STATUS_COLOR_OPTIONS}
              onChange={(statusColor) => onChange({ ...header, statusColor })}
            />
          )}

          {DESIGNS_WITH_SEARCH.includes(design) && (
            <>
              <CheckboxField
                label="Show search"
                checked={
                  design === "command-bar"
                    ? header.showSearch !== false
                    : (header.showSearch ?? Boolean(header.searchPlaceholder))
                }
                onChange={(showSearch) => onChange({ ...header, showSearch })}
              />
              <TextField
                label="Search placeholder"
                value={header.searchPlaceholder ?? ""}
                onChange={(searchPlaceholder) =>
                  onChange({
                    ...header,
                    searchPlaceholder: searchPlaceholder || undefined,
                  })
                }
                maxLength={100}
                placeholder="Search docs, products..."
              />
            </>
          )}

          {design === "split-stacked" && (
            <>
              <ItemList
                label="Utility links (top strip)"
                items={header.utilityLinks ?? []}
                max={8}
                onChange={(utilityLinks) =>
                  onChange({
                    ...header,
                    utilityLinks:
                      utilityLinks.length > 0 ? utilityLinks : undefined,
                  })
                }
                create={newLink}
                itemTitle={linkTitle}
                renderItem={renderLink}
                addLabel="Add utility link"
              />
              <TextField
                label="Currency / Region tag"
                value={header.currency ?? ""}
                onChange={(currency) =>
                  onChange({ ...header, currency: currency || undefined })
                }
                maxLength={10}
                placeholder="USD"
              />
            </>
          )}

          {design === "side-drawer" && (
            <TextField
              label="Menu button label"
              value={header.menuLabel ?? ""}
              onChange={(menuLabel) =>
                onChange({ ...header, menuLabel: menuLabel || undefined })
              }
              maxLength={30}
              placeholder="Menu"
            />
          )}

          {DESIGNS_WITH_CURTAIN.includes(design) && (
            <>
              <TextField
                label="Menu contact heading"
                value={header.contactLabel ?? ""}
                onChange={(contactLabel) =>
                  onChange({
                    ...header,
                    contactLabel: contactLabel || undefined,
                  })
                }
                maxLength={60}
                placeholder="Get in touch"
              />
              <TextField
                label="Menu contact email"
                type="email"
                value={header.contactEmail ?? ""}
                onChange={(contactEmail) =>
                  onChange({
                    ...header,
                    contactEmail: contactEmail.trim() || undefined,
                  })
                }
                maxLength={255}
                hint="Shown at the bottom of the full-height menu."
              />
            </>
          )}

          {design === "mega-menu-grid" && (
            <>
              <CheckboxField
                label="Show featured card in dropdowns"
                checked={Boolean(featured)}
                onChange={(on) =>
                  onChange({
                    ...header,
                    featured: on
                      ? {
                          title: "What's new",
                          description: "Discover the latest updates.",
                        }
                      : undefined,
                  })
                }
              />
              {featured && (
                <div className="flex flex-col gap-2.5">
                  <TextField
                    label="Featured badge"
                    value={featured.badge ?? ""}
                    onChange={(badge) =>
                      updateFeatured({ badge: badge || undefined })
                    }
                    maxLength={30}
                    placeholder="New"
                  />
                  <TextField
                    label="Featured title"
                    value={featured.title}
                    onChange={(title) => updateFeatured({ title })}
                    maxLength={80}
                    required
                  />
                  <TextAreaField
                    label="Featured description"
                    value={featured.description ?? ""}
                    onChange={(description) =>
                      updateFeatured({ description: description || undefined })
                    }
                    maxLength={200}
                    rows={2}
                  />
                  <OptionalLinkField
                    label="Featured link"
                    value={featured.link}
                    onChange={(link) => updateFeatured({ link })}
                    fallback={{ label: "Learn more", href: "/" }}
                  />
                </div>
              )}
            </>
          )}
        </FormGroup>
      )}

      <FormGroup title="Logo & Brand display">
        <SelectField
          label="Logo & brand layout"
          value={header.logoDisplay ?? "auto"}
          options={[
            {
              value: "auto",
              label: "Smart / Auto (Logo if uploaded, else Brand text)",
            },
            {
              value: "logo_left",
              label: "Logo + Name (Logo on left, Name on right)",
            },
            {
              value: "logo_right",
              label: "Logo + Name (Name on left, Logo on right)",
            },
            {
              value: "logo_top",
              label: "Logo + Name (Logo on top, Name below)",
            },
            { value: "logo_only", label: "Logo image only" },
            { value: "text_only", label: "Brand text only" },
          ]}
          onChange={(logoDisplay) =>
            onChange({
              ...header,
              logoDisplay: logoDisplay as HeaderData["logoDisplay"],
            })
          }
        />
        <ImageField
          label="Logo image"
          value={header.logo}
          onChange={(logo) => onChange({ ...header, logo })}
          optional
        />
      </FormGroup>

      <FormGroup title="Navigation menu & dropdowns">
        <button
          type="button"
          onClick={() => onChange({ ...header, menu: menuFromPages(pages) })}
          className="self-start text-xs text-brand hover:underline"
        >
          Rebuild menu from my pages
        </button>
        <ItemList
          label="Menu items"
          items={header.menu}
          max={LIMITS.menuLinks}
          onChange={(menu) => onChange({ ...header, menu })}
          create={newMenuItem}
          itemTitle={linkTitle}
          renderItem={(item, update) => (
            <MenuItemEditor item={item} onChange={update} />
          )}
          addLabel="Add menu item"
        />
      </FormGroup>

      <FormGroup title="Action buttons (CTAs)">
        <OptionalLinkField
          label="Primary button (CTA)"
          value={header.cta}
          onChange={(cta) => onChange({ ...header, cta })}
          fallback={{ label: "Sign up", href: "/signup" }}
        />
        <OptionalLinkField
          label="Secondary button (e.g. Log in / Contact)"
          value={header.secondaryCta}
          onChange={(secondaryCta) => onChange({ ...header, secondaryCta })}
          fallback={{ label: "Log in", href: "/login" }}
        />
      </FormGroup>
    </>
  );
}

export function FooterForm({
  footer,
  pages = [],
  onChange,
}: {
  footer: FooterData;
  pages?: WebsitePage[];
  onChange: (footer: FooterData) => void;
}) {
  const contact = footer.contact ?? {};
  const updateContact = (
    patch: Partial<NonNullable<FooterData["contact"]>>,
  ) => {
    const next = { ...contact, ...patch };
    const hasAny = Object.values(next).some((value) => value?.trim());
    onChange({ ...footer, contact: hasAny ? next : undefined });
  };

  const newsletter = footer.newsletter ?? {};
  const updateNewsletter = (
    patch: Partial<NonNullable<FooterData["newsletter"]>>,
  ) => {
    onChange({ ...footer, newsletter: { ...newsletter, ...patch } });
  };

  const ctaBanner = footer.ctaBanner ?? {};
  const updateCtaBanner = (
    patch: Partial<NonNullable<FooterData["ctaBanner"]>>,
  ) => {
    onChange({ ...footer, ctaBanner: { ...ctaBanner, ...patch } });
  };

  const paymentMethods = footer.paymentMethods ?? {
    enabled: true,
    methods: ["paypal", "amex", "discover", "mastercard", "visa"],
  };
  const updatePaymentMethods = (
    patch: Partial<NonNullable<FooterData["paymentMethods"]>>,
  ) => {
    onChange({ ...footer, paymentMethods: { ...paymentMethods, ...patch } });
  };

  const showColumns =
    footer.design === "columns" ||
    footer.design === "mega" ||
    footer.design === "cta-banner" ||
    footer.design === "split";
  const showHorizontalMenu =
    footer.design === "newsletter" ||
    footer.design === "inline" ||
    footer.design === "centered" ||
    footer.design === "split";

  return (
    <>
      <FormGroup title="Footer design & style">
        <SelectField
          label="Design layout"
          value={footer.design}
          options={[
            {
              value: "mega",
              label: "Mega store (Categories, contact, social, payment badges)",
            },
            {
              value: "newsletter",
              label: "Newsletter & links (Horizontal nav + subscribe form)",
            },
            {
              value: "split",
              label: "Split navigation (Brand & social + links + contact)",
            },
            {
              value: "inline",
              label: "Inline bar (Single-row logo, links & social)",
            },
            {
              value: "centered",
              label: "Centered brand (Centered stack & links)",
            },
            {
              value: "cta-banner",
              label: "CTA banner (Top call-to-action banner + links)",
            },
            {
              value: "columns",
              label: "Multi-column (Organized link columns)",
            },
            { value: "simple", label: "Simple (Minimal single line)" },
          ]}
          onChange={(design) =>
            onChange({ ...footer, design: design as FooterData["design"] })
          }
        />
        <SelectField
          label="Color theme mode"
          value={footer.themeMode ?? "auto"}
          options={[
            { value: "auto", label: "Default (Follow site theme)" },
            { value: "dark", label: "Dark (Deep sleek dark background)" },
            { value: "light", label: "Light (Clean white background)" },
          ]}
          onChange={(themeMode) =>
            onChange({
              ...footer,
              themeMode: themeMode as FooterData["themeMode"],
            })
          }
        />
        <TextField
          label="Site name / Brand"
          value={footer.siteName}
          onChange={(siteName) => onChange({ ...footer, siteName })}
          maxLength={120}
          required
        />
        <TextField
          label="Tagline / Brand subtext (optional)"
          value={footer.tagline ?? ""}
          onChange={(tagline) =>
            onChange({ ...footer, tagline: tagline || undefined })
          }
          maxLength={200}
          placeholder="Online Store"
        />
        <TextAreaField
          label="Short description"
          value={footer.description ?? ""}
          onChange={(description) =>
            onChange({ ...footer, description: description || undefined })
          }
          maxLength={500}
          rows={2}
        />
      </FormGroup>

      <FormGroup title="Brand logo & layout">
        <SelectField
          label="Logo & brand layout"
          value={footer.logoDisplay ?? "auto"}
          options={[
            {
              value: "auto",
              label: "Smart / Auto (Logo if uploaded, else Brand text)",
            },
            {
              value: "logo_left",
              label: "Logo + Name (Logo on left, Name on right)",
            },
            {
              value: "logo_right",
              label: "Logo + Name (Name on left, Logo on right)",
            },
            {
              value: "logo_top",
              label: "Logo + Name (Logo on top, Name below)",
            },
            { value: "logo_only", label: "Logo image only" },
            { value: "text_only", label: "Brand text only" },
          ]}
          onChange={(logoDisplay) =>
            onChange({
              ...footer,
              logoDisplay: logoDisplay as FooterData["logoDisplay"],
            })
          }
        />
        <ImageField
          label="Footer logo image"
          value={footer.logo}
          onChange={(logo) => onChange({ ...footer, logo })}
          optional
        />
      </FormGroup>

      <FormGroup title="Call to action (CTA) top banner">
        <CheckboxField
          label="Enable CTA top banner"
          checked={Boolean(footer.ctaBanner?.enabled)}
          onChange={(enabled) => updateCtaBanner({ enabled })}
        />
        {footer.ctaBanner?.enabled && (
          <div className="flex flex-col gap-2.5 pt-2">
            <TextField
              label="Banner headline"
              value={ctaBanner.heading ?? ""}
              onChange={(heading) =>
                updateCtaBanner({ heading: heading || undefined })
              }
              maxLength={200}
              placeholder="Ready to get started?"
            />
            <TextField
              label="Banner subtext"
              value={ctaBanner.subheading ?? ""}
              onChange={(subheading) =>
                updateCtaBanner({ subheading: subheading || undefined })
              }
              maxLength={500}
              placeholder="Join thousands of satisfied customers."
            />
            <OptionalLinkField
              label="Primary CTA button"
              value={ctaBanner.primaryCta}
              onChange={(primaryCta) => updateCtaBanner({ primaryCta })}
              fallback={{ label: "Get started", href: "/signup" }}
            />
            <OptionalLinkField
              label="Secondary button (optional)"
              value={ctaBanner.secondaryCta}
              onChange={(secondaryCta) => updateCtaBanner({ secondaryCta })}
              fallback={{ label: "Learn more", href: "/about" }}
            />
          </div>
        )}
      </FormGroup>

      {showHorizontalMenu && (
        <FormGroup title="Horizontal navigation links">
          <button
            type="button"
            onClick={() => onChange({ ...footer, menu: menuFromPages(pages) })}
            className="self-start text-xs text-brand hover:underline"
          >
            Rebuild links from my pages
          </button>
          <ItemList
            label="Menu links"
            items={footer.menu ?? []}
            max={12}
            onChange={(menu) => onChange({ ...footer, menu })}
            create={newLink}
            itemTitle={linkTitle}
            renderItem={renderLink}
            addLabel="Add menu link"
          />
        </FormGroup>
      )}

      {showColumns && (
        <FormGroup title="Link columns">
          <ItemList
            label="Columns"
            items={footer.columns}
            max={6}
            onChange={(columns) => onChange({ ...footer, columns })}
            create={() => ({ title: "Links", links: [newLink()] })}
            itemTitle={(column) => column.title}
            addLabel="Add column"
            renderItem={(column, update) => (
              <div className="flex flex-col gap-2.5">
                <TextField
                  label="Column title"
                  value={column.title}
                  onChange={(title) => update({ ...column, title })}
                  maxLength={60}
                  required
                />
                <ItemList
                  label="Column links"
                  items={column.links}
                  max={12}
                  onChange={(links) => update({ ...column, links })}
                  create={newLink}
                  itemTitle={linkTitle}
                  renderItem={renderLink}
                  addLabel="Add link"
                />
              </div>
            )}
          />
        </FormGroup>
      )}

      <FormGroup title="Newsletter subscription">
        <CheckboxField
          label="Enable newsletter signup box"
          checked={Boolean(
            footer.newsletter?.enabled ??
            (footer.design === "newsletter" || footer.design === "mega"),
          )}
          onChange={(enabled) => updateNewsletter({ enabled })}
        />
        <TextField
          label="Newsletter title"
          value={newsletter.title ?? ""}
          onChange={(title) => updateNewsletter({ title: title || undefined })}
          maxLength={100}
          placeholder="Subscribe to News"
        />
        <TextField
          label="Newsletter description"
          value={newsletter.description ?? ""}
          onChange={(description) =>
            updateNewsletter({ description: description || undefined })
          }
          maxLength={200}
          placeholder="Get the latest updates and offers."
        />
        <TextField
          label="Email input placeholder"
          value={newsletter.placeholder ?? ""}
          onChange={(placeholder) =>
            updateNewsletter({ placeholder: placeholder || undefined })
          }
          maxLength={100}
          placeholder="Enter email address"
        />
        <TextField
          label="Button label"
          value={newsletter.buttonText ?? ""}
          onChange={(buttonText) =>
            updateNewsletter({ buttonText: buttonText || undefined })
          }
          maxLength={50}
          placeholder="Subscribe"
        />
      </FormGroup>

      <FormGroup title="Contact details">
        <TextField
          label="Contact column title"
          value={contact.title ?? ""}
          onChange={(title) => updateContact({ title: title || undefined })}
          maxLength={60}
          placeholder="Contact Us"
        />
        <TextField
          label="Email address"
          type="email"
          value={contact.email ?? ""}
          onChange={(email) => updateContact({ email: email || undefined })}
          maxLength={255}
        />
        <TextField
          label="Phone number"
          type="tel"
          value={contact.phone ?? ""}
          onChange={(phone) => updateContact({ phone: phone || undefined })}
          maxLength={32}
        />
        <TextAreaField
          label="Physical address"
          value={contact.address ?? ""}
          onChange={(address) =>
            updateContact({ address: address || undefined })
          }
          maxLength={500}
          rows={2}
        />
        <TextField
          label="Business hours / extra info"
          value={contact.hours ?? ""}
          onChange={(hours) => updateContact({ hours: hours || undefined })}
          maxLength={200}
          placeholder="Mon - Fri: 9:00 AM - 6:00 PM"
        />
      </FormGroup>

      <FormGroup title="Social links">
        <ItemList
          label="Social profiles"
          items={footer.social}
          max={12}
          onChange={(social) => onChange({ ...footer, social })}
          create={() => ({
            label: "Instagram",
            href: "https://instagram.com/",
          })}
          itemTitle={linkTitle}
          renderItem={renderLink}
          addLabel="Add social link"
        />
      </FormGroup>

      <FormGroup title="Payment methods bar">
        <CheckboxField
          label="Show accepted payment badges"
          checked={paymentMethods.enabled !== false}
          onChange={(enabled) => updatePaymentMethods({ enabled })}
        />
        {paymentMethods.enabled !== false && (
          <TextField
            label="Payment badges (comma separated)"
            value={(
              paymentMethods.methods ?? [
                "paypal",
                "amex",
                "discover",
                "mastercard",
                "visa",
              ]
            ).join(", ")}
            onChange={(val) =>
              updatePaymentMethods({
                methods: val
                  .split(",")
                  .map((s) => s.trim().toLowerCase())
                  .filter(Boolean),
              })
            }
            hint="Supported: paypal, amex, discover, mastercard, visa, applepay"
          />
        )}
      </FormGroup>

      <FormGroup title="Copyright & legal links">
        <TextField
          label="Copyright line"
          value={footer.copyright}
          onChange={(copyright) => onChange({ ...footer, copyright })}
          maxLength={200}
        />
        <ItemList
          label="Legal links (Privacy, Terms...)"
          items={footer.legalLinks ?? []}
          max={6}
          onChange={(legalLinks) => onChange({ ...footer, legalLinks })}
          create={() => ({ label: "Privacy Policy", href: "/privacy" })}
          itemTitle={linkTitle}
          renderItem={renderLink}
          addLabel="Add legal link"
        />
      </FormGroup>
    </>
  );
}

const COLOR_LABELS: [keyof ThemeSettings["colors"], string][] = [
  ["primary", "Primary"],
  ["secondary", "Secondary"],
  ["background", "Background"],
  ["surface", "Tinted background"],
  ["text", "Text"],
  ["muted", "Soft text"],
];

export function ThemeForm({
  theme,
  presets,
  onChange,
}: {
  theme: ThemeSettings;
  presets: ThemeOption[];
  onChange: (theme: ThemeSettings) => void;
}) {
  return (
    <>
      {presets.length > 0 && (
        <FormGroup title="Colour styles">
          <div className="grid grid-cols-2 gap-2">
            {presets.map((preset) => {
              const { colors } = preset.settings;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onChange(preset.settings)}
                  className="rounded-md border border-line p-1.5 text-left hover:border-brand"
                >
                  <span
                    className="flex h-7 items-end gap-1 rounded p-1"
                    style={{ background: colors.background }}
                    aria-hidden
                  >
                    <span
                      className="h-4 w-6 rounded-sm"
                      style={{ background: colors.primary }}
                    />
                    <span
                      className="h-3 w-3 rounded-sm"
                      style={{ background: colors.secondary }}
                    />
                  </span>
                  <span className="mt-1 block truncate text-xs text-ink">
                    {preset.name}
                  </span>
                </button>
              );
            })}
          </div>
        </FormGroup>
      )}
      <FormGroup title="Colours">
        {COLOR_LABELS.map(([key, label]) => (
          <ColorField
            key={key}
            label={label}
            value={theme.colors[key]}
            onChange={(value) =>
              onChange({ ...theme, colors: { ...theme.colors, [key]: value } })
            }
          />
        ))}
      </FormGroup>
      <FormGroup title="Site font">
        <p className="-mt-1 text-ed-2xs leading-normal text-ed-muted">
          Used across the whole website. Any section can override it from its
          Style tab.
        </p>
        <FontPicker
          label="Site font"
          value={
            isFontKey(theme.fonts.heading) ? theme.fonts.heading : DEFAULT_FONT
          }
          onChange={(font) =>
            onChange({ ...theme, fonts: { heading: font, body: font } })
          }
        />
      </FormGroup>
      <FormGroup title="Style">
        <SelectField
          label="Buttons"
          value={theme.buttonStyle}
          options={[
            { value: "filled", label: "Filled" },
            { value: "outline", label: "Outline" },
          ]}
          onChange={(buttonStyle) => onChange({ ...theme, buttonStyle })}
        />
        <SelectField
          label="Cards"
          value={theme.cardStyle}
          options={[
            { value: "border", label: "Border" },
            { value: "shadow", label: "Shadow" },
            { value: "flat", label: "Flat" },
          ]}
          onChange={(cardStyle) => onChange({ ...theme, cardStyle })}
        />
        <SelectField
          label="Corners"
          value={theme.radius}
          options={[
            { value: "none", label: "Square" },
            { value: "sm", label: "Slightly rounded" },
            { value: "md", label: "Rounded" },
            { value: "lg", label: "Very rounded" },
          ]}
          onChange={(radius) => onChange({ ...theme, radius })}
        />
        <SelectField
          label="Spacing between sections"
          value={theme.sectionSpacing}
          options={[
            { value: "compact", label: "Compact" },
            { value: "normal", label: "Normal" },
            { value: "relaxed", label: "Relaxed" },
          ]}
          onChange={(sectionSpacing) => onChange({ ...theme, sectionSpacing })}
        />
        <SelectField
          label="Content width"
          value={theme.containerWidth}
          options={[960, 1120, 1200, 1320, 1440].map((value) => ({
            value,
            label: `${value}px`,
          }))}
          onChange={(containerWidth) => onChange({ ...theme, containerWidth })}
        />
      </FormGroup>
      <FormGroup title="Language & Localization">
        <SelectField
          label="Site language (<html lang>)"
          value={theme.language || "en"}
          options={[
            { value: "en", label: "English (en)" },
            { value: "es", label: "Spanish (es)" },
            { value: "fr", label: "French (fr)" },
            { value: "de", label: "German (de)" },
            { value: "it", label: "Italian (it)" },
            { value: "pt", label: "Portuguese (pt)" },
            { value: "nl", label: "Dutch (nl)" },
            { value: "ar", label: "Arabic (ar)" },
            { value: "hi", label: "Hindi (hi)" },
            { value: "ml", label: "Malayalam (ml)" },
            { value: "zh", label: "Chinese (zh)" },
            { value: "ja", label: "Japanese (ja)" },
          ]}
          onChange={(language) => onChange({ ...theme, language })}
        />
        <p className="-mt-1 text-ed-2xs text-ed-muted">
          Sets the primary HTML language tag for search engines, SEO, and screen readers.
        </p>
      </FormGroup>
    </>
  );
}

function SlugField({
  page,
  pages,
  onCommit,
}: {
  page: WebsitePage;
  pages: WebsitePage[];
  onCommit: (slug: string) => void;
}) {
  const [text, setText] = useState(page.slug);
  const [lastSlug, setLastSlug] = useState(page.slug);
  if (page.slug !== lastSlug) {
    setLastSlug(page.slug);
    setText(page.slug);
  }
  const normalized = text.trim().toLowerCase();
  const error =
    !PAGE_SLUG_PATTERN.test(normalized) || normalized === "/"
      ? 'Use "/" followed by lowercase words, e.g. /about-us'
      : pages.some((other) => other.id !== page.id && other.slug === normalized)
        ? "Another page already uses this URL"
        : undefined;

  function commit() {
    if (!error && normalized !== page.slug) onCommit(normalized);
  }

  return (
    <div
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") commit();
      }}
    >
      <TextField
        label="Page URL"
        value={text}
        onChange={setText}
        maxLength={160}
        error={text !== page.slug ? error : undefined}
        hint="Links and menu items pointing to this page update automatically."
      />
    </div>
  );
}

export function PageForm({
  page,
  pages,
  onChange,
  website,
}: {
  page: WebsitePage;
  pages: WebsitePage[];
  onChange: (patch: PageMetaPatch) => void;
  website?: WebsiteDetail | null;
}) {
  const isHome = page.slug === "/";
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [newKeywordInput, setNewKeywordInput] = useState("");
  const keywords = page.seoKeywords ?? [];
  const keywordLimitReached = keywords.length >= MAX_SEO_KEYWORDS;

  function addKeyword() {
    const keyword = newKeywordInput.trim().toLowerCase().slice(0, MAX_SEO_KEYWORD_LENGTH);
    if (!keyword || keywordLimitReached || keywords.includes(keyword)) return;
    onChange({ seoKeywords: [...keywords, keyword] });
    setNewKeywordInput("");
  }

  function removeKeyword(keyword: string) {
    onChange({ seoKeywords: keywords.filter((existing) => existing !== keyword) });
  }
  const [activeAssetPreview, setActiveAssetPreview] = useState<{
    title: string;
    filename: string;
    desc: string;
    content: string;
  } | null>(null);
  const [copiedModalContent, setCopiedModalContent] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  function getSitemapContent(): string {
    if (!website) return "";
    const dom = `https://${getLiveSiteDomain(website.subdomain, website.customDomain)}`;
    const visiblePages = website.draft.pages.filter((p) => p.visible);
    const lastMod = (website.publishedAt || website.draft.draftUpdatedAt || new Date().toISOString()).split("T")[0];

    const urls = visiblePages.map((p) => {
      const slug =
        p.slug === "/" ? "" : p.slug.startsWith("/") ? p.slug : `/${p.slug}`;
      const priority = p.slug === "/" ? "1.0" : "0.8";
      const changefreq = p.slug === "/" ? "daily" : "weekly";
      return `  <url>
    <loc>${dom}${slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
  }

  function getRobotsContent(): string {
    if (!website) return "";
    const dom = `https://${getLiveSiteDomain(website.subdomain, website.customDomain)}`;
    return `# Robots.txt generated automatically by Bytezora Engine
User-agent: *
Allow: /

# Directives for AI Search Agents
User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

# Sitemap
Sitemap: ${dom}/sitemap.xml`;
  }

  function copyModalContent() {
    if (!activeAssetPreview) return;
    navigator.clipboard.writeText(activeAssetPreview.content).catch(() => {});
    setCopiedModalContent(true);
    setTimeout(() => setCopiedModalContent(false), 2000);
  }

  const seoTitle = page.seoTitle ?? "";
  const seoDescription = page.seoDescription ?? "";

  const domain = getLiveSiteDomain(website?.subdomain, website?.customDomain);
  const cleanPath = isHome ? "" : page.slug.replace(/^\//, "");
  const previewUrl = `https://${domain}${cleanPath ? `/${cleanPath}` : ""}`;
  const displayTitle =
    seoTitle || (website?.name ? `${page.name} | ${website.name}` : page.name);
  const displayDescription =
    seoDescription ||
    (website?.info?.description
      ? `${website.info.description.slice(0, 150)}...`
      : "No meta description set yet. Search engines will automatically generate a snippet from your page content.");

  async function handleGenerateSeo() {
    if (!website) return;
    setIsGenerating(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // Gather relevant section headings & text for context
      const snippets = page.sections
        .filter((s) => !s.hidden)
        .map((s) => {
          const d = s.data as Record<string, unknown>;
          const h = [d.heading, d.title, d.siteName].find(
            (v) => typeof v === "string",
          );
          const sub = [d.subheading, d.tagline, d.subtitle].find(
            (v) => typeof v === "string",
          );
          const text = [d.text, d.description, d.body].find(
            (v) => typeof v === "string",
          );
          return [h, sub, typeof text === "string" ? text.slice(0, 100) : ""]
            .filter(Boolean)
            .join(" - ");
        })
        .filter(Boolean)
        .slice(0, 8)
        .join("\n");

      const res = await websitesApi.generatePageSeo(website.id, page.id, {
        pageName: page.name,
        pageSlug: page.slug,
        currentTitle: page.seoTitle,
        currentDescription: page.seoDescription,
        contentSummary: snippets,
      });

      const generatedKeywords = [
        ...new Set(
          (res.keywords ?? [])
            .map((keyword) => keyword.trim().toLowerCase().slice(0, MAX_SEO_KEYWORD_LENGTH))
            .filter(Boolean),
        ),
      ].slice(0, MAX_SEO_KEYWORDS);
      onChange({
        seoTitle: res.seoTitle,
        seoDescription: res.seoDescription,
        ...(generatedKeywords.length > 0 ? { seoKeywords: generatedKeywords } : {}),
      });
      setSuccessMsg("Generated Google-optimized SEO Title & Description!");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsGenerating(false);
    }
  }

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedUrl(label);
    setTimeout(() => setCopiedUrl(null), 2000);
  }

  return (
    <>
      <FormGroup title="Page">
        <TextField
          label="Page name"
          value={page.name}
          onChange={(name) => onChange({ name })}
          maxLength={120}
          required
        />
        {isHome ? (
          <p className="text-xs text-ink-muted">
            This is your home page. Its URL is always “/”.
          </p>
        ) : (
          <SlugField
            page={page}
            pages={pages}
            onCommit={(slug) => onChange({ slug })}
          />
        )}
        <CheckboxField
          label="Show in header menu"
          checked={page.showInNav}
          onChange={(showInNav) => onChange({ showInNav })}
        />
        {!isHome && (
          <CheckboxField
            label="Page is visible"
            checked={page.visible}
            onChange={(visible) => onChange({ visible })}
            hint="Hidden pages stay in your draft but won't be published."
          />
        )}
      </FormGroup>

      <FormGroup title="Search engines (SEO)">
        {/* Header action button */}
        <div className="flex flex-col gap-2 -mt-1">
          <p className="text-ed-2xs text-ed-muted">
            AI metadata & Google preview
          </p>
          {website && (
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerateSeo}
              className="group relative flex w-full items-center justify-center gap-2 rounded-md border border-brand/35 bg-linear-to-r from-brand/10 via-indigo-500/10 to-violet-500/15 px-3 py-1.5 text-xs font-semibold text-ed-text shadow-2xs hover:border-brand/60 hover:from-brand/20 hover:to-violet-500/25 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              {isGenerating ? (
                <>
                  <AiSparklesIcon
                    className="size-3.5 animate-spin shrink-0"
                    variant="glossy"
                  />
                  <span className="font-medium text-ed-muted whitespace-nowrap">Generating SEO with AI…</span>
                </>
              ) : (
                <>
                  <AiSparklesIcon
                    className="size-3.5 transition-transform duration-200 group-hover:scale-110 shrink-0"
                    variant="glossy"
                    glow
                  />
                  <span className="font-semibold text-ed-text whitespace-nowrap">
                    Generate with AI
                  </span>
                </>
              )}
            </button>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 p-2.5 text-ed-2xs text-red-600 dark:text-red-400">
            <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
            <p className="flex-1 leading-tight">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-2 text-ed-2xs font-medium text-emerald-600 dark:text-emerald-400">
            <Check className="size-3.5 shrink-0" />
            <p>{successMsg}</p>
          </div>
        )}

        {/* Google SERP Live Snippet Box */}
        <div className="rounded-ed border border-ed-border/80 bg-ed-panel p-2.5 shadow-2xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-ed-2xs text-ed-muted">
            <Globe className="size-3 text-ed-faint" />
            <span className="truncate">{previewUrl}</span>
          </div>
          <h4 className="text-ed-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline line-clamp-1 leading-tight">
            {displayTitle}
          </h4>
          <p className="text-ed-2xs text-ed-muted line-clamp-2 leading-relaxed">
            {displayDescription}
          </p>
        </div>

        {/* SEO Title field with live character count */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-ed-xs">
            <span className="font-medium text-ed-text">SEO title</span>
            <span
              className={`text-[10px] font-mono font-medium rounded px-1.5 py-0.5 ${
                seoTitle.length > 60
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  : seoTitle.length >= 35
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-ed-subtle text-ed-muted"
              }`}
            >
              {seoTitle.length}/60 chars
            </span>
          </div>
          <TextField
            label=""
            value={seoTitle}
            onChange={(val) => onChange({ seoTitle: val })}
            maxLength={160}
            hint="Displayed as the headline on Google. Recommended length: 40–60 characters."
          />
        </div>

        {/* SEO Description field with live character count */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-ed-xs">
            <span className="font-medium text-ed-text">SEO description</span>
            <span
              className={`text-[10px] font-mono font-medium rounded px-1.5 py-0.5 ${
                seoDescription.length > 160
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  : seoDescription.length >= 110
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-ed-subtle text-ed-muted"
              }`}
            >
              {seoDescription.length}/160 chars
            </span>
          </div>
          <TextAreaField
            label=""
            value={seoDescription}
            onChange={(val) => onChange({ seoDescription: val })}
            maxLength={320}
            rows={3}
            hint="Shown under the title in search results. Optimal length: 120–155 characters."
          />
        </div>

        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-ed-2xs font-semibold uppercase tracking-wider text-ed-muted">
              Target keywords
            </span>
            <span className="text-ed-2xs text-ed-muted">
              {keywords.length}/{MAX_SEO_KEYWORDS}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 min-h-6">
            {keywords.map((keyword) => (
              <span
                key={keyword}
                className="inline-flex items-center gap-1 rounded bg-ed-subtle border border-ed-border px-2 py-0.5 text-ed-2xs text-ed-text"
              >
                <span>{keyword}</span>
                <button
                  type="button"
                  onClick={() => removeKeyword(keyword)}
                  title="Remove keyword"
                  aria-label={`Remove keyword ${keyword}`}
                  className="text-ed-muted hover:text-red-500 rounded p-0.5 transition"
                >
                  <X className="size-2.5" />
                </button>
              </span>
            ))}
            {keywords.length === 0 && (
              <p className="text-ed-2xs text-ed-muted italic">
                Click “Generate with AI” or add keywords below.
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <input
              type="text"
              value={newKeywordInput}
              maxLength={MAX_SEO_KEYWORD_LENGTH}
              disabled={keywordLimitReached}
              onChange={(e) => setNewKeywordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addKeyword();
                }
              }}
              placeholder={keywordLimitReached ? "Keyword limit reached" : "Add keyword (press Enter)…"}
              aria-label="Add keyword"
              className="h-7 flex-1 rounded border border-ed-border bg-ed-panel px-2 text-ed-xs text-ed-text placeholder:text-ed-faint focus:border-ed-accent focus:outline-none disabled:opacity-50"
            />
            <button
              type="button"
              onClick={addKeyword}
              disabled={!newKeywordInput.trim() || keywordLimitReached}
              aria-label="Add keyword"
              className="inline-flex h-7 items-center justify-center rounded border border-ed-border bg-ed-subtle px-2 text-ed-xs text-ed-text hover:bg-ed-hover disabled:opacity-40 transition"
            >
              <Plus className="size-3" />
            </button>
          </div>
          <p className="text-ed-2xs text-ed-muted">
            Saved with the page and used by the AI SEO generator. Work them into your title, description and copy.
          </p>
        </div>

        {/* Automated Search Engine Assets Card */}
        {website && (
          <div className="mt-2 rounded-ed border border-ed-border/60 bg-ed-subtle/50 p-2.5 text-ed-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-ed-text">
                Search Engine Assets
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Auto-managed
              </span>
            </div>
            <div className="space-y-1.5 text-ed-muted font-mono text-ed-2xs">
              <div className="flex items-center justify-between">
                <span>/sitemap.xml</span>
                <div className="flex items-center gap-2 font-sans text-ed-2xs">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveAssetPreview({
                        title: "Sitemap XML",
                        filename: "sitemap.xml",
                        desc: "Google Search and web crawlers read this file to discover and index all your published pages automatically.",
                        content: getSitemapContent(),
                      })
                    }
                    className="inline-flex items-center gap-1 text-ed-text hover:text-indigo-500 cursor-pointer"
                  >
                    <Eye className="size-2.5" /> View
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      copyText(`https://${domain}/sitemap.xml`, "sitemap")
                    }
                    title="Copy full sitemap URL"
                    className="hover:text-ed-text"
                  >
                    {copiedUrl === "sitemap" ? (
                      <Check className="size-3 text-emerald-500" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>/robots.txt</span>
                <div className="flex items-center gap-2 font-sans text-ed-2xs">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveAssetPreview({
                        title: "Robots Directives",
                        filename: "robots.txt",
                        desc: "This file informs Googlebot and search spiders that your public pages are allowed to be crawled and points them to your sitemap.",
                        content: getRobotsContent(),
                      })
                    }
                    className="inline-flex items-center gap-1 text-ed-text hover:text-indigo-500 cursor-pointer"
                  >
                    <Eye className="size-2.5" /> View
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      copyText(`https://${domain}/robots.txt`, "robots")
                    }
                    title="Copy full robots URL"
                    className="hover:text-ed-text"
                  >
                    {copiedUrl === "robots" ? (
                      <Check className="size-3 text-emerald-500" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </FormGroup>

      {/* In-Editor File Preview Modal */}
      {activeAssetPreview && (
        <Modal.Backdrop
          isOpen
          onOpenChange={(open) => !open && setActiveAssetPreview(null)}
        >
          <Modal.Container size="md">
            <Modal.Dialog aria-label={activeAssetPreview.title}>
              <Modal.Header>
                <div className="flex items-center justify-between gap-3 w-full pr-6">
                  <div>
                    <Modal.Heading>{activeAssetPreview.title}</Modal.Heading>
                    <p className="font-mono text-xs text-ed-muted">
                      /{activeAssetPreview.filename}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={copyModalContent}
                    className="inline-flex items-center gap-1.5 rounded-md border border-ed-border bg-ed-subtle px-2.5 py-1 text-xs font-medium text-ed-text hover:bg-ed-hover transition"
                  >
                    {copiedModalContent ? (
                      <>
                        <Check className="size-3.5 text-emerald-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        <span>Copy File</span>
                      </>
                    )}
                  </button>
                </div>
              </Modal.Header>
              <Modal.Body>
                <div className="space-y-3">
                  <p className="text-xs text-ink-muted leading-relaxed">
                    {activeAssetPreview.desc}
                  </p>
                  <div className="relative rounded-lg border border-line bg-zinc-950 p-3.5 shadow-inner">
                    <pre className="max-h-80 overflow-auto font-mono text-xs text-zinc-200 whitespace-pre leading-relaxed select-all">
                      {activeAssetPreview.content}
                    </pre>
                  </div>
                  <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>
                      Auto-generated by Bytezora and served directly to search
                      engines upon deploy.
                    </span>
                  </div>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <button
                  type="button"
                  onClick={() => setActiveAssetPreview(null)}
                  className="rounded-md border border-ed-border bg-ed-panel px-3.5 py-1.5 text-xs font-semibold text-ed-text hover:bg-ed-subtle transition"
                >
                  Close
                </button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      )}
    </>
  );
}
