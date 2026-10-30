import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import GallerySection from "./sections/GallerySection.tsx";
import { SECTION_DEFINITIONS, SECTION_PRESETS } from "./registry.ts";
import type { SectionOf } from "./types.ts";

describe("gallery section and presets", () => {
  it("provides rich default dummy images with name and badge", () => {
    const defaultData = SECTION_DEFINITIONS.gallery.createData();
    expect(defaultData.images.length).toBeGreaterThan(0);
    expect(defaultData.images[0].name).toBe("Print Factory brand poster");
    expect(defaultData.images[0].badge).toBe("BRANDING");
    expect(defaultData.images[0].url).toContain("https://");
  });

  it("presets gallery-3 and gallery-4 include realistic dummy images for instant previews", () => {
    const preset3 = SECTION_PRESETS.find((p) => p.key === "gallery-3");
    expect(preset3).toBeDefined();
    const section3 = preset3!.create() as SectionOf<"gallery">;
    expect(section3.data.images.length).toBe(6);
    expect(section3.data.images[0].name).toBe("Print Factory brand poster");
    expect(section3.data.images[0].badge).toBe("BRANDING");
    expect(section3.data.images[1].name).toBe("Visiting cards");
    expect(section3.data.images[1].badge).toBe("STATIONERY");
    expect(section3.data.images[2].name).toBe("Shop opening flex banner");
    expect(section3.data.images[2].badge).toBe("LARGE FORMAT");

    const preset4 = SECTION_PRESETS.find((p) => p.key === "gallery-4");
    expect(preset4).toBeDefined();
    const section4 = preset4!.create() as SectionOf<"gallery">;
    expect(section4.data.columns).toBe(4);
    expect(section4.data.images.length).toBe(8);
  });

  it("renders name, badge, and description under each image in GallerySection", () => {
    const section: SectionOf<"gallery"> = {
      id: "test-gallery",
      type: "gallery",
      hidden: false,
      settings: { spacing: "default", background: "default", hideOnMobile: false },
      data: {
        eyebrow: "PORTFOLIO",
        heading: "Our work",
        intro: "Cards, banners, boards and branding we have printed.",
        columns: 3,
        mobileColumns: 1,
        cta: { label: "View all projects", href: "/portfolio" },
        images: [
          {
            url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab",
            alt: "Brand poster",
            name: "Print Factory brand poster",
            badge: "BRANDING",
            description: "Printed on 350gsm premium matte cotton stock.",
          },
        ],
      },
    };

    const html = renderToStaticMarkup(<GallerySection section={section} />);
    expect(html).toContain("PORTFOLIO");
    expect(html).toContain("Our work");
    expect(html).toContain("Cards, banners, boards and branding we have printed.");
    expect(html).toContain("Print Factory brand poster");
    expect(html).toContain("BRANDING");
    expect(html).toContain("Printed on 350gsm premium matte cotton stock.");
    expect(html).toContain("wb-gallery-name");
    expect(html).toContain("wb-gallery-badge");
    expect(html).toContain("wb-gallery-desc");
    expect(html).toContain("View all projects");
  });

  it("supports surface card style, overlay style, and custom aspect ratios", () => {
    const sectionSurface: SectionOf<"gallery"> = {
      id: "test-surface",
      type: "gallery",
      hidden: false,
      settings: { spacing: "default", background: "default", hideOnMobile: false },
      data: {
        columns: 3,
        mobileColumns: 1,
        cardStyle: "surface",
        imageAspect: "1:1",
        imageRadius: "pill",
        images: [
          {
            url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab",
            alt: "Brand poster",
            name: "Sample poster",
          },
        ],
      },
    };

    const surfaceHtml = renderToStaticMarkup(<GallerySection section={sectionSurface} />);
    expect(surfaceHtml).toContain("wb-gallery-surface");
    expect(surfaceHtml).toContain("aspect-square");
    expect(surfaceHtml).toContain("rounded-2xl");

    const sectionOverlay: SectionOf<"gallery"> = {
      id: "test-overlay",
      type: "gallery",
      hidden: false,
      settings: { spacing: "default", background: "default", hideOnMobile: false },
      data: {
        columns: 3,
        mobileColumns: 1,
        cardStyle: "overlay",
        imageAspect: "16:9",
        images: [
          {
            url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab",
            alt: "Brand poster",
            name: "Overlay poster",
            badge: "PROMO",
          },
        ],
      },
    };

    const overlayHtml = renderToStaticMarkup(<GallerySection section={sectionOverlay} />);
    expect(overlayHtml).toContain("aspect-[16/9]");
    expect(overlayHtml).toContain("bg-gradient-to-t");
  });
});
