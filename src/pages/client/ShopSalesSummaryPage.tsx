import { useEffect, useState } from "react";
import { Spinner } from "@heroui/react";
import { Link } from "react-router-dom";
import { errorMessage } from "../../api/http.ts";
import { shopSalesApi, type SalesSummary } from "../../api/shop-sales.ts";
import ShopOrderDetail from "../../components/shop/ShopOrderDetail.tsx";
import PosPeriodBar from "../../components/shop/pos/PosPeriodBar.tsx";
import SalesOrdersList from "../../components/shop/sales/SalesOrdersList.tsx";
import SalesSummaryCards from "../../components/shop/sales/SalesSummaryCards.tsx";
import FormAlert from "../../components/ui/FormAlert.tsx";
import SelectInput from "../../components/ui/SelectInput.tsx";
import { useReportPeriod } from "../../hooks/use-report-period.ts";
import { useShopWebsites } from "../../hooks/use-shop-websites.ts";

/** Sales from the online store and the POS till together, for a day, week, month, year or date range. */
export default function ShopSalesSummaryPage() {
  const { websites, error: listError, selectedId } = useShopWebsites();
  const { today, period, range, setParams } = useReportPeriod();
  const { from, to } = range;
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    setError(null);
    setSummary(null);
    shopSalesApi
      .summary(selectedId, { from, to })
      .then((loaded) => !cancelled && setSummary(loaded))
      .catch((err: unknown) => !cancelled && setError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [selectedId, from, to, reloadKey]);

  if (selectedId && openOrderId) {
    return (
      <div className="px-6 py-8 sm:px-8">
        <ShopOrderDetail
          websiteId={selectedId}
          orderId={openOrderId}
          onBack={() => setOpenOrderId(null)}
          onUpdated={() => setReloadKey((key) => key + 1)}
        />
      </div>
    );
  }

  return (
    <div className="px-6 py-8 sm:px-8">
      <header className="flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <h1 className="text-2xl font-semibold text-ink">Sales summary</h1>
          <p className="mt-1 text-sm text-ink-body">Online store and in-store (POS) sales together for the period you pick.</p>
        </div>
        {websites && websites.length > 1 && selectedId && (
          <SelectInput
            ariaLabel="Website"
            className="w-56"
            value={selectedId}
            onChange={(website) => setParams({ website })}
            options={websites.map((item) => ({ value: item.id, label: item.name }))}
          />
        )}
      </header>

      <div className="mt-6">
        <PosPeriodBar
          period={period}
          range={range}
          today={today}
          onChange={(nextPeriod, nextRange) => setParams({ period: nextPeriod, range: nextRange })}
        />
      </div>

      {(listError || error) && (
        <div className="mt-6 max-w-2xl">
          <FormAlert status="danger">{listError ?? error}</FormAlert>
        </div>
      )}
      {websites?.length === 0 && (
        <p className="mt-10 text-sm text-ink-muted">
          None of your websites has a shop yet. Set one up in{" "}
          <Link to="/shop?section=settings" className="font-medium text-brand hover:underline">
            Shop → Settings
          </Link>
          .
        </p>
      )}

      <div className="mt-5">
        {summary ? (
          <SalesSummaryCards summary={summary} />
        ) : (
          !error &&
          websites?.length !== 0 && (
            <div className="grid place-items-center py-12">
              <Spinner aria-label="Loading sales summary" />
            </div>
          )
        )}
      </div>

      {selectedId && (
        <div className="mt-6">
          <SalesOrdersList websiteId={selectedId} range={range} reloadKey={reloadKey} onOpen={setOpenOrderId} />
        </div>
      )}
    </div>
  );
}
