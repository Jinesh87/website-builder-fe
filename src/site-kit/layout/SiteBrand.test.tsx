import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SiteBrand } from "./SiteHeader.tsx";

describe("SiteBrand logo sizing", () => {
  it("keeps current 38px default when logoHeight is not specified", () => {
    const html = renderToStaticMarkup(
      <SiteBrand siteName="Test Brand" logo={{ url: "/uploads/my-logo.png", alt: "Logo" }} displayMode="logo_only" />
    );
    expect(html).toContain('class="wb-brand"');
    expect(html).toContain('src="/uploads/my-logo.png"');
    // Does NOT set --wb-logo-height or inline height override, so .wb-brand img max-height: 38px is untouched
    expect(html).not.toContain("--wb-logo-height");
    expect(html).not.toContain("height:38px");
  });

  it("applies custom logo height and CSS variable when logoHeight is set", () => {
    const html = renderToStaticMarkup(
      <SiteBrand
        siteName="Test Brand"
        logo={{ url: "/uploads/my-logo.png", alt: "Logo" }}
        displayMode="logo_only"
        logoHeight={64}
      />
    );
    expect(html).toContain("--wb-logo-height:64px");
    expect(html).toContain("height:64px");
    expect(html).toContain("max-height:64px");
  });

  it("applies custom logo height in logo_left and logo_right combos", () => {
    const html = renderToStaticMarkup(
      <SiteBrand
        siteName="Test Brand"
        logo={{ url: "/uploads/my-logo.png", alt: "Logo" }}
        displayMode="logo_left"
        logoHeight={48}
      />
    );
    expect(html).toContain("--wb-logo-height:48px");
    expect(html).toContain("height:48px");
    expect(html).toContain("max-height:48px");
    expect(html).toContain("Test Brand");
  });
});
