import type { FieldIssue } from "../../../api/http.ts";
import { SECTION_DEFINITIONS } from "../../../site-kit/index.ts";
import type { EditorDraft, Selection } from "./editor-state.ts";

export type SaveIssue = {
  message: string;
  pageId?: string;
  selection?: Selection;
};

type IssuePath = readonly (string | number)[];

/** Editor names for content keys whose generated label would read poorly. */
const FIELD_LABELS: Readonly<Record<string, string>> = {
  href: "link",
  label: "text",
  carouselSlides: "slides",
  children: "submenu items",
  menu: "menu items",
  social: "social links",
};

/** Joi prefixes its built-in messages with the quoted field name; custom messages are full sentences. */
const JOI_LABEL_PREFIX = /^"[^"]*"\s*/;

function humanize(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .replace(/\bcta\b/g, "button")
    .replace(/\burl\b/g, "URL");
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function singular(label: string): string {
  if (label.endsWith("ies")) return `${label.slice(0, -3)}y`;
  if (label.endsWith("s") && !label.endsWith("ss")) return label.slice(0, -1);
  return label;
}

/** `["carouselSlides", 2, "button", "href"]` becomes `["Slide 3", "Button", "Link"]`. */
function fieldSegments(path: IssuePath): string[] {
  const segments: string[] = [];
  path.forEach((part, index) => {
    if (typeof part === "number") return;
    const label = FIELD_LABELS[part] ?? humanize(part);
    const next = path[index + 1];
    segments.push(capitalize(typeof next === "number" ? `${singular(label)} ${next + 1}` : label));
  });
  return segments;
}

function issueMessage(location: string[], fieldPath: IssuePath, rawMessage: string): string {
  const segments = fieldSegments(fieldPath);
  if (!JOI_LABEL_PREFIX.test(rawMessage)) {
    return `${[...location, ...segments].join(" › ")}: ${rawMessage}`;
  }
  const field = segments.pop() ?? "Value";
  const sentence = `${field} ${rawMessage.replace(JOI_LABEL_PREFIX, "")}`;
  const crumbs = [...location, ...segments];
  return crumbs.length > 0 ? `${crumbs.join(" › ")}: ${sentence}` : sentence;
}

/**
 * Turns a Joi issue like `pages.0.sections.2.data.carouselSlides.1.button.href` into
 * "Home › Hero › Slide 2 › Button › Link: …" and the editor location to open.
 */
export function describeIssue(draft: EditorDraft, issue: FieldIssue): SaveIssue {
  const path = issue.path ?? [];
  const [root, pageIndex, child, sectionIndex] = path;

  if (root === "header" || root === "footer" || root === "theme") {
    return { message: issueMessage([capitalize(root)], path.slice(1), issue.message), selection: { kind: root } };
  }
  if (root === "pages" && typeof pageIndex === "number") {
    const page = draft.pages[pageIndex];
    if (!page) return { message: issueMessage([], path.slice(2), issue.message) };
    if (child === "sections" && typeof sectionIndex === "number") {
      const section = page.sections[sectionIndex];
      if (section) {
        const fieldPath = path[4] === "data" ? path.slice(5) : path.slice(4);
        return {
          message: issueMessage([page.name, SECTION_DEFINITIONS[section.type].label], fieldPath, issue.message),
          pageId: page.id,
          selection: { kind: "section", sectionId: section.id },
        };
      }
    }
    return { message: issueMessage([page.name], path.slice(2), issue.message), pageId: page.id, selection: { kind: "page" } };
  }
  return { message: issueMessage([], path, issue.message) };
}
