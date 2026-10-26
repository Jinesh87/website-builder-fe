import type { CSSProperties } from "react";
import {
  gridStyle,
  SectionHead,
  SectionShell,
  SiteButton,
  SiteIcon,
  SiteImage,
  SiteLink,
} from "../primitives.tsx";
import type { FeatureColor, FeatureItem, SectionOf } from "../types.ts";

/**
 * Modern 3D isometric mockup illustration used as default visual
 * for the split features showcase layout (matching Image 2).
 */
function FeatureMockupIllustration() {
  return (
    <div className="wb-feature-illustration-wrap" aria-hidden="true">
      <svg
        viewBox="0 0 460 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="wb-feature-illustration-svg"
      >
        <defs>
          <linearGradient id="gradBase" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#f1f5f9" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="gradOrange" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          <linearGradient id="gradGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
          <linearGradient id="gradCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="gradPurple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>
          <filter id="shadowBlur" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="16" stdDeviation="16" floodColor="#0f172a" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Ambient background glow */}
        <circle cx="200" cy="180" r="140" fill="#38bdf8" fillOpacity="0.07" filter="blur(28px)" />
        <circle cx="320" cy="120" r="100" fill="#a855f7" fillOpacity="0.05" filter="blur(24px)" />

        {/* Isometric base device / card surface */}
        <g filter="url(#shadowBlur)">
          <path
            d="M 190 85 L 400 170 L 230 290 L 20 205 Z"
            fill="url(#gradBase)"
            stroke="rgba(226, 232, 240, 0.8)"
            strokeWidth="1.5"
          />
          {/* Base bottom rim */}
          <path
            d="M 20 205 L 230 290 L 230 298 L 20 213 Z"
            fill="#cbd5e1"
          />
          <path
            d="M 230 290 L 400 170 L 400 178 L 230 298 Z"
            fill="#94a3b8"
          />
        </g>

        {/* Device screen home indicator circle & speaker */}
        <ellipse cx="65" cy="216" rx="6" ry="3.5" fill="#cbd5e1" />
        <ellipse cx="365" cy="125" rx="5" ry="2.5" fill="#cbd5e1" />

        {/* Isometric 3D Bar 1 (Orange) */}
        <g>
          {/* Wireframe top */}
          <path d="M 68 180 L 98 168 L 118 178 L 88 190 Z" fill="none" stroke="#fdba74" strokeWidth="1" />
          <path d="M 68 188 L 98 176 L 118 186 L 88 198 Z" fill="url(#gradOrange)" />
          <path d="M 68 188 L 88 198 L 88 214 L 68 204 Z" fill="#ea580c" />
          <path d="M 88 198 L 118 186 L 118 202 L 88 214 Z" fill="#c2410c" />
        </g>

        {/* Isometric 3D Bar 2 (Green) */}
        <g>
          <path d="M 108 148 L 138 136 L 158 146 L 128 158 Z" fill="none" stroke="#86efac" strokeWidth="1" />
          <path d="M 108 156 L 138 144 L 158 154 L 128 166 Z" fill="url(#gradGreen)" />
          <path d="M 108 156 L 128 166 L 128 200 L 108 190 Z" fill="#16a34a" />
          <path d="M 128 166 L 158 154 L 158 188 L 128 200 Z" fill="#15803d" />
        </g>

        {/* Isometric 3D Bar 3 (Cyan Tall) */}
        <g>
          <path d="M 148 100 L 178 88 L 198 98 L 168 110 Z" fill="none" stroke="#7dd3fc" strokeWidth="1" />
          <path d="M 148 108 L 178 96 L 198 106 L 168 118 Z" fill="url(#gradCyan)" />
          <path d="M 148 108 L 168 118 L 168 188 L 148 178 Z" fill="#0284c7" />
          <path d="M 168 118 L 198 106 L 198 176 L 168 188 Z" fill="#0369a1" />
        </g>

        {/* Isometric 2D Chart Elements on Base */}
        {/* Pie Chart */}
        <g transform="translate(150, 210)">
          <ellipse cx="12" cy="6" rx="22" ry="12" fill="#e2e8f0" />
          <path d="M 12 6 L 34 6 A 22 12 0 0 1 12 18 Z" fill="#38bdf8" />
          <path d="M 12 6 L 12 18 A 22 12 0 0 1 -10 6 Z" fill="#4ade80" />
          <path d="M 12 6 L -10 6 A 22 12 0 0 1 12 -6 Z" fill="#fb923c" />
        </g>

        {/* Wave sparklines */}
        <path
          d="M 160 178 Q 175 160 190 175 T 220 165"
          fill="none"
          stroke="#ec4899"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 170 192 Q 185 180 200 190 T 230 180"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 180 206 Q 195 198 210 205 T 240 195"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Floating Mini Badge Cards */}
        {/* Floating Code badge */}
        <g filter="url(#shadowBlur)">
          <rect x="235" y="220" width="36" height="32" rx="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
          <path d="M 246 232 L 242 236 L 246 240 M 260 232 L 264 236 L 260 240" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Floating Gear/Tools badge */}
        <g filter="url(#shadowBlur)">
          <rect x="278" y="200" width="36" height="32" rx="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
          <circle cx="296" cy="216" r="4" fill="none" stroke="#10b981" strokeWidth="2" />
          <path d="M 296 209 L 296 211 M 296 221 L 296 223 M 289 216 L 291 216 M 301 216 L 303 216" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

const DEFAULT_COLOR_PALETTE: FeatureColor[] = [
  "orange",
  "green",
  "yellow",
  "cyan",
  "blue",
  "purple",
  "pink",
  "indigo",
];

function getItemColor(item: FeatureItem, index: number): FeatureColor {
  if (item.iconColor && item.iconColor !== "default") {
    return item.iconColor as FeatureColor;
  }
  return DEFAULT_COLOR_PALETTE[index % DEFAULT_COLOR_PALETTE.length];
}

export default function FeaturesSection({ section }: { section: SectionOf<"features"> }) {
  const { data } = section;

  const isSplit = data.variant === "split";
  const isReversed = data.splitPosition === "right";
  const iconStyle = data.iconStyle ?? (data.variant === "pastel-icons" ? "pastel-circle" : isSplit ? "square-badge" : data.variant === "minimal" ? "minimal-accent" : "pastel-circle");
  const cardStyle = data.cardStyle ?? (data.variant === "cards" ? "surface" : data.variant === "minimal" || data.variant === "pastel-icons" ? "transparent" : "surface");
  const align = data.align ?? (isSplit ? "left" : "center");

  // Render a single feature item card
  const renderFeatureItem = (item: FeatureItem, index: number, isStacked = false) => {
    const isCustomHex = typeof item.iconColor === "string" && item.iconColor.startsWith("#");
    const itemColor = isCustomHex ? "blue" : getItemColor(item, index);
    const colorClass = isCustomHex ? "" : `wb-color-${itemColor}`;
    const itemAlign = isStacked ? "left" : align;

    const isDarkBg =
      item.backgroundColor &&
      (item.backgroundColor === "#0f172a" ||
        item.backgroundColor === "#020617" ||
        item.backgroundColor.toLowerCase().includes("0f172a") ||
        item.backgroundColor.toLowerCase().includes("#000") ||
        item.backgroundColor.toLowerCase().includes("black"));

    const cardCustomStyle = item.backgroundColor
      ? {
          backgroundColor: item.backgroundColor,
          background: item.backgroundColor,
          ...(isDarkBg
            ? {
                color: "#ffffff",
                borderColor: "rgba(255, 255, 255, 0.15)",
              }
            : {}),
        }
      : undefined;

    const activeIconBg = item.iconBackgroundColor || data.iconBackgroundColor;

    const iconCustomStyle: CSSProperties | undefined = activeIconBg
      ? {
          background: activeIconBg,
          backgroundColor: activeIconBg,
          color: isCustomHex ? (item.iconColor as string) : undefined,
          borderRadius:
            iconStyle === "pastel-circle" || iconStyle === "colored-circle"
              ? "9999px"
              : "16px",
          width: "56px",
          height: "56px",
          minWidth: "56px",
          minHeight: "56px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "16px",
          border:
            activeIconBg.startsWith("rgba") || activeIconBg === "transparent"
              ? "1px solid rgba(255, 255, 255, 0.15)"
              : undefined,
        }
      : isCustomHex
        ? iconStyle === "colored-circle"
          ? { background: item.iconColor, color: "#ffffff" }
          : iconStyle === "minimal-accent"
            ? { color: item.iconColor, background: "transparent" }
            : iconStyle === "square-badge"
              ? {
                  color: item.iconColor,
                  background: `color-mix(in srgb, ${item.iconColor} 12%, transparent)`,
                  borderColor: `color-mix(in srgb, ${item.iconColor} 26%, transparent)`,
                }
              : {
                  color: item.iconColor,
                  background: `color-mix(in srgb, ${item.iconColor} 15%, transparent)`,
                }
        : undefined;

    const badgeCustomStyle: CSSProperties | undefined = isCustomHex
      ? {
          color: item.iconColor,
          borderColor: `color-mix(in srgb, ${item.iconColor} 30%, transparent)`,
          background: `color-mix(in srgb, ${item.iconColor} 10%, transparent)`,
        }
      : undefined;

    return (
      <div
        key={index}
        className={`wb-feature-card ${isStacked ? "wb-feature-card-stacked" : "wb-feature-card-grid"} wb-feature-card-${cardStyle} wb-feature-align-${itemAlign} ${
          item.backgroundColor ? "wb-feature-card-has-custom-bg" : ""
        } ${isDarkBg ? "wb-feature-card-dark" : ""}`}
        style={cardCustomStyle}
      >
        {(item.icon || item.iconImage?.url) && iconStyle !== "none" && (
          <div
            className={`wb-feature-icon-wrap wb-icon-style-${iconStyle} ${colorClass}`}
            style={iconCustomStyle}
          >
            <SiteIcon name={item.icon} image={item.iconImage} />
          </div>
        )}

        <div className="wb-feature-content">
          <div className="wb-feature-header-row">
            <h3 className="wb-feature-title">{item.title}</h3>
            {item.badge && (
              <span
                className={`wb-feature-badge ${colorClass}`}
                style={badgeCustomStyle}
              >
                {item.badge}
              </span>
            )}
          </div>
          <p className="wb-feature-desc wb-muted">{item.description}</p>
          {item.link && (
            <SiteLink link={item.link} className="wb-feature-link">
              {item.link.label || "Learn more"} &rarr;
            </SiteLink>
          )}
        </div>
      </div>
    );
  };

  // Split Showcase Mode (matching Image 2)
  if (isSplit) {
    const heroContent = (
      <div className="wb-features-split-hero">
        {data.eyebrow && <span className="wb-eyebrow">{data.eyebrow}</span>}
        <h2 className="wb-features-split-title">{data.heading}</h2>
        {data.intro && <p className="wb-features-split-intro wb-muted">{data.intro}</p>}

        {/* Mockup visual or custom uploaded image */}
        <div className="wb-features-split-visual">
          {data.splitImage ? (
            <SiteImage image={data.splitImage} className="wb-features-split-img" />
          ) : (
            <FeatureMockupIllustration />
          )}
        </div>

        {/* Split CTA buttons */}
        {(data.splitCta || data.secondaryCta) && (
          <div className="wb-features-split-actions">
            {data.splitCta && <SiteButton link={data.splitCta} tone="primary" />}
            {data.secondaryCta && <SiteButton link={data.secondaryCta} tone="secondary" />}
          </div>
        )}
      </div>
    );

    const listContent = (
      <div className="wb-features-split-list">
        {data.items.map((item, index) => renderFeatureItem(item, index, true))}
      </div>
    );

    return (
      <SectionShell
        sectionId={section.id}
        settings={section.settings}
        className={`wb-features-section wb-features-variant-split ${isReversed ? "wb-features-split-reversed" : ""}`}
        label={data.heading}
      >
        <div className="wb-features-split-container">
          {isReversed ? (
            <>
              {listContent}
              {heroContent}
            </>
          ) : (
            <>
              {heroContent}
              {listContent}
            </>
          )}
        </div>
      </SectionShell>
    );
  }

  // Standard Grid Mode (matching Image 1 & Image 3)
  return (
    <SectionShell
      sectionId={section.id}
      settings={section.settings}
      className={`wb-features-section wb-features-variant-${data.variant ?? "grid"}`}
      label={data.heading}
    >
      <SectionHead heading={data.heading} intro={data.intro} eyebrow={data.eyebrow} />

      <div
        className={`wb-grid wb-features-grid wb-features-align-${align}`}
        style={gridStyle(data.columns, data.mobileColumns)}
      >
        {data.items.map((item, index) => renderFeatureItem(item, index, false))}
      </div>

      {/* Optional bottom centered / left link or CTA button (Image 1 "Learn more >") */}
      {data.bottomCta && (
        <div className={`wb-features-bottom-cta wb-align-${align}`}>
          <SiteLink link={data.bottomCta} className="wb-features-bottom-link">
            {data.bottomCta.label || "Learn more"} &gt;
          </SiteLink>
        </div>
      )}
    </SectionShell>
  );
}
