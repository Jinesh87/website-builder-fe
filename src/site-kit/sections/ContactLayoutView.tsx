import type { CSSProperties, ReactNode } from "react";
import {
  CONTACT_INFO_KIND_LABELS,
  contactInfoHref,
  contactMapEmbedUrl,
  resolveContactLayout,
} from "../contact-builder.ts";
import { safeHref } from "../links.ts";
import { SectionHead, SectionShell, SiteButton, SiteIcon, SiteImage, parseRichText } from "../primitives.tsx";
import type { ContactBlock, ContactCardStyle, ContactInfoKind, IconName, SectionOf } from "../types.ts";
import ContactForm from "./ContactFormBackup.tsx";

const SAFE_IMAGE_URL =
  /^(https?:\/\/\S+|\/(?!\/)\S*|data:image\/(?:png|jpe?g|webp|gif|svg\+xml|avif)(?:;[a-z0-9=_-]+)*;?(?:base64)?,[\s\S]*)$/i;

const INFO_ICONS: Record<ContactInfoKind, IconName | "pin"> = {
  email: "mail",
  phone: "phone",
  whatsapp: "chat",
  address: "pin",
  hours: "clock",
  link: "pointer",
  text: "help",
};

function PinIcon() {
  return (
    <svg className="wb-contact-ch-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M17.5 8.333c0 5-7.5 10-7.5 10s-7.5-5-7.5-10a7.5 7.5 0 1115 0z" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="10" cy="8.333" r="2.5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

type ContactSection = SectionOf<"contact">;

function InfoBlock({ block, cardStyle }: { block: Extract<ContactBlock, { type: "info" }>; cardStyle: ContactCardStyle }) {
  const value = block.value?.trim();
  if (!value) return null;
  const href = contactInfoHref(block.kind, value);
  const icon = block.icon ?? INFO_ICONS[block.kind];
  const className = block.boxed
    ? `wb-cl-info wb-contact-info-card wb-contact-card-style-${cardStyle}`
    : "wb-cl-info wb-cl-info-plain";
  const content = (
    <>
      <div className="wb-contact-icon-box">{icon === "pin" ? <PinIcon /> : <SiteIcon name={icon} />}</div>
      <div className="wb-contact-info-text">
        <span className="wb-contact-info-label">{block.label?.trim() || CONTACT_INFO_KIND_LABELS[block.kind]}</span>
        <strong className="wb-contact-info-value wb-cl-pre">{value}</strong>
      </div>
    </>
  );
  if (!href) return <div className={className}>{content}</div>;
  const external = /^https?:/i.test(href);
  return (
    <a
      href={safeHref(href)}
      className={className}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
    >
      {content}
    </a>
  );
}

function blockContent(block: ContactBlock, section: ContactSection): ReactNode {
  const { data } = section;
  switch (block.type) {
    case "heading": {
      if (!block.text?.trim()) return null;
      const Tag = block.level === 2 ? "h2" : "h3";
      return <Tag className={`wb-cl-heading wb-cl-heading-${block.level ?? 3}`}>{parseRichText(block.text)}</Tag>;
    }
    case "text":
      return block.text?.trim() ? <p className="wb-cl-text">{parseRichText(block.text)}</p> : null;
    case "badge":
      return block.text?.trim() ? (
        <div className="wb-contact-eyebrow-wrap">
          <span className="wb-contact-pulse-dot" />
          <span className="wb-contact-eyebrow">{block.text}</span>
        </div>
      ) : null;
    case "info":
      return <InfoBlock block={block} cardStyle={data.cardStyle || "default"} />;
    case "form":
      return (
        <ContactForm
          submitLabel={data.submitLabel || "Send message"}
          serviceOptions={data.serviceOptions}
          fields={data.formFields}
          sectionId={section.id}
        />
      );
    case "map": {
      const src = contactMapEmbedUrl(block.query ?? "");
      if (!src) return null;
      return (
        <div className={`wb-cl-map wb-cl-map-${block.height ?? "md"}`}>
          <iframe
            src={src}
            title={`Map of ${block.query}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      );
    }
    case "button":
      return block.label?.trim() ? (
        <div className="wb-cl-button">
          <SiteButton link={{ label: block.label, href: block.href || "#" }} tone={block.tone ?? "primary"} />
        </div>
      ) : null;
    case "image":
      return SAFE_IMAGE_URL.test(block.image?.url ?? "") ? (
        <SiteImage image={block.image} className="wb-cl-image" />
      ) : null;
    case "divider":
      return <hr className="wb-cl-divider" />;
    default:
      return null;
  }
}

function BlockView({ block, section }: { block: ContactBlock; section: ContactSection }) {
  const content = blockContent(block, section);
  if (!content) return null;
  if (!block.boxed || block.type === "info") return content;
  return <div className={`wb-cl-box wb-contact-card-style-${section.data.cardStyle || "default"}`}>{content}</div>;
}

/** The "custom" contact variant: columns of blocks arranged by the site owner. */
export default function ContactLayoutView({ section }: { section: ContactSection }) {
  const { data } = section;
  const layout = resolveContactLayout(data);
  const cardStyle = data.cardStyle || "default";
  const columns = layout.columns.filter((column) => column.blocks.length > 0);
  const style = {
    "--wb-cl-cols": columns.map((column) => `minmax(0, ${Math.min(Math.max(column.width, 1), 12)}fr)`).join(" "),
  } as CSSProperties;

  return (
    <SectionShell
      sectionId={section.id}
      settings={section.settings}
      className={`wb-contact-section wb-contact-variant-custom wb-align-${data.align || "left"}`}
      label={data.heading}
    >
      {data.showHeader !== false && <SectionHead heading={data.heading} intro={data.text} eyebrow={data.eyebrow} />}
      {columns.length > 0 && (
        <div
          className={[
            "wb-cl-grid",
            `wb-cl-gap-${layout.gap ?? "lg"}`,
            `wb-cl-align-${layout.align ?? "start"}`,
            layout.mobileReverse && "wb-cl-mobile-reverse",
          ]
            .filter(Boolean)
            .join(" ")}
          style={style}
        >
          {columns.map((column) => (
            <div
              key={column.id}
              className={`wb-cl-col${column.boxed ? ` wb-cl-box wb-contact-card-style-${cardStyle}` : ""}`}
            >
              {column.blocks.map((block) => (
                <BlockView key={block.id} block={block} section={section} />
              ))}
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
