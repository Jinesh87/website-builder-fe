/**
 * Resilient image URL normalization, domain resolution, and context-aware fallback system.
 * Designed to ensure hero sections and site visuals never show broken images or empty backgrounds.
 */

export const CURATED_FALLBACK_IMAGES = {
  restaurant: [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2000&q=85",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=2000&q=85",
    "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=2000&q=85",
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=2000&q=85",
  ],
  tech: [
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2000&q=85",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2000&q=85",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=2000&q=85",
  ],
  agency: [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=85",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=2000&q=85",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=85",
  ],
  travel: [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=85",
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=2000&q=85",
  ],
  general: [
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=2000&q=85",
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=2000&q=85",
  ],
} as const;

/**
 * Modern ambient CSS background gradients when offline, loading, or recovering from image errors.
 */
export const AMBIENT_GRADIENTS: Record<ImageCategory, string> = {
  restaurant: "radial-gradient(ellipse at 50% 30%, #3b1d11 0%, #1a0b06 60%, #0d0603 100%)",
  tech: "radial-gradient(ellipse at 50% 30%, #1e1b4b 0%, #0f172a 60%, #020617 100%)",
  agency: "radial-gradient(ellipse at 50% 30%, #1e293b 0%, #0f172a 60%, #020617 100%)",
  travel: "radial-gradient(ellipse at 50% 30%, #064e3b 0%, #022c22 60%, #021612 100%)",
  general: "radial-gradient(ellipse at 50% 30%, #1e293b 0%, #0f172a 60%, #020617 100%)",
};

export type ImageCategory = keyof typeof CURATED_FALLBACK_IMAGES;

/**
 * Detects the industry / subject category from textual context (e.g. heading, subheading, badge).
 */
export function detectImageCategory(contextText?: string): ImageCategory {
  if (!contextText) return "general";
  const lower = contextText.toLowerCase();

  if (
    /\b(dine|dining|restaurant|food|gourmet|culinary|bistro|cafe|café|dish|dishes|chef|cuisine|table|steak|wine|menu|taste|eatery|bakery|bar)\b/.test(
      lower,
    )
  ) {
    return "restaurant";
  }

  if (
    /\b(saas|software|tech|ai|cloud|data|platform|code|dashboard|app|analytics|security|crypto|startup)\b/.test(
      lower,
    )
  ) {
    return "tech";
  }

  if (
    /\b(agency|creative|design|studio|portfolio|marketing|consulting|strategy|branding|growth)\b/.test(
      lower,
    )
  ) {
    return "agency";
  }

  if (
    /\b(travel|nature|hotel|resort|vacation|tour|outdoor|mountain|ocean|beach|wellness|fitness)\b/.test(
      lower,
    )
  ) {
    return "travel";
  }

  return "general";
}

/**
 * Returns a high-res, verified, thematic fallback image based on contextual keywords.
 */
export function getCuratedFallbackImage(contextText?: string, index = 0): string {
  const category = detectImageCategory(contextText);
  const list = CURATED_FALLBACK_IMAGES[category] || CURATED_FALLBACK_IMAGES.general;
  return list[index % list.length];
}

/**
 * Returns a rich ambient CSS background gradient matching the context.
 */
export function getAmbientGradient(contextText?: string): string {
  const category = detectImageCategory(contextText);
  return AMBIENT_GRADIENTS[category] || AMBIENT_GRADIENTS.general;
}

const PLACEHOLDER_TOKENS = new Set([
  "image_1",
  "image_2",
  "image_3",
  "image_4",
  "image_5",
  "image_6",
  "undefined",
  "null",
  "[object object]",
  "none",
]);

/**
 * Normalizes an image URL:
 * - Fixes relative backend media paths (/api/media/files/... or /uploads/...)
 * - Replaces hallucinated/unresolved placeholder tokens with curated fallback
 * - Ensures Unsplash URLs include optimal quality and format query parameters
 * - Returns a clean, loadable URL
 */
export function normalizeImageUrl(
  url?: string | null,
  contextText?: string,
): string {
  if (!url) return "";
  const trimmed = url.trim().replace(/^["']|["']$/g, "");
  if (!trimmed) return "";

  // Catch unresolved tokens or broken placeholder strings
  const lower = trimmed.toLowerCase();
  if (
    PLACEHOLDER_TOKENS.has(lower) ||
    lower.includes("example.com") ||
    lower === "https://images.unsplash.com/..." ||
    lower === "https://images.unsplash.com/photo-undefined"
  ) {
    return getCuratedFallbackImage(contextText);
  }

  // Handle data URIs and blob URIs directly
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  // Handle relative API media paths (/api/media/files/... or uploads/...)
  if (trimmed.startsWith("/api/") || trimmed.startsWith("api/")) {
    const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    // In dev server, backend is typically on :3000
    if (typeof window !== "undefined" && window.location.port === "5173") {
      return `http://localhost:3000${cleanPath}`;
    }
    return cleanPath;
  }

  if (trimmed.startsWith("/uploads/") || trimmed.startsWith("uploads/")) {
    const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    if (typeof window !== "undefined" && window.location.port === "5173") {
      return `http://localhost:3000${cleanPath}`;
    }
    return cleanPath;
  }

  // Ensure Unsplash images have proper query parameters for crisp, optimized rendering
  if (trimmed.includes("images.unsplash.com")) {
    try {
      const parsed = new URL(trimmed);
      if (!parsed.searchParams.has("auto")) {
        parsed.searchParams.set("auto", "format");
      }
      if (!parsed.searchParams.has("fit")) {
        parsed.searchParams.set("fit", "crop");
      }
      if (!parsed.searchParams.has("q")) {
        parsed.searchParams.set("q", "85");
      }
      if (!parsed.searchParams.has("w")) {
        parsed.searchParams.set("w", "2000");
      }
      return parsed.toString();
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}
