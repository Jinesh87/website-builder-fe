const publicSiteDomain = import.meta.env.VITE_PUBLIC_SITE_DOMAIN?.trim();

export const env = {
  appName: import.meta.env.VITE_APP_NAME?.trim() || "WebBuilder",
  apiUrl: import.meta.env.VITE_API_URL?.trim() || "http://localhost:3000/api",
  publicSiteDomain: publicSiteDomain || "bytezora.site",
  /** False until a wildcard DNS record serves <subdomain>.publicSiteDomain; live links then go through the API. */
  hasPublicSiteDomain: Boolean(publicSiteDomain),
} as const;
