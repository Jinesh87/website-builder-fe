import type { FooterData, HeaderData, Section, ThemeSettings } from "../site-kit/index.ts";
import type { AiSuggestion } from "../features/builder/schema/editor-document.ts";
import { ApiError, request, requestNdjson } from "./http.ts";

export type AiGenerateInput = {
  prompt: string;
  scope: "section" | "page";
  sectionId?: string;
  currentSection?: Section;
  currentSections?: Section[];
  /** Page open in the editor; lets the AI see and update its SEO. */
  pageId?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
};

/** A section position in the AI's planned layout; `pending` sections are still being generated. */
export type AiLayoutSlot = { id: string; type: string; status: "existing" | "pending" | "updating" };

type AiStreamEvent =
  | { type: "plan"; layout: AiLayoutSlot[] }
  | { type: "result"; suggestion: AiSuggestion }
  | { type: "error"; error: { code: string; message: string } };

export type BuilderType = "MANUAL" | "AI";
export type WebsiteStatus = "DRAFT" | "PUBLISHED" | "UNPUBLISHED";
export type PageType = "HOME" | "ABOUT" | "SERVICES" | "CONTACT" | "BLOG" | "LANDING" | "CUSTOM";

export type GenerationStatus = "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED";

export type WebsiteGeneration = {
  status: GenerationStatus;
  step: string | null;
  progress: number;
  errorMessage: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
};

export type WebsiteSummary = {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  builderType: BuilderType;
  status: WebsiteStatus;
  subdomain: string;
  pageCount: number;
  /** Set when the draft was (or is being) built by AI. */
  generationStatus: GenerationStatus | null;
  hasUnpublishedChanges: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WebsiteInfo = {
  businessName: string | null;
  websiteType: string | null;
  industry: string | null;
  description: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
};

export type WebsitePage = {
  id: string;
  name: string;
  slug: string;
  pageType: PageType;
  visible: boolean;
  showInNav: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  sections: Section[];
};

export type WebsiteDetail = WebsiteSummary & {
  info: WebsiteInfo;
  draft: {
    theme: ThemeSettings;
    header: HeaderData;
    footer: FooterData;
    pages: WebsitePage[];
    draftUpdatedAt: string;
  };
  generation: WebsiteGeneration | null;
};

export type WebsiteTemplate = {
  id: string;
  key: string;
  /** The client's own saved template (vs a platform template). */
  isCustom: boolean;
  name: string;
  category: string;
  description: string | null;
  thumbnailUrl: string | null;
  themeId: string | null;
  pages: { name: string; slug: string }[];
};

/** A platform template rendered as site data, for read-only previews. */
export type TemplatePreview = {
  template: WebsiteTemplate;
  site: {
    theme: ThemeSettings;
    header: HeaderData;
    footer: FooterData;
    pages: { id: string; name: string; slug: string; sections: Section[] }[];
  };
};

export type WebsiteListParams = {
  search?: string;
  clientId?: string;
  status?: WebsiteStatus;
  builderType?: BuilderType;
  page?: number;
  pageSize?: number;
};

export type WebsiteList = {
  items: WebsiteSummary[];
  total: number;
  page: number;
  pageSize: number;
};

export type ThemeOption = {
  id: string;
  name: string;
  settings: ThemeSettings;
};

export type CreateWebsiteInput = {
  /** Required when a Super Admin creates a website; ignored for clients. */
  clientId?: string;
  name: string;
  /** Omitted = start blank with one empty home page. */
  templateKey?: string;
  themeId?: string;
  subdomain?: string;
  businessName?: string;
  websiteType?: string;
  industry?: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
};

export type UpdateWebsiteInput = {
  name?: string;
} & { [K in keyof WebsiteInfo]?: string | null };

export const GENERATION_TONES = ["professional", "friendly", "luxury", "playful", "bold", "minimal"] as const;
export type GenerationTone = (typeof GENERATION_TONES)[number];
export const MAX_GENERATED_PAGES = 8;
export const MAX_BRIEF_IMAGES = 12;

export type CreateAiWebsiteInput = Omit<CreateWebsiteInput, "templateKey"> & {
  prompt: string;
  /** Page names in nav order; the first becomes the home page. */
  pages: string[];
  tone?: GenerationTone;
  /** Media library image ids the AI may place in sections. */
  mediaIds?: string[];
  logoMediaId?: string;
};

/** Pages without an id, or with an id the website doesn't own, are created as new pages. */
export type PageInput = Omit<WebsitePage, "id"> & { id?: string };

export type SaveDraftInput = {
  expectedDraftUpdatedAt: string;
  theme: ThemeSettings;
  header: HeaderData;
  footer: FooterData;
  pages: PageInput[];
};

export type SavedSection = {
  id: string;
  name: string;
  sectionType: Section["type"];
  section: Section;
  /** Shared by the platform; clients can use but not delete it. */
  isPlatform: boolean;
  createdAt: string;
};

export type SaveTemplateInput = { name: string; description?: string };

export type SavePageContentInput = {
  expectedDraftUpdatedAt: string;
  schemaVersion: number;
  sections: Section[];
};

export type WebsiteVersion = {
  id: string;
  version: number;
  status: "PENDING" | "SUCCEEDED" | "FAILED";
  isLive: boolean;
  publishedByName: string | null;
  createdAt: string;
  completedAt: string | null;
};

type WebsiteResponse = { website: WebsiteDetail };

const BASE = "/websites";

function toQuery(params: WebsiteListParams): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const text = query.toString();
  return text ? `?${text}` : "";
}

export const websitesApi = {
  list: (params: WebsiteListParams = {}) => request<WebsiteList>(`${BASE}${toQuery(params)}`),

  /** Super Admin passes `clientId` to include that client's own templates. */
  templates: (clientId?: string) =>
    request<{ templates: WebsiteTemplate[] }>(`${BASE}/templates${toQuery({ clientId })}`).then((data) => data.templates),

  saveAsTemplate: (websiteId: string, input: SaveTemplateInput) =>
    request<{ template: WebsiteTemplate }>(`${BASE}/${websiteId}/templates`, { method: "POST", body: input }).then(
      (data) => data.template,
    ),

  deleteTemplate: (templateId: string) => request<void>(`${BASE}/templates/${templateId}`, { method: "DELETE" }),

  savedSections: (websiteId: string) =>
    request<{ sections: SavedSection[] }>(`${BASE}/${websiteId}/saved-sections`).then((data) => data.sections),

  saveSection: (websiteId: string, input: { name: string; section: Section }) =>
    request<{ section: SavedSection }>(`${BASE}/${websiteId}/saved-sections`, { method: "POST", body: input }).then(
      (data) => data.section,
    ),

  deleteSavedSection: (websiteId: string, savedSectionId: string) =>
    request<void>(`${BASE}/${websiteId}/saved-sections/${savedSectionId}`, { method: "DELETE" }),

  themes: () => request<{ themes: ThemeOption[] }>(`${BASE}/themes`).then((data) => data.themes),

  get: (id: string) => request<WebsiteResponse>(`${BASE}/${id}`).then((data) => data.website),

  create: (input: CreateWebsiteInput) =>
    request<WebsiteResponse>(BASE, { method: "POST", body: input }).then((data) => data.website),

  update: (id: string, input: UpdateWebsiteInput) =>
    request<WebsiteResponse>(`${BASE}/${id}`, { method: "PATCH", body: input }).then((data) => data.website),

  /** Creates the website and queues the AI build; poll `generation` until it finishes. */
  createWithAi: (input: CreateAiWebsiteInput) =>
    request<WebsiteResponse>(`${BASE}/ai`, { method: "POST", body: input }).then((data) => data.website),

  generation: (id: string) =>
    request<{ generation: WebsiteGeneration }>(`${BASE}/${id}/generation`).then((data) => data.generation),

  retryGeneration: (id: string) =>
    request<{ generation: WebsiteGeneration }>(`${BASE}/${id}/generation/retry`, { method: "POST" }).then(
      (data) => data.generation,
    ),

  /** Forget a failed build and keep the blank draft. */
  dismissGeneration: (id: string) => request<void>(`${BASE}/${id}/generation`, { method: "DELETE" }),

  delete: (id: string) => request<void>(`${BASE}/${id}`, { method: "DELETE" }),

  saveDraft: (id: string, input: SaveDraftInput) =>
    request<WebsiteResponse>(`${BASE}/${id}/draft`, { method: "PUT", body: input }).then((data) => data.website),

  savePageContent: (id: string, pageId: string, input: SavePageContentInput) =>
    request<{ draftUpdatedAt: string }>(`${BASE}/${id}/pages/${pageId}/content`, { method: "PUT", body: input }),

  publish: (id: string, expectedDraftUpdatedAt: string) =>
    request<WebsiteResponse>(`${BASE}/${id}/publish`, { method: "POST", body: { expectedDraftUpdatedAt } }).then(
      (data) => data.website,
    ),

  versions: (id: string) =>
    request<{ versions: WebsiteVersion[] }>(`${BASE}/${id}/versions`).then((data) => data.versions),

  /** Reports the planned layout via `onPlan` before content is generated, then resolves with the suggestion. */
  generateAiSuggestionStream: async (
    id: string,
    input: AiGenerateInput,
    onPlan: (layout: AiLayoutSlot[]) => void,
    signal?: AbortSignal,
  ): Promise<AiSuggestion> => {
    let suggestion: AiSuggestion | null = null;
    await requestNdjson<AiStreamEvent>(`${BASE}/${id}/ai/generate`, { method: "POST", body: input, signal }, (event) => {
      if (event.type === "plan") onPlan(event.layout);
      else if (event.type === "result") suggestion = event.suggestion;
      else throw new ApiError(502, { error: event.error });
    });
    if (!suggestion) throw new ApiError(502, { error: { message: "AI response ended unexpectedly. Please try again." } });
    return suggestion;
  },

  listAiSessions: (id: string) =>
    request<{ sessions: Array<{ id: string; title: string; timestamp: number; messages: unknown[] }> }>(
      `${BASE}/${id}/ai/sessions`,
    ).then((data) => data.sessions),

  saveAiSession: (id: string, session: { id?: string; title: string; messages: unknown[] }) =>
    request<{ session: unknown }>(`${BASE}/${id}/ai/sessions`, { method: "POST", body: session }),

  deleteAiSession: (id: string, sessionId: string) =>
    request<void>(`${BASE}/${id}/ai/sessions/${sessionId}`, { method: "DELETE" }),

  clearAiSessions: (id: string) => request<void>(`${BASE}/${id}/ai/sessions`, { method: "DELETE" }),

  generatePageSeo: (
    id: string,
    pageId: string,
    input: {
      pageName?: string;
      pageSlug?: string;
      currentTitle?: string | null;
      currentDescription?: string | null;
      contentSummary?: string | null;
    },
  ) =>
    request<{ seoTitle: string; seoDescription: string; keywords: string[] }>(
      `${BASE}/${id}/pages/${pageId}/seo/generate`,
      { method: "POST", body: input },
    ),

  sitemapUrl: (id: string) => `${BASE}/${id}/seo/sitemap.xml`,
  robotsUrl: (id: string) => `${BASE}/${id}/seo/robots.txt`,
};


const previewCache = new Map<string, Promise<TemplatePreview>>();

/** Public platform templates; no sign-in needed. */
export const templatesApi = {
  list: () => request<{ templates: WebsiteTemplate[] }>("/templates").then((data) => data.templates),

  /** Cached per key so many thumbnails of the same template share one request. */
  preview: (key: string): Promise<TemplatePreview> => {
    const cached = previewCache.get(key);
    if (cached) return cached;
    const pending = request<TemplatePreview>(`/templates/${encodeURIComponent(key)}/preview`).catch((error: unknown) => {
      previewCache.delete(key);
      throw error;
    });
    previewCache.set(key, pending);
    return pending;
  },
};
