import { request, requestBlob } from "./http.ts";
import type { PosPaymentMethod } from "./shop-pos.ts";

export type SalesChannelTotals = {
  ordersCount: number;
  revenuePaise: number;
  discountPaise: number;
  averagePaise: number;
  itemsSold: number;
  /** Revenue without GST, after discounts. */
  netSalesPaise: number;
  /** Base price × quantity of items sold that have a base price. */
  costPaise: number;
  /** Net sales minus cost, over items that have a base price. */
  profitPaise: number;
  /** Units sold with no base price, left out of cost and profit. */
  uncostedItems: number;
  cancelledCount: number;
  returnedCount: number;
  returnedPaise: number;
};

/** Online store and POS sales together for the IST days `from` through `to`. */
export type SalesSummary = {
  from: string;
  to: string;
  total: SalesChannelTotals;
  online: SalesChannelTotals;
  pos: SalesChannelTotals;
  fulfilment: { toFulfil: number; shipped: number; delivered: number };
  byPayment: Record<"online" | PosPaymentMethod, { count: number; totalPaise: number }>;
  refunds: { count: number; totalPaise: number };
};

export type SalesExportFormat = "pdf" | "csv";

export const shopSalesApi = {
  /** Sales across both channels for the days `from` through `to` (India time, inclusive). */
  summary: (websiteId: string, range: { from: string; to: string }) =>
    request<{ summary: SalesSummary }>(
      `/websites/${websiteId}/shop/sales/summary?${new URLSearchParams({ from: range.from, to: range.to })}`,
    ).then((data) => data.summary),
  /** The summary plus every paid order in the period, as a PDF report or CSV spreadsheet. */
  export: (websiteId: string, range: { from: string; to: string }, format: SalesExportFormat) =>
    requestBlob(`/websites/${websiteId}/shop/sales/export.${format}?${new URLSearchParams({ from: range.from, to: range.to })}`),
};
