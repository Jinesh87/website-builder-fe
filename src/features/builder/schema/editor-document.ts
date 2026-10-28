import { z } from "zod";
import { FONT_KEYS, SECTION_PRESETS, SECTION_TYPES, type SectionType } from "../../../site-kit/index.ts";

/** Stored editor document format. The server rejects any other version. */
export const EDITOR_SCHEMA_VERSION = 1;

const sectionTypeSchema = z.enum(SECTION_TYPES as [SectionType, ...SectionType[]]);

const puckItemTypeSchema = z.enum([
  ...SECTION_TYPES,
  ...SECTION_PRESETS.map((p) => p.key),
] as [string, ...string[]]);

export const sectionCustomColorsSchema = z
  .object({
    background: z.string().optional(),
    text: z.string().optional(),
    primary: z.string().optional(),
    muted: z.string().optional(),
    border: z.string().optional(),
    gradientFrom: z.string().optional(),
    gradientTo: z.string().optional(),
  })
  .optional();

export const sectionSettingsSchema = z.object({
  background: z.enum(["default", "surface", "primary", "dark"]),
  hideOnMobile: z.boolean(),
  hideOnDesktop: z.boolean().optional(),
  spacing: z.enum(["none", "compact", "default", "relaxed"]).optional(),
  align: z.enum(["center", "left", "right"]).optional(),
  anchor: z.string().max(40).optional(),
  customColors: sectionCustomColorsSchema,
  font: z.enum(FONT_KEYS).optional(),
  fontSize: z.string().max(30).optional(),
  headingSize: z.string().max(30).optional(),
  bodySize: z.string().max(30).optional(),
  containerWidth: z.string().max(30).optional(),
  headingWeight: z.string().max(30).optional(),
  headingItalic: z.boolean().optional(),
  bodyWeight: z.string().max(30).optional(),
  bodyItalic: z.boolean().optional(),
});

/**
 * Structural shape of a section. Per-type `data` fields are validated by the
 * server's Joi schemas on every save; the client only guarantees the envelope.
 */
export const sectionEnvelopeSchema = z.object({
  id: z.string().min(1).max(128),
  type: sectionTypeSchema,
  hidden: z.boolean(),
  settings: sectionSettingsSchema,
  data: z.record(z.string(), z.unknown()),
});

/** One Puck content item as produced by the builder config. */
export const puckItemSchema = z.object({
  type: puckItemTypeSchema,
  props: z.object({
    id: z.string().min(1).max(128),
    hidden: z.boolean(),
    settings: sectionSettingsSchema,
    data: z.record(z.string(), z.unknown()),
  }),
});

export const puckContentSchema = z.array(puckItemSchema).max(60);

export const pageMetadataSchema = z.object({
  title: z.string().trim().min(1).max(120),
  slug: z.string().regex(/^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*)?$/),
  seoTitle: z.string().max(160).nullable(),
  seoDescription: z.string().max(320).nullable(),
});

/** Version-ready document for one page; the AI builder exchanges this shape too. */
export const editorDocumentSchema = z.object({
  schemaVersion: z.literal(EDITOR_SCHEMA_VERSION),
  pageId: z.string().uuid(),
  metadata: pageMetadataSchema,
  content: z.array(sectionEnvelopeSchema).max(60),
  updatedAt: z.string().datetime(),
  updatedBy: z.string().nullable(),
});

export type EditorDocument = z.infer<typeof editorDocumentSchema>;

export const aiClarificationSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  allowCustomInput: z.boolean().default(true),
});

export type AiClarification = z.infer<typeof aiClarificationSchema>;

export const createdPageEditSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  pageType: z.enum(["HOME", "ABOUT", "SERVICES", "CONTACT", "BLOG", "LANDING", "CUSTOM"]).default("CUSTOM"),
  showInNav: z.boolean().optional(),
  sections: z.array(sectionEnvelopeSchema),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export type CreatedPageEdit = z.infer<typeof createdPageEditSchema>;

export const updatedPageEditSchema = z.object({
  id: z.string().optional(),
  pageId: z.string().optional(),
  name: z.string().optional(),
  slug: z.string().optional(),
  showInNav: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  sections: z.array(sectionEnvelopeSchema).optional(),
});

export type UpdatedPageEdit = z.infer<typeof updatedPageEditSchema>;

export const navigationPatchSchema = z.object({
  menu: z
    .array(
      z.object({
        label: z.string(),
        href: z.string(),
        badge: z.string().optional(),
        children: z.array(z.object({ label: z.string(), href: z.string(), badge: z.string().optional() })).optional(),
      }),
    )
    .optional(),
  headerMenu: z
    .array(
      z.object({
        label: z.string(),
        href: z.string(),
        badge: z.string().optional(),
        children: z.array(z.object({ label: z.string(), href: z.string(), badge: z.string().optional() })).optional(),
      }),
    )
    .optional(),
  cta: z.object({ label: z.string(), href: z.string(), target: z.string().optional() }).nullable().optional(),
  headerCta: z.object({ label: z.string(), href: z.string(), target: z.string().optional() }).nullable().optional(),
  footerColumns: z
    .array(
      z.object({
        title: z.string(),
        links: z.array(z.object({ label: z.string(), href: z.string() })),
      }),
    )
    .optional(),
});

export type NavigationPatchEdit = z.infer<typeof navigationPatchSchema>;

export const themePatchSchema = z.object({
  colors: z.record(z.string(), z.string()).optional(),
  fonts: z.object({ heading: z.string().optional(), body: z.string().optional() }).optional(),
  font: z.string().optional(),
});

export type ThemePatchEdit = z.infer<typeof themePatchSchema>;

/** A proposed AI change, reviewed as a before/after diff before it can be applied. */
export const aiSuggestionSchema = z.object({
  id: z.string().min(1),
  prompt: z.string().min(1).max(2000),
  summary: z.string().max(500),
  chatReply: z.string().optional(),
  clarification: aiClarificationSchema.optional(),
  target: z.discriminatedUnion("scope", [
    z.object({ scope: z.literal("chat") }),
    z.object({
      scope: z.literal("page"),
      /** True when the whole page was regenerated rather than patched. */
      rebuild: z.boolean().optional(),
      focusSectionId: z.string().optional(),
    }),
    z.object({ scope: z.literal("section"), sectionId: z.string().min(1) }),
    z.object({ scope: z.literal("site") }),
  ]),
  before: z.array(sectionEnvelopeSchema).max(60),
  after: z.array(sectionEnvelopeSchema).max(60),
  createdPages: z.array(createdPageEditSchema).optional(),
  updatedPages: z.array(updatedPageEditSchema).optional(),
  deletedPageIds: z.array(z.string()).optional(),
  navigationPatch: navigationPatchSchema.optional(),
  themePatch: themePatchSchema.optional(),
  /** Proposed SEO for the open page (AI-built websites); applied on accept. */
  seo: z
    .object({ pageId: z.string().min(1), seoTitle: z.string().max(160), seoDescription: z.string().max(320) })
    .optional(),
});

export type AiSuggestion = z.infer<typeof aiSuggestionSchema>;
