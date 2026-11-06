export type StorageUnit = "MB" | "GB";

export const MIN_MEDIA_STORAGE_MB = 100;
export const MAX_MEDIA_STORAGE_MB = 1024 * 100;

export function storageFromMb(mb: number): { amount: string; unit: StorageUnit } {
  if (mb >= 1024 && mb % 1024 === 0) {
    return { amount: String(mb / 1024), unit: "GB" };
  }
  return { amount: String(mb), unit: "MB" };
}

export function storageToMb(amount: string, unit: StorageUnit): number | null {
  const value = Number(amount);
  if (!Number.isInteger(value) || value < 1) return null;
  return unit === "GB" ? value * 1024 : value;
}

export function storageRangeError(unit: StorageUnit): string {
  return unit === "GB" ? "Enter 1 to 100 GB" : "Enter 100 to 102400 MB";
}

export function isValidStorageMb(mb: number | null): mb is number {
  return mb !== null && mb >= MIN_MEDIA_STORAGE_MB && mb <= MAX_MEDIA_STORAGE_MB;
}
