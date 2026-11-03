import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Layers,
  RotateCcw,
} from "lucide-react";
import type { HeroData, HeroFloatingCard } from "../../../site-kit/index.ts";
import { SiteIcon } from "../../../site-kit/primitives.tsx";
import { CheckboxField, FormGroup, TextField } from "./fields.tsx";
import { IconPickerField } from "./IconPicker.tsx";

export const DEFAULT_HERO_FLOATING_CARDS: HeroFloatingCard[] = [
  {
    title: "102°F Thermal Pool",
    subtitle: "Three hydrothermal pools",
    icon: "sparkles",
    badge: "Mineral Circuit",
    hidden: false,
    slot: 1,
  },
  {
    title: "48°F Cold Plunge",
    subtitle: "Nervous system recalibration",
    icon: "bolt",
    badge: "Nordic Contrast",
    hidden: false,
    slot: 2,
  },
  {
    title: "Vogue Spa 2026",
    subtitle: "Top Urban Sanctuary Award",
    icon: "star",
    badge: "Gold Recipient",
    hidden: false,
    slot: 3,
  },
];

const CARD_SLOT_META = [
  { slot: 1, label: "Card 1", position: "Top Left" },
  { slot: 2, label: "Card 2", position: "Middle Right" },
  { slot: 3, label: "Card 3", position: "Bottom Left" },
];

export function HeroFloatingCardsFields({
  data,
  onChange,
}: {
  data: HeroData;
  onChange: (patch: HeroData) => void;
}) {
  const [openCardIndex, setOpenCardIndex] = useState<number | null>(0);

  const showFloatingCards = data.showFloatingCards ?? true;
  const rawCards = data.floatingCards ?? DEFAULT_HERO_FLOATING_CARDS;

  // Ensure exactly 3 slots exist with defaults if missing
  const cards: HeroFloatingCard[] = [0, 1, 2].map((i) => {
    const existing = rawCards[i];
    const fallback = DEFAULT_HERO_FLOATING_CARDS[i]!;
    if (existing) {
      return {
        ...fallback,
        ...existing,
        slot: existing.slot ?? i + 1,
        hidden: Boolean(existing.hidden),
      };
    }
    return { ...fallback, slot: i + 1, hidden: false };
  });

  function updateCard(index: number, patch: Partial<HeroFloatingCard>) {
    const nextCards = cards.map((c, i) => (i === index ? { ...c, ...patch } : c));
    onChange({
      ...data,
      floatingCards: nextCards,
      showFloatingCards: true,
    });
  }

  function handleReset() {
    onChange({
      ...data,
      floatingCards: DEFAULT_HERO_FLOATING_CARDS,
      showFloatingCards: true,
    });
  }

  return (
    <FormGroup title="Floating feature cards">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between pb-1">
          <CheckboxField
            label="Show floating feature cards"
            checked={showFloatingCards}
            onChange={(checked) => onChange({ ...data, showFloatingCards: checked })}
          />
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-[11px] text-ed-muted hover:text-ed-text transition-colors cursor-pointer"
            title="Reset cards to default demo values"
          >
            <RotateCcw className="size-3" />
            <span>Reset</span>
          </button>
        </div>

        {showFloatingCards && (
          <div className="flex flex-col gap-2">
            {cards.map((card, index) => {
              const meta = CARD_SLOT_META[index] ?? { slot: index + 1, label: `Card ${index + 1}`, position: "" };
              const isOpen = openCardIndex === index;
              const isHidden = Boolean(card.hidden);

              return (
                <div
                  key={meta.slot}
                  className={`rounded-ed-lg border transition-all ${
                    isOpen
                      ? "border-ed-accent/40 bg-ed-panel shadow-xs"
                      : "border-ed-border bg-ed-panel hover:border-ed-border-strong"
                  }`}
                >
                  {/* Card Header Accordion */}
                  <div className="flex items-center justify-between p-2.5 gap-2 select-none">
                    <button
                      type="button"
                      onClick={() => setOpenCardIndex(isOpen ? null : index)}
                      className="flex-1 flex items-center gap-2 min-w-0 text-left cursor-pointer"
                    >
                      <div className="flex items-center justify-center size-6 rounded-md bg-ed-subtle border border-ed-border shrink-0 text-ed-accent">
                        {card.iconImage?.url ? (
                          <img src={card.iconImage.url} alt="" className="size-3.5 object-contain" />
                        ) : card.icon ? (
                          <SiteIcon name={card.icon} inline className="size-3.5" />
                        ) : (
                          <Layers className="size-3.5 text-ed-muted" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-ed-xs font-semibold truncate ${isHidden ? "text-ed-muted line-through" : "text-ed-text"}`}>
                            {card.title || `${meta.label}`}
                          </span>
                          {isHidden && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-ed-subtle text-ed-muted border border-ed-border">
                              Hidden
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-ed-muted truncate block">
                          {meta.position} {card.badge ? `· ${card.badge}` : ""}
                        </span>
                      </div>

                      {isOpen ? (
                        <ChevronDown className="size-3.5 text-ed-muted shrink-0" />
                      ) : (
                        <ChevronRight className="size-3.5 text-ed-muted shrink-0" />
                      )}
                    </button>

                    {/* Quick Eye Toggle for this card */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateCard(index, { hidden: !isHidden });
                      }}
                      className={`p-1.5 rounded-md transition-colors cursor-pointer shrink-0 ${
                        isHidden
                          ? "text-ed-muted hover:text-ed-text hover:bg-ed-subtle"
                          : "text-ed-accent hover:bg-ed-accent/10"
                      }`}
                      title={isHidden ? "Show this floating card" : "Hide this floating card"}
                    >
                      {isHidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </button>
                  </div>

                  {/* Expanded Edit Form */}
                  {isOpen && (
                    <div className="flex flex-col gap-3 p-3 pt-1 border-t border-ed-border/60 text-xs">
                      <div className="flex items-center justify-between pb-1">
                        <CheckboxField
                          label="Visible on website"
                          checked={!card.hidden}
                          onChange={(show) => updateCard(index, { hidden: !show })}
                        />
                        <span className="text-[11px] text-ed-muted font-mono">
                          Position: {meta.position}
                        </span>
                      </div>

                      {/* Icon selector with full library & upload */}
                      <IconPickerField
                        label="Card Icon"
                        value={card.icon}
                        imageValue={card.iconImage}
                        onChange={(val) =>
                          updateCard(index, {
                            icon: val.icon,
                            iconImage: val.iconImage,
                          })
                        }
                        hint="Pick any icon from the library or upload a custom image."
                      />

                      <TextField
                        label="Main title"
                        value={card.title}
                        onChange={(val) => updateCard(index, { title: val })}
                        placeholder="e.g. 102°F Thermal Pool"
                      />

                      <TextField
                        label="Subtitle / Description"
                        value={card.subtitle ?? ""}
                        onChange={(val) => updateCard(index, { subtitle: val })}
                        placeholder="e.g. Three hydrothermal pools"
                      />

                      <TextField
                        label="Pill badge tag (optional)"
                        value={card.badge ?? ""}
                        onChange={(val) => updateCard(index, { badge: val })}
                        placeholder="e.g. Mineral Circuit"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </FormGroup>
  );
}

