import { useId, useMemo, useRef, useState, useEffect } from "react";
import { Button, Modal } from "@heroui/react";
import {
  Check,
  ChevronDown,
  Library,
  Search,
  Shapes,
  Upload,
  X,
} from "lucide-react";
import type { ImageRef } from "../../../site-kit/index.ts";
import { SiteIcon } from "../../../site-kit/primitives.tsx";
import { ImageField } from "./fields.tsx";
import {
  ICON_CATEGORIES,
  searchIcons,
  type IconCategory,
  LEGACY_ICONS,
} from "./icon-data.ts";

export { LEGACY_ICONS };
export const ICON_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "No icon" },
  ...LEGACY_ICONS.map((i) => ({ value: i.name, label: i.label })),
];

export type IconPickerValue = {
  icon?: string;
  iconImage?: ImageRef;
};

export type IconPickerFieldProps = {
  label?: string;
  value?: string;
  imageValue?: ImageRef;
  onChange: (val: IconPickerValue) => void;
  hint?: string;
  className?: string;
};

const PAGE_SIZE = 96;

type IconPickerModalProps = {
  isOpen: boolean;
  value?: string;
  imageValue?: ImageRef;
  onSelectIcon: (name: string) => void;
  onSelectImage: (image: ImageRef | undefined) => void;
  onClear: () => void;
  onClose: () => void;
};

/** Formats a legacy or Lucide icon name for compact display (e.g. "User / Profile 👤" -> "User") */
function getShortIconLabel(name?: string, isCustom = false): string {
  if (isCustom) return "Custom image";
  if (!name) return "Choose icon…";
  const legacy = LEGACY_ICONS.find((i) => i.name === name);
  if (legacy) {
    return legacy.label.split("/")[0].trim().replace(/\s[^\w\s].*$/, "");
  }
  return name.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

export function IconPickerModal({
  isOpen,
  value,
  imageValue,
  onSelectIcon,
  onSelectImage,
  onClear,
  onClose,
}: IconPickerModalProps) {
  const [activeTab, setActiveTab] = useState<"library" | "custom">(
    imageValue?.url ? "custom" : "library"
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<IconCategory>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when modal opens on library tab
  useEffect(() => {
    if (isOpen && activeTab === "library") {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeTab]);

  // Reset pagination when query or category changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, category]);

  const filteredIcons = useMemo(() => {
    return searchIcons(query, category);
  }, [query, category]);

  const visibleIcons = useMemo(() => {
    return filteredIcons.slice(0, visibleCount);
  }, [filteredIcons, visibleCount]);

  const hasMore = visibleCount < filteredIcons.length;

  const currentSelectionLabel = useMemo(() => {
    if (imageValue?.url) return "Custom Image";
    if (value) return getShortIconLabel(value);
    return "None";
  }, [value, imageValue]);

  if (!isOpen) return null;

  return (
    <Modal.Backdrop isOpen onOpenChange={(open) => !open && onClose()}>
      <Modal.Container size="cover" scroll="inside">
        <Modal.Dialog
          aria-label="Choose icon"
          className="max-w-3xl w-full rounded-2xl border border-ed-border bg-ed-panel shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <Modal.Header className="border-b border-ed-border/70 px-6 py-4 shrink-0 bg-ed-panel">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-ed-lg bg-ed-accent-soft border border-ed-accent/25 flex items-center justify-center text-ed-accent shrink-0">
                  <Shapes className="size-5" />
                </div>
                <div>
                  <Modal.Heading className="text-base font-semibold text-ed-text leading-tight">
                    Icon Picker
                  </Modal.Heading>
                  <p className="text-ed-2xs text-ed-muted mt-0.5">
                    Select from 1,700+ clean icons or upload your custom logo/icon.
                  </p>
                </div>
              </div>

              {/* Tab Switcher */}
              <div className="flex items-center gap-1 p-0.5 bg-ed-subtle/80 rounded-ed-lg border border-ed-border/50 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab("library")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-ed text-ed-xs font-medium transition-all duration-150 cursor-pointer ${
                    activeTab === "library"
                      ? "bg-ed-panel text-ed-text shadow-ed-xs border border-ed-border/60"
                      : "text-ed-muted hover:text-ed-text"
                  }`}
                >
                  <Library className="size-3.5" />
                  <span>Icon Library</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("custom")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-ed text-ed-xs font-medium transition-all duration-150 cursor-pointer ${
                    activeTab === "custom"
                      ? "bg-ed-panel text-ed-text shadow-ed-xs border border-ed-border/60"
                      : "text-ed-muted hover:text-ed-text"
                  }`}
                >
                  <Upload className="size-3.5" />
                  <span>Custom Upload</span>
                  {imageValue?.url && (
                    <span className="size-1.5 rounded-full bg-ed-accent animate-pulse" />
                  )}
                </button>
              </div>
            </div>
          </Modal.Header>

          {/* Body */}
          <Modal.Body className="p-0 overflow-hidden flex-1 flex flex-col min-h-0 bg-ed-panel">
            {activeTab === "library" ? (
              <div className="flex flex-col flex-1 min-h-0">
                {/* Search & Categories Bar */}
                <div className="p-4 border-b border-ed-border/60 bg-ed-panel flex flex-col gap-3 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ed-faint" />
                      <input
                        ref={searchInputRef}
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search 1,700+ icons (e.g. zap, rocket, shield, payment, arrow, check)..."
                        className="h-9 w-full rounded-ed-lg border border-ed-border bg-ed-panel pl-9 pr-9 text-ed-sm text-ed-text placeholder:text-ed-faint shadow-ed-xs transition-all duration-150 hover:border-ed-border-strong focus:border-ed-accent focus:outline-none focus:ring-2 focus:ring-ed-accent/15 [&::-webkit-search-cancel-button]:hidden"
                      />
                      {query && (
                        <button
                          type="button"
                          onClick={() => setQuery("")}
                          aria-label="Clear search"
                          className="absolute right-2.5 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded text-ed-faint hover:bg-ed-hover hover:text-ed-text cursor-pointer"
                        >
                          <X className="size-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Active Selection Pill */}
                    {(value || imageValue?.url) && (
                      <div className="flex items-center gap-1.5 text-ed-xs bg-ed-accent-soft text-ed-accent px-2.5 py-1.5 rounded-ed-lg border border-ed-accent/25 shrink-0 font-medium">
                        <div className="size-4 flex items-center justify-center shrink-0">
                          {imageValue?.url ? (
                            <img
                              src={imageValue.url}
                              alt=""
                              className="size-3.5 rounded object-contain"
                            />
                          ) : (
                            <SiteIcon name={value} inline className="size-3.5" />
                          )}
                        </div>
                        <span className="truncate max-w-[120px]">
                          {currentSelectionLabel}
                        </span>
                        <button
                          type="button"
                          onClick={onClear}
                          className="ml-1 text-ed-accent/70 hover:text-ed-danger transition-colors cursor-pointer"
                          title="Remove icon"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Category Pills with smooth horizontal scroll */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                    {ICON_CATEGORIES.map((cat) => {
                      const isSelected = category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          className={`h-6.5 px-3 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors duration-150 shrink-0 cursor-pointer ${
                            isSelected
                              ? "bg-ed-accent text-white shadow-ed-xs"
                              : "bg-ed-subtle text-ed-muted hover:bg-ed-hover hover:text-ed-text"
                          }`}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Icons Grid */}
                <div className="flex-1 overflow-y-auto p-4 overscroll-contain">
                  {visibleIcons.length === 0 ? (
                    <div className="py-16 text-center">
                      <Search className="size-8 text-ed-faint mx-auto mb-2 opacity-50" />
                      <p className="text-ed-sm font-medium text-ed-text">
                        No icons found matching “{query}”
                      </p>
                      <p className="text-ed-xs text-ed-muted mt-1">
                        Try a different term or upload your own custom icon.
                      </p>
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onPress={() => {
                            setQuery("");
                            setCategory("all");
                          }}
                        >
                          Clear search
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onPress={() => setActiveTab("custom")}
                        >
                          Upload Custom Icon
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        {visibleIcons.map((item) => {
                          const isSelected =
                            !imageValue?.url &&
                            (value === item.name ||
                              (!value && item.name === ""));

                          return (
                            <button
                              key={item.name}
                              type="button"
                              title={`${item.label} (${item.name})`}
                              onClick={() => {
                                onSelectIcon(item.name);
                                onClose();
                              }}
                              className={`group relative flex flex-col items-center justify-center h-18 rounded-ed-lg border p-1.5 text-center transition-all duration-150 cursor-pointer ${
                                isSelected
                                  ? "border-ed-accent bg-ed-accent-soft text-ed-accent font-semibold ring-2 ring-ed-accent/25 shadow-ed-xs"
                                  : "border-ed-border/70 bg-ed-panel hover:border-ed-accent/50 hover:bg-ed-subtle/80 hover:shadow-ed-xs text-ed-text"
                              }`}
                            >
                              <div className="size-6 flex items-center justify-center mb-1 shrink-0 transition-transform group-hover:scale-110 duration-150 text-ed-text group-hover:text-ed-accent">
                                <SiteIcon name={item.name} inline className="size-5" />
                              </div>
                              <span className="w-full truncate text-[10.5px] leading-tight text-ed-muted group-hover:text-ed-text font-normal px-0.5">
                                {item.label.split("/")[0].trim().replace(/\s[^\w\s].*$/, "")}
                              </span>

                              {isSelected && (
                                <div className="absolute -top-1 -right-1 size-4 rounded-full bg-ed-accent text-white flex items-center justify-center shadow-ed-xs">
                                  <Check className="size-2.5 stroke-[3]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {hasMore && (
                        <div className="mt-5 text-center pb-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onPress={() =>
                              setVisibleCount((prev) => prev + PAGE_SIZE)
                            }
                            className="font-medium"
                          >
                            Load More Icons ({filteredIcons.length - visibleCount} remaining)
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* Custom Icon Upload Tab (Plan 2) */
              <div className="p-6 flex flex-col gap-6 overflow-y-auto">
                <div className="rounded-ed-lg bg-ed-subtle/70 border border-ed-border/60 p-4">
                  <div className="flex items-start gap-3">
                    <div className="size-9 rounded-ed-lg bg-ed-accent-soft border border-ed-accent/20 flex items-center justify-center text-ed-accent shrink-0">
                      <Upload className="size-5" />
                    </div>
                    <div>
                      <h4 className="text-ed-sm font-semibold text-ed-text">
                        Upload Your Own Icon (PNG / WebP)
                      </h4>
                      <p className="text-ed-xs text-ed-muted mt-0.5 leading-relaxed">
                        For crisp rendering, upload a square image with a transparent background
                        (recommended size: 64×64 to 256×256 pixels). All uploaded icons are
                        automatically optimized to lightweight WebP.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Existing Project ImageField Reused */}
                <div className="rounded-ed-lg border border-ed-border p-4 bg-ed-panel">
                  <ImageField
                    label="Icon Image File"
                    value={imageValue}
                    onChange={(img) => onSelectImage(img)}
                    optional
                    dimensionHint="Square transparent icon (64×64 – 256×256 px)"
                  />
                </div>

                {/* Live Preview Showcase */}
                {imageValue?.url && (
                  <div className="flex flex-col gap-2.5">
                    <span className="text-ed-xs font-semibold uppercase tracking-wider text-ed-muted">
                      Live Preview In Website Badges
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {/* 1. Light Pastel Circle */}
                      <div className="flex flex-col items-center justify-center p-3 rounded-ed-lg border border-ed-border bg-white text-center gap-1.5 shadow-ed-xs">
                        <div className="size-11 rounded-full bg-orange-100 flex items-center justify-center p-2 border border-orange-200">
                          <img
                            src={imageValue.url}
                            alt=""
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <span className="text-[11px] text-gray-600 font-medium">Pastel Circle</span>
                      </div>

                      {/* 2. Square Badge */}
                      <div className="flex flex-col items-center justify-center p-3 rounded-ed-lg border border-ed-border bg-white text-center gap-1.5 shadow-ed-xs">
                        <div className="size-11 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center p-2">
                          <img
                            src={imageValue.url}
                            alt=""
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <span className="text-[11px] text-gray-600 font-medium">Square Badge</span>
                      </div>

                      {/* 3. Gradient Circle */}
                      <div className="flex flex-col items-center justify-center p-3 rounded-ed-lg border border-ed-border bg-white text-center gap-1.5 shadow-ed-xs">
                        <div className="size-11 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center p-2 shadow-sm">
                          <img
                            src={imageValue.url}
                            alt=""
                            className="max-h-full max-w-full object-contain brightness-0 invert"
                          />
                        </div>
                        <span className="text-[11px] text-gray-600 font-medium">Gradient Badge</span>
                      </div>

                      {/* 4. Dark Theme Card */}
                      <div className="flex flex-col items-center justify-center p-3 rounded-ed-lg border border-gray-700 bg-gray-900 text-center gap-1.5 shadow-ed-xs">
                        <div className="size-11 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center p-2">
                          <img
                            src={imageValue.url}
                            alt=""
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <span className="text-[11px] text-gray-300 font-medium">Dark Surface</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Modal.Body>

          {/* Footer */}
          <Modal.Footer className="border-t border-ed-border/70 px-6 py-3 shrink-0 bg-ed-panel flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(value || imageValue?.url) && (
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => {
                    onClear();
                    onClose();
                  }}
                  className="text-ed-danger hover:border-ed-danger/40 hover:bg-ed-danger-soft cursor-pointer"
                >
                  Remove Icon
                </Button>
              )}
              {activeTab === "library" && (
                <span className="text-ed-2xs text-ed-muted">
                  {filteredIcons.length} {filteredIcons.length === 1 ? "icon" : "icons"} available
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onPress={onClose} className="cursor-pointer">
                {activeTab === "custom" && imageValue?.url ? "Done" : "Cancel"}
              </Button>
              {activeTab === "custom" && imageValue?.url && (
                <Button
                  variant="primary"
                  size="sm"
                  onPress={onClose}
                  className="bg-ed-accent text-white cursor-pointer"
                >
                  Apply Custom Icon
                </Button>
              )}
            </div>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

export function IconPickerField({
  label = "Icon",
  value = "",
  imageValue,
  onChange,
  hint,
  className = "",
}: IconPickerFieldProps) {
  const id = useId();
  const [modalOpen, setModalOpen] = useState(false);

  const displayLabel = useMemo(() => {
    return getShortIconLabel(value, Boolean(imageValue?.url));
  }, [value, imageValue]);

  const hasSelection = Boolean(value || imageValue?.url);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-ed-xs font-medium text-ed-text select-none">
          {label}
        </label>
      )}

      <div className="relative group">
        <button
          id={id}
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex h-8 w-full items-center justify-between rounded-ed border border-ed-border bg-ed-panel px-2.5 text-left text-ed-sm font-normal text-ed-text shadow-ed-xs transition-all duration-150 hover:border-ed-border-strong hover:bg-ed-subtle/50 focus-visible:border-ed-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ed-accent/15 cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0 pr-1">
            <div
              className={`grid size-5 shrink-0 place-items-center rounded border overflow-hidden ${
                hasSelection
                  ? "border-ed-accent/30 bg-ed-accent-soft text-ed-accent"
                  : "border-dashed border-ed-border bg-ed-subtle text-ed-faint"
              }`}
            >
              {imageValue?.url ? (
                <img
                  src={imageValue.url}
                  alt=""
                  className="size-3.5 object-contain"
                />
              ) : value ? (
                <div className="size-3.5 flex items-center justify-center">
                  <SiteIcon name={value} inline className="size-3.5" />
                </div>
              ) : (
                <Shapes className="size-3 text-ed-faint" />
              )}
            </div>
            <span
              className={`truncate text-ed-xs leading-none ${
                hasSelection ? "text-ed-text font-medium" : "text-ed-faint"
              }`}
            >
              {displayLabel}
            </span>
          </div>

          <div className="flex items-center gap-0.5 shrink-0 text-ed-muted">
            {hasSelection && (
              <span
                role="button"
                title="Clear icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange({ icon: undefined, iconImage: undefined });
                }}
                className="p-1 rounded text-ed-faint hover:text-ed-danger hover:bg-ed-subtle transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
              >
                <X className="size-3" />
              </span>
            )}
            <ChevronDown className="size-3.5 text-ed-muted shrink-0" />
          </div>
        </button>
      </div>

      {hint && <span className="text-ed-2xs text-ed-muted">{hint}</span>}

      <IconPickerModal
        isOpen={modalOpen}
        value={value}
        imageValue={imageValue}
        onSelectIcon={(iconName) => {
          onChange({ icon: iconName, iconImage: undefined });
        }}
        onSelectImage={(img) => {
          onChange({ icon: undefined, iconImage: img });
        }}
        onClear={() => {
          onChange({ icon: undefined, iconImage: undefined });
        }}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

export default IconPickerField;
