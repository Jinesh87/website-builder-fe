import { describe, it, expect } from "vitest";
import { calculateFitDimensions, RESPONSIVE_PRESETS, optimizeImageToWebP } from "./image-optimizer.ts";

describe("image-optimizer", () => {
  it("preserves aspect ratio when downscaling wide images", () => {
    // 3840x2160 (16:9) fitted to 1920x1920
    const dim = calculateFitDimensions(3840, 2160, 1920, 1920);
    expect(dim.width).toBe(1920);
    expect(dim.height).toBe(1080);
  });

  it("preserves aspect ratio when downscaling tall/portrait images", () => {
    // 2000x4000 (1:2) fitted to 1920x1920
    const dim = calculateFitDimensions(2000, 4000, 1920, 1920);
    expect(dim.height).toBe(1920);
    expect(dim.width).toBe(960);
  });

  it("does not upscale images that are already smaller than constraints", () => {
    const dim = calculateFitDimensions(800, 600, 1920, 1920);
    expect(dim.width).toBe(800);
    expect(dim.height).toBe(600);
  });

  it("verifies standard responsive presets are correctly defined", () => {
    expect(RESPONSIVE_PRESETS.thumbnail.maxWidth).toBe(400);
    expect(RESPONSIVE_PRESETS.tablet.maxWidth).toBe(960);
    expect(RESPONSIVE_PRESETS.desktop.maxWidth).toBe(1920);
  });

  it("passes through SVG files without modification", async () => {
    const svgContent = "<svg><circle r='10'/></svg>";
    const svgFile = new File([svgContent], "icon.svg", { type: "image/svg+xml" });

    const result = await optimizeImageToWebP(svgFile);
    expect(result.file).toBe(svgFile);
    expect(result.mimeType).toBe("image/svg+xml");
    expect(result.savedPercent).toBe(0);
  });

  it("passes through animated GIF files without modification", async () => {
    const gifFile = new File(["GIF89a"], "animation.gif", { type: "image/gif" });

    const result = await optimizeImageToWebP(gifFile);
    expect(result.file).toBe(gifFile);
    expect(result.mimeType).toBe("image/gif");
  });
});
