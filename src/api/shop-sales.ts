import { request } from "./http.ts";
import type { PosPaymentMethod } from "./shop-pos.ts";

export type SalesChannelTotals = {
  ordersCount: number;
  revenuePaise: number;
  discountPaise: number;
  averagePaise: number;
  itemsSold: number;
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

export const shopSalesApi = {
  /** Sales across both channels for the days `from` through `to` (India time, inclusive). */
  summary: (websiteId: string, range: { from: string; to: string }) =>
    request<{ summary: SalesSummary }>(
      `/websites/${websiteId}/shop/sales/summary?${new URLSearchParams({ from: range.from, to: range.to })}`,
    ).then((data) => data.summary),
};
