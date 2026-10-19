import { memo } from "react";
import type { SpotlightRect } from "./types.ts";

type TourSpotlightProps = {
  spotlight: SpotlightRect;
  onBackdropClick?: () => void;
};

export const TourSpotlight = memo(function TourSpotlight({
  spotlight,
  onBackdropClick,
}: TourSpotlightProps) {
  const { x, y, width, height, radius, isVisible } = spotlight;

  return (
    <div
      className="fixed inset-0 pointer-events-none transition-opacity duration-300 ease-out"
      style={{ zIndex: "var(--z-ed-tour, 80)" }}
      aria-hidden="true"
    >
      <svg className="absolute inset-0 h-full w-full pointer-events-none">
        <defs>
          {/* Spotlight cutout mask: White = opaque backdrop, Black = transparent cutout */}
          <mask id="editor-tour-spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="#ffffff" />
            {isVisible && (
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                rx={radius}
                ry={radius}
                fill="#000000"
                style={{
                  transition: "all 320ms cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            )}
          </mask>

          {/* Minimalist soft glow filter */}
          <filter id="tour-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Dimmed backdrop covering viewport with hole cut out */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(10, 12, 20, 0.65)"
          mask="url(#editor-tour-spotlight-mask)"
          className="pointer-events-auto cursor-pointer backdrop-blur-[1px] transition-all duration-300"
          onClick={onBackdropClick}
        />

        {/* Crisp minimalist spotlight boundary */}
        {isVisible && (
          <g className="pointer-events-none">
            {/* Soft subtle glow ring */}
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              rx={radius}
              ry={radius}
              fill="none"
              stroke="#2447c7"
              strokeWidth="2.5"
              strokeOpacity="0.3"
              filter="url(#tour-glow-filter)"
              style={{
                transition: "all 320ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
            {/* Crisp outline border */}
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              rx={radius}
              ry={radius}
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeOpacity="0.9"
              style={{
                transition: "all 320ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          </g>
        )}
      </svg>
    </div>
  );
});
