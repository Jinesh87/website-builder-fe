import { request } from "./http.ts";

export type ShopCategory = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
};

export type ShopVariant = {
  id: string;
  name: string;
  sku: string | null;
  pricePaise: number;
  sortOrder: number;
  images: ShopImage[];
};

export type ShopProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  categoryId: string;
  categoryName: string;
  optionSets: ShopOptionSet[];
  images: ShopImage[];
  variants: ShopVariant[];
  updatedAt: string;
};

export type ShopOption = {
  name: string;
  values: string[];
};

export type ShopOptionSet = {
  pricePaise: number;
  options: ShopOption[];
  overrides?: { key: string; pricePaise: number }[];
  images?: { key: string; images: ShopImage[] }[];
};

export type ShopImage = {
  mediaId: string;
  url: string;
  alt: string;
};

export type ShopProductInput = {
  name: string;
  description?: string;
  categoryId: string;
  optionSets: {
    pricePaise: number;
    options: ShopOption[];
    overrides?: { key: string; pricePaise: number }[];
    images?: { key: string; images: { mediaId: string; alt?: string }[] }[];
  }[];
  images?: { mediaId: string; alt?: string }[];
};

export type ShopPaymentConfig = {
  configured: boolean;
  mode: "test" | "live" | null;
  razorpayKeyId: string | null;
  razorpayKeySecretMasked: string | null;
  webhookConfigured: boolean;
  webhookUrl: string;
  siteUrl: string;
  updatedAt: string | null;
};

export type ShopPaymentInput = {
  razorpayKeyId: string;
  razorpayKeySecret?: string;
  razorpayWebhookSecret?: string;
};

export type ShopProductQuery = {
  search?: string;
  categoryId?: string;
};

function productQuery(params: ShopProductQuery): string {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.categoryId) query.set("categoryId", params.categoryId);
  const text = query.toString();
  return text ? `?${text}` : "";
}

function base(websiteId: string): string {
  return `/websites/${websiteId}/shop`;
}

export const shopApi = {
  categories: (websiteId: string) =>
    request<{ categories: ShopCategory[] }>(`${base(websiteId)}/categories`).then((data) => data.categories),

  createCategory: (websiteId: string, name: string) =>
    request<{ category: ShopCategory }>(`${base(websiteId)}/categories`, { method: "POST", body: { name } }).then(
      (data) => data.category,
    ),

  updateCategory: (websiteId: string, categoryId: string, name: string) =>
    request<{ category: ShopCategory }>(`${base(websiteId)}/categories/${categoryId}`, {
      method: "PATCH",
      body: { name },
    }).then((data) => data.category),

  deleteCategory: (websiteId: string, categoryId: string) =>
    request<void>(`${base(websiteId)}/categories/${categoryId}`, { method: "DELETE" }),

  products: (websiteId: string, params: ShopProductQuery = {}) =>
    request<{ products: ShopProduct[] }>(`${base(websiteId)}/products${productQuery(params)}`).then((data) => data.products),

  createProduct: (websiteId: string, input: ShopProductInput) =>
    request<{ product: ShopProduct }>(`${base(websiteId)}/products`, { method: "POST", body: input }).then((data) => data.product),

  updateProduct: (websiteId: string, productId: string, input: ShopProductInput) =>
    request<{ product: ShopProduct }>(`${base(websiteId)}/products/${productId}`, { method: "PATCH", body: input }).then(
      (data) => data.product,
    ),

  deleteProduct: (websiteId: string, productId: string) =>
    request<void>(`${base(websiteId)}/products/${productId}`, { method: "DELETE" }),

  paymentConfig: (websiteId: string) =>
    request<{ config: ShopPaymentConfig }>(`${base(websiteId)}/payments`).then((data) => data.config),

  updatePaymentConfig: (websiteId: string, input: ShopPaymentInput) =>
    request<{ config: ShopPaymentConfig }>(`${base(websiteId)}/payments`, { method: "PUT", body: input }).then((data) => data.config),

  revealPaymentSecrets: (websiteId: string) =>
    request<{ secrets: { razorpayKeySecret: string | null; razorpayWebhookSecret: string | null } }>(
      `${base(websiteId)}/payments/secrets`,
    ).then((data) => data.secrets),
};
