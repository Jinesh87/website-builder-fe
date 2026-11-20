import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import HeroSection from "./sections/HeroSection.tsx";
import { SECTION_PRESETS } from "./registry.ts";
import { SiteRenderModeProvider } from "./render-mode.tsx";
import type { SectionOf } from "./types.ts";

const preset = () => {
  const found = SECTION_PRESETS.find((p) => p.key === "hero-background-slider");
  expect(found?.category).toBe("Hero");
  return found!.create() as SectionOf<"hero">;
};

const count = (html: string, needle: string) => html.split(needle).length - 1;

describe("hero background slider", () => {
  it("shows one slide with arrows and a dot per slide in the builder", () => {
    const html = renderToStaticMarkup(<HeroSection section={preset()} />);
    expect(count(html, "wb-hero-slide-bg")).toBe(1);
    expect(count(html, 'aria-label="Show slide')).toBe(3);
    expect(html).toContain("wb-hero-slider-prev");
    expect(html).toContain("Premium interiors built to last");
  });

  it("renders every slide as a static state the live runtime can switch and autoplay", () => {
    const html = renderToStaticMarkup(
      <SiteRenderModeProvider mode="static">
        <HeroSection section={preset()} />
      </SiteRenderModeProvider>,
    );
    expect(html).toContain('data-wb-states="0 1 2"');
    expect(html).toContain('data-wb-autoplay="5"');
    expect(count(html, "wb-hero-slide-bg")).toBe(3);
    expect(html).toContain('data-wb-go="next"');
    // The headline is rendered once, outside the slides.
    expect(count(html, "Premium interiors built to last")).toBe(1);
  });

  it("falls back to the single background image with fewer than two slides", () => {
    const section = preset();
    section.data.backgroundSlides = section.data.backgroundSlides!.slice(0, 1);
    const html = renderToStaticMarkup(<HeroSection section={section} />);
    expect(html).not.toContain("wb-hero-slider");
    expect(html).toContain("wb-hero-bg-media");
  });
});
