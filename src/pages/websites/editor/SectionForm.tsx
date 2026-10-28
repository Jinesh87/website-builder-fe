import type {
  CarouselCardStyle,
  CarouselData,
  CarouselSlide,
  CarouselVariant,
  ContactCardStyle,
  ContactChannel,
  ContactData,
  ContactVariant,
  CtaCardStyle,
  CtaData,
  CtaVariant,
  FaqCardStyle,
  FaqData,
  FaqItem,
  FaqVariant,
  FeaturesData,
  FontKey,
  GalleryData,
  GridColumns,
  HeroCampaignStat,
  HeroData,
  IconName,
  LogosData,
  MarqueeData,
  MarqueeItem,
  MarqueeVariant,
  MediaData,
  PricingCardStyle,
  PricingData,
  PricingPlan,
  PricingVariant,
  Section,
  SectionAlign,
  SectionBackground,
  SectionSettings,
  SectionSpacing,
  SectionType,
  ServiceItem,
  ProductDetailData,
  ProductsData,
  ServicesData,
  ServicesVariant,
  SplitData,
  StatsData,
  TeamCardStyle,
  TeamData,
  TeamMember,
  TeamSocialLink,
  TeamVariant,
  TestimonialsCardStyle,
  TestimonialsData,
  TestimonialItem,
  TestimonialsVariant,
  TextData,
} from "../../../site-kit/index.ts";
import {
  CheckboxField,
  ColorField,
  CompactColorField,
  CommaListField,
  FormGroup,
  ImageField,
  ItemList,
  LinkField,
  OptionalLinkField,
  SelectField,
  TextAreaField,
  TextField,
  VideoField,
} from "./fields.tsx";
import { FontPicker } from "./FontPicker.tsx";
import { HeroAlignmentGroup, HeroButtonShapeGroup } from "./HeroLayoutFields.tsx";
import { cardImageSize, heroImageSize, MEDIA_HINT, MEDIA_SIZE, wideImageSize } from "./media-dimensions.ts";
import CustomSectionForm from "./CustomSectionForm.tsx";
import { ContactFormFieldsEditor, ContactLayoutEditor } from "./ContactBuilderFields.tsx";
import { createContactLayout, layoutHasForm, resolveContactLayout } from "../../../site-kit/contact-builder.ts";
import AuthSectionForm from "./AuthSectionForm.tsx";
import CardsSectionForm from "./CardsSectionForm.tsx";
import { BlogDetailForm, BlogForm } from "./BlogSectionForms.tsx";
import { IconPickerField } from "./IconPicker.tsx";
import { Bold, Italic } from "lucide-react";
import { isVintageHero, VintageHeroFields } from "./VintageHeroFields.tsx";
import ClapperContactFields from "./ClapperContactFields.tsx";

type DataFormProps<T> = { data: T; onChange: (data: T) => void };

const COLUMN_OPTIONS: { value: GridColumns; label: string }[] = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
];

export const ICON_OPTIONS: { value: IconName | ""; label: string }[] = [
  { value: "", label: "No icon" },
  { value: "gear", label: "Settings / Gear ⚙️" },
  { value: "user", label: "User / Profile 👤" },
  { value: "mail", label: "Mail / Contact ✉️" },
  { value: "phone", label: "Phone / Callback 📞" },
  { value: "chart", label: "Chart / Analytics 📊" },
  { value: "clock", label: "Clock / Real-time ⏱️" },
  { value: "tools", label: "Tools / Wrench 🛠️" },
  { value: "bell", label: "Bell / Notification 🔔" },
  { value: "wallet", label: "Wallet / Cost 💳" },
  { value: "pointer", label: "Pointer / Interactive 👆" },
  { value: "help", label: "Help / Support ❓" },
  { value: "sparkles", label: "Sparkles / AI ✨" },
  { value: "rocket", label: "Rocket / Speed 🚀" },
  { value: "layers", label: "Layers / Stack 🥞" },
  { value: "box", label: "Box / Package 📦" },
  { value: "lock", label: "Lock / Security 🔒" },
  { value: "cloud", label: "Cloud / Sync ☁️" },
  { value: "code", label: "Code / API 💻" },
  { value: "check", label: "Checkmark ✓" },
  { value: "star", label: "Star ★" },
  { value: "bolt", label: "Lightning ⚡" },
  { value: "shield", label: "Shield 🛡️" },
  { value: "heart", label: "Heart ❤️" },
  { value: "chat", label: "Chat 💬" },
];

const FEATURE_COLOR_OPTIONS = [
  { value: "default", label: "Auto (Palette cycled)" },
  { value: "none", label: "None / Neutral (No color tint)" },
  { value: "gray", label: "Gray / Slate" },
  { value: "orange", label: "Orange" },
  { value: "green", label: "Green" },
  { value: "blue", label: "Blue" },
  { value: "yellow", label: "Yellow" },
  { value: "cyan", label: "Cyan" },
  { value: "purple", label: "Purple" },
  { value: "pink", label: "Pink" },
  { value: "indigo", label: "Indigo" },
  { value: "red", label: "Red" },
];

const NAMED_FEATURE_COLOR_TO_HEX: Record<string, string> = {
  gray: "#64748b",
  orange: "#f97316",
  green: "#10b981",
  blue: "#3b82f6",
  yellow: "#eab308",
  cyan: "#06b6d4",
  purple: "#a855f7",
  pink: "#ec4899",
  indigo: "#6366f1",
  red: "#ef4444",
  none: "#94a3b8",
};

const FEATURE_CARD_BG_PRESETS = [
  { value: "", label: "Default section theme" },
  { value: "#ffffff", label: "Pure White (#ffffff)" },
  { value: "#f8fafc", label: "Light Slate (#f8fafc)" },
  { value: "#f1f5f9", label: "Soft Gray (#f1f5f9)" },
  { value: "#fff7ed", label: "Soft Orange tint (#fff7ed)" },
  { value: "#f0fdf4", label: "Soft Green tint (#f0fdf4)" },
  { value: "#eff6ff", label: "Soft Blue tint (#eff6ff)" },
  { value: "#fefce8", label: "Soft Yellow tint (#fefce8)" },
  { value: "#faf5ff", label: "Soft Purple tint (#faf5ff)" },
  { value: "#fdf2f8", label: "Soft Pink tint (#fdf2f8)" },
  { value: "#0f172a", label: "Dark Slate (#0f172a)" },
];

const FEATURE_ICON_BG_PRESETS = [
  { value: "", label: "Auto / Default" },
  { value: "rgba(255, 255, 255, 0.15)", label: "Translucent White (Glass / Overlay)" },
  { value: "rgba(255, 255, 255, 0.25)", label: "Semi-opaque White" },
  { value: "#ffffff", label: "Pure White (#ffffff)" },
  { value: "#f8fafc", label: "Light Slate (#f8fafc)" },
  { value: "#f1f5f9", label: "Soft Light Gray (#f1f5f9)" },
  { value: "#eff6ff", label: "Soft Blue Tint (#eff6ff)" },
  { value: "#1e40af", label: "Deep Blue (#1e40af)" },
  { value: "#0f172a", label: "Dark Slate (#0f172a)" },
  { value: "rgba(0, 0, 0, 0.06)", label: "Subtle Dark Tint" },
];

const BACKGROUND_OPTIONS: { value: SectionBackground; label: string }[] = [
  { value: "default", label: "Page background" },
  { value: "surface", label: "Tinted" },
  { value: "primary", label: "Primary colour" },
  { value: "dark", label: "Dark" },
];

const SPACING_OPTIONS: { value: SectionSpacing; label: string }[] = [
  { value: "default", label: "Theme default" },
  { value: "none", label: "None" },
  { value: "compact", label: "Compact" },
  { value: "relaxed", label: "Relaxed" },
];

const ALIGN_OPTIONS: { value: SectionAlign; label: string }[] = [
  { value: "left", label: "Left aligned" },
  { value: "center", label: "Centered" },
  { value: "right", label: "Right aligned" },
];

const CONTAINER_WIDTH_OPTIONS: { value: string; label: string }[] = [
  { value: "default", label: "Default (Theme container ~1200px)" },
  { value: "narrow", label: "Narrow / Compact (768px)" },
  { value: "medium", label: "Medium (1024px)" },
  { value: "wide", label: "Wide (1400px)" },
  { value: "full", label: "Full Width (100% fluid)" },
  { value: "custom", label: "Custom width (px or %)..." },
];

const HEADING_WEIGHT_OPTIONS: { value: string; label: string }[] = [
  { value: "default", label: "Theme default (Bold 700)" },
  { value: "300", label: "Light (300)" },
  { value: "400", label: "Regular / Normal (400)" },
  { value: "500", label: "Medium (500)" },
  { value: "600", label: "Semi-Bold (600)" },
  { value: "700", label: "Bold (700)" },
  { value: "800", label: "Extra Bold (800)" },
  { value: "900", label: "Black / Heavy (900)" },
];

const BODY_WEIGHT_OPTIONS: { value: string; label: string }[] = [
  { value: "default", label: "Theme default (Regular 400)" },
  { value: "300", label: "Light (300)" },
  { value: "400", label: "Regular / Normal (400)" },
  { value: "500", label: "Medium (500)" },
  { value: "600", label: "Semi-Bold (600)" },
  { value: "700", label: "Bold (700)" },
];

const FONT_SIZE_OPTIONS: { value: string; label: string }[] = [
  { value: "default", label: "Default (Theme size 100%)" },
  { value: "small", label: "Compact / Small (88%)" },
  { value: "medium", label: "Medium / Balanced (108%)" },
  { value: "large", label: "Large / Prominent (122%)" },
  { value: "huge", label: "Extra Large / Display (138%)" },
  { value: "75%", label: "75% Scale (Very compact)" },
  { value: "85%", label: "85% Scale" },
  { value: "95%", label: "95% Scale" },
  { value: "105%", label: "105% Scale" },
  { value: "115%", label: "115% Scale" },
  { value: "125%", label: "125% Scale" },
  { value: "135%", label: "135% Scale" },
  { value: "150%", label: "150% Scale (Dramatic display)" },
  { value: "custom", label: "Custom pixel / scale…" },
];

const HEADING_SIZE_OPTIONS: { value: string; label: string }[] = [
  { value: "default", label: "Auto (Follow section size)" },
  { value: "small", label: "Preset: Small / Compact" },
  { value: "medium", label: "Preset: Medium / Balanced" },
  { value: "large", label: "Preset: Large / Prominent" },
  { value: "huge", label: "Preset: Huge / Display headline" },
  { value: "18px", label: "18px (Compact subhead)" },
  { value: "20px", label: "20px" },
  { value: "22px", label: "22px" },
  { value: "24px", label: "24px (Card / section title)" },
  { value: "26px", label: "26px" },
  { value: "28px", label: "28px" },
  { value: "30px", label: "30px" },
  { value: "32px", label: "32px (Medium h2)" },
  { value: "34px", label: "34px" },
  { value: "36px", label: "36px" },
  { value: "40px", label: "40px (Impact title)" },
  { value: "44px", label: "44px" },
  { value: "48px", label: "48px (Hero h1 standard)" },
  { value: "52px", label: "52px" },
  { value: "56px", label: "56px (Hero h1 prominent)" },
  { value: "60px", label: "60px" },
  { value: "64px", label: "64px (Large hero)" },
  { value: "72px", label: "72px (Huge headline)" },
  { value: "80px", label: "80px" },
  { value: "96px", label: "96px (Billboard display)" },
  { value: "custom", label: "Custom pixel size…" },
];

const BODY_SIZE_OPTIONS: { value: string; label: string }[] = [
  { value: "default", label: "Auto (Follow section size)" },
  { value: "small", label: "Preset: Small (13px - 14px)" },
  { value: "medium", label: "Preset: Medium (15px - 16px)" },
  { value: "large", label: "Preset: Large (17px - 18px)" },
  { value: "huge", label: "Preset: Extra Large (19px - 20px)" },
  { value: "11px", label: "11px (Tiny text / badge)" },
  { value: "12px", label: "12px (Small caption)" },
  { value: "13px", label: "13px (Compact body)" },
  { value: "14px", label: "14px (Standard UI)" },
  { value: "15px", label: "15px (Standard reading)" },
  { value: "16px", label: "16px (Comfortable body)" },
  { value: "17px", label: "17px (Editorial body)" },
  { value: "18px", label: "18px (Prominent text)" },
  { value: "19px", label: "19px" },
  { value: "20px", label: "20px (Lead paragraph)" },
  { value: "22px", label: "22px" },
  { value: "24px", label: "24px (Large lead)" },
  { value: "custom", label: "Custom pixel size…" },
];

const ANCHOR_PATTERN = /^[a-z][a-z0-9-]{0,39}$/;

/** Short repeatable text lines such as bullets or plan features. */
function StringList({
  label,
  items,
  max,
  onChange,
  addLabel,
}: {
  label: string;
  items: string[];
  max: number;
  onChange: (items: string[]) => void;
  addLabel: string;
}) {
  return (
    <ItemList<string>
      label={label}
      items={items}
      max={max}
      onChange={onChange}
      create={() => "New item"}
      itemTitle={(item) => item}
      addLabel={addLabel}
      renderItem={(item, update) => (
        <TextField
          label="Text"
          value={item}
          onChange={update}
          maxLength={200}
          required
        />
      )}
    />
  );
}

function ColumnsFields<
  T extends { columns: GridColumns; mobileColumns: GridColumns },
>({ data, onChange }: DataFormProps<T>) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <SelectField
        label="Columns"
        value={data.columns}
        options={COLUMN_OPTIONS}
        onChange={(columns) => onChange({ ...data, columns })}
      />
      <SelectField
        label="On mobile"
        value={data.mobileColumns}
        options={COLUMN_OPTIONS.slice(0, 2)}
        onChange={(mobileColumns) => onChange({ ...data, mobileColumns })}
      />
    </div>
  );
}

const DEFAULT_HERO_CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    title: "Cliffside Explorer",
    subtitle: "@marco_travels",
    badge: "Travel",
    image: {
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&h=1050&q=85",
      alt: "Person sitting on rocky coastal cliffs looking at azure sea",
    },
  },
  {
    title: "Aesthetic Wellness",
    subtitle: "@glow_studios",
    badge: "Beauty",
    image: {
      url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=700&h=1050&q=85",
      alt: "Person receiving relaxing aesthetic foam facial skincare treatment",
    },
  },
  {
    title: "Vibrant Harvest",
    subtitle: "@citrus_kitchen",
    badge: "Food & Drink",
    image: {
      url: "https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&w=700&h=1050&q=85",
      alt: "Sliced grapefruits and fresh lemons on rustic board",
    },
  },
  {
    title: "Morning Routine",
    subtitle: "@nourish_daily",
    badge: "Lifestyle",
    image: {
      url: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=700&h=1050&q=85",
      alt: "Smiling woman enjoying fresh smoothie bowl with spoon",
    },
  },
  {
    title: "Night Highway",
    subtitle: "@riders_journal",
    badge: "Automotive",
    image: {
      url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=700&h=1050&q=85",
      alt: "Motorcyclist cruising through bridge highway with headlights",
    },
  },
  {
    title: "Artisan Refresh",
    subtitle: "@fresh_press",
    badge: "Culinary",
    image: {
      url: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=700&h=1050&q=85",
      alt: "Hands pouring fresh squeezed orange juice into a glass jar",
    },
  },
  {
    title: "Golden Hour Studio",
    subtitle: "@sarah_creates",
    badge: "Creator",
    image: {
      url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&h=1050&q=85",
      alt: "Creator in studio setting with warm cinematic lighting",
    },
  },
  {
    title: "Urban Motion",
    subtitle: "@tokyo_street",
    badge: "Fashion",
    image: {
      url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=700&h=1050&q=85",
      alt: "Traveler standing near scenic landscape overlooking vista",
    },
  },
];

const DEFAULT_CAMPAIGN_STATS: HeroCampaignStat[] = [
  { label: "Active Members", value: "12,450", icon: "users" },
  { label: "Milestones Hit", value: "320+", icon: "pin" },
];

function HeroForm({ data, onChange }: DataFormProps<HeroData>) {
  if (isVintageHero(data)) {
    return <VintageHeroFields data={data} onChange={onChange} />;
  }

  const mediaPosition =
    data.imagePosition ??
    (data.variant === "split"
      ? "right"
      : data.variant === "split-left"
        ? "left"
        : data.variant === "background-image" || data.variant === "video-bg"
          ? "background"
          : "bottom");
  const trustedBy = data.trustedBy ?? {};
  const updateTrustedBy = (
    patch: Partial<NonNullable<HeroData["trustedBy"]>>,
  ) => {
    onChange({ ...data, trustedBy: { ...trustedBy, ...patch } });
  };

  return (
    <>
      <FormGroup title="Hero style & layout">
        <SelectField
          label="Hero design style"
          value={data.variant === "split-left" ? "split" : data.variant}
          options={[
            {
              value: "campaign-banner",
              label:
                "Interactive Video Banner (Full-bleed media, bottom shape divider, stats & milestone tracker)",
            },
            {
              value: "centered",
              label: "Centered (Heading, dual CTAs, visual showcase)",
            },
            {
              value: "curved-carousel",
              label:
                "3D Curved Video Reel Banner (Exact Arc Carousel & Doodles)",
            },
            {
              value: "split",
              label: "Split screen (Side-by-side headline & media mockup)",
            },
            {
              value: "gradient",
              label: "Vibrant gradient (Mesh glow & trusted logos)",
            },
            {
              value: "soft-card",
              label: "Soft card showcase (Elevated container card)",
            },
            {
              value: "floating-cards",
              label: "Floating feature cards (Interactive cards & metrics)",
            },
            {
              value: "curved-bottom",
              label: "Curved wave bottom (Smooth SVG wave divider)",
            },
            {
              value: "minimal-typography",
              label: "Minimal bold typography (Oversized headline)",
            },
            {
              value: "asymmetric",
              label: "Asymmetric layout (Modern angled mockup)",
            },
            {
              value: "background-image",
              label: "Background image overlay (Full atmosphere)",
            },
            {
              value: "video-bg",
              label: "Video background & demo (Cinematic video player)",
            },
            {
              value: "vintage-editorial",
              label:
                "Vintage Editorial (Old soul, new stories, newspaper strip & polaroid stack)",
            },
            {
              value: "vintage-sunburst",
              label:
                "Vintage Sunburst Nostalgia (Radiating ray banner, white shadow title & circular portrait)",
            },
          ]}
          onChange={(variant) =>
            onChange({ ...data, variant: variant as HeroData["variant"] })
          }
        />
        {(data.variant === "split" ||
          data.variant === "split-left" ||
          data.imagePosition === "left" ||
          data.imagePosition === "right") && (
          <SelectField
            label="Media position (Left / Right)"
            value={
              data.variant === "split-left" || data.imagePosition === "left"
                ? "left"
                : "right"
            }
            options={[
              {
                value: "right",
                label: "Right side (Headline on left, mockup on right)",
              },
              {
                value: "left",
                label: "Left side (Mockup on left, headline on right)",
              },
            ]}
            onChange={(side) =>
              onChange({
                ...data,
                variant: side === "left" ? "split-left" : "split",
                imagePosition: side as "left" | "right",
              })
            }
            hint="Switch mockup and visual placement between the left and right side."
          />
        )}
        <SelectField
          label="Section height"
          value={data.minHeight ?? "auto"}
          options={[
            { value: "auto", label: "Auto (Follow content & padding)" },
            { value: "screen", label: "Full screen (100vh viewport height)" },
            { value: "tall", label: "Tall (700px spacious)" },
            { value: "compact", label: "Compact (Minimal vertical padding)" },
          ]}
          onChange={(minHeight) =>
            onChange({ ...data, minHeight: minHeight as HeroData["minHeight"] })
          }
        />
        {data.variant !== "campaign-banner" && (
          <SelectField
            label="Bottom shape divider"
            value={data.bottomShape ?? "none"}
            options={[
              { value: "none", label: "None (Straight border)" },
              { value: "wave", label: "Smooth wave" },
              { value: "curve", label: "Convex curve" },
              { value: "slant", label: "Angled slant" },
              { value: "tilt", label: "Gentle tilt" },
            ]}
            onChange={(bottomShape) =>
              onChange({
                ...data,
                bottomShape: bottomShape as HeroData["bottomShape"],
              })
            }
          />
        )}
      </FormGroup>

      <HeroAlignmentGroup data={data} onChange={onChange} />

      {data.variant === "curved-carousel" && (
        <FormGroup title="3D Carousel Settings">
          <SelectField
            label="Scroll direction"
            value={data.carouselDirection || "left-to-right"}
            options={[
              {
                value: "left-to-right",
                label: "Left to Right (Continuous Loop)",
              },
              {
                value: "right-to-left",
                label: "Right to Left (Continuous Loop)",
              },
            ]}
            onChange={(dir) =>
              onChange({
                ...data,
                carouselDirection: dir as "left-to-right" | "right-to-left",
              })
            }
          />
          <SelectField
            label="Scroll speed"
            value={String(data.carouselSpeed ?? 45)}
            options={[
              { value: "28", label: "Slow (Relaxed)" },
              { value: "45", label: "Medium (Standard smooth)" },
              { value: "68", label: "Fast (Dynamic motion)" },
            ]}
            onChange={(spd) =>
              onChange({
                ...data,
                carouselSpeed: Number(spd),
              })
            }
          />
          <SelectField
            label="Curve intensity"
            value={data.curveIntensity || "medium"}
            options={[
              { value: "subtle", label: "Subtle (Gentle tilt)" },
              { value: "medium", label: "Medium (Realistic 3D cylinder arc)" },
              {
                value: "dramatic",
                label: "Dramatic (Deep panoramic amphitheater)",
              },
              { value: "none", label: "None (Flat linear reel)" },
            ]}
            onChange={(curve) =>
              onChange({
                ...data,
                curveIntensity: curve as
                  "none" | "subtle" | "medium" | "dramatic",
              })
            }
          />
        </FormGroup>
      )}

      {data.variant === "campaign-banner" && (
        <>
          <FormGroup title="Video Banner Layout & Bottom Edge">
            <SelectField
              label="Bottom shape divider"
              value={
                data.bannerBottomShape === "curved" ||
                data.bottomShape === "curve" ||
                data.bottomShape === "curved"
                  ? "curved"
                  : (data.bannerBottomShape ??
                    (data.bottomShape as string) ??
                    "curved")
              }
              options={[
                {
                  value: "curved",
                  label: "Curved concave arc (Smooth scooped curve)",
                },
                { value: "arch", label: "Convex inverted arch" },
                { value: "wave", label: "Smooth fluid wave" },
                { value: "slant", label: "Angled slant" },
                { value: "tilt", label: "Gentle tilt" },
                { value: "none", label: "None (Straight flat border)" },
              ]}
              onChange={(shape) =>
                onChange({
                  ...data,
                  bannerBottomShape: shape as HeroData["bannerBottomShape"],
                  bottomShape: (shape === "curved" || shape === "arch"
                    ? "curve"
                    : shape === "normal" || shape === "none"
                      ? "none"
                      : shape) as HeroData["bottomShape"],
                })
              }
              hint="Controls the bottom cutout curve or divider under the video banner."
            />
            <TextField
              label="Curve depth / height (pixels)"
              type="number"
              value={String(data.bannerCurveDepth ?? 80)}
              onChange={(depth) =>
                onChange({
                  ...data,
                  bannerCurveDepth: Math.max(0, parseInt(depth, 10) || 0),
                })
              }
              placeholder="80"
              hint="Adjustable curvature height in pixels (e.g. 40 subtle, 80 standard, 120 dramatic)."
            />
            <TextField
              label="Bottom divider background color"
              value={
                data.bottomDividerColor === "#70c4d4"
                  ? ""
                  : (data.bottomDividerColor ?? "")
              }
              onChange={(color) =>
                onChange({ ...data, bottomDividerColor: color || undefined })
              }
              placeholder="var(--wb-bg, #ffffff)"
              hint="Color for backdrop below the banner (defaults to page white var(--wb-bg, #ffffff))."
            />
            <VideoField
              label="Background video URL (MP4 / WebM / Direct link)"
              value={data.backgroundVideoUrl ?? data.videoUrl ?? ""}
              onChange={(videoUrl) =>
                onChange({
                  ...data,
                  backgroundVideoUrl: videoUrl || undefined,
                  videoUrl: videoUrl || undefined,
                })
              }
              placeholder="/bannervid.mp4"
              dimensionHint={MEDIA_SIZE.fullBleed}
              hint={`High definition looping background video that plays continuously behind the banner. ${MEDIA_HINT.fullBleedVideo}`}
            />
            <div className="flex flex-wrap items-center gap-1.5 -mt-1 mb-2">
              <span className="text-xs text-slate-500 font-medium mr-1">
                Videos:
              </span>
              <button
                type="button"
                className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-300 transition"
                onClick={() => {
                  onChange({
                    ...data,
                    backgroundVideoUrl: "/bannervid.mp4",
                    videoUrl: "/bannervid.mp4",
                  });
                }}
              >
                🎬 Local /bannervid.mp4
              </button>
              <button
                type="button"
                className="px-2 py-0.5 text-xs font-medium rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                onClick={() => {
                  const url =
                    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4";
                  onChange({
                    ...data,
                    backgroundVideoUrl: url,
                    videoUrl: url,
                  });
                }}
              >
                🌊 Scenic Escapes
              </button>
              <button
                type="button"
                className="px-2 py-0.5 text-xs font-medium rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                onClick={() => {
                  const url =
                    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
                  onChange({
                    ...data,
                    backgroundVideoUrl: url,
                    videoUrl: url,
                  });
                }}
              >
                🔥 Dynamic Demo
              </button>
              <button
                type="button"
                className="px-2 py-0.5 text-xs font-medium rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                onClick={() => {
                  const url =
                    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
                  onChange({
                    ...data,
                    backgroundVideoUrl: url,
                    videoUrl: url,
                  });
                }}
              >
                🎬 Nature Clip
              </button>
            </div>
            <ImageField
              label="Banner fallback / poster image"
              value={data.backgroundImage ?? data.image}
              onChange={(backgroundImage) =>
                onChange({
                  ...data,
                  backgroundImage,
                  image: backgroundImage,
                })
              }
              optional
              dimensionHint={MEDIA_SIZE.fullBleed}
              hint="Shown while the video loads and when it can't play. Use a frame from the video."
            />
            <SelectField
              label="Background overlay style"
              value={data.bgOverlayType ?? "dark"}
              options={[
                {
                  value: "dark",
                  label: "Dark tint (Optimal for text readability)",
                },
                { value: "gradient", label: "Gradient fade (Top to bottom)" },
                { value: "light", label: "Light tint" },
                { value: "none", label: "No overlay (Raw video)" },
              ]}
              onChange={(bgOverlayType) =>
                onChange({
                  ...data,
                  bgOverlayType: bgOverlayType as HeroData["bgOverlayType"],
                })
              }
            />
            {data.bgOverlayType !== "none" && (
              <TextField
                label="Overlay opacity (0 - 100%)"
                type="number"
                value={String(data.overlayOpacity ?? 25)}
                onChange={(val) =>
                  onChange({
                    ...data,
                    overlayOpacity: Math.min(
                      100,
                      Math.max(0, parseInt(val, 10) || 0),
                    ),
                  })
                }
              />
            )}
          </FormGroup>

          <FormGroup title="Hero Action Buttons">
            <OptionalLinkField
              label="Primary CTA button"
              value={data.primaryCta ?? data.campaignProgress?.registerButton}
              onChange={(primaryCta) =>
                onChange({
                  ...data,
                  primaryCta,
                  campaignProgress: {
                    ...(data.campaignProgress ?? {}),
                    registerButton: primaryCta,
                  },
                })
              }
              fallback={{ label: "Get Started Free →", href: "#start" }}
            />
            <OptionalLinkField
              label="Secondary CTA button"
              value={data.secondaryCta ?? data.campaignProgress?.donateButton}
              onChange={(secondaryCta) =>
                onChange({
                  ...data,
                  secondaryCta,
                  campaignProgress: {
                    ...(data.campaignProgress ?? {}),
                    donateButton: secondaryCta,
                  },
                })
              }
              fallback={{ label: "Explore Platform", href: "#explore" }}
            />
          </FormGroup>

          <FormGroup title="Optional Stat & Milestone Cards">
            <CheckboxField
              label="Show floating milestone & stat cards (Keep off for clean buttons)"
              checked={Boolean(data.showCampaignCards)}
              onChange={(showCampaignCards: boolean) =>
                onChange({ ...data, showCampaignCards })
              }
            />
          </FormGroup>

          {data.showCampaignCards && (
            <>
              <FormGroup title="Milestone Progress Card">
                <div className="grid grid-cols-2 gap-2">
                  <TextField
                    label="Progress amount"
                    value={String(
                      data.campaignProgress?.raisedAmount ?? "285,000",
                    )}
                    onChange={(raisedAmount) =>
                      onChange({
                        ...data,
                        campaignProgress: {
                          ...(data.campaignProgress ?? {}),
                          raisedAmount,
                        },
                      })
                    }
                    placeholder="285,000"
                  />
                  <TextField
                    label="Target goal"
                    value={String(
                      data.campaignProgress?.targetAmount ?? "300,000",
                    )}
                    onChange={(targetAmount) =>
                      onChange({
                        ...data,
                        campaignProgress: {
                          ...(data.campaignProgress ?? {}),
                          targetAmount,
                        },
                      })
                    }
                    placeholder="300,000"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <TextField
                    label="Currency symbol"
                    value={data.campaignProgress?.currency ?? "$"}
                    onChange={(currency) =>
                      onChange({
                        ...data,
                        campaignProgress: {
                          ...(data.campaignProgress ?? {}),
                          currency,
                        },
                      })
                    }
                    maxLength={5}
                    placeholder="$"
                  />
                  <TextField
                    label="Target text subtitle"
                    value={
                      data.campaignProgress?.targetLabel ??
                      "of $300,000 milestone"
                    }
                    onChange={(targetLabel) =>
                      onChange({
                        ...data,
                        campaignProgress: {
                          ...(data.campaignProgress ?? {}),
                          targetLabel,
                        },
                      })
                    }
                    placeholder="of $300,000 milestone"
                  />
                </div>
              </FormGroup>

              <FormGroup title="Stat & Metric Cards">
                <ItemList<HeroCampaignStat>
                  label="Metric Counters"
                  items={data.campaignStats ?? DEFAULT_CAMPAIGN_STATS}
                  max={6}
                  onChange={(campaignStats) =>
                    onChange({ ...data, campaignStats })
                  }
                  create={() => ({
                    label: "Metric",
                    value: "1,000+",
                    icon: "users",
                  })}
                  itemTitle={(stat) => `${stat.label}: ${stat.value}`}
                  addLabel="Add Metric Stat"
                  renderItem={(stat, update) => (
                    <div className="flex flex-col gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        <TextField
                          label="Metric Label"
                          value={stat.label}
                          onChange={(label) => update({ ...stat, label })}
                          maxLength={60}
                          placeholder="Active Members"
                          required
                        />
                        <TextField
                          label="Counter Value"
                          value={stat.value}
                          onChange={(value) => update({ ...stat, value })}
                          maxLength={40}
                          placeholder="12,450"
                          required
                        />
                      </div>
                      <SelectField
                        label="Icon style"
                        value={stat.icon ?? "users"}
                        options={[
                          { value: "users", label: "Community / Users 👥" },
                          { value: "pin", label: "Location Pin 📍" },
                          { value: "award", label: "Milestone / Award 🏆" },
                          { value: "star", label: "Star ⭐" },
                          { value: "heart", label: "Heart 💖" },
                        ]}
                        onChange={(icon) => update({ ...stat, icon })}
                      />
                    </div>
                  )}
                />
              </FormGroup>
            </>
          )}
        </>
      )}

      <FormGroup title="Headings & copy">
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-1">
            <TextField
              label="Icon / Emoji"
              value={data.badgeIcon ?? ""}
              onChange={(badgeIcon) =>
                onChange({ ...data, badgeIcon: badgeIcon || undefined })
              }
              maxLength={10}
              placeholder="✨"
            />
          </div>
          <div className="col-span-2">
            <TextField
              label="Badge / Eyebrow"
              value={data.eyebrow ?? ""}
              onChange={(eyebrow) =>
                onChange({ ...data, eyebrow: eyebrow || undefined })
              }
              maxLength={200}
              placeholder="Next-Gen Platform"
            />
          </div>
        </div>

        <TextField
          label="Main heading (optional)"
          value={data.heading ?? ""}
          onChange={(heading) => onChange({ ...data, heading })}
          maxLength={200}
        />
        <TextField
          label="Gradient highlight text (optional)"
          value={data.highlightText ?? ""}
          onChange={(highlightText) =>
            onChange({ ...data, highlightText: highlightText || undefined })
          }
          maxLength={100}
          hint="Matching word in heading will render with a colorful vibrant gradient."
          placeholder="faster"
        />
        <TextAreaField
          label="Subheading / Summary"
          value={data.subheading ?? ""}
          onChange={(subheading) =>
            onChange({ ...data, subheading: subheading || undefined })
          }
          maxLength={500}
          rows={2}
        />
        <TextAreaField
          label="Extended description (optional)"
          value={data.description ?? ""}
          onChange={(description) =>
            onChange({ ...data, description: description || undefined })
          }
          maxLength={1000}
          rows={2}
        />
      </FormGroup>

      <FormGroup title="Action buttons (CTAs)">
        <OptionalLinkField
          label="Primary button (CTA)"
          value={data.primaryCta}
          onChange={(primaryCta) => onChange({ ...data, primaryCta })}
          fallback={{ label: "Get started", href: "/signup" }}
        />
        <OptionalLinkField
          label="Secondary button"
          value={data.secondaryCta}
          onChange={(secondaryCta) => onChange({ ...data, secondaryCta })}
          fallback={{ label: "Book a demo", href: "/demo" }}
        />
        <OptionalLinkField
          label="Play video / Demo button (optional)"
          value={data.tertiaryCta}
          onChange={(tertiaryCta) => onChange({ ...data, tertiaryCta })}
          fallback={{
            label: "Watch 2-min demo",
            href: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            actionType: "video",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            icon: "play",
          }}
        />
      </FormGroup>

      <HeroButtonShapeGroup data={data} onChange={onChange} />

      {data.variant === "curved-carousel" ? (
        <FormGroup title="Carousel Cards & Imagery">
          <p className="text-xs text-ed-muted mb-3">
            Add, reorder, or customize the photography and video reel cards in
            the 3D banner.
          </p>
          <ItemList<CarouselSlide>
            label="Carousel Cards"
            items={data.carouselSlides ?? DEFAULT_HERO_CAROUSEL_SLIDES}
            max={20}
            onChange={(carouselSlides) => onChange({ ...data, carouselSlides })}
            create={() => ({
              title: "New Video Reel",
              subtitle: "@creator_handle",
              badge: "Featured",
              image: {
                url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&h=1050&q=85",
                alt: "Card image",
              },
            })}
            itemTitle={(slide) => slide.title || "Card"}
            addLabel="Add Card / Image"
            renderItem={(slide, update) => (
              <>
                <ImageField
                  label="Card Image / Poster"
                  value={slide.image}
                  onChange={(image) => update({ ...slide, image })}
                  dimensionHint={MEDIA_SIZE.reelCard}
                />
                <TextField
                  label="Card Title"
                  value={slide.title}
                  onChange={(title) => update({ ...slide, title })}
                  maxLength={120}
                  required
                />
                <TextField
                  label="Creator / Handle"
                  value={slide.subtitle || ""}
                  onChange={(subtitle) => update({ ...slide, subtitle })}
                  maxLength={120}
                  placeholder="@creator_handle"
                />
                <TextField
                  label="Badge / Tag"
                  value={slide.badge || ""}
                  onChange={(badge) => update({ ...slide, badge })}
                  maxLength={60}
                  placeholder="e.g. Travel, Beauty, Food, Tech"
                />
              </>
            )}
          />
        </FormGroup>
      ) : data.variant === "campaign-banner" ? null : (
        <FormGroup title="Foreground media / visual">
          <SelectField
            label="Foreground media type"
            value={data.mediaType ?? (data.videoUrl ? "video" : "image")}
            options={[
              { value: "image", label: "Image showcase / Mockup" },
              {
                value: "video",
                label: "Playable video demo (MP4 / YouTube / Vimeo)",
              },
              { value: "both", label: "Interactive video with poster image" },
            ]}
            onChange={(mediaType) =>
              onChange({
                ...data,
                mediaType: mediaType as HeroData["mediaType"],
              })
            }
          />

          <SelectField
            label="Media display placement"
            value={mediaPosition}
            options={[
              {
                value: "right",
                label: "Split right (Headline left, media on right)",
              },
              {
                value: "left",
                label: "Split left (Media on left, headline right)",
              },
              {
                value: "bottom",
                label: "Foreground showcase card / player (Below CTA buttons)",
              },
              {
                value: "background",
                label: "Full background cover (Edge-to-edge behind text)",
              },
            ]}
            onChange={(imagePosition) => {
              const pos = imagePosition as HeroData["imagePosition"];
              let variant = data.variant;
              if (pos === "left") variant = "split-left";
              else if (pos === "right" && data.variant === "split-left")
                variant = "split";
              onChange({
                ...data,
                imagePosition: pos,
                variant,
              });
            }}
            hint="Choose whether your media is positioned side-by-side (left/right), below headline/CTAs, or fills the background."
          />

          <ImageField
            label={
              data.mediaType === "both"
                ? "Video poster / thumbnail image (optional)"
                : "Main hero image / mockup (optional)"
            }
            value={data.image}
            onChange={(image) => onChange({ ...data, image })}
            optional
            dimensionHint={
              data.mediaType === "both" ? MEDIA_SIZE.fullBleed : heroImageSize(data.variant, mediaPosition)
            }
          />

          <SelectField
            label="Image / media style"
            value={data.imageStyle ?? "plain"}
            options={[
              { value: "plain", label: "Standard rounded corners" },
              {
                value: "mockup",
                label: "Browser mockup window (with macOS 3-dots & shadow)",
              },
              { value: "glow", label: "Ambient glow backlight" },
              { value: "rounded", label: "Soft pill corners" },
            ]}
            onChange={(imageStyle) =>
              onChange({
                ...data,
                imageStyle: imageStyle as HeroData["imageStyle"],
              })
            }
          />

          <VideoField
            label="Playable video demo (optional)"
            value={data.videoUrl}
            onChange={(videoUrl) =>
              onChange({ ...data, videoUrl: videoUrl || undefined })
            }
            placeholder="https://www.youtube.com/watch?v=... or upload MP4"
            dimensionHint={MEDIA_SIZE.fullBleed}
            hint="Supports direct MP4/WebM uploads (up to 50 MB) or YouTube/Vimeo links."
          />

          {Boolean(data.videoUrl) && (
            <div className="flex flex-col gap-2 pt-1">
              <CheckboxField
                label="Show video player controls"
                checked={data.videoControls ?? true}
                onChange={(videoControls) =>
                  onChange({ ...data, videoControls })
                }
              />
              <CheckboxField
                label="Autoplay video (muted)"
                checked={Boolean(data.videoAutoplay)}
                onChange={(videoAutoplay) =>
                  onChange({ ...data, videoAutoplay })
                }
              />
              <CheckboxField
                label="Loop video continuously"
                checked={Boolean(data.videoLoop)}
                onChange={(videoLoop) => onChange({ ...data, videoLoop })}
              />
            </div>
          )}
        </FormGroup>
      )}

      {data.variant !== "campaign-banner" && (
        <FormGroup title="Full background media & cover (Image / Video)">
          <ImageField
            label="Background image (full-bleed cover)"
            value={data.backgroundImage}
            onChange={(backgroundImage) =>
              onChange({ ...data, backgroundImage })
            }
            optional
            dimensionHint={MEDIA_SIZE.fullBleed}
            hint={MEDIA_HINT.cropped}
          />

          <SelectField
            label="Background image alignment / position"
            value={data.bgImagePosition ?? "cover"}
            options={[
              { value: "cover", label: "Center cover (Full bleed background)" },
              { value: "top", label: "Top aligned" },
              { value: "center", label: "Centered" },
            ]}
            onChange={(bgImagePosition) =>
              onChange({
                ...data,
                bgImagePosition: bgImagePosition as HeroData["bgImagePosition"],
              })
            }
          />

          <VideoField
            label="Background video (ambient cover)"
            value={
              data.backgroundVideoUrl ??
              (data.variant === "video-bg" ||
              data.imagePosition === "background"
                ? (data.videoUrl ?? "")
                : "")
            }
            onChange={(backgroundVideoUrl) =>
              onChange({
                ...data,
                backgroundVideoUrl: backgroundVideoUrl || undefined,
              })
            }
            placeholder="https://www.youtube.com/watch?v=... or upload MP4"
            dimensionHint={MEDIA_SIZE.fullBleed}
            hint={`Ambient full-bleed video that plays automatically in the background. ${MEDIA_HINT.fullBleedVideo}`}
          />

          <SelectField
            label="Background overlay style"
            value={data.bgOverlayType ?? "gradient"}
            options={[
              {
                value: "gradient",
                label: "Soft top-to-bottom fade (Keeps top text crystal clear)",
              },
              { value: "dark", label: "Dark tint overlay" },
              { value: "light", label: "Light tint overlay" },
              { value: "none", label: "No overlay (Raw image/video)" },
            ]}
            onChange={(bgOverlayType) =>
              onChange({
                ...data,
                bgOverlayType: bgOverlayType as HeroData["bgOverlayType"],
              })
            }
          />

          {(data.bgOverlayType === "dark" ||
            data.bgOverlayType === "light") && (
            <TextField
              label="Overlay opacity (0 - 100%)"
              type="number"
              value={String(data.overlayOpacity ?? 50)}
              onChange={(val) =>
                onChange({
                  ...data,
                  overlayOpacity: Math.min(
                    100,
                    Math.max(0, parseInt(val, 10) || 0),
                  ),
                })
              }
            />
          )}

          <CheckboxField
            label="Enable glassmorphism background blur"
            checked={Boolean(data.overlayBlur)}
            onChange={(overlayBlur) => onChange({ ...data, overlayBlur })}
          />
        </FormGroup>
      )}

      <FormGroup title="Trusted by logo strip">
        <CheckboxField
          label="Show trusted by brand logos"
          checked={Boolean(
            data.trustedBy?.logos?.length || data.trustedBy?.label,
          )}
          onChange={(checked) =>
            onChange({
              ...data,
              trustedBy: checked
                ? {
                    label: "Trusted by forward-thinking teams worldwide",
                    logos: [
                      { label: "Acme Corp" },
                      { label: "HyperScale" },
                      { label: "Vortex Labs" },
                    ],
                  }
                : undefined,
            })
          }
        />
        {Boolean(data.trustedBy) && (
          <div className="flex flex-col gap-2.5 pt-1">
            <TextField
              label="Strip label"
              value={trustedBy.label ?? ""}
              onChange={(label) =>
                updateTrustedBy({ label: label || undefined })
              }
              maxLength={100}
              placeholder="Trusted by over 10,000+ companies"
            />
            <CommaListField
              label="Company brand names (comma separated)"
              value={(trustedBy.logos ?? []).map((l) => l.label)}
              onChange={(labels) =>
                updateTrustedBy({ logos: labels.map((label) => ({ label })) })
              }
            />
          </div>
        )}
      </FormGroup>
    </>
  );
}

function FeaturesForm({ data, onChange }: DataFormProps<FeaturesData>) {
  const isSplit = data.variant === "split";

  return (
    <>
      <FormGroup title="Features layout & style">
        <SelectField
          label="Layout variant"
          value={data.variant ?? "grid"}
          options={[
            {
              value: "grid",
              label: "Standard responsive grid (Cards & icons)",
            },
            {
              value: "split",
              label:
                "Split screen showcase (Headline + mockup on one side, stacked cards on other)",
            },
            {
              value: "pastel-icons",
              label:
                "Pastel icon highlights (Soft circular badges with clean typography)",
            },
            {
              value: "minimal",
              label: "Minimal clean grid (Modern accent icons, borderless)",
            },
            {
              value: "cards",
              label:
                "Elevated modern cards (Surface cards with hover lift & subtle shadow)",
            },
            {
              value: "editorial-process",
              label:
                "Editorial process steps (Roman numerals timeline & top dividing rule)",
            },
            {
              value: "colored-pillars",
              label:
                "Colored pillars (Mission, Vision, Values colored rounded cards)",
            },
            {
              value: "polaroid-grid",
              label:
                "Polaroid photo grid (Vintage photo paper cards with captions)",
            },
          ]}
          onChange={(variant) =>
            onChange({
              ...data,
              variant: variant as FeaturesData["variant"],
            })
          }
        />

        {isSplit && (
          <>
            <SelectField
              label="Split layout alignment"
              value={data.splitPosition ?? "left"}
              options={[
                {
                  value: "left",
                  label: "Visual & headline on Left, Feature cards on Right",
                },
                {
                  value: "right",
                  label: "Feature cards on Left, Visual & headline on Right",
                },
              ]}
              onChange={(pos) =>
                onChange({
                  ...data,
                  splitPosition: pos as "left" | "right",
                })
              }
              hint="Easily flip the visual showcase and feature card stack between left and right."
            />
            <ImageField
              label="Custom mockup image (optional, default isometric 3D chart is used if empty)"
              value={data.splitImage}
              onChange={(splitImage) => onChange({ ...data, splitImage })}
              optional
              dimensionHint={MEDIA_SIZE.featuresMockup}
              hint="Shown at its natural shape up to 480 px wide; a transparent PNG or WebP works best."
            />
            <OptionalLinkField
              label="Primary CTA button (optional)"
              value={data.splitCta}
              onChange={(splitCta) => onChange({ ...data, splitCta })}
              fallback={{ label: "Explore more", href: "/features" }}
            />
            <OptionalLinkField
              label="Secondary CTA button (optional)"
              value={data.secondaryCta}
              onChange={(secondaryCta) => onChange({ ...data, secondaryCta })}
              fallback={{ label: "Book a demo", href: "/demo" }}
            />
          </>
        )}

        <SelectField
          label="Icon badge style"
          value={
            data.iconStyle ??
            (data.variant === "pastel-icons"
              ? "pastel-circle"
              : isSplit
                ? "square-badge"
                : data.variant === "minimal"
                  ? "minimal-accent"
                  : "pastel-circle")
          }
          options={[
            {
              value: "pastel-circle",
              label: "Pastel circular badges (Soft tinted round backgrounds)",
            },
            {
              value: "square-badge",
              label:
                "Modern rounded squircle (Subtle border and tinted surface)",
            },
            {
              value: "minimal-accent",
              label: "Minimal clean icon (Brand color with no background box)",
            },
            {
              value: "colored-circle",
              label: "Solid / gradient colored circle",
            },
            { value: "none", label: "Hide icons" },
          ]}
          onChange={(iconStyle) =>
            onChange({
              ...data,
              iconStyle: iconStyle as FeaturesData["iconStyle"],
            })
          }
        />

        <div className="grid grid-cols-2 gap-2">
          <SelectField
            label="Section icon bg"
            value={data.iconBackgroundColor ?? ""}
            options={[
              ...FEATURE_ICON_BG_PRESETS,
              ...(data.iconBackgroundColor &&
              !FEATURE_ICON_BG_PRESETS.some(
                (p) =>
                  p.value.toLowerCase() ===
                  data.iconBackgroundColor?.toLowerCase(),
              )
                ? [
                    {
                      value: data.iconBackgroundColor,
                      label: `Custom (${data.iconBackgroundColor})`,
                    },
                  ]
                : []),
            ]}
            onChange={(val) =>
              onChange({ ...data, iconBackgroundColor: val || undefined })
            }
          />
          <CompactColorField
            label="Custom icon bg"
            value={data.iconBackgroundColor}
            onChange={(color) =>
              onChange({ ...data, iconBackgroundColor: color || undefined })
            }
            fallback="rgba(255, 255, 255, 0.15)"
            placeholder="Auto"
          />
        </div>

        <SelectField
          label="Card container style"
          value={
            data.cardStyle ??
            (data.variant === "cards"
              ? "surface"
              : data.variant === "minimal" || data.variant === "pastel-icons"
                ? "transparent"
                : "surface")
          }
          options={[
            {
              value: "transparent",
              label: "Transparent / Flat (No background box)",
            },
            {
              value: "surface",
              label: "Surface card (Tinted background & soft hover)",
            },
            { value: "bordered", label: "Subtle outlined border" },
            {
              value: "glass",
              label: "Glassmorphism (Frosted glass blur & soft border)",
            },
          ]}
          onChange={(cardStyle) =>
            onChange({
              ...data,
              cardStyle: cardStyle as FeaturesData["cardStyle"],
            })
          }
        />

        <SelectField
          label="Content alignment"
          value={data.align ?? (isSplit ? "left" : "center")}
          options={ALIGN_OPTIONS}
          onChange={(align) =>
            onChange({
              ...data,
              align: align as SectionAlign,
            })
          }
        />

        {!isSplit && (
          <>
            <CheckboxField
              label="Show vertical column dividers"
              checked={data.showDividers ?? false}
              onChange={(showDividers) => onChange({ ...data, showDividers })}
              hint="Adds sleek vertical divider lines between columns (ideal for Mission, Vision & Values banners)."
            />
            {data.showDividers && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <SelectField
                  label="Divider line style"
                  value={data.dividerStyle ?? "inset"}
                  options={[
                    { value: "inset", label: "Inset centered line" },
                    { value: "full", label: "Full height line" },
                  ]}
                  onChange={(dividerStyle) =>
                    onChange({
                      ...data,
                      dividerStyle: dividerStyle as "inset" | "full",
                    })
                  }
                />
                <CompactColorField
                  label="Divider color"
                  value={data.dividerColor}
                  onChange={(dividerColor) =>
                    onChange({ ...data, dividerColor: dividerColor || undefined })
                  }
                  fallback="rgba(255, 255, 255, 0.2)"
                  placeholder="Auto"
                />
              </div>
            )}
          </>
        )}
      </FormGroup>

      <FormGroup title="Headings & copy">
        <TextField
          label="Badge / Eyebrow (optional)"
          value={data.eyebrow ?? ""}
          onChange={(eyebrow) =>
            onChange({ ...data, eyebrow: eyebrow || undefined })
          }
          maxLength={100}
          placeholder="Capabilities"
        />
        <TextField
          label="Main heading (optional)"
          value={data.heading ?? ""}
          onChange={(heading) => onChange({ ...data, heading })}
          maxLength={200}
        />
        <TextAreaField
          label="Intro description (optional)"
          value={data.intro ?? ""}
          onChange={(intro) => onChange({ ...data, intro: intro || undefined })}
          maxLength={500}
        />

        {!isSplit && <ColumnsFields data={data} onChange={onChange} />}

        {!isSplit && (
          <OptionalLinkField
            label="Bottom link / CTA (optional)"
            value={data.bottomCta}
            onChange={(bottomCta) => onChange({ ...data, bottomCta })}
            fallback={{ label: "Learn more", href: "/features" }}
          />
        )}
      </FormGroup>

      <FormGroup title="Feature items">
        <ItemList<FeaturesData["items"][number]>
          label="Items"
          items={data.items}
          max={24}
          onChange={(items) => onChange({ ...data, items })}
          create={() => ({
            icon: "gear",
            iconColor: "orange",
            title: "New feature",
            description: "Describe this benefit clearly.",
          })}
          itemTitle={(item) => item.title}
          addLabel="Add feature"
          renderItem={(item, update) => (
            <>
              <div className="grid grid-cols-2 gap-2">
                <IconPickerField
                  label="Icon"
                  value={item.icon ?? ""}
                  imageValue={item.iconImage}
                  onChange={({ icon, iconImage }) =>
                    update({ ...item, icon, iconImage })
                  }
                />
                <CompactColorField
                  label="Icon color badge"
                  value={
                    item.iconColor && item.iconColor !== "default"
                      ? (NAMED_FEATURE_COLOR_TO_HEX[item.iconColor] ?? item.iconColor)
                      : undefined
                  }
                  onChange={(color) =>
                    update({
                      ...item,
                      iconColor: color || undefined,
                    })
                  }
                  fallback="#3b82f6"
                  placeholder="Auto"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <SelectField
                  label="Icon background"
                  value={item.iconBackgroundColor ?? ""}
                  options={[
                    ...FEATURE_ICON_BG_PRESETS,
                    ...(item.iconBackgroundColor &&
                    !FEATURE_ICON_BG_PRESETS.some(
                      (p) =>
                        p.value.toLowerCase() ===
                        item.iconBackgroundColor?.toLowerCase(),
                    )
                      ? [
                          {
                            value: item.iconBackgroundColor,
                            label: `Custom (${item.iconBackgroundColor})`,
                          },
                        ]
                      : []),
                  ]}
                  onChange={(val) =>
                    update({ ...item, iconBackgroundColor: val || undefined })
                  }
                />
                <CompactColorField
                  label="Icon bg color"
                  value={item.iconBackgroundColor}
                  onChange={(color) =>
                    update({
                      ...item,
                      iconBackgroundColor: color || undefined,
                    })
                  }
                  fallback="rgba(255, 255, 255, 0.15)"
                  placeholder="Auto"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <SelectField
                  label="Card background"
                  value={item.backgroundColor ?? ""}
                  options={[
                    ...FEATURE_CARD_BG_PRESETS,
                    ...(item.backgroundColor &&
                    !FEATURE_CARD_BG_PRESETS.some(
                      (p) =>
                        p.value.toLowerCase() ===
                        item.backgroundColor?.toLowerCase(),
                    )
                      ? [
                          {
                            value: item.backgroundColor,
                            label: `Custom (${item.backgroundColor})`,
                          },
                        ]
                      : []),
                  ]}
                  onChange={(val) =>
                    update({ ...item, backgroundColor: val || undefined })
                  }
                />
                <CompactColorField
                  label="Custom color"
                  value={item.backgroundColor}
                  onChange={(color) =>
                    update({ ...item, backgroundColor: color || undefined })
                  }
                  fallback="#ffffff"
                  placeholder="#ffffff"
                />
              </div>
              <TextField
                label="Title"
                value={item.title}
                onChange={(title) => update({ ...item, title })}
                maxLength={120}
                required
              />
              <TextAreaField
                label="Description"
                value={item.description}
                onChange={(description) => update({ ...item, description })}
                maxLength={600}
              />
              <TextField
                label="Item badge / Tag (optional)"
                value={item.badge ?? ""}
                onChange={(badge) =>
                  update({ ...item, badge: badge || undefined })
                }
                maxLength={30}
                placeholder="New"
              />
              <OptionalLinkField
                label="Item link (optional)"
                value={item.link}
                onChange={(link) => update({ ...item, link })}
                fallback={{ label: "Learn more", href: "#" }}
              />
            </>
          )}
        />
      </FormGroup>
    </>
  );
}

const SERVICES_VARIANT_OPTIONS: { value: ServicesVariant; label: string }[] = [
  { value: "cards-grid", label: "Cards grid (Modern standard)" },
  { value: "bento-grid", label: "Bento box grid (Featured spotlight)" },
  { value: "split-showcase", label: "Split showcase (Sticky hero + cards)" },
  {
    value: "interactive-list",
    label: "Interactive list (Agency studio hover)",
  },
  {
    value: "horizontal-cards",
    label: "Horizontal cards (Detailed enterprise)",
  },
  {
    value: "minimal-numbered",
    label: "Minimal numbered (Editorial / Consulting)",
  },
  {
    value: "editorial-specs",
    label: "Editorial specs list (Vintage Reels 01-06 with chromatic stamp)",
  },
];

const SERVICE_CARD_STYLE_OPTIONS = [
  { value: "surface", label: "Surface (Tinted bg)" },
  { value: "bordered", label: "Bordered (Crisp border)" },
  { value: "flat", label: "Flat (Transparent)" },
  { value: "glass", label: "Glassmorphism (Frosted)" },
  { value: "glow", label: "Glow (Accent ambient hover)" },
  { value: "elevated", label: "Elevated (Layered shadow)" },
  { value: "gradient", label: "Gradient (Subtle accent glow)" },
];

const SERVICE_ICON_STYLE_OPTIONS = [
  { value: "pastel-circle", label: "Soft pastel circle" },
  { value: "square-badge", label: "Square badge" },
  { value: "minimal-accent", label: "Minimal accent" },
  { value: "colored-circle", label: "Vibrant gradient circle" },
  { value: "glow-icon", label: "Ambient glow" },
  { value: "none", label: "Hidden / None" },
];

const SERVICE_IMAGE_ASPECT_OPTIONS = [
  { value: "16:9", label: "16 : 9 (Widescreen)" },
  { value: "16:10", label: "16 : 10 (Standard)" },
  { value: "4:3", label: "4 : 3 (Classic)" },
  { value: "1:1", label: "1 : 1 (Square)" },
  { value: "21:9", label: "21 : 9 (Ultra-wide cinematic)" },
  { value: "auto", label: "Original / Auto" },
];

function ServicesForm({ data, onChange }: DataFormProps<ServicesData>) {
  const isSplit = data.variant === "split-showcase";

  return (
    <>
      <FormGroup title="Layout & variant">
        <SelectField
          label="Layout variant"
          value={data.variant ?? "cards-grid"}
          options={SERVICES_VARIANT_OPTIONS}
          onChange={(variant) => onChange({ ...data, variant })}
        />
        <div className="grid grid-cols-2 gap-2">
          <SelectField
            label="Card style"
            value={data.cardStyle ?? "surface"}
            options={SERVICE_CARD_STYLE_OPTIONS}
            onChange={(cardStyle) =>
              onChange({
                ...data,
                cardStyle: cardStyle as ServicesData["cardStyle"],
              })
            }
          />
          <SelectField
            label="Icon style"
            value={data.iconStyle ?? "pastel-circle"}
            options={SERVICE_ICON_STYLE_OPTIONS}
            onChange={(iconStyle) =>
              onChange({
                ...data,
                iconStyle: iconStyle as ServicesData["iconStyle"],
              })
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <SelectField
            label="Image aspect"
            value={data.imageAspect ?? "16:9"}
            options={SERVICE_IMAGE_ASPECT_OPTIONS}
            onChange={(imageAspect) =>
              onChange({
                ...data,
                imageAspect: imageAspect as ServicesData["imageAspect"],
              })
            }
          />
          <SelectField
            label="Alignment"
            value={data.align ?? "left"}
            options={ALIGN_OPTIONS}
            onChange={(align) => onChange({ ...data, align })}
          />
        </div>
        {!isSplit &&
          data.variant !== "interactive-list" &&
          data.variant !== "horizontal-cards" && (
            <ColumnsFields data={data} onChange={onChange} />
          )}
      </FormGroup>

      <FormGroup title="Header content">
        <TextField
          label="Eyebrow (optional)"
          value={data.eyebrow ?? ""}
          onChange={(eyebrow) =>
            onChange({ ...data, eyebrow: eyebrow || undefined })
          }
          maxLength={100}
          placeholder="WHAT WE OFFER"
        />
        <TextField
          label="Heading"
          value={data.heading}
          onChange={(heading) => onChange({ ...data, heading })}
          maxLength={200}
          required
        />
        <TextAreaField
          label="Intro"
          value={data.intro}
          onChange={(intro) => onChange({ ...data, intro })}
          maxLength={500}
        />
      </FormGroup>

      {isSplit && (
        <FormGroup title="Split showcase options">
          <SelectField
            label="Hero position"
            value={data.splitPosition ?? "left"}
            options={[
              { value: "left", label: "Hero on Left" },
              { value: "right", label: "Hero on Right" },
            ]}
            onChange={(pos) =>
              onChange({
                ...data,
                splitPosition: pos as "left" | "right",
              })
            }
          />
          <ImageField
            label="Showcase image"
            value={data.splitImage}
            onChange={(splitImage) => onChange({ ...data, splitImage })}
            optional
            dimensionHint={MEDIA_SIZE.servicesShowcase}
          />
          <TextField
            label="Showcase tagline (optional)"
            value={data.splitTagline ?? ""}
            onChange={(splitTagline) =>
              onChange({ ...data, splitTagline: splitTagline || undefined })
            }
            maxLength={200}
            placeholder="Trusted by over 500+ clients worldwide"
          />
          <OptionalLinkField
            label="Primary CTA button"
            value={data.splitCta}
            onChange={(splitCta) => onChange({ ...data, splitCta })}
            fallback={{ label: "Book a consultation", href: "/contact" }}
          />
          <OptionalLinkField
            label="Secondary CTA button"
            value={data.secondaryCta}
            onChange={(secondaryCta) => onChange({ ...data, secondaryCta })}
            fallback={{ label: "View portfolio", href: "/portfolio" }}
          />
        </FormGroup>
      )}

      <FormGroup title="Display options">
        <div className="grid grid-cols-2 gap-2">
          <CheckboxField
            label="Show badges"
            checked={data.showBadges !== false}
            onChange={(checked) => onChange({ ...data, showBadges: checked })}
          />
          <CheckboxField
            label="Show icons"
            checked={data.showIcons !== false}
            onChange={(checked) => onChange({ ...data, showIcons: checked })}
          />
          <CheckboxField
            label="Show images"
            checked={data.showImages !== false}
            onChange={(checked) => onChange({ ...data, showImages: checked })}
          />
          <CheckboxField
            label="Show prices"
            checked={data.showPrices !== false}
            onChange={(checked) => onChange({ ...data, showPrices: checked })}
          />
          <CheckboxField
            label="Show deliverables"
            checked={data.showBullets !== false}
            onChange={(checked) => onChange({ ...data, showBullets: checked })}
          />
          <CheckboxField
            label="Show 01, 02 indices"
            checked={data.showNumbers === true}
            onChange={(checked) => onChange({ ...data, showNumbers: checked })}
          />
        </div>
      </FormGroup>

      <FormGroup title="Services list">
        <ItemList<ServiceItem>
          label="Services"
          items={data.items}
          max={24}
          onChange={(items) => onChange({ ...data, items })}
          create={() => ({
            title: "New service",
            description:
              "A comprehensive description of what this service delivers.",
            badge: "Popular",
            badgeColor: "blue",
            icon: "sparkles",
            iconColor: "blue",
            price: "From $499",
            duration: "3-5 days",
            features: [
              "Dedicated project lead",
              "Full source assets included",
              "Unlimited revisions during review",
            ],
            link: { label: "Get started", href: "/contact" },
          })}
          itemTitle={(item) => item.title}
          addLabel="Add service"
          renderItem={(item, update) => (
            <>
              <div className="flex items-center justify-between pb-1">
                <CheckboxField
                  label="Featured / Spotlight item"
                  checked={item.featured === true}
                  onChange={(featured) => update({ ...item, featured })}
                />
              </div>

              <TextField
                label="Title"
                value={item.title}
                onChange={(title) => update({ ...item, title })}
                maxLength={120}
                required
              />

              <TextAreaField
                label="Description"
                value={item.description}
                onChange={(description) => update({ ...item, description })}
                maxLength={1000}
              />

              <div className="grid grid-cols-2 gap-2">
                <TextField
                  label="Tag / Badge (optional)"
                  value={item.badge ?? ""}
                  onChange={(badge) =>
                    update({ ...item, badge: badge || undefined })
                  }
                  maxLength={30}
                  placeholder="e.g. Popular, Turnkey"
                />
                <SelectField
                  label="Badge color"
                  value={item.badgeColor ?? "default"}
                  options={FEATURE_COLOR_OPTIONS}
                  onChange={(col) =>
                    update({
                      ...item,
                      badgeColor:
                        col === "default"
                          ? undefined
                          : (col as ServiceItem["badgeColor"]),
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <IconPickerField
                  label="Icon"
                  value={item.icon ?? ""}
                  imageValue={item.iconImage}
                  onChange={({ icon, iconImage }) =>
                    update({ ...item, icon, iconImage })
                  }
                />
                <CompactColorField
                  label="Icon color"
                  value={
                    item.iconColor && item.iconColor !== "default"
                      ? (NAMED_FEATURE_COLOR_TO_HEX[item.iconColor] ?? item.iconColor)
                      : undefined
                  }
                  onChange={(color) =>
                    update({
                      ...item,
                      iconColor: color || undefined,
                    })
                  }
                  fallback="#3b82f6"
                  placeholder="Auto"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <TextField
                  label="Price tag (optional)"
                  value={item.price ?? ""}
                  onChange={(price) =>
                    update({ ...item, price: price || undefined })
                  }
                  maxLength={50}
                  placeholder="e.g. From $499 or $120/hr"
                />
                <TextField
                  label="Turnaround (optional)"
                  value={item.duration ?? ""}
                  onChange={(duration) =>
                    update({ ...item, duration: duration || undefined })
                  }
                  maxLength={50}
                  placeholder="e.g. 3-5 days delivery"
                />
              </div>

              <ImageField
                label="Image / Media"
                value={item.image}
                onChange={(image) => update({ ...item, image })}
                optional
                dimensionHint={cardImageSize(data.imageAspect ?? "16:9")}
              />

              <StringList
                label="Deliverables / Checklist bullets"
                items={item.features ?? []}
                max={10}
                onChange={(features) => update({ ...item, features })}
                addLabel="Add deliverable"
              />

              <div className="grid grid-cols-2 gap-2">
                <SelectField
                  label="Card background"
                  value={item.backgroundColor ?? ""}
                  options={[
                    ...FEATURE_CARD_BG_PRESETS,
                    ...(item.backgroundColor &&
                    !FEATURE_CARD_BG_PRESETS.some(
                      (p) =>
                        p.value.toLowerCase() ===
                        item.backgroundColor?.toLowerCase(),
                    )
                      ? [
                          {
                            value: item.backgroundColor,
                            label: `Custom (${item.backgroundColor})`,
                          },
                        ]
                      : []),
                  ]}
                  onChange={(val) =>
                    update({ ...item, backgroundColor: val || undefined })
                  }
                />
                <CompactColorField
                  label="Custom color"
                  value={item.backgroundColor}
                  onChange={(color) =>
                    update({ ...item, backgroundColor: color || undefined })
                  }
                  fallback="#ffffff"
                  placeholder="#ffffff"
                />
              </div>

              <OptionalLinkField
                label="Primary link / button"
                value={item.link}
                onChange={(link) => update({ ...item, link })}
                fallback={{ label: "Get started", href: "/contact" }}
              />

              <OptionalLinkField
                label="Secondary link (optional)"
                value={item.secondaryLink}
                onChange={(secondaryLink) => update({ ...item, secondaryLink })}
                fallback={{ label: "View details", href: "#" }}
              />
            </>
          )}
        />
      </FormGroup>

      <FormGroup title="Section bottom CTA">
        <OptionalLinkField
          label="Bottom primary button (optional)"
          value={data.bottomCta}
          onChange={(bottomCta) => onChange({ ...data, bottomCta })}
          fallback={{ label: "Explore all services", href: "/services" }}
        />
        <OptionalLinkField
          label="Bottom secondary button (optional)"
          value={data.bottomSecondaryCta}
          onChange={(bottomSecondaryCta) =>
            onChange({ ...data, bottomSecondaryCta })
          }
          fallback={{ label: "Schedule a call", href: "/contact" }}
        />
      </FormGroup>
    </>
  );
}

const TESTIMONIALS_VARIANT_OPTIONS: { value: TestimonialsVariant; label: string }[] = [
  { value: "cards-grid", label: "Cards grid · Multi-column testimonial matrix" },
  { value: "carousel-slider", label: "Carousel slider · Smooth interactive stage" },
  { value: "marquee-wall", label: "Marquee wall · 60fps infinite social proof ticker" },
  { value: "spotlight-featured", label: "Executive spotlight · Hero quote & proof stack" },
  { value: "minimal-editorial", label: "Swiss editorial · Hairline typography minimalist" },
];

const TESTIMONIALS_CARD_STYLE_OPTIONS: { value: TestimonialsCardStyle; label: string }[] = [
  { value: "default", label: "Surface (Clean neutral)" },
  { value: "bordered", label: "Bordered (Crisp hairline outline)" },
  { value: "flat", label: "Flat (Transparent background)" },
  { value: "glass", label: "Glassmorphism (Frosted blur)" },
  { value: "elevated", label: "Elevated (Floating shadow)" },
];

function TestimonialsForm({ data, onChange }: DataFormProps<TestimonialsData>) {
  const currentVariant = data.variant || "cards-grid";

  return (
    <>
      <FormGroup title="Layout & Variant">
        <SelectField
          label="Display variant"
          value={currentVariant}
          options={TESTIMONIALS_VARIANT_OPTIONS}
          onChange={(variant) => onChange({ ...data, variant })}
        />
        <SelectField
          label="Card style"
          value={data.cardStyle || "default"}
          options={TESTIMONIALS_CARD_STYLE_OPTIONS}
          onChange={(cardStyle) => onChange({ ...data, cardStyle })}
        />
        <SelectField
          label="Header alignment"
          value={data.align || "center"}
          options={ALIGN_OPTIONS}
          onChange={(align) => onChange({ ...data, align: align as SectionAlign })}
        />
        {currentVariant === "cards-grid" && (
          <SelectField
            label="Grid columns"
            value={String(data.columns || 3)}
            options={[
              { value: "1", label: "1 column (Single column focus)" },
              { value: "2", label: "2 columns (Spacious)" },
              { value: "3", label: "3 columns (Balanced standard)" },
              { value: "4", label: "4 columns (Compact showcase)" },
            ]}
            onChange={(cols) => onChange({ ...data, columns: Number(cols) as GridColumns })}
          />
        )}
      </FormGroup>

      <FormGroup title="Header & Proof Metric">
        <TextField
          label="Eyebrow text"
          value={data.eyebrow}
          onChange={(eyebrow) => onChange({ ...data, eyebrow })}
          maxLength={80}
          placeholder="e.g. TRUSTED BY 10,000+ CUSTOMERS"
        />
        <TextField
          label="Heading"
          value={data.heading}
          onChange={(heading) => onChange({ ...data, heading })}
          maxLength={200}
          required
        />
        <TextAreaField
          label="Intro description"
          value={data.intro}
          onChange={(intro) => onChange({ ...data, intro })}
          maxLength={500}
          hint="Brief intro about customer satisfaction or testimonials..."
        />
        <div className="pt-2 border-t border-ed-border">
          <span className="text-ed-xs font-semibold text-ed-text block mb-2">Rating Summary Pill (Optional)</span>
          <div className="grid grid-cols-2 gap-2">
            <TextField
              label="Rating Score"
              value={data.ratingMetric?.score}
              onChange={(score) =>
                onChange({
                  ...data,
                  ratingMetric: { ...data.ratingMetric, score },
                })
              }
              placeholder="e.g. 4.9/5"
            />
            <TextField
              label="Testimonial Count / Rating Badge"
              value={data.ratingMetric?.count}
              onChange={(count) =>
                onChange({
                  ...data,
                  ratingMetric: { ...data.ratingMetric, count },
                })
              }
              placeholder="e.g. 2,500+ ratings"
            />
          </div>
          <TextField
            label="Rating Label"
            value={data.ratingMetric?.label}
            onChange={(label) =>
              onChange({
                ...data,
                ratingMetric: { ...data.ratingMetric, label },
              })
            }
            placeholder="e.g. Customer Rating"
          />
        </div>
      </FormGroup>

      <FormGroup title="Visual Elements & Badges">
        <CheckboxField
          label="Show Star Ratings"
          checked={data.showRatings ?? true}
          onChange={(showRatings) => onChange({ ...data, showRatings })}
        />
        <CheckboxField
          label="Show Author Avatars"
          checked={data.showAvatars ?? true}
          onChange={(showAvatars) => onChange({ ...data, showAvatars })}
        />
        <CheckboxField
          label="Show Verified Badges"
          checked={data.showBadges ?? true}
          onChange={(showBadges) => onChange({ ...data, showBadges })}
        />
      </FormGroup>

      <FormGroup title="Customer Quotes">
        <ItemList<TestimonialItem>
          label="Testimonials"
          items={data.items}
          max={24}
          onChange={(items) => onChange({ ...data, items })}
          create={() => ({
            quote: "This platform completely transformed our workflow. Setup took under 10 minutes and support is world-class.",
            name: "Alex Morgan",
            role: "Head of Product",
            company: "Acme Studio",
            rating: 5,
            verified: true,
            badge: "Verified Buyer",
            highlight: "+240% Growth",
          })}
          itemTitle={(item) => item.name || "Customer testimonial"}
          addLabel="Add testimonial"
          renderItem={(item, update) => (
            <>
              <TextAreaField
                label="Quote"
                value={item.quote}
                onChange={(quote) => update({ ...item, quote })}
                maxLength={800}
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <TextField
                  label="Name"
                  value={item.name}
                  onChange={(name) => update({ ...item, name })}
                  maxLength={120}
                  required
                />
                <TextField
                  label="Role"
                  value={item.role}
                  onChange={(role) => update({ ...item, role })}
                  maxLength={120}
                  placeholder="e.g. Founder & CEO"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <TextField
                  label="Company"
                  value={item.company}
                  onChange={(company) => update({ ...item, company })}
                  maxLength={120}
                  placeholder="e.g. Stripe, Linear"
                />
                <SelectField
                  label="Star Rating"
                  value={String(item.rating ?? 5)}
                  options={[
                    { value: "5", label: "★★★★★ (5 Stars)" },
                    { value: "4", label: "★★★★☆ (4 Stars)" },
                    { value: "3", label: "★★★☆☆ (3 Stars)" },
                  ]}
                  onChange={(r) => update({ ...item, rating: Number(r) })}
                />
              </div>
              <ImageField
                label="Author photo (Avatar)"
                value={item.avatar}
                onChange={(avatar) => update({ ...item, avatar })}
                optional
                dimensionHint={MEDIA_SIZE.avatar}
                hint={MEDIA_HINT.avatar}
              />
              <div className="grid grid-cols-2 gap-2">
                <TextField
                  label="Outcome / Highlight Tag"
                  value={item.highlight}
                  onChange={(highlight) => update({ ...item, highlight })}
                  placeholder="e.g. +340% ROI, Saved 20 hrs"
                />
                <TextField
                  label="Badge Label"
                  value={item.badge}
                  onChange={(badge) => update({ ...item, badge })}
                  placeholder="e.g. Verified Buyer"
                />
              </div>
              <CheckboxField
                label="Show Verified Checkmark"
                checked={item.verified !== false}
                onChange={(verified) => update({ ...item, verified })}
              />
            </>
          )}
        />
      </FormGroup>
    </>
  );
}

const FAQ_VARIANT_OPTIONS: { value: FaqVariant; label: string }[] = [
  { value: "accordion-classic", label: "Classic accordion (Modern standard)" },
  { value: "two-column-grid", label: "Two-column grid (Balanced matrix)" },
  { value: "split-sidebar", label: "Split layout (Sticky sidebar + list)" },
  { value: "minimal-numbered", label: "Minimal numbered (Swiss editorial)" },
  { value: "categorized-cards", label: "Categorized cards (Boxed modules)" },
];

const FAQ_CARD_STYLE_OPTIONS: { value: FaqCardStyle; label: string }[] = [
  { value: "default", label: "Surface (Clean neutral)" },
  { value: "bordered", label: "Bordered (Crisp hairline)" },
  { value: "flat", label: "Flat (Hairline separator)" },
  { value: "glass", label: "Glassmorphism (Frosted glass)" },
  { value: "elevated", label: "Elevated (Subtle shadow)" },
];

function FaqForm({ data, onChange }: DataFormProps<FaqData>) {
  return (
    <>
      <FormGroup title="Layout & Style">
        <SelectField
          label="Variant"
          value={data.variant || "accordion-classic"}
          options={FAQ_VARIANT_OPTIONS}
          onChange={(variant) => onChange({ ...data, variant })}
        />
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Card style"
            value={data.cardStyle || "default"}
            options={FAQ_CARD_STYLE_OPTIONS}
            onChange={(cardStyle) => onChange({ ...data, cardStyle })}
          />
          <SelectField
            label="Text align"
            value={data.align || "center"}
            options={ALIGN_OPTIONS}
            onChange={(align) => onChange({ ...data, align })}
          />
        </div>
      </FormGroup>

      <FormGroup title="Content">
        <TextField
          label="Eyebrow"
          value={data.eyebrow}
          onChange={(eyebrow) => onChange({ ...data, eyebrow })}
          maxLength={80}
          placeholder="e.g. HELP CENTER"
        />
        <TextField
          label="Heading"
          value={data.heading}
          onChange={(heading) => onChange({ ...data, heading })}
          maxLength={200}
          required
        />
        <TextAreaField
          label="Intro"
          value={data.intro}
          onChange={(intro) => onChange({ ...data, intro })}
          maxLength={500}
        />
      </FormGroup>

      <FormGroup title="Questions">
        <ItemList<FaqItem>
          label="Questions"
          items={data.items}
          max={40}
          onChange={(items) => onChange({ ...data, items })}
          create={() => ({
            question: "New question?",
            answer: "Answer it clearly in a sentence or two.",
          })}
          itemTitle={(item) => item.question}
          addLabel="Add question"
          renderItem={(item, update) => (
            <>
              <TextField
                label="Question"
                value={item.question}
                onChange={(question) => update({ ...item, question })}
                maxLength={300}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Category (optional)"
                  value={item.category}
                  onChange={(category) => update({ ...item, category })}
                  maxLength={50}
                  placeholder="e.g. Billing, General"
                />
                <TextField
                  label="Badge (optional)"
                  value={item.badge}
                  onChange={(badge) => update({ ...item, badge })}
                  maxLength={40}
                  placeholder="e.g. Popular, New"
                />
              </div>
              <TextAreaField
                label="Answer"
                value={item.answer}
                onChange={(answer) => update({ ...item, answer })}
                maxLength={2000}
                required
                rows={4}
              />
              <CheckboxField
                label="Open by default"
                checked={!!item.isOpenDefault}
                onChange={(isOpenDefault) => update({ ...item, isOpenDefault })}
              />
            </>
          )}
        />
      </FormGroup>

      <FormGroup title="Support / Contact Box (Optional)">
        <TextField
          label="Support title"
          value={data.supportCta?.title}
          onChange={(title) =>
            onChange({
              ...data,
              supportCta: { ...data.supportCta, title },
            })
          }
          maxLength={100}
          placeholder="e.g. Still have questions?"
        />
        <TextAreaField
          label="Support description"
          value={data.supportCta?.description}
          onChange={(description) =>
            onChange({
              ...data,
              supportCta: { ...data.supportCta, description },
            })
          }
          maxLength={300}
          rows={2}
        />
        <OptionalLinkField
          label="Support button"
          value={data.supportCta?.link}
          onChange={(link) =>
            onChange({
              ...data,
              supportCta: { ...data.supportCta, link },
            })
          }
          fallback={{ label: "Contact support", href: "/contact" }}
        />
      </FormGroup>
    </>
  );
}

const CTA_VARIANT_OPTIONS: { value: CtaVariant; label: string }[] = [
  { value: "centered-card", label: "Centered banner (Modern standard)" },
  { value: "split-visual", label: "Split visual (Metric / Proof showcase)" },
  { value: "floating-card", label: "Floating card (Ambient framed glow)" },
  {
    value: "minimal-editorial",
    label: "Minimal editorial (Swiss architectural)",
  },
  {
    value: "vintage-story",
    label: "Vintage editorial story CTA (Dark centered with italic accent)",
  },
  {
    value: "vintage-banner",
    label: "Vintage terracotta banner (Terracotta rounded container with call button)",
  },
];

const CTA_CARD_STYLE_OPTIONS: { value: CtaCardStyle; label: string }[] = [
  { value: "default", label: "Surface (Clean neutral)" },
  { value: "bordered", label: "Bordered (Crisp hairline)" },
  { value: "flat", label: "Flat (Transparent)" },
  { value: "glass", label: "Glassmorphism (Frosted glass)" },
  { value: "elevated", label: "Elevated (Layered shadow)" },
  { value: "contrast", label: "High contrast" },
];

function CtaForm({ data, onChange }: DataFormProps<CtaData>) {
  return (
    <>
      <FormGroup title="Layout & Style">
        <SelectField
          label="Variant"
          value={data.variant || "centered-card"}
          options={CTA_VARIANT_OPTIONS}
          onChange={(variant) => onChange({ ...data, variant })}
        />
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Card style"
            value={data.cardStyle || "default"}
            options={CTA_CARD_STYLE_OPTIONS}
            onChange={(cardStyle) => onChange({ ...data, cardStyle })}
          />
          <SelectField
            label="Text align"
            value={data.align || "center"}
            options={ALIGN_OPTIONS}
            onChange={(align) => onChange({ ...data, align })}
          />
        </div>
      </FormGroup>

      <FormGroup title="Content">
        <TextField
          label="Eyebrow"
          value={data.eyebrow}
          onChange={(eyebrow) => onChange({ ...data, eyebrow })}
          maxLength={80}
          placeholder="e.g. GET STARTED TODAY"
        />
        <TextField
          label="Heading"
          value={data.heading}
          onChange={(heading) => onChange({ ...data, heading })}
          maxLength={200}
          required
        />
        <TextAreaField
          label="Description text"
          value={data.text}
          onChange={(text) => onChange({ ...data, text })}
          maxLength={500}
          rows={3}
        />
      </FormGroup>

      <FormGroup title="Action Buttons">
        <LinkField
          label="Primary button"
          value={data.button}
          onChange={(button) => onChange({ ...data, button })}
        />
        <OptionalLinkField
          label="Secondary button (optional)"
          value={data.secondaryButton}
          onChange={(secondaryButton) => onChange({ ...data, secondaryButton })}
          fallback={{ label: "Learn more", href: "/about" }}
        />
      </FormGroup>

      <FormGroup title="Trust Badges">
        <StringList
          label="Checklist badges"
          items={data.trustBadges || []}
          max={6}
          onChange={(trustBadges) => onChange({ ...data, trustBadges })}
          addLabel="Add trust badge"
        />
      </FormGroup>

      <FormGroup title="Metric Showcase (Split Visual)">
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Metric value"
            value={data.highlightMetric?.value}
            onChange={(value) =>
              onChange({
                ...data,
                highlightMetric: {
                  value,
                  label: data.highlightMetric?.label || "Reliability",
                  subtext: data.highlightMetric?.subtext,
                },
              })
            }
            maxLength={30}
            placeholder="e.g. 99.9% or 10k+"
          />
          <TextField
            label="Metric label"
            value={data.highlightMetric?.label}
            onChange={(label) =>
              onChange({
                ...data,
                highlightMetric: {
                  value: data.highlightMetric?.value || "100%",
                  label,
                  subtext: data.highlightMetric?.subtext,
                },
              })
            }
            maxLength={80}
            placeholder="e.g. Uptime SLA"
          />
        </div>
        <TextField
          label="Metric subtext"
          value={data.highlightMetric?.subtext}
          onChange={(subtext) =>
            onChange({
              ...data,
              highlightMetric: {
                value: data.highlightMetric?.value || "100%",
                label: data.highlightMetric?.label || "Reliability",
                subtext,
              },
            })
          }
          maxLength={120}
          placeholder="e.g. Enterprise SLA guarantee with 24/7 monitoring"
        />
      </FormGroup>
    </>
  );
}

const CONTACT_VARIANT_OPTIONS: { value: ContactVariant; label: string }[] = [
  { value: "clapper-slate", label: "Clapperboard Slate · 35mm film slate & details" },
  { value: "split-form", label: "Split Screen Form & Direct Links (Default)" },
  { value: "cards-hub", label: "Multi-Channel Direct Hub Cards" },
  { value: "minimal-editorial", label: "Minimal Architectural Editorial" },
  { value: "floating-glass", label: "Floating Glass Framed Card" },
  { value: "custom", label: "Custom builder (drag & drop columns)" },
];

const CONTACT_CARD_STYLE_OPTIONS: { value: ContactCardStyle; label: string }[] =
  [
    { value: "default", label: "Default (Soft Tone & Clean Border)" },
    { value: "bordered", label: "Bordered (Crisp Accent Line)" },
    { value: "elevated", label: "Elevated (Subtle Depth Shadow)" },
    { value: "flat", label: "Flat (Modern Minimalist)" },
    { value: "glass", label: "Frosted Glass" },
    { value: "contrast", label: "High Contrast" },
  ];

function ContactForm({ data, onChange }: DataFormProps<ContactData>) {
  const currentVariant = data.variant || "split-form";
  if (currentVariant === "clapper-slate") {
    return <ClapperContactFields data={data} onChange={onChange} />;
  }
  const isCustom = currentVariant === "custom";
  const hasForm = isCustom ? layoutHasForm(resolveContactLayout(data)) : data.showForm;

  return (
    <>
      <FormGroup title="Layout & Styling">
        <SelectField
          label="Layout Variant"
          value={currentVariant}
          onChange={(variant) =>
            onChange({
              ...data,
              variant: variant as ContactVariant,
              ...(variant === "custom" && !data.layout ? { layout: createContactLayout(data) } : {}),
            })
          }
          options={CONTACT_VARIANT_OPTIONS}
        />
        <SelectField
          label="Card Styling"
          value={data.cardStyle || "default"}
          onChange={(cardStyle) =>
            onChange({ ...data, cardStyle: cardStyle as ContactCardStyle })
          }
          options={CONTACT_CARD_STYLE_OPTIONS}
        />
        <SelectField
          label="Header Alignment"
          value={data.align || "left"}
          onChange={(align) =>
            onChange({ ...data, align: align as SectionAlign })
          }
          options={ALIGN_OPTIONS}
        />
      </FormGroup>

      {isCustom && <ContactLayoutEditor data={data} onChange={onChange} />}

      <FormGroup title="Header & Meta">
        <TextField
          label="Eyebrow / Badge"
          value={data.eyebrow || ""}
          onChange={(eyebrow) => onChange({ ...data, eyebrow })}
          maxLength={80}
          placeholder="e.g. GET IN TOUCH • FAST RESPONSE"
        />
        <TextField
          label="Heading"
          value={data.heading}
          onChange={(heading) => onChange({ ...data, heading })}
          maxLength={200}
          required
        />
        <TextAreaField
          label="Subheading / Text"
          value={data.text}
          onChange={(text) => onChange({ ...data, text })}
          maxLength={500}
        />
        <TextField
          label="Response Time Badge"
          value={data.responseTime || ""}
          onChange={(responseTime) => onChange({ ...data, responseTime })}
          maxLength={60}
          placeholder="e.g. Average response time: < 2 hours"
        />
        <TextField
          label="Office / Working Hours"
          value={data.officeHours || ""}
          onChange={(officeHours) => onChange({ ...data, officeHours })}
          maxLength={100}
          placeholder="e.g. Mon – Fri: 9:00 AM – 6:00 PM EST"
        />
      </FormGroup>

      {!isCustom && (
      <>
      <FormGroup title="Direct Contact Details">
        <TextField
          label="Primary Email"
          type="email"
          value={data.email}
          onChange={(email) => onChange({ ...data, email })}
          maxLength={255}
        />
        <TextField
          label="Primary Phone"
          type="tel"
          value={data.phone}
          onChange={(phone) => onChange({ ...data, phone })}
          maxLength={32}
        />
        <TextAreaField
          label="Physical Address / Location"
          value={data.address}
          onChange={(address) => onChange({ ...data, address })}
          maxLength={500}
          rows={2}
        />
      </FormGroup>

      <FormGroup title="Direct Communication Channels">
        <ItemList<ContactChannel>
          label="Direct Channels / Hubs"
          items={data.channels || []}
          max={6}
          onChange={(channels) => onChange({ ...data, channels })}
          create={() => ({
            label: "Support Desk",
            value: "help@example.com",
            description: "Direct assistance for active clients.",
            icon: "mail",
          })}
          itemTitle={(item) => item.label || "Channel"}
          addLabel="Add Direct Channel"
          renderItem={(channel, onChannelChange) => (
            <>
              <TextField
                label="Channel Label / Department"
                value={channel.label}
                onChange={(label) => onChannelChange({ ...channel, label })}
                maxLength={60}
                required
              />
              <TextField
                label="Value / Email / Phone / URL"
                value={channel.value}
                onChange={(value) => onChannelChange({ ...channel, value })}
                maxLength={255}
                placeholder="e.g. hello@company.com or +1 (555) 000-0000"
                required
              />
              <TextField
                label="Description / Context"
                value={channel.description || ""}
                onChange={(description) =>
                  onChannelChange({ ...channel, description })
                }
                maxLength={140}
                placeholder="e.g. Inquiries and client onboarding"
              />
              <SelectField
                label="Icon"
                value={channel.icon || "mail"}
                onChange={(icon) =>
                  onChannelChange({
                    ...channel,
                    icon:
                      (icon as "mail" | "phone" | "chat" | "user") || undefined,
                  })
                }
                options={[
                  { value: "mail", label: "Mail / Email" },
                  { value: "phone", label: "Phone" },
                  { value: "chat", label: "Chat / Messaging" },
                  { value: "user", label: "Support / Agent" },
                ]}
              />
            </>
          )}
        />
      </FormGroup>

      </>
      )}

      <FormGroup title="Enquiry Form">
        {!isCustom && (
          <CheckboxField
            label="Show enquiry form"
            checked={data.showForm}
            onChange={(showForm) => onChange({ ...data, showForm })}
            hint="Allows visitors to submit direct project inquiries online."
          />
        )}
        {isCustom && !hasForm && (
          <p className="text-ed-2xs text-ed-muted leading-normal">
            Add an “Enquiry form” block to a column to show the form.
          </p>
        )}
        {hasForm && (
          <>
            {!isCustom && (
              <TextField
                label="Form Header / Title"
                value={data.formHeading || ""}
                onChange={(formHeading) => onChange({ ...data, formHeading })}
                maxLength={100}
                placeholder="e.g. Send us a message"
              />
            )}
            <TextField
              label="Submit Button Label"
              value={data.submitLabel || "Send Message"}
              onChange={(submitLabel) => onChange({ ...data, submitLabel })}
              maxLength={40}
              required
            />
            <ContactFormFieldsEditor data={data} onChange={onChange} />
            {!data.formFields && (
              <StringList
                label="Service Interest Tags (Clickable Inquiry Options)"
                items={data.serviceOptions || []}
                max={8}
                onChange={(serviceOptions) =>
                  onChange({ ...data, serviceOptions })
                }
                addLabel="Add Service Tag"
              />
            )}
          </>
        )}
      </FormGroup>
    </>
  );
}

function ProductsForm({ data, onChange }: DataFormProps<ProductsData>) {
  return (
    <FormGroup title="Product list">
      <SelectField
        label="Design"
        value={data.design ?? "classic-grid"}
        onChange={(design) => onChange({ ...data, design })}
        options={[
          { value: "classic-grid", label: "Classic grid" },
          { value: "editorial", label: "Filter sidebar" },
          { value: "compact", label: "Compact catalogue" },
          { value: "showcase", label: "Marketplace" },
        ]}
      />
      <TextField label="Eyebrow" value={data.eyebrow ?? ""} onChange={(eyebrow) => onChange({ ...data, eyebrow })} maxLength={120} />
      <TextField label="Heading" value={data.title} onChange={(title) => onChange({ ...data, title })} maxLength={160} />
      <TextAreaField label="Intro" value={data.subtitle ?? ""} onChange={(subtitle) => onChange({ ...data, subtitle })} rows={3} maxLength={320} />
      <SelectField
        label="Columns"
        value={data.layout ?? "grid-3"}
        onChange={(layout) => onChange({ ...data, layout })}
        options={[
          { value: "grid-3", label: "3 columns" },
          { value: "grid-2", label: "2 columns" },
        ]}
      />
      <TextField
        label="Product page address"
        value={data.detailBase ?? "/product"}
        onChange={(detailBase) => onChange({ ...data, detailBase })}
        maxLength={80}
        hint="Must match the address of the page that has the product detail section. A tee called everyday-tee opens at /product/everyday-tee."
      />
      <TextField label="Empty message" value={data.emptyMessage ?? ""} onChange={(emptyMessage) => onChange({ ...data, emptyMessage })} maxLength={200} />
      <CheckboxField label="Show search" checked={data.showSearch !== false} onChange={(showSearch) => onChange({ ...data, showSearch })} />
      <CheckboxField label="Show category filter" checked={data.showCategoryFilter !== false} onChange={(showCategoryFilter) => onChange({ ...data, showCategoryFilter })} />
      <CheckboxField label="Show sorting" checked={data.showSort !== false} onChange={(showSort) => onChange({ ...data, showSort })} />
    </FormGroup>
  );
}

function ProductDetailForm({ data, onChange }: DataFormProps<ProductDetailData>) {
  return (
    <FormGroup title="Product page">
      <SelectField
        label="Design"
        value={data.design ?? "split"}
        onChange={(design) => onChange({ ...data, design })}
        options={[
          { value: "split", label: "Split gallery" },
          { value: "gallery-focus", label: "Thumbnail rail" },
          { value: "editorial", label: "Centered showcase" },
          { value: "compact", label: "Quick view card" },
        ]}
      />
      <TextField label="Back link label" value={data.backLabel ?? ""} onChange={(backLabel) => onChange({ ...data, backLabel })} maxLength={80} />
      <TextField
        label="Back link address"
        value={data.backHref ?? ""}
        onChange={(backHref) => onChange({ ...data, backHref })}
        maxLength={200}
        hint="Usually the page that lists the products, such as /shop."
      />
      <CheckboxField label="Show description" checked={data.showDescription !== false} onChange={(showDescription) => onChange({ ...data, showDescription })} />
      <CheckboxField label="Show stock" checked={data.showStock !== false} onChange={(showStock) => onChange({ ...data, showStock })} />
    </FormGroup>
  );
}

function TextForm({ data, onChange }: DataFormProps<TextData>) {
  const isPullQuote = data.variant === "pull-quote";

  return (
    <FormGroup title="Content">
      <SelectField
        label="Design style"
        value={data.variant || "standard"}
        options={[
          { value: "standard", label: "Standard (Heading & paragraphs)" },
          { value: "pull-quote", label: "Pull quote (Large editorial quote)" },
          { value: "columns-2", label: "Two columns (Editorial magazine split)" },
          { value: "lead", label: "Lead paragraph (Feature story)" },
        ]}
        onChange={(variant) =>
          onChange({
            ...data,
            variant: variant as TextData["variant"],
          })
        }
      />
      <SelectField
        label="Text alignment"
        value={data.align || "center"}
        options={ALIGN_OPTIONS}
        onChange={(align) => onChange({ ...data, align: align as SectionAlign })}
      />
      <SelectField
        label="Content width"
        value={data.maxWidth || (isPullQuote ? "narrow" : "standard")}
        options={[
          { value: "standard", label: "Standard (760px)" },
          { value: "narrow", label: "Narrow / Focused (620px)" },
          { value: "wide", label: "Wide (980px)" },
          { value: "full", label: "Full width" },
        ]}
        onChange={(maxWidth) =>
          onChange({ ...data, maxWidth: maxWidth as TextData["maxWidth"] })
        }
      />
      <TextField
        label="Small text above heading (optional)"
        value={data.eyebrow ?? ""}
        onChange={(eyebrow) => onChange({ ...data, eyebrow })}
        maxLength={120}
        placeholder="e.g. About us / Director's statement"
      />
      <TextField
        label={isPullQuote ? "Heading (optional)" : "Heading"}
        value={data.heading ?? ""}
        onChange={(heading) => onChange({ ...data, heading })}
        maxLength={200}
        placeholder={isPullQuote ? "Optional title above quote" : "About us"}
      />
      <TextAreaField
        label={isPullQuote ? "Quote text" : "Text"}
        value={data.body}
        onChange={(body) => onChange({ ...data, body })}
        rows={isPullQuote ? 4 : 10}
        maxLength={20000}
        hint={isPullQuote ? undefined : "Leave a blank line between paragraphs."}
      />
      {isPullQuote && (
        <TextField
          label="Quote author / citation (optional)"
          value={data.quoteAuthor ?? ""}
          onChange={(quoteAuthor) => onChange({ ...data, quoteAuthor })}
          maxLength={120}
          placeholder="e.g. — Jane Doe, Director"
        />
      )}
      <OptionalLinkField
        label="Button (optional)"
        value={data.cta}
        onChange={(cta) => onChange({ ...data, cta })}
        fallback={{ label: "Learn more", href: "/about" }}
      />
    </FormGroup>
  );
}

function GalleryForm({ data, onChange }: DataFormProps<GalleryData>) {
  return (
    <>
      <FormGroup title="Content">
        <TextField
          label="Heading"
          value={data.heading}
          onChange={(heading) => onChange({ ...data, heading })}
          maxLength={200}
        />
        <ColumnsFields data={data} onChange={onChange} />
      </FormGroup>
      <FormGroup title="Images">
        <ItemList
          label="Images"
          items={data.images}
          max={48}
          onChange={(images) => onChange({ ...data, images })}
          create={() => ({ url: "", alt: "" })}
          itemTitle={(image, index) => image.alt || `Image ${index + 1}`}
          addLabel="Add image"
          renderItem={(image, update) => (
            <ImageField
              label="Image"
              value={image}
              onChange={(next) => update(next ?? { url: "", alt: "" })}
              dimensionHint={MEDIA_SIZE.galleryImage}
            />
          )}
        />
      </FormGroup>
    </>
  );
}

function LogosForm({ data, onChange }: DataFormProps<LogosData>) {
  return (
    <>
      <FormGroup title="Content">
        <TextField
          label="Heading"
          value={data.heading}
          onChange={(heading) => onChange({ ...data, heading })}
          maxLength={200}
        />
        <CheckboxField
          label="Show logos in grayscale"
          checked={data.grayscale}
          onChange={(grayscale) => onChange({ ...data, grayscale })}
        />
      </FormGroup>
      <FormGroup title="Logos">
        <ItemList
          label="Logos"
          items={data.logos}
          max={24}
          onChange={(logos) => onChange({ ...data, logos })}
          create={() => ({ url: "", alt: "" })}
          itemTitle={(logo, index) => logo.alt || `Logo ${index + 1}`}
          addLabel="Add logo"
          renderItem={(logo, update) => (
            <ImageField
              label="Logo"
              value={logo}
              onChange={(next) => update(next ?? { url: "", alt: "" })}
              dimensionHint={MEDIA_SIZE.logo}
              hint={MEDIA_HINT.logo}
            />
          )}
        />
      </FormGroup>
    </>
  );
}

function SplitForm({ data, onChange }: DataFormProps<SplitData>) {
  return (
    <>
      <FormGroup title="Content">
        <TextField
          label="Small text above heading"
          value={data.eyebrow}
          onChange={(eyebrow) => onChange({ ...data, eyebrow })}
          maxLength={200}
        />
        <TextField
          label="Heading"
          value={data.heading}
          onChange={(heading) => onChange({ ...data, heading })}
          maxLength={200}
          required
        />
        <TextAreaField
          label="Text"
          value={data.body}
          onChange={(body) => onChange({ ...data, body })}
          maxLength={4000}
          rows={5}
          hint="Leave a blank line between paragraphs."
        />
        <StringList
          label="Bullet points"
          items={data.bullets}
          max={8}
          onChange={(bullets) => onChange({ ...data, bullets })}
          addLabel="Add bullet"
        />
        <OptionalLinkField
          label="Button"
          value={data.cta}
          onChange={(cta) => onChange({ ...data, cta })}
          fallback={{ label: "Learn more", href: "/contact" }}
        />
      </FormGroup>
      <FormGroup title="Image">
        <SelectField
          label="Image position"
          value={data.imagePosition}
          options={[
            { value: "right", label: "Right of the text" },
            { value: "left", label: "Left of the text" },
          ]}
          onChange={(imagePosition) => onChange({ ...data, imagePosition })}
        />
        <SelectField
          label="Image style"
          value={data.imageStyle || "plain"}
          options={[
            { value: "plain", label: "Standard image" },
            { value: "polaroid", label: "Polaroid with tape (Vintage)" },
          ]}
          onChange={(imageStyle) =>
            onChange({ ...data, imageStyle: imageStyle as "plain" | "polaroid" })
          }
        />
        {data.imageStyle === "polaroid" && (
          <TextField
            label="Tape label"
            value={data.imageTapeLabel ?? ""}
            onChange={(imageTapeLabel) => onChange({ ...data, imageTapeLabel })}
            placeholder="e.g. Our studio, 2024"
            maxLength={60}
          />
        )}
        <ImageField
          label="Image"
          value={data.image}
          onChange={(image) => onChange({ ...data, image })}
          optional
          dimensionHint={MEDIA_SIZE.splitImage}
        />
      </FormGroup>
    </>
  );
}

function StatsForm({ data, onChange }: DataFormProps<StatsData>) {
  return (
    <>
      <FormGroup title="Content">
        <TextField
          label="Heading"
          value={data.heading}
          onChange={(heading) => onChange({ ...data, heading })}
          maxLength={200}
        />
        <TextAreaField
          label="Intro"
          value={data.intro}
          onChange={(intro) => onChange({ ...data, intro })}
          maxLength={500}
        />
      </FormGroup>
      <FormGroup title="Numbers">
        <ItemList
          label="Statistics"
          items={data.items}
          max={8}
          onChange={(items) => onChange({ ...data, items })}
          create={() => ({ value: "100", label: "Label" })}
          itemTitle={(item) => `${item.value} ${item.label}`}
          addLabel="Add statistic"
          renderItem={(item, update) => (
            <>
              <TextField
                label="Number"
                value={item.value}
                onChange={(value) => update({ ...item, value })}
                maxLength={20}
                required
              />
              <TextField
                label="Label"
                value={item.label}
                onChange={(label) => update({ ...item, label })}
                maxLength={80}
                required
              />
            </>
          )}
        />
      </FormGroup>
    </>
  );
}

const PRICING_VARIANT_OPTIONS: { value: PricingVariant; label: string }[] = [
  { value: "cards-grid", label: "Executive cards (Modern standard)" },
  {
    value: "minimal-monochrome",
    label: "Minimal monochrome (Swiss architectural)",
  },
  { value: "spotlight-tier", label: "Spotlight tier (Asymmetric pro focus)" },
  {
    value: "horizontal-rows",
    label: "Horizontal rows (Enterprise consultative)",
  },
];

const PRICING_CARD_STYLE_OPTIONS: { value: PricingCardStyle; label: string }[] =
  [
    { value: "default", label: "Surface (Clean neutral)" },
    { value: "bordered", label: "Bordered (Crisp hairline)" },
    { value: "flat", label: "Flat (Transparent)" },
    { value: "glass", label: "Glassmorphism (Frosted glass)" },
    { value: "elevated", label: "Elevated (Ambient shadow)" },
    { value: "contrast", label: "High contrast" },
  ];

function PricingForm({ data, onChange }: DataFormProps<PricingData>) {
  return (
    <>
      <FormGroup title="Layout & Style">
        <SelectField
          label="Variant"
          value={data.variant || "cards-grid"}
          options={PRICING_VARIANT_OPTIONS}
          onChange={(variant) => onChange({ ...data, variant })}
        />
        <SelectField
          label="Card style"
          value={data.cardStyle || "default"}
          options={PRICING_CARD_STYLE_OPTIONS}
          onChange={(cardStyle) => onChange({ ...data, cardStyle })}
        />
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Columns"
            value={
              data.columns ||
              (Math.min(Math.max(data.plans.length, 1), 4) as GridColumns)
            }
            options={COLUMN_OPTIONS}
            onChange={(columns) => onChange({ ...data, columns })}
          />
          <SelectField
            label="Text align"
            value={data.align || "center"}
            options={ALIGN_OPTIONS}
            onChange={(align) => onChange({ ...data, align })}
          />
        </div>
      </FormGroup>

      <FormGroup title="Content">
        <TextField
          label="Eyebrow"
          value={data.eyebrow}
          onChange={(eyebrow) => onChange({ ...data, eyebrow })}
          maxLength={80}
          placeholder="e.g. PRICING PLANS"
        />
        <TextField
          label="Heading"
          value={data.heading}
          onChange={(heading) => onChange({ ...data, heading })}
          maxLength={200}
          required
        />
        <TextAreaField
          label="Intro"
          value={data.intro}
          onChange={(intro) => onChange({ ...data, intro })}
          maxLength={500}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Billing cycle label"
            value={data.billingCycleLabel}
            onChange={(billingCycleLabel) =>
              onChange({ ...data, billingCycleLabel })
            }
            maxLength={80}
            placeholder="e.g. Billed annually"
          />
          <TextField
            label="Discount badge"
            value={data.discountBadge}
            onChange={(discountBadge) => onChange({ ...data, discountBadge })}
            maxLength={60}
            placeholder="e.g. Save 20%"
          />
        </div>
        <TextField
          label="Footer guarantee / note"
          value={data.footerNote}
          onChange={(footerNote) => onChange({ ...data, footerNote })}
          maxLength={300}
          placeholder="e.g. 14-day money-back guarantee • No credit card required"
        />
      </FormGroup>

      <FormGroup title="Plans">
        <ItemList<PricingPlan>
          label="Plans"
          items={data.plans}
          max={6}
          onChange={(plans) => onChange({ ...data, plans })}
          create={() => ({
            name: "New tier",
            price: "$29",
            period: "/ month",
            features: ["Core feature 1", "Core feature 2"],
            featured: false,
          })}
          itemTitle={(plan) => plan.name}
          addLabel="Add plan"
          renderItem={(plan, update) => (
            <>
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Name"
                  value={plan.name}
                  onChange={(name) => update({ ...plan, name })}
                  maxLength={60}
                  required
                />
                <TextField
                  label="Badge / Tag"
                  value={plan.badge}
                  onChange={(badge) => update({ ...plan, badge })}
                  maxLength={50}
                  placeholder="e.g. Most Popular"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <TextField
                  label="Price"
                  value={plan.price}
                  onChange={(price) => update({ ...plan, price })}
                  maxLength={30}
                  required
                  placeholder="$49"
                />
                <TextField
                  label="Period"
                  value={plan.period}
                  onChange={(period) => update({ ...plan, period })}
                  maxLength={30}
                  placeholder="/ month"
                />
                <TextField
                  label="Original price"
                  value={plan.originalPrice}
                  onChange={(originalPrice) =>
                    update({ ...plan, originalPrice })
                  }
                  maxLength={30}
                  placeholder="$79 (strike)"
                />
              </div>

              <TextAreaField
                label="Description"
                value={plan.description}
                onChange={(description) => update({ ...plan, description })}
                maxLength={300}
                rows={2}
              />

              <StringList
                label="Included Features"
                items={plan.features}
                max={15}
                onChange={(features) => update({ ...plan, features })}
                addLabel="Add feature"
              />

              <StringList
                label="Excluded Features (Optional Strike)"
                items={plan.excludedFeatures || []}
                max={15}
                onChange={(excludedFeatures) =>
                  update({ ...plan, excludedFeatures })
                }
                addLabel="Add excluded feature"
              />

              <OptionalLinkField
                label="Button"
                value={plan.cta}
                onChange={(cta) => update({ ...plan, cta })}
                fallback={{ label: "Get started", href: "/contact" }}
              />

              <TextField
                label="Highlight Note"
                value={plan.highlightNote}
                onChange={(highlightNote) => update({ ...plan, highlightNote })}
                maxLength={120}
                placeholder="e.g. Free 14-day trial • Cancel anytime"
              />

              <CheckboxField
                label="Highlight as featured plan"
                checked={plan.featured}
                onChange={(featured) => update({ ...plan, featured })}
              />
            </>
          )}
        />
      </FormGroup>
    </>
  );
}

function MediaForm({ data, onChange }: DataFormProps<MediaData>) {
  return (
    <>
      <FormGroup title="Content">
        <SelectField
          label="Type"
          value={data.kind}
          options={[
            { value: "image", label: "Image" },
            { value: "video", label: "YouTube or Vimeo video" },
          ]}
          onChange={(kind) => onChange({ ...data, kind })}
        />
        <TextField
          label="Heading"
          value={data.heading}
          onChange={(heading) => onChange({ ...data, heading })}
          maxLength={200}
        />
        {data.kind === "image" ? (
          <ImageField
            label="Image"
            value={data.image}
            onChange={(image) => onChange({ ...data, image })}
            optional
            dimensionHint={wideImageSize(data.aspect)}
          />
        ) : (
          <VideoField
            label="Video"
            value={data.videoUrl}
            onChange={(videoUrl) =>
              onChange({ ...data, videoUrl: videoUrl || "" })
            }
            placeholder="https://www.youtube.com/watch?v=… or upload MP4"
            dimensionHint={wideImageSize(data.aspect)}
            hint="Plays with privacy-enhanced embedding or direct MP4 streaming."
          />
        )}
        <TextField
          label="Caption"
          value={data.caption}
          onChange={(caption) => onChange({ ...data, caption })}
          maxLength={300}
        />
      </FormGroup>
      <FormGroup title="Layout">
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Shape"
            value={data.aspect}
            options={[
              { value: "16:9", label: "Wide 16:9" },
              { value: "4:3", label: "Classic 4:3" },
              { value: "1:1", label: "Square" },
            ]}
            onChange={(aspect) => onChange({ ...data, aspect })}
          />
          <SelectField
            label="Width"
            value={data.width}
            options={[
              { value: "contained", label: "Contained" },
              { value: "wide", label: "Full width" },
            ]}
            onChange={(width) => onChange({ ...data, width })}
          />
        </div>
      </FormGroup>
    </>
  );
}

const TEAM_VARIANT_OPTIONS: { value: TeamVariant; label: string }[] = [
  { value: "grid-cards", label: "Executive Cards Grid (Default)" },
  { value: "spotlight-featured", label: "Leader Spotlight + Roster Grid" },
  { value: "minimal-editorial", label: "Swiss Architectural Line Roster" },
  { value: "glass-overlay", label: "Cinematic Glass Hover Overlay" },
];

const TEAM_CARD_STYLE_OPTIONS: { value: TeamCardStyle; label: string }[] = [
  { value: "default", label: "Default (Soft Tone & Clean Border)" },
  { value: "bordered", label: "Bordered (Crisp Accent Line)" },
  { value: "elevated", label: "Elevated (Subtle Depth Shadow)" },
  { value: "flat", label: "Flat (Modern Minimalist)" },
  { value: "glass", label: "Frosted Glass" },
  { value: "contrast", label: "High Contrast" },
];

const TEAM_SOCIAL_PLATFORM_OPTIONS: {
  value: "linkedin" | "twitter" | "github" | "email" | "link";
  label: string;
}[] = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "X / Twitter" },
  { value: "github", label: "GitHub" },
  { value: "email", label: "Email (mailto:)" },
  { value: "link", label: "Custom Link" },
];

function TeamForm({ data, onChange }: DataFormProps<TeamData>) {
  const currentVariant = data.variant || "grid-cards";

  return (
    <>
      <FormGroup title="Layout & Styling">
        <SelectField
          label="Layout Variant"
          value={currentVariant}
          onChange={(variant) =>
            onChange({ ...data, variant: variant as TeamVariant })
          }
          options={TEAM_VARIANT_OPTIONS}
        />
        <SelectField
          label="Card Styling"
          value={data.cardStyle || "default"}
          onChange={(cardStyle) =>
            onChange({ ...data, cardStyle: cardStyle as TeamCardStyle })
          }
          options={TEAM_CARD_STYLE_OPTIONS}
        />
        <SelectField
          label="Header Alignment"
          value={data.align || "center"}
          onChange={(align) =>
            onChange({ ...data, align: align as SectionAlign })
          }
          options={ALIGN_OPTIONS}
        />
      </FormGroup>

      <FormGroup title="Header & Meta">
        <TextField
          label="Eyebrow / Badge"
          value={data.eyebrow || ""}
          onChange={(eyebrow) => onChange({ ...data, eyebrow })}
          maxLength={80}
          placeholder="e.g. OUR PEOPLE • WORLD-CLASS LEADERSHIP"
        />
        <TextField
          label="Heading"
          value={data.heading}
          onChange={(heading) => onChange({ ...data, heading })}
          maxLength={200}
          required
        />
        <TextAreaField
          label="Intro"
          value={data.intro}
          onChange={(intro) => onChange({ ...data, intro })}
          maxLength={500}
        />
        <TextField
          label="Status / Counter Badge"
          value={data.badge || ""}
          onChange={(badge) => onChange({ ...data, badge })}
          maxLength={80}
          placeholder="e.g. 40+ Specialists Worldwide"
        />
        {currentVariant !== "spotlight-featured" &&
          currentVariant !== "minimal-editorial" && (
            <ColumnsFields data={data} onChange={onChange} />
          )}
      </FormGroup>

      <FormGroup title="Team Members">
        <ItemList<TeamMember>
          label="Members"
          items={data.members}
          max={24}
          onChange={(members) => onChange({ ...data, members })}
          create={() => ({
            name: "Jane Doe",
            role: "Principal Architect",
            department: "Engineering",
            bio: "Leads distributed systems engineering and AI platform infrastructure.",
          })}
          itemTitle={(member) => member.name || "Member"}
          addLabel="Add Team Member"
          renderItem={(member, update) => (
            <>
              <TextField
                label="Full Name"
                value={member.name}
                onChange={(name) => update({ ...member, name })}
                maxLength={120}
                required
              />
              <TextField
                label="Role / Title"
                value={member.role}
                onChange={(role) => update({ ...member, role })}
                maxLength={120}
                placeholder="e.g. Chief Executive Officer"
              />
              <TextField
                label="Department / Focus"
                value={member.department || ""}
                onChange={(department) => update({ ...member, department })}
                maxLength={80}
                placeholder="e.g. Leadership, Design, Engineering"
              />
              <TextField
                label="Location / Base"
                value={member.location || ""}
                onChange={(location) => update({ ...member, location })}
                maxLength={100}
                placeholder="e.g. San Francisco, CA or London, UK"
              />
              <TextAreaField
                label="Short Bio / Description"
                value={member.bio}
                onChange={(bio) => update({ ...member, bio })}
                maxLength={600}
                rows={2}
              />
              <ImageField
                label="Portrait Photo"
                value={member.photo}
                onChange={(photo) => update({ ...member, photo })}
                optional
                dimensionHint={MEDIA_SIZE.teamPortrait}
                hint="Head-and-shoulders photo with the face centred; some designs crop it to a square or circle."
              />
              <StringList
                label="Skills / Highlights / Credentials"
                items={member.tags || []}
                max={5}
                onChange={(tags) => update({ ...member, tags })}
                addLabel="Add Highlight Tag"
              />
              <OptionalLinkField
                label="Primary Profile Link"
                value={member.link}
                onChange={(link) => update({ ...member, link })}
                fallback={{
                  label: "View Profile",
                  href: "https://linkedin.com/",
                }}
              />
              <ItemList<TeamSocialLink>
                label="Social & Direct Channels"
                items={member.socialLinks || []}
                max={5}
                onChange={(socialLinks) => update({ ...member, socialLinks })}
                create={() => ({
                  platform: "linkedin",
                  url: "https://linkedin.com/",
                })}
                itemTitle={(item) => item.platform}
                addLabel="Add Social Link"
                renderItem={(social, updateSocial) => (
                  <>
                    <SelectField
                      label="Platform"
                      value={social.platform}
                      onChange={(platform) =>
                        updateSocial({
                          ...social,
                          platform: platform as TeamSocialLink["platform"],
                        })
                      }
                      options={TEAM_SOCIAL_PLATFORM_OPTIONS}
                    />
                    <TextField
                      label="Profile URL / Link"
                      value={social.url}
                      onChange={(url) => updateSocial({ ...social, url })}
                      maxLength={255}
                      placeholder="https://..."
                      required
                    />
                  </>
                )}
              />
            </>
          )}
        />
      </FormGroup>
    </>
  );
}

const CAROUSEL_VARIANT_OPTIONS: { value: CarouselVariant; label: string }[] = [
  { value: "curved-banner", label: "Dynamic 3D Curved Arc Video Reel Banner" },
  { value: "image-gallery", label: "Images Carousel · Full Visual Gallery" },
  { value: "image-strip", label: "Images Carousel · Multi-Image Filmstrip" },
  { value: "image-coverflow", label: "Images Carousel · 3D Coverflow Reel" },
  { value: "cards", label: "Multi-Cards Interactive Slider" },
  { value: "hero-slider", label: "Cinematic Hero Banner Slider" },
  { value: "showcase", label: "3D Perspective Focus Showcase" },
  { value: "minimal-editorial", label: "Minimal Editorial Slide Deck" },
];

const CAROUSEL_CARD_STYLE_OPTIONS: {
  value: CarouselCardStyle;
  label: string;
}[] = [
  { value: "default", label: "Default (Soft Tone & Clean Border)" },
  { value: "bordered", label: "Bordered (Crisp Accent Line)" },
  { value: "elevated", label: "Elevated (Subtle Depth Shadow)" },
  { value: "flat", label: "Flat (Modern Minimalist)" },
  { value: "glass", label: "Frosted Glass" },
  { value: "contrast", label: "High Contrast" },
];

function CarouselForm({ data, onChange }: DataFormProps<CarouselData>) {
  const currentVariant = data.variant || "cards";
  const isImageVariant =
    currentVariant === "image-gallery" ||
    currentVariant === "image-strip" ||
    currentVariant === "image-coverflow";
  const slideImageSize = isImageVariant
    ? wideImageSize(data.imageAspect || "16:9")
    : currentVariant === "hero-slider"
      ? MEDIA_SIZE.fullBleed
      : currentVariant === "curved-banner"
        ? MEDIA_SIZE.reelCard
        : currentVariant === "showcase"
          ? wideImageSize("16:9")
          : currentVariant === "minimal-editorial"
            ? cardImageSize("4:3")
            : cardImageSize("16:9");

  return (
    <>
      <FormGroup title="Layout & Styling">
        <SelectField
          label="Layout Variant"
          value={currentVariant}
          onChange={(variant) =>
            onChange({ ...data, variant: variant as CarouselVariant })
          }
          options={CAROUSEL_VARIANT_OPTIONS}
        />
        {isImageVariant && (
          <SelectField
            label="Image Aspect Ratio"
            value={data.imageAspect || "16:9"}
            onChange={(aspect) =>
              onChange({
                ...data,
                imageAspect: aspect as "16:9" | "4:3" | "1:1" | "21:9" | "3:4",
              })
            }
            options={[
              { value: "16:9", label: "16:9 (Landscape Cinematic)" },
              { value: "4:3", label: "4:3 (Standard Visual)" },
              { value: "1:1", label: "1:1 (Square)" },
              { value: "21:9", label: "21:9 (Ultrawide Banner)" },
              { value: "3:4", label: "3:4 (Portrait)" },
            ]}
          />
        )}
        {currentVariant === "image-strip" && (
          <SelectField
            label="Visible Columns (Desktop)"
            value={String(data.columns || 3)}
            onChange={(val) =>
              onChange({ ...data, columns: parseInt(val, 10) as GridColumns })
            }
            options={[
              { value: "2", label: "2 Columns (Large Showcase)" },
              { value: "3", label: "3 Columns (Balanced Filmstrip)" },
              { value: "4", label: "4 Columns (Compact Grid Reel)" },
            ]}
          />
        )}
        {!isImageVariant && (
          <SelectField
            label="Card Styling"
            value={data.cardStyle || "default"}
            onChange={(cardStyle) =>
              onChange({ ...data, cardStyle: cardStyle as CarouselCardStyle })
            }
            options={CAROUSEL_CARD_STYLE_OPTIONS}
          />
        )}
        <SelectField
          label="Header Alignment"
          value={data.align || "left"}
          onChange={(align) =>
            onChange({ ...data, align: align as SectionAlign })
          }
          options={ALIGN_OPTIONS}
        />
      </FormGroup>

      {currentVariant !== "hero-slider" && (
        <FormGroup title="Header & Meta">
          <TextField
            label="Eyebrow / Badge"
            value={data.eyebrow || ""}
            onChange={(eyebrow) => onChange({ ...data, eyebrow })}
            maxLength={80}
            placeholder="e.g. VISUAL GALLERY"
          />
          <TextField
            label="Heading"
            value={data.heading || ""}
            onChange={(heading) => onChange({ ...data, heading })}
            maxLength={200}
          />
          <TextAreaField
            label="Intro / Subheading"
            value={data.intro || ""}
            onChange={(intro) => onChange({ ...data, intro })}
            maxLength={500}
          />
          <TextField
            label="Status / Counter Badge"
            value={data.badge || ""}
            onChange={(badge) => onChange({ ...data, badge })}
            maxLength={80}
            placeholder="e.g. Interactive Showcase"
          />
        </FormGroup>
      )}

      <FormGroup title="Playback & Controls">
        <CheckboxField
          label="Auto-play slides"
          checked={data.autoPlay ?? false}
          onChange={(autoPlay) => onChange({ ...data, autoPlay })}
          hint="Automatically transitions through slides continuously."
        />
        {data.autoPlay && (
          <TextField
            label="Slide Interval (seconds)"
            type="number"
            value={String(data.interval || 5)}
            onChange={(val) => {
              const num = parseInt(val, 10);
              onChange({
                ...data,
                interval: isNaN(num) ? 5 : Math.max(2, Math.min(30, num)),
              });
            }}
          />
        )}
        <CheckboxField
          label="Pause auto-play on mouse hover"
          checked={data.pauseOnHover ?? true}
          onChange={(pauseOnHover) => onChange({ ...data, pauseOnHover })}
        />
        <CheckboxField
          label="Show navigation arrows"
          checked={data.showArrows ?? true}
          onChange={(showArrows) => onChange({ ...data, showArrows })}
        />
        <CheckboxField
          label="Show pagination dots / progress bar"
          checked={data.showDots ?? true}
          onChange={(showDots) => onChange({ ...data, showDots })}
        />
        {currentVariant === "image-gallery" && (
          <CheckboxField
            label="Show bottom thumbnail strip"
            checked={data.showThumbnails ?? true}
            onChange={(showThumbnails) => onChange({ ...data, showThumbnails })}
          />
        )}
      </FormGroup>

      <FormGroup title="Slides & Imagery">
        <ItemList<CarouselSlide>
          label="Slides"
          items={data.slides}
          max={12}
          onChange={(slides) => onChange({ ...data, slides })}
          create={() => ({
            title: "New Highlight Image",
            subtitle: "Category",
            caption: "Detailed visual caption and snapshot description.",
            badge: "FEATURED",
            image: {
              url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&auto=format&fit=crop&q=80",
              alt: "Visual showcase slide",
            },
          })}
          itemTitle={(slide) => slide.title || "Slide"}
          addLabel="Add Slide / Image"
          renderItem={(slide, update) => (
            <>
              <ImageField
                label="Slide Image / Photography"
                value={slide.image}
                onChange={(image) => update({ ...slide, image })}
                optional
                dimensionHint={slideImageSize}
              />
              <TextField
                label="Slide Title / Headline"
                value={slide.title}
                onChange={(title) => update({ ...slide, title })}
                maxLength={120}
                required
              />
              <TextField
                label="Subtitle / Category"
                value={slide.subtitle || ""}
                onChange={(subtitle) => update({ ...slide, subtitle })}
                maxLength={120}
                placeholder="e.g. Architectural Design"
              />
              <TextField
                label="Badge / Tag"
                value={slide.badge || ""}
                onChange={(badge) => update({ ...slide, badge })}
                maxLength={60}
                placeholder="e.g. 2026 ARCHIVE"
              />
              <TextAreaField
                label="Caption / Description"
                value={slide.caption || slide.description || ""}
                onChange={(text) =>
                  update({ ...slide, caption: text, description: text })
                }
                maxLength={600}
                rows={2}
              />
              <OptionalLinkField
                label="Primary Button / Action"
                value={slide.button}
                onChange={(button) => update({ ...slide, button })}
                fallback={{ label: "View Details", href: "/work" }}
              />
              <OptionalLinkField
                label="Secondary Button"
                value={slide.secondaryButton}
                onChange={(secondaryButton) =>
                  update({ ...slide, secondaryButton })
                }
                fallback={{ label: "Explore", href: "/contact" }}
              />
            </>
          )}
        />
      </FormGroup>
    </>
  );
}

const MARQUEE_VARIANT_OPTIONS: { value: MarqueeVariant; label: string }[] = [
  { value: "ticker-text", label: "Bold Infinite Typographic Ticker" },
  { value: "cards-stream", label: "Continuous Feature Cards Stream" },
  { value: "pill-badges", label: "Glowing Capability Badges / Tech Stream" },
  { value: "dual-directional", label: "Dual Opposite Streaming Tracks" },
];

function normalizeMarqueeVariant(variant?: string): MarqueeVariant {
  if (!variant) return "ticker-text";
  if (
    variant === "gradient-pill" ||
    variant === "pills" ||
    variant === "badges"
  )
    return "pill-badges";
  if (variant === "cards" || variant === "features") return "cards-stream";
  if (variant === "dual" || variant === "two-way") return "dual-directional";
  if (MARQUEE_VARIANT_OPTIONS.some((o) => o.value === variant))
    return variant as MarqueeVariant;
  return "ticker-text";
}

function MarqueeForm({ data, onChange }: DataFormProps<MarqueeData>) {
  const currentVariant = normalizeMarqueeVariant(data.variant);

  return (
    <>
      <FormGroup title="Layout & Styling">
        <SelectField
          label="Marquee Style"
          value={currentVariant}
          onChange={(variant) =>
            onChange({ ...data, variant: normalizeMarqueeVariant(variant) })
          }
          options={MARQUEE_VARIANT_OPTIONS}
        />
        <SelectField
          label="Scroll Speed"
          value={data.speed || "normal"}
          onChange={(speed) =>
            onChange({ ...data, speed: speed as "slow" | "normal" | "fast" })
          }
          options={[
            { value: "slow", label: "Gentle (Slow / Relaxed)" },
            { value: "normal", label: "Normal (Standard Flow)" },
            { value: "fast", label: "Dynamic (Fast Pace)" },
          ]}
        />
        <SelectField
          label="Primary Direction"
          value={data.direction || "left"}
          onChange={(direction) =>
            onChange({ ...data, direction: direction as "left" | "right" })
          }
          options={[
            { value: "left", label: "Leftward (Standard ←)" },
            { value: "right", label: "Rightward (Reverse →)" },
          ]}
        />
        {currentVariant === "ticker-text" && (
          <SelectField
            label="Typography Size"
            value={data.fontSize || "medium"}
            onChange={(fontSize) =>
              onChange({
                ...data,
                fontSize: fontSize as "small" | "medium" | "large" | "huge",
              })
            }
            options={[
              { value: "small", label: "Small (18px)" },
              { value: "medium", label: "Medium (28px - Standard)" },
              { value: "large", label: "Large (42px - Impact)" },
              { value: "huge", label: "Huge (60px - Marquee Headline)" },
            ]}
          />
        )}
        <CheckboxField
          label="Pause scrolling on hover"
          checked={data.pauseOnHover ?? true}
          onChange={(pauseOnHover) => onChange({ ...data, pauseOnHover })}
        />
        <CheckboxField
          label="Soft edge gradient fade masks"
          checked={data.gradientFades ?? true}
          onChange={(gradientFades) => onChange({ ...data, gradientFades })}
          hint="Creates a seamless fade transition on the left and right screen borders."
        />
      </FormGroup>

      <FormGroup title="Optional Header">
        <TextField
          label="Eyebrow"
          value={data.eyebrow || ""}
          onChange={(eyebrow) => onChange({ ...data, eyebrow })}
          maxLength={80}
          placeholder="e.g. LIVE NETWORK ACTIVITY"
        />
        <TextField
          label="Heading"
          value={data.heading || ""}
          onChange={(heading) => onChange({ ...data, heading })}
          maxLength={200}
        />
        <TextAreaField
          label="Intro"
          value={data.intro || ""}
          onChange={(intro) => onChange({ ...data, intro })}
          maxLength={500}
        />
      </FormGroup>

      <FormGroup title="Streaming Items (Track 1)">
        <ItemList<MarqueeItem>
          label="Marquee Items"
          items={data.items}
          max={24}
          onChange={(items) => onChange({ ...data, items })}
          create={() => ({
            text: "ENTERPRISE QUALITY",
            badge: "99.99%",
            icon: "bolt",
          })}
          itemTitle={(item) => item.text || "Item"}
          addLabel="Add Marquee Item"
          renderItem={(item, update) => (
            <>
              <TextField
                label="Primary Text"
                value={item.text}
                onChange={(text) => update({ ...item, text })}
                maxLength={120}
                required
              />
              <TextField
                label="Badge / Tag"
                value={item.badge || ""}
                onChange={(badge) => update({ ...item, badge })}
                maxLength={60}
                placeholder="e.g. NEW or 99.9%"
              />
              {currentVariant === "cards-stream" && (
                <TextField
                  label="Subtext / Description"
                  value={item.subtext || ""}
                  onChange={(subtext) => update({ ...item, subtext })}
                  maxLength={120}
                  placeholder="e.g. High-throughput edge cluster"
                />
              )}
              <IconPickerField
                label="Icon"
                value={item.icon || ""}
                imageValue={item.iconImage}
                onChange={({ icon, iconImage }) =>
                  update({ ...item, icon, iconImage })
                }
              />
            </>
          )}
        />
      </FormGroup>

      {currentVariant === "dual-directional" && (
        <FormGroup title="Opposing Track Items (Track 2)">
          <ItemList<MarqueeItem>
            label="Secondary Stream Items"
            items={data.secondaryItems || []}
            max={24}
            onChange={(secondaryItems) => onChange({ ...data, secondaryItems })}
            create={() => ({
              text: "GLOBAL CAPABILITY",
              badge: "CLOUD",
              icon: "cloud",
            })}
            itemTitle={(item) => item.text || "Item"}
            addLabel="Add Secondary Item"
            renderItem={(item, update) => (
              <>
                <TextField
                  label="Primary Text"
                  value={item.text}
                  onChange={(text) => update({ ...item, text })}
                  maxLength={120}
                  required
                />
                <TextField
                  label="Badge / Tag"
                  value={item.badge || ""}
                  onChange={(badge) => update({ ...item, badge })}
                  maxLength={60}
                />
                <IconPickerField
                  label="Icon"
                  value={item.icon || ""}
                  imageValue={item.iconImage}
                  onChange={({ icon, iconImage }) =>
                    update({ ...item, icon, iconImage })
                  }
                />
              </>
            )}
          />
        </FormGroup>
      )}
    </>
  );
}

type SettingsFormProps = {
  settings: SectionSettings;
  onChange: (settings: SectionSettings) => void;
};

export function SectionStyleForm({
  settings,
  siteFont,
  sectionType,
  onChange,
}: SettingsFormProps & { siteFont: FontKey; sectionType?: SectionType }) {
  const customColors = settings.customColors ?? {};
  const updateCustomColor = (
    patch: Partial<NonNullable<SectionSettings["customColors"]>>,
  ) => {
    const next = { ...customColors, ...patch };
    // Remove keys that are undefined
    const cleaned = Object.fromEntries(
      Object.entries(next).filter(([_, v]) => Boolean(v)),
    );
    onChange({
      ...settings,
      customColors: Object.keys(cleaned).length > 0 ? cleaned : undefined,
    });
  };

  const hasAnyCustomColors = Boolean(
    customColors.background ||
    customColors.text ||
    customColors.primary ||
    customColors.muted ||
    customColors.border ||
    customColors.gradientFrom ||
    customColors.gradientTo,
  );

  const isCustomWidth = Boolean(
    settings.containerWidth &&
    settings.containerWidth !== "default" &&
    !CONTAINER_WIDTH_OPTIONS.some((opt) => opt.value === settings.containerWidth)
  );

  return (
    <>
      <FormGroup title="Section layout & container width">
        <SelectField
          label="Theme preset background"
          value={settings.background}
          options={BACKGROUND_OPTIONS}
          onChange={(background) => onChange({ ...settings, background })}
        />
        <SelectField
          label="Vertical spacing"
          value={settings.spacing ?? "default"}
          options={SPACING_OPTIONS}
          onChange={(spacing) => onChange({ ...settings, spacing })}
        />
        <SelectField
          label="Content container width"
          value={isCustomWidth ? "custom" : (settings.containerWidth ?? "default")}
          options={CONTAINER_WIDTH_OPTIONS}
          onChange={(containerWidth) => {
            if (containerWidth === "custom") {
              onChange({ ...settings, containerWidth: "1140px" });
            } else if (containerWidth === "default") {
              const { containerWidth: _, ...rest } = settings;
              onChange(rest);
            } else {
              onChange({ ...settings, containerWidth });
            }
          }}
        />
        {isCustomWidth && (
          <TextField
            label="Custom container width (px, %, or vw)"
            value={settings.containerWidth ?? ""}
            placeholder="e.g. 1100px or 92%"
            onChange={(val) => {
              const cleaned = val.trim();
              if (!cleaned) {
                const { containerWidth: _, ...rest } = settings;
                onChange(rest);
              } else {
                onChange({ ...settings, containerWidth: cleaned });
              }
            }}
          />
        )}
        {(!sectionType ||
          !["hero", "marquee", "auth", "product_detail"].includes(
            sectionType,
          )) && (
          <SelectField
            label="Heading alignment"
            value={settings.align ?? "center"}
            options={ALIGN_OPTIONS}
            onChange={(align) => onChange({ ...settings, align })}
          />
        )}
      </FormGroup>

      {(() => {
        const isCustomScale = Boolean(
          settings.fontSize &&
          settings.fontSize !== "default" &&
          !FONT_SIZE_OPTIONS.some((opt) => opt.value === settings.fontSize)
        );
        const isCustomHeading = Boolean(
          settings.headingSize &&
          settings.headingSize !== "default" &&
          !HEADING_SIZE_OPTIONS.some((opt) => opt.value === settings.headingSize)
        );
        const isCustomBody = Boolean(
          settings.bodySize &&
          settings.bodySize !== "default" &&
          !BODY_SIZE_OPTIONS.some((opt) => opt.value === settings.bodySize)
        );

        const isHeadingBold =
          settings.headingWeight === "700" ||
          settings.headingWeight === "800" ||
          settings.headingWeight === "900" ||
          settings.headingWeight === "bold";

        const isBodyBold =
          settings.bodyWeight === "600" ||
          settings.bodyWeight === "700" ||
          settings.bodyWeight === "bold";

        return (
          <FormGroup title="Section typography & styling">
            <FontPicker
              label="Font family"
              value={settings.font}
              inheritFrom={siteFont}
              onChange={(font) => {
                const { font: _previous, ...rest } = settings;
                onChange(font ? { ...rest, font } : rest);
              }}
            />
            <SelectField
              label="Overall font size scale"
              value={isCustomScale ? "custom" : (settings.fontSize ?? "default")}
              options={FONT_SIZE_OPTIONS}
              onChange={(fontSize) => {
                if (fontSize === "custom") {
                  onChange({ ...settings, fontSize: "110%" });
                } else if (fontSize === "default") {
                  const { fontSize: _, ...rest } = settings;
                  onChange(rest);
                } else {
                  onChange({ ...settings, fontSize });
                }
              }}
            />
            {isCustomScale && (
              <TextField
                label="Custom scale or base pixel size"
                value={settings.fontSize ?? ""}
                placeholder="e.g. 110% or 16px"
                onChange={(val) => {
                  const cleaned = val.trim();
                  if (!cleaned) {
                    const { fontSize: _, ...rest } = settings;
                    onChange(rest);
                  } else {
                    onChange({ ...settings, fontSize: cleaned });
                  }
                }}
              />
            )}

            <div className="pt-2 border-t border-ed-border/40 flex flex-col gap-2">
              <span className="text-ed-xs font-semibold text-ed-text">Heading Typography</span>
              <SelectField
                label="Heading font size"
                value={isCustomHeading ? "custom" : (settings.headingSize ?? "default")}
                options={HEADING_SIZE_OPTIONS}
                onChange={(headingSize) => {
                  if (headingSize === "custom") {
                    onChange({ ...settings, headingSize: "36px" });
                  } else if (headingSize === "default") {
                    const { headingSize: _, ...rest } = settings;
                    onChange(rest);
                  } else {
                    onChange({ ...settings, headingSize });
                  }
                }}
              />
              {isCustomHeading && (
                <TextField
                  label="Custom heading pixel size (px)"
                  value={settings.headingSize ?? ""}
                  placeholder="e.g. 38px or 42"
                  onChange={(val) => {
                    const cleaned = val.trim();
                    if (!cleaned) {
                      const { headingSize: _, ...rest } = settings;
                      onChange(rest);
                    } else {
                      onChange({ ...settings, headingSize: cleaned });
                    }
                  }}
                />
              )}
              <SelectField
                label="Heading font weight"
                value={settings.headingWeight ?? "default"}
                options={HEADING_WEIGHT_OPTIONS}
                onChange={(headingWeight) => {
                  if (headingWeight === "default") {
                    const { headingWeight: _, ...rest } = settings;
                    onChange(rest);
                  } else {
                    onChange({ ...settings, headingWeight });
                  }
                }}
              />
              <div className="flex items-center gap-2">
                <span className="text-ed-xs text-ed-muted">Quick style:</span>
                <button
                  type="button"
                  onClick={() => {
                    onChange({ ...settings, headingWeight: isHeadingBold ? "400" : "700" });
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-ed-xs font-semibold rounded-ed border transition-colors ${
                    isHeadingBold
                      ? "bg-ed-accent text-white border-ed-accent"
                      : "bg-ed-panel text-ed-text border-ed-border hover:bg-ed-hover"
                  }`}
                  title="Toggle heading bold"
                >
                  <Bold className="size-3.5" />
                  Bold
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChange({ ...settings, headingItalic: !settings.headingItalic });
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-ed-xs italic rounded-ed border transition-colors ${
                    settings.headingItalic
                      ? "bg-ed-accent text-white border-ed-accent font-semibold"
                      : "bg-ed-panel text-ed-text border-ed-border hover:bg-ed-hover"
                  }`}
                  title="Toggle heading italic"
                >
                  <Italic className="size-3.5" />
                  Italic
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-ed-border/40 flex flex-col gap-2">
              <span className="text-ed-xs font-semibold text-ed-text">Body / Content Typography</span>
              <SelectField
                label="Body / Content font size"
                value={isCustomBody ? "custom" : (settings.bodySize ?? "default")}
                options={BODY_SIZE_OPTIONS}
                onChange={(bodySize) => {
                  if (bodySize === "custom") {
                    onChange({ ...settings, bodySize: "16px" });
                  } else if (bodySize === "default") {
                    const { bodySize: _, ...rest } = settings;
                    onChange(rest);
                  } else {
                    onChange({ ...settings, bodySize });
                  }
                }}
              />
              {isCustomBody && (
                <TextField
                  label="Custom body pixel size (px)"
                  value={settings.bodySize ?? ""}
                  placeholder="e.g. 15.5px or 17"
                  onChange={(val) => {
                    const cleaned = val.trim();
                    if (!cleaned) {
                      const { bodySize: _, ...rest } = settings;
                      onChange(rest);
                    } else {
                      onChange({ ...settings, bodySize: cleaned });
                    }
                  }}
                />
              )}
              <SelectField
                label="Body font weight"
                value={settings.bodyWeight ?? "default"}
                options={BODY_WEIGHT_OPTIONS}
                onChange={(bodyWeight) => {
                  if (bodyWeight === "default") {
                    const { bodyWeight: _, ...rest } = settings;
                    onChange(rest);
                  } else {
                    onChange({ ...settings, bodyWeight });
                  }
                }}
              />
              <div className="flex items-center gap-2">
                <span className="text-ed-xs text-ed-muted">Quick style:</span>
                <button
                  type="button"
                  onClick={() => {
                    onChange({ ...settings, bodyWeight: isBodyBold ? "400" : "700" });
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-ed-xs font-semibold rounded-ed border transition-colors ${
                    isBodyBold
                      ? "bg-ed-accent text-white border-ed-accent"
                      : "bg-ed-panel text-ed-text border-ed-border hover:bg-ed-hover"
                  }`}
                  title="Toggle body bold"
                >
                  <Bold className="size-3.5" />
                  Bold
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChange({ ...settings, bodyItalic: !settings.bodyItalic });
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-ed-xs italic rounded-ed border transition-colors ${
                    settings.bodyItalic
                      ? "bg-ed-accent text-white border-ed-accent font-semibold"
                      : "bg-ed-panel text-ed-text border-ed-border hover:bg-ed-hover"
                  }`}
                  title="Toggle body italic"
                >
                  <Italic className="size-3.5" />
                  Italic
                </button>
              </div>
            </div>
          </FormGroup>
        );
      })()}

      <FormGroup title="Custom dynamic colors (CellColorPicker)">
        <ColorField
          label="Section background"
          value={customColors.background}
          onChange={(background) => updateCustomColor({ background })}
          fallback="#ffffff"
          hint="Overrides the theme background for this specific section."
        />
        <ColorField
          label="Text / Heading color"
          value={customColors.text}
          onChange={(text) => updateCustomColor({ text })}
          fallback="#0f172a"
        />
        <ColorField
          label="Primary / Accent color"
          value={customColors.primary}
          onChange={(primary) => updateCustomColor({ primary })}
          fallback="#6366f1"
          hint="Used for CTA buttons, gradient highlights, and active elements."
        />
        <ColorField
          label="Muted / Subtitle text"
          value={customColors.muted}
          onChange={(muted) => updateCustomColor({ muted })}
          fallback="#64748b"
        />
        <ColorField
          label="Border & divider line"
          value={customColors.border}
          onChange={(border) => updateCustomColor({ border })}
          fallback="#e2e8f0"
        />
        <ColorField
          label="Gradient text start"
          value={customColors.gradientFrom}
          onChange={(gradientFrom) => updateCustomColor({ gradientFrom })}
          fallback="#6366f1"
          hint="Gradient used for highlighted heading words."
        />
        <ColorField
          label="Gradient text end"
          value={customColors.gradientTo}
          onChange={(gradientTo) => updateCustomColor({ gradientTo })}
          fallback="#8b5cf6"
        />

        {hasAnyCustomColors && (
          <button
            type="button"
            onClick={() => onChange({ ...settings, customColors: undefined })}
            className="mt-1 text-ed-xs text-ed-danger hover:underline font-medium self-start"
          >
            Reset all custom colors to theme default
          </button>
        )}
      </FormGroup>
    </>
  );
}

export function SectionResponsiveForm({
  settings,
  onChange,
}: SettingsFormProps) {
  return (
    <FormGroup title="Visibility by device">
      <CheckboxField
        label="Hide on mobile"
        hint="Screens narrower than 600px."
        checked={settings.hideOnMobile}
        onChange={(hideOnMobile) => onChange({ ...settings, hideOnMobile })}
      />
      <CheckboxField
        label="Hide on tablet and desktop"
        hint="Show this section on phones only."
        checked={settings.hideOnDesktop ?? false}
        onChange={(hideOnDesktop) => onChange({ ...settings, hideOnDesktop })}
      />
    </FormGroup>
  );
}

export function SectionAdvancedForm({ settings, onChange }: SettingsFormProps) {
  const anchor = settings.anchor ?? "";
  return (
    <FormGroup title="Anchor link">
      <TextField
        label="Section id"
        value={anchor}
        onChange={(value) =>
          onChange({ ...settings, anchor: value.toLowerCase() })
        }
        placeholder="pricing"
        maxLength={40}
        error={
          anchor && !ANCHOR_PATTERN.test(anchor)
            ? "Lowercase letters, numbers and hyphens, starting with a letter"
            : undefined
        }
        hint={
          anchor
            ? `Link to it with #${anchor}`
            : "Lets buttons and menu links jump to this section."
        }
      />
    </FormGroup>
  );
}

import { FooterForm, HeaderForm } from "./SiteSettingsForms.tsx";

export function SectionContentForm({
  section,
  onChange,
}: {
  section: Section;
  onChange: (section: Section) => void;
}) {
  return <DataForm section={section} onChange={onChange} />;
}

function DataForm({
  section,
  onChange,
}: {
  section: Section;
  onChange: (section: Section) => void;
}) {
  switch (section.type) {
    case "header":
      return (
        <HeaderForm
          header={section.data}
          onChange={(data) => onChange({ ...section, data })}
        />
      );
    case "footer":
      return (
        <FooterForm
          footer={section.data}
          onChange={(data) => onChange({ ...section, data })}
        />
      );
    case "hero":
      return (
        <HeroForm
          data={section.data}
          onChange={(data) => onChange({ ...section, data })}
        />
      );
    case "features":
      return (
        <FeaturesForm
          data={section.data}
          onChange={(data) => onChange({ ...section, data })}
        />
      );
    case "services":
      return (
        <ServicesForm
          data={section.data}
          onChange={(data) => onChange({ ...section, data })}
        />
      );
    case "cards":
      return (
        <CardsSectionForm
          data={section.data}
          onChange={(data) => onChange({ ...section, data })}
        />
      );
    case "testimonials":
      return (
        <TestimonialsForm
          data={section.data}
          onChange={(data) => onChange({ ...section, data })}
        />
      );
    case "faq":
      return (
        <FaqForm
          data={section.data}
          onChange={(data) => onChange({ ...section, data })}
        />
      );
    case "cta":
      return (
        <CtaForm
          data={section.data}
          onChange={(data) => onChange({ ...section, data })}
        />
      );
    case "contact":
      return (
        <ContactForm
          data={section.data}
          onChange={(data) => onChange({ ...section, data })}
        />
      );
    case "text":
      return (
        <TextForm
          data={section.data}
          onChange={(data) => onChange({ ...section, data })}
        />
      );
    case "gallery":
      return (
        <GalleryForm
          data={section.data}
          onChange={(data) => onChange({ ...section, data })}
        />
      );
    case "logos":
      return (
        <LogosForm
          data={section.data}
          onChange={(data) => onChange({ ...section, data })}
        />
      );
    case "split":
      return (
        <SplitForm
          data={section.data}
          onChange={(data) => onChange({ ...section, data })}
        />
      );
    case "stats":
      return (
        <StatsForm
          data={section.data}
          onChange={(data) => onChange({ ...section, data })}
        />
      );
    case "pricing":
      return (
        <PricingForm
          data={section.data}
          onChange={(data) => onChange({ ...section, data })}
        />
      );
    case "media":
      return (
        <MediaForm
          data={section.data}
          onChange={(data) => onChange({ ...section, data })}
        />
      );
    case "team":
      return (
        <TeamForm
          data={section.data}
          onChange={(data) => onChange({ ...section, data })}
        />
      );
    case "carousel":
      return (
        <CarouselForm
          data={section.data}
          onChange={(data) => onChange({ ...section, data })}
        />
      );
    case "marquee":
      return (
        <MarqueeForm
          data={section.data}
          onChange={(data) => onChange({ ...section, data })}
        />
      );
    case "auth":
      return (
        <AuthSectionForm
          data={section.data}
          onChange={(data) => onChange({ ...section, data })}
        />
      );
    case "custom":
      return (
        <CustomSectionForm
          data={section.data}
          onChange={(data) => onChange({ ...section, data })}
        />
      );
    case "products":
      return (
        <ProductsForm
          data={section.data}
          onChange={(data) => onChange({ ...section, data })}
        />
      );
    case "product_detail":
      return (
        <ProductDetailForm
          data={section.data}
          onChange={(data) => onChange({ ...section, data })}
        />
      );
    case "blog":
      return (
        <BlogForm
          data={section.data}
          onChange={(data) => onChange({ ...section, data })}
        />
      );
    case "blog_detail":
      return (
        <BlogDetailForm
          data={section.data}
          onChange={(data) => onChange({ ...section, data })}
        />
      );
  }
}

export default function SectionForm({
  section,
  siteFont,
  onChange,
}: {
  section: Section;
  siteFont: FontKey;
  onChange: (section: Section) => void;
}) {
  const changeSettings = (settings: SectionSettings) =>
    onChange({ ...section, settings });
  return (
    <>
      <DataForm section={section} onChange={onChange} />
      <SectionStyleForm
        settings={section.settings}
        siteFont={siteFont}
        sectionType={section.type}
        onChange={changeSettings}
      />
      <SectionResponsiveForm
        settings={section.settings}
        onChange={changeSettings}
      />
    </>
  );
}
