import type { ClientSource } from "./admin-clients.ts";
import { request, requestBlob } from "./http.ts";
import type { WebsiteStatus } from "./websites.ts";

export type BillingCycle = "QUARTERLY" | "YEARLY";
export type HostingStatus = "AWAITING_PAYMENT" | "ACTIVE" | "GRACE" | "SUSPENDED";
export type HostingPayer = "CLIENT" | "ADMIN" | "SYSTEM";
export type HostingPaymentMethod = "WALLET" | "CASH" | "UPI" | "BANK_TRANSFER";
export type PriceSource = "WEBSITE" | "CLIENT" | "GLOBAL";
export type WebsiteOfflineReason = "MANUAL" | "BILLING";

/** Connects per period, and which level of pricing it comes from. */
export type ResolvedPrice = { amount: number; source: PriceSource };
export type CyclePrices = Record<BillingCycle, ResolvedPrice>;
export type CyclePriceInput = { quarterlyPrice: number | null; yearlyPrice: number | null };

export type HostingSubscription = {
  id: string;
  cycle: BillingCycle;
  status: HostingStatus;
  autoRenew: boolean;
  /** This website's own prices; null = client or global price. */
  quarterlyPrice: number | null;
  yearlyPrice: number | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  graceEndsAt: string | null;
  suspendedAt: string | null;
};

export type HostingPayment = {
  id: string;
  websiteId: string | null;
  websiteName: string;
  client: { id: string; businessName: string };
  cycle: BillingCycle;
  amount: number;
  periodStart: string;
  periodEnd: string;
  paidBy: HostingPayer;
  method: HostingPaymentMethod;
  collectedPaise: number | null;
  reference: string | null;
  note: string | null;
  recordedBy: { id: string; fullName: string } | null;
  createdAt: string;
};

export type WebsiteHosting = {
  /** False until the Super Admin turns hosting billing on. */
  enabled: boolean;
  website: {
    id: string;
    name: string;
    subdomain: string;
    status: WebsiteStatus;
    offlineReason: WebsiteOfflineReason | null;
    clientId: string;
    clientName: string;
  };
  subscription: HostingSubscription | null;
  prices: CyclePrices;
  /** What it would pay without its own prices (client price, else global). */
  inheritedPrices: CyclePrices;
  /** The price set at each level; null = not set there. */
  priceLevels: {
    website: CyclePriceInput;
    client: CyclePriceInput;
    global: { quarterlyPrice: number; yearlyPrice: number };
  };
  /** The period a payment made now would cover. */
  nextPeriods: Record<BillingCycle, { start: string; end: string }>;
  /** Set while an active plan is too far from its end to renew. */
  renewalOpensAt: string | null;
  balance: number;
  connectsPerRupee: number;
  payments: HostingPayment[];
};

export type UpdatePlanInput = {
  cycle?: BillingCycle;
  autoRenew?: boolean;
  /** Super Admin only; null = back to client or global price. */
  quarterlyPrice?: number | null;
  yearlyPrice?: number | null;
};

/** WALLET charges the client's connects; the other methods record the plan's price collected offline. */
export type CollectInput = { cycle: BillingCycle; method: HostingPaymentMethod; reference?: string; note?: string };

export type HostingPriceChange = {
  id: string;
  scope: "GLOBAL" | "CLIENT" | "WEBSITE";
  label: string;
  oldQuarterlyPrice: number | null;
  newQuarterlyPrice: number | null;
  oldYearlyPrice: number | null;
  newYearlyPrice: number | null;
  changedBy: string | null;
  createdAt: string;
};

export type HostingSettings = {
  enabled: boolean;
  quarterlyPrice: number;
  yearlyPrice: number;
  reminderDays: number;
  graceDays: number;
  connectsPerRupee: number;
  updatedAt: string | null;
  liveSitesWithoutPlan: number;
  plansOnGlobalPrice: number;
  recentPriceChanges: HostingPriceChange[];
};

export type HostingSettingsInput = Pick<HostingSettings, "enabled" | "quarterlyPrice" | "yearlyPrice" | "reminderDays" | "graceDays">;

export type ClientOwner = { fullName: string; email: string | null; username: string | null; phone: string | null };

export type ClientHostingWebsite = {
  id: string;
  name: string;
  subdomain: string;
  status: WebsiteStatus;
  offlineReason: WebsiteOfflineReason | null;
  publishedAt: string | null;
  updatedAt: string;
  subscription: HostingSubscription | null;
  prices: CyclePrices;
  lastPayment: HostingPayment | null;
};

export type ClientHosting = {
  client: { id: string; businessName: string; source: ClientSource; createdAt: string; owner: ClientOwner | null };
  clientPrices: CyclePriceInput;
  globalPrices: { quarterlyPrice: number; yearlyPrice: number };
  balance: number;
  websites: ClientHostingWebsite[];
  payments: HostingPayment[];
  totals: { payments: number; connects: number; collectedPaise: number };
};

export type ClientAttention = "DUE_SOON" | "GRACE" | "SUSPENDED" | "NO_PLAN";

export type ClientOverview = {
  client: { id: string; businessName: string; source: ClientSource; createdAt: string };
  owner: ClientOwner | null;
  balance: number;
  websites: { total: number; published: number; draft: number; unpublished: number };
  hosting: { active: number; grace: number; suspended: number; awaitingPayment: number; withoutPlan: number; dueSoon: number };
  /** The soonest renewal among paid or grace plans. */
  nextRenewal: { websiteId: string; websiteName: string; date: string; status: HostingStatus } | null;
  paid: { payments: number; connects: number; collectedPaise: number };
};

export type ClientOverviewList = {
  items: ClientOverview[];
  /** Platform-wide, regardless of filters. */
  summary: { clients: number; websites: number; liveWebsites: number; dueSoon: number; suspended: number; dueSoonDays: number };
  total: number;
  page: number;
  pageSize: number;
};

export type ClientOverviewParams = { search?: string; attention?: ClientAttention | ""; page?: number; pageSize?: number };

export type SubscriptionListParams = {
  search?: string;
  status?: HostingStatus | "";
  dueWithinDays?: number | "";
  page?: number;
  pageSize?: number;
};

export type SubscriptionList = {
  items: Array<{
    subscription: HostingSubscription;
    website: { id: string; name: string; subdomain: string; status: WebsiteStatus; offlineReason: WebsiteOfflineReason | null };
    client: { id: string; businessName: string };
    price: ResolvedPrice;
  }>;
  summary: { active: number; grace: number; suspended: number; awaitingPayment: number; dueSoon: number; dueSoonDays: number };
  total: number;
  page: number;
  pageSize: number;
};

export type PaymentListParams = {
  search?: string;
  websiteId?: string;
  /** India calendar days, "YYYY-MM-DD". */
  from?: string;
  to?: string;
  method?: HostingPaymentMethod | "";
  paidBy?: HostingPayer | "";
  page?: number;
  pageSize?: number;
};

export type PaymentList = {
  items: HostingPayment[];
  summary: { payments: number; connects: number; collectedPaise: number };
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

type HostingResponse = { hosting: WebsiteHosting };
const websiteBase = (websiteId: string) => `/websites/${encodeURIComponent(websiteId)}/hosting`;

export const hostingApi = {
  get: (websiteId: string) => request<HostingResponse>(websiteBase(websiteId)).then((data) => data.hosting),
  updatePlan: (websiteId: string, input: UpdatePlanInput) =>
    request<HostingResponse>(websiteBase(websiteId), { method: "PATCH", body: input }).then((data) => data.hosting),
  /** Client: pays the next period from the wallet. */
  pay: (websiteId: string, cycle: BillingCycle) =>
    request<HostingResponse>(`${websiteBase(websiteId)}/pay`, { method: "POST", body: { cycle } }).then((data) => data.hosting),
  /** Super Admin: records a payment collected offline, or charges the client's connects. */
  collect: (websiteId: string, input: CollectInput) =>
    request<HostingResponse>(`${websiteBase(websiteId)}/collect`, { method: "POST", body: input }).then((data) => data.hosting),
};

/** The platform's default hosting prices, as set in Settings → Hosting. */
export type PublicPricing = {
  quarterlyConnects: number;
  yearlyConnects: number;
  quarterlyPaise: number;
  yearlyPaise: number;
  reminderDays: number;
  graceDays: number;
};

export const pricingApi = {
  get: () => request<{ pricing: PublicPricing }>("/pricing").then((data) => data.pricing),
};

export const adminHostingApi = {
  settings: () => request<{ settings: HostingSettings }>("/admin/settings/hosting").then((data) => data.settings),
  updateSettings: (input: HostingSettingsInput) =>
    request<{ settings: HostingSettings }>("/admin/settings/hosting", { method: "PUT", body: input }).then((data) => data.settings),
  backfill: (input: { freeDays: number; cycle: BillingCycle }) =>
    request<{ created: number }>("/admin/settings/hosting/backfill", { method: "POST", body: input }),
  clients: (params: ClientOverviewParams) => request<ClientOverviewList>(`/admin/hosting/clients${toQuery(params)}`),
  client: (clientId: string) =>
    request<{ hosting: ClientHosting }>(`/admin/hosting/clients/${encodeURIComponent(clientId)}`).then((data) => data.hosting),
  updateClientPrices: (clientId: string, input: CyclePriceInput) =>
    request<{ hosting: ClientHosting }>(`/admin/hosting/clients/${encodeURIComponent(clientId)}/prices`, {
      method: "PUT",
      body: input,
    }).then((data) => data.hosting),
  subscriptions: (params: SubscriptionListParams) => request<SubscriptionList>(`/admin/hosting/subscriptions${toQuery(params)}`),
  payments: (params: PaymentListParams) => request<PaymentList>(`/admin/hosting/payments${toQuery(params)}`),
  paymentsCsv: (params: Omit<PaymentListParams, "page" | "pageSize">) =>
    requestBlob(`/admin/hosting/payments.csv${toQuery(params)}`),
};
