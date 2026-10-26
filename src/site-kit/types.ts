/**
 * Builder data model shared by the editor preview, the AI builder and the
 * publish renderer. Everything here must stay JSON-serializable.
 */

import type { FontKey } from "./fonts.ts";

export type { FontKey };

export type ImageRef = {
  url: string;
  alt: string;
};

export type LinkRef = {
  label: string;
  href: string;
  actionType?: "link" | "download";
  downloadFileName?: string;
  icon?: string;
  iconImage?: ImageRef;
  iconPosition?: "left" | "right";
  openInNewTab?: boolean;
};

export type ButtonStyle = "filled" | "outline";
export type CardStyle = "border" | "shadow" | "flat";
export type RadiusSize = "none" | "sm" | "md" | "lg";
export type SpacingSize = "compact" | "normal" | "relaxed";

export type ThemeSettings = {
  language?: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
  };
  fonts: {
    heading: FontKey;
    body: FontKey;
  };
  buttonStyle: ButtonStyle;
  cardStyle: CardStyle;
  radius: RadiusSize;
  /** Max content width in px. */
  containerWidth: number;
  sectionSpacing: SpacingSize;
};

export const HEADER_DESIGNS = [
  "logo-left",
  "centered",
  "classical",
  "minimalist",
  "comprehensive",
  "floating",
  "transparent",
  "glass-dock",
  "split-stacked",
  "mega-menu-grid",
  "side-drawer",
  "headline-ticker",
] as const;

export type HeaderDesign = (typeof HEADER_DESIGNS)[number];

export type HeaderSubMenuItem = {
  label: string;
  href: string;
  description?: string;
  badge?: string;
  icon?: string;
};

export const BRAND_DISPLAY_MODES = [
  "auto",
  "logo_left",
  "logo_right",
  "logo_top",
  "logo_only",
  "text_only",
] as const;

export type BrandDisplayMode = (typeof BRAND_DISPLAY_MODES)[number];

export type HeaderMenuItem = {
  label: string;
  href: string;
  badge?: string;
  icon?: string;
  description?: string;
  children?: HeaderSubMenuItem[];
};

export type HeaderData = {
  /** Style of the site-wide header, edited through the shared header section. */
  settings?: SectionSettings;
  design: HeaderDesign;
  siteName: string;
  logo?: ImageRef;
  logoDisplay?: BrandDisplayMode;
  menu: HeaderMenuItem[];
  cta?: LinkRef;
  secondaryCta?: LinkRef;
  announcement?: string;
  announcementLink?: LinkRef;
  position?: "static" | "sticky" | "fixed" | "floating";
  sticky: boolean;
  overlay?: boolean;
  showSearch?: boolean;
  showAccount?: boolean;
  showCart?: boolean;
  cartCount?: number;
  currency?: string;
  mobileMenuType?: "drawer" | "fullscreen" | "dropdown";
  hidden?: boolean;
  badge?: string;
  searchPlaceholder?: string;
  utilityLinks?: LinkRef[];
  tagline?: string;
  statusText?: string;
  statusColor?: HeaderStatusColor;
  /** Label on the side-drawer menu trigger. */
  menuLabel?: string;
  /** Contact block shown in the full-height curtain menu. */
  contactLabel?: string;
  contactEmail?: string;
  /** Highlight card shown inside mega-menu dropdowns. */
  featured?: HeaderFeatured;
};

export const HEADER_STATUS_COLORS = ["green", "blue", "orange", "purple", "red"] as const;

export type HeaderStatusColor = (typeof HEADER_STATUS_COLORS)[number];

export type HeaderFeatured = {
  badge?: string;
  title: string;
  description?: string;
  link?: LinkRef;
};

export const FOOTER_DESIGNS = [
  "columns",
  "simple",
  "mega",
  "newsletter",
  "split",
  "inline",
  "centered",
  "cta-banner",
] as const;

export type FooterDesign = (typeof FOOTER_DESIGNS)[number];

export type FooterNewsletter = {
  enabled?: boolean;
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
};

export type FooterCtaBanner = {
  enabled?: boolean;
  heading?: string;
  subheading?: string;
  primaryCta?: LinkRef;
  secondaryCta?: LinkRef;
};

export type FooterPaymentMethods = {
  enabled?: boolean;
  methods?: string[];
};

export type FooterContact = {
  title?: string;
  email?: string;
  phone?: string;
  address?: string;
  hours?: string;
};

export type FooterData = {
  /** Style of the site-wide footer, edited through the shared footer section. */
  settings?: SectionSettings;
  design: FooterDesign;
  siteName: string;
  logo?: ImageRef;
  logoDisplay?: BrandDisplayMode;
  tagline?: string;
  description?: string;
  columns: { title: string; links: LinkRef[] }[];
  menu?: LinkRef[];
  contact?: FooterContact;
  social: LinkRef[];
  newsletter?: FooterNewsletter;
  ctaBanner?: FooterCtaBanner;
  paymentMethods?: FooterPaymentMethods;
  legalLinks?: LinkRef[];
  copyright: string;
  themeMode?: "dark" | "light" | "auto";
  hidden?: boolean;
};

export type SectionBackground = "default" | "surface" | "primary" | "dark";
export type SectionSpacing = "none" | "compact" | "default" | "relaxed";
export type SectionAlign = "center" | "left";

export type SectionCustomColors = {
  background?: string;
  text?: string;
  primary?: string;
  muted?: string;
  border?: string;
  /** Start and end colors of gradient text (e.g. the hero's highlighted words). */
  gradientFrom?: string;
  gradientTo?: string;
};

export type SectionSettings = {
  background: SectionBackground;
  hideOnMobile: boolean;
  hideOnDesktop?: boolean;
  /** Vertical padding; "default" (or unset) follows the theme's section spacing. */
  spacing?: SectionSpacing;
  align?: SectionAlign;
  /** In-page anchor id, so links like `#pricing` can jump to the section. */
  anchor?: string;
  customColors?: SectionCustomColors;
  /** Overrides the theme font for this section only; unset follows the theme. */
  font?: FontKey;
};

export type IconName =
  | "check"
  | "star"
  | "bolt"
  | "shield"
  | "heart"
  | "chat"
  | "gear"
  | "user"
  | "mail"
  | "phone"
  | "chart"
  | "clock"
  | "tools"
  | "bell"
  | "wallet"
  | "pointer"
  | "help"
  | "sparkles"
  | "rocket"
  | "layers"
  | "box"
  | "lock"
  | "cloud"
  | "code";

export const HERO_VARIANTS = [
  "centered",
  "split",
  "split-left",
  "background-image",
  "video-bg",
  "gradient",
  "curved-bottom",
  "soft-card",
  "minimal-typography",
  "floating-cards",
  "asymmetric",
  "curved-carousel",
  "campaign-banner",
] as const;

export type HeroVariant = (typeof HERO_VARIANTS)[number];

export type HeroFloatingCard = {
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: string;
};

export type HeroRating = {
  stars?: number;
  text?: string;
  avatarCount?: number;
};

export type HeroTrustedBy = {
  label?: string;
  logos?: { label: string; url?: string }[];
};

export type HeroCampaignStat = {
  id?: string;
  label: string;
  value: string;
  icon?: string;
};

export type HeroCampaignProgress = {
  raisedAmount?: number | string;
  targetAmount?: number | string;
  currency?: string;
  raisedLabel?: string;
  targetLabel?: string;
  percentage?: number;
  donateButton?: LinkRef;
  registerButton?: LinkRef;
};

export type HeroCampaignTickerItem = {
  id?: string;
  name: string;
  action: string;
  amount?: string;
  avatarIcon?: string;
};

export const HERO_ALIGNS = ["left", "center", "right"] as const;
export type HeroAlign = (typeof HERO_ALIGNS)[number];

export const HERO_ALIGN_ELEMENTS = [
  "badge",
  "heading",
  "subheading",
  "description",
  "actions",
  "trustedBy",
] as const;
export type HeroAlignElement = (typeof HERO_ALIGN_ELEMENTS)[number];

/** `all` aligns every hero element; per-element keys override it. Unset keys keep the layout default. */
export type HeroAlignment = { all?: HeroAlign } & Partial<Record<HeroAlignElement, HeroAlign>>;

export const BUTTON_SHAPES = ["square", "soft", "rounded", "pill", "oval", "custom"] as const;
export type ButtonShape = (typeof BUTTON_SHAPES)[number];

export const BUTTON_RADIUS_MAX = 48;

export const HERO_BUTTON_SHAPES = BUTTON_SHAPES;
export type HeroButtonShape = ButtonShape;

export const HERO_BUTTON_RADIUS_MAX = BUTTON_RADIUS_MAX;

export type HeroData = {
  variant: HeroVariant;
  eyebrow?: string;
  badgeIcon?: string;
  heading: string;
  highlightText?: string;
  subheading?: string;
  description?: string;
  primaryCta?: LinkRef;
  secondaryCta?: LinkRef;
  tertiaryCta?: LinkRef;
  buttons?: LinkRef[];
  mediaType?: "image" | "video" | "both";
  videoUrl?: string;
  videoAutoplay?: boolean;
  videoControls?: boolean;
  videoLoop?: boolean;
  image?: ImageRef;
  secondaryImage?: ImageRef;
  backgroundImage?: ImageRef;
  bgImagePosition?: "bottom" | "center" | "top" | "cover";
  bgOverlayType?: "dark" | "light" | "gradient" | "none";
  backgroundVideoUrl?: string;
  imagePosition?: "right" | "left" | "bottom" | "background" | "card";
  imageStyle?: "mockup" | "rounded" | "glow" | "shadow" | "plain";
  overlayOpacity?: number;
  overlayBlur?: boolean;
  minHeight?: "auto" | "compact" | "screen" | "tall";
  /** Legacy video-banner text alignment; only read by "campaign-banner", and `alignment.all` takes precedence. */
  contentAlign?: HeroAlign;
  alignment?: HeroAlignment;
  /** Unset follows the theme's corner radius. */
  buttonShape?: HeroButtonShape;
  /** Corner radius in px, used only when `buttonShape` is "custom". */
  buttonRadius?: number;
  bottomShape?: "none" | "wave" | "curve" | "curved" | "slant" | "tilt" | "arch" | "normal";
  rating?: HeroRating;
  floatingCards?: HeroFloatingCard[];
  trustedBy?: HeroTrustedBy;
  carouselSpeed?: number;
  carouselDirection?: "left-to-right" | "right-to-left";
  showDoodles?: boolean;
  curveIntensity?: "none" | "subtle" | "medium" | "dramatic";
  carouselSlides?: CarouselSlide[];
  // Campaign video banner fields
  campaignStats?: HeroCampaignStat[];
  campaignProgress?: HeroCampaignProgress;
  campaignTicker?: HeroCampaignTickerItem[];
  showCampaignTicker?: boolean;
  showCampaignCards?: boolean;
  bannerBottomShape?: "curved" | "wave" | "normal" | "slant" | "tilt" | "arch" | "none";
  bannerCurveDepth?: number;
  bottomDividerColor?: string;
  bannerTopBar?: {
    enabled?: boolean;
    logoText?: string;
    logoImage?: ImageRef;
    primaryButton?: LinkRef;
    secondaryButton?: LinkRef;
  };
};

export type GridColumns = 1 | 2 | 3 | 4;

export type FeatureColor =
  | "orange"
  | "green"
  | "blue"
  | "yellow"
  | "purple"
  | "pink"
  | "cyan"
  | "indigo"
  | "red"
  | "gray"
  | "none"
  | "default";

export type FeatureItem = {
  icon?: IconName | string;
  iconImage?: ImageRef;
  iconColor?: FeatureColor | string;
  iconBackgroundColor?: string;
  backgroundColor?: string;
  badge?: string;
  title: string;
  description: string;
  link?: LinkRef;
  image?: ImageRef;
};

export type FeaturesData = {
  heading: string;
  eyebrow?: string;
  intro?: string;
  variant?: "grid" | "split" | "minimal" | "cards" | "pastel-icons";
  iconStyle?:
    | "pastel-circle"
    | "square-badge"
    | "minimal-accent"
    | "colored-circle"
    | "none";
  iconBackgroundColor?: string;
  cardStyle?: "transparent" | "surface" | "bordered" | "glass";
  align?: "left" | "center";
  columns: GridColumns;
  mobileColumns: GridColumns;
  items: FeatureItem[];
  // Split showcase options
  splitPosition?: "left" | "right";
  splitImage?: ImageRef;
  splitCta?: LinkRef;
  secondaryCta?: LinkRef;
  bottomCta?: LinkRef;
};

export const SERVICES_VARIANTS = [
  "cards-grid",
  "bento-grid",
  "split-showcase",
  "interactive-list",
  "horizontal-cards",
  "minimal-numbered",
] as const;

export type ServicesVariant = (typeof SERVICES_VARIANTS)[number];

export type ServiceItem = {
  title: string;
  description: string;
  badge?: string;
  badgeColor?: FeatureColor | string;
  icon?: IconName | string;
  iconImage?: ImageRef;
  iconColor?: FeatureColor | string;
  image?: ImageRef;
  price?: string;
  duration?: string;
  features?: string[];
  link?: LinkRef;
  secondaryLink?: LinkRef;
  backgroundColor?: string;
  featured?: boolean;
};

export type ServicesData = {
  heading: string;
  eyebrow?: string;
  intro?: string;
  variant?: ServicesVariant;
  cardStyle?:
    | "surface"
    | "bordered"
    | "flat"
    | "glass"
    | "glow"
    | "elevated"
    | "gradient";
  iconStyle?:
    | "pastel-circle"
    | "square-badge"
    | "minimal-accent"
    | "colored-circle"
    | "glow-icon"
    | "none";
  imageAspect?: "16:9" | "4:3" | "1:1" | "21:9" | "auto";
  align?: "left" | "center";
  columns: GridColumns;
  mobileColumns: GridColumns;
  items: ServiceItem[];
  // Split showcase options
  splitPosition?: "left" | "right";
  splitImage?: ImageRef;
  splitTagline?: string;
  splitCta?: LinkRef;
  secondaryCta?: LinkRef;
  // Section bottom CTAs & toggles
  bottomCta?: LinkRef;
  bottomSecondaryCta?: LinkRef;
  showBadges?: boolean;
  showIcons?: boolean;
  showImages?: boolean;
  showPrices?: boolean;
  showBullets?: boolean;
  showNumbers?: boolean;
};

export const TESTIMONIALS_VARIANTS = [
  "cards-grid",
  "carousel-slider",
  "marquee-wall",
  "spotlight-featured",
  "minimal-editorial",
] as const;
export type TestimonialsVariant = (typeof TESTIMONIALS_VARIANTS)[number];

export const TESTIMONIALS_CARD_STYLES = [
  "default",
  "bordered",
  "flat",
  "glass",
  "elevated",
] as const;
export type TestimonialsCardStyle = (typeof TESTIMONIALS_CARD_STYLES)[number];

export type TestimonialItem = {
  quote: string;
  name: string;
  role?: string;
  company?: string;
  avatar?: ImageRef;
  rating?: number;
  verified?: boolean;
  badge?: string;
  highlight?: string;
};

export type TestimonialsData = {
  variant?: TestimonialsVariant;
  eyebrow?: string;
  heading: string;
  intro?: string;
  cardStyle?: TestimonialsCardStyle;
  align?: "left" | "center";
  columns?: GridColumns;
  showRatings?: boolean;
  showAvatars?: boolean;
  showBadges?: boolean;
  ratingMetric?: {
    score?: string;
    label?: string;
    count?: string;
  };
  items: TestimonialItem[];
};

export const FAQ_VARIANTS = [
  "accordion-classic",
  "two-column-grid",
  "split-sidebar",
  "minimal-numbered",
  "categorized-cards",
] as const;
export type FaqVariant = (typeof FAQ_VARIANTS)[number];

export const FAQ_CARD_STYLES = [
  "default",
  "bordered",
  "flat",
  "glass",
  "elevated",
] as const;
export type FaqCardStyle = (typeof FAQ_CARD_STYLES)[number];

export type FaqItem = {
  question: string;
  answer: string;
  category?: string;
  badge?: string;
  isOpenDefault?: boolean;
};

export type FaqSupportCta = {
  title?: string;
  description?: string;
  link?: LinkRef;
};

export type FaqData = {
  variant?: FaqVariant;
  eyebrow?: string;
  heading: string;
  intro?: string;
  cardStyle?: FaqCardStyle;
  align?: SectionAlign;
  supportCta?: FaqSupportCta;
  items: FaqItem[];
};

export const CTA_VARIANTS = [
  "centered-card",
  "split-visual",
  "floating-card",
  "minimal-editorial",
] as const;
export type CtaVariant = (typeof CTA_VARIANTS)[number];

export const CTA_CARD_STYLES = [
  "default",
  "bordered",
  "flat",
  "glass",
  "elevated",
  "contrast",
] as const;
export type CtaCardStyle = (typeof CTA_CARD_STYLES)[number];

export type CtaMetric = {
  value: string;
  label: string;
  subtext?: string;
};

export type CtaData = {
  variant?: CtaVariant;
  eyebrow?: string;
  heading: string;
  text?: string;
  button: LinkRef;
  secondaryButton?: LinkRef;
  trustBadges?: string[];
  highlightMetric?: CtaMetric;
  cardStyle?: CtaCardStyle;
  align?: SectionAlign;
};

export const CONTACT_VARIANTS = [
  "split-form",
  "cards-hub",
  "minimal-editorial",
  "floating-glass",
  "custom",
] as const;
export type ContactVariant = (typeof CONTACT_VARIANTS)[number];

export const CONTACT_CARD_STYLES = [
  "default",
  "bordered",
  "flat",
  "glass",
  "elevated",
  "contrast",
] as const;
export type ContactCardStyle = (typeof CONTACT_CARD_STYLES)[number];

export type ContactChannel = {
  label: string;
  value: string;
  description?: string;
  icon?: "mail" | "phone" | "chat" | "user";
};

export type ContactData = {
  variant?: ContactVariant;
  eyebrow?: string;
  heading: string;
  text?: string;
  email?: string;
  phone?: string;
  address?: string;
  officeHours?: string;
  responseTime?: string;
  showForm: boolean;
  submitLabel: string;
  formHeading?: string;
  serviceOptions?: string[];
  channels?: ContactChannel[];
  cardStyle?: ContactCardStyle;
  align?: SectionAlign;
  /** Replaces the default name, email and message fields. */
  formFields?: ContactFormField[];
  /** Columns and blocks of the "custom" variant. */
  layout?: ContactLayout;
  /** "custom" variant: shows eyebrow, heading and text above the columns. Defaults to true. */
  showHeader?: boolean;
};

/** Mirrors the backend content schema; stored in site data, so values are only ever appended. */
export const CONTACT_FIELD_TYPES = [
  "text",
  "email",
  "tel",
  "textarea",
  "select",
  "radio",
  "checkboxes",
  "date",
  "number",
] as const;
export type ContactFieldType = (typeof CONTACT_FIELD_TYPES)[number];
export type ContactFieldWidth = "full" | "half";

export type ContactFormField = {
  /** Input name and submission key: lowercase letters, digits, - and _. */
  id: string;
  type: ContactFieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  width?: ContactFieldWidth;
  /** Choices of select, radio and checkboxes fields. */
  options?: string[];
};

export const CONTACT_BLOCK_TYPES = [
  "heading",
  "text",
  "badge",
  "info",
  "form",
  "map",
  "button",
  "image",
  "divider",
] as const;
export type ContactBlockType = (typeof CONTACT_BLOCK_TYPES)[number];

export const CONTACT_INFO_KINDS = [
  "email",
  "phone",
  "whatsapp",
  "address",
  "hours",
  "link",
  "text",
] as const;
export type ContactInfoKind = (typeof CONTACT_INFO_KINDS)[number];

export type ContactMapHeight = "sm" | "md" | "lg";

type ContactBlockBase = { id: string; boxed?: boolean };

export type ContactBlock = ContactBlockBase &
  (
    | { type: "heading"; text: string; level?: 2 | 3 }
    | { type: "text"; text: string }
    | { type: "badge"; text: string }
    | { type: "info"; kind: ContactInfoKind; label?: string; value: string; icon?: IconName }
    | { type: "form" }
    | { type: "map"; query: string; height?: ContactMapHeight }
    | { type: "button"; label: string; href: string; tone?: "primary" | "secondary" }
    | { type: "image"; image: ImageRef }
    | { type: "divider" }
  );

export type ContactColumn = {
  id: string;
  /** Share of the row out of 12. */
  width: number;
  boxed?: boolean;
  blocks: ContactBlock[];
};

export type ContactLayoutGap = "sm" | "md" | "lg";
export type ContactLayoutAlign = "start" | "center" | "stretch";

export type ContactLayout = {
  columns: ContactColumn[];
  gap?: ContactLayoutGap;
  align?: ContactLayoutAlign;
  /** Stacks the columns last-to-first on small screens. */
  mobileReverse?: boolean;
};

export type TextData = {
  heading?: string;
  /** Plain text; blank lines separate paragraphs. Never rendered as HTML. */
  body: string;
};

export type GalleryData = {
  heading?: string;
  columns: GridColumns;
  mobileColumns: GridColumns;
  images: ImageRef[];
};

export type LogosData = {
  heading?: string;
  grayscale: boolean;
  logos: ImageRef[];
};

export type SplitData = {
  eyebrow?: string;
  heading: string;
  /** Plain text; blank lines separate paragraphs. */
  body: string;
  bullets: string[];
  image?: ImageRef;
  imagePosition: "left" | "right";
  cta?: LinkRef;
};

export type StatsData = {
  heading?: string;
  intro?: string;
  items: { value: string; label: string }[];
};

export const PRICING_VARIANTS = [
  "cards-grid",
  "minimal-monochrome",
  "spotlight-tier",
  "horizontal-rows",
] as const;
export type PricingVariant = (typeof PRICING_VARIANTS)[number];

export const PRICING_CARD_STYLES = [
  "default",
  "bordered",
  "flat",
  "glass",
  "elevated",
  "contrast",
] as const;
export type PricingCardStyle = (typeof PRICING_CARD_STYLES)[number];

export type PricingPlan = {
  name: string;
  price: string;
  period?: string;
  originalPrice?: string;
  badge?: string;
  description?: string;
  features: string[];
  excludedFeatures?: string[];
  cta?: LinkRef;
  featured: boolean;
  highlightNote?: string;
};

export type PricingData = {
  variant?: PricingVariant;
  eyebrow?: string;
  heading: string;
  intro?: string;
  billingCycleLabel?: string;
  discountBadge?: string;
  footerNote?: string;
  cardStyle?: PricingCardStyle;
  columns?: GridColumns;
  mobileColumns?: GridColumns;
  align?: SectionAlign;
  plans: PricingPlan[];
};

export type MediaAspect = "16:9" | "4:3" | "1:1";

export type MediaData = {
  heading?: string;
  caption?: string;
  kind: "image" | "video";
  image?: ImageRef;
  /** YouTube or Vimeo page URL, rendered only as a privacy-enhanced embed. */
  videoUrl?: string;
  aspect: MediaAspect;
  width: "contained" | "wide";
};

export const TEAM_VARIANTS = [
  "grid-cards",
  "spotlight-featured",
  "minimal-editorial",
  "glass-overlay",
] as const;
export type TeamVariant = (typeof TEAM_VARIANTS)[number];

export const TEAM_CARD_STYLES = [
  "default",
  "bordered",
  "flat",
  "glass",
  "elevated",
  "contrast",
] as const;
export type TeamCardStyle = (typeof TEAM_CARD_STYLES)[number];

export type TeamSocialPlatform = "linkedin" | "twitter" | "github" | "email" | "link";

export type TeamSocialLink = {
  platform: TeamSocialPlatform;
  url: string;
};

export type TeamMember = {
  name: string;
  role?: string;
  department?: string;
  bio?: string;
  location?: string;
  photo?: ImageRef;
  tags?: string[];
  link?: LinkRef;
  socialLinks?: TeamSocialLink[];
};

export type TeamData = {
  variant?: TeamVariant;
  eyebrow?: string;
  badge?: string;
  heading: string;
  intro?: string;
  cardStyle?: TeamCardStyle;
  align?: SectionAlign;
  columns: GridColumns;
  mobileColumns: GridColumns;
  members: TeamMember[];
};

export const CAROUSEL_VARIANTS = [
  "cards",
  "hero-slider",
  "showcase",
  "minimal-editorial",
  "image-gallery",
  "image-strip",
  "image-coverflow",
  "curved-banner",
] as const;
export type CarouselVariant = (typeof CAROUSEL_VARIANTS)[number];

export const CAROUSEL_CARD_STYLES = [
  "default",
  "bordered",
  "flat",
  "glass",
  "elevated",
  "contrast",
] as const;
export type CarouselCardStyle = (typeof CAROUSEL_CARD_STYLES)[number];

export type CarouselSlide = {
  title: string;
  subtitle?: string;
  description?: string;
  caption?: string;
  badge?: string;
  image?: ImageRef;
  button?: LinkRef;
  secondaryButton?: LinkRef;
};

export type CarouselData = {
  variant?: CarouselVariant;
  eyebrow?: string;
  heading?: string;
  intro?: string;
  badge?: string;
  slides: CarouselSlide[];
  autoPlay?: boolean;
  interval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  showThumbnails?: boolean;
  imageAspect?: "16:9" | "4:3" | "1:1" | "21:9" | "3:4";
  columns?: GridColumns;
  pauseOnHover?: boolean;
  cardStyle?: CarouselCardStyle;
  align?: SectionAlign;
};

export const MARQUEE_VARIANTS = [
  "ticker-text",
  "cards-stream",
  "pill-badges",
  "dual-directional",
] as const;
export type MarqueeVariant = (typeof MARQUEE_VARIANTS)[number];

export type MarqueeItem = {
  text: string;
  badge?: string;
  icon?: IconName | string;
  iconImage?: ImageRef;
  link?: string;
  subtext?: string;
};

export type MarqueeData = {
  variant?: MarqueeVariant;
  eyebrow?: string;
  heading?: string;
  intro?: string;
  items: MarqueeItem[];
  secondaryItems?: MarqueeItem[];
  speed?: "slow" | "normal" | "fast";
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  gradientFades?: boolean;
  fontSize?: "small" | "medium" | "large" | "huge";
};

export const AUTH_VARIANTS = [
  "diagonal-split",
  "gradient-spotlight",
  "illustration-frame",
  "glass-aurora",
  "dark-wave",
  "product-showcase",
  "minimal-editorial",
  "bento-grid",
  "fullbleed-sheet",
  "tabbed-compact",
] as const;
export type AuthVariant = (typeof AUTH_VARIANTS)[number];

export const AUTH_VIEWS = ["login", "register", "forgot", "otp"] as const;
export type AuthView = (typeof AUTH_VIEWS)[number];

export const AUTH_FIELD_TYPES = [
  "text",
  "email",
  "password",
  "confirm-password",
  "tel",
  "number",
  "date",
  "select",
  "checkbox",
] as const;
export type AuthFieldType = (typeof AUTH_FIELD_TYPES)[number];

export type AuthField = {
  /** Form field name; letters, numbers, `-` and `_`. */
  name: string;
  label: string;
  type: AuthFieldType;
  placeholder?: string;
  required?: boolean;
  width?: "full" | "half";
  /** Choices for `select` fields. */
  options?: string[];
};

export const AUTH_SOCIAL_PROVIDERS = [
  "google",
  "apple",
  "github",
  "facebook",
  "x",
  "linkedin",
  "microsoft",
] as const;
export type AuthSocialProvider = (typeof AUTH_SOCIAL_PROVIDERS)[number];

export type AuthSocialLink = {
  provider: AuthSocialProvider;
  /** OAuth start URL; `#` renders a non-navigating button. */
  href: string;
};

export type AuthSocial = {
  enabled: boolean;
  label?: string;
  style?: "icons" | "full";
  position?: "top" | "bottom";
  showOnRegister?: boolean;
  providers: AuthSocialLink[];
};

export type AuthLoginView = {
  heading: string;
  subheading?: string;
  fields: AuthField[];
  submitLabel: string;
  showRemember?: boolean;
  rememberLabel?: string;
  forgotLabel?: string;
  switchPrompt?: string;
  switchLabel?: string;
};

export type AuthRegisterView = {
  enabled: boolean;
  heading: string;
  subheading?: string;
  fields: AuthField[];
  submitLabel: string;
  showTerms?: boolean;
  termsText?: string;
  termsLink?: LinkRef;
  switchPrompt?: string;
  switchLabel?: string;
};

export type AuthForgotView = {
  enabled: boolean;
  heading: string;
  subheading?: string;
  fields: AuthField[];
  submitLabel: string;
  backLabel?: string;
  successHeading?: string;
  successText?: string;
};

export type AuthOtpView = {
  enabled: boolean;
  heading: string;
  subheading?: string;
  length: 4 | 5 | 6;
  submitLabel: string;
  resendLabel?: string;
  resendSeconds?: number;
  requireOnLogin?: boolean;
  requireOnRegister?: boolean;
  requireOnForgot?: boolean;
};

export type AuthPanel = {
  eyebrow?: string;
  heading?: string;
  text?: string;
  /** Shown instead of heading/text while the register view is open. */
  registerHeading?: string;
  registerText?: string;
  image?: ImageRef;
  highlights?: string[];
  testimonial?: { quote: string; name: string; role?: string; avatar?: ImageRef };
  stats?: { value: string; label: string }[];
};

export type AuthColors = {
  accent?: string;
  panel?: string;
  panelText?: string;
  card?: string;
};

export type AuthAnimation = "none" | "fade" | "slide-up" | "slide-side" | "scale" | "blur";

export type AuthData = {
  variant: AuthVariant;
  defaultView?: AuthView;
  brandName?: string;
  logo?: ImageRef;
  formPosition?: "left" | "right";
  minHeight?: "auto" | "screen";
  inputStyle?: "outline" | "filled" | "underline" | "pill";
  buttonShape?: "rounded" | "pill" | "square";
  headingSize?: "sm" | "md" | "lg";
  showLabels?: boolean;
  showFieldIcons?: boolean;
  showPasswordToggle?: boolean;
  animation?: AuthAnimation;
  backgroundMotion?: boolean;
  colors?: AuthColors;
  panel?: AuthPanel;
  social: AuthSocial;
  login: AuthLoginView;
  register: AuthRegisterView;
  forgot: AuthForgotView;
  otp: AuthOtpView;
  successHeading?: string;
  successText?: string;
  /** Shown as a continue button once the flow completes. */
  successLink?: LinkRef;
  footerNote?: string;
};

export type CustomGap = "sm" | "md" | "lg";
export type CustomAlign = "start" | "center" | "end";
export type CustomCardTone = "default" | "muted" | "primary" | "glass";
export type CustomImageAspect = "auto" | "square" | "video" | "portrait";

/** One node of an AI-composed layout; the server enforces depth and size limits. */
export type CustomBlock =
  | { type: "stack"; direction?: "column" | "row"; gap?: CustomGap; align?: CustomAlign; children: CustomBlock[] }
  | { type: "grid"; columns: GridColumns; gap?: CustomGap; align?: "start" | "center"; children: CustomBlock[] }
  | { type: "card"; tone?: CustomCardTone; children: CustomBlock[] }
  | { type: "heading"; text: string; level?: 1 | 2 | 3 }
  | { type: "text"; text: string; size?: "sm" | "md" | "lg"; muted?: boolean }
  | { type: "badge"; text: string }
  | { type: "button"; label: string; href: string; tone?: "primary" | "secondary" }
  | { type: "image"; url: string; alt: string; aspect?: CustomImageAspect }
  | { type: "icon"; name: IconName }
  | { type: "list"; items: string[] };

export type CustomData = {
  width?: "contained" | "wide";
  align?: "start" | "center";
  blocks: CustomBlock[];
};

export const BLOG_DETAIL_DESIGNS = [
  "minimalist-editorial",
  "split-hero",
  "immersive-dark",
  "magazine-classic",
  "newsletter-tech",
  "floating-card",
  "sticky-sidebar",
  "swiss-brutalist",
  "visual-story",
  "glassmorphism-deck",
] as const;

export type BlogDetailDesign = (typeof BLOG_DETAIL_DESIGNS)[number];

export type BlogPostItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: ImageRef;
  category: string;
  authorName: string;
  authorAvatar?: ImageRef;
  date: string;
  readTime: string;
  featured?: boolean;
  readMoreLabel?: string;
};

export type BlogData = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  categories: string[];
  layout?: "grid-3" | "grid-2" | "magazine";
  showNewsletterCard?: boolean;
  newsletterTitle?: string;
  newsletterDescription?: string;
  newsletterPlaceholder?: string;
  newsletterButtonText?: string;
  posts: BlogPostItem[];
};

export type BlogContentSection = {
  heading?: string;
  subheading?: string;
  paragraphs: string[];
  quote?: string;
  quoteAuthor?: string;
  callout?: string;
  image?: ImageRef;
};

export type BlogDetailData = {
  design: BlogDetailDesign;
  title: string;
  subtitle?: string;
  category: string;
  date: string;
  authorName: string;
  authorRole?: string;
  authorAvatar?: ImageRef;
  authorBio?: string;
  readTime: string;
  coverImage: ImageRef;
  coverImageCaption?: string;
  content: BlogContentSection[];
  tags: string[];
  showShareButtons?: boolean;
  showAuthorBio?: boolean;
  showNewsletter?: boolean;
  newsletterTitle?: string;
  newsletterDescription?: string;
};

export const CARDS_VARIANTS = [
  "product-classic",
  "image-overlay",
  "horizontal-split",
  "minimal-accent",
  "floating-panel",
] as const;
export type CardsVariant = (typeof CARDS_VARIANTS)[number];

export const CARDS_CARD_STYLES = ["bordered", "shadow", "flat", "glass", "elevated"] as const;
export type CardsCardStyle = (typeof CARDS_CARD_STYLES)[number];

export const CARDS_CORNERS = ["square", "soft", "rounded", "large", "custom"] as const;
export type CardsCorner = (typeof CARDS_CORNERS)[number];

export const CARDS_BUTTON_VARIANTS = ["filled", "outline", "soft", "ghost", "link"] as const;
export type CardsButtonVariant = (typeof CARDS_BUTTON_VARIANTS)[number];

export const CARDS_BUTTON_SIZES = ["sm", "md", "lg"] as const;
export type CardsButtonSize = (typeof CARDS_BUTTON_SIZES)[number];

export const CARDS_IMAGE_ASPECTS = ["16:9", "4:3", "1:1", "3:4", "auto"] as const;
export type CardsImageAspect = (typeof CARDS_IMAGE_ASPECTS)[number];

export const CARDS_HOVER_EFFECTS = ["none", "lift", "zoom", "glow"] as const;
export type CardsHoverEffect = (typeof CARDS_HOVER_EFFECTS)[number];

export const CARDS_HEADER_LAYOUTS = ["center", "left", "split"] as const;
export type CardsHeaderLayout = (typeof CARDS_HEADER_LAYOUTS)[number];

export const CARDS_DESCRIPTION_LINES_MAX = 8;
export const CARDS_RADIUS_MAX = 48;

export type CardsButtonSettings = {
  /** Unset uses the design's own default. */
  variant?: CardsButtonVariant;
  secondaryVariant?: CardsButtonVariant;
  /** Unset follows the theme's corner radius. */
  shape?: ButtonShape;
  /** Corner radius in px, used only when `shape` is "custom". */
  radius?: number;
  size?: CardsButtonSize;
  fullWidth?: boolean;
  showArrow?: boolean;
};

export type CardItem = {
  title: string;
  subtitle?: string;
  description?: string;
  image?: ImageRef;
  icon?: IconName | string;
  iconImage?: ImageRef;
  badge?: string;
  tags?: string[];
  price?: string;
  link?: LinkRef;
  secondaryLink?: LinkRef;
  /** #rrggbb; the card's text switches to a readable colour automatically. */
  backgroundColor?: string;
  /** #rrggbb used for the accent bar, icon tint and badge. */
  accentColor?: string;
  featured?: boolean;
};

export type CardsData = {
  variant?: CardsVariant;
  eyebrow?: string;
  heading: string;
  intro?: string;
  headerLayout?: CardsHeaderLayout;
  /** Header link such as "View all products", shown beside or under the heading. */
  headerLink?: LinkRef;
  bottomCta?: LinkRef;
  columns: GridColumns;
  /** Unset shows at most 2 columns on tablets. */
  tabletColumns?: GridColumns;
  mobileColumns: GridColumns;
  /** "scroll" turns the grid into a swipeable row on phones. */
  mobileLayout?: "stack" | "scroll";
  gap?: "sm" | "md" | "lg";
  cardStyle?: CardsCardStyle;
  /** Unset follows the theme's corner radius. */
  cardCorners?: CardsCorner;
  /** Corner radius in px, used only when `cardCorners` is "custom". */
  cardRadius?: number;
  imageAspect?: CardsImageAspect;
  imageFit?: "cover" | "contain";
  imagePosition?: "left" | "right";
  contentAlign?: "left" | "center";
  hoverEffect?: CardsHoverEffect;
  /** Clamp descriptions to this many lines; 0 shows the full text. */
  descriptionLines?: number;
  /** Makes the whole card open the primary link. */
  clickableCards?: boolean;
  showImages?: boolean;
  showIcons?: boolean;
  showBadges?: boolean;
  showTags?: boolean;
  showDescription?: boolean;
  showPrices?: boolean;
  showNumbers?: boolean;
  button?: CardsButtonSettings;
  items: CardItem[];
};

export type SectionDataMap = {
  header: HeaderData;
  footer: FooterData;
  hero: HeroData;
  features: FeaturesData;
  services: ServicesData;
  cards: CardsData;
  testimonials: TestimonialsData;
  faq: FaqData;
  cta: CtaData;
  contact: ContactData;
  text: TextData;
  gallery: GalleryData;
  logos: LogosData;
  split: SplitData;
  stats: StatsData;
  pricing: PricingData;
  media: MediaData;
  team: TeamData;
  carousel: CarouselData;
  marquee: MarqueeData;
  auth: AuthData;
  custom: CustomData;
  blog: BlogData;
  blog_detail: BlogDetailData;
};

export type SectionType = keyof SectionDataMap;

/** Distributes over unions, so `SectionOf<"hero" | "faq">` is a discriminated union. */
export type SectionOf<T extends SectionType> = T extends SectionType
  ? {
      id: string;
      type: T;
      hidden: boolean;
      settings: SectionSettings;
      data: SectionDataMap[T];
    }
  : never;

export type Section = SectionOf<SectionType>;

export type PageData = {
  id: string;
  name: string;
  /** "/" for home, otherwise "/about" style. */
  slug: string;
  sections: Section[];
};

export type SiteData = {
  theme: ThemeSettings;
  header: HeaderData;
  footer: FooterData;
  pages: PageData[];
};
