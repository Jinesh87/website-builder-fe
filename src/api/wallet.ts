import { request } from "./http.ts";

export type Wallet = {
  balancePaise: number;
  currency: string;
  /** False until the platform admin has added Razorpay keys. */
  paymentsEnabled: boolean;
  minTopupPaise: number;
  maxTopupPaise: number;
};

export type WalletTransaction = {
  id: string;
  type: "CREDIT" | "DEBIT";
  source: "TOPUP" | "AI_USAGE" | "ADJUSTMENT";
  amountPaise: number;
  balanceAfterPaise: number;
  description: string;
  createdAt: string;
};

export type WalletTransactionPage = { transactions: WalletTransaction[]; total: number; page: number; pageSize: number };

export type TopupCheckout = {
  orderId: string;
  keyId: string;
  amountPaise: number;
  currency: string;
  businessName: string;
  prefill: { name: string; email: string; contact?: string };
};

export type TopupConfirmation = { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string };

export type PaymentConfig = {
  configured: boolean;
  mode: "test" | "live" | null;
  razorpayKeyId: string | null;
  razorpayKeySecretMasked: string | null;
  webhookConfigured: boolean;
  updatedAt: string | null;
};

export type PaymentConfigInput = {
  razorpayKeyId: string;
  /** Leave empty to keep the stored secret. */
  razorpayKeySecret?: string;
  razorpayWebhookSecret?: string;
};

const BASE = "/account/wallet";

export const walletApi = {
  get: () => request<{ wallet: Wallet }>(BASE).then((data) => data.wallet),
  transactions: (page = 1, pageSize = 20) =>
    request<WalletTransactionPage>(`${BASE}/transactions?${new URLSearchParams({ page: String(page), pageSize: String(pageSize) })}`),
  createTopup: (amountPaise: number) =>
    request<{ checkout: TopupCheckout }>(`${BASE}/topups`, { method: "POST", body: { amountPaise } }).then((data) => data.checkout),
  confirmTopup: (input: TopupConfirmation) =>
    request<{ wallet: Wallet; transaction: WalletTransaction | null }>(`${BASE}/topups/verify`, { method: "POST", body: input }),
};

export const adminPaymentsApi = {
  get: () => request<{ config: PaymentConfig }>("/admin/settings/payments").then((data) => data.config),
  update: (input: PaymentConfigInput) =>
    request<{ config: PaymentConfig }>("/admin/settings/payments", { method: "PUT", body: input }).then((data) => data.config),
};

export function formatPaise(paise: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: paise % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(paise / 100);
}

type ClientRef = { id: string; businessName: string };
type UserRef = { id: string; fullName: string; email: string } | null;

export type AdminListParams = {
  search?: string;
  month?: number | "";
  year?: number | "";
  page?: number;
  pageSize?: number;
};

export type AdminWalletTransaction = WalletTransaction & {
  client: ClientRef;
  user: UserRef;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
};

export type AdminTransactionsResponse = {
  items: AdminWalletTransaction[];
  summary: {
    topupsPaise: number;
    topupCount: number;
    aiUsagePaise: number;
    adjustmentsPaise: number;
    heldBalancePaise: number;
    fundedWallets: number;
  };
  total: number;
  page: number;
  pageSize: number;
};

export type PaymentStatus = "CREATED" | "PAID" | "FAILED";

export type AdminPayment = {
  id: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  amountPaise: number;
  currency: string;
  status: PaymentStatus;
  failureReason: string | null;
  createdAt: string;
  paidAt: string | null;
  client: ClientRef;
  user: UserRef;
};

export type AdminPaymentsResponse = {
  items: AdminPayment[];
  summary: { paidPaise: number; paidCount: number; failedCount: number; pendingCount: number };
  total: number;
  page: number;
  pageSize: number;
};

function toQuery(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const text = query.toString();
  return text ? `?${text}` : "";
}

export const adminWalletApi = {
  transactions: (params: AdminListParams & { type?: WalletTransaction["type"] | ""; source?: WalletTransaction["source"] | "" }) =>
    request<AdminTransactionsResponse>(`/admin/wallet/transactions${toQuery(params)}`),
  payments: (params: AdminListParams & { status?: PaymentStatus | "" }) =>
    request<AdminPaymentsResponse>(`/admin/wallet/payments${toQuery(params)}`),
};
