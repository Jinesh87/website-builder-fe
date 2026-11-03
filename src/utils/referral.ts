const REFERRAL_KEY = "byz_referral_code";
const COOKIE_MAX_AGE_DAYS = 30;

export function saveReferralCode(rawCode: string): string | null {
  if (typeof window === "undefined") return null;
  const code = rawCode.trim().toUpperCase();
  if (!code) return null;
  try {
    localStorage.setItem(REFERRAL_KEY, code);
    const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
    document.cookie = `${REFERRAL_KEY}=${encodeURIComponent(code)}; path=/; max-age=${maxAge}; SameSite=Lax`;
    return code;
  } catch {
    return null;
  }
}

export function captureReferralCodeFromUrl(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("ref")?.trim() || params.get("r")?.trim();

    if (code) {
      return saveReferralCode(code);
    }
  } catch {
    // ignore
  }

  return getReferralCode();
}

export function getReferralCode(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const fromStorage = localStorage.getItem(REFERRAL_KEY);
    if (fromStorage) return fromStorage;

    const match = document.cookie.match(new RegExp(`(^|;\\s*)${REFERRAL_KEY}=([^;]*)`));
    if (match?.[2]) {
      const code = decodeURIComponent(match[2]);
      localStorage.setItem(REFERRAL_KEY, code);
      return code;
    }
  } catch {
    // ignore
  }

  return null;
}

export function clearReferralCode(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(REFERRAL_KEY);
    document.cookie = `${REFERRAL_KEY}=; path=/; max-age=0`;
  } catch {
    // ignore
  }
}

