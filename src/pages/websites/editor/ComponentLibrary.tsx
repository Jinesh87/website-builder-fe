import { useMemo, useState } from "react";
import { Modal } from "@heroui/react";
import { Trash2 } from "lucide-react";
import type { SavedSection } from "../../../api/websites.ts";
import {
  SECTION_DEFINITIONS,
  SECTION_PRESETS,
  SectionView,
  themeToCssVars,
  type Section,
  type SectionCategory,
  type ThemeSettings,
} from "../../../site-kit/index.ts";

const PREVIEW_WIDTH = 1100;
const PREVIEW_SCALE = 0.3;
const SAVED = "Saved" as const;

type Category = SectionCategory | "All" | typeof SAVED;

function SectionPreview({ section, theme }: { section: Section; theme: ThemeSettings }) {
  return (
    <div className="h-40 overflow-hidden border-b border-line bg-white" aria-hidden inert>
      <div
        className="pointer-events-none origin-top-left"
        style={{ width: PREVIEW_WIDTH, transform: `scale(${PREVIEW_SCALE})` }}
      >
        <div className={`wb-site wb-buttons-${theme.buttonStyle} wb-cards-${theme.cardStyle}`} style={themeToCssVars(theme)}>
          <SectionView section={section} />
        </div>
      </div>
    </div>
  );
}

type CardProps = {
  section: Section;
  theme: ThemeSettings;
  label: string;
  description: string;
  onAdd: () => void;
  onDelete?: () => void;
};

function LibraryCard({ section, theme, label, description, onAdd, onDelete }: CardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-line transition-colors hover:border-brand has-[:focus-visible]:border-brand">
      <SectionPreview section={section} theme={theme} />
      <div className="flex flex-1 items-start gap-2 p-3">
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={onAdd}
            className="text-left text-sm font-medium text-ink outline-none after:absolute after:inset-0 group-hover:text-brand"
          >
            {label}
          </button>
          <span className="mt-0.5 block text-xs text-ink-body">{description}</span>
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete saved section ${label}`}
            title="Delete saved section"
            className="relative z-10 grid size-7 shrink-0 place-items-center rounded text-ink-muted hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}

type ComponentLibraryProps = {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeSettings;
  savedSections: SavedSection[];
  onAdd: (section: Section) => void;
  onDeleteSaved: (saved: SavedSection) => void;
};

export default function ComponentLibrary({ isOpen, onClose, theme, savedSections, onAdd, onDeleteSaved }: ComponentLibraryProps) {
  const [category, setCategory] = useState<Category>("All");
  // Built once so preview ids stay stable between renders.
  const presets = useMemo(() => SECTION_PRESETS.map((preset) => ({ preset, sample: preset.create() })), []);
  const HIDDEN_CATEGORIES = new Set<string>(["Contact", "Auth"]);
  const categories: Category[] = [
    ...(savedSections.length > 0 ? [SAVED] : []),
    "All",
    ...new Set(
      SECTION_PRESETS.map((preset) => preset.category).filter(
        (cat) => !HIDDEN_CATEGORIES.has(cat),
      ),
    ),
  ];
  const activeCategory = category === SAVED && savedSections.length === 0 ? "All" : category;
  const showSaved = activeCategory === SAVED || (activeCategory === "All" && savedSections.length > 0);
  const visiblePresets =
    activeCategory === SAVED
      ? []
      : presets.filter(
          ({ preset }) =>
            !HIDDEN_CATEGORIES.has(preset.category) &&
            (activeCategory === "All" || preset.category === activeCategory),
        );

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Container size="lg" scroll="inside">
        <Modal.Dialog className="sm:max-w-5xl" aria-label="Add a section">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>Add a section</Modal.Heading>
            <p className="text-sm text-ink-body">Pick a ready-made design. You can change all text, images, colours and layout after adding it.</p>
          </Modal.Header>
          <Modal.Body>
            <div role="group" aria-label="Section category" className="flex flex-wrap gap-1">
              {categories.map((name) => (
                <button
                  key={name}
                  type="button"
                  aria-pressed={activeCategory === name}
                  onClick={() => setCategory(name)}
                  className={`rounded-full px-3 py-1 text-sm transition-colors ${
                    activeCategory === name ? "bg-ink text-white" : "bg-canvas text-ink-body hover:text-ink"
                  }`}
                >
                  {name === SAVED ? `My saved sections (${savedSections.length})` : name}
                </button>
              ))}
            </div>

            {showSaved && (
              <section className="mt-4">
                <h3 className="text-sm font-semibold text-ink">My saved sections</h3>
                <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {savedSections.map((saved) => (
                    <LibraryCard
                      key={saved.id}
                      section={saved.section}
                      theme={theme}
                      label={saved.name}
                      description={`${SECTION_DEFINITIONS[saved.sectionType].label}${saved.isPlatform ? " · shared" : ""}`}
                      onAdd={() => onAdd({ ...structuredClone(saved.section), id: crypto.randomUUID() })}
                      onDelete={saved.isPlatform ? undefined : () => onDeleteSaved(saved)}
                    />
                  ))}
                </div>
              </section>
            )}

            {visiblePresets.length > 0 && (
              <section className="mt-4">
                {showSaved && <h3 className="mb-2 text-sm font-semibold text-ink">Ready-made sections</h3>}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {visiblePresets.map(({ preset, sample }) => (
                    <LibraryCard
                      key={preset.key}
                      section={sample}
                      theme={theme}
                      label={preset.label}
                      description={preset.description}
                      onAdd={() => onAdd(preset.create())}
                    />
                  ))}
                </div>
              </section>
            )}
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
