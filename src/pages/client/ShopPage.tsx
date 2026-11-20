import { useEffect, useState } from "react";
import { Spinner } from "@heroui/react";
import { ShoppingBag } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { errorMessage } from "../../api/http.ts";
import { websitesApi, type WebsiteDetail, type WebsiteSummary } from "../../api/websites.ts";
import PageHeader from "../../components/app/PageHeader.tsx";
import ShopPanel from "../../components/shop/ShopPanel.tsx";
import FormAlert from "../../components/ui/FormAlert.tsx";
import SelectInput from "../../components/ui/SelectInput.tsx";

/**
 * Client "Shop" page: pick one of the client's websites that has the shop
 * feature, then manage that website's shop. The chosen website lives in
 * `?website=<id>` so the page can be linked and survives a reload.
 */
export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [websites, setWebsites] = useState<WebsiteSummary[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [website, setWebsite] = useState<WebsiteDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    websitesApi
      .list({ pageSize: 100 })
      .then((result) => !cancelled && setWebsites(result.items.filter((item) => item.shopFeatureEnabled)))
      .catch((err: unknown) => !cancelled && setListError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, []);

  const requestedId = searchParams.get("website");
  const selectedId = websites?.find((item) => item.id === requestedId)?.id ?? websites?.[0]?.id ?? null;

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    setWebsite(null);
    setDetailError(null);
    websitesApi
      .get(selectedId)
      .then((detail) => !cancelled && setWebsite(detail))
      .catch((err: unknown) => !cancelled && setDetailError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  function selectWebsite(id: string) {
    // Drop the previous website's shop section so the new one opens on its default view.
    setSearchParams({ website: id }, { replace: true });
  }

  const picker = websites && websites.length > 1 && selectedId && (
    <SelectInput
      ariaLabel="Website"
      className="w-64"
      value={selectedId}
      onChange={selectWebsite}
      options={websites.map((item) => ({ value: item.id, label: item.name }))}
    />
  );

  return (
    <div className="px-6 py-8 sm:px-8">
      <PageHeader
        title="Shop"
        description={
          websites?.length === 1 ? `Products, orders and payments for ${websites[0].name}.` : "Choose a website to manage its shop."
        }
        actions={picker}
      />

      {listError && (
        <div className="mt-6 max-w-2xl">
          <FormAlert status="danger">{listError}</FormAlert>
        </div>
      )}

      {!websites && !listError && (
        <div className="grid place-items-center py-20">
          <Spinner aria-label="Loading websites" />
        </div>
      )}

      {websites?.length === 0 && (
        <section className="mt-8 rounded-xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-soft text-brand">
            <ShoppingBag className="size-6" aria-hidden />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-ink">No shop yet</h2>
          <p className="mt-1 text-sm text-ink-body">
            The shop isn't available for your websites. Contact us to have it turned on.
          </p>
        </section>
      )}

      {detailError && (
        <div className="mt-6 max-w-2xl">
          <FormAlert status="danger">{detailError}</FormAlert>
        </div>
      )}

      {selectedId && !website && !detailError && (
        <div className="grid place-items-center py-20">
          <Spinner aria-label="Loading shop" />
        </div>
      )}

      {website && website.id === selectedId && (
        <div className="mt-6">
          <ShopPanel key={website.id} website={website} onChange={setWebsite} />
        </div>
      )}
    </div>
  );
}
