import { useState, type ReactNode } from "react";
import { Button } from "@heroui/react";
import { Atom, Code2, Download, FileCode2 } from "lucide-react";
import { errorMessage } from "../../api/http.ts";
import type { ExportFormat } from "../../features/site-export/export-site.ts";
import CommonModal from "../ui/CommonModal.tsx";
import FormAlert from "../ui/FormAlert.tsx";

type DownloadCodeDialogProps = {
  websiteId: string;
  isOpen: boolean;
  onClose: () => void;
  /** Runs before exporting, e.g. to save pending editor changes. */
  beforeExport?: () => Promise<unknown>;
};

const FORMATS: { value: ExportFormat; icon: ReactNode; title: string; text: string }[] = [
  {
    value: "html",
    icon: <FileCode2 className="size-4.5" aria-hidden />,
    title: "HTML, CSS & JavaScript",
    text: "Ready-to-host static files. Open index.html or upload the folder to any web host.",
  },
  {
    value: "react",
    icon: <Atom className="size-4.5" aria-hidden />,
    title: "React project",
    text: "A Vite + React + TypeScript project with your content as JSON. Run npm install, then npm run dev.",
  },
];

/** Lets the user download the website's code as a static site or a React project. */
export default function DownloadCodeDialog({ websiteId, isOpen, onClose, beforeExport }: DownloadCodeDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("html");
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const busy = progress !== null;

  async function download() {
    setError(null);
    setProgress("Preparing");
    try {
      await beforeExport?.();
      const { exportWebsite } = await import("../../features/site-export/export-site.ts");
      await exportWebsite(websiteId, format, setProgress);
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setProgress(null);
    }
  }

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={() => !busy && onClose()}
      isDismissable={!busy}
      headerDetails={{
        icon: <Code2 className="size-4.5" />,
        title: "Download code",
        description: "Exports the latest saved version of every visible page.",
      }}
      iconTone="brand"
      size="md"
      modalFooter={
        <div className="flex w-full items-center justify-end gap-2">
          <Button variant="ghost" onPress={onClose} isDisabled={busy}>
            Cancel
          </Button>
          <Button onPress={() => void download()} isPending={busy}>
            <Download className="size-4" aria-hidden /> Download zip
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        {error && <FormAlert status="danger">{error}</FormAlert>}
        <div className="flex flex-col gap-2" role="radiogroup" aria-label="Code format">
          {FORMATS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={format === option.value}
              onClick={() => setFormat(option.value)}
              disabled={busy}
              className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                format === option.value
                  ? "border-brand bg-brand-soft/40 ring-2 ring-brand/20"
                  : "border-line bg-surface hover:border-ink-muted/40"
              }`}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">{option.icon}</span>
              <span>
                <span className="block text-sm font-semibold text-ink">{option.title}</span>
                <span className="mt-0.5 block text-xs text-ink-muted">{option.text}</span>
              </span>
            </button>
          ))}
        </div>
        <p className="min-h-5 text-xs text-ink-muted" aria-live="polite">
          {progress ? `${progress}…` : "Uploaded images are included in the zip."}
        </p>
      </div>
    </CommonModal>
  );
}
