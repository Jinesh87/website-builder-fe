import type { AiModelOption } from "./ai-models.ts";
import { request } from "./http.ts";

export type AiConfig = {
  configured: boolean;
  openaiApiKeyMasked: string | null;
  model: string;
  updatedAt: string | null;
  /** Models offered to clients, with pricing. */
  models: AiModelOption[];
};

export type AiConfigInput = {
  /** Leave empty to keep the stored key. */
  openaiApiKey?: string;
  model: string;
};

/** USD prices per 1M tokens for one model. */
export type AiModelPrice = {
  id: string;
  label: string;
  kind: "chat" | "image";
  inputPerMillion: number;
  outputPerMillion: number;
  defaultInputPerMillion: number;
  defaultOutputPerMillion: number;
  /** True when it differs from the built-in list price. */
  customized: boolean;
  updatedAt: string | null;
};

export type AiModelPriceInput = { modelId: string; inputPerMillion: number; outputPerMillion: number };

type ConfigResponse = { config?: AiConfig; data?: { config?: AiConfig } };

const BASE = "/admin/settings/ai";

export const adminAiApi = {
  get: () =>
    request<ConfigResponse>(BASE).then((data) => {
      const cfg = data?.config || data?.data?.config;
      if (!cfg) {
        throw new Error("Invalid configuration response from server");
      }
      return cfg;
    }),

  update: (input: AiConfigInput) =>
    request<ConfigResponse>(BASE, { method: "PUT", body: input }).then((data) => {
      const cfg = data?.config || data?.data?.config;
      if (!cfg) {
        throw new Error("Invalid configuration response from server");
      }
      return cfg;
    }),

  pricing: () => request<{ prices: AiModelPrice[] }>(`${BASE}/pricing`).then((data) => data.prices),

  updatePricing: (prices: AiModelPriceInput[]) =>
    request<{ prices: AiModelPrice[] }>(`${BASE}/pricing`, { method: "PUT", body: { prices } }).then((data) => data.prices),
};
