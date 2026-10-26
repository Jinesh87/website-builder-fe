import type {
  ButtonShape,
  CardItem,
  CardsButtonSettings,
  CardsButtonSize,
  CardsButtonVariant,
  CardsCardStyle,
  CardsCorner,
  CardsData,
  CardsHeaderLayout,
  CardsHoverEffect,
  CardsIconAlign,
  CardsIconPlacement,
  CardsIconShape,
  CardsIconSize,
  CardsIconVariant,
  CardsImageAspect,
  CardsVariant,
  GridColumns,
  IconName,
} from "../../../site-kit/index.ts";
import {
  BUTTON_RADIUS_MAX,
  CARDS_DESCRIPTION_LINES_MAX,
  CARDS_RADIUS_MAX,
} from "../../../site-kit/index.ts";
import { BUTTON_RADIUS_DEFAULT, buttonShapeRadius, clampButtonRadius } from "../../../site-kit/button-shape.ts";
import {
  CARDS_RADIUS_DEFAULT,
  CARDS_VARIANT_DEFAULTS,
  cardsCornerRadius,
  clampCardRadius,
  clampDescriptionLines,
  resolveCardsIcon,
  resolveCardsVariant,
  safeHexColor,
} from "../../../site-kit/cards-layout.ts";
import {
  CheckboxField,
  ColorField,
  CommaListField,
  FormGroup,
  ImageField,
  ItemList,
  OptionalLinkField,
  SelectField,
  TextAreaField,
  TextField,
} from "./fields.tsx";
import { cardImageSize } from "./media-dimensions.ts";
import { IconPickerField } from "./IconPicker.tsx";

type Props = { data: CardsData; onChange: (data: CardsData) => void };

const VARIANT_OPTIONS: { value: CardsVariant; label: string }[] = [
  { value: "product-classic", label: "Product classic · Image, tags, footer button" },
  { value: "floating-icon", label: "Floating icon badge · Image with seam icon badge, title & description" },
  { value: "image-overlay", label: "Image overlay · Text over full-bleed photo" },
  { value: "horizontal-split", label: "Horizontal split · Image beside content" },
  { value: "minimal-accent", label: "Minimal accent · Icon, accent bar, text-first" },
  { value: "floating-panel", label: "Floating panel · Raised panel over image" },
];

const CARD_STYLE_OPTIONS: { value: CardsCardStyle | ""; label: string }[] = [
  { value: "", label: "Design default" },
  { value: "bordered", label: "Bordered" },
  { value: "shadow", label: "Soft shadow" },
  { value: "flat", label: "Flat (tinted)" },
  { value: "glass", label: "Glass (frosted)" },
  { value: "elevated", label: "Elevated (layered shadow)" },
];

const CORNER_OPTIONS: { value: CardsCorner | ""; label: string }[] = [
  { value: "", label: "Theme default" },
  { value: "square", label: "Square" },
  { value: "soft", label: "Soft (8px)" },
  { value: "rounded", label: "Rounded (16px)" },
  { value: "large", label: "Large (28px)" },
  { value: "custom", label: "Custom radius" },
];

const BUTTON_VARIANT_OPTIONS: { value: CardsButtonVariant; label: string }[] = [
  { value: "filled", label: "Filled" },
  { value: "outline", label: "Outline" },
  { value: "soft", label: "Soft tint" },
  { value: "ghost", label: "Ghost" },
  { value: "link", label: "Text link" },
];

const BUTTON_SHAPE_OPTIONS: { value: ButtonShape | ""; label: string }[] = [
  { value: "", label: "Theme default" },
  { value: "square", label: "Square" },
  { value: "soft", label: "Soft" },
  { value: "rounded", label: "Rounded" },
  { value: "pill", label: "Pill" },
  { value: "oval", label: "Oval" },
  { value: "custom", label: "Custom radius" },
];

const BUTTON_SIZE_OPTIONS: { value: CardsButtonSize; label: string }[] = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
];

const COLUMN_OPTIONS: { value: GridColumns; label: string }[] = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
];

const ASPECT_OPTIONS: { value: CardsImageAspect; label: string }[] = [
  { value: "16:9", label: "16 : 9 (Wide)" },
  { value: "4:3", label: "4 : 3 (Classic)" },
  { value: "1:1", label: "1 : 1 (Square)" },
  { value: "3:4", label: "3 : 4 (Portrait)" },
  { value: "auto", label: "Original" },
];

const HOVER_OPTIONS: { value: CardsHoverEffect; label: string }[] = [
  { value: "none", label: "None" },
  { value: "lift", label: "Lift" },
  { value: "zoom", label: "Image zoom" },
  { value: "glow", label: "Accent glow" },
];

const HEADER_OPTIONS: { value: CardsHeaderLayout; label: string }[] = [
  { value: "left", label: "Left aligned" },
  { value: "center", label: "Centered" },
  { value: "right", label: "Right aligned" },
  { value: "split", label: "Heading left, link right" },
];

export const ICON_OPTIONS: { value: IconName | ""; label: string }[] = [
  { value: "", label: "No icon" },
  ...(
    [
      "check", "star", "bolt", "shield", "heart", "chat", "gear", "user", "mail", "phone", "chart",
      "clock", "tools", "bell", "wallet", "pointer", "help", "sparkles", "rocket", "layers", "box",
      "lock", "cloud", "code",
    ] as const
  ).map((name) => ({ value: name, label: name.charAt(0).toUpperCase() + name.slice(1) })),
];

const ICON_PLACEMENT_OPTIONS: { value: CardsIconPlacement; label: string }[] = [
  { value: "float-seam", label: "Floating seam · Overlaps image & content (Featured)" },
  { value: "inline", label: "Inline · Standard inside card content" },
  { value: "float-top", label: "Floating top · Corner badge over image" },
];

const ICON_ALIGN_OPTIONS: { value: CardsIconAlign; label: string }[] = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center / Middle" },
  { value: "right", label: "Right" },
];

const ICON_VARIANT_OPTIONS: { value: CardsIconVariant; label: string }[] = [
  { value: "filled", label: "Solid filled · Solid theme/custom badge" },
  { value: "soft", label: "Soft tint · Light pastel background" },
  { value: "outline", label: "Outlined · Bordered badge" },
  { value: "surface", label: "White / Surface · Elevated card surface" },
];

const ICON_SHAPE_OPTIONS: { value: CardsIconShape; label: string }[] = [
  { value: "rounded", label: "Rounded square (10px · like preview)" },
  { value: "square", label: "Sharp square (0px)" },
  { value: "circle", label: "Circle / Pill" },
  { value: "custom", label: "Custom radius" },
];

const ICON_SIZE_OPTIONS: { value: CardsIconSize; label: string }[] = [
  { value: "sm", label: "Small (36px)" },
  { value: "md", label: "Medium (44px · standard)" },
  { value: "lg", label: "Large (52px)" },
  { value: "xl", label: "Extra Large (60px)" },
];

function IconBadgeFields({ data, onChange }: Props) {
  const icon = resolveCardsIcon(data);
  const placement = data.iconPlacement ?? "float-seam";
  const shape = data.iconShape ?? "rounded";
  const showIcons = data.showIcons !== false;

  const set = (patch: Partial<CardsData>) => onChange({ ...data, ...patch });

  return (
    <FormGroup
      title="Floating icon & badge"
      description="Customize the floating icon badge shown on cards (like the left/middle floating icon structure)."
    >
      <div className="flex items-center justify-between pb-1">
        <CheckboxField
          label="Enable icons on cards"
          checked={showIcons}
          onChange={(v) => set({ showIcons: v })}
        />
        {/* Live Badge Preview */}
        <div className="flex items-center gap-2">
          <span className="text-ed-2xs text-ed-muted">Preview:</span>
          <div
            className="flex items-center justify-center shadow-sm"
            style={{
              width: `${Math.min(icon.boxSize, 40)}px`,
              height: `${Math.min(icon.boxSize, 40)}px`,
              borderRadius: icon.radius,
              backgroundColor:
                icon.variant === "filled"
                  ? (icon.bgColor || "var(--wb-primary, #1d4ed8)")
                  : icon.variant === "soft"
                  ? (icon.bgColor ? `${icon.bgColor}22` : "rgba(29, 78, 216, 0.14)")
                  : icon.variant === "outline"
                  ? "transparent"
                  : "#ffffff",
              border:
                icon.variant === "outline"
                  ? `2px solid ${icon.bgColor || "var(--wb-primary, #1d4ed8)"}`
                  : icon.variant === "surface"
                  ? "1px solid rgba(0,0,0,0.12)"
                  : "none",
              color:
                icon.variant === "filled"
                  ? (icon.color || "#ffffff")
                  : (icon.color || icon.bgColor || "var(--wb-primary, #1d4ed8)"),
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: `${Math.min(icon.svgSize, 20)}px`, height: `${Math.min(icon.svgSize, 20)}px` }}
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <SelectField<CardsIconPlacement>
          label="Icon placement"
          value={placement}
          options={ICON_PLACEMENT_OPTIONS}
          onChange={(value) => set({ iconPlacement: value })}
        />
        <SelectField<CardsIconAlign>
          label="Horizontal alignment"
          value={data.iconAlign ?? "left"}
          options={ICON_ALIGN_OPTIONS}
          onChange={(value) => set({ iconAlign: value })}
        />
      </div>

      <IconPickerField
        label="Default icon (applied to all cards without custom icon)"
        value={data.defaultIcon ?? ""}
        onChange={({ icon }) => set({ defaultIcon: icon || undefined })}
      />

      <div className="grid grid-cols-2 gap-2">
        <SelectField<CardsIconVariant>
          label="Badge style"
          value={data.iconVariant ?? "filled"}
          options={ICON_VARIANT_OPTIONS}
          onChange={(value) => set({ iconVariant: value })}
        />
        <SelectField<CardsIconSize>
          label="Badge size"
          value={data.iconSize ?? "md"}
          options={ICON_SIZE_OPTIONS}
          onChange={(value) => set({ iconSize: value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <SelectField<CardsIconShape>
          label="Badge shape"
          value={shape}
          options={ICON_SHAPE_OPTIONS}
          onChange={(value) =>
            set({
              iconShape: value,
              iconRadius: value === "custom" ? (data.iconRadius ?? 10) : undefined,
            })
          }
        />
        {shape === "custom" ? (
          <TextField
            label="Corner radius (0–48px)"
            type="number"
            value={String(data.iconRadius ?? 10)}
            onChange={(raw) => set({ iconRadius: Math.min(Math.max(Number.parseInt(raw, 10) || 0, 0), 48) })}
          />
        ) : (
          <TextField
            label="Vertical offset Y (px)"
            type="number"
            value={String(data.iconOffsetY ?? 0)}
            onChange={(raw) => set({ iconOffsetY: Math.min(Math.max(Number.parseInt(raw, 10) || 0, -50), 50) })}
            hint="Fine-tune float position: 0 is centered on seam"
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ItemColorField
          label="Badge background color"
          value={data.iconBgColor}
          onChange={(iconBgColor) => set({ iconBgColor })}
        />
        <ItemColorField
          label="Icon glyph color"
          value={data.iconColor}
          onChange={(iconColor) => set({ iconColor })}
        />
      </div>
    </FormGroup>
  );
}

function withButton(data: CardsData, patch: Partial<CardsButtonSettings>): CardsData {
  const next: CardsButtonSettings = { ...data.button, ...patch };
  for (const key of Object.keys(next) as (keyof CardsButtonSettings)[]) {
    if (next[key] === undefined) delete next[key];
  }
  const { button: _previous, ...rest } = data;
  return Object.keys(next).length > 0 ? { ...rest, button: next } : rest;
}

function ButtonFields({ data, onChange }: Props) {
  const variant = resolveCardsVariant(data.variant);
  const defaults = CARDS_VARIANT_DEFAULTS[variant];
  const button = data.button ?? {};
  const shape = button.shape ?? "";
  const previewRadius = buttonShapeRadius(button.shape, button.radius) ?? "8px";

  return (
    <FormGroup title="Buttons" description="Style, shape and size of every card button.">
      <div className="grid grid-cols-2 gap-2">
        <SelectField<CardsButtonVariant>
          label="Primary style"
          value={button.variant ?? defaults.button}
          options={BUTTON_VARIANT_OPTIONS}
          onChange={(value) => onChange(withButton(data, { variant: value }))}
        />
        <SelectField<CardsButtonVariant | "">
          label="Secondary style"
          value={button.secondaryVariant ?? ""}
          options={[{ value: "", label: "Automatic" }, ...BUTTON_VARIANT_OPTIONS]}
          onChange={(value) => onChange(withButton(data, { secondaryVariant: value || undefined }))}
        />
        <SelectField<ButtonShape | "">
          label="Shape"
          value={shape}
          options={BUTTON_SHAPE_OPTIONS}
          onChange={(value) =>
            onChange(
              withButton(data, {
                shape: value || undefined,
                radius:
                  value === "custom" ? (clampButtonRadius(button.radius) ?? BUTTON_RADIUS_DEFAULT) : undefined,
              }),
            )
          }
        />
        <SelectField<CardsButtonSize>
          label="Size"
          value={button.size ?? "md"}
          options={BUTTON_SIZE_OPTIONS}
          onChange={(value) => onChange(withButton(data, { size: value === "md" ? undefined : value }))}
        />
      </div>
      {shape === "custom" && (
        <TextField
          label={`Corner radius (0–${BUTTON_RADIUS_MAX}px)`}
          type="number"
          value={String(clampButtonRadius(button.radius) ?? BUTTON_RADIUS_DEFAULT)}
          onChange={(raw) => onChange(withButton(data, { radius: clampButtonRadius(Number.parseInt(raw, 10)) ?? 0 }))}
        />
      )}
      <div className="grid grid-cols-2 gap-2">
        <CheckboxField
          label="Full-width buttons"
          checked={button.fullWidth ?? defaults.fullWidth}
          onChange={(fullWidth) => onChange(withButton(data, { fullWidth }))}
        />
        <CheckboxField
          label="Show arrow icon"
          checked={button.showArrow ?? defaults.showArrow}
          onChange={(showArrow) => onChange(withButton(data, { showArrow }))}
        />
      </div>
      <div className="flex items-center gap-2" aria-hidden="true">
        <span className="text-ed-2xs text-ed-muted">Preview</span>
        <span
          className="inline-flex h-8 items-center bg-ed-accent px-5 text-ed-xs font-semibold text-white"
          style={{ borderRadius: previewRadius }}
        >
          View details
        </span>
      </div>
    </FormGroup>
  );
}

function ItemColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <ColorField
        label={label}
        value={value}
        onChange={(color) => onChange(safeHexColor(color))}
        fallback="#ffffff"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="self-end text-ed-2xs font-medium text-ed-muted hover:text-ed-text"
        >
          Reset to default
        </button>
      )}
    </div>
  );
}

export default function CardsSectionForm({ data, onChange }: Props) {
  const variant = resolveCardsVariant(data.variant);
  const defaults = CARDS_VARIANT_DEFAULTS[variant];
  const usesImages = variant !== "minimal-accent";
  const corners = data.cardCorners ?? "";
  const set = (patch: Partial<CardsData>) => onChange({ ...data, ...patch });

  return (
    <>
      <FormGroup title="Design">
        <SelectField<CardsVariant>
          label="Card design"
          value={variant}
          options={VARIANT_OPTIONS}
          onChange={(value) => set({ variant: value })}
        />
        <div className="grid grid-cols-2 gap-2">
          <SelectField<CardsCardStyle | "">
            label="Card style"
            value={data.cardStyle ?? ""}
            options={CARD_STYLE_OPTIONS}
            onChange={(value) => set({ cardStyle: value || undefined })}
          />
          <SelectField<CardsHoverEffect>
            label="Hover effect"
            value={data.hoverEffect ?? defaults.hover}
            options={HOVER_OPTIONS}
            onChange={(value) => set({ hoverEffect: value })}
          />
          <SelectField<CardsCorner | "">
            label="Card corners"
            value={corners}
            options={CORNER_OPTIONS}
            onChange={(value) =>
              set({
                cardCorners: value || undefined,
                cardRadius: value === "custom" ? (clampCardRadius(data.cardRadius) ?? CARDS_RADIUS_DEFAULT) : undefined,
              })
            }
          />
          <SelectField<"left" | "center">
            label="Text alignment"
            value={data.contentAlign ?? "left"}
            options={[
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
            ]}
            onChange={(value) => set({ contentAlign: value })}
          />
        </div>
        {corners === "custom" && (
          <TextField
            label={`Card corner radius (0–${CARDS_RADIUS_MAX}px)`}
            type="number"
            value={String(clampCardRadius(data.cardRadius) ?? CARDS_RADIUS_DEFAULT)}
            onChange={(raw) => set({ cardRadius: clampCardRadius(Number.parseInt(raw, 10)) ?? 0 })}
            hint={`Preview radius: ${cardsCornerRadius(corners, data.cardRadius) ?? "theme"}`}
          />
        )}
        {usesImages && (
          <div className="grid grid-cols-2 gap-2">
            <SelectField<CardsImageAspect>
              label="Image ratio"
              value={data.imageAspect ?? defaults.aspect}
              options={ASPECT_OPTIONS}
              onChange={(value) => set({ imageAspect: value })}
            />
            <SelectField<"cover" | "contain">
              label="Image fit"
              value={data.imageFit ?? "cover"}
              options={[
                { value: "cover", label: "Fill (crop)" },
                { value: "contain", label: "Fit (no crop)" },
              ]}
              onChange={(value) => set({ imageFit: value })}
            />
          </div>
        )}
        {variant === "horizontal-split" && (
          <SelectField<"left" | "right">
            label="Image side"
            value={data.imagePosition ?? "left"}
            options={[
              { value: "left", label: "Image left" },
              { value: "right", label: "Image right" },
            ]}
            onChange={(value) => set({ imagePosition: value })}
          />
        )}
        <TextField
          label={`Description lines (0 = full text, max ${CARDS_DESCRIPTION_LINES_MAX})`}
          type="number"
          value={String(clampDescriptionLines(data.descriptionLines, defaults.descriptionLines))}
          onChange={(raw) =>
            set({ descriptionLines: clampDescriptionLines(Number.parseInt(raw, 10), defaults.descriptionLines) })
          }
        />
      </FormGroup>

      <IconBadgeFields data={data} onChange={onChange} />

      <FormGroup title="Layout & responsive">
        <div className="grid grid-cols-3 gap-2">
          <SelectField<GridColumns>
            label="Desktop"
            value={data.columns}
            options={COLUMN_OPTIONS}
            onChange={(columns) => set({ columns })}
          />
          <SelectField<GridColumns>
            label="Tablet"
            value={data.tabletColumns ?? (Math.min(2, data.columns) as GridColumns)}
            options={COLUMN_OPTIONS}
            onChange={(tabletColumns) => set({ tabletColumns })}
          />
          <SelectField<GridColumns>
            label="Mobile"
            value={data.mobileColumns}
            options={COLUMN_OPTIONS.slice(0, 2)}
            onChange={(mobileColumns) => set({ mobileColumns })}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <SelectField<"stack" | "scroll">
            label="On phones"
            value={data.mobileLayout ?? "stack"}
            options={[
              { value: "stack", label: "Stack in grid" },
              { value: "scroll", label: "Swipe carousel" },
            ]}
            onChange={(mobileLayout) => set({ mobileLayout })}
          />
          <SelectField<"sm" | "md" | "lg">
            label="Spacing between cards"
            value={data.gap ?? "md"}
            options={[
              { value: "sm", label: "Tight" },
              { value: "md", label: "Normal" },
              { value: "lg", label: "Roomy" },
            ]}
            onChange={(gap) => set({ gap })}
          />
        </div>
        <CheckboxField
          label="Make the whole card clickable"
          checked={data.clickableCards === true}
          onChange={(clickableCards) => set({ clickableCards })}
          hint="Opens each card's primary button link."
        />
      </FormGroup>

      <FormGroup title="Header">
        <SelectField<CardsHeaderLayout>
          label="Header layout"
          value={data.headerLayout ?? "center"}
          options={HEADER_OPTIONS}
          onChange={(headerLayout) => set({ headerLayout })}
        />
        <TextField
          label="Eyebrow (optional)"
          value={data.eyebrow ?? ""}
          onChange={(eyebrow) => set({ eyebrow: eyebrow || undefined })}
          maxLength={100}
        />
        <TextField label="Heading" value={data.heading} onChange={(heading) => set({ heading })} maxLength={200} />
        <TextAreaField
          label="Intro (optional)"
          value={data.intro ?? ""}
          onChange={(intro) => set({ intro: intro || undefined })}
          maxLength={500}
        />
        <OptionalLinkField
          label="Header link"
          value={data.headerLink}
          onChange={(headerLink) => set({ headerLink })}
          fallback={{ label: "View all", href: "/products" }}
        />
        <OptionalLinkField
          label="Bottom button"
          value={data.bottomCta}
          onChange={(bottomCta) => set({ bottomCta })}
          fallback={{ label: "See everything", href: "/products" }}
        />
      </FormGroup>

      <ButtonFields data={data} onChange={onChange} />

      <FormGroup title="Display options">
        <div className="grid grid-cols-2 gap-2">
          {usesImages && (
            <CheckboxField label="Images" checked={data.showImages !== false} onChange={(v) => set({ showImages: v })} />
          )}
          <CheckboxField label="Icons" checked={data.showIcons !== false} onChange={(v) => set({ showIcons: v })} />
          <CheckboxField label="Badges" checked={data.showBadges !== false} onChange={(v) => set({ showBadges: v })} />
          <CheckboxField label="Tags" checked={data.showTags !== false} onChange={(v) => set({ showTags: v })} />
          <CheckboxField
            label="Descriptions"
            checked={data.showDescription !== false}
            onChange={(v) => set({ showDescription: v })}
          />
          <CheckboxField label="Prices" checked={data.showPrices !== false} onChange={(v) => set({ showPrices: v })} />
          <CheckboxField label="01, 02 numbers" checked={data.showNumbers === true} onChange={(v) => set({ showNumbers: v })} />
        </div>
      </FormGroup>

      <FormGroup title="Cards">
        <ItemList<CardItem>
          label="Cards"
          items={data.items}
          max={24}
          onChange={(items) => set({ items })}
          create={() => ({
            title: "New card",
            description: "Describe what makes this item worth a click.",
            icon: "check",
            tags: ["Tag"],
            link: { label: "View details", href: "/contact" },
          })}
          itemTitle={(item) => item.title}
          addLabel="Add card"
          renderItem={(item, update) => (
            <>
              <CheckboxField
                label="Featured (highlighted)"
                checked={item.featured === true}
                onChange={(featured) => update({ ...item, featured: featured || undefined })}
                hint={variant === "floating-panel" ? "Spans two columns when the grid has 3 or more." : undefined}
              />
              <TextField
                label="Title"
                value={item.title}
                onChange={(title) => update({ ...item, title })}
                maxLength={120}
                required
              />
              <TextField
                label="Subtitle (optional)"
                value={item.subtitle ?? ""}
                onChange={(subtitle) => update({ ...item, subtitle: subtitle || undefined })}
                maxLength={120}
              />
              <TextAreaField
                label="Description"
                value={item.description ?? ""}
                onChange={(description) => update({ ...item, description: description || undefined })}
                maxLength={800}
              />
              {usesImages && (
                <ImageField
                  label="Image"
                  value={item.image}
                  onChange={(image) => update({ ...item, image })}
                  optional
                  dimensionHint={cardImageSize(data.imageAspect ?? defaults.aspect)}
                />
              )}
              <div className="grid grid-cols-2 gap-2">
                <TextField
                  label="Badge (optional)"
                  value={item.badge ?? ""}
                  onChange={(badge) => update({ ...item, badge: badge || undefined })}
                  maxLength={30}
                />
                <TextField
                  label="Price (optional)"
                  value={item.price ?? ""}
                  onChange={(price) => update({ ...item, price: price || undefined })}
                  maxLength={50}
                />
              </div>
              <IconPickerField
                label="Icon"
                value={(item.icon as string | undefined) ?? ""}
                imageValue={item.iconImage}
                onChange={({ icon, iconImage }) =>
                  update({ ...item, icon, iconImage })
                }
              />
              <div className="grid grid-cols-2 gap-2">
                <ItemColorField
                  label="Card icon background"
                  value={item.iconBgColor}
                  onChange={(iconBgColor) => update({ ...item, iconBgColor })}
                />
                <ItemColorField
                  label="Card icon color"
                  value={item.iconColor}
                  onChange={(iconColor) => update({ ...item, iconColor })}
                />
              </div>
              <CommaListField
                label="Tags (comma separated)"
                value={item.tags ?? []}
                onChange={(tags) => update({ ...item, tags: tags.length > 0 ? tags.slice(0, 8) : undefined })}
                maxLength={300}
              />
              <div className="flex flex-col gap-2.5">
                <ItemColorField
                  label="Card background"
                  value={item.backgroundColor}
                  onChange={(backgroundColor) => update({ ...item, backgroundColor })}
                />
                <ItemColorField
                  label="Accent colour"
                  value={item.accentColor}
                  onChange={(accentColor) => update({ ...item, accentColor })}
                />
              </div>
              <OptionalLinkField
                label="Primary button"
                value={item.link}
                onChange={(link) => update({ ...item, link })}
                fallback={{ label: "View details", href: "/contact" }}
              />
              <OptionalLinkField
                label="Secondary button"
                value={item.secondaryLink}
                onChange={(secondaryLink) => update({ ...item, secondaryLink })}
                fallback={{ label: "Learn more", href: "#" }}
              />
            </>
          )}
        />
      </FormGroup>
    </>
  );
}
