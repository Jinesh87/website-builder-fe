import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import HeroSection from "./sections/HeroSection.tsx";
import { heroSizingProps } from "./hero-sizing.ts";
import { createSection } from "./registry.ts";
import type { HeroData } from "./types.ts";

const hero = (data: Partial<HeroData>) => ({ variant: "centered", heading: "Hi", ...data }) as HeroData;

describe("heroSizingProps", () => {
  it("adds nothing when no sizes are set", () => {
    expect(heroSizingProps(hero({}))).toEqual({ className: "", style: {} });
  });

  it("sets a class and variable per size, clamped to the allowed range", () => {
    const props = heroSizingProps(hero({ sizing: { height: 80, headingSize: 500, gap: 10, buttonSize: "xl" } }));
    expect(props.className.split(" ").sort()).toEqual(["wb-hero-btn-size-xl", "wb-hero-sz-gap", "wb-hero-sz-heading", "wb-hero-sz-height"]);
    expect(props.style).toEqual({ "--wb-hero-height": "80vh", "--wb-hero-heading": "120px", "--wb-hero-gap": "10px" });
  });
});

describe("HeroSection sizing", () => {
  it("puts the sizes on the section next to the button shape", () => {
    const section = createSection("hero", { data: { sizing: { headingSize: 64, textSize: 20 }, buttonShape: "pill" } });
    const html = renderToStaticMarkup(<HeroSection section={section} />);
    expect(html).toMatch(/class="[^"]*wb-hero-btn-pill[^"]*wb-hero-sz-heading wb-hero-sz-text/);
    expect(html).toContain("--wb-hero-heading:64px");
    expect(html).toContain("--wb-hero-text:20px");
    expect(html).toContain("--wb-hero-btn-radius");
  });
});
