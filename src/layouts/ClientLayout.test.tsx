import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import type { AuthUser } from "../api/auth.ts";
import { AuthContext } from "../auth/auth-context.ts";
import ClientLayout from "./ClientLayout.tsx";

function render(shopFeatureEnabled: boolean, url: string): string {
  const user = {
    id: "u1",
    email: "owner@example.com",
    username: null,
    fullName: "Shop Owner",
    phone: null,
    role: "CLIENT",
    status: "ACTIVE",
    emailVerified: true,
    client: { id: "c1", businessName: "Ramu", shopFeatureEnabled },
    createdAt: new Date(0).toISOString(),
  } as AuthUser;
  const auth = { user, loading: false, login: async () => user, logout: async () => {}, setSessionUser: () => {} };
  return renderToStaticMarkup(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[url]}>
        <ClientLayout />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

const links = (html: string) => [...html.matchAll(/<a [^>]*href="([^"]+)"[^>]*>([^<]*(?:<[^a][^>]*>[^<]*)*)<\/a>/g)].map((m) => m[1]);

describe("client sidebar shop links", () => {
  it("shows Products, Inventory and Orders under Shop when the shop is on", () => {
    const html = render(true, "/dashboard");
    expect(links(html)).toEqual(expect.arrayContaining(["/shop?section=products", "/shop?section=inventory", "/shop?section=orders"]));
  });

  it("hides them when the shop feature is off", () => {
    expect(render(false, "/dashboard")).not.toContain("section=orders");
  });

  it("keeps the chosen website and highlights the open section", () => {
    const html = render(true, "/shop?website=w1&section=orders");
    expect(html).toContain('href="/shop?website=w1&amp;section=inventory"');
    expect(html).toMatch(/class="[^"]*font-semibold[^"]*"[^>]*href="\/shop\?website=w1&amp;section=orders"|href="\/shop\?website=w1&amp;section=orders"[^>]*class="[^"]*font-semibold/);
  });
});
