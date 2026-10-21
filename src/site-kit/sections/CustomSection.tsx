import type { CSSProperties } from "react";
import { SectionShell, SiteButton, SiteIcon, SiteImage, parseRichText } from "../primitives.tsx";
import type { CustomBlock, SectionOf } from "../types.ts";

const SAFE_IMAGE_URL =
  /^(https?:\/\/\S+|\/(?!\/)\S*|data:image\/(?:png|jpe?g|webp|gif|svg\+xml|avif)(?:;[a-z0-9=_-]+)*;?(?:base64)?,[\s\S]*)$/i;

function BlockList({ blocks }: { blocks: CustomBlock[] | undefined }) {
  return (blocks ?? []).map((block, index) => <BlockView key={index} block={block} />);
}

function BlockView({ block }: { block: CustomBlock }) {
  switch (block.type) {
    case "stack":
      return (
        <div
          className={[
            "wb-cb-stack",
            block.direction === "row" && "wb-cb-row",
            `wb-cb-gap-${block.gap ?? "md"}`,
            `wb-cb-align-${block.align ?? "start"}`,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <BlockList blocks={block.children} />
        </div>
      );
    case "grid":
      return (
        <div
          className={`wb-cb-grid wb-cb-gap-${block.gap ?? "lg"} wb-cb-valign-${block.align ?? "start"}`}
          style={{ "--wb-cb-cols": block.columns, "--wb-cb-cols-tablet": Math.min(block.columns, 2) } as CSSProperties}
        >
          <BlockList blocks={block.children} />
        </div>
      );
    case "card":
      return (
        <div className={`wb-cb-card wb-cb-card-${block.tone ?? "default"}`}>
          <BlockList blocks={block.children} />
        </div>
      );
    case "heading": {
      const Tag = (`h${block.level ?? 2}`) as "h1" | "h2" | "h3";
      return <Tag className="wb-cb-heading">{parseRichText(block.text)}</Tag>;
    }
    case "text":
      return (
        <p className={`wb-cb-text wb-cb-text-${block.size ?? "md"}${block.muted ? " wb-muted" : ""}`}>
          {parseRichText(block.text)}
        </p>
      );
    case "badge":
      return <span className="wb-cb-badge">{block.text}</span>;
    case "button":
      return <SiteButton link={{ label: block.label, href: block.href }} tone={block.tone ?? "primary"} />;
    case "image":
      return SAFE_IMAGE_URL.test(block.url ?? "") ? (
        <SiteImage
          image={{ url: block.url, alt: block.alt }}
          className={`wb-cb-image wb-cb-aspect-${block.aspect ?? "auto"}`}
        />
      ) : null;
    case "icon":
      return (
        <span className="wb-cb-icon">
          <SiteIcon name={block.name} />
        </span>
      );
    case "list":
      return (
        <ul className="wb-cb-list">
          {(block.items ?? []).map((item, index) => (
            <li key={index}>{parseRichText(item)}</li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}

/** Free-form section rendered from an AI-composed block tree. */
export default function CustomSection({ section }: { section: SectionOf<"custom"> }) {
  const { data } = section;
  return (
    <SectionShell
      sectionId={section.id}
      settings={section.settings}
      label="Custom section"
      className={`wb-custom wb-custom-${data.width ?? "contained"} wb-custom-align-${data.align ?? "start"}`}
    >
      <div className="wb-custom-root">
        <BlockList blocks={data.blocks} />
      </div>
    </SectionShell>
  );
}
