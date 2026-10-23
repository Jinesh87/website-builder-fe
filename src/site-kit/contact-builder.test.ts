import { describe, expect, it } from "vitest";
import {
  CONTACT_ID_PATTERN,
  contactInfoHref,
  contactMapEmbedUrl,
  createContactBlock,
  createContactField,
  createContactLayout,
  defaultContactFields,
  hasReplyField,
  layoutHasForm,
  layoutIds,
  moveContactBlock,
  newContactId,
  resolveContactLayout,
} from "./contact-builder.ts";
import type { ContactData } from "./types.ts";

const legacy: ContactData = {
  heading: "Get in touch",
  email: "hello@example.com",
  phone: "+91 98765 43210",
  address: "Vettikulam, Ernakulam",
  officeHours: "Mon - Sat: 9 AM - 6 PM",
  showForm: true,
  submitLabel: "Send",
  formHeading: "Send us a message",
  serviceOptions: ["Doors", " ", "Boards"],
};

describe("newContactId", () => {
  it("creates ids that are valid input names and not already taken", () => {
    const taken = new Set<string>();
    for (let i = 0; i < 200; i += 1) {
      const id = newContactId("field", taken);
      expect(id).toMatch(CONTACT_ID_PATTERN);
      expect(taken.has(id)).toBe(false);
      taken.add(id);
    }
  });
});

describe("defaultContactFields", () => {
  it("matches the default form and turns service tags into a multiple choice field", () => {
    const fields = defaultContactFields(legacy);
    expect(fields.map((field) => field.id)).toEqual(["name", "email", "services", "message"]);
    expect(fields[2]?.options).toEqual(["Doors", "Boards"]);
    expect(hasReplyField(fields)).toBe(true);
  });

  it("skips the services field without tags", () => {
    expect(defaultContactFields({}).map((field) => field.id)).toEqual(["name", "email", "message"]);
  });
});

describe("createContactField", () => {
  it("gives choice fields starter options and a fresh id", () => {
    const field = createContactField("select", ["name"]);
    expect(field.id).toMatch(CONTACT_ID_PATTERN);
    expect(field.options?.length).toBe(2);
    expect(createContactField("text", []).options).toBeUndefined();
  });
});

describe("createContactLayout", () => {
  it("keeps the details on the left and the form on the right", () => {
    const layout = createContactLayout(legacy);
    expect(layout.columns).toHaveLength(2);
    const [info, form] = layout.columns;
    expect(info?.blocks.map((block) => (block.type === "info" ? block.kind : block.type))).toEqual([
      "address",
      "phone",
      "email",
      "hours",
    ]);
    expect(form?.blocks.map((block) => block.type)).toEqual(["heading", "form"]);
    expect(new Set(layoutIds(layout)).size).toBe(layoutIds(layout).length);
  });

  it("drops the form column when the form is off", () => {
    const layout = createContactLayout({ ...legacy, showForm: false });
    expect(layoutHasForm(layout)).toBe(false);
    expect(layout.columns).toHaveLength(1);
    expect(layout.columns[0]?.width).toBe(12);
  });

  it("never returns an empty layout", () => {
    const layout = createContactLayout({ heading: "Hi", showForm: false, submitLabel: "Send" });
    expect(layout.columns[0]?.blocks).toHaveLength(1);
  });
});

describe("resolveContactLayout", () => {
  it("prefers the saved layout and falls back when it is missing or empty", () => {
    const saved = createContactLayout(legacy);
    expect(resolveContactLayout({ ...legacy, layout: saved })).toBe(saved);
    expect(resolveContactLayout({ ...legacy, layout: { columns: [] } }).columns.length).toBeGreaterThan(0);
  });
});

describe("moveContactBlock", () => {
  it("moves a block to the end of another column", () => {
    const layout = createContactLayout(legacy);
    const [info, form] = layout.columns;
    const moved = moveContactBlock(layout, info!.blocks[0]!.id, form!.id);
    expect(moved.columns[0]?.blocks).toHaveLength(info!.blocks.length - 1);
    expect(moved.columns[1]?.blocks.at(-1)?.id).toBe(info!.blocks[0]!.id);
    expect(moveContactBlock(layout, "missing", form!.id)).toBe(layout);
  });
});

describe("createContactBlock", () => {
  it("starts a map at the section address", () => {
    const block = createContactBlock("map", [], { address: "Kochi" });
    expect(block).toMatchObject({ type: "map", query: "Kochi" });
  });
});

describe("contactMapEmbedUrl", () => {
  it("encodes the place and skips blank queries", () => {
    expect(contactMapEmbedUrl("Ernakulam & Kochi")).toBe(
      "https://www.google.com/maps?q=Ernakulam%20%26%20Kochi&output=embed",
    );
    expect(contactMapEmbedUrl("  ")).toBeNull();
  });
});

describe("contactInfoHref", () => {
  it("links each kind of detail", () => {
    expect(contactInfoHref("email", "a@b.co")).toBe("mailto:a@b.co");
    expect(contactInfoHref("phone", "+91 98765-43210")).toBe("tel:+919876543210");
    expect(contactInfoHref("whatsapp", "+91 97780 31136")).toBe("https://wa.me/919778031136");
    expect(contactInfoHref("link", "example.com")).toBe("https://example.com");
    expect(contactInfoHref("hours", "Mon - Sat")).toBeNull();
    expect(contactInfoHref("email", " ")).toBeNull();
  });
});
