import { useEffect, useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { Download, History, Receipt } from "lucide-react";
import { adminHostingApi, type HostingSubscription, type PaymentList } from "../../api/hosting.ts";
import { errorMessage } from "../../api/http.ts";
import { formatPaise } from "../../api/wallet.ts";
import { datedFilename, downloadBlob } from "../../utils/download.ts";
import CommonModal from "../ui/CommonModal.tsx";
import FormAlert from "../ui/FormAlert.tsx";
import {
  CYCLE_LABELS,
  formatBillingDate,
  formatPeriod,
  HostingStatusChip,
  METHOD_LABELS,
  PAYER_LABELS,
} from "./hosting-labels.tsx";

const PAGE_SIZE = 10;

type WebsitePaymentsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  website: { id: string; name: string; subdomain: string };
  subscription: HostingSubscription | null;
};

const TIME_FORMAT = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });

/** Every hosting payment of one website: who paid, how, for which period. */
export default function WebsitePaymentsModal({ isOpen, onClose, website, subscription }: WebsitePaymentsModalProps) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaymentList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (isOpen) setPage(1);
  }, [isOpen, website.id]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    adminHostingApi
      .payments({ websiteId: website.id, page, pageSize: PAGE_SIZE })
      .then((loaded) => !cancelled && setData(loaded))
      .catch((err: unknown) => !cancelled && setError(errorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [isOpen, website.id, page]);

  async function exportCsv() {
    setExporting(true);
    try {
      downloadBlob(await adminHostingApi.paymentsCsv({ websiteId: website.id }), datedFilename(`hosting-${website.subdomain}`, "csv"));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setExporting(false);
    }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      headerDetails={{
        icon: <History className="size-4.5" />,
        title: "Payment history",
        description: `${website.name} · ${website.subdomain}`,
      }}
      iconTone="brand"
      size="full"
      disableFooter
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-canvas/40 px-4 py-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span className="flex items-center gap-2">
              <span className="text-ink-muted">Plan</span>
              <HostingStatusChip subscription={subscription} />
              {subscription && <span className="font-medium text-ink">{CYCLE_LABELS[subscription.cycle]}</span>}
            </span>
            {subscription?.currentPeriodStart && subscription.currentPeriodEnd && (
              <span>
                <span className="text-ink-muted">Current period </span>
                <span className="font-medium text-ink">{formatPeriod(subscription.currentPeriodStart, subscription.currentPeriodEnd)}</span>
              </span>
            )}
            {data && (
              <span>
                <span className="text-ink-muted">Total </span>
                <span className="font-medium text-ink">
                  {data.summary.connects.toLocaleString("en-IN")} connects
                  {data.summary.collectedPaise > 0 && ` · ${formatPaise(data.summary.collectedPaise)} collected`}
                </span>
              </span>
            )}
          </div>
          <Button size="sm" variant="outline" onPress={exportCsv} isPending={exporting} isDisabled={!data?.total}>
            <Download className="size-4" aria-hidden /> Export CSV
          </Button>
        </div>

        {error && <FormAlert status="danger">{error}</FormAlert>}

        <div className="overflow-hidden rounded-lg border border-line">
          {!data ? (
            <div className="grid place-items-center py-14">{loading && <Spinner aria-label="Loading payments" />}</div>
          ) : data.items.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Receipt className="mx-auto size-6 text-ink-muted" aria-hidden />
              <p className="mt-2 text-sm text-ink-body">No hosting payments for this website yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-canvas/60 text-xs text-ink-muted">
                  <tr>
                    <th scope="col" className="px-4 py-2.5 font-medium">Paid on</th>
                    <th scope="col" className="px-4 py-2.5 font-medium">Period covered</th>
                    <th scope="col" className="px-4 py-2.5 text-right font-medium">Connects</th>
                    <th scope="col" className="px-4 py-2.5 font-medium">Paid by</th>
                    <th scope="col" className="px-4 py-2.5 text-right font-medium">Collected</th>
                    <th scope="col" className="px-4 py-2.5 font-medium">Reference / note</th>
                    <th scope="col" className="px-4 py-2.5 font-medium">Recorded by</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.items.map((payment) => (
                    <tr key={payment.id} className="align-top">
                      <td className="whitespace-nowrap px-4 py-2.5">
                        <p className="text-ink">{formatBillingDate(payment.createdAt)}</p>
                        <p className="text-xs text-ink-muted">{TIME_FORMAT.format(new Date(payment.createdAt))}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        <p className="text-ink">{formatPeriod(payment.periodStart, payment.periodEnd)}</p>
                        <p className="text-xs text-ink-muted">{CYCLE_LABELS[payment.cycle]}</p>
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-ink">{payment.amount.toLocaleString("en-IN")}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-ink-body">
                        {PAYER_LABELS[payment.paidBy]}
                        <span className="block text-xs text-ink-muted">{METHOD_LABELS[payment.method]}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right text-ink-body">
                        {payment.collectedPaise === null ? "—" : formatPaise(payment.collectedPaise)}
                      </td>
                      <td className="max-w-56 px-4 py-2.5 text-ink-body">
                        {payment.reference || payment.note ? (
                          <>
                            {payment.reference && <p>Ref {payment.reference}</p>}
                            {payment.note && <p className="text-xs text-ink-muted">{payment.note}</p>}
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-ink-body">
                        {payment.recordedBy?.fullName ?? (payment.paidBy === "SYSTEM" ? "System" : "—")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {data && data.total > data.pageSize && (
          <div className="flex items-center justify-between text-sm text-ink-body">
            <span>
              Page {data.page} of {totalPages} · {data.total} payments
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" isDisabled={page <= 1 || loading} onPress={() => setPage(page - 1)}>
                Previous
              </Button>
              <Button size="sm" variant="outline" isDisabled={page >= totalPages || loading} onPress={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </CommonModal>
  );
}
