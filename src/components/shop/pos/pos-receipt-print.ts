import { POS_METHOD_LABEL, type PosReceipt } from "../../../api/shop-pos.ts";
import { formatInr } from "../shop-format.ts";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

function row(left: string, right: string, className = ""): string {
  return `<div class="row ${className}"><span>${left}</span><span>${right}</span></div>`;
}

/** An 80mm thermal receipt as a standalone HTML page. */
export function receiptHtml(receipt: PosReceipt): string {
  const when = new Date(receipt.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  const shopLines = [receipt.shop.address, receipt.shop.phone && `Ph: ${receipt.shop.phone}`, receipt.shop.gstin && `GSTIN: ${receipt.shop.gstin}`]
    .filter((line): line is string => Boolean(line))
    .map((line) => `<div>${escapeHtml(line)}</div>`)
    .join("");

  const items = receipt.items
    .map(
      (item) => `<div class="item">
        <div>${escapeHtml(item.productName)}${item.variantName && item.variantName !== "Standard" ? ` (${escapeHtml(item.variantName)})` : ""}</div>
        ${row(`${item.quantity} × ${formatInr(item.unitPaise)}`, formatInr(item.lineTotalPaise))}
      </div>`,
    )
    .join("");

  const gst = receipt.gstByRate
    .map((rate) => row(`GST ${rate.gstPercent}% on ${formatInr(rate.taxablePaise)}`, formatInr(rate.gstPaise), "small"))
    .join("");

  const payment = receipt.payment;
  const paidBy = payment.method ? POS_METHOD_LABEL[payment.method] : "—";
  const paymentRows = [
    row(`Paid by ${paidBy}`, payment.cashReceivedPaise != null ? formatInr(payment.cashReceivedPaise) : formatInr(receipt.totalPaise)),
    payment.changePaise != null ? row("Change", formatInr(payment.changePaise)) : "",
    payment.reference ? row("Ref", escapeHtml(payment.reference), "small") : "",
    payment.razorpayPaymentId ? row("Razorpay", escapeHtml(payment.razorpayPaymentId), "small") : "",
  ].join("");

  const customer = receipt.customer.walkIn && receipt.customer.name === "Walk-in customer" && !receipt.customer.phone
    ? ""
    : `<div class="small">Customer: ${escapeHtml(receipt.customer.name)}${receipt.customer.phone ? `, ${escapeHtml(receipt.customer.phone)}` : ""}</div>`;
  const voided = receipt.status === "cancelled" || receipt.status === "returned"
    ? `<div class="center bold">*** ${receipt.status.toUpperCase()} ***</div>`
    : "";

  return `<!doctype html><html><head><meta charset="utf-8"><title>Receipt #${escapeHtml(receipt.orderNumber)}</title>
<style>
  @page { size: 80mm auto; margin: 3mm; }
  * { box-sizing: border-box; }
  body { margin: 0; width: 74mm; font: 12px/1.35 "Courier New", ui-monospace, monospace; color: #000; }
  .center { text-align: center; }
  .bold { font-weight: bold; }
  .shop { font-size: 15px; font-weight: bold; }
  .small { font-size: 11px; }
  .row { display: flex; justify-content: space-between; gap: 6px; }
  .row span:last-child { text-align: right; white-space: nowrap; }
  .total { font-size: 15px; font-weight: bold; }
  hr { border: 0; border-top: 1px dashed #000; margin: 6px 0; }
  .item { margin-bottom: 3px; }
</style></head><body>
  <div class="center"><div class="shop">${escapeHtml(receipt.shop.name)}</div>${shopLines}</div>
  <hr>
  ${row(`Bill #${escapeHtml(receipt.orderNumber)}`, escapeHtml(when), "small")}
  ${receipt.cashierName ? `<div class="small">Cashier: ${escapeHtml(receipt.cashierName)}</div>` : ""}
  ${customer}
  ${voided}
  <hr>
  ${items}
  <hr>
  ${row("Subtotal", formatInr(receipt.subtotalPaise))}
  ${receipt.discountPaise > 0 ? row("Discount", `−${formatInr(receipt.discountPaise)}`) : ""}
  ${row("TOTAL", formatInr(receipt.totalPaise), "total")}
  ${gst ? `<div class="small" style="margin-top:4px">Prices include GST</div>${gst}` : ""}
  <hr>
  ${paymentRows}
  <hr>
  <div class="center">Thank you! Visit again</div>
</body></html>`;
}

/** Prints the receipt through a hidden frame, so the till page itself isn't printed. */
export function printReceipt(receipt: PosReceipt): void {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  if (!doc || !frame.contentWindow) {
    frame.remove();
    return;
  }
  doc.open();
  doc.write(receiptHtml(receipt));
  doc.close();
  const cleanup = () => setTimeout(() => frame.remove(), 1000);
  frame.contentWindow.addEventListener("afterprint", cleanup, { once: true });
  // Give the frame a moment to lay out before opening the print dialog.
  setTimeout(() => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    setTimeout(cleanup, 60_000);
  }, 50);
}
