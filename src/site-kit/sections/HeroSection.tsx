import { useState, type CSSProperties, type ReactNode } from "react";
import { BottomShapeDivider, parseRichText, PlayIcon, SectionShell, SiteButton, SiteImage, SiteLink } from "../primitives.tsx";
import type { HeroData, SectionOf } from "../types.ts";
import CurvedBannerCarousel, {
  DEFAULT_BANNER_ITEMS,
  type CurvedBannerItem,
} from "../../components/common/CurvedBannerCarousel.tsx";

function getEmbedUrl(url?: string, isBackground = false): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  try {
    if (trimmed.includes("youtube.com") || trimmed.includes("youtu.be")) {
      let videoId = "";
      if (trimmed.includes("youtu.be/")) {
        videoId = trimmed.split("youtu.be/")[1]?.split("?")[0] ?? "";
      } else if (trimmed.includes("watch?v=")) {
        videoId = new URL(trimmed).searchParams.get("v") ?? "";
      } else if (trimmed.includes("/embed/")) {
        const afterEmbed = trimmed.split("/embed/")[1] ?? "";
        videoId = afterEmbed.split("?")[0] ?? "";
      }
      if (videoId) {
        if (isBackground) {
          return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&disablekb=1`;
        }
        return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
      }
    }
    if (trimmed.includes("vimeo.com")) {
      const match = trimmed.match(/vimeo\.com\/(\d+)/);
      if (match && match[1]) {
        if (isBackground) {
          return `https://player.vimeo.com/video/${match[1]}?autoplay=1&muted=1&loop=1&autopause=0&controls=0&background=1`;
        }
        return `https://player.vimeo.com/video/${match[1]}?autoplay=1`;
      }
    }
  } catch {
    return null;
  }
  return null;
}

function HeroVideoPlayer({
  videoUrl,
  posterUrl,
  autoplay = false,
  controls = true,
  loop = false,
  onPlayClick,
}: {
  videoUrl: string;
  posterUrl?: string;
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
  onPlayClick?: () => void;
}) {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const embedUrl = getEmbedUrl(videoUrl);

  if (embedUrl) {
    if (!isPlaying && posterUrl) {
      return (
        <div className="wb-hero-video-poster-wrap" onClick={() => setIsPlaying(true)} data-wb-video={embedUrl}>
          <img src={posterUrl} alt="Video thumbnail" className="wb-hero-video-poster" />
          <button
            type="button"
            className="wb-hero-video-play-btn"
            aria-label="Play video demo"
            onClick={() => {
              setIsPlaying(true);
              onPlayClick?.();
            }}
          >
            <PlayIcon />
          </button>
        </div>
      );
    }
    return (
      <div className="wb-hero-video-iframe-wrap">
        <iframe
          src={embedUrl}
          title="Hero Video Demo"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="wb-hero-video-iframe"
        />
      </div>
    );
  }

  return (
    <div className="wb-hero-video-wrap">
      <video
        src={videoUrl}
        poster={posterUrl}
        controls={controls}
        autoPlay={autoplay}
        muted={autoplay}
        loop={loop}
        playsInline
        className="wb-hero-video-element"
      />
    </div>
  );
}

/** `gradient`: the section has its own gradient colors, shown on the whole heading when no words are highlighted. */
function renderHighlightedHeading(heading: string, highlight: string | undefined, gradient: boolean): ReactNode {
  if (!highlight || !heading.includes(highlight)) {
    return gradient ? (
      <h1>
        <span className="wb-text-gradient">{parseRichText(heading)}</span>
      </h1>
    ) : (
      <h1>{parseRichText(heading)}</h1>
    );
  }
  const parts = heading.split(highlight);
  return (
    <h1>
      {parseRichText(parts[0])}
      <span className="wb-text-gradient">{parseRichText(highlight)}</span>
      {parseRichText(parts.slice(1).join(highlight))}
    </h1>
  );
}

function HeroMockupPlaceholder() {
  return (
    <div className="wb-hero-mockup-placeholder">
      <div className="wb-placeholder-glow" />
      <div className="wb-placeholder-card-header">
        <div className="wb-placeholder-avatar" />
        <div className="wb-placeholder-bars">
          <div className="wb-placeholder-bar-title" />
          <div className="wb-placeholder-bar-sub" />
        </div>
      </div>
      <div className="wb-placeholder-chart">
        <div className="wb-chart-bar" style={{ height: "35%" }} />
        <div className="wb-chart-bar" style={{ height: "60%" }} />
        <div className="wb-chart-bar" style={{ height: "45%" }} />
        <div className="wb-chart-bar" style={{ height: "80%" }} />
        <div className="wb-chart-bar" style={{ height: "100%" }} />
        <div className="wb-chart-bar" style={{ height: "70%" }} />
      </div>
    </div>
  );
}

function TrustedByStrip({ trustedBy }: { trustedBy?: HeroData["trustedBy"] }) {
  if (!trustedBy || (!trustedBy.logos?.length && !trustedBy.label)) return null;
  return (
    <div className="wb-hero-trusted-by">
      {trustedBy.label && <div className="wb-trusted-label">{trustedBy.label}</div>}
      {trustedBy.logos && trustedBy.logos.length > 0 && (
        <div className="wb-trusted-logos">
          {trustedBy.logos.map((logo, i) => (
            <span key={i} className="wb-trusted-logo-item">
              {logo.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HeroSection({ section }: { section: SectionOf<"hero"> }) {
  const { data } = section;

  const minHeightClass =
    data.minHeight === "screen"
      ? "wb-hero-min-screen"
      : data.minHeight === "tall"
        ? "wb-hero-min-tall"
        : data.minHeight === "compact"
          ? "wb-hero-min-compact"
          : "";

  const allButtons = data.buttons?.length
    ? data.buttons
    : [data.primaryCta, data.secondaryCta].filter(Boolean);

  const actions = (allButtons.length > 0 || data.tertiaryCta) && (
    <div className="wb-hero-actions">
      {allButtons.map((btn, idx) =>
        btn ? (
          <SiteButton
            key={`${btn.label}-${btn.href}-${idx}`}
            link={btn}
            tone={idx === 0 ? "primary" : "secondary"}
          />
        ) : null
      )}
      {data.tertiaryCta && (
        <SiteLink link={data.tertiaryCta} className="wb-btn-video-play">
          <span className="wb-play-icon-pill">
            <PlayIcon />
          </span>
          <span>{data.tertiaryCta.label}</span>
        </SiteLink>
      )}
    </div>
  );

  if (data.variant === "curved-carousel") {
    const carouselSpeed = data.carouselSpeed ?? 45;
    const carouselDirection = data.carouselDirection ?? "left-to-right";
    const curveIntensity = data.curveIntensity ?? "medium";

    const customCarouselItems: CurvedBannerItem[] =
      data.carouselSlides && data.carouselSlides.length > 0
        ? data.carouselSlides.map((slide, idx) => ({
            id: `hero-card-${idx}`,
            title: slide.title || `Card ${idx + 1}`,
            subtitle: slide.description || "",
            badge: slide.badge || "",
            image:
              slide.image?.url ||
              DEFAULT_BANNER_ITEMS[idx % DEFAULT_BANNER_ITEMS.length].image,
            author: slide.subtitle || "",
            alt: slide.image?.alt || slide.title || "Reel card",
          }))
        : DEFAULT_BANNER_ITEMS;

    return (
      <SectionShell
        sectionId={section.id}
        settings={section.settings}
        className={`wb-hero wb-hero-curved-carousel ${minHeightClass}`}
        label="Hero"
        fullWidth={true}
      >
        <div className="wb-hero-curved-wrapper">
          <div className="wb-hero-curved-copy">
            {/* Eyebrow / Pill Badge */}
            {(data.eyebrow || data.badgeIcon) && (
              <div className="wb-hero-curved-badge-wrap">
                <span className="wb-hero-curved-badge">
                  {data.badgeIcon && <span>{data.badgeIcon}</span>}
                  {data.eyebrow && <span>{data.eyebrow}</span>}
                </span>
              </div>
            )}

            {/* Centered Heading */}
            {data.heading && (
              <div className="wb-hero-curved-title">
                {renderHighlightedHeading(
                  data.heading,
                  data.highlightText,
                  Boolean(section.settings.customColors?.gradientFrom || section.settings.customColors?.gradientTo),
                )}
              </div>
            )}

            {/* Centered Subheading */}
            {data.subheading && (
              <p className="wb-hero-curved-sub">
                {parseRichText(data.subheading)}
              </p>
            )}
          </div>

          {/* 3D Curved Continuous Looping Video Banner Carousel */}
          <div className="wb-hero-curved-carousel-track">
            <CurvedBannerCarousel
              items={customCarouselItems}
              speed={carouselSpeed}
              direction={carouselDirection}
              curveIntensity={curveIntensity}
              cardWidth={240}
              cardHeight={350}
              gap={22}
              pauseOnHover={true}
              interactive={true}
            />
          </div>

          {/* Action CTAs */}
          {allButtons.length > 0 && (
            <div className="wb-hero-curved-actions">
              {allButtons.map((btn, idx) =>
                btn ? (
                  <SiteButton
                    key={`${btn.label}-${btn.href}-${idx}`}
                    link={btn}
                    tone={idx === 0 ? "primary" : "secondary"}
                  />
                ) : null
              )}
            </div>
          )}
        </div>
        <BottomShapeDivider shape={data.bottomShape} />
      </SectionShell>
    );
  }

  const copy = (
    <div className="wb-hero-copy">
      {(data.eyebrow || data.badgeIcon) && (
        <div className="wb-hero-badge">
          {data.badgeIcon && <span>{data.badgeIcon}</span>}
          {data.eyebrow && <span>{data.eyebrow}</span>}
        </div>
      )}

      {data.heading
        ? renderHighlightedHeading(
            data.heading,
            data.highlightText,
            Boolean(section.settings.customColors?.gradientFrom || section.settings.customColors?.gradientTo),
          )
        : null}

      {data.subheading && <p className="wb-hero-sub wb-muted">{parseRichText(data.subheading)}</p>}
      {data.description && <p className="wb-hero-desc wb-muted">{parseRichText(data.description)}</p>}

      {actions}

      <TrustedByStrip trustedBy={data.trustedBy} />
    </div>
  );

  const isBgMediaMode =
    data.imagePosition === "background" ||
    data.variant === "background-image" ||
    data.variant === "video-bg";

  const bgImage =
    data.backgroundImage ||
    (isBgMediaMode && data.image ? data.image : undefined);

  const bgVideoUrl =
    data.backgroundVideoUrl ||
    (isBgMediaMode && data.videoUrl
      ? data.videoUrl
      : data.variant === "video-bg"
        ? data.videoUrl
        : undefined);

  const hasBgMedia = Boolean(bgImage?.url || bgVideoUrl);

  const bgEmbedUrl = getEmbedUrl(bgVideoUrl, true);

  const hasForegroundVideo =
    Boolean(data.videoUrl) &&
    !isBgMediaMode &&
    (data.mediaType === "video" || data.mediaType === "both" || !data.image);

  const hasForegroundImage =
    Boolean(data.image) && !isBgMediaMode && data.mediaType !== "video";

  const hasAnyMedia =
    hasForegroundVideo ||
    hasForegroundImage ||
    data.variant === "split" ||
    data.variant === "split-left" ||
    data.variant === "asymmetric";

  const mediaContent = hasAnyMedia && (
    <div
      className={`wb-hero-media ${data.imageStyle === "mockup" ? "wb-hero-media-mockup" : ""} ${
        data.imageStyle === "glow" ? "wb-hero-media-glow" : ""
      }`}
    >
      {data.imageStyle === "mockup" && (
        <div className="wb-mockup-header">
          <span className="wb-mockup-dot wb-mockup-dot-red" />
          <span className="wb-mockup-dot wb-mockup-dot-yellow" />
          <span className="wb-mockup-dot wb-mockup-dot-green" />
        </div>
      )}
      <div className="wb-floating-card-wrap">
        {data.videoUrl ? (
          <HeroVideoPlayer
            videoUrl={data.videoUrl}
            posterUrl={data.image?.url}
            autoplay={data.videoAutoplay}
            controls={data.videoControls ?? true}
            loop={data.videoLoop}
          />
        ) : data.image ? (
          <SiteImage image={data.image} />
        ) : (
          <HeroMockupPlaceholder />
        )}
      </div>
    </div>
  );

  const isLeft =
    data.variant === "split-left" || data.imagePosition === "left";

  const isSplit =
    data.variant === "split" ||
    data.variant === "split-left" ||
    data.imagePosition === "left" ||
    data.imagePosition === "right" ||
    data.variant === "asymmetric";

  const bgPosClass = data.bgImagePosition
    ? `wb-bg-pos-${data.bgImagePosition}`
    : "wb-bg-pos-cover";

  const overlayType = data.bgOverlayType ?? "dark";

  const overlayStyle: CSSProperties = {
    opacity: (data.overlayOpacity ?? 50) / 100,
    backdropFilter: data.overlayBlur ? "blur(8px)" : undefined,
    WebkitBackdropFilter: data.overlayBlur ? "blur(8px)" : undefined,
  };

  const isDarkOverlay =
    (hasBgMedia && (overlayType === "dark" || (overlayType as string) === "default")) ||
    data.variant === "background-image" ||
    data.variant === "video-bg" ||
    (isBgMediaMode && Boolean(bgVideoUrl || bgImage));

  const isSoftCard = data.variant === "soft-card";

  return (
    <SectionShell
      sectionId={section.id}
      settings={section.settings}
      className={`wb-hero wb-hero-${data.variant} ${
        isLeft ? "wb-hero-split-left" : ""
      } ${minHeightClass} ${
        hasBgMedia ? "wb-hero-has-bg-media" : ""
      } ${isDarkOverlay ? "wb-hero-dark-overlay" : ""}`}
      label="Hero"
    >
      {/* Full Background Image / Video media layer */}
      {hasBgMedia && (
        <>
          <div className={`wb-hero-bg-media ${bgPosClass}`}>
            {bgEmbedUrl ? (
              <div className="wb-hero-bg-iframe-container">
                <iframe
                  src={bgEmbedUrl}
                  title="Hero Background Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  className="wb-hero-bg-iframe"
                />
              </div>
            ) : bgVideoUrl ? (
              <video autoPlay loop muted playsInline src={bgVideoUrl} />
            ) : bgImage?.url ? (
              <img
                src={bgImage.url}
                alt={bgImage.alt ?? "Hero background"}
                loading="eager"
              />
            ) : null}
          </div>
          {overlayType !== "none" && (
            <div
              className={`wb-hero-overlay wb-overlay-${overlayType}`}
              style={overlayType !== "gradient" ? overlayStyle : undefined}
            />
          )}
        </>
      )}

      {/* Main Content Layout */}
      {isSoftCard ? (
        <div className="wb-hero-card-container">
          <div className="wb-hero-grid">
            {copy}
            {mediaContent}
          </div>
        </div>
      ) : isSplit ? (
        <div className="wb-hero-grid">
          {copy}
          {mediaContent}
        </div>
      ) : (
        <>
          {copy}
          {mediaContent}
        </>
      )}

      {/* Optional Wave/Curved SVG Shape Divider */}
      <BottomShapeDivider shape={data.bottomShape} />
    </SectionShell>
  );
}
