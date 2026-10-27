import { createContext, useContext } from "react";

/** Slug of the page being rendered, so navigation can mark its own link. */
export const CurrentPageContext = createContext<string | null>(null);

export function useIsCurrentPage(href: string | undefined): boolean {
  const slug = useContext(CurrentPageContext);
  if (!slug || !href) return false;
  const path = href.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  return path === (slug.replace(/\/+$/, "") || "/");
}
