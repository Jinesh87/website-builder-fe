import { useState } from "react";
import { Button } from "@heroui/react";
import { Download } from "lucide-react";
import { errorMessage } from "../../api/http.ts";
import { shopStockSheetApi } from "../../api/shop-stock-sheet.ts";
import { datedFilename, downloadBlob } from "../../utils/download.ts";

/** Downloads every variant and its stock as an Excel file to edit and upload again. */
export default function StockListDownloadButton({
  websiteId,
  onError,
  size,
}: {
  websiteId: string;
  onError: (message: string | null) => void;
  size?: "sm" | "md";
}) {
  const [busy, setBusy] = useState(false);

  async function download() {
    setBusy(true);
    onError(null);
    try {
      downloadBlob(await shopStockSheetApi.download(websiteId), datedFilename("stock-list", "xlsx"));
    } catch (err) {
      onError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button size={size} variant="outline" onPress={() => void download()} isPending={busy}>
      <Download className="size-4" aria-hidden /> Download stock list
    </Button>
  );
}
