import type { CSSProperties, ReactNode } from "react";
import { fontStack } from "./fonts.ts";
import { hasRichText, parseRichTextTree, type RichTextNode, type RichTextStyle } from "./rich-text-core.ts";

/**
 * Styles travel as custom properties; RICH_TEXT_CSS applies them with layered
 * `!important` rules so section-level typography overrides can't win over a
 * word the user styled explicitly.
 */
function richTextStyleVars(style: RichTextStyle): CSSProperties {
  const vars: Record<string, string> = {};
  if (style.color) vars["--rt-c"] = style.color;
  if (style.background) vars["--rt-bg"] = style.background;
  if (style.fontSize) vars["--rt-fs"] = style.fontSize;
  if (style.fontSizeTablet) vars["--rt-tfs"] = style.fontSizeTablet;
  if (style.fontSizeMobile) vars["--rt-mfs"] = style.fontSizeMobile;
  if (style.fontWeight) vars["--rt-fw"] = style.fontWeight;
  if (style.italic) vars["--rt-it"] = "italic";
  if (style.fontFamily) vars["--rt-ff"] = fontStack(style.fontFamily);
  if (style.letterSpacing) vars["--rt-ls"] = style.letterSpacing;
  if (style.lineHeight) vars["--rt-lh"] = style.lineHeight;
  if (style.textTransform) vars["--rt-tt"] = style.textTransform;
  if (style.textDecoration) vars["--rt-td"] = style.textDecoration;
  return vars as CSSProperties;
}

function renderNodes(nodes: RichTextNode[]): ReactNode[] {
  return nodes.map((node, index) => {
    if (typeof node === "string") return node;
    if (node.tag === "br") return <br key={index} />;
    const children = renderNodes(node.children);
    switch (node.tag) {
      case "strong":
        return <strong key={index}>{children}</strong>;
      case "em":
        return <em key={index}>{children}</em>;
      case "u":
        return <u key={index}>{children}</u>;
      case "s":
        return <s key={index}>{children}</s>;
      case "mark":
        return (
          <mark key={index} className="wb-text-gradient">
            {children}
          </mark>
        );
      case "span": {
        const className = [node.style && "wb-rt", node.className].filter(Boolean).join(" ") || undefined;
        return (
          <span key={index} className={className} style={node.style ? richTextStyleVars(node.style) : undefined}>
            {children}
          </span>
        );
      }
    }
  });
}

/** Renders stored rich text; plain strings come back untouched. */
export function parseRichText(text?: string | null): ReactNode {
  if (!text) return text ?? null;
  if (!hasRichText(text)) return text;
  return <>{renderNodes(parseRichTextTree(text))}</>;
}

export const RICH_TEXT_CSS = `
@layer wb-rich-text {
  .wb-rt:not([style*="--rt-fs"]) { font-size: inherit !important; }
  .wb-rt:not([style*="--rt-fw"]) { font-weight: inherit !important; }
  .wb-rt:not([style*="--rt-it"]) { font-style: inherit !important; }
  .wb-rt[style*="--rt-c"] { color: var(--rt-c) !important; -webkit-text-fill-color: var(--rt-c) !important; }
  .wb-rt[style*="--rt-bg"] {
    background-color: var(--rt-bg) !important;
    padding: 0 0.12em;
    border-radius: 0.18em;
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
  }
  .wb-rt[style*="--rt-fs"] { font-size: var(--rt-fs) !important; }
  .wb-rt[style*="--rt-fw"] { font-weight: var(--rt-fw) !important; }
  .wb-rt[style*="--rt-it"] { font-style: italic !important; }
  .wb-rt[style*="--rt-ff"] { font-family: var(--rt-ff) !important; }
  .wb-rt[style*="--rt-ls"] { letter-spacing: var(--rt-ls) !important; }
  .wb-rt[style*="--rt-lh"] { line-height: var(--rt-lh) !important; }
  .wb-rt[style*="--rt-tt"] { text-transform: var(--rt-tt) !important; }
  .wb-rt[style*="--rt-td"] { text-decoration-line: var(--rt-td) !important; }
  @container wb-site (max-width: 900px) {
    .wb-rt[style*="--rt-tfs"] { font-size: var(--rt-tfs) !important; }
  }
  @container wb-site (max-width: 600px) {
    .wb-rt[style*="--rt-mfs"] { font-size: var(--rt-mfs) !important; }
  }
}
`;
