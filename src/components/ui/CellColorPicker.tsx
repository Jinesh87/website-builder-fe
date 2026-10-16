import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Check, RotateCcw } from "lucide-react";
import { normalizeHexColor } from "../../utils/colors.ts";

const PRESET_SWATCHES = [
  // Neutrals / Darks / Lights
  "#ffffff",
  "#f8fafc",
  "#f1f5f9",
  "#e2e8f0",
  "#94a3b8",
  "#64748b",
  "#334155",
  "#1e293b",
  "#0f172a",
  "#000000",
  // Modern Vibrant Brand Colors
  "#6366f1", // Indigo
  "#4f46e5",
  "#3b82f6", // Blue
  "#2563eb",
  "#06b6d4", // Cyan
  "#0d9488", // Teal
  "#10b981", // Emerald
  "#16a34a", // Green
  "#f59e0b", // Amber
  "#d97706",
  "#f97316", // Orange
  "#ea580c",
  "#ef4444", // Red
  "#e11d48", // Rose
  "#ec4899", // Pink
  "#d946ef", // Fuchsia
  "#a855f7", // Purple
  "#8b5cf6", // Violet
];

type CellColorPickerContextType = {
  value: string | undefined;
  onChange: (color: string | undefined) => void;
  label?: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  id: string;
  fallback?: string;
};

const CellColorPickerContext = createContext<CellColorPickerContextType | null>(null);

function useCellColorPicker() {
  const context = useContext(CellColorPickerContext);
  if (!context) {
    throw new Error("CellColorPicker compound components must be used within <CellColorPicker>");
  }
  return context;
}

export type CellColorPickerProps = {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  label?: string;
  fallback?: string;
  className?: string;
  children?: ReactNode;
};

export function CellColorPicker({
  value,
  onChange,
  label,
  fallback = "#ffffff",
  className = "",
  children,
}: CellColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const contextValue: CellColorPickerContextType = {
    value,
    onChange,
    label,
    isOpen,
    setIsOpen,
    id,
    fallback,
  };

  // If no children provided, render default full layout
  const content = children ?? (
    <>
      <div className="flex items-center justify-between gap-2">
        <CellColorPicker.Label />
        <div className="flex items-center gap-1.5">
          <CellColorPicker.Trigger />
          <CellColorPicker.ValueDisplay />
        </div>
      </div>
      <CellColorPicker.Popover>
        <CellColorPicker.Swatch />
      </CellColorPicker.Popover>
    </>
  );

  return (
    <CellColorPickerContext.Provider value={contextValue}>
      <div ref={containerRef} className={`relative flex flex-col gap-1 ${className}`}>
        {content}
      </div>
    </CellColorPickerContext.Provider>
  );
}

/* Compound: Label */
CellColorPicker.Label = function CellColorPickerLabel({ className = "" }: { className?: string }) {
  const { label, id, value, onChange } = useCellColorPicker();
  if (!label) return null;

  return (
    <div className={`flex items-center justify-between text-ed-xs font-medium text-ed-text ${className}`}>
      <label htmlFor={id} className="cursor-pointer">
        {label}
      </label>
      {Boolean(value) && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="text-ed-faint hover:text-ed-text transition-colors p-0.5 rounded hover:bg-ed-subtle"
          title="Reset to default theme color"
        >
          <RotateCcw className="size-3" />
        </button>
      )}
    </div>
  );
};

/* Compound: Trigger */
CellColorPicker.Trigger = function CellColorPickerTrigger({
  className = "",
}: {
  className?: string;
}) {
  const { value, isOpen, setIsOpen, fallback } = useCellColorPicker();
  const displayColor = normalizeHexColor(value) || value || fallback;

  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={`relative size-7 shrink-0 rounded-md border border-ed-border shadow-ed-xs transition-all duration-150 hover:scale-105 hover:border-ed-border-strong focus:outline-none focus:ring-2 focus:ring-ed-accent/30 overflow-hidden ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
        backgroundSize: "8px 8px",
        backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
      }}
      aria-label="Pick color"
      aria-expanded={isOpen}
    >
      <span
        className="absolute inset-0 block w-full h-full"
        style={{ backgroundColor: displayColor }}
      />
    </button>
  );
};

/* Compound: ValueDisplay */
CellColorPicker.ValueDisplay = function CellColorPickerValueDisplay({
  className = "",
}: {
  className?: string;
}) {
  const { value, onChange, fallback, id } = useCellColorPicker();

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim();
    if (!raw) {
      onChange(undefined);
      return;
    }
    const normalized = normalizeHexColor(raw);
    if (normalized) {
      onChange(normalized);
    }
  };

  return (
    <div className="relative flex-1 min-w-0">
      <input
        id={id}
        type="text"
        value={value ?? ""}
        placeholder={fallback}
        onChange={(e) => {
          const val = e.target.value.trim();
          if (!val) {
            onChange(undefined);
            return;
          }
          // Auto-heal common typo e.g. #00F172A (extra 0) or missing hash
          if (val.length === 8 && val.startsWith("#00")) {
            const fixed = normalizeHexColor(val);
            onChange(fixed || val);
          } else {
            onChange(val);
          }
        }}
        onBlur={handleBlur}
        className={`h-7 w-full rounded-md border border-ed-border bg-ed-panel px-2 font-mono text-ed-xs text-ed-text placeholder:text-ed-faint shadow-ed-xs transition-all duration-150 hover:border-ed-border-strong focus:border-ed-accent focus:outline-none focus:ring-1 focus:ring-ed-accent/30 uppercase ${className}`}
        maxLength={16}
      />
    </div>
  );
};

/* Compound: Popover */
CellColorPicker.Popover = function CellColorPickerPopover({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  const { isOpen } = useCellColorPicker();
  if (!isOpen) return null;

  return (
    <div
      className={`absolute right-0 top-full z-50 mt-1 w-64 rounded-lg border border-ed-border bg-ed-panel p-3 shadow-xl backdrop-blur-sm animate-in fade-in zoom-in-95 duration-100 ${className}`}
      role="dialog"
      aria-label="Color Palette"
    >
      {children}
    </div>
  );
};

/* Compound: Swatch */
CellColorPicker.Swatch = function CellColorPickerSwatch({
  swatches = PRESET_SWATCHES,
  className = "",
}: {
  swatches?: string[];
  className?: string;
}) {
  const { value, onChange, fallback } = useCellColorPicker();
  const currentColor = normalizeHexColor(value) || value || fallback;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Palette Grid */}
      <div>
        <span className="mb-1.5 block text-ed-2xs font-semibold uppercase tracking-wider text-ed-faint">
          Presets
        </span>
        <div className="grid grid-cols-7 gap-1.5">
          {swatches.map((color) => {
            const isSelected = value?.toLowerCase() === color.toLowerCase();
            return (
              <button
                key={color}
                type="button"
                onClick={() => onChange(color)}
                className="group relative size-6 rounded-md border border-ed-border/60 transition-transform duration-100 hover:scale-110 focus:outline-none focus:ring-1 focus:ring-ed-accent overflow-hidden"
                style={{ backgroundColor: color }}
                title={color}
              >
                {isSelected && (
                  <Check
                    className={`absolute inset-0 m-auto size-3.5 ${
                      color === "#ffffff" || color === "#f8fafc" || color === "#f1f5f9"
                        ? "text-black"
                        : "text-white"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Spectrum HTML5 Picker & Custom Hex Input */}
      <div className="border-t border-ed-border/80 pt-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <label className="relative flex items-center gap-1.5 cursor-pointer text-ed-xs text-ed-text hover:text-ed-accent transition-colors font-medium">
            <input
              type="color"
              value={(() => {
                const norm = normalizeHexColor(value);
                return norm && norm.length === 7 ? norm : "#6366f1";
              })()}
              onChange={(e) => onChange(e.target.value.toUpperCase())}
              className="size-6 cursor-pointer rounded border-0 bg-transparent p-0 opacity-0 absolute inset-0"
            />
            <span
              className="size-5 rounded border border-ed-border block shrink-0"
              style={{ backgroundColor: currentColor }}
            />
            <span className="text-ed-xs">Custom picker</span>
          </label>
        </div>

        {Boolean(value) && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-ed-2xs text-ed-faint hover:text-ed-danger transition-colors font-medium"
          >
            Clear custom
          </button>
        )}
      </div>
    </div>
  );
};
