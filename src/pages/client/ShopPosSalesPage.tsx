import { useEffect, useMemo, useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { ArrowLeft, Download, Printer, Store } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { errorMessage } from "../../api/http.ts";
import { shopApi, type ShopOrder, type ShopOrderPage } from "../../api/shop.ts";
import { POS_METHOD_LABEL, shopPosApi, type PosDailySummary } from "../../api/shop-pos.ts";
import ShopOrderDetail from "../../components/shop/ShopOrderDetail.tsx";
import { RefundBadge, StatusBadge } from "../../components/shop/ShopOrderBadges.tsx";
import { usePosReceiptActions } from "../../components/shop/pos/PosSaleCompleteDialog.tsx";
import PosPeriodBar from "../../components/shop/pos/PosPeriodBar.tsx";
import PosSummaryCards, { todayIst } from "../../components/shop/pos/PosSummaryCards.tsx";
import { periodFromParams, type DayRange, type PosPeriod } from "../../components/shop/pos/pos-period.ts";
import { formatInr } from "../../components/shop/shop-format.ts";
import FormAlert from "../../components/ui/FormAlert.tsx";
import SelectInput from "../../components/ui/SelectInput.tsx";
import { useShopWebsites } from "../../hooks/use-shop-websites.ts";

/** Time of a sale; with the date too when the report spans several days. */
function saleTime(createdAt: string, withDate: boolean): string {
  const at = new Date(createdAt);
  const time = at.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return withDate ? `${at.toLocaleDateString(undefined, { day: "numeric", month: "short" })}, ${time}` : time;
}

function SaleActions({ websiteId, order }: { websiteId: string; order: ShopOrder }) {
  const { print, printing, downloadInvoice, downloading, feedback } = usePosReceiptActions(websiteId, order);
  if (!order.paidAt) return null;
  const failed = feedback?.status === "danger";
  return (
    <div className="flex justify-end gap-1" onClick={(event) => event.stopPropagation()}>
      <Button
        size="sm"
        variant="ghost"
        isIconOnly
        aria-label={`Print receipt for sale #${order.number}`}
        onPress={() => void print()}
        isPending={printing}
      >
        <Printer className={`size-4 ${failed ? "text-red-600" : ""}`} />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        isIconOnly
        aria-label={`Download invoice for sale #${order.number}`}
        onPress={() => void downloadInvoice()}
        isPending={downloading}
      >
        <Download className={`size-4 ${failed ? "text-red-600" : ""}`} />
      </Button>
    </div>
  );
}

/** POS sales for a day, week, month, year or date range: totals by payment method and every sale, with reprints and the full order view. */
export default function ShopPosSalesPage() {
  const { websites, error: listError, selectedId } = useShopWebsites({ posOnly: true });
  const [searchParams, setSearchParams] = useSearchParams();
  const today = todayIst();
  const { period, range } = useMemo(() => periodFromParams(searchParams, today), [searchParams, today]);
  const { from, to } = range;
  const [page, setPage] = useState(1);
  const [summary, setSummary] = useState<PosDailySummary | null>(null);
  const [sales, setSales] = useState<ShopOrderPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  function setParams(next: { website?: string; period?: PosPeriod; range?: DayRange }) {
    const params = new URLSearchParams(searchParams);
    if (next.website) params.set("website", next.website);
    if (next.period && next.range) {
      for (const key of ["period", "date", "from", "to"]) params.delete(key);
      if (next.period !== "day") params.set("period", next.period);
      if (next.period === "range") {
        params.set("from", next.range.from);
        params.set("to", next.range.to);
      } else if (next.range.from !== today) {
        params.set("date", next.range.from);
      }
    }
    setSearchParams(params, { replace: true });
    setPage(1);
  }

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    setError(null);
    setSummary(null);
    shopPosApi
      .summary(selectedId, { from, to })
      .then((loaded) => !cancelled && setSummary(loaded))
      .catch((err: unknown) => !cancelled && setError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [selectedId, from, to, reloadKey]);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    setSales(null);
    shopApi
      .orders(selectedId, { channel: "pos", from, to, page })
      .then((loaded) => !cancelled && setSales(loaded))
      .catch((err: unknown) => !cancelled && setError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [selectedId, from, to, page, reloadKey]);

  const tillLink = selectedId ? `/shop/pos?website=${selectedId}` : "/shop/pos";
  const totalPages = sales ? Math.max(1, Math.ceil(sales.total / sales.pageSize)) : 1;
  const singleDay = from === to;
  const includesToday = from <= today && today <= to;

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
      <div className="flex flex-wrap items-center gap-3">
        <Link to={tillLink} className="inline-flex items-center gap-1 text-sm font-medium text-ink-muted hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden /> Back to till
        </Link>
      </div>

      <header className="mt-3 flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <h1 className="text-2xl font-semibold text-ink">POS sales</h1>
          <p className="mt-1 text-sm text-ink-body">Takings and every in-store sale for the period you pick.</p>
        </div>
        {websites && websites.length > 1 && selectedId && (
          <SelectInput
            ariaLabel="Website"
            className="w-56"
            value={selectedId}
            onChange={(website) => setParams({ website })}
            options={websites.map((item) => ({
              value: item.id,
              label: item.name,
            }))}
          />
        )}
        <Link to={tillLink} className={buttonVariants({ variant: "outline" })}>
          <Store className="size-4" aria-hidden /> Open till
        </Link>
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
          None of your shops has POS turned on. Turn it on in{" "}
          <Link to="/shop?section=settings" className="font-medium text-brand hover:underline">
            Shop → Settings
          </Link>
          .
        </p>
      )}

      <div className="mt-5">
        {summary ? (
          <PosSummaryCards summary={summary} />
        ) : (
          !error &&
          websites?.length !== 0 && (
            <div className="grid place-items-center py-12">
              <Spinner aria-label="Loading totals" />
            </div>
          )
        )}
      </div>

      {selectedId && (
        <section className="mt-6 rounded-xl border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <h2 className="text-sm font-semibold text-ink">Sales</h2>
            {sales && (
              <span className="text-xs text-ink-muted">
                {sales.total} {singleDay ? "on this day" : "in this period"}
              </span>
            )}
          </div>
          {!sales ? (
            <div className="grid place-items-center py-12">
              <Spinner aria-label="Loading sales" />
            </div>
          ) : sales.orders.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-ink-muted">
              No POS sales {singleDay ? "on this day" : "in this period"}.{" "}
              {includesToday && (
                <Link to={tillLink} className="font-medium text-brand hover:underline">
                  Open the till
                </Link>
              )}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs text-ink-muted">
                    <th className="px-5 py-2.5 font-medium">Sale</th>
                    <th className="px-3 py-2.5 font-medium">Time</th>
                    <th className="px-3 py-2.5 font-medium">Customer</th>
                    <th className="px-3 py-2.5 font-medium">Items</th>
                    <th className="px-3 py-2.5 font-medium">Payment</th>
                    <th className="px-3 py-2.5 font-medium">Status</th>
                    <th className="px-3 py-2.5 text-right font-medium">Total</th>
                    <th className="px-5 py-2.5 text-right font-medium">
                      <span className="sr-only">Receipt and invoice</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {sales.orders.map((order) => {
                    const items = order.items.reduce((sum, item) => sum + item.quantity, 0);
                    return (
                      <tr
                        key={order.id}
                        tabIndex={0}
                        onClick={() => setOpenOrderId(order.id)}
                        onKeyDown={(event) => event.key === "Enter" && setOpenOrderId(order.id)}
                        className="cursor-pointer hover:bg-canvas focus-visible:outline-2 focus-visible:outline-brand"
                      >
                        <td className="px-5 py-3 font-medium text-ink">#{order.number}</td>
                        <td className="px-3 py-3 text-ink-body">{saleTime(order.createdAt, !singleDay)}</td>
                        <td className="max-w-48 px-3 py-3">
                          <p className="truncate text-ink">{order.customer.fullName}</p>
                          {(order.customer.phone || order.customer.email) && (
                            <p className="truncate text-xs text-ink-muted">{order.customer.phone ?? order.customer.email}</p>
                          )}
                        </td>
                        <td className="px-3 py-3 text-ink-body">{items}</td>
                        <td className="px-3 py-3 text-ink-body">
                          {order.pos?.paymentMethod ? POS_METHOD_LABEL[order.pos.paymentMethod] : "—"}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-1">
                            <StatusBadge status={order.status} />
                            <RefundBadge status={order.refundStatus} />
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="font-medium text-ink">{formatInr(order.totalPaise)}</div>
                          {order.discountPaise != null && order.discountPaise > 0 && (
                            <div className="text-xs text-emerald-700">−{formatInr(order.discountPaise)}</div>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <SaleActions websiteId={selectedId} order={order} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {sales && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-line px-5 py-3 text-sm">
              <span className="text-ink-muted">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" isDisabled={page <= 1} onPress={() => setPage(page - 1)}>
                  Previous
                </Button>
                <Button size="sm" variant="outline" isDisabled={page >= totalPages} onPress={() => setPage(page + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
