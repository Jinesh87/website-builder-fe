import { useState, type FormEvent } from "react";
import { Button, Modal } from "@heroui/react";
import { Copy, FileText, Trash2 } from "lucide-react";
import { errorMessage } from "../../api/http.ts";
import { formatBytes, isFontFile, mediaApi, type MediaFile, type MediaFolder } from "../../api/media.ts";
import FontPreview from "./FontPreview.tsx";
import FormAlert from "../ui/FormAlert.tsx";
import SelectInput, { type SelectOption } from "../ui/SelectInput.tsx";
import TextInput from "../ui/TextInput.tsx";

type MediaDetailsDialogProps = {
  file: MediaFile;
  folders: MediaFolder[];
  onSaved: (file: MediaFile) => void;
  onDelete: (file: MediaFile) => void;
  onClose: () => void;
};

/** Preview, rename, alt text and folder for one file. Mount only while open. */
export default function MediaDetailsDialog({ file, folders, onSaved, onDelete, onClose }: MediaDetailsDialogProps) {
  const [fileName, setFileName] = useState(file.fileName);
  const [altText, setAltText] = useState(file.altText ?? "");
  const [folderId, setFolderId] = useState(file.folderId ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const folderOptions: SelectOption<string>[] = [
    { value: "", label: "No folder" },
    ...folders.map((folder) => ({ value: folder.id, label: folder.name })),
  ];
  const nameError = fileName.trim() ? undefined : "Enter a file name";
  const changed = fileName.trim() !== file.fileName || altText.trim() !== (file.altText ?? "") || folderId !== (file.folderId ?? "");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (nameError || saving || !changed) return;
    setSaving(true);
    setError(null);
    try {
      onSaved(await mediaApi.update(file.id, { fileName: fileName.trim(), altText: altText.trim() || null, folderId: folderId || null }));
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(file.url);
      setCopied(true);
    } catch {
      setError("Couldn't copy. Your browser blocked clipboard access.");
    }
  }

  const facts = [
    file.mimeType,
    formatBytes(file.sizeBytes),
    file.width && file.height ? `${file.width} × ${file.height}px` : null,
    `Uploaded ${new Date(file.createdAt).toLocaleDateString()}`,
  ].filter(Boolean);

  return (
    <Modal.Backdrop isOpen onOpenChange={(open) => !open && !saving && onClose()}>
      <Modal.Container size="lg" scroll="inside">
        <Modal.Dialog aria-label={`Details for ${file.fileName}`}>
          <form onSubmit={save} noValidate>
            <Modal.Header>
              <Modal.Heading className="truncate">{file.fileName}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="grid gap-5 sm:grid-cols-[1fr_16rem]">
                <div className="grid min-h-48 place-items-center overflow-hidden rounded-lg border border-line bg-canvas">
                  {file.kind === "IMAGE" && <img src={file.url} alt={file.altText ?? ""} className="max-h-80 w-full object-contain" />}
                  {file.kind === "VIDEO" && <video src={file.url} controls preload="metadata" className="max-h-80 w-full" />}
                  {isFontFile(file) && (
                    <div className="flex flex-col items-center gap-3 p-6 text-center text-ink">
                      <FontPreview url={file.url} id={file.id} className="text-6xl" />
                      <FontPreview url={file.url} id={file.id} text="The quick brown fox jumps over the lazy dog" className="text-lg" />
                      <FontPreview url={file.url} id={file.id} text="0123456789 · ABCDEFGHIJKLM" className="text-sm text-ink-muted" />
                    </div>
                  )}
                  {file.kind === "DOCUMENT" && !isFontFile(file) && (
                    <a href={file.url} className="flex flex-col items-center gap-2 p-6 text-sm text-brand hover:underline">
                      <FileText className="size-10" aria-hidden />
                      Download to view
                    </a>
                  )}
                </div>
                <div className="flex flex-col gap-4">
                  {error && <FormAlert status="danger">{error}</FormAlert>}
                  <TextInput label="File name" name="fileName" value={fileName} onChange={setFileName} error={nameError} />
                  {file.kind === "IMAGE" && (
                    <TextInput
                      label="Alt text"
                      name="altText"
                      value={altText}
                      onChange={setAltText}
                      description="Describes the image for screen readers and search engines. Used when you add it to a page."
                    />
                  )}
                  <SelectInput label="Folder" value={folderId} onChange={setFolderId} options={folderOptions} />
                  <ul className="flex flex-col gap-0.5 text-xs text-ink-muted">
                    {facts.map((fact) => (
                      <li key={fact}>{fact}</li>
                    ))}
                  </ul>
                  <Button variant="outline" size="sm" onPress={() => void copyLink()}>
                    <Copy className="size-3.5" aria-hidden /> {copied ? "Link copied" : "Copy link"}
                  </Button>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer className="justify-between">
              <Button variant="danger-soft" onPress={() => onDelete(file)} isDisabled={saving}>
                <Trash2 className="size-4" aria-hidden /> Delete
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onPress={onClose} isDisabled={saving}>
                  Close
                </Button>
                <Button type="submit" isPending={saving} isDisabled={Boolean(nameError) || !changed}>
                  Save changes
                </Button>
              </div>
            </Modal.Footer>
          </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
