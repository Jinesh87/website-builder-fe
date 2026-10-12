/*
 * Interactivity for the exported static site: mobile menu, carousels, tabbed
 * views, video posters, password toggles, demo forms and the curved reel.
 * Pages are pre-rendered with every state in the markup; this only shows and
 * hides them. No dependencies.
 */
(function () {
  "use strict";

  /* ---------- State groups: carousels, auth views, hover lists ---------- */

  function statesOf(group) {
    return group.getAttribute("data-wb-states").split(" ");
  }

  function currentState(group) {
    const visible = Array.from(group.children).find((child) => !child.hidden);
    return visible ? visible.getAttribute("data-wb-state") : statesOf(group)[0];
  }

  function showState(group, state) {
    if (!statesOf(group).includes(state)) return;
    for (const child of group.children) child.hidden = child.getAttribute("data-wb-state") !== state;
  }

  function stepState(group, delta) {
    const states = statesOf(group);
    const index = states.indexOf(currentState(group));
    showState(group, states[(index + delta + states.length) % states.length]);
  }

  function go(trigger) {
    const group = trigger.closest("[data-wb-states]");
    if (!group) return;
    const target = trigger.getAttribute("data-wb-go");
    if (target === "next") stepState(group, 1);
    else if (target === "prev") stepState(group, -1);
    else showState(group, target);
  }

  function startAutoplay(group) {
    const seconds = Number(group.getAttribute("data-wb-autoplay"));
    if (!seconds) return;
    const hoverArea = group.parentElement || group;
    let paused = false;
    if (group.getAttribute("data-wb-pause-on-hover") === "true") {
      hoverArea.addEventListener("mouseenter", () => (paused = true));
      hoverArea.addEventListener("mouseleave", () => (paused = false));
    }
    setInterval(() => {
      if (!paused && !document.hidden) stepState(group, 1);
    }, seconds * 1000);
  }

  /* ---------- Mobile menu ---------- */

  function setMenu(menu, open) {
    menu.hidden = !open;
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    document.querySelectorAll("[data-wb-menu]").forEach((menu) => setMenu(menu, false));
  });

  /* ---------- Clicks ---------- */

  function playVideo(poster) {
    const url = poster.getAttribute("data-wb-video");
    const wrap = document.createElement("div");
    wrap.className = "wb-hero-video-iframe-wrap";
    const frame = document.createElement("iframe");
    frame.className = "wb-hero-video-iframe";
    frame.src = url + (url.includes("?") ? "&" : "?") + "autoplay=1";
    frame.title = "Hero Video";
    frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    frame.allowFullscreen = true;
    wrap.appendChild(frame);
    poster.replaceWith(wrap);
  }

  function togglePassword(button) {
    const input = button.parentElement && button.parentElement.querySelector("input");
    if (!input) return;
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    button.setAttribute("aria-pressed", String(show));
    button.setAttribute("aria-label", show ? "Hide password" : "Show password");
  }

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const opener = target.closest("[data-wb-menu-open]");
    if (opener) {
      const menu = (opener.closest(".wb-site") || document).querySelector("[data-wb-menu]");
      if (menu) setMenu(menu, true);
      return;
    }
    const closer = target.closest("[data-wb-menu-close], [data-wb-menu] a");
    if (closer) {
      const menu = closer.closest("[data-wb-menu]");
      if (menu) setMenu(menu, false);
      return;
    }

    const poster = target.closest("[data-wb-video]");
    if (poster) {
      playVideo(poster);
      return;
    }

    const passwordToggle = target.closest(".wb-auth-toggle");
    if (passwordToggle) {
      togglePassword(passwordToggle);
      return;
    }

    const trigger = target.closest("[data-wb-go]");
    if (trigger && !trigger.hasAttribute("data-wb-go-hover")) go(trigger);
  });

  document.addEventListener("mouseover", (event) => {
    const trigger = event.target instanceof Element && event.target.closest("[data-wb-go-hover]");
    if (trigger) go(trigger);
  });

  /* ---------- Forms: these are demos until you give them an `action` ---------- */

  document.addEventListener("submit", (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.hasAttribute("action")) return;
    event.preventDefault();
    if (form.classList.contains("wb-newsletter-form")) {
      const thanks = document.createElement("p");
      thanks.className = "text-xs font-semibold text-emerald-500";
      thanks.textContent = "Thank you for subscribing!";
      form.replaceWith(thanks);
      return;
    }
    form.reset();
  });

  /* ---------- Curved reel (3D looping banner) ---------- */

  function fitForWidth(width) {
    if (width >= 1024) return 1;
    if (width >= 768) return 0.84;
    if (width >= 480) return 0.72;
    return 0.62;
  }

  function initReel(reel) {
    const config = JSON.parse(reel.getAttribute("data-wb-reel") || "{}");
    const stage = reel.querySelector(".wb-reel-stage");
    if (!stage) return;
    const cards = Array.from(stage.querySelectorAll(".wb-reel-card"));
    const itemCount = cards.length / 3;
    const curve = config.curveFactor || 0;
    const direction = config.direction === "right-to-left" ? -1 : 1;

    let fit = 1;
    let cardW = config.cardWidth;
    let cardGap = config.gap;
    let offset = 0;
    let hovered = false;
    let dragging = false;
    let lastX = 0;
    let velocity = 0;
    let lastTime = null;

    function resize() {
      fit = fitForWidth(stage.clientWidth);
      cardW = Math.round(config.cardWidth * fit);
      const cardH = Math.round(config.cardHeight * fit);
      cardGap = Math.round(config.gap * fit);
      const pad = Math.round(32 * fit);
      stage.style.height = cardH + pad * 2 + "px";
      for (const card of cards) {
        card.style.width = cardW + "px";
        card.style.height = cardH + "px";
        card.style.top = pad + "px";
      }
      reel.classList.toggle("wb-reel-compact", fit < 0.8);
    }

    function place() {
      const viewportCenter = (stage.clientWidth || 1040) / 2;
      const step = cardW + cardGap;
      const totalWidth = cards.length * step;
      cards.forEach((card, index) => {
        let x = (index * step + offset) % totalWidth;
        if (x < -step * 2) x += totalWidth;
        else if (x > totalWidth - step) x -= totalWidth;
        const distance = (x + cardW / 2 - viewportCenter) / Math.max(1, viewportCenter);
        const rotY = distance * 20 * curve;
        const rotZ = distance * 3.8 * curve;
        const lift = -Math.pow(Math.abs(distance), 1.6) * 16 * fit * curve;
        const scale = 1 - Math.min(0.12, Math.abs(distance) * 0.05 * curve);
        const depth = -Math.abs(distance) * 36 * curve;
        card.style.transform = `translate3d(${x}px, ${lift}px, ${depth}px) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${scale})`;
        card.style.zIndex = String(100 - Math.min(90, Math.round(Math.abs(distance) * 40)));
      });
    }

    function tick(now) {
      if (lastTime === null) lastTime = now;
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      if (!dragging) {
        if (Math.abs(velocity) > 0.5) {
          offset += velocity * dt;
          velocity *= Math.pow(0.88, dt * 60);
        } else {
          velocity = 0;
          if (!(config.pauseOnHover && hovered)) offset += direction * config.speed * fit * dt;
        }
        const setWidth = itemCount * (cardW + cardGap);
        if (setWidth > 0) {
          if (offset >= setWidth) offset -= setWidth;
          else if (offset < 0) offset += setWidth;
        }
      }
      place();
      requestAnimationFrame(tick);
    }

    function down(x) {
      if (!config.interactive) return;
      dragging = true;
      lastX = x;
      velocity = 0;
    }
    function move(x) {
      if (!config.interactive || !dragging) return;
      const delta = x - lastX;
      lastX = x;
      offset += delta;
      velocity = delta * 50;
      place();
    }
    function up() {
      dragging = false;
    }

    reel.addEventListener("mouseenter", () => (hovered = true));
    reel.addEventListener("mouseleave", () => {
      hovered = false;
      up();
    });
    reel.addEventListener("mousedown", (event) => event.button === 0 && down(event.clientX));
    reel.addEventListener("mousemove", (event) => move(event.clientX));
    reel.addEventListener("mouseup", up);
    reel.addEventListener("touchstart", (event) => event.touches[0] && down(event.touches[0].clientX), { passive: true });
    reel.addEventListener("touchmove", (event) => event.touches[0] && move(event.touches[0].clientX), { passive: true });
    reel.addEventListener("touchend", up);

    new ResizeObserver(resize).observe(stage);
    resize();
    requestAnimationFrame(tick);
  }

  function init() {
    document.querySelectorAll("[data-wb-states][data-wb-autoplay]").forEach(startAutoplay);
    document.querySelectorAll("[data-wb-reel]").forEach(initReel);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
