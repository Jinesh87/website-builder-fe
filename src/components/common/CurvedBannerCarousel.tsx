import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { Play } from "lucide-react";

export type CurvedBannerItem = {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  image: string;
  videoUrl?: string;
  author?: string;
  aspectRatio?: string;
  alt?: string;
};

export type CurvedBannerCarouselProps = {
  items?: CurvedBannerItem[];
  direction?: "left-to-right" | "right-to-left";
  speed?: number; // base speed in pixels per second
  pauseOnHover?: boolean;
  interactive?: boolean; // drag / swipe support
  curveIntensity?: "none" | "subtle" | "medium" | "dramatic";
  /** Desktop card size; cards scale down automatically on narrower containers. */
  cardWidth?: number;
  cardHeight?: number;
  gap?: number;
  className?: string;
  onItemClick?: (item: CurvedBannerItem) => void;
};

export const DEFAULT_BANNER_ITEMS: CurvedBannerItem[] = [
  {
    id: "coastal-cliff",
    title: "Cliffside Explorer",
    subtitle: "Cinematic drone capture on coastal cliffs",
    badge: "Travel",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&h=1050&q=85",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    author: "@marco_travels",
    alt: "Person sitting on rocky coastal cliffs looking at azure sea",
  },
  {
    id: "skincare-spa",
    title: "Aesthetic Wellness",
    subtitle: "Facial foam skincare gentle treatment",
    badge: "Beauty",
    image:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=700&h=1050&q=85",
    author: "@glow_studios",
    alt: "Person receiving relaxing aesthetic foam facial skincare treatment",
  },
  {
    id: "citrus-flatlay",
    title: "Vibrant Harvest",
    subtitle: "Grapefruits, lemons and fresh citrus fruits",
    badge: "Food & Drink",
    image:
      "https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&w=700&h=1050&q=85",
    author: "@citrus_kitchen",
    alt: "Sliced grapefruits and fresh lemons on rustic board",
  },
  {
    id: "smoothie-bowl",
    title: "Morning Routine",
    subtitle: "Organic acai bowl with fresh berries & granola",
    badge: "Lifestyle",
    image:
      "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=700&h=1050&q=85",
    author: "@nourish_daily",
    alt: "Smiling woman enjoying fresh smoothie bowl with spoon",
  },
  {
    id: "motorcycle-ride",
    title: "Night Highway",
    subtitle: "Cinematic motorcycle ride over suspension bridge",
    badge: "Automotive",
    image:
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=700&h=1050&q=85",
    author: "@riders_journal",
    alt: "Motorcyclist cruising through bridge highway with headlights",
  },
  {
    id: "fresh-juice",
    title: "Artisan Refresh",
    subtitle: "Cold pressed orange juice in morning sunshine",
    badge: "Culinary",
    image:
      "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=700&h=1050&q=85",
    author: "@fresh_press",
    alt: "Hands pouring fresh squeezed orange juice into a glass jar",
  },
  {
    id: "creator-studio",
    title: "Golden Hour Studio",
    subtitle: "Behind the lens with top video storytellers",
    badge: "Creator",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&h=1050&q=85",
    author: "@sarah_creates",
    alt: "Creator in studio setting with warm cinematic lighting",
  },
  {
    id: "street-fashion",
    title: "Urban Motion",
    subtitle: "High fashion editorial lookbook in motion",
    badge: "Fashion",
    image:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=700&h=1050&q=85",
    author: "@tokyo_street",
    alt: "Traveler standing near scenic landscape overlooking vista",
  },
];

/** Card scale for the carousel's own width, so tablet/mobile previews match real devices. */
function fitForWidth(width: number): number {
  if (width >= 1024) return 1;
  if (width >= 768) return 0.84;
  if (width >= 480) return 0.72;
  return 0.62;
}

export function calculateCurvedCardLayout(
  idx: number,
  offset: number,
  viewportWidth: number,
  step: number,
  totalWidth: number,
  cardW: number,
  curveFactor: number,
  fit: number
) {
  const viewportCenter = viewportWidth / 2;
  const naturalCenter = idx * step + offset + cardW / 2;
  const diff = naturalCenter - viewportCenter;
  const wrappedDiff = (((diff % totalWidth) + totalWidth * 1.5) % totalWidth) - totalWidth / 2;
  const cardCenter = viewportCenter + wrappedDiff;
  const cardX = cardCenter - cardW / 2;
  const normDistance = (cardCenter - viewportCenter) / Math.max(1, viewportCenter);

  // Cylindrical arc: rotate towards center, tilt along the arc, lift and recede the outer cards
  const rotY = Number((normDistance * 20 * curveFactor).toFixed(2));
  const rotZ = Number((normDistance * 3.8 * curveFactor).toFixed(2));
  const archElevation = Number((-Math.pow(Math.abs(normDistance), 1.6) * 16 * fit * curveFactor).toFixed(2));
  const scale = Number((1 - Math.min(0.12, Math.abs(normDistance) * 0.05 * curveFactor)).toFixed(3));
  const transZ = Number((-Math.abs(normDistance) * 36 * curveFactor).toFixed(2));
  const zIndex = 100 - Math.min(90, Math.round(Math.abs(normDistance) * 40));

  return {
    cardX,
    archElevation,
    transZ,
    rotY,
    rotZ,
    scale,
    zIndex,
    transform: `translate3d(${cardX.toFixed(1)}px, ${archElevation}px, ${transZ}px) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${scale})`,
  };
}

export default function CurvedBannerCarousel({
  items = DEFAULT_BANNER_ITEMS,
  direction = "left-to-right",
  speed = 42,
  pauseOnHover = true,
  interactive = true,
  curveIntensity = "medium",
  cardWidth = 240,
  cardHeight = 350,
  gap = 20,
  className = "",
  onItemClick,
}: CurvedBannerCarouselProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [fit, setFit] = useState(1);

  const cardW = Math.round(cardWidth * fit);
  const cardH = Math.round(cardHeight * fit);
  const cardGap = Math.round(gap * fit);
  // Room above/below the cards for the arc lift and hover scale, so nothing gets clipped.
  const stagePad = Math.round(32 * fit);

  // Duplicated items for endless looping (3 sets)
  const duplicatedItems = items.concat(items, items);
  const totalItemCount = duplicatedItems.length;
  const step = cardW + cardGap;
  const totalWidth = totalItemCount * step;
  const setWidth = items.length * step;

  const defaultViewportWidth = 1200;
  const initialOffset = (defaultViewportWidth / 2) - (items.length * step + cardW / 2);

  // Position and momentum refs (avoiding React state re-render loop for 60/120fps)
  const offsetRef = useRef<number | null>(null);
  const isHoveredRef = useRef(false);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const lastDragXRef = useRef(0);
  const dragVelocityRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const curveFactor =
    curveIntensity === "none"
      ? 0
      : curveIntensity === "subtle"
        ? 0.55
        : curveIntensity === "dramatic"
          ? 1.45
          : 1.0;

  const [activePreview, setActivePreview] = useState<CurvedBannerItem | null>(null);

  const updateTransforms = useCallback(
    (offset: number) => {
      const container = containerRef.current;
      if (!container) return;

      const viewportWidth = container.clientWidth || container.offsetWidth || defaultViewportWidth;
      const currentStep = cardW + cardGap;
      const currentTotalWidth = totalItemCount * currentStep;

      for (let i = 0; i < totalItemCount; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;

        const layout = calculateCurvedCardLayout(
          i,
          offset,
          viewportWidth,
          currentStep,
          currentTotalWidth,
          cardW,
          curveFactor,
          fit
        );

        el.style.transform = layout.transform;
        el.style.zIndex = String(layout.zIndex);
      }
    },
    [cardW, cardGap, totalItemCount, curveFactor, fit, defaultViewportWidth]
  );

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const update = () => {
      const w = container.clientWidth || container.offsetWidth || defaultViewportWidth;
      const newFit = fitForWidth(w);
      setFit(newFit);
      if (offsetRef.current === null) {
        const curCardW = Math.round(cardWidth * newFit);
        const curCardGap = Math.round(gap * newFit);
        const curStep = curCardW + curCardGap;
        const centerIdx = items.length;
        offsetRef.current = (w / 2) - (centerIdx * curStep + curCardW / 2);
        updateTransforms(offsetRef.current);
      }
    };
    const observer = new ResizeObserver(update);
    observer.observe(container);
    update();
    return () => observer.disconnect();
  }, [items.length, cardWidth, gap, updateTransforms, defaultViewportWidth]);

  useEffect(() => {
    let running = true;

    if (offsetRef.current === null) {
      const container = containerRef.current;
      const w = container ? (container.clientWidth || container.offsetWidth || defaultViewportWidth) : defaultViewportWidth;
      const curCardW = Math.round(cardWidth * fit);
      const curCardGap = Math.round(gap * fit);
      const curStep = curCardW + curCardGap;
      const centerIdx = items.length;
      offsetRef.current = (w / 2) - (centerIdx * curStep + curCardW / 2);
    }

    const tick = (now: number) => {
      if (!running) return;

      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }
      const dt = Math.min(0.1, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      if (!isDraggingRef.current && offsetRef.current !== null) {
        if (Math.abs(dragVelocityRef.current) > 0.5) {
          offsetRef.current += dragVelocityRef.current * dt;
          dragVelocityRef.current *= Math.pow(0.88, dt * 60);
        } else {
          dragVelocityRef.current = 0;
          const isPaused = pauseOnHover && isHoveredRef.current;
          if (!isPaused && speed > 0) {
            const dirMultiplier = direction === "left-to-right" ? 1 : -1;
            offsetRef.current += dirMultiplier * speed * fit * dt;
          }
        }

        // Keep offset bounded to avoid large numbers while preserving seamless loop
        if (setWidth > 0) {
          if (offsetRef.current >= setWidth) {
            offsetRef.current -= setWidth;
          } else if (offsetRef.current < -setWidth) {
            offsetRef.current += setWidth;
          }
        }
      }

      if (offsetRef.current !== null) {
        updateTransforms(offsetRef.current);
      }
      animFrameIdRef.current = requestAnimationFrame(tick);
    };

    animFrameIdRef.current = requestAnimationFrame(tick);

    return () => {
      running = false;
      lastTimeRef.current = null;
      if (animFrameIdRef.current !== null) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [direction, speed, fit, pauseOnHover, setWidth, updateTransforms, defaultViewportWidth, cardWidth, gap, items.length]);

  const handlePointerDown = (clientX: number) => {
    if (!interactive) return;
    isDraggingRef.current = true;
    dragStartXRef.current = clientX;
    lastDragXRef.current = clientX;
    dragVelocityRef.current = 0;
  };

  const handlePointerMove = (clientX: number) => {
    if (!interactive || !isDraggingRef.current) return;
    const delta = clientX - lastDragXRef.current;
    lastDragXRef.current = clientX;
    if (offsetRef.current !== null) {
      offsetRef.current += delta;
      dragVelocityRef.current = delta * 50;
      updateTransforms(offsetRef.current);
    }
  };

  const handlePointerUp = () => {
    if (!interactive) return;
    isDraggingRef.current = false;
  };

  const onMouseDown = (e: ReactMouseEvent) => {
    if (e.button !== 0) return;
    handlePointerDown(e.clientX);
  };

  const onTouchStart = (e: ReactTouchEvent) => {
    if (e.touches.length > 0) {
      handlePointerDown(e.touches[0].clientX);
    }
  };

  const onTouchMove = (e: ReactTouchEvent) => {
    if (e.touches.length > 0) {
      handlePointerMove(e.touches[0].clientX);
    }
  };

  const handleCardClick = (item: CurvedBannerItem) => {
    // A drag that ends over a card shouldn't open it
    if (Math.abs(lastDragXRef.current - dragStartXRef.current) > 8) {
      return;
    }
    if (onItemClick) {
      onItemClick(item);
    } else {
      setActivePreview(item);
    }
  };

  return (
    <>
      <div
        className={`wb-reel${interactive ? " wb-reel-interactive" : ""}${fit < 0.8 ? " wb-reel-compact" : ""} ${className}`}
        onMouseEnter={() => {
          isHoveredRef.current = true;
        }}
        onMouseLeave={() => {
          isHoveredRef.current = false;
          handlePointerUp();
        }}
        onMouseDown={onMouseDown}
        onMouseMove={(e) => handlePointerMove(e.clientX)}
        onMouseUp={handlePointerUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={handlePointerUp}
        aria-label="Interactive 3D video carousel"
        data-wb-reel={JSON.stringify({ speed, direction, curveFactor, pauseOnHover, interactive, cardWidth, cardHeight, gap })}
      >
        <div
          ref={containerRef}
          className="wb-reel-stage"
          style={{ height: cardH + stagePad * 2 }}
        >
          {duplicatedItems.map((item, idx) => {
            const initialLayout = calculateCurvedCardLayout(
              idx,
              initialOffset,
              defaultViewportWidth,
              step,
              totalWidth,
              cardW,
              curveFactor,
              fit
            );
            return (
              <div
                key={`${item.id}-${idx}`}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                onClick={() => handleCardClick(item)}
                className="wb-reel-card"
                style={{
                  width: cardW,
                  height: cardH,
                  top: stagePad,
                  transform: initialLayout.transform,
                  zIndex: initialLayout.zIndex,
                }}
              >
                <div className="wb-reel-card-inner">
                  <img
                    src={item.image}
                    alt={item.alt || item.title}
                    loading={idx < 8 ? "eager" : "lazy"}
                    draggable={false}
                    className="wb-reel-img"
                  />
                  <div className="wb-reel-shade" aria-hidden />

                  {item.badge && <span className="wb-reel-badge">{item.badge}</span>}

                  <span className="wb-reel-play" aria-hidden>
                    <Play width={18} height={18} fill="currentColor" />
                  </span>

                  <div className="wb-reel-meta">
                    {item.author && <p className="wb-reel-author">{item.author}</p>}
                  <h4 className="wb-reel-title">{item.title}</h4>
                </div>

                <div className="wb-reel-ring" aria-hidden />
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {activePreview && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activePreview.title}
          className="wb-reel-modal"
          onClick={() => setActivePreview(null)}
        >
          <div className="wb-reel-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="wb-reel-modal-head">
              <div>
                <span className="wb-reel-modal-eyebrow">{activePreview.badge || "Video Reel"}</span>
                <h3 className="wb-reel-modal-title">{activePreview.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePreview(null)}
                className="wb-reel-modal-close"
                aria-label="Close preview"
              >
                ✕
              </button>
            </div>

            <div className="wb-reel-modal-media">
              {activePreview.videoUrl ? (
                <video
                  src={activePreview.videoUrl}
                  poster={activePreview.image}
                  autoPlay
                  controls
                  loop
                  playsInline
                />
              ) : (
                <img src={activePreview.image} alt={activePreview.alt || activePreview.title} />
              )}
            </div>

            <div className="wb-reel-modal-foot">
              <div>
                {activePreview.author && <p className="wb-reel-modal-author">{activePreview.author}</p>}
                {activePreview.subtitle && <p className="wb-reel-modal-sub">{activePreview.subtitle}</p>}
              </div>
              <button type="button" onClick={() => setActivePreview(null)} className="wb-reel-modal-done">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
