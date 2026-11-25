import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { errorMessage } from "../api/http.ts";
import { websitesApi, type WebsiteSummary } from "../api/websites.ts";

/** Browser storage for the last shop website picked, so every shop page opens on it. */
const SELECTED_WEBSITE_KEY = "shop:selectedWebsiteId";

function storedWebsiteId(): string | null {
  try {
    return localStorage.getItem(SELECTED_WEBSITE_KEY);
  } catch {
    return null;
  }
}

function storeWebsiteId(id: string): void {
  try {
    localStorage.setItem(SELECTED_WEBSITE_KEY, id);
  } catch {
    // Storage blocked (private mode): the choice just isn't remembered.
  }
}

/**
 * The client's websites that have the shop feature, and the one chosen in `?website=<id>`.
 * Without one in the URL, the website last picked on any shop page is used (then the first
 * website), so the choice follows the user around Shop, POS, POS sales and Sales summary.
 * `posOnly` keeps just the shops with the POS till turned on (for the till and POS sales pages).
 */
export function useShopWebsites({ posOnly = false }: { posOnly?: boolean } = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [websites, setWebsites] = useState<WebsiteSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    websitesApi
      .list({ pageSize: 100 })
      .then(
        (result) =>
          !cancelled &&
          setWebsites(
            result.items.filter(
              (item) => item.shopFeatureEnabled && (!posOnly || (item.shopEnabled && item.shopPosEnabled)),
            ),
          ),
      )
      .catch((err: unknown) => !cancelled && setError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [posOnly]);

  const requestedId = searchParams.get("website");
  const fromUrl = websites?.find((item) => item.id === requestedId)?.id;
  const remembered = storedWebsiteId();
  const selectedId = fromUrl ?? websites?.find((item) => item.id === remembered)?.id ?? websites?.[0]?.id ?? null;

  // Remember a website picked here (it arrives through the URL) for the other shop pages.
  useEffect(() => {
    if (fromUrl) storeWebsiteId(fromUrl);
  }, [fromUrl]);

  /** Switches website; other query params (e.g. the shop section) are dropped so it opens on its default view. */
  function selectWebsite(id: string) {
    storeWebsiteId(id);
    setSearchParams({ website: id }, { replace: true });
  }

  return { websites, error, selectedId, selectWebsite };
}
