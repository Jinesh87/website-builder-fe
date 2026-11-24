import { Button } from "@heroui/react";
import { Download, Printer } from "lucide-react";
import type { ShopOrder } from "../../../api/shop.ts";
import { POS_METHOD_LABEL } from "../../../api/shop-pos.ts";
import FormAlert from "../../ui/FormAlert.tsx";
import { formatInr } from "../shop-format.ts";
import { usePosReceiptActions } from "./PosSaleCompleteDialog.tsx";

/** Order detail block for a till sale: how it was paid, plus receipt reprint and the A4 invoice. */
export default function PosOrderInfo({ websiteId, order }: { websiteId: string; order: ShopOrder }) {
  const { print, printing, downloadInvoice, downloading, feedback } = usePosReceiptActions(websiteId, order);
  const pos = order.pos;
  if (!pos) return null;

  return (
    <div className="sm:col-span-2 rounded-lg border border-line bg-canvas px-4 py-3">
      <dt className="text-xs font-medium text-ink-muted">Sold at the till</dt>
      <dd className="mt-0.5 text-sm text-ink">
        {pos.paymentMethod ? `Paid by ${POS_METHOD_LABEL[pos.paymentMethod]}` : "Payment not recorded"}
        {pos.cashReceivedPaise != null &&
          ` · received ${formatInr(pos.cashReceivedPaise)}, change ${formatInr(pos.changePaise ?? 0)}`}
        {pos.paymentReference && ` · ref ${pos.paymentReference}`}
      </dd>
      {order.paidAt && (
        <dd className="mt-2 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onPress={() => void print()} isPending={printing}>
            <Printer className="size-4" aria-hidden /> Print receipt
          </Button>
          <Button size="sm" variant="outline" onPress={() => void downloadInvoice()} isPending={downloading}>
            <Download className="size-4" aria-hidden /> A4 invoice
          </Button>
        </dd>
      )}
      {feedback && (
        <dd className="mt-2">
          <FormAlert status={feedback.status}>{feedback.message}</FormAlert>
        </dd>
      )}
    </div>
  );
}
