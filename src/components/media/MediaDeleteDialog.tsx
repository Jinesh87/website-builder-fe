import { useEffect, useState } from "react";
import { Button, Modal, Spinner } from "@heroui/react";
import { ApiError, errorMessage } from "../../api/http.ts";
import { describeUsage, isFontFile, mediaApi, type MediaFile, type MediaUsage } from "../../api/media.ts";
import FormAlert from "../ui/FormAlert.tsx";

type MediaDeleteDialogProps = {
  file: MediaFile;
  onDeleted: () => void;
  onClose: () => void;
};

type State =
  | { status: "checking" }
  | { status: "unused" }
  | { status: "in-use"; usages: MediaUsage[] }
  | { status: "error"; message: string };

function usagesFrom(error: unknown): MediaUsage[] | null {
  if (!(error instanceof ApiError) || error.code !== "MEDIA_IN_USE") return null;
  const details = error.details as { usages?: MediaUsage[] } | undefined;
  return details?.usages ?? [];
}

/** Checks where a file is used before deleting it; in-use files can't be deleted. Mount only while open. */
export default function MediaDeleteDialog({ file, onDeleted, onClose }: MediaDeleteDialogProps) {
  const [state, setState] = useState<State>({ status: "checking" });
  const font = isFontFile(file);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    mediaApi
      .usage(file.id)
      .then((usages) => !cancelled && setState(usages.length > 0 ? { status: "in-use", usages } : { status: "unused" }))
      .catch((err: unknown) => !cancelled && setState({ status: "error", message: errorMessage(err) }));
    return () => {
      cancelled = true;
    };
  }, [file.id]);

  async function confirm() {
    setDeleting(true);
    try {
      await mediaApi.remove(file.id);
      onDeleted();
    } catch (err) {
      const usages = usagesFrom(err);
      setState(usages ? { status: "in-use", usages } : { status: "error", message: errorMessage(err) });
      setDeleting(false);
    }
  }

  return (
    <Modal.Backdrop isOpen onOpenChange={(open) => !open && !deleting && onClose()}>
      <Modal.Container size="sm">
        <Modal.Dialog aria-label={`Delete ${file.fileName}`}>
          <Modal.Header>
            <Modal.Heading>
              {state.status === "in-use" ? (font ? "This font is in use" : "This file is in use") : `Delete “${file.fileName}”?`}
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <div className="text-sm text-ink-body">
              {state.status === "checking" && (
                <p className="flex items-center gap-2">
                  <Spinner size="sm" aria-label="Checking" /> Checking where this file is used…
                </p>
              )}
              {state.status === "unused" && (
                <p>
                  {font
                    ? "No site uses this font any more. The font file is removed from storage."
                    : "It isn't used on any page, template or saved section. The file is removed from storage."}
                </p>
              )}
              {state.status === "in-use" && (
                <>
                  {font ? (
                    <FormAlert status="warning">
                      “{file.fileName}” can't be deleted while it's in use: the places below load it through their imported
                      CSS, and their text would switch to a fallback font. Remove the blocks that use it, or re-import the site
                      without this font, first.
                    </FormAlert>
                  ) : (
                    <p>Remove or replace it in these places first, then delete it:</p>
                  )}
                  {font && <p className="mt-3">Used by:</p>}
                  <ul aria-label="Used in" className="mt-2 list-disc space-y-1 pl-5">
                    {state.usages.map((usage, index) => (
                      <li key={index}>{describeUsage(usage)}</li>
                    ))}
                  </ul>
                  {state.usages.some((usage) => usage.kind === "LIVE_SITE") && (
                    <p className="mt-2 text-xs text-ink-muted">
                      {font
                        ? "The published site keeps using the font until you publish again without it."
                        : "For the live site, replace the image in the editor and publish again."}
                    </p>
                  )}
                </>
              )}
              {state.status === "error" && <FormAlert status="danger">{state.message}</FormAlert>}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline" onPress={onClose} isDisabled={deleting}>
              {state.status === "in-use" ? "Close" : "Cancel"}
            </Button>
            {state.status === "unused" && (
              <Button variant="danger" onPress={() => void confirm()} isPending={deleting}>
                Delete file
              </Button>
            )}
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
