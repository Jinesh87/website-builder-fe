import type { ClientSource } from "./admin-clients.ts";
import { request, requestBlob } from "./http.ts";
import type { AutopayStatus, SubscriptionCheckout, SubscriptionConfirmation } from "./wallet.ts";
import type { WebsiteStatus } from "./websites.ts";

export type BillingCycle = "QUARTERLY" | "YEARLY";
export type HostingStatus = "AWAITING_PAYMENT" | "ACTIVE" | "GRACE" | "SUSPENDED";
export type HostingPayer = "CLIENT" | "ADMIN" | "SYSTEM";
export type HostingPaymentMethod = "WALLET" | "CASH" | "UPI" | "BANK_TRANSFER" | "RAZORPAY";
export type WebsiteOfflineReason = "MANUAL" | "BILLING";

/** Paise per period; null = can't be bought on that cycle. */
export type CyclePrices = Record<BillingCycle, number | null>;

export type HostingPackage = {
  id: string;
  slug: string;
  name: string;
  description: string;
  features: string[];
  featured: boolean;
  /** No list price: contact sales, unless a price is agreed for the website. */
  isCustom: boolean;
  prices: CyclePrices;
};

export type AdminHostingPackage = HostingPackage & {
  active: boolean;
  sortOrder: number;
  /** Plans on this package, which a price change affects from their next payment. */
  plans: number;
  updatedAt: string;
};

export type HostingSubscription = {
  id: string;
  packageId: string | null;
  packageName: string | null;
  isCustomPackage: boolean;
  cycle: BillingCycle;
  status: HostingStatus;
  autoRenew: boolean;
  /** This website's custom package price in paise; null = not agreed. */
  customQuarterlyPaise: number | null;
  customYearlyPaise: number | null;
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
  packageName: string | null;
  cycle: BillingCycle;
  amountPaise: number;
  /** Connects charged from the wallet; null when paid otherwise. */
  connects: number | null;
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

/** Razorpay autopay on a website's plan, while it can still charge. */
export type HostingAutopay = {
  status: AutopayStatus;
  packageName: string;
  cycle: BillingCycle;
  /** Charged each period, in paise. */
  amountPaise: number;
  /** First charge; null = it was charged on approval. */
  startAt: string | null;
  nextChargeAt: string | null;
};

export type HostingPaymentOptions = {
  /** Razorpay keys are set up, so the client can pay online. */
  razorpay: boolean;
  /** The Super Admin allows paying hosting from connects. */
  connects: boolean;
  connectsPerRupee: number;
  /** The client's wallet balance in connects. */
  balance: number;
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
  autopay: HostingAutopay | null;
  /** Packages this website can choose, priced for it. */
  packages: HostingPackage[];
  /** The period a payment made now would cover. */
  nextPeriods: Record<BillingCycle, { start: string; end: string }>;
  /** Set while an active plan is too far from its end to renew. */
  renewalOpensAt: string | null;
  payment: HostingPaymentOptions;
  payments: HostingPayment[];
};

export type PlanChoice = { packageId: string; cycle: BillingCycle };

export type UpdatePlanInput = {
  packageId?: string;
  cycle?: BillingCycle;
  autoRenew?: boolean;
  /** Super Admin only; null = no custom price. */
  customQuarterlyPaise?: number | null;
  customYearlyPaise?: number | null;
};

/** WALLET charges the client's connects; the other methods record the plan's price collected offline. */
export type CollectInput = PlanChoice & { method: Exclude<HostingPaymentMethod, "RAZORPAY">; reference?: string; note?: string };

export type HostingCheckout = {
  orderId: string;
  keyId: string;
  amountPaise: number;
  currency: string;
  businessName: string;
  description: string;
  prefill: { name: string; email?: string; contact?: string };
};

/** A free plan is activated straight away; anything else goes through Razorpay. */
export type HostingCheckoutResult = { status: "CHECKOUT"; checkout: HostingCheckout } | { status: "PAID"; hosting: WebsiteHosting };

export type RazorpayConfirmation = { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string };

export type HostingPriceChange = {
  id: string;
  scope: "GLOBAL" | "CLIENT" | "WEBSITE" | "PACKAGE";
  label: string;
  /** Changes made before hosting moved to rupees are in connects. */
  unit: "CONNECTS" | "PAISE";
  oldQuarterlyPrice: number | null;
  newQuarterlyPrice: number | null;
  oldYearlyPrice: number | null;
  newYearlyPrice: number | null;
  changedBy: string | null;
  createdAt: string;
};

export type HostingSettings = {
  enabled: boolean;
  allowConnectsPayment: boolean;
  reminderDays: number;
  graceDays: number;
  connectsPerRupee: number;
  /** Clients can only pay online once Razorpay keys are saved. */
  razorpayConfigured: boolean;
  updatedAt: string | null;
  packages: AdminHostingPackage[];
  liveSitesWithoutPlan: number;
  recentPriceChanges: HostingPriceChange[];
};

export type HostingSettingsInput = Pick<HostingSettings, "enabled" | "allowConnectsPayment" | "reminderDays" | "graceDays">;

export type HostingPackageInput = {
  name: string;
  description: string;
  features: string[];
  quarterlyPricePaise: number;
  yearlyPricePaise: number;
  featured: boolean;
  active: boolean;
};

export type ClientOwner = { fullName: string; email: string | null; username: string | null; phone: string | null };

export type PaidTotals = { payments: number; amountPaise: number; collectedPaise: number };

export type ClientHostingWebsite = {
  id: string;
  name: string;
  subdomain: string;
  status: WebsiteStatus;
  offlineReason: WebsiteOfflineReason | null;
  publishedAt: string | null;
  updatedAt: string;
  subscription: HostingSubscription | null;
  /** Paise for the plan's package and cycle; null = not payable yet. */
  price: number | null;
  lastPayment: HostingPayment | null;
};

export type ClientHosting = {
  client: { id: string; businessName: string; source: ClientSource; createdAt: string; owner: ClientOwner | null };
  balance: number;
  websites: ClientHostingWebsite[];
  payments: HostingPayment[];
  totals: PaidTotals;
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
  paid: PaidTotals;
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
    /** Paise; null = not payable yet. */
    price: number | null;
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
  /** All amounts in paise, except `connects`. */
  summary: {
    payments: number;
    amountPaise: number;
    onlinePaise: number;
    connectsPaise: number;
    connects: number;
    collectedPaise: number;
  };
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
  /** Client: starts a Razorpay payment for the next period (a free plan activates straight away). */
  checkout: (websiteId: string, plan: PlanChoice) =>
    request<HostingCheckoutResult>(`${websiteBase(websiteId)}/checkout`, { method: "POST", body: plan }),
  confirmCheckout: (websiteId: string, input: RazorpayConfirmation) =>
    request<HostingResponse>(`${websiteBase(websiteId)}/checkout/verify`, { method: "POST", body: input }).then(
      (data) => data.hosting,
    ),
  /** Client: pays the next period from the wallet, when the platform allows it. */
  payWithConnects: (websiteId: string, plan: PlanChoice) =>
    request<HostingResponse>(`${websiteBase(websiteId)}/pay`, { method: "POST", body: plan }).then((data) => data.hosting),
  /** Super Admin: records a payment collected offline, or charges the client's connects. */
  collect: (websiteId: string, input: CollectInput) =>
    request<HostingResponse>(`${websiteBase(websiteId)}/collect`, { method: "POST", body: input }).then((data) => data.hosting),
  /** Client: starts Razorpay autopay for the saved plan. */
  setupAutopay: (websiteId: string) =>
    request<{ checkout: SubscriptionCheckout }>(`${websiteBase(websiteId)}/autopay`, { method: "POST" }).then((data) => data.checkout),
  confirmAutopay: (websiteId: string, input: SubscriptionConfirmation) =>
    request<HostingResponse>(`${websiteBase(websiteId)}/autopay/verify`, { method: "POST", body: input }).then(
      (data) => data.hosting,
    ),
  /** Client or Super Admin: turns autopay off; the paid period stays. */
  cancelAutopay: (websiteId: string) =>
    request<HostingResponse>(`${websiteBase(websiteId)}/autopay`, { method: "DELETE" }).then((data) => data.hosting),
};

/** Packages and list prices, as set in Settings → Hosting. */
export type PublicPricing = {
  packages: HostingPackage[];
  /** Hosting can also be paid from connects. */
  allowConnectsPayment: boolean;
  reminderDays: number;
  graceDays: number;
};

export const pricingApi = {
  get: () => request<{ pricing: PublicPricing }>("/pricing").then((data) => data.pricing),
};

const SETTINGS = "/admin/settings/hosting";

export const adminHostingApi = {
  settings: () => request<{ settings: HostingSettings }>(SETTINGS).then((data) => data.settings),
  updateSettings: (input: HostingSettingsInput) =>
    request<{ settings: HostingSettings }>(SETTINGS, { method: "PUT", body: input }).then((data) => data.settings),
  updatePackage: (packageId: string, input: HostingPackageInput) =>
    request<{ settings: HostingSettings }>(`${SETTINGS}/packages/${encodeURIComponent(packageId)}`, {
      method: "PUT",
      body: input,
    }).then((data) => data.settings),
  backfill: (input: PlanChoice & { freeDays: number }) =>
    request<{ created: number }>(`${SETTINGS}/backfill`, { method: "POST", body: input }),
  clients: (params: ClientOverviewParams) => request<ClientOverviewList>(`/admin/hosting/clients${toQuery(params)}`),
  client: (clientId: string) =>
    request<{ hosting: ClientHosting }>(`/admin/hosting/clients/${encodeURIComponent(clientId)}`).then((data) => data.hosting),
  subscriptions: (params: SubscriptionListParams) => request<SubscriptionList>(`/admin/hosting/subscriptions${toQuery(params)}`),
  payments: (params: PaymentListParams) => request<PaymentList>(`/admin/hosting/payments${toQuery(params)}`),
  paymentsCsv: (params: Omit<PaymentListParams, "page" | "pageSize">) =>
    requestBlob(`/admin/hosting/payments.csv${toQuery(params)}`),
};
