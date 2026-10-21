import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { deviceWidth, type Device } from "../../../components/websites/DevicePreview.tsx";
import { useBuilderSite } from "../editor-context.ts";
import AiBuilderCanvasOverlay from "./AiBuilderCanvasOverlay.tsx";

const GUTTER = 24;

/**
 * Renders the canvas at the device's real width and scales it down to fit, so the
 * site's container-query breakpoints match what visitors see on that device.
 */
export default function CanvasViewport({
  device,
  children,
  onDeselect,
}: {
  device: Device;
  children: ReactNode;
  onDeselect?: () => void;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ width: number; height: number } | null>(null);
  const width = deviceWidth(device);

  let siteBg = "transparent";
  try {
    const site = useBuilderSite();
    siteBg = site?.theme?.colors?.background || "transparent";
  } catch {
    // CanvasViewport used outside BuilderSiteContext
  }

  useLayoutEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;
    const update = () => {
      const w = Math.max(outer.clientWidth - GUTTER * 2, 0);
      const h = Math.max(outer.clientHeight - GUTTER * 2, 0);
      setBox({ width: w, height: h });
    };
    const observer = new ResizeObserver(update);
    observer.observe(outer);
    update();
    return () => observer.disconnect();
  }, []);

  const scale = box ? Math.min(1, Math.max(box.width, 1) / width) : 1;
  const frameStyle: CSSProperties = {
    width,
    height: box ? box.height / scale : "100%",
    top: GUTTER,
    transform: `translateX(-50%) scale(${scale})`,
    backgroundColor: siteBg,
  };

  return (
    <div
      ref={outerRef}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onDeselect?.();
        }
      }}
      data-tour="canvas-area"
      className="relative z-(--z-ed-canvas) min-w-0 flex-1 h-full overflow-hidden bg-ed-app bg-[radial-gradient(var(--color-ed-border)_1px,transparent_1px)] bg-size-[16px_16px]"
    >
      {box && (
        <div
          data-tour="canvas-viewport"
          className="absolute left-1/2 origin-top overflow-hidden rounded-ed-lg border border-ed-border shadow-ed-canvas transition-[width] duration-200 motion-reduce:transition-none"
          style={frameStyle}
        >
          {children}
          <AiBuilderCanvasOverlay />
        </div>
      )}
      {scale < 1 && (
        <span className="pointer-events-none absolute bottom-2 right-3 rounded-ed-sm bg-ed-panel/90 px-1.5 py-0.5 font-mono text-ed-2xs text-ed-muted shadow-ed-xs">
          {width}px · {Math.round(scale * 100)}%
        </span>
      )}
    </div>
  );
}
