import { request } from "./http.ts";
import type { PlatformTemplateCategory } from "./websites.ts";

/** BUILT_IN templates come from the seed files and can only be shown or hidden. */
export type PlatformTemplateOrigin = "BUILT_IN" | "ADMIN";
export type PlatformTemplateStatus = "LIVE" | "HIDDEN" | "ARCHIVED";

export type AdminTemplate = {
  id: string;
  /** Unique template ID, used in gallery links and when creating a website from it. */
  key: string;
  name: string;
  category: string;
  description: string | null;
  origin: PlatformTemplateOrigin;
  status: PlatformTemplateStatus;
  /** Template Studio website that "Edit design" opens; null for built-in templates. */
  sourceWebsiteId: string | null;
  pages: { name: string; slug: string }[];
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminTemplateListParams = {
  status?: "live" | "hidden" | "archived";
  category?: PlatformTemplateCategory;
  search?: string;
};

export type StudioStartFrom =
  | { startFrom: "blank" }
  | { startFrom: "template"; templateKey: string }
  | { startFrom: "website"; websiteId: string };

export type TemplateDetails = {
  name: string;
  category: PlatformTemplateCategory;
  description?: string;
  isActive: boolean;
};

const BASE = "/admin/templates";

function toQuery(params: AdminTemplateListParams): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value);
  }
  const text = query.toString();
  return text ? `?${text}` : "";
}

type TemplateResponse = { template: AdminTemplate };

/** Super Admin only. Editing or archiving a template never changes websites already created from it. */
export const adminTemplatesApi = {
  list: (params: AdminTemplateListParams = {}) =>
    request<{ templates: AdminTemplate[] }>(`${BASE}${toQuery(params)}`).then((data) => data.templates),

  /** The template this Template Studio website designs, or null before its first save. */
  bySourceWebsite: (websiteId: string) =>
    request<{ template: AdminTemplate | null }>(`${BASE}/by-website/${websiteId}`).then((data) => data.template),

  /** Creates the Template Studio website a new template is designed in; open it in the editor next. */
  createStudioWebsite: (input: { name: string } & StudioStartFrom) =>
    request<{ websiteId: string }>(`${BASE}/studio-websites`, { method: "POST", body: input }).then((data) => data.websiteId),

  create: (websiteId: string, details: TemplateDetails) =>
    request<TemplateResponse>(BASE, { method: "POST", body: { websiteId, ...details } }).then((data) => data.template),

  /** Saves the details and the Studio website's current design over the template. */
  updateFromSource: (templateId: string, details: TemplateDetails) =>
    request<TemplateResponse>(`${BASE}/${templateId}`, { method: "PUT", body: details }).then((data) => data.template),

  updateDetails: (templateId: string, details: Partial<TemplateDetails>) =>
    request<TemplateResponse>(`${BASE}/${templateId}`, { method: "PATCH", body: details }).then((data) => data.template),

  /** Soft delete; restorable. */
  archive: (templateId: string) =>
    request<TemplateResponse>(`${BASE}/${templateId}`, { method: "DELETE" }).then((data) => data.template),

  restore: (templateId: string) =>
    request<TemplateResponse>(`${BASE}/${templateId}/restore`, { method: "POST" }).then((data) => data.template),
};
