export const BUSINESS_TYPES = [
  "Restaurant / Café",
  "Shop / Store",
  "Clinic / Health",
  "Salon / Beauty",
  "School / Training",
  "Real estate",
  "Services / Agency",
  "Photo / Video / Events",
  "Portfolio",
  "Other",
] as const;
export type BusinessType = (typeof BUSINESS_TYPES)[number];

export const WEBSITE_PAGES = [
  "Home",
  "About",
  "Services",
  "Products / Shop",
  "Gallery",
  "Our work",
  "Videos",
  "Blog",
  "Reviews",
  "FAQ",
  "Booking",
  "Contact",
] as const;
export type WebsitePage = (typeof WEBSITE_PAGES)[number];

export const LOOK_OPTIONS = ["Light", "Dark", "Colourful"] as const;
export type LookOption = (typeof LOOK_OPTIONS)[number];

export const STYLE_OPTIONS = [
  "Modern",
  "Classic",
  "Bold",
  "Vintage",
  "Corporate",
  "You choose",
] as const;
export type StyleOption = (typeof STYLE_OPTIONS)[number];

export type PaletteDefinition = {
  key: string;
  label: string;
  colors: [string, string, string];
};

export const PALETTE_OPTIONS: PaletteDefinition[] = [
  { key: "Ocean", label: "Ocean", colors: ["#2563eb", "#3b82f6", "#93c5fd"] },
  { key: "Forest", label: "Forest", colors: ["#15803d", "#22c55e", "#86efac"] },
  { key: "Sunset", label: "Sunset", colors: ["#ea580c", "#f97316", "#fde047"] },
  { key: "Royal", label: "Royal", colors: ["#6b21a8", "#a855f7", "#d8b4fe"] },
  { key: "Black & gold", label: "Black & gold", colors: ["#18181b", "#ca8a04", "#fef08a"] },
  { key: "Pastel", label: "Pastel", colors: ["#f472b6", "#a5b4fc", "#fef08a"] },
  { key: "Red & white", label: "Red & white", colors: ["#b91c1c", "#ef4444", "#ffffff"] },
  { key: "Logo colours", label: "Logo colours", colors: ["#475569", "#94a3b8", "#cbd5e1"] },
];
export type PaletteOption = (typeof PALETTE_OPTIONS)[number]["label"];

export const FEATURE_OPTIONS = [
  "Online payments",
  "Online store",
  "Booking",
  "Newsletter",
  "Gallery",
  "Home video",
  "Reviews",
  "Multi-language",
] as const;
export type FeatureOption = (typeof FEATURE_OPTIONS)[number];

export const LOGO_OPTIONS = ["I have one", "Design one", "Use my name"] as const;
export type LogoOption = (typeof LOGO_OPTIONS)[number];

export const TEXT_OPTIONS = ["I'll send it", "You write it"] as const;
export type TextOption = (typeof TEXT_OPTIONS)[number];

export const PHOTOS_OPTIONS = ["My own", "Stock", "Mix"] as const;
export type PhotosOption = (typeof PHOTOS_OPTIONS)[number];

export const DOMAIN_OPTIONS = ["I have one", "Help me buy", "Free"] as const;
export type DomainOption = (typeof DOMAIN_OPTIONS)[number];

export const NEEDED_OPTIONS = ["ASAP", "2 wks", "1 month", "No rush"] as const;
export type NeededOption = (typeof NEEDED_OPTIONS)[number];

