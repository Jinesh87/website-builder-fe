import { useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { Monitor, Smartphone, Tablet, type LucideIcon } from "lucide-react";
import { openVideoModal, SiteStyles, themeToCssVars, type ThemeSettings } from "../../site-kit/index.ts";
import { isExternalHref, isOffsiteHref, linkHash } from "../../site-kit/links.ts";

export type Device = "desktop" | "tablet" | "mobile";

export const DEVICES: { id: Device; label: string; width: number; icon: LucideIcon }[] = [
  { id: "desktop", label: "Desktop", width: 1280, icon: Monitor },
  { id: "tablet", label: "Tablet", width: 768, icon: Tablet },
  { id: "mobile", label: "Mobile", width: 390, icon: Smartphone },
];

export function deviceWidth(device: Device): number {
  return DEVICES.find((option) => option.id === device)?.width ?? 1280;
}

type DeviceToggleProps = {
  value: Device;
  onChange: (device: Device) => void;
  tone?: "light" | "dark";
};

export function DeviceToggle({ value, onChange, tone = "light" }: DeviceToggleProps) {
  const dark = tone === "dark";
  return (
    <div
      role="group"
      aria-label="Preview device"
      className={`flex rounded-lg border p-0.5 ${dark ? "border-white/15" : "border-line"}`}
    >
      {DEVICES.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          aria-pressed={value === id}
          onClick={() => onChange(id)}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
            value === id
              ? dark
                ? "bg-white text-ink font-medium shadow-sm"
                : "bg-ink text-white font-medium shadow-sm"
              : dark
                ? "text-white/70 hover:text-white"
                : "text-ink-body hover:text-ink"
          }`}
        >
          <Icon className="size-4" aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}

type PreviewFrameProps = {
  device: Device;
  /**
   * Receives the href of clicked site links, e.g. to switch the previewed page.
   * Returns true when the link was followed, so the preview scrolls to its `#anchor` or the top.
   */
  onLinkClick?: (href: string) => boolean;
  /** Lets web, email and phone links open (web links in a new tab) instead of swallowing them. */
  allowOffsiteLinks?: boolean;
  /** Scrolls the preview back to the top whenever this changes, e.g. the previewed page id. */
  scrollResetKey?: string;
  /** Scale the frame down to the available width instead of scrolling sideways. Exposes `--preview-scale`. */
  fit?: boolean;
  /** Theme settings for background color and typography */
  theme?: ThemeSettings;
  children: ReactNode;
};

/** Device frames scroll their own screen; the desktop frame scrolls inside the page around it. */
function scrollContainerOf(root: HTMLElement): HTMLElement | null {
  const deviceScreen = root.querySelector<HTMLElement>(".wb-device-scroll");
  if (deviceScreen) return deviceScreen;
  for (let node = root.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === "auto" || overflowY === "scroll") return node;
  }
  return document.scrollingElement instanceof HTMLElement ? document.scrollingElement : null;
}

function scrollPreview(root: HTMLElement, hash: string) {
  const container = scrollContainerOf(root);
  if (!container) return;
  const target = hash ? root.querySelector<HTMLElement>(`#${CSS.escape(hash)}`) : null;
  if (!target) {
    container.scrollTo({ top: 0 });
    return;
  }
  const containerBox = container.getBoundingClientRect();
  // Tablet and mobile frames are scaled with a CSS transform; scrollTop is in unscaled pixels.
  const scale = container.offsetHeight > 0 ? containerBox.height / container.offsetHeight : 1;
  const offset = (target.getBoundingClientRect().top - containerBox.top) / (scale || 1);
  const margin = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  container.scrollTo({ top: container.scrollTop + offset - margin, behavior: reduceMotion ? "auto" : "smooth" });
}

/** Fixed-width frame; site-kit container queries make it behave like a real device. */
export function PreviewFrame({
  device,
  onLinkClick,
  allowOffsiteLinks = false,
  scrollResetKey,
  fit = false,
  theme,
  children,
}: PreviewFrameProps) {
  const width = deviceWidth(device);
  const rootRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const deviceContainerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number | null>(null);
  const [deviceScale, setDeviceScale] = useState(1);
  const [navigation, setNavigation] = useState({ count: 0, hash: "" });

  const bg = theme?.colors?.background || "#ffffff";
  const text = theme?.colors?.text || "#18181b";
  const screenThemeVars = theme ? (themeToCssVars(theme) as CSSProperties) : undefined;
  const innerScreenStyle: CSSProperties = {
    transform: "translateZ(0)",
    backgroundColor: bg,
    color: text,
    ...screenThemeVars,
  };

  useLayoutEffect(() => {
    if (!fit) return;
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const update = () => {
      const nextScale = Math.min(1, outer.clientWidth / width);
      setScale(nextScale);
      setHeight(inner.offsetHeight * nextScale);
    };
    const observer = new ResizeObserver(update);
    observer.observe(outer);
    observer.observe(inner);
    update();
    return () => observer.disconnect();
  }, [fit, width]);

  useLayoutEffect(() => {
    if (device === "desktop" || fit) return;
    const el = deviceContainerRef.current;
    if (!el) return;
    const update = () => {
      const targetW = device === "tablet" ? 824 : 430;
      const targetH = device === "tablet" ? 820 : 800;
      const availW = el.clientWidth - 32;
      const availH = el.clientHeight - 32;
      const scaleW = availW > 0 && availW < targetW ? availW / targetW : 1;
      const scaleH = availH > 0 && availH < targetH ? Math.max(0.65, availH / targetH) : 1;
      const finalScale = Math.min(scaleW, scaleH);
      setDeviceScale(Math.min(1, Math.max(0.45, finalScale)));
    };
    const observer = new ResizeObserver(update);
    observer.observe(el);
    update();
    return () => observer.disconnect();
  }, [device, fit]);

  // Runs before the navigation effect so a link to another page's anchor ends at the anchor.
  useLayoutEffect(() => {
    const root = rootRef.current ?? deviceContainerRef.current;
    if (scrollResetKey === undefined || !root) return;
    scrollPreview(root, "");
  }, [scrollResetKey]);

  useLayoutEffect(() => {
    const root = rootRef.current ?? deviceContainerRef.current;
    if (navigation.count === 0 || !root) return;
    scrollPreview(root, navigation.hash);
  }, [navigation]);

  // Site links point at the client site's paths, which don't exist inside the builder.
  function handleClickCapture(event: MouseEvent<HTMLDivElement>) {
    const anchor = event.target instanceof Element ? event.target.closest("a") : null;
    if (!anchor) return;

    // Handle video modal trigger links
    const isVideoModal = anchor.hasAttribute("data-wb-video-modal") || anchor.hasAttribute("data-wb-video-url");
    if (isVideoModal) {
      event.preventDefault();
      const videoUrl = anchor.getAttribute("data-wb-video-url") || anchor.getAttribute("href") || "";
      const title = anchor.getAttribute("data-wb-video-title") || undefined;
      if (videoUrl && videoUrl !== "#video") {
        openVideoModal(videoUrl, title);
      }
      return;
    }

    const href = anchor.getAttribute("href") ?? "";
    if (allowOffsiteLinks && isOffsiteHref(href)) {
      if (isExternalHref(href) && anchor.target !== "_blank") {
        event.preventDefault();
        window.open(href, "_blank", "noopener,noreferrer");
      }
      return;
    }
    event.preventDefault();
    if (!onLinkClick?.(href)) return;
    setNavigation((current) => ({ count: current.count + 1, hash: linkHash(href) }));
  }

  if (fit) {
    const frameClass = "overflow-clip rounded-lg border border-line-strong bg-transparent shadow-sm";
    return (
      <div ref={rootRef} className="bg-canvas p-4 sm:p-6">
        <SiteStyles />
        <div ref={outerRef} className="mx-auto overflow-hidden" style={{ maxWidth: width, height: height ?? undefined }}>
          <div
            ref={innerRef}
            className={frameClass}
            style={{ width, transform: `scale(${scale})`, transformOrigin: "top left", "--preview-scale": scale } as CSSProperties}
            onClickCapture={handleClickCapture}
          >
            {children}
          </div>
        </div>
      </div>
    );
  }

  if (device === "desktop") {
    return (
      <div ref={rootRef} className="w-full min-h-full bg-transparent" onClickCapture={handleClickCapture}>
        <SiteStyles />
        {children}
      </div>
    );
  }

  if (device === "tablet") {
    return (
      <div
        ref={deviceContainerRef}
        className="relative flex items-center justify-center w-full h-full min-h-[calc(100vh-64px)] py-6 px-4 overflow-y-auto overflow-x-hidden bg-[#f4f5f8] bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:20px_20px]"
        onClickCapture={handleClickCapture}
      >
        <SiteStyles />

        {/* iPad Pro Hardware Shell */}
        <div
          className="relative shrink-0 flex flex-col items-center justify-center select-none transition-transform duration-200"
          style={{
            transform: deviceScale < 1 ? `scale(${deviceScale})` : undefined,
            transformOrigin: "center center",
          }}
        >
          {/* Studio Ambient Floor Shadow */}
          <div className="absolute -inset-3 rounded-[40px] bg-black/25 blur-2xl pointer-events-none" />

          {/* iPad Bezel Outer Chassis */}
          <div
            className="relative flex flex-col rounded-[32px] p-[12px] bg-gradient-to-b from-[#2d2f34] via-[#1c1d21] to-[#111214] ring-1 ring-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35),0_0_0_1px_rgba(0,0,0,0.9),inset_0_1px_1.5px_rgba(255,255,255,0.25)] shrink-0"
            style={{ width: 792, height: "min(780px, calc(100vh - 90px))", maxHeight: "calc(100vh - 90px)" }}
          >
            {/* Top iPad Camera & Sensor Dot (Neatly centered within the 12px bezel) */}
            <div className="absolute top-[4px] left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 pointer-events-none">
              <div className="size-[5px] rounded-full bg-[#05070a] ring-1 ring-white/10 relative flex items-center justify-center shadow-inner">
                <div className="size-[1.5px] rounded-full bg-blue-500/70" />
              </div>
              <div className="size-[3px] rounded-full bg-[#05070a]" />
            </div>

            {/* Inner Screen Display Glass */}
            <div
              className="relative flex flex-col flex-1 min-h-0 w-full overflow-hidden rounded-[20px] ring-1 ring-black/10 shadow-inner"
              style={innerScreenStyle}
            >
              {/* Scrollable Content */}
              <div
                className="wb-device-scroll flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden overscroll-contain pb-6"
                style={{ backgroundColor: bg }}
              >
                {children}
              </div>

              {/* iOS Home Indicator Bar */}
              <div
                className="absolute bottom-0 inset-x-0 h-6 z-30 flex items-center justify-center pointer-events-none"
                style={{
                  background: `linear-gradient(to top, color-mix(in srgb, ${bg} 90%, transparent), transparent)`,
                }}
              >
                <div
                  className="h-1 w-36 rounded-full"
                  style={{ backgroundColor: `color-mix(in srgb, ${text} 30%, transparent)` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mobile frame (iPhone 18 Pro)
  return (
    <div
      ref={deviceContainerRef}
      className="relative flex items-center justify-center w-full h-full min-h-[calc(100vh-64px)] py-6 px-4 overflow-y-auto overflow-x-hidden bg-[#f4f5f8] bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:20px_20px]"
      onClickCapture={handleClickCapture}
    >
      <SiteStyles />

      {/* iPhone Pro Hardware Shell */}
      <div
        className="relative shrink-0 flex flex-col items-center justify-center select-none transition-transform duration-200"
        style={{
          transform: deviceScale < 1 ? `scale(${deviceScale})` : undefined,
          transformOrigin: "center center",
        }}
      >
        {/* Studio Ambient Floor Shadow */}
        <div className="absolute -inset-3 rounded-[58px] bg-black/25 blur-2xl pointer-events-none" />

        {/* iPhone Outer Titanium Chassis */}
        <div
          className="relative flex flex-col rounded-[50px] p-[10px] bg-gradient-to-b from-[#2d2f34] via-[#1c1d21] to-[#111214] ring-1 ring-white/20 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.4),0_0_0_1px_rgba(0,0,0,0.9),inset_0_1px_1.5px_rgba(255,255,255,0.25)] shrink-0"
          style={{ width: 410, height: "min(760px, calc(100vh - 90px))", maxHeight: "calc(100vh - 90px)" }}
        >
          {/* Seamless Integrated Side Buttons (Left: Action + Volume) */}
          <div className="absolute -left-[2px] top-24 h-6 w-[2px] rounded-l-[1px] bg-[#3f3f46] border-l border-white/20 pointer-events-none" />
          <div className="absolute -left-[2px] top-34 h-10 w-[2px] rounded-l-[1px] bg-[#3f3f46] border-l border-white/20 pointer-events-none" />
          <div className="absolute -left-[2px] top-48 h-10 w-[2px] rounded-l-[1px] bg-[#3f3f46] border-l border-white/20 pointer-events-none" />

          {/* Seamless Integrated Side Button (Right: Power) */}
          <div className="absolute -right-[2px] top-36 h-14 w-[2px] rounded-r-[1px] bg-[#3f3f46] border-r border-white/20 pointer-events-none" />

          {/* Top Micro-Speaker Slit */}
          <div className="absolute top-[3.5px] left-1/2 -translate-x-1/2 h-[3px] w-12 rounded-full bg-[#05070a] ring-1 ring-white/10 z-30 pointer-events-none" />

          {/* Inner Screen Display Glass (Seamless 390px edge-to-edge canvas) */}
          <div
            className="relative flex flex-col flex-1 min-h-0 w-full overflow-hidden rounded-[40px] ring-1 ring-black/10 shadow-inner"
            style={innerScreenStyle}
          >
            {/* Authentic iOS Status Bar with Dynamic Island & Ambient Frosted Glass */}
            <div
              className="absolute top-0 inset-x-0 h-11 z-40 flex items-center justify-between px-6 pointer-events-none select-none"
              style={{
                background: `color-mix(in srgb, ${bg} 88%, transparent)`,
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                borderBottom: `1px solid color-mix(in srgb, ${text} 6%, transparent)`,
                color: text,
              }}
            >
              {/* Time */}
              <span className="text-[12.5px] font-semibold tracking-tight">
                9:41
              </span>

              {/* Dynamic Island Floating Pill */}
              <div className="absolute left-1/2 -translate-x-1/2 top-2 flex items-center justify-between px-2.5 h-[25px] w-[96px] rounded-full bg-black shadow-[0_2px_8px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
                {/* Lens */}
                <div className="size-2 rounded-full bg-[#080d1a] ring-1 ring-white/20 relative flex items-center justify-center">
                  <div className="size-0.5 rounded-full bg-blue-500/80" />
                </div>
                {/* Sensor */}
                <div className="size-1.5 rounded-full bg-[#0a0c10] ml-auto" />
              </div>

              {/* Status Icons */}
              <div className="flex items-center gap-1.5 opacity-85">
                {/* Cellular Signal (4 bars) */}
                <svg className="w-3.5 h-3" viewBox="0 0 17 12" fill="currentColor" aria-hidden="true">
                  <rect x="0" y="8" width="2.5" height="4" rx="0.5" />
                  <rect x="4" y="6" width="2.5" height="6" rx="0.5" />
                  <rect x="8" y="3" width="2.5" height="9" rx="0.5" />
                  <rect x="12" y="0" width="2.5" height="12" rx="0.5" />
                </svg>
                {/* Wi-Fi Icon */}
                <svg className="w-3.5 h-3" viewBox="0 0 16 12" fill="currentColor" aria-hidden="true">
                  <path d="M8 9.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM3.5 6.5C4.7 5.3 6.3 4.5 8 4.5s3.3.8 4.5 2L14 5C12.4 3.4 10.3 2.5 8 2.5S3.6 3.4 2 5l1.5 1.5zM0 3C2.2.8 5 0 8 0s5.8.8 8 3l-1.5 1.5C12.8 2.9 10.5 2 8 2S3.2 2.9 1.5 4.5L0 3z" />
                </svg>
                {/* Battery Icon */}
                <div className="w-[19px] h-[10px] rounded-[3px] border border-current p-[1px] flex items-center">
                  <div className="h-full w-3 bg-current rounded-[1px]" />
                </div>
              </div>
            </div>

            {/* Scrollable Website Preview (pt-11 protects safe area, pb-7 clears home bar, scrollbar hidden for authentic mobile feel) */}
            <div
              className="wb-device-scroll flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden overscroll-contain pt-11 pb-7"
              style={{
                backgroundColor: bg,
              }}
            >
              {children}
            </div>

            {/* Bottom iOS Home Indicator Safe Area Bar */}
            <div
              className="absolute bottom-0 inset-x-0 h-6 z-40 flex items-center justify-center pointer-events-none select-none"
              style={{
                background: `linear-gradient(to top, color-mix(in srgb, ${bg} 92%, transparent), transparent)`,
              }}
            >
              <div
                className="h-1 w-32 rounded-full"
                style={{ backgroundColor: `color-mix(in srgb, ${text} 35%, transparent)` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
