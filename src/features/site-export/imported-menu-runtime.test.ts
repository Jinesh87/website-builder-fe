// @vitest-environment happy-dom
import { beforeAll, describe, expect, it } from "vitest";

beforeAll(async () => {
  await import("./imported-menu-runtime.js");
});

function mount(html: string, css: string): HTMLElement {
  document.body.innerHTML = `<div class="wb-site"><div class="wb-imported-html wbi-abc"><style>${css}</style><div class="wb-imported-html-root">${html}</div></div></div>`;
  return document.querySelector(".wb-imported-html") as HTMLElement;
}

const click = (el: Element) => el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

describe("imported hamburger menus", () => {
  it("toggles the class the block's CSS uses (Woodfit: .nav.open)", () => {
    const block = mount(
      `<header><nav class="nav" id="nav"><a class="brand" href="/">W</a><ul><li><a href="/about">About</a></li></ul>
        <button class="menu-btn" id="mb" aria-label="Open menu" aria-expanded="false"><svg></svg></button></nav></header>`,
      `.wb-site .wbi-abc .nav-link.active{color:red} .wb-site .wbi-abc .nav.open ul{display:flex}`,
    );
    const nav = block.querySelector("#nav")!;
    const button = block.querySelector("#mb")!;
    click(button.querySelector("svg")!);
    expect(nav.classList.contains("open")).toBe(true);
    expect(nav.classList.contains("active")).toBe(false);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    // Picking a menu link closes it again.
    click(block.querySelector('a[href="/about"]')!);
    expect(nav.classList.contains("open")).toBe(false);
    click(button);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(nav.classList.contains("open")).toBe(false);
  });

  it("follows aria-controls / Bootstrap collapse targets and their class", () => {
    const block = mount(
      `<nav class="navbar"><button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#links"></button>
        <div class="collapse navbar-collapse" id="links"><a href="/x">X</a></div></nav>`,
      `.wb-site .wbi-abc .collapse:not(.show){display:none}`,
    );
    click(block.querySelector(".navbar-toggler")!);
    expect(block.querySelector("#links")!.classList.contains("show")).toBe(true);
  });

  it("ignores ordinary links and buttons", () => {
    const block = mount(`<nav class="nav"><ul><li><a class="nav-link" href="/a">A</a></li></ul><button class="btn">Buy</button></nav>`, `.wb-site .wbi-abc .nav.open{}`);
    click(block.querySelector(".nav-link")!);
    click(block.querySelector(".btn")!);
    expect(block.querySelector(".nav")!.classList.contains("open")).toBe(false);
  });

  it("follows data-wb-nav markers exactly, even with unusual names", () => {
    const block = mount(
      `<header><div class="logo">W</div><span class="ico" data-wb-nav-toggle="main"><svg></svg></span>
        <div class="drawer" data-wb-nav="side"><a href="/s">Side</a></div>
        <div class="links" data-wb-nav="main" data-wb-nav-open-class="is-shown-mobile"><a href="/a">A</a></div></header>`,
      `.wb-site .wbi-abc .links.is-shown-mobile{display:block}`,
    );
    click(block.querySelector(".ico svg")!);
    expect(block.querySelector(".links")!.classList.contains("is-shown-mobile")).toBe(true);
    expect(block.querySelector(".drawer")!.className).toBe("drawer");
    expect(block.querySelector(".ico")!.getAttribute("aria-expanded")).toBe("true");
    click(block.querySelector('a[href="/a"]')!);
    expect(block.querySelector(".links")!.classList.contains("is-shown-mobile")).toBe(false);
  });
});
