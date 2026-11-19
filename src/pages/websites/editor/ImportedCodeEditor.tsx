import { useContext, useState, type KeyboardEvent } from "react";
import { Code2 } from "lucide-react";
import { websitesApi } from "../../../api/websites.ts";
import CommonModal from "../../../components/ui/CommonModal.tsx";
import FormAlert from "../../../components/ui/FormAlert.tsx";
import type { ImportedHtmlData } from "../../../site-kit/index.ts";
import { MediaTargetContext } from "./fields.tsx";
import { toEditorCss } from "./imported-code.ts";

type Tab = "html" | "css";

/** Two spaces on Tab instead of leaving the text box; Shift+Tab still moves focus. */
function insertTab(event: KeyboardEvent<HTMLTextAreaElement>, set: (value: string) => void) {
  if (event.key !== "Tab" || event.shiftKey) return;
  event.preventDefault();
  const el = event.currentTarget;
  const { selectionStart: start, selectionEnd: end, value } = el;
  const next = `${value.slice(0, start)}  ${value.slice(end)}`;
  set(next);
  requestAnimationFrame(() => el.setSelectionRange(start + 2, start + 2));
}

function CodeDialog({
  data,
  websiteId,
  onApply,
  onClose,
}: {
  data: ImportedHtmlData;
  websiteId: string;
  onApply: (data: ImportedHtmlData) => void;
  onClose: () => void;
}) {
  const initialCss = toEditorCss(data.css, data.scope);
  const [tab, setTab] = useState<Tab>("html");
  const [html, setHtml] = useState(data.html || "");
  const [css, setCss] = useState(initialCss);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const changed = html !== (data.html || "") || css !== initialCss;

  async function apply() {
    if (!changed) return onClose();
    setPending(true);
    setError(null);
    try {
      const block = await websitesApi.rebuildImportedHtml(websiteId, { html, css, scope: data.scope, texts: data.texts });
      onApply({ ...data, ...block });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't apply the code. Please try again.");
      setPending(false);
    }
  }

  const value = tab === "html" ? html : css;
  const setValue = tab === "html" ? setHtml : setCss;

  return (
    <CommonModal
      isOpen
      onClose={() => !pending && onClose()}
      isDismissable={!pending}
      size="full"
      headerDetails={{
        icon: <Code2 className="size-4.5" />,
        title: "Edit code",
        description: data.title || "Imported block",
      }}
      iconTone="brand"
      primaryAction={{ label: "Apply changes", onPress: apply, isPending: pending, isDisabled: pending }}
      secondaryAction={{ label: "Cancel", onPress: onClose, isDisabled: pending }}
    >
      <div className="flex flex-col gap-3">
        <div role="tablist" className="flex gap-1 rounded-lg bg-canvas p-1 w-fit">
          {(["html", "css"] as const).map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === id ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink"
              }`}
            >
              {id.toUpperCase()}
            </button>
          ))}
        </div>
        {error && <FormAlert status="danger">{error}</FormAlert>}
        <textarea
          aria-label={tab === "html" ? "HTML" : "CSS"}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => insertTab(event, setValue)}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          wrap="off"
          className="h-[55vh] w-full resize-y rounded-lg border border-line bg-canvas/40 p-3 font-mono text-[13px] leading-relaxed text-ink outline-none focus:border-brand"
        />
        <p className="text-xs leading-relaxed text-ink-muted">
          {tab === "html"
            ? "Scripts and unsafe links are removed when you apply. Keep the data-wb-text-id and data-wb-media-key attributes so the text and images stay editable in the side panel; new text and images get their own automatically."
            : "Styles only apply inside this block. Write selectors as usual (.card h2); use & for the block itself (&.dark, & > ul). Width @media queries follow the editor's device preview."}
        </p>
      </div>
    </CommonModal>
  );
}

/** "Edit code" button for an imported block or the imported header/footer. */
export function ImportedCodeButton({ data, onChange }: { data: ImportedHtmlData; onChange: (data: ImportedHtmlData) => void }) {
  const media = useContext(MediaTargetContext);
  const [open, setOpen] = useState(false);
  if (!media?.websiteId) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-ed border border-ed-border bg-ed-panel px-3 py-1.5 text-ed-sm font-medium text-ed-text shadow-ed-xs transition-colors hover:border-ed-border-strong hover:bg-ed-hover"
      >
        <Code2 className="size-3.5" aria-hidden /> Edit HTML &amp; CSS
      </button>
      {open && <CodeDialog data={data} websiteId={media.websiteId} onApply={onChange} onClose={() => setOpen(false)} />}
    </>
  );
}
