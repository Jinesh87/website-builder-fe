import { describe, expect, it } from "vitest";
import { isOffsiteHref, mailtoHref, resolvePageLink, telHref } from "./links.ts";

const pages = [
  { id: "p-home", name: "Home", slug: "/" },
  { id: "p-about", name: "About", slug: "/about" },
  { id: "p-contact", name: "Contact", slug: "/contact" },
];
const [home, about, contact] = pages;

describe("isOffsiteHref", () => {
  it("detects web, email and phone links", () => {
    expect(isOffsiteHref("https://instagram.com")).toBe(true);
    expect(isOffsiteHref("mailto:hi@example.com")).toBe(true);
    expect(isOffsiteHref("tel:+15550192834")).toBe(true);
    expect(isOffsiteHref("/about")).toBe(false);
    expect(isOffsiteHref("#pricing")).toBe(false);
  });
});

describe("telHref", () => {
  it("keeps only the dialable digits and a leading plus", () => {
    expect(telHref("+91 98201-44520")).toBe("tel:+919820144520");
    expect(telHref("(555) 019-2834")).toBe("tel:5550192834");
    expect(telHref(" +1 (555) 019 2834 ")).toBe("tel:+15550192834");
  });

  it("rejects values that can't be dialed", () => {
    expect(telHref(undefined)).toBeNull();
    expect(telHref("")).toBeNull();
    expect(telHref("Call us")).toBeNull();
  });
});

describe("mailtoHref", () => {
  it("links email addresses", () => {
    expect(mailtoHref("hello@studio.com")).toBe("mailto:hello@studio.com");
    expect(mailtoHref("  team@example.co.in ")).toBe("mailto:team@example.co.in");
  });

  it("rejects values that aren't emails", () => {
    expect(mailtoHref(undefined)).toBeNull();
    expect(mailtoHref("hello")).toBeNull();
    expect(mailtoHref("hello@studio")).toBeNull();
    expect(mailtoHref("a b@example.com")).toBeNull();
  });
});

describe("resolvePageLink", () => {
  it("resolves site paths to pages", () => {
    expect(resolvePageLink(pages, "/")).toEqual({ page: home, hash: "" });
    expect(resolvePageLink(pages, "/about")).toEqual({ page: about, hash: "" });
    expect(resolvePageLink(pages, "about/")).toEqual({ page: about, hash: "" });
    expect(resolvePageLink(pages, "/About?ref=nav")).toEqual({ page: about, hash: "" });
    expect(resolvePageLink(pages, "p-contact")).toEqual({ page: contact, hash: "" });
  });

  it("keeps the anchor of page links", () => {
    expect(resolvePageLink(pages, "/#pricing")).toEqual({ page: home, hash: "pricing" });
    expect(resolvePageLink(pages, "/about#team")).toEqual({ page: about, hash: "team" });
  });

  it("keeps in-page anchors on the current page", () => {
    expect(resolvePageLink(pages, "#faq", about)).toEqual({ page: about, hash: "faq" });
    expect(resolvePageLink(pages, "#faq")).toBeNull();
  });

  it("sends legal links to the contact or about page", () => {
    expect(resolvePageLink(pages, "/privacy-policy")).toEqual({ page: about, hash: "" });
  });

  it("ignores placeholders, off-site and unknown links", () => {
    expect(resolvePageLink(pages, "#", home)).toBeNull();
    expect(resolvePageLink(pages, "")).toBeNull();
    expect(resolvePageLink(pages, "https://instagram.com")).toBeNull();
    expect(resolvePageLink(pages, "mailto:hi@example.com")).toBeNull();
    expect(resolvePageLink(pages, "/missing")).toBeNull();
  });
});
