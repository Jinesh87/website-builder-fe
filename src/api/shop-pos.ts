import { request, requestBlob } from "./http.ts";
import type { ShopOrder } from "./shop.ts";

export type PosPaymentMethod = "cash" | "upi" | "card" | "razorpay_qr";

export type PosCatalogVariant = {
  id: string;
  name: string;
  sku: string | null;
  /** Printed barcode; a scan matches this first, then the SKU. */
  barcode: string | null;
  imageUrl: string | null;
  /** Price per unit, GST included. */
  unitPaise: number;
  gstPercent: number;
  /** Sellable now: on hand minus units held by online checkouts. */
  available: number;
};

export type PosCatalogProduct = {
  id: string;
  name: string;
  categoryId: string | null;
  categoryName: string | null;
  imageUrl: string | null;
  listed: boolean;
  variants: PosCatalogVariant[];
};

export type PosCatalog = {
  products: PosCatalogProduct[];
  categories: { id: string; name: string }[];
  razorpayQrAvailable: boolean;
};

export type PosSaleInput = {
  items: { variantId: string; quantity: number }[];
  discount?: { type: "amount" | "percent"; value: number } | null;
  customer?: { customerId?: string | null; name?: string; phone?: string; email?: string } | null;
  payment: { method: PosPaymentMethod; cashReceivedPaise?: number | null; reference?: string };
};

export type PosQrState = "waiting" | "paid" | "expired" | "cancelled";

export type PosSaleResult = {
  order: ShopOrder;
  qr: { imageUrl: string | null; expiresAt: string; state: PosQrState } | null;
};

export type PosReceipt = {
  shop: { name: string; address: string | null; phone: string | null; email: string | null; gstin: string | null };
  orderNumber: string;
  createdAt: string;
  status: ShopOrder["status"];
  cashierName: string | null;
  customer: { name: string; phone: string | null; email: string | null; walkIn: boolean };
  items: {
    productName: string;
    variantName: string;
    quantity: number;
    unitPaise: number;
    lineTotalPaise: number;
    gstPercent: number;
  }[];
  subtotalPaise: number;
  discountPaise: number;
  totalPaise: number;
  taxablePaise: number;
  gstPaise: number;
  gstByRate: { gstPercent: number; taxablePaise: number; gstPaise: number }[];
  payment: {
    method: PosPaymentMethod | null;
    cashReceivedPaise: number | null;
    changePaise: number | null;
    reference: string | null;
    razorpayPaymentId: string | null;
  };
};

export type PosDailySummary = {
  date: string;
  /** Days covered, YYYY-MM-DD, both inclusive. */
  from: string;
  to: string;
  salesCount: number;
  totalPaise: number;
  discountPaise: number;
  byMethod: Record<PosPaymentMethod, { count: number; totalPaise: number }>;
  cashPaise: number;
  cancelledCount: number;
  returnedCount: number;
  returnedPaise: number;
};

export const POS_METHOD_LABEL: Record<PosPaymentMethod, string> = {
  cash: "Cash",
  upi: "UPI",
  card: "Card",
  razorpay_qr: "Razorpay QR",
};

function base(websiteId: string): string {
  return `/websites/${websiteId}/shop`;
}

export const shopPosApi = {
  catalog: (websiteId: string) => request<PosCatalog>(`${base(websiteId)}/pos/catalog`),

  createSale: (websiteId: string, input: PosSaleInput) =>
    request<PosSaleResult>(`${base(websiteId)}/pos/sales`, { method: "POST", body: input }),

  checkQr: (websiteId: string, orderId: string) =>
    request<PosSaleResult>(`${base(websiteId)}/pos/sales/${orderId}/qr`),

  cancelQr: (websiteId: string, orderId: string) =>
    request<PosSaleResult>(`${base(websiteId)}/pos/sales/${orderId}/qr/cancel`, { method: "POST" }),

  receipt: (websiteId: string, orderId: string) =>
    request<{ receipt: PosReceipt }>(`${base(websiteId)}/pos/sales/${orderId}/receipt`).then((data) => data.receipt),

  emailInvoice: (websiteId: string, orderId: string, to?: string) =>
    request<{ to: string }>(`${base(websiteId)}/pos/sales/${orderId}/email`, { method: "POST", body: { to: to ?? "" } }),

  /** POS totals for the days `from` through `to` (India time, inclusive). */
  summary: (websiteId: string, range: { from: string; to: string }) =>
    request<{ summary: PosDailySummary }>(
      `${base(websiteId)}/pos/summary?${new URLSearchParams({ from: range.from, to: range.to })}`,
    ).then((data) => data.summary),

  /** Any order's A4 GST invoice as a PDF. */
  invoicePdf: (websiteId: string, orderId: string) => requestBlob(`${base(websiteId)}/orders/${orderId}/invoice`),
};
