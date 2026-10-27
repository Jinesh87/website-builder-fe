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
  quantity: number;
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
  /** When on, each value is its own card on the shop page. */
  listOnShop?: boolean;
  /** Photos shared by every variant that has this value. */
  images?: { value: string; images: { mediaId: string; alt: string; url?: string }[] }[];
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

export type InventoryItem = {
  variantId: string;
  productId: string;
  productName: string;
  categoryName: string;
  variantName: string;
  options: { name: string; value: string }[];
  pricePaise: number;
  quantity: number;
};

export type InventoryMovement = {
  id: string;
  productName: string;
  variantName: string;
  delta: number;
  quantityAfter: number;
  note: string | null;
  actorName: string | null;
  createdAt: string;
};

export type InventoryLogPage = {
  movements: InventoryMovement[];
  page: number;
  pageSize: number;
  total: number;
};

export type ShopCustomerStatus = "ACTIVE" | "PENDING_VERIFICATION" | "SUSPENDED";

export type ShopCustomer = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  status: ShopCustomerStatus;
  emailVerifiedAt: string | null;
  lastSignedInAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ShopCustomerPage = {
  customers: ShopCustomer[];
  page: number;
  pageSize: number;
  total: number;
};

export type ShopProductQuery = {
  search?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
};

export type ShopProductPage = {
  products: ShopProduct[];
  page: number;
  pageSize: number;
  total: number;
};

function productQuery(params: ShopProductQuery): string {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.categoryId) query.set("categoryId", params.categoryId);
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
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
    request<ShopProductPage>(`${base(websiteId)}/products${productQuery(params)}`),

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

  inventory: (websiteId: string, search = "") => {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    const text = query.toString();
    return request<{ items: InventoryItem[] }>(`${base(websiteId)}/inventory${text ? `?${text}` : ""}`).then((data) => data.items);
  },

  addInventory: (websiteId: string, variantId: string, quantity: number, note?: string) =>
    request<{ item: InventoryItem }>(`${base(websiteId)}/inventory/${variantId}`, {
      method: "PATCH",
      body: { quantity, note },
    }).then((data) => data.item),

  inventoryLog: (websiteId: string, search = "", page = 1) => {
    const query = new URLSearchParams({ page: String(page) });
    if (search) query.set("search", search);
    return request<InventoryLogPage>(`${base(websiteId)}/inventory/log?${query}`);
  },

  revealPaymentSecrets: (websiteId: string) =>
    request<{ secrets: { razorpayKeySecret: string | null; razorpayWebhookSecret: string | null } }>(
      `${base(websiteId)}/payments/secrets`,
    ).then((data) => data.secrets),

  customers: (websiteId: string, params: { search?: string; page?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.page) query.set("page", String(params.page));
    const text = query.toString();
    return request<ShopCustomerPage>(`${base(websiteId)}/customers${text ? `?${text}` : ""}`);
  },

  customer: (websiteId: string, customerId: string) =>
    request<{ customer: ShopCustomer }>(`${base(websiteId)}/customers/${customerId}`).then((data) => data.customer),
};
