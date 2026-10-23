import { useLayoutEffect } from "react";
import { SITE_CSS } from "../../site-kit/index.ts";

let users = 0;
let styleNode: HTMLStyleElement | null = null;

/**
 * Mounts one shared copy of the site stylesheet for as long as any caller is mounted.
 * Thumbnail grids render many sites at once; a `<SiteStyles />` per site would make the
 * browser parse and match the full stylesheet once per card.
 * Appended to `<body>` so it keeps the cascade position an inline `<SiteStyles />` had.
 */
export function useSiteStylesheet(): void {
  useLayoutEffect(() => {
    users += 1;
    if (!styleNode) {
      styleNode = document.createElement("style");
      styleNode.dataset.wbSiteStyles = "";
      styleNode.textContent = SITE_CSS;
      document.body.appendChild(styleNode);
    }
    return () => {
      users -= 1;
      if (users === 0 && styleNode) {
        styleNode.remove();
        styleNode = null;
      }
    };
  }, []);
}

/** Component form of `useSiteStylesheet`, for rendering it conditionally. */
export function SharedSiteStyles(): null {
  useSiteStylesheet();
  return null;
}
