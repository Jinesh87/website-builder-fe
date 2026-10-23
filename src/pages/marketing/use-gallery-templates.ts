import { useEffect, useState } from "react";
import { templatesApi, type WebsiteTemplate } from "../../api/websites.ts";
import { getTemplateKey } from "../../site-kit/templates/index.ts";
import { TPLS } from "./data.ts";

/** A gallery entry: a curated marketing design, or a platform template that only has API data. */
export type GalleryTemplate = {
  /** Backend template key, unique across the gallery. */
  key: string;
  name: string;
  category: string;
  style: string | null;
  searchText: string;
} & ({ kind: "curated"; index: number } | { kind: "platform"; template: WebsiteTemplate });

const CURATED: readonly GalleryTemplate[] = TPLS.map((t, index) => ({
  kind: "curated",
  index,
  key: getTemplateKey(t.id) ?? t.id,
  name: t.n,
  category: t.c,
  style: t.style ?? null,
  searchText: [t.id, t.n, t.type, t.style, t.c, t.biz].filter(Boolean).join(" ").toLowerCase(),
}));

const CURATED_INDEX_BY_KEY = new Map(TPLS.map((t, index) => [getTemplateKey(t.id) ?? t.id, index]));

/** Index into TPLS of the curated marketing design for a backend template key, or null when it has none. */
export function curatedTemplateIndex(key: string): number | null {
  return CURATED_INDEX_BY_KEY.get(key) ?? null;
}

let platformTemplates: Promise<WebsiteTemplate[]> | null = null;

/** One request per page load, shared by every gallery consumer; a failure is retried on next use. */
function loadPlatformTemplates(): Promise<WebsiteTemplate[]> {
  platformTemplates ??= templatesApi.list().catch((error: unknown) => {
    platformTemplates = null;
    throw error;
  });
  return platformTemplates;
}

/**
 * Lists only templates the API serves, so the gallery never offers one that cannot be used.
 * Curated designs keep their hand-picked order; other platform templates follow in API order.
 */
function mergeGalleryTemplates(platform: readonly WebsiteTemplate[]): GalleryTemplate[] {
  const served = new Set(platform.map((template) => template.key));
  const curatedKeys = new Set(CURATED.map((item) => item.key));
  const curated = CURATED.filter((item) => served.has(item.key));
  const others = platform
    .filter((template) => !template.isCustom && !curatedKeys.has(template.key))
    .map(
      (template): GalleryTemplate => ({
        kind: "platform",
        template,
        key: template.key,
        name: template.name,
        category: template.category,
        style: null,
        searchText: [template.key, template.name, template.category, template.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase(),
      }),
    );
  return [...curated, ...others];
}

/** Gallery templates from the API, falling back to the curated designs while loading or offline. */
export function useGalleryTemplates(): readonly GalleryTemplate[] {
  const [items, setItems] = useState<readonly GalleryTemplate[]>(CURATED);

  useEffect(() => {
    let cancelled = false;
    loadPlatformTemplates()
      .then((platform) => {
        if (!cancelled) setItems(mergeGalleryTemplates(platform));
      })
      .catch(() => {
        // Keep the curated fallback.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return items;
}
