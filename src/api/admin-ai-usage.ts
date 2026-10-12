import { request } from "./http.ts";

export type AiUsageSortBy = "totalTokens" | "estimatedCost" | "totalRequests" | "businessName" | "lastUsedAt";
export type SortOrder = "asc" | "desc";

export type ClientAiUsageSummary = {
  clientId: string;
  businessName: string;
  owner: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  totalRequests: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
  topModel: string | null;
  lastUsedAt: string | null;
};

export type AiUsageTotals = {
  totalRequests: number;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  totalEstimatedCost: number;
  activeClientsCount: number;
};

export type AiUsageListParams = {
  month?: number | string;
  year?: number | string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: AiUsageSortBy;
  sortOrder?: SortOrder;
};

export type AiUsageListResponse = {
  items: ClientAiUsageSummary[];
  summary: AiUsageTotals;
  total: number;
  page: number;
  pageSize: number;
  selectedMonth: number | null;
  selectedYear: number;
};

export type AiCallDetail = {
  id: string;
  createdAt: string;
  /** Which feature made the call, e.g. "site_copilot". */
  scope: string;
  model: string;
  websiteId: string | null;
  websiteName: string | null;
  userName: string | null;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  durationMs: number;
  inputCost: number;
  outputCost: number;
  cost: number;
};

export type ClientAiCallsResponse = {
  client: { id: string; businessName: string };
  calls: AiCallDetail[];
  byFeature: Array<{ scope: string; calls: number; totalTokens: number; cost: number }>;
  total: number;
  totalCost: number;
  page: number;
  pageSize: number;
};

export type ClientAiCallsParams = {
  month?: number | string;
  year?: number | string;
  page?: number;
  pageSize?: number;
};

const BASE = "/admin/ai-usage";

function toQuery(params: AiUsageListParams | ClientAiCallsParams): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  }
  const text = query.toString();
  return text ? `?${text}` : "";
}

export const adminAiUsageApi = {
  list: (params: AiUsageListParams) => request<AiUsageListResponse>(`${BASE}${toQuery(params)}`),
  clientCalls: (clientId: string, params: ClientAiCallsParams) =>
    request<ClientAiCallsResponse>(`${BASE}/clients/${encodeURIComponent(clientId)}/calls${toQuery(params)}`),
};
