import { createContext, useContext, type ReactNode } from "react";

const ContactEndpointContext = createContext<string | null>(null);

/** Tells contact forms in the editor and draft preview where to post inquiries. */
export function ContactEndpointProvider({ endpoint, children }: { endpoint: string | null; children: ReactNode }) {
  return <ContactEndpointContext.Provider value={endpoint}>{children}</ContactEndpointContext.Provider>;
}

export function useContactEndpoint(): string | null {
  return useContext(ContactEndpointContext);
}

export function contactEndpointFor(subdomain: string | undefined | null): string | null {
  const clean = subdomain?.trim();
  if (!clean) return null;
  return `/api/public/site/${encodeURIComponent(clean)}/contact`;
}
