import {
  Suspense,
  createContext,
  useContext,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button, Checkbox, Dropdown, Label } from "@heroui/react";
import { Check, ChevronDown, ChevronUp, Download, Eye, FileText, Film, Globe, GripVertical, Images, Plus, Trash2, Upload } from "lucide-react";
import { errorMessage } from "../../../api/http.ts";
import { ACCEPT_BY_KIND, formatBytes, mediaApi, uploadProblem, type MediaFile } from "../../../api/media.ts";
import { lazyWithRetry } from "../../../utils/lazy-with-retry.ts";

const MediaPickerDialog = lazyWithRetry(
  () => import("../../../components/media/MediaPickerDialog.tsx"),
  { reloadKey: "fields_media_picker" },
);
const IconPickerField = lazyWithRetry(
  () => import("./IconPicker.tsx"),
  { reloadKey: "fields_icon_picker" },
);
import { CellColorPicker } from "../../../components/ui/CellColorPicker.tsx";
import { Lightbox } from "../../../components/ui/Lightbox.tsx";
import { optimizeImageToWebP } from "../../../utils/image-optimizer.ts";
import type { ImageRef, LinkRef } from "../../../site-kit/index.ts";

const SAFE_HREF =
  /^(https?:\/\/\S+|mailto:\S+|tel:[+0-9() -]+|\/(?!\/)\S*|#\S*)$/i;
export const SAFE_IMAGE_URL =
  /^(https?:\/\/\S+|\/(?!\/)\S*|data:image\/(?:png|jpe?g|webp|gif|svg\+xml|avif)(?:;[a-z0-9=_-]+)*;?(?:base64)?,[\s\S]*)$/i;


const inputClass =
  "h-8 w-full rounded-ed border border-ed-border bg-ed-panel px-2.5 text-ed-sm text-ed-text placeholder:text-ed-faint shadow-ed-xs transition-all duration-150 hover:border-ed-border-strong focus:border-ed-accent focus:bg-ed-panel focus:outline-none focus:ring-2 focus:ring-ed-accent/15 aria-invalid:border-ed-danger aria-invalid:focus:ring-ed-danger/15 disabled:bg-ed-subtle disabled:text-ed-muted disabled:cursor-not-allowed";

export const LinkTargetsContext = createContext<
  { label: string; href: string }[]
>([]);

/** Where image uploads go. Without it, image fields only accept pasted links. */
export type MediaTarget = { clientId: string; websiteId: string };
export const MediaTargetContext = createContext<MediaTarget | null>(null);

type FieldShellProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
};

function FieldShell({ id, label, hint, error, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-ed-xs font-medium text-ed-text">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-ed-2xs font-medium text-ed-danger">{error}</p>
      ) : (
        hint && (
          <p className="text-ed-2xs text-ed-muted leading-normal">{hint}</p>
        )
      )}
    </div>
  );
}

type TextFieldProps = {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  maxLength?: number;
  /** Shows "Required" when empty. */
  required?: boolean;
  error?: string;
  type?: "text" | "email" | "tel" | "url" | "number";
  list?: string;
};

export function TextField({
  label,
  value = "",
  onChange,
  required,
  error,
  hint,
  ...inputProps
}: TextFieldProps) {
  const id = useId();
  const message = error ?? (required && !value.trim() ? "Required" : undefined);
  return (
    <FieldShell id={id} label={label} hint={hint} error={message}>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={message ? true : undefined}
        className={inputClass}
        {...inputProps}
      />
    </FieldShell>
  );
}

type CommaListFieldProps = Omit<TextFieldProps, "value" | "onChange"> & {
  value: string[] | undefined;
  onChange: (value: string[]) => void;
  /** Applied to each trimmed item before it is emitted (e.g. lowercasing). */
  normalize?: (item: string) => string;
};

function parseCommaList(
  text: string,
  normalize?: (item: string) => string,
): string[] {
  return text
    .split(",")
    .map((item) => {
      const trimmed = item.trim();
      return normalize ? normalize(trimmed) : trimmed;
    })
    .filter(Boolean);
}

/**
 * Text input bound to a string list. Keeps the raw text locally so separators
 * and trailing spaces survive while typing; resyncs only on external changes.
 */
export function CommaListField({
  value = [],
  onChange,
  normalize,
  ...textFieldProps
}: CommaListFieldProps) {
  const joined = value.join(", ");
  const [draft, setDraft] = useState(joined);
  const [prevJoined, setPrevJoined] = useState(joined);

  if (joined !== prevJoined) {
    setPrevJoined(joined);
    if (parseCommaList(draft, normalize).join(", ") !== joined) {
      setDraft(joined);
    }
  }

  return (
    <TextField
      {...textFieldProps}
      value={draft}
      onChange={(text) => {
        setDraft(text);
        onChange(parseCommaList(text, normalize));
      }}
    />
  );
}

type TextAreaFieldProps = {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  rows?: number;
  hint?: string;
  maxLength?: number;
  required?: boolean;
};

export function TextAreaField({
  label,
  value = "",
  onChange,
  rows = 3,
  hint,
  maxLength,
  required,
}: TextAreaFieldProps) {
  const id = useId();
  const message = required && !value.trim() ? "Required" : undefined;
  return (
    <FieldShell id={id} label={label} hint={hint} error={message}>
      <textarea
        id={id}
        value={value}
        rows={rows}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={message ? true : undefined}
        className={`${inputClass} min-h-19 h-auto py-2 leading-relaxed resize-y`}
      />
    </FieldShell>
  );
}

type SelectFieldProps<T extends string | number> = {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  hint?: string;
};

export function SelectField<T extends string | number>({
  label,
  value,
  options,
  onChange,
  hint,
}: SelectFieldProps<T>) {
  const id = useId();
  const selectedOption = options.find((candidate) => candidate.value === value) ?? options[0];

  return (
    <FieldShell id={id} label={label} hint={hint}>
      <Dropdown>
        <Button
          id={id}
          aria-label={label}
          variant="secondary"
          className="flex h-8 w-full items-center justify-between rounded-ed border border-ed-border bg-ed-panel px-2.5 text-left text-ed-sm font-normal text-ed-text shadow-ed-xs transition-all duration-150 hover:border-ed-border-strong hover:bg-ed-subtle/50 focus-visible:border-ed-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ed-accent/15"
        >
          <span className="truncate">{selectedOption?.label ?? String(value)}</span>
          <ChevronDown className="size-3.5 shrink-0 text-ed-muted" />
        </Button>
        <Dropdown.Popover className="min-w-(--trigger-width) rounded-ed-lg border border-ed-border bg-ed-panel p-1 shadow-ed-pop z-(--z-ed-popover)">
          <Dropdown.Menu
            selectionMode="single"
            selectedKeys={new Set([String(value)])}
            onAction={(key) => {
              const option = options.find((candidate) => String(candidate.value) === String(key));
              if (option) onChange(option.value);
            }}
            className="flex flex-col gap-0.5 outline-none"
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <Dropdown.Item
                  key={String(option.value)}
                  id={String(option.value)}
                  textValue={option.label}
                  className={`group flex w-full cursor-pointer items-center gap-2 rounded-ed px-2 py-1.5 text-ed-sm outline-none transition-colors duration-150 select-none ${
                    isSelected
                      ? "bg-ed-accent-soft font-medium text-ed-accent"
                      : "text-ed-text hover:bg-ed-subtle"
                  }`}
                >
                  <div className="flex size-4 shrink-0 items-center justify-center">
                    {isSelected ? (
                      <Check className="size-3.5 text-ed-accent" />
                    ) : null}
                  </div>
                  <Label className="flex-1 cursor-pointer truncate font-inherit">
                    {option.label}
                  </Label>
                </Dropdown.Item>
              );
            })}
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </FieldShell>
  );
}

type CheckboxFieldProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
  disabled?: boolean;
};

export function CheckboxField({
  label,
  checked,
  onChange,
  hint,
  disabled,
}: CheckboxFieldProps) {
  const handleToggle = (val: unknown) => {
    if (typeof val === "boolean") {
      onChange(val);
    } else if (val && typeof val === "object" && "target" in val) {
      const target = (val as { target?: { checked?: boolean } }).target;
      onChange(Boolean(target?.checked));
    } else {
      onChange(!checked);
    }
  };

  return (
    <Checkbox
      isSelected={Boolean(checked)}
      onChange={handleToggle as (isSelected: boolean) => void}
      isDisabled={disabled}
      className="group cursor-pointer select-none"
    >
      <Checkbox.Content className="items-start gap-2">
        <Checkbox.Control className="mt-0.5 size-4 rounded-[4px] border border-ed-border-strong bg-ed-panel flex items-center justify-center p-0 m-0 shrink-0 transition-all duration-150 data-[selected=true]:bg-ed-accent data-[selected=true]:border-ed-accent text-white">
          <Checkbox.Indicator className="size-full flex items-center justify-center p-0 m-0 bg-transparent text-white" />
        </Checkbox.Control>
        <div className="min-w-0 flex-1">
          <Label className="block text-ed-sm font-medium text-ed-text cursor-pointer leading-tight">
            {label}
          </Label>
          {hint && <p className="text-ed-2xs text-ed-muted leading-normal mt-0.5">{hint}</p>}
        </div>
      </Checkbox.Content>
    </Checkbox>
  );
}

export function ColorField({
  label,
  value,
  onChange,
  fallback = "#ffffff",
  hint,
}: {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  fallback?: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <CellColorPicker
        value={value}
        onChange={(val) => onChange(val || "")}
        label={label}
        fallback={fallback}
      >
        <div className="flex items-center justify-between gap-2">
          <CellColorPicker.Label />
          <div className="flex items-center gap-1.5 w-36">
            <CellColorPicker.Trigger />
            <CellColorPicker.ValueDisplay />
          </div>
        </div>
        <CellColorPicker.Popover>
          <CellColorPicker.Swatch />
        </CellColorPicker.Popover>
      </CellColorPicker>
      {hint && <p className="text-ed-2xs text-ed-muted leading-normal">{hint}</p>}
    </div>
  );
}

export function CompactColorField({
  label,
  value,
  onChange,
  fallback = "#ffffff",
  hint,
  placeholder = "Auto",
}: {
  label: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  fallback?: string;
  hint?: string;
  placeholder?: string;
}) {
  const isAuto = !value || value === "default" || value === "auto";

  return (
    <div className="flex flex-col gap-1 w-full min-w-0">
      <div className="flex items-center justify-between gap-1 h-4">
        <span className="text-ed-xs font-medium text-ed-text truncate select-none">
          {label}
        </span>
        {!isAuto && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-[11px] font-medium text-ed-muted hover:text-ed-danger transition-colors cursor-pointer shrink-0"
            title="Reset to default"
          >
            Reset
          </button>
        )}
      </div>

      <CellColorPicker
        value={isAuto ? undefined : value}
        onChange={(val) => onChange(val || undefined)}
        fallback={fallback}
        className="w-full"
      >
        <div className="flex items-center gap-1.5 h-8 w-full min-w-0">
          <CellColorPicker.Trigger className="!size-8 rounded-ed shrink-0 cursor-pointer" />
          <div className="flex-1 min-w-0">
            <CellColorPicker.ValueDisplay
              placeholder={placeholder}
              className="!h-8 rounded-ed text-ed-xs font-mono w-full"
            />
          </div>
        </div>
        <CellColorPicker.Popover>
          <CellColorPicker.Swatch />
        </CellColorPicker.Popover>
      </CellColorPicker>
      {hint && <p className="text-ed-2xs text-ed-muted leading-normal">{hint}</p>}
    </div>
  );
}

type LinkFieldProps = {
  label: string;
  value: LinkRef;
  onChange: (value: LinkRef) => void;
};

export function LinkField({ label, value, onChange }: LinkFieldProps) {
  const targets = useContext(LinkTargetsContext);
  const media = useContext(MediaTargetContext);
  const listId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pickingDoc, setPickingDoc] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isDownload = value.actionType
    ? value.actionType === "download"
    : Boolean(value.href && /\.pdf($|\?)/i.test(value.href));

  const hrefError =
    !isDownload && value.href && !SAFE_HREF.test(value.href.trim())
      ? "Use a page like /contact, https://…, mailto: or tel:"
      : undefined;

  async function handleFileUpload(file: File) {
    if (!media) return;
    setUploadError(null);
    setUploading(true);
    try {
      const uploaded = await mediaApi.upload({
        file,
        clientId: media.clientId,
        websiteId: media.websiteId,
      });
      onChange({
        ...value,
        href: uploaded.url,
        actionType: "download",
        downloadFileName: value.downloadFileName || file.name,
        icon: value.icon || "download",
      });
    } catch (err) {
      setUploadError(errorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  const setActionType = (type: "link" | "download") => {
    if (type === "download") {
      onChange({
        ...value,
        actionType: "download",
        icon: value.icon || "download",
        label: value.label === "Contact us" || value.label === "Link" ? "Download Brochure" : value.label,
        href: value.href === "/contact" || value.href === "/" ? "" : value.href,
      });
    } else {
      onChange({
        ...value,
        actionType: "link",
        icon: value.icon === "download" ? undefined : value.icon,
        label: value.label === "Download Brochure" ? "Contact us" : value.label,
        href: value.href === "" ? "/contact" : value.href,
      });
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-ed-lg border border-ed-border/90 bg-ed-subtle/40 p-3 shadow-2xs">
      {/* Header and Action Type Segmented Control */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-ed-accent" />
          <span className="text-ed-xs font-semibold text-ed-text">{label}</span>
        </div>

        {/* Action Type Switcher */}
        <div className="inline-flex rounded-ed border border-ed-border bg-ed-panel p-0.5 text-[11px] font-medium shadow-2xs">
          <button
            type="button"
            onClick={() => setActionType("link")}
            className={`flex items-center gap-1 px-2 py-0.5 rounded cursor-pointer transition ${
              !isDownload
                ? "bg-ed-accent text-white shadow-xs font-semibold"
                : "text-ed-muted hover:text-ed-text"
            }`}
          >
            <Globe className="size-3" />
            <span>Link / Page</span>
          </button>
          <button
            type="button"
            onClick={() => setActionType("download")}
            className={`flex items-center gap-1 px-2 py-0.5 rounded cursor-pointer transition ${
              isDownload
                ? "bg-ed-accent text-white shadow-xs font-semibold"
                : "text-ed-muted hover:text-ed-text"
            }`}
          >
            <Download className="size-3" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Button Text Input */}
      <TextField
        label="Button / Link text"
        value={value.label}
        onChange={(text) => onChange({ ...value, label: text })}
        placeholder={isDownload ? "e.g. Download Brochure" : "e.g. Contact Us"}
        maxLength={80}
        required
      />

      {/* Normal Page / URL Mode */}
      {!isDownload ? (
        <div className="flex flex-col gap-2">
          <TextField
            label="Destination page or URL"
            value={value.href}
            onChange={(href) => onChange({ ...value, href })}
            placeholder="/contact or https://…"
            list={listId}
            maxLength={2048}
            required
            error={hrefError}
          />
          <datalist id={listId}>
            {targets.map((target) => (
              <option key={target.href} value={target.href}>
                {target.label}
              </option>
            ))}
          </datalist>

          <label className="flex items-center gap-2 cursor-pointer select-none text-[12px] text-ed-muted hover:text-ed-text transition mt-0.5">
            <input
              type="checkbox"
              checked={Boolean(value.openInNewTab)}
              onChange={(e) => onChange({ ...value, openInNewTab: e.target.checked })}
              className="rounded border-ed-border text-brand focus:ring-brand/30"
            />
            <span>Open in new tab</span>
          </label>
        </div>
      ) : (
        /* Download File Mode */
        <div className="flex flex-col gap-2.5 rounded-ed border border-dashed border-ed-accent/30 bg-ed-accent-soft/20 p-2.5">
          <div className="flex items-center justify-between gap-1 flex-wrap">
            <span className="text-[11px] font-semibold text-ed-accent flex items-center gap-1">
              <Download className="size-3" />
              <span>Brochure / File to Download</span>
            </span>
            <div className="flex items-center gap-1.5">
              {media && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.zip,.csv,.xlsx,.png,.jpg,.jpeg,.webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handleFileUpload(f);
                      e.target.value = "";
                    }}
                  />
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded border border-ed-border bg-ed-panel text-ed-text hover:bg-ed-subtle cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="size-3" />
                    <span>{uploading ? "Uploading…" : "Upload File"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPickingDoc(true)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded border border-ed-border bg-ed-panel text-ed-text hover:bg-ed-subtle cursor-pointer"
                  >
                    <FileText className="size-3" />
                    <span>Media Library</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {uploadError && (
            <p className="text-[11px] text-ed-danger font-medium">{uploadError}</p>
          )}

          <TextField
            label="File URL"
            value={value.href}
            onChange={(href) => onChange({ ...value, href })}
            placeholder="Upload file or enter URL (e.g. /api/media/files/... or https://...)"
            maxLength={2048}
            required
            hint="Supports PDF brochures, documents, images or catalogs"
          />

          <TextField
            label="Download filename (optional)"
            value={value.downloadFileName || ""}
            onChange={(name) => onChange({ ...value, downloadFileName: name || undefined })}
            placeholder="e.g. Brochure.pdf"
            maxLength={100}
            hint="Browser saves the file with this name"
          />
        </div>
      )}

      {/* Button Icon & Placement */}
      <div className="flex flex-col gap-2 pt-1 border-t border-ed-border/60">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-ed-muted">Button Icon (Optional)</span>
          {value.icon && (
            <button
              type="button"
              onClick={() => onChange({ ...value, icon: undefined, iconImage: undefined })}
              className="text-[10px] text-ed-danger hover:underline cursor-pointer"
            >
              Remove icon
            </button>
          )}
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
          <Suspense fallback={<div className="h-8 rounded-ed bg-ed-subtle animate-pulse" />}>
            <IconPickerField
              label=""
              value={value.icon}
              imageValue={value.iconImage}
              onChange={(val) =>
                onChange({
                  ...value,
                  icon: val.icon,
                  iconImage: val.iconImage,
                })
              }
            />
          </Suspense>

          {Boolean(value.icon || value.iconImage?.url) && (
            <div className="inline-flex rounded-ed border border-ed-border bg-ed-panel p-0.5 text-[11px] font-medium h-8 items-center">
              <button
                type="button"
                onClick={() => onChange({ ...value, iconPosition: "left" })}
                className={`px-2 py-0.5 rounded cursor-pointer transition ${
                  (value.iconPosition || "left") === "left"
                    ? "bg-ed-accent text-white font-semibold"
                    : "text-ed-muted hover:text-ed-text"
                }`}
                title="Icon on left"
              >
                Left
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...value, iconPosition: "right" })}
                className={`px-2 py-0.5 rounded cursor-pointer transition ${
                  value.iconPosition === "right"
                    ? "bg-ed-accent text-white font-semibold"
                    : "text-ed-muted hover:text-ed-text"
                }`}
                title="Icon on right"
              >
                Right
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Document Picker Modal */}
      {pickingDoc && media && (
        <Suspense fallback={null}>
          <MediaPickerDialog
            clientId={media.clientId}
            websiteId={media.websiteId}
            kind="DOCUMENT"
            onPick={(file) => {
              onChange({
                ...value,
                href: file.url,
                actionType: "download",
                downloadFileName: value.downloadFileName || file.fileName,
                icon: value.icon || "download",
              });
              setPickingDoc(false);
            }}
            onClose={() => setPickingDoc(false)}
          />
        </Suspense>
      )}
    </div>
  );
}

type OptionalLinkFieldProps = {
  label: string;
  value: LinkRef | undefined;
  onChange: (value: LinkRef | undefined) => void;
  fallback: LinkRef;
};

export function OptionalLinkField({
  label,
  value,
  onChange,
  fallback,
}: OptionalLinkFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <CheckboxField
        label={`Show ${label.toLowerCase()}`}
        checked={Boolean(value)}
        onChange={(on) => onChange(on ? fallback : undefined)}
      />
      {value && <LinkField label={label} value={value} onChange={onChange} />}
    </div>
  );
}

type ImageFieldProps = {
  label: string;
  value: ImageRef | undefined;
  onChange: (value: ImageRef | undefined) => void;
  /** Optional images can be removed entirely. */
  optional?: boolean;
  dimensionHint?: string;
  hint?: string;
};

export function ImageField({
  label,
  value,
  onChange,
  optional = false,
  dimensionHint,
  hint,
}: ImageFieldProps) {
  const media = useContext(MediaTargetContext);
  const inputRef = useRef<HTMLInputElement>(null);
  const [picking, setPicking] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    percent: number;
    statusText: string;
    savedPercent?: number;
  } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const image = value ?? { url: "", alt: "" };
  const isDataUri = Boolean(image.url && image.url.startsWith("data:image/"));
  const urlError =
    image.url && !SAFE_IMAGE_URL.test(image.url.trim())
      ? "Use an https:// link or upload an image"
      : undefined;
  const update = (patch: Partial<ImageRef>) => {
    const next = { ...image, ...patch };
    onChange(optional && !next.url && !next.alt ? undefined : next);
  };
  const applyFile = (file: MediaFile) => update({ url: file.url, alt: file.altText || image.alt });

  async function upload(rawFile: File) {
    if (!media) return;
    const problem = uploadProblem(rawFile, "IMAGE");
    setUploadError(problem);
    if (problem) return;
    setUploading(true);
    setUploadProgress({ percent: 10, statusText: "Optimizing to WebP…" });

    try {
      // 1. Convert & optimize to ultra-crisp WebP with 0-50% stage progress
      const { file: optimizedFile, savedPercent } = await optimizeImageToWebP(rawFile, {
        quality: 0.88,
        onProgress: (pct, msg) => {
          setUploadProgress({
            percent: Math.min(50, Math.round(pct * 0.5)),
            statusText: msg,
          });
        },
      });

      // 2. Upload to backend & Linode Object Storage with 50-100% stage
      setUploadProgress({
        percent: 70,
        statusText: "Uploading to Linode…",
        savedPercent,
      });

      const uploaded = await mediaApi.upload({
        file: optimizedFile,
        clientId: media.clientId,
        websiteId: media.websiteId,
      });

      applyFile(uploaded);

      setUploadProgress({
        percent: 100,
        statusText: savedPercent > 0 ? `Saved as WebP (${savedPercent}% lighter)` : "Saved to Linode!",
        savedPercent,
      });

      setTimeout(() => {
        setUploadProgress(null);
      }, 3500);
    } catch (err) {
      setUploadError(errorMessage(err));
      setUploadProgress(null);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-ed-lg border border-ed-border/90 bg-ed-subtle/40 p-3 shadow-2xs">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-ed-xs font-semibold text-ed-text flex items-center gap-1.5 flex-wrap">
            <Images className="size-3.5 text-ed-accent shrink-0" />
            <span>{label}</span>
            {dimensionHint && (
              <span className="inline-flex items-center rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-medium text-brand">
                {dimensionHint}
              </span>
            )}
          </span>
          {optional && value && (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="text-[11px] font-medium text-ed-danger hover:underline cursor-pointer"
            >
              Remove image
            </button>
          )}
        </div>
        {hint && <p className="text-[11px] text-ed-muted leading-tight">{hint}</p>}
      </div>

      {/* Image Thumbnail with Click-to-Lightbox & Action Overlay */}
      {image.url && !urlError && (
        <div className="group/preview relative overflow-hidden rounded-ed border border-ed-border bg-ed-subtle shadow-ed-xs transition">
          <img
            src={image.url}
            alt={image.alt || label}
            className={`h-28 w-full ${isDataUri || label.toLowerCase().includes("logo") ? "object-contain p-3 bg-white/75 dark:bg-black/40" : "object-cover"} transition-transform duration-200 group-hover/preview:scale-105 cursor-pointer`}
            onClick={() => setLightboxOpen(true)}
          />

          {/* Hover overlay with Preview & Quick Remove actions */}
          <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/50 opacity-0 group-hover/preview:opacity-100 transition-opacity backdrop-blur-[2px]">
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              title="View full preview"
              className="inline-flex items-center gap-1 rounded-ed bg-white/95 hover:bg-white text-zinc-900 px-2.5 py-1 text-ed-2xs font-semibold shadow-sm transition active:scale-95"
            >
              <Eye className="size-3.5" />
              <span>Preview</span>
            </button>
            {optional && (
              <button
                type="button"
                onClick={() => update({ url: "", alt: "" })}
                title="Remove image"
                className="inline-flex items-center justify-center rounded-ed bg-red-600/90 hover:bg-red-600 text-white size-6 shadow-sm transition active:scale-95"
              >
                <Trash2 className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {image.url && (
        <Lightbox
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          src={image.url}
          alt={image.alt || label}
          title={label}
        />
      )}

      {/* Upload and Media Library Action Bar */}
      {media && (
        <div className="flex flex-col gap-1.5">
          <div className="grid grid-cols-2 gap-2">
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT_BY_KIND.IMAGE}
              className="sr-only"
              tabIndex={-1}
              aria-hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void upload(file);
              }}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex h-8 items-center justify-center gap-1.5 rounded-ed border border-ed-border bg-ed-panel px-2 text-ed-xs font-medium text-ed-text shadow-ed-xs transition hover:bg-ed-hover hover:border-ed-border-strong disabled:cursor-wait disabled:opacity-60 truncate"
            >
              <Upload className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">{uploading ? "Optimizing…" : "Upload"}</span>
            </button>
            <button
              type="button"
              onClick={() => setPicking(true)}
              onMouseEnter={() => void MediaPickerDialog.preload()}
              onFocus={() => void MediaPickerDialog.preload()}
              disabled={uploading}
              className="flex h-8 items-center justify-center gap-1.5 rounded-ed border border-ed-border bg-ed-panel px-2 text-ed-xs font-medium text-ed-text shadow-ed-xs transition hover:bg-ed-hover hover:border-ed-border-strong disabled:opacity-60 truncate"
            >
              <Images className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">Library</span>
            </button>
          </div>

          {/* Real-time 0-100% WebP Optimization & Linode Upload Progress Bar */}
          {uploadProgress && (
            <div className="flex flex-col gap-1 rounded-ed border border-emerald-500/25 bg-emerald-950/20 p-2 text-ed-2xs shadow-ed-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between font-medium text-emerald-400">
                <span className="truncate text-[11px]">{uploadProgress.statusText}</span>
                <span className="font-semibold">{uploadProgress.percent}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress.percent}%` }}
                />
              </div>
            </div>
          )}

          {uploadError && (
            <p role="alert" className="text-ed-2xs font-medium text-ed-danger">
              {uploadError}
            </p>
          )}
        </div>
      )}
      {picking && media && (
        <Suspense fallback={null}>
          <MediaPickerDialog
            clientId={media.clientId}
            websiteId={media.websiteId}
            kind="IMAGE"
            onPick={(file) => {
              applyFile(file);
              setPicking(false);
            }}
            onClose={() => setPicking(false)}
          />
        </Suspense>
      )}
      {isDataUri ? (
        <div className="flex flex-col gap-1.5 rounded-ed border border-brand/20 bg-brand/5 p-2.5 text-ed-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium text-brand">
              <Check className="size-3.5" />
              <span>{image.url.includes("svg") ? "Vector SVG Logo (Template asset)" : "Embedded Image"}</span>
            </span>
            <button
              type="button"
              onClick={() => update({ url: "" })}
              className="text-[11px] font-medium text-ed-danger hover:underline cursor-pointer"
            >
              Change / Clear
            </button>
          </div>
          <p className="text-[11px] leading-relaxed text-ed-muted">
            This is an integrated vector asset from the template. You can upload a new image or paste a link to replace it.
          </p>
        </div>
      ) : (
        <TextField
          label="Image link"
          type="text"
          value={image.url}
          onChange={(url) => update({ url })}
          placeholder="https://…"
          hint={media ? "Upload, choose from your library, or paste a link." : "Paste a link to an image."}
          error={urlError}
          required={!optional}
          maxLength={65536}
        />
      )}
      <TextField
        label="Description (alt text)"
        value={image.alt}
        onChange={(alt) => update({ alt })}
        hint="Describes the image for screen readers and search engines."
        maxLength={300}
      />
    </div>
  );
}

type VideoFieldProps = {
  label: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  hint?: string;
  placeholder?: string;
  optional?: boolean;
  dimensionHint?: string;
};

export function VideoField({
  label,
  value = "",
  onChange,
  hint,
  placeholder = "https://www.youtube.com/watch?v=... or https://.../video.mp4",
  optional = true,
  dimensionHint,
}: VideoFieldProps) {
  const media = useContext(MediaTargetContext);
  const inputRef = useRef<HTMLInputElement>(null);
  const [picking, setPicking] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    percent: number;
    statusText: string;
  } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const videoUrl = value?.trim() || "";
  const isDirectVideo =
    videoUrl.endsWith(".mp4") ||
    videoUrl.endsWith(".webm") ||
    videoUrl.includes("/media/") ||
    videoUrl.includes("blob:") ||
    videoUrl.includes("linodeobjects.com");
  const isYouTubeOrVimeo =
    videoUrl.includes("youtube.com") ||
    videoUrl.includes("youtu.be") ||
    videoUrl.includes("vimeo.com");

  async function upload(rawFile: File) {
    if (!media) return;
    const problem = uploadProblem(rawFile, "VIDEO");
    setUploadError(problem);
    if (problem) return;

    setUploading(true);
    setUploadProgress({ percent: 20, statusText: "Preparing video upload…" });

    try {
      setUploadProgress({ percent: 60, statusText: "Uploading to Linode Storage…" });

      const uploaded = await mediaApi.upload({
        file: rawFile,
        clientId: media.clientId,
        websiteId: media.websiteId,
      });

      onChange(uploaded.url);

      setUploadProgress({
        percent: 100,
        statusText: `Saved & stream-optimized ${rawFile.name} (${formatBytes(rawFile.size)})`,
      });

      setTimeout(() => {
        setUploadProgress(null);
      }, 3500);
    } catch (err) {
      setUploadError(errorMessage(err));
      setUploadProgress(null);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-ed-lg border border-ed-border/90 bg-ed-subtle/40 p-3 shadow-2xs">
      <div className="flex items-center justify-between">
        <span className="text-ed-xs font-semibold text-ed-text flex items-center gap-1.5 flex-wrap">
          <Film className="size-3.5 text-ed-accent shrink-0" />
          <span>{label}</span>
          {dimensionHint && (
            <span className="inline-flex items-center rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-medium text-brand">
              {dimensionHint}
            </span>
          )}
        </span>
        {optional && value && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-[11px] font-medium text-ed-danger hover:underline"
          >
            Remove video
          </button>
        )}
      </div>

      {/* Video Preview Player / Embed Info */}
      {videoUrl && (
        <div className="group/preview relative overflow-hidden rounded-ed border border-ed-border bg-black/90 shadow-ed-xs">
          {isDirectVideo ? (
            <div className="relative">
              <video
                src={videoUrl}
                controls
                preload="metadata"
                playsInline
                className="max-h-36 w-full rounded-ed object-contain bg-black"
              />
              <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 rounded bg-black/75 px-1.5 py-0.5 text-[9.5px] font-semibold tracking-wide text-emerald-400 border border-emerald-500/30 backdrop-blur-xs">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Stream-Optimized
              </span>
            </div>
          ) : isYouTubeOrVimeo ? (
            <div className="flex items-center gap-2.5 bg-zinc-950 p-2.5 text-ed-xs text-zinc-300">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-ed bg-red-600/20 text-red-500 border border-red-500/30">
                <Film className="size-4" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="font-semibold text-white truncate text-ed-xs">Embedded Web Video</p>
                <p className="truncate text-ed-2xs text-zinc-400">{videoUrl}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 bg-zinc-950 p-2.5 text-ed-xs text-zinc-300">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-ed bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <Film className="size-4" />
              </div>
              <span className="truncate text-ed-2xs text-zinc-300 flex-1">{videoUrl}</span>
            </div>
          )}

          {/* Quick Remove Button */}
          {optional && (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              title="Remove video"
              className="absolute top-1.5 right-1.5 inline-flex items-center justify-center rounded-ed bg-red-600/90 hover:bg-red-600 text-white size-6 shadow-md transition active:scale-95 z-10"
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Upload and Media Library Action Bar */}
      {media && (
        <div className="flex flex-col gap-1.5">
          <div className="grid grid-cols-2 gap-2">
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT_BY_KIND.VIDEO}
              className="sr-only"
              tabIndex={-1}
              aria-hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void upload(file);
              }}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex h-8 items-center justify-center gap-1.5 rounded-ed border border-ed-border bg-ed-panel px-2 text-ed-xs font-medium text-ed-text shadow-ed-xs transition hover:bg-ed-hover hover:border-ed-border-strong disabled:cursor-wait disabled:opacity-60 truncate"
            >
              <Upload className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">{uploading ? "Uploading…" : "Upload Video"}</span>
            </button>
            <button
              type="button"
              onClick={() => setPicking(true)}
              onMouseEnter={() => void MediaPickerDialog.preload()}
              onFocus={() => void MediaPickerDialog.preload()}
              disabled={uploading}
              className="flex h-8 items-center justify-center gap-1.5 rounded-ed border border-ed-border bg-ed-panel px-2 text-ed-xs font-medium text-ed-text shadow-ed-xs transition hover:bg-ed-hover hover:border-ed-border-strong disabled:opacity-60 truncate"
            >
              <Film className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">Library</span>
            </button>
          </div>

          {/* Real-time 0-100% Linode Upload Progress Bar */}
          {uploadProgress && (
            <div className="flex flex-col gap-1 rounded-ed border border-indigo-500/25 bg-indigo-950/20 p-2 text-ed-2xs shadow-ed-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between font-medium text-indigo-400">
                <span className="truncate text-[11px]">{uploadProgress.statusText}</span>
                <span className="font-semibold">{uploadProgress.percent}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress.percent}%` }}
                />
              </div>
            </div>
          )}

          {uploadError && (
            <p role="alert" className="text-ed-2xs font-medium text-ed-danger">
              {uploadError}
            </p>
          )}
        </div>
      )}

      {/* Video URL Text Input */}
      <TextField
        label="Video link or URL"
        value={value}
        onChange={(url) => onChange(url || undefined)}
        placeholder={placeholder}
        hint={hint ?? "Upload MP4/WebM (max 50 MB) or paste YouTube / Vimeo link."}
      />

      {/* Media Picker Dialog for Video */}
      {picking && media && (
        <Suspense fallback={null}>
          <MediaPickerDialog
            clientId={media.clientId}
            websiteId={media.websiteId}
            kind="VIDEO"
            onPick={(file) => {
              onChange(file.url);
              setPicking(false);
            }}
            onClose={() => setPicking(false)}
          />
        </Suspense>
      )}
    </div>
  );
}

type ItemListProps<T> = {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  create: () => T;
  itemTitle: (item: T, index: number) => string;
  renderItem: (item: T, update: (item: T) => void) => ReactNode;
  max: number;
  addLabel?: string;
  /** Replaces the default add button, e.g. with a menu of item kinds. */
  renderAdd?: (add: (item: T) => void, full: boolean) => ReactNode;
};

export function ItemList<T>({
  label,
  items,
  onChange,
  create,
  itemTitle,
  renderItem,
  max,
  addLabel = "Add item",
  renderAdd,
}: ItemListProps<T>) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  /** Drags start only from the grip, so text inside an open item stays selectable. */
  const [armedIndex, setArmedIndex] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  function moveTo(from: number, to: number) {
    if (from === to || to < 0 || to >= items.length) return;
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item!);
    onChange(next);
    if (openIndex === null) return;
    if (openIndex === from) setOpenIndex(to);
    else if (from < openIndex && to >= openIndex) setOpenIndex(openIndex - 1);
    else if (from > openIndex && to <= openIndex) setOpenIndex(openIndex + 1);
  }

  function move(index: number, delta: number) {
    moveTo(index, index + delta);
  }

  function endDrag() {
    setArmedIndex(null);
    setDragIndex(null);
    setOverIndex(null);
  }

  function add(item: T) {
    if (items.length >= max) return;
    onChange([...items, item]);
    setOpenIndex(items.length);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-ed-xs font-semibold text-ed-text">
          {label}{" "}
          <span className="font-normal text-ed-muted">({items.length})</span>
        </span>
      </div>
      <ul className="flex flex-col gap-1.5">
        {items.map((item, index) => {
          const open = openIndex === index;
          return (
            <li
              key={index}
              draggable={armedIndex === index}
              onDragStart={(event) => {
                if (armedIndex !== index) return;
                event.stopPropagation();
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", String(index));
                setDragIndex(index);
              }}
              onDragOver={(event) => {
                if (dragIndex === null) return;
                event.preventDefault();
                event.stopPropagation();
                event.dataTransfer.dropEffect = "move";
                if (overIndex !== index) setOverIndex(index);
              }}
              onDrop={(event) => {
                if (dragIndex === null) return;
                event.preventDefault();
                event.stopPropagation();
                moveTo(dragIndex, index);
                endDrag();
              }}
              onDragEnd={endDrag}
              className={`rounded-ed border bg-ed-panel shadow-ed-xs overflow-hidden transition-colors hover:border-ed-border-strong ${
                overIndex === index && dragIndex !== index
                  ? "border-ed-accent ring-2 ring-ed-accent/20"
                  : "border-ed-border"
              } ${dragIndex === index ? "opacity-50" : ""}`}
            >
              <div className="flex items-center gap-1 pl-1 pr-1">
                <span
                  role="presentation"
                  title="Drag to reorder"
                  onPointerDown={() => setArmedIndex(index)}
                  onPointerUp={() => setArmedIndex(null)}
                  className="grid size-6 shrink-0 cursor-grab place-items-center rounded-ed text-ed-faint hover:bg-ed-hover hover:text-ed-text active:cursor-grabbing"
                >
                  <GripVertical className="size-3.5" aria-hidden />
                </span>
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : index)}
                  aria-expanded={open}
                  className="min-w-0 flex-1 truncate py-1.5 text-left text-ed-sm font-medium text-ed-text"
                >
                  {itemTitle(item, index) || `Item ${index + 1}`}
                </button>
                <IconButton
                  label="Move up"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                >
                  <ChevronUp className="size-3.5" />
                </IconButton>
                <IconButton
                  label="Move down"
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                >
                  <ChevronDown className="size-3.5" />
                </IconButton>
                <IconButton
                  label="Remove"
                  tone="danger"
                  onClick={() => {
                    onChange(items.filter((_, i) => i !== index));
                    setOpenIndex(null);
                  }}
                >
                  <Trash2 className="size-3.5" />
                </IconButton>
              </div>
              {open && (
                <div className="flex flex-col gap-2.5 border-t border-ed-border bg-ed-subtle/20 p-2.5">
                  {renderItem(item, (updated) =>
                    onChange(
                      items.map((current, i) =>
                        i === index ? updated : current,
                      ),
                    ),
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {renderAdd ? (
        renderAdd(add, items.length >= max)
      ) : (
      <button
        type="button"
        disabled={items.length >= max}
        onClick={() => add(create())}
        className="inline-flex items-center justify-center gap-1.5 rounded-ed border border-dashed border-ed-border-strong py-1.5 text-ed-sm font-medium text-ed-accent hover:bg-ed-accent-soft/60 hover:border-ed-accent transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus className="size-3.5" aria-hidden />{" "}
        {items.length >= max ? `Maximum ${max}` : addLabel}
      </button>
      )}
    </div>
  );
}

type IconButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: "default" | "danger";
  children: ReactNode;
};

export function IconButton({
  label,
  onClick,
  disabled,
  tone = "default",
  children,
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={`grid size-6 place-items-center rounded-ed transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
        tone === "danger"
          ? "text-ed-danger hover:bg-ed-danger-soft"
          : "text-ed-faint hover:bg-ed-hover hover:text-ed-text"
      }`}
    >
      {children}
    </button>
  );
}

export function FormGroup({
  title,
  description,
  badge,
  children,
}: {
  title: string;
  description?: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3.5 border-b border-ed-border/70 p-4 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-ed-accent shadow-xs" />
          <h3 className="text-ed-xs font-bold uppercase tracking-wider text-ed-text">
            {title}
          </h3>
        </div>
        {badge && (
          <span className="rounded-full bg-ed-subtle px-2 py-0.5 text-[10px] font-semibold text-ed-muted">
            {badge}
          </span>
        )}
      </div>
      {description && (
        <p className="text-ed-2xs text-ed-muted leading-relaxed -mt-1.5 pl-4">
          {description}
        </p>
      )}
      <div className="flex flex-col gap-3 pl-1">
        {children}
      </div>
    </div>
  );
}

export { CellColorPicker } from "../../../components/ui/CellColorPicker.tsx";

