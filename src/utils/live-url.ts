import { env } from "../config/env.ts";

export function getLiveSiteUrl(subdomain: string, customDomain?: string | null): string {
  if (customDomain) {
    return `https://${customDomain}`;
  }
  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  if (isLocal) {
    // Direct link to backend live site engine on local dev
    const origin = env.apiUrl.replace(/\/api\/?$/, "");
    return `${origin}/live/${subdomain}`;
  }
  return `https://${subdomain}.bytezora.site`;
}
