import { request } from "./http.ts";

export type PartnerStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
export type PartnerReferralStatus = "REGISTERED" | "CONVERTED";
export type CommissionStatus = "PENDING" | "APPROVED" | "PAID" | "CANCELLED";
export type CommissionSource = "WALLET_TOPUP" | "HOSTING" | "SHOP_ORDER";

export type PartnerApplicationForm = {
  companyName: string;
  registrationNumber?: string;
  website?: string;
  businessType: string;
  yearEstablished: string;
  country: string;
  state: string;
  city: string;
  businessAddress: string;

  contactName: string;
  designation: string;
  email: string;
  phone: string;
  alternatePhone?: string;

  partnershipType?: string;
  targetCategories: string[];
  expectedReferrals: string;
  marketingChannels: string[];
  reason: string;
  previousExperience: boolean;
  acceptTerms: boolean;
};

export type PartnerSummary = {
  id: string;
  partnerNumber?: number;
  applicationId: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  businessType: string;
  partnershipType: string;
  status: PartnerStatus;
  referralCode: string | null;
  commissionRate: number;
  isCommissionActive: boolean;
  totalReferrals: number;
  convertedReferrals: number;
  totalCommissionPaise: number;
  approvedAt: string | null;
  createdAt: string;
};

export type PartnerListResponse = {
  items: PartnerSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  counts: {
    ALL: number;
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
    SUSPENDED: number;
  };
};

export type PartnerDetail = PartnerSummary & {
  registrationNumber: string | null;
  website: string | null;
  yearEstablished: string;
  country: string;
  state: string;
  city: string;
  businessAddress: string;
  designation: string;
  alternatePhone: string | null;
  targetCategories: string[];
  expectedReferrals: string;
  marketingChannels: string[];
  reason: string;
  previousExperience: boolean;
  rejectionReason: string | null;
  suspensionReason: string | null;
  approvedBy: string | null;
  rejectedAt: string | null;
  suspendedAt: string | null;
  userId: string | null;
  activities: {
    id: string;
    kind: string;
    body: string;
    actorName: string | null;
    createdAt: string;
  }[];
};

export type PartnerDashboardData = {
  partner: {
    id: string;
    applicationId?: string;
    companyName: string;
    contactName: string;
    email: string;
    phone?: string;
    businessType?: string;
    partnershipType?: string;
    status?: PartnerStatus;
    referralCode: string | null;
    commissionRate: number;
    isCommissionActive: boolean;
    shareUrl: string;
    createdAt?: string;
  };
  stats: {
    totalReferrals: number;
    registeredCustomers: number;
    successfulConversions: number;
    totalEarnedPaise: number;
    pendingCommissionPaise: number;
    approvedCommissionPaise: number;
    paidCommissionPaise: number;
  };
  referrals: {
    id: string;
    customerName: string;
    customerEmail: string;
    status: PartnerReferralStatus;
    totalSpentPaise: number;
    registeredAt: string;
    convertedAt: string | null;
  }[];
  commissions: {
    id: string;
    source: CommissionSource;
    orderAmountPaise: number;
    commissionRate: number;
    commissionAmountPaise: number;
    status: CommissionStatus;
    customerName: string;
    paidAt: string | null;
    createdAt: string;
  }[];
};

export type PartnerCommissionsResponse = {
  items: {
    id: string;
    source: CommissionSource;
    orderAmountPaise: number;
    commissionRate: number;
    commissionAmountPaise: number;
    currency: string;
    status: CommissionStatus;
    customerName: string;
    paidAt: string | null;
    paymentReference: string | null;
    notes: string | null;
    createdAt: string;
  }[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const BASE = "/partner";
const ADMIN_BASE = "/admin/partners";

function toQuery(params: Record<string, unknown>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  }
  const text = query.toString();
  return text ? `?${text}` : "";
}

export const partnerApi = {
  apply: (form: PartnerApplicationForm) =>
    request<{ applicationId: string; message: string }>(`${BASE}/apply`, {
      method: "POST",
      body: form,
    }),

  getDashboard: () => request<PartnerDashboardData>(`${BASE}/dashboard`),

  getCommissions: (page = 1, pageSize = 20) =>
    request<PartnerCommissionsResponse>(`${BASE}/commissions${toQuery({ page, pageSize })}`),
};

export const adminPartnerApi = {
  list: (params: { search?: string; status?: string; page?: number; pageSize?: number }) =>
    request<PartnerListResponse>(`${ADMIN_BASE}${toQuery(params)}`),

  get: (id: string) => request<PartnerDetail>(`${ADMIN_BASE}/${id}`),

  approve: (
    id: string,
    data: { commissionRate: number; customReferralCode?: string; temporaryPassword?: string },
  ) =>
    request<PartnerDetail>(`${ADMIN_BASE}/${id}/approve`, {
      method: "POST",
      body: data,
    }),

  reject: (id: string, data: { reason: string }) =>
    request<PartnerDetail>(`${ADMIN_BASE}/${id}/reject`, {
      method: "POST",
      body: data,
    }),

  suspend: (id: string, data: { reason: string }) =>
    request<PartnerDetail>(`${ADMIN_BASE}/${id}/suspend`, {
      method: "POST",
      body: data,
    }),

  reactivate: (id: string) =>
    request<PartnerDetail>(`${ADMIN_BASE}/${id}/reactivate`, {
      method: "POST",
    }),

  updateCommission: (
    id: string,
    data: { commissionRate?: number; isCommissionActive?: boolean },
  ) =>
    request<PartnerDetail>(`${ADMIN_BASE}/${id}/commission`, {
      method: "PATCH",
      body: data,
    }),

  listCommissions: (id: string, page = 1, pageSize = 25) =>
    request<PartnerCommissionsResponse>(
      `${ADMIN_BASE}/${id}/commissions${toQuery({ page, pageSize })}`,
    ),

  updateCommissionStatus: (
    commissionId: string,
    data: { status: CommissionStatus; paymentReference?: string; notes?: string },
  ) =>
    request<unknown>(`${ADMIN_BASE}/commissions/${commissionId}`, {
      method: "PATCH",
      body: data,
    }),
};

