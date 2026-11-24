import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { errorMessage } from "../api/http.ts";
import { websitesApi, type WebsiteSummary } from "../api/websites.ts";

/**
 * The client's websites that have the shop feature, and the one chosen in `?website=<id>`
 * (first website when none or an unknown id is given), so shop pages can be linked and reloaded.
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
  const selectedId = websites?.find((item) => item.id === requestedId)?.id ?? websites?.[0]?.id ?? null;

  /** Switches website; other query params (e.g. the shop section) are dropped so it opens on its default view. */
  function selectWebsite(id: string) {
    setSearchParams({ website: id }, { replace: true });
  }

  return { websites, error, selectedId, selectWebsite };
}
