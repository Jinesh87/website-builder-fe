/** Saves a fetched file (e.g. a CSV export) through the browser's download prompt. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** "name-2026-10-21.csv" style file names. */
export function datedFilename(base: string, extension: string): string {
  return `${base}-${new Date().toISOString().slice(0, 10)}.${extension}`;
}
