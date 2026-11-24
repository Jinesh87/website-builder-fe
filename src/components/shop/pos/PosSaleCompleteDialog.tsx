import { useEffect, useRef, useState } from "react";
import { Button } from "@heroui/react";
import { CircleCheck, Download, Mail, Printer } from "lucide-react";
import { errorMessage } from "../../../api/http.ts";
import type { ShopOrder } from "../../../api/shop.ts";
import { POS_METHOD_LABEL, shopPosApi } from "../../../api/shop-pos.ts";
import { validateEmail } from "../../../auth/validation.ts";
import { downloadBlob } from "../../../utils/download.ts";
import CommonModal from "../../ui/AppModal.tsx";
import FormAlert from "../../ui/FormAlert.tsx";
import TextInput from "../../ui/TextInput.tsx";
import { formatInr } from "../shop-format.ts";
import { printReceipt } from "./pos-receipt-print.ts";

type Feedback = { status: "success" | "danger"; message: string } | null;

type Props = {
  websiteId: string;
  order: ShopOrder;
  /** Prints the receipt as soon as the dialog opens. */
  autoPrint?: boolean;
  onNewSale: () => void;
};

/** Receipt actions for a sale: thermal print, A4 GST invoice, and email. Also used to reprint past sales. */
export function usePosReceiptActions(websiteId: string, order: ShopOrder) {
  const [printing, setPrinting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function print() {
    setPrinting(true);
    setFeedback(null);
    try {
      printReceipt(await shopPosApi.receipt(websiteId, order.id));
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setPrinting(false);
    }
  }

  async function downloadInvoice() {
    setDownloading(true);
    setFeedback(null);
    try {
      downloadBlob(await shopPosApi.invoicePdf(websiteId, order.id), `invoice-${order.number}.pdf`);
    } catch (err) {
      setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setDownloading(false);
    }
  }

  return { print, printing, downloadInvoice, downloading, feedback, setFeedback };
}

export default function PosSaleCompleteDialog({ websiteId, order, autoPrint = false, onNewSale }: Props) {
  const actions = usePosReceiptActions(websiteId, order);
  const [email, setEmail] = useState(order.customer.email ?? "");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [sending, setSending] = useState(false);
  const autoPrinted = useRef(false);

  useEffect(() => {
    if (!autoPrint || autoPrinted.current) return;
    autoPrinted.current = true;
    void actions.print();
    // Runs once when the dialog opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPrint]);

  async function sendEmail() {
    const error = validateEmail(email);
    setEmailError(error);
    if (error) return;
    setSending(true);
    actions.setFeedback(null);
    try {
      const { to } = await shopPosApi.emailInvoice(websiteId, order.id, email.trim());
      actions.setFeedback({ status: "success", message: `Invoice emailed to ${to}.` });
    } catch (err) {
      actions.setFeedback({ status: "danger", message: errorMessage(err) });
    } finally {
      setSending(false);
    }
  }

  const method = order.pos?.paymentMethod;

  return (
    <CommonModal
      isOpen
      isDismissable={false}
      title={`Sale #${order.number} complete`}
      subtitle={`${formatInr(order.totalPaise)}${method ? ` paid by ${POS_METHOD_LABEL[method]}` : ""}`}
      icon={<CircleCheck className="size-5" />}
      iconTone="success"
      size="md"
      primaryAction={{ label: "New sale", onPress: onNewSale }}
    >
      {order.pos?.changePaise != null && order.pos.changePaise > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-3 text-emerald-900">
          <span className="text-sm">Give change</span>
          <span className="text-2xl font-semibold">{formatInr(order.pos.changePaise)}</span>
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        <Button variant="outline" onPress={() => void actions.print()} isPending={actions.printing}>
          <Printer className="size-4" aria-hidden /> Print receipt
        </Button>
        <Button variant="outline" onPress={() => void actions.downloadInvoice()} isPending={actions.downloading}>
          <Download className="size-4" aria-hidden /> A4 GST invoice
        </Button>
      </div>

      <form
        className="mt-5 flex items-start gap-2"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void sendEmail();
        }}
      >
        <div className="flex-1">
          <TextInput
            label="Email the invoice"
            name="invoiceEmail"
            type="email"
            placeholder="customer@email.com"
            value={email}
            onChange={setEmail}
            error={emailError}
          />
        </div>
        <Button type="submit" variant="outline" className="mt-6" isPending={sending}>
          <Mail className="size-4" aria-hidden /> Send
        </Button>
      </form>

      {actions.feedback && (
        <div className="mt-4">
          <FormAlert status={actions.feedback.status}>{actions.feedback.message}</FormAlert>
        </div>
      )}
    </CommonModal>
  );
}
