import type { HeroData, ImageRef } from "./types.ts";

const slide = (id: string, alt: string): ImageRef => ({
  url: `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1800&q=80`,
  alt,
});

export type HeroSliderPreset = { key: string; label: string; description: string; data: () => Partial<HeroData> };

export const HERO_SLIDER_PRESETS: HeroSliderPreset[] = [
  {
    key: "hero-background-slider",
    label: "Hero · Background image slider",
    description: "Full-width photos that crossfade behind one headline and two buttons, with arrows and dots.",
    data: () => {
      const slides = [
        slide("1586023492125-27b2c045efd7", "Modern living room interior"),
        slide("1556911220-bff31c812dba", "Bright modern kitchen"),
        slide("1493809842364-78817add7ffb", "Sunlit living room with built-in storage"),
      ];
      return {
        variant: "background-image",
        backgroundImage: slides[0],
        backgroundSlides: slides,
        slideInterval: 5,
        bgImagePosition: "cover",
        bgOverlayType: "dark",
        overlayOpacity: 55,
        minHeight: "screen",
        alignment: { all: "left" },
        eyebrow: "",
        heading: "Premium interiors built to last",
        highlightText: "",
        subheading: "Durable, beautiful finishes for every room in your home. Designed with care and made for everyday life.",
        primaryCta: { label: "Explore products", href: "/products" },
        secondaryCta: { label: "Get a quote", href: "/contact" },
      };
    },
  },
];
