import { request } from "./http.ts";

export type ImportIssue = { line: number | null; message: string };

export type ImportPreviewItem = { action: "create" | "update"; name: string; variants: number; lines: number[] };

/** What a product sheet will create and update, and any problems that block it. */
export type ProductImportSummary = {
  rows: number;
  createProducts: number;
  createVariants: number;
  updateProducts: number;
  updateVariants: number;
  newCategories: string[];
  issues: ImportIssue[];
  items: ImportPreviewItem[];
};

export type ProductImportResult = ProductImportSummary & { applied: boolean; created: number; updated: number; failures: ImportIssue[] };

function upload<T>(path: string, file: File) {
  const form = new FormData();
  form.set("file", file);
  return request<{ import: T }>(path, { method: "POST", body: form }).then((data) => data.import);
}

/** Column headers of the import template, in order. */
export const PRODUCT_IMPORT_COLUMNS = [
  "Product name",
  "Category",
  "Description",
  "Option 1 name",
  "Option 1 value",
  "Option 2 name",
  "Option 2 value",
  "Option 3 name",
  "Option 3 value",
  "Price",
  "Base price",
  "SKU",
  "Barcode",
  "Stock",
  "GST %",
  "Listed",
] as const;

/** Example rows for the template: a product with sizes and colours, and a simple product. */
const TEMPLATE_ROWS = [
  ["Cotton T-shirt", "Clothing", "Soft everyday tee", "Size", "S", "Colour", "Red", "", "", "499", "220", "TS-S-RED", "8901000000011", "10", "5", "Yes"],
  ["Cotton T-shirt", "Clothing", "", "Size", "M", "Colour", "Red", "", "", "499", "220", "TS-M-RED", "8901000000028", "12", "", ""],
  ["Cotton T-shirt", "Clothing", "", "Size", "S", "Colour", "Blue", "", "", "549", "240", "TS-S-BLUE", "8901000000035", "8", "", ""],
  ["Cotton T-shirt", "Clothing", "", "Size", "M", "Colour", "Blue", "", "", "549", "240", "TS-M-BLUE", "8901000000042", "6", "", ""],
  ["Ceramic mug", "Home", "350 ml mug", "", "", "", "", "", "", "299", "120", "MUG-350", "8901000000059", "25", "12", "Yes"],
];

function csvCell(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** The import template as a CSV file, ready to open in Excel or Google Sheets. */
export function productImportTemplate(): Blob {
  const lines = [PRODUCT_IMPORT_COLUMNS, ...TEMPLATE_ROWS].map((row) => row.map(csvCell).join(","));
  return new Blob([`﻿${lines.join("\r\n")}`], { type: "text/csv;charset=utf-8" });
}

export const shopImportApi = {
  /** Checks a .csv or .xlsx product sheet without saving anything. */
  preview: (websiteId: string, file: File) =>
    upload<ProductImportSummary>(`/websites/${websiteId}/shop/products/import/preview`, file),
  /** Creates and updates the sheet's products (refused while the sheet has problems). */
  apply: (websiteId: string, file: File) => upload<ProductImportResult>(`/websites/${websiteId}/shop/products/import`, file),
};
