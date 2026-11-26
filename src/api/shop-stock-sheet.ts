import { request, requestBlob } from "./http.ts";

export type StockSheetIssue = { line: number | null; message: string };

/** One variant whose stock the uploaded list would change. */
export type StockChange = {
  line: number;
  variantId: string;
  productName: string;
  variantName: string;
  /** Stock when the list was downloaded, when the file says. */
  before: number | null;
  /** Stock right now. */
  current: number;
  next: number;
  /** Sold or restocked since the download; applied only when the owner says so. */
  changedSinceDownload: boolean;
};

export type StockUploadPreview = { rows: number; changes: StockChange[]; unchanged: number; issues: StockSheetIssue[] };

export type StockUploadResult = StockUploadPreview & { updated: number; skipped: number };

function upload<T>(path: string, file: File, fields: Record<string, string> = {}) {
  const form = new FormData();
  for (const [name, value] of Object.entries(fields)) form.set(name, value);
  form.set("file", file);
  return request<{ upload: T }>(path, { method: "POST", body: form }).then((data) => data.upload);
}

export const shopStockSheetApi = {
  /** Every variant and its stock as an Excel file with a New stock column to edit. */
  download: (websiteId: string) => requestBlob(`/websites/${websiteId}/shop/inventory/stock-list.xlsx`),
  /** What the edited list would change, without saving. */
  preview: (websiteId: string, file: File) =>
    upload<StockUploadPreview>(`/websites/${websiteId}/shop/inventory/stock-list/preview`, file),
  /** Sets the stock. `includeChanged` also applies rows that sold or were restocked since the download. */
  apply: (websiteId: string, file: File, includeChanged: boolean) =>
    upload<StockUploadResult>(`/websites/${websiteId}/shop/inventory/stock-list`, file, { includeChanged: String(includeChanged) }),
};
