import { request } from "./http.ts";

export type MediaKind = "IMAGE" | "VIDEO" | "DOCUMENT";

export type MediaFile = {
  id: string;
  clientId: string;
  clientName: string;
  websiteId: string | null;
  folderId: string | null;
  kind: MediaKind;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  /** Stable public URL; store this in website content. */
  url: string;
  createdAt: string;
  updatedAt: string;
};

export type MediaFolder = {
  id: string;
  clientId: string;
  name: string;
  fileCount: number;
  createdAt: string;
};

export type MediaUsageKind = "PAGE" | "HEADER" | "FOOTER" | "LOGO" | "LIVE_SITE" | "TEMPLATE" | "SAVED_SECTION";

export type MediaUsage = {
  kind: MediaUsageKind;
  websiteId: string | null;
  websiteName: string | null;
  label: string | null;
};

export function describeUsage(usage: MediaUsage): string {
  const site = usage.websiteName ? `“${usage.websiteName}”` : "";
  switch (usage.kind) {
    case "PAGE":
      return `${site}: ${usage.label ?? "a"} page (draft)`;
    case "HEADER":
      return `${site}: header (draft)`;
    case "FOOTER":
      return `${site}: footer (draft)`;
    case "LOGO":
      return `${site}: website logo`;
    case "LIVE_SITE":
      return `${site}: published live site`;
    case "TEMPLATE":
      return `Template “${usage.label ?? ""}”`;
    case "SAVED_SECTION":
      return `Saved section “${usage.label ?? ""}”`;
  }
}

export type StorageUsage = { usedBytes: number; limitBytes: number };

export type MediaListParams = {
  /** Super Admin only; clients always get their own media. */
  clientId?: string;
  websiteId?: string;
  /** A folder id, or "none" for files outside any folder. */
  folderId?: string;
  kind?: MediaKind;
  search?: string;
  page?: number;
  pageSize?: number;
};

export type MediaList = {
  files: MediaFile[];
  total: number;
  page: number;
  pageSize: number;
  usage: StorageUsage | null;
};

export type UploadMediaInput = {
  file: File;
  /** Required for Super Admin. */
  clientId?: string;
  websiteId?: string;
  folderId?: string;
  altText?: string;
};

export const MAX_VARIATIONS = 4;

export type GenerateVariationsInput = {
  file: File;
  count: number;
  instructions?: string;
  /** Required for Super Admin. */
  clientId?: string;
  websiteId?: string;
};

/** An unsaved AI-generated image; `data` is base64. */
export type ImageSample = {
  mimeType: string;
  data: string;
};

export type UpdateMediaInput = {
  fileName?: string;
  altText?: string | null;
  folderId?: string | null;
};

/** Matches the server's per-kind limits so users get instant feedback. */
export const MAX_UPLOAD_BYTES: Record<MediaKind, number> = {
  IMAGE: 10 * 1024 * 1024,
  VIDEO: 50 * 1024 * 1024,
  DOCUMENT: 20 * 1024 * 1024,
};

export const ACCEPT_BY_KIND: Record<MediaKind, string> = {
  IMAGE: "image/jpeg,image/png,image/webp,image/gif,image/avif",
  VIDEO: "video/mp4,video/webm",
  DOCUMENT: "application/pdf",
};

export const ACCEPT_ANY = Object.values(ACCEPT_BY_KIND).join(",");

const BASE = "/media";

function toQuery(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const text = query.toString();
  return text ? `?${text}` : "";
}

export function kindOfFile(file: File): MediaKind | null {
  if (file.type.startsWith("image/")) return "IMAGE";
  if (file.type.startsWith("video/")) return "VIDEO";
  if (file.type === "application/pdf") return "DOCUMENT";
  return null;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/** Client-side check before uploading; the server re-checks the actual bytes. */
export function uploadProblem(file: File, onlyKind?: MediaKind): string | null {
  const kind = kindOfFile(file);
  if (!kind || !ACCEPT_BY_KIND[kind].split(",").includes(file.type)) {
    return `“${file.name}” isn't a supported file. Use JPG, PNG, WebP, GIF, AVIF, MP4, WebM or PDF.`;
  }
  if (onlyKind && kind !== onlyKind) return `“${file.name}” isn't ${onlyKind === "IMAGE" ? "an image" : `a ${onlyKind.toLowerCase()}`}.`;
  if (file.size > MAX_UPLOAD_BYTES[kind]) {
    return `“${file.name}” is ${formatBytes(file.size)}. The limit is ${formatBytes(MAX_UPLOAD_BYTES[kind])}.`;
  }
  return null;
}

export const mediaApi = {
  list: (params: MediaListParams = {}) => request<MediaList>(`${BASE}${toQuery(params)}`),

  upload: ({ file, ...fields }: UploadMediaInput) => {
    const form = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      if (value) form.set(key, value);
    }
    form.set("file", file);
    return request<{ file: MediaFile }>(BASE, { method: "POST", body: form }).then((data) => data.file);
  },

  /** Returns unsaved samples; save the ones the user keeps with `upload`. */
  generateVariations: ({ file, count, ...fields }: GenerateVariationsInput) => {
    const form = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      if (value) form.set(key, value);
    }
    form.set("count", String(count));
    form.set("file", file);
    return request<{ samples: ImageSample[] }>(`${BASE}/variations`, { method: "POST", body: form }).then((data) => data.samples);
  },

  update: (id: string, input: UpdateMediaInput) =>
    request<{ file: MediaFile }>(`${BASE}/${id}`, { method: "PATCH", body: input }).then((data) => data.file),

  usage: (id: string) => request<{ usages: MediaUsage[] }>(`${BASE}/${id}/usage`).then((data) => data.usages),

  /** Fails with MEDIA_IN_USE (details.usages) while the file is still referenced. */
  remove: (id: string) => request<void>(`${BASE}/${id}`, { method: "DELETE" }),

  folders: (clientId?: string) =>
    request<{ folders: MediaFolder[] }>(`${BASE}/folders${toQuery({ clientId })}`).then((data) => data.folders),

  createFolder: (name: string, clientId?: string) =>
    request<{ folder: MediaFolder }>(`${BASE}/folders`, { method: "POST", body: { name, clientId } }).then((data) => data.folder),

  renameFolder: (id: string, name: string) =>
    request<{ folder: MediaFolder }>(`${BASE}/folders/${id}`, { method: "PATCH", body: { name } }).then((data) => data.folder),

  deleteFolder: (id: string) => request<void>(`${BASE}/folders/${id}`, { method: "DELETE" }),
};
