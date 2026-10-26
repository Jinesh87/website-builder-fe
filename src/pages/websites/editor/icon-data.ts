import { icons as lucideIcons } from "lucide-react";

export type IconCategory =
  | "all"
  | "popular"
  | "business"
  | "tech"
  | "communication"
  | "security"
  | "navigation"
  | "design"
  | "interface"
  | "health";

export const ICON_CATEGORIES: { id: IconCategory; label: string }[] = [
  { id: "all", label: "All Icons (1,500+)" },
  { id: "popular", label: "Popular & CMS" },
  { id: "business", label: "Business & Finance" },
  { id: "tech", label: "Tech & Software" },
  { id: "communication", label: "Communication" },
  { id: "security", label: "Security & Trust" },
  { id: "navigation", label: "Arrows & Nav" },
  { id: "design", label: "Design & Media" },
  { id: "interface", label: "UI & Actions" },
  { id: "health", label: "Health & Lifestyle" },
];

export type IconItem = {
  name: string;
  label: string;
  isLegacy?: boolean;
  category: IconCategory;
  keywords: string[];
};

export const LEGACY_ICONS: { name: string; label: string }[] = [
  { name: "gear", label: "Settings / Gear ⚙️" },
  { name: "user", label: "User / Profile 👤" },
  { name: "mail", label: "Mail / Contact ✉️" },
  { name: "phone", label: "Phone / Callback 📞" },
  { name: "chart", label: "Chart / Analytics 📊" },
  { name: "clock", label: "Clock / Real-time ⏱️" },
  { name: "tools", label: "Tools / Wrench 🛠️" },
  { name: "bell", label: "Bell / Notification 🔔" },
  { name: "wallet", label: "Wallet / Cost 💳" },
  { name: "pointer", label: "Pointer / Interactive 👆" },
  { name: "help", label: "Help / Support ❓" },
  { name: "sparkles", label: "Sparkles / AI ✨" },
  { name: "rocket", label: "Rocket / Speed 🚀" },
  { name: "layers", label: "Layers / Stack 🥞" },
  { name: "box", label: "Box / Package 📦" },
  { name: "lock", label: "Lock / Security 🔒" },
  { name: "cloud", label: "Cloud / Sync ☁️" },
  { name: "code", label: "Code / API 💻" },
  { name: "check", label: "Checkmark ✓" },
  { name: "star", label: "Star ★" },
  { name: "bolt", label: "Lightning ⚡" },
  { name: "shield", label: "Shield 🛡️" },
  { name: "heart", label: "Heart ❤️" },
  { name: "chat", label: "Chat 💬" },
];

const CATEGORY_KEYWORDS: Record<Exclude<IconCategory, "all">, string[]> = {
  popular: [
    "sparkles", "zap", "shield", "check", "star", "heart", "trending", "award",
    "flame", "globe", "target", "compass", "key", "cpu", "layers", "activity",
    "briefcase", "credit", "user", "mail", "phone", "clock", "rocket", "search",
    "settings", "bell", "lightbulb", "wand", "smile", "thumbs"
  ],
  business: [
    "dollar", "coin", "credit", "wallet", "receipt", "bank", "briefcase",
    "building", "store", "shop", "tag", "percent", "trending", "chart",
    "scale", "landmark", "calculator", "piggy", "money", "currency", "finance", "badge"
  ],
  tech: [
    "code", "cpu", "database", "server", "terminal", "cloud", "laptop",
    "monitor", "phone", "smartphone", "wifi", "git", "binary", "bot",
    "harddrive", "network", "circuit", "qr", "bracket", "layers", "window",
    "bug", "cable", "plug", "memory", "chip"
  ],
  communication: [
    "mail", "message", "chat", "phone", "send", "share", "inbox", "at-sign",
    "radio", "megaphone", "bell", "contact", "headset", "speech", "call", "broadcast"
  ],
  security: [
    "lock", "unlock", "shield", "key", "fingerprint", "eye", "file-key",
    "file-lock", "verified", "alert", "siren", "vault", "protect", "safe"
  ],
  navigation: [
    "arrow", "chevron", "compass", "map", "navigation", "move", "link",
    "external", "route", "signpost", "locate", "milestone", "pin", "crosshair"
  ],
  design: [
    "palette", "image", "camera", "video", "music", "film", "slider",
    "layout", "pencil", "pen", "wand", "brush", "crop", "figma", "scissors", "paint", "contrast"
  ],
  interface: [
    "menu", "more", "plus", "minus", "check", "x", "filter", "grid",
    "list", "slider", "maximize", "minimize", "settings", "loader", "refresh",
    "search", "toggle", "trash", "power", "help", "info"
  ],
  health: [
    "heart", "activity", "cross", "pill", "stethoscope", "smile", "dumbbell",
    "apple", "flame", "sun", "moon", "droplet", "sparkle", "leaf", "tree", "flower"
  ],
};

function splitPascalCase(str: string): string[] {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/\s+/);
}

function formatPascalLabel(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

let cachedIconCatalog: IconItem[] | null = null;

export function getIconCatalog(): IconItem[] {
  if (cachedIconCatalog) return cachedIconCatalog;

  const items: IconItem[] = [];

  // 1. Add legacy icons first
  for (const legacy of LEGACY_ICONS) {
    items.push({
      name: legacy.name,
      label: legacy.label,
      isLegacy: true,
      category: "popular",
      keywords: legacy.name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean),
    });
  }

  // 2. Add all Lucide icons
  const lucideKeys = Object.keys(lucideIcons);
  for (const key of lucideKeys) {
    if (typeof lucideIcons[key as keyof typeof lucideIcons] !== "object" && typeof lucideIcons[key as keyof typeof lucideIcons] !== "function") {
      continue;
    }

    const words = splitPascalCase(key);
    const wordsLower = words.join(" ");

    // Determine primary category
    let category: IconCategory = "interface";
    for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
      if (kws.some((kw) => wordsLower.includes(kw))) {
        category = cat as IconCategory;
        break;
      }
    }

    items.push({
      name: key,
      label: formatPascalLabel(key),
      isLegacy: false,
      category,
      keywords: words,
    });
  }

  cachedIconCatalog = items;
  return items;
}

export function searchIcons(query: string, category: IconCategory = "all"): IconItem[] {
  const catalog = getIconCatalog();
  const trimmed = query.trim().toLowerCase();
  const queryTokens = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];

  return catalog.filter((item) => {
    // Category check
    if (category !== "all") {
      if (category === "popular") {
        if (!item.isLegacy && item.category !== "popular") {
          const isPop = CATEGORY_KEYWORDS.popular.some((kw) =>
            item.name.toLowerCase().includes(kw)
          );
          if (!isPop) return false;
        }
      } else if (item.category !== category) {
        const matchCat = CATEGORY_KEYWORDS[category]?.some((kw) =>
          item.name.toLowerCase().includes(kw)
        );
        if (!matchCat) return false;
      }
    }

    // Query tokens check
    if (queryTokens.length === 0) return true;

    const lowerName = item.name.toLowerCase();
    const lowerLabel = item.label.toLowerCase();

    return queryTokens.every(
      (token) =>
        lowerName.includes(token) ||
        lowerLabel.includes(token) ||
        item.keywords.some((kw) => kw.includes(token))
    );
  });
}
