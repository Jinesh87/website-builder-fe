/*
 * Mobile menus of imported HTML blocks.
 *
 * Imported pages lose their own JavaScript (it is stripped for safety), so a hamburger button
 * that used to run e.g. `nav.classList.toggle('open')` does nothing. This finds such buttons,
 * works out which element they open and which class the block's CSS uses for "open"
 * (`.nav.open`, `.menu.active`, `.navbar-collapse.show`, …) and toggles that class.
 *
 * Explicit markers (documented in the import guide) make this exact and win over guessing:
 *   data-wb-nav-toggle[="id"]   the menu button (optionally naming the menu it opens)
 *   data-wb-nav[="id"]          the menu it opens
 *   data-wb-nav-open-class="x"  on the menu: the class its CSS uses for "open" (default: detected, else "open")
 *
 * Plain script with no imports: it is inlined into published sites and exported code, and
 * imported once by the in-app preview. Installing it twice is a no-op.
 */
(function () {
  if (typeof document === "undefined" || typeof window === "undefined" || window.__wbImportedMenus) return;
  window.__wbImportedMenus = true;

  var LABEL = /\b(menu|navigation|nav)\b/i;
  var TOGGLE_CLASS =
    /(hamburger|burger|navbar-toggler|menu[-_]?(btn|button|toggle|toggler|trigger|icon|open)|nav[-_]?(btn|button|toggle|toggler|trigger|icon|open)|toggle[-_]?(menu|nav)|mobile[-_]?(menu|nav)[-_]?(btn|button|toggle|trigger))/i;
  var STATES = ["open", "active", "show", "is-open", "is-active", "menu-open", "nav-open", "opened", "expanded", "toggled", "visible", "in"];
  var opened = [];

  function escapeRe(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function isToggle(el) {
    if (!el.matches('button, [role="button"], a, label, span, div, i')) return false;
    if (el.closest("form")) return false;
    var text = (el.getAttribute("aria-label") || "") + " " + (el.getAttribute("title") || "");
    var names = (el.getAttribute("class") || "") + " " + (el.id || "");
    if (TOGGLE_CLASS.test(names)) return true;
    if (LABEL.test(text) && el.matches('button, [role="button"], a[href="#"], a:not([href])')) return true;
    // Collapse toggles (Bootstrap and friends) name what they open.
    var controls = el.getAttribute("data-bs-toggle") || el.getAttribute("data-toggle");
    return controls === "collapse" || controls === "offcanvas";
  }

  function findToggle(target, block) {
    var marked = target.closest("[data-wb-nav-toggle]");
    if (marked && block.contains(marked)) return marked;
    var el = target;
    for (var depth = 0; el && el !== block && depth < 5; depth++, el = el.parentElement) {
      if (isToggle(el)) return el;
      // A real link (e.g. a menu item) is never part of the menu button.
      if (el.matches("a[href]") && !/^#?$/.test(el.getAttribute("href") || "")) return null;
    }
    return null;
  }

  function hasMenuList(el, toggle) {
    var list = el.querySelector("ul, ol, menu, [class*='menu'], [class*='links']");
    return Boolean(list && list !== toggle && !list.contains(toggle));
  }

  function markedMenu(toggle, block) {
    if (!block.querySelector("[data-wb-nav]")) return null;
    var name = (toggle.getAttribute("data-wb-nav-toggle") || "").trim();
    if (name) {
      var menus = block.querySelectorAll("[data-wb-nav]");
      for (var i = 0; i < menus.length; i++) {
        if (menus[i].getAttribute("data-wb-nav") === name || menus[i].id === name) return menus[i];
      }
    }
    // The marked menu around the button, else the first marked menu in the block.
    for (var el = toggle.parentElement; el && el !== block; el = el.parentElement) {
      if (el.hasAttribute("data-wb-nav")) return el;
    }
    return block.querySelector("[data-wb-nav]");
  }

  function findMenu(toggle, block) {
    var marked = markedMenu(toggle, block);
    if (marked) return marked;
    var ref = toggle.getAttribute("aria-controls") || toggle.getAttribute("data-bs-target") || toggle.getAttribute("data-target") || "";
    var id = ref.replace(/^#/, "").trim();
    if (id && /^[\w-]+$/.test(id)) {
      var byId = block.querySelector("#" + id);
      if (byId) return byId;
    }
    // The menu is usually an ancestor (`nav > button + ul`) or a sibling of the button.
    for (var el = toggle.parentElement; el && el !== block; el = el.parentElement) {
      var tag = el.tagName.toLowerCase();
      var names = (el.getAttribute("class") || "") + " " + (el.id || "");
      if ((tag === "nav" || /nav|menu/i.test(names)) && hasMenuList(el, toggle)) return el;
      for (var i = 0; i < el.children.length; i++) {
        var child = el.children[i];
        if (child === toggle || child.contains(toggle)) continue;
        var childNames = (child.getAttribute("class") || "") + " " + (child.id || "");
        if (child.tagName.toLowerCase() === "nav" || /nav|menu/i.test(childNames)) return child;
      }
      if (tag === "header") break;
    }
    return null;
  }

  /** The class the block's CSS styles as "open" on `el` (via one of its classes or its id). */
  function stateClassFor(el, css) {
    var names = Array.prototype.slice.call(el.classList).map(function (c) {
      return "\\." + escapeRe(c);
    });
    if (el.id) names.push("#" + escapeRe(el.id));
    if (!names.length) return null;
    var who = "(?:" + names.join("|") + ")(?![\\w-])";
    // Other classes/ids of the same compound selector, e.g. `.nav.mobile.open` or `.collapse:not(.show)`.
    var same = "(?:[.#][\\w-]+|:not\\()*";
    for (var i = 0; i < STATES.length; i++) {
      var state = "\\." + escapeRe(STATES[i]) + "(?![\\w-])";
      if (new RegExp(who + same + state).test(css) || new RegExp(state + same + who).test(css)) {
        return STATES[i];
      }
    }
    return null;
  }

  function plan(toggle, block) {
    var menu = findMenu(toggle, block);
    var css = Array.prototype.map
      .call(block.querySelectorAll("style"), function (s) {
        return s.textContent || "";
      })
      .join("\n");
    var declared = menu && (menu.getAttribute("data-wb-nav-open-class") || "").trim();
    if (declared && /^[\w-]+$/.test(declared)) return { el: menu, state: declared, menu: menu };
    var candidates = [menu, toggle, block].filter(Boolean);
    for (var i = 0; i < candidates.length; i++) {
      var state = stateClassFor(candidates[i], css);
      if (state) return { el: candidates[i], state: state, menu: menu };
    }
    return menu ? { el: menu, state: "open", menu: menu } : null;
  }

  var FALLBACK_STYLE = {
    display: "flex",
    "flex-direction": "column",
    gap: "14px",
    position: "absolute",
    top: "100%",
    left: "0",
    right: "0",
    "z-index": "60",
    padding: "16px 20px",
    margin: "0",
    background: "var(--wb-imported-menu-bg, #fff)",
    "box-shadow": "0 12px 24px rgba(15, 23, 42, 0.12)",
  };

  function hidden(el) {
    var style = window.getComputedStyle(el);
    return style.display === "none" || style.visibility === "hidden";
  }

  /**
   * Blocks imported before their "open" styles were kept have no CSS for the open state: show
   * the hidden menu list as a simple drop-down under the header instead.
   */
  function applyFallback(entry, open) {
    if (!open) {
      if (entry.fallback) {
        Object.keys(FALLBACK_STYLE).forEach(function (prop) {
          entry.fallback.style.removeProperty(prop);
        });
        if (entry.anchor) entry.anchor.style.removeProperty("position");
      }
      entry.fallback = null;
      entry.anchor = null;
      return;
    }
    if (!entry.menu) return;
    var list = entry.menu.matches("ul, ol, menu") ? entry.menu : entry.menu.querySelector("ul, ol, menu");
    if (!list || !hidden(list)) return;
    var bg = window.getComputedStyle(entry.menu).backgroundColor;
    Object.keys(FALLBACK_STYLE).forEach(function (prop) {
      var value = prop === "background" && bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent" ? bg : FALLBACK_STYLE[prop];
      list.style.setProperty(prop, value, "important");
    });
    // Position the drop-down under the menu's bar.
    var anchor = entry.menu.matches("ul, ol, menu") ? entry.menu.parentElement : entry.menu;
    if (anchor && window.getComputedStyle(anchor).position === "static") {
      anchor.style.setProperty("position", "relative");
      entry.anchor = anchor;
    }
    entry.fallback = list;
  }

  function setOpen(entry, open) {
    entry.el.classList.toggle(entry.state, open);
    entry.toggle.setAttribute("aria-expanded", open ? "true" : "false");
    applyFallback(entry, open);
    var i = opened.indexOf(entry);
    if (open && i < 0) opened.push(entry);
    if (!open && i >= 0) opened.splice(i, 1);
  }

  document.addEventListener("click", function (event) {
    var target = event.target;
    if (!target || typeof target.closest !== "function") return;
    var block = target.closest(".wb-imported-html");
    if (!block) return;

    // A link inside an open menu: close it (the page or anchor change still happens).
    for (var i = opened.length - 1; i >= 0; i--) {
      var entry = opened[i];
      var link = target.closest("a[href]");
      if (link && entry.menu && entry.menu.contains(link) && !entry.toggle.contains(link)) setOpen(entry, false);
    }

    var toggle = findToggle(target, block);
    if (!toggle) return;
    var found = plan(toggle, block);
    if (!found) return;
    event.preventDefault();
    var current = null;
    for (var j = 0; j < opened.length; j++) if (opened[j].toggle === toggle) current = opened[j];
    if (current) setOpen(current, false);
    else setOpen({ el: found.el, state: found.state, menu: found.menu, toggle: toggle }, true);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    opened.slice().forEach(function (entry) {
      setOpen(entry, false);
    });
  });
})();
