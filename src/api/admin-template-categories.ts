import { request } from "./http.ts";

export type TemplateCategory = {
  id: string;
  name: string;
  slug: string;
  /** Used by the built-in templates; cannot be renamed or deleted. */
  isSystem: boolean;
  /** Platform templates in this category, archived ones included. */
  templateCount: number;
  createdAt: string;
  updatedAt: string;
};

export const TEMPLATE_CATEGORY_NAME_MAX = 60;

const BASE = "/admin/template-categories";

type CategoryResponse = { category: TemplateCategory };

/** Super Admin only. Categories group platform templates; websites never reference them. */
export const adminTemplateCategoriesApi = {
  list: () => request<{ categories: TemplateCategory[] }>(BASE).then((data) => data.categories),

  create: (name: string) =>
    request<CategoryResponse>(BASE, { method: "POST", body: { name } }).then((data) => data.category),

  /** Also relabels the category's templates. Built-in categories are refused. */
  rename: (categoryId: string, name: string) =>
    request<CategoryResponse>(`${BASE}/${categoryId}`, { method: "PATCH", body: { name } }).then((data) => data.category),

  /** A category that still has templates needs `moveTo`, the category that receives them. */
  remove: (categoryId: string, moveTo?: string) =>
    request<void>(`${BASE}/${categoryId}${moveTo ? `?moveTo=${encodeURIComponent(moveTo)}` : ""}`, { method: "DELETE" }),
};
