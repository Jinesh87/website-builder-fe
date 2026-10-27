import {
  useState,
  useRef,
  useEffect,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  BottomShapeDivider,
  parseRichText,
  PlayIcon,
  SectionShell,
  SiteButton,
  SiteIcon,
  SiteImage,
  SiteLink,
} from "../primitives.tsx";
import {
  getAmbientGradient,
  getCuratedFallbackImage,
  normalizeImageUrl,
} from "../image-utils.ts";
import {
  alignAttr,
  heroBaseAlign,
  heroButtonShapeProps,
  heroElementAlign,
} from "../hero-layout.ts";
import type { HeroAlign, HeroAlignElement, HeroData, LinkRef, SectionOf } from "../types.ts";
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
        <div
          className="wb-hero-video-poster-wrap"
          onClick={() => setIsPlaying(true)}
          data-wb-video={embedUrl}
        >
          <img
            src={posterUrl}
            alt="Video thumbnail"
            className="wb-hero-video-poster"
          />
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

const DEFAULT_CAMPAIGN_VIDEO = "/bannervid.mp4";

export function normalizeVideoSrc(src?: string): string {
  if (!src) return DEFAULT_CAMPAIGN_VIDEO;
  const trimmed = src.trim();
  if (
    trimmed === "/banner-vid.mp4" ||
    trimmed === "banner-vid.mp4" ||
    trimmed === "/bannervid.mp4" ||
    trimmed === "bannervid.mp4"
  ) {
    return DEFAULT_CAMPAIGN_VIDEO;
  }
  return trimmed.startsWith("http") || trimmed.startsWith("/") || trimmed.startsWith("blob:")
    ? trimmed
    : `/${trimmed}`;
}

function CampaignVideoPlayer({
  src,
  poster,
}: {
  src: string;
  poster?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loadError, setLoadError] = useState(false);

  const resolvedSrc = normalizeVideoSrc(src);
  const activeSrc = loadError ? DEFAULT_CAMPAIGN_VIDEO : resolvedSrc;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Enforce DOM properties required by browser autoplay policies
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const playVideo = () => {
      const promise = video.play();
      if (promise !== undefined) {
        promise.catch(() => {
          // If browser policy blocked unprompted autoplay, play on very first user interaction
          const handleGesture = () => {
            if (videoRef.current) {
              videoRef.current.play().catch(() => {});
            }
            window.removeEventListener("click", handleGesture);
            window.removeEventListener("touchstart", handleGesture);
            window.removeEventListener("keydown", handleGesture);
          };
          window.addEventListener("click", handleGesture, { once: true });
          window.addEventListener("touchstart", handleGesture, { once: true });
          window.addEventListener("keydown", handleGesture, { once: true });
        });
      }
    };

    if (video.readyState >= 2) {
      playVideo();
    } else {
      video.addEventListener("loadedmetadata", playVideo, { once: true });
      video.addEventListener("canplay", playVideo, { once: true });
    }
  }, [activeSrc]);

  return (
    <video
      ref={videoRef}
      src={activeSrc}
      poster={poster}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      className="wb-campaign-video"
      onError={() => {
        if (!loadError) setLoadError(true);
      }}
    />
  );
}

/** `gradient`: the section has its own gradient colors, shown on the whole heading when no words are highlighted. */
function renderHighlightedHeading(
  heading: string,
  highlight: string | undefined,
  gradient: boolean,
  align?: HeroAlign,
): ReactNode {
  if (!highlight || !heading.includes(highlight)) {
    return gradient ? (
      <h1 {...alignAttr(align)}>
        <span className="wb-text-gradient">{parseRichText(heading)}</span>
      </h1>
    ) : (
      <h1 {...alignAttr(align)}>{parseRichText(heading)}</h1>
    );
  }
  const parts = heading.split(highlight);
  return (
    <h1 {...alignAttr(align)}>
      {parseRichText(parts[0])}
      <span className="wb-text-gradient">{parseRichText(highlight)}</span>
      {parseRichText(parts.slice(1).join(highlight))}
    </h1>
  );
}

function HeroBackgroundMedia({
  bgImage,
  bgVideoUrl,
  bgEmbedUrl,
  bgPosClass,
  contextDescription,
}: {
  bgImage?: { url: string; alt?: string };
  bgVideoUrl?: string;
  bgEmbedUrl?: string | null;
  bgPosClass: string;
  contextDescription: string;
}) {
  const initialUrl = bgImage?.url
    ? normalizeImageUrl(bgImage.url, contextDescription)
    : "";
  const [imgSrc, setImgSrc] = useState(initialUrl);
  const [loadState, setLoadState] = useState<"loading" | "loaded" | "fallback" | "failed">("loading");

  useEffect(() => {
    if (bgImage?.url) {
      setImgSrc(normalizeImageUrl(bgImage.url, contextDescription));
      setLoadState("loading");
    }
  }, [bgImage?.url, contextDescription]);

  const handleImageError = () => {
    const fallback = getCuratedFallbackImage(contextDescription);
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
      setLoadState("fallback");
    } else {
      setLoadState("failed");
    }
  };

  const ambientGradient = getAmbientGradient(contextDescription);

  return (
    <div
      className={`wb-hero-bg-media ${bgPosClass}`}
      style={{
        background: ambientGradient,
      }}
    >
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
      ) : imgSrc && loadState !== "failed" ? (
        <img
          src={imgSrc}
          alt={bgImage?.alt ?? "Hero background"}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          onLoad={() => setLoadState("loaded")}
          onError={handleImageError}
          style={{
            opacity: loadState === "loaded" ? 1 : 0.85,
            transition: "opacity 0.4s ease-out",
          }}
        />
      ) : null}
    </div>
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

function TrustedByStrip({
  trustedBy,
  align,
}: {
  trustedBy?: HeroData["trustedBy"];
  align?: HeroAlign;
}) {
  if (!trustedBy || (!trustedBy.logos?.length && !trustedBy.label)) return null;
  return (
    <div className="wb-hero-trusted-by" {...alignAttr(align)}>
      {trustedBy.label && (
        <div className="wb-trusted-label">{trustedBy.label}</div>
      )}
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

export default function HeroSection({
  section,
}: {
  section: SectionOf<"hero">;
}) {
  const { data } = section;

  const baseAlign = heroBaseAlign(data, section.settings);
  const alignOf = (element: HeroAlignElement) =>
    heroElementAlign(data, element, baseAlign);
  const buttonShape = heroButtonShapeProps(data);

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
    <div className="wb-hero-actions" {...alignAttr(alignOf("actions"))}>
      {allButtons.map((btn, idx) =>
        btn ? (
          <SiteButton
            key={`${btn.label}-${btn.href}-${idx}`}
            link={btn}
            tone={idx === 0 ? "primary" : "secondary"}
          />
        ) : null,
      )}
      {data.tertiaryCta && (() => {
        const isExplicitLink = data.tertiaryCta.actionType === "link";
        const isExplicitDownload = data.tertiaryCta.actionType === "download";
        const defaultVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
        const resolvedLink: LinkRef = isExplicitLink || isExplicitDownload
          ? data.tertiaryCta
          : {
              ...data.tertiaryCta,
              actionType: "video",
              videoUrl: data.tertiaryCta.videoUrl || (data.tertiaryCta.href && data.tertiaryCta.href !== "#demo" && data.tertiaryCta.href !== "#" ? data.tertiaryCta.href : defaultVideoUrl),
            };
        return (
          <SiteLink link={resolvedLink} className="wb-btn-video-play" />
        );
      })()}
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
              (slide.image?.url && normalizeImageUrl(slide.image.url)) ||
              DEFAULT_BANNER_ITEMS[idx % DEFAULT_BANNER_ITEMS.length].image,
            author: slide.subtitle || "",
            alt: slide.image?.alt || slide.title || "Reel card",
          }))
        : DEFAULT_BANNER_ITEMS;

    return (
      <SectionShell
        sectionId={section.id}
        settings={section.settings}
        className={`wb-hero wb-hero-curved-carousel ${minHeightClass} ${buttonShape.className}`}
        style={buttonShape.style}
        label="Hero"
        fullWidth={true}
      >
        <div className="wb-hero-curved-wrapper">
          <div className="wb-hero-curved-copy">
            {/* Eyebrow / Pill Badge */}
            {(data.eyebrow || data.badgeIcon) && (
              <div className="wb-hero-curved-badge-wrap">
                <span
                  className="wb-hero-curved-badge"
                  {...alignAttr(alignOf("badge"))}
                >
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
                  Boolean(
                    section.settings.customColors?.gradientFrom ||
                    section.settings.customColors?.gradientTo,
                  ),
                  alignOf("heading"),
                )}
              </div>
            )}

            {/* Centered Subheading */}
            {data.subheading && (
              <p
                className="wb-hero-curved-sub"
                {...alignAttr(alignOf("subheading"))}
              >
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
            <div
              className="wb-hero-curved-actions"
              {...alignAttr(alignOf("actions"))}
            >
              {allButtons.map((btn, idx) =>
                btn ? (
                  <SiteButton
                    key={`${btn.label}-${btn.href}-${idx}`}
                    link={btn}
                    tone={idx === 0 ? "primary" : "secondary"}
                  />
                ) : null,
              )}
            </div>
          )}
        </div>
        <BottomShapeDivider shape={data.bottomShape} />
      </SectionShell>
    );
  }

  if (data.variant === "campaign-banner") {
    const campaignContext = `${data.heading ?? ""} ${data.subheading ?? ""}`;
    const bgImage = data.backgroundImage || data.image;
    const defaultPoster = getCuratedFallbackImage(campaignContext);

    const rawVideo = data.backgroundVideoUrl || data.videoUrl;
    const isPlaceholderOrExternal =
      !rawVideo ||
      rawVideo.includes("commondatastorage") ||
      rawVideo.includes("mixkit.co") ||
      rawVideo.includes("example.com");

    const bgVideoUrl = isPlaceholderOrExternal
      ? DEFAULT_CAMPAIGN_VIDEO
      : normalizeVideoSrc(rawVideo);

    const bgEmbedUrl =
      data.videoUrl && !data.videoUrl.match(/\.(mp4|webm|ogg)/i)
        ? getEmbedUrl(data.videoUrl, true) || undefined
        : undefined;
    const posterUrl =
      (bgImage?.url && normalizeImageUrl(bgImage.url, campaignContext)) ||
      defaultPoster;

    // Resolve bottom shape divider: handles both bannerBottomShape and bottomShape
    const rawShape =
      (data.bottomShape && data.bottomShape !== "none"
        ? data.bottomShape
        : undefined) ??
      (data.bannerBottomShape && data.bannerBottomShape !== "normal"
        ? data.bannerBottomShape
        : undefined) ??
      data.bottomShape ??
      data.bannerBottomShape ??
      "curved";

    const bottomShape =
      rawShape === "curve"
        ? "curved"
        : rawShape === "normal"
          ? "none"
          : rawShape;

    // Remove unwanted cyan blue (#70c4d4); blend seamlessly with page white/background
    const bottomColor =
      data.bottomDividerColor && data.bottomDividerColor !== "#70c4d4"
        ? data.bottomDividerColor
        : "var(--wb-bg, #ffffff)";

    const curveDepth =
      typeof data.bannerCurveDepth === "number" ? data.bannerCurveDepth : 80;

    const contentAlign = baseAlign ?? "left";
    const overrideOf = (element: HeroAlignElement) =>
      heroElementAlign(data, element, undefined);

    // Sanitize legacy "Swim in Pink" and "Donate" texts for clean dummy presentation
    const headingText =
      !data.heading || data.heading.toLowerCase().includes("swim in pink")
        ? "Empower Your Next Breakthrough 2026"
        : data.heading;

    const subheadingText =
      !data.subheading ||
      data.subheading.toLowerCase().includes("making waves") ||
      data.subheading.toLowerCase().includes("vital research")
        ? "Join over 25,000 innovators, creators, and teams scaling high-impact digital experiences worldwide."
        : data.subheading;

    const rawStats =
      data.campaignStats && data.campaignStats.length > 0
        ? data.campaignStats
        : [
            { label: "Active Members", value: "12,450", icon: "users" },
            { label: "Milestones Hit", value: "320+", icon: "pin" },
          ];

    const stats = rawStats.map((stat) => ({
      ...stat,
      label:
        stat.label?.toLowerCase() === "swimmers"
          ? "Active Members"
          : stat.label?.toLowerCase() === "swims"
            ? "Milestones Hit"
            : stat.label,
      icon: stat.icon === "swimmer" ? "users" : stat.icon || "users",
    }));

    const rawProgress = data.campaignProgress ?? {
      currency: "$",
      raisedAmount: "285,000",
      targetAmount: "300,000",
      raisedLabel: "funded",
      targetLabel: "of $300,000 milestone",
      percentage: 95,
      donateButton: { label: "Explore Platform", href: "#explore" },
      registerButton: { label: "Get Started Free →", href: "#start" },
    };

    const progress = {
      ...rawProgress,
      currency: rawProgress.currency ?? "$",
      raisedAmount: rawProgress.raisedAmount ?? "285,000",
      targetAmount: rawProgress.targetAmount ?? "300,000",
      raisedLabel:
        rawProgress.raisedLabel?.toLowerCase() === "raised"
          ? "funded"
          : (rawProgress.raisedLabel ?? "funded"),
      targetLabel: rawProgress.targetLabel?.toLowerCase().includes("target")
        ? "of $300,000 milestone"
        : (rawProgress.targetLabel ?? "of $300,000 milestone"),
      donateButton: rawProgress.donateButton?.label
        ?.toLowerCase()
        .includes("donate")
        ? { ...rawProgress.donateButton, label: "Explore Platform" }
        : (rawProgress.donateButton ?? {
            label: "Explore Platform",
            href: "#explore",
          }),
      registerButton: rawProgress.registerButton?.label
        ?.toLowerCase()
        .includes("register")
        ? { ...rawProgress.registerButton, label: "Get Started Free →" }
        : (rawProgress.registerButton ?? {
            label: "Get Started Free →",
            href: "#start",
          }),
    };

    const primaryAction =
      data.primaryCta ??
      data.buttons?.[0] ??
      (progress.registerButton
        ? {
            label: progress.registerButton.label
              ?.toLowerCase()
              .includes("register")
              ? "Get Started Free →"
              : progress.registerButton.label,
            href: progress.registerButton.href ?? "#start",
          }
        : { label: "Get Started Free →", href: "#start" });

    const secondaryAction =
      data.secondaryCta ??
      data.buttons?.[1] ??
      (progress.donateButton
        ? {
            label: progress.donateButton.label?.toLowerCase().includes("donate")
              ? "Explore Platform"
              : progress.donateButton.label,
            href: progress.donateButton.href ?? "#explore",
          }
        : { label: "Explore Platform", href: "#explore" });

    const percentage =
      typeof progress.percentage === "number"
        ? progress.percentage
        : typeof progress.raisedAmount === "number" &&
            typeof progress.targetAmount === "number" &&
            progress.targetAmount > 0
          ? Math.min(
              100,
              Math.round((progress.raisedAmount / progress.targetAmount) * 100),
            )
          : 93;

    return (
      <SectionShell
        sectionId={section.id}
        settings={section.settings}
        className={`wb-hero wb-hero-campaign-banner ${minHeightClass} ${buttonShape.className}`}
        style={buttonShape.style}
        label="Hero"
        fullWidth={true}
      >
        <div className="wb-campaign-banner-container">
          {/* Background Video / Image Layer */}
          <div className="wb-campaign-media-layer">
            {/* High-res fallback image always mounted so background is never blank */}
            <img
              src={posterUrl}
              alt={bgImage?.alt ?? "Campaign Hero Background"}
              className="wb-campaign-bg-img"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              onError={(e) => {
                const target = e.currentTarget;
                const fallback = getCuratedFallbackImage(campaignContext);
                if (target.src !== fallback) {
                  target.src = fallback;
                }
              }}
            />

            {bgEmbedUrl ? (
              <div className="wb-hero-bg-iframe-container">
                <iframe
                  src={bgEmbedUrl}
                  title="Campaign Background Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  className="wb-hero-bg-iframe"
                />
              </div>
            ) : (
              <CampaignVideoPlayer src={bgVideoUrl} poster={posterUrl} />
            )}

            {/* Gradient / Overlay Layer */}
            {data.bgOverlayType !== "none" && (
              <div
                className={`wb-campaign-overlay wb-overlay-${data.bgOverlayType ?? "dark"}`}
                style={{
                  opacity: (data.overlayOpacity ?? 25) / 100,
                  backdropFilter: data.overlayBlur ? "blur(4px)" : undefined,
                  WebkitBackdropFilter: data.overlayBlur
                    ? "blur(4px)"
                    : undefined,
                }}
              />
            )}
          </div>

          {/* Headline, Subheading & Simple CTA Buttons Row */}
          {(headingText ||
            subheadingText ||
            data.eyebrow ||
            primaryAction ||
            secondaryAction) && (
            <div className={`wb-campaign-copy-wrap wb-align-${contentAlign}`}>
              {data.eyebrow && (
                <span
                  className="wb-campaign-eyebrow"
                  {...alignAttr(overrideOf("badge"))}
                >
                  {data.eyebrow}
                </span>
              )}
              {headingText && (
                <div
                  className="wb-campaign-heading"
                  {...alignAttr(overrideOf("heading"))}
                >
                  {renderHighlightedHeading(
                    headingText,
                    data.highlightText,
                    Boolean(
                      section.settings.customColors?.gradientFrom ||
                      section.settings.customColors?.gradientTo,
                    ),
                  )}
                </div>
              )}
              {subheadingText && (
                <p
                  className="wb-campaign-subheading"
                  {...alignAttr(overrideOf("subheading"))}
                >
                  {parseRichText(subheadingText)}
                </p>
              )}

              {/* Simple CTA Buttons Design (Replaces bulky cards with clean modern hero buttons) */}
              {(primaryAction || secondaryAction) && (
                <div
                  className={`wb-campaign-actions wb-align-${contentAlign}`}
                  {...alignAttr(overrideOf("actions"))}
                >
                  {primaryAction && (
                    <SiteLink
                      link={primaryAction}
                      className="wb-campaign-btn-primary"
                    >
                      <span>{primaryAction.label}</span>
                    </SiteLink>
                  )}
                  {secondaryAction && (
                    <SiteLink
                      link={secondaryAction}
                      className="wb-campaign-btn-secondary"
                    >
                      <span>{secondaryAction.label}</span>
                    </SiteLink>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Optional Floating Cards Row (Hidden by default; simple buttons design used instead) */}
          {data.showCampaignCards && (
            <div className="wb-campaign-cards-row">
              {/* Card 1: Stats Widget */}
              <div className="wb-campaign-stat-card">
                {stats.map((stat, idx) => (
                  <div key={idx} className="wb-campaign-stat-col">
                    <div className="wb-campaign-stat-icon-wrap">
                      {stat.icon === "users" ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="wb-campaign-stat-svg"
                        >
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      ) : stat.icon === "pin" ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="wb-campaign-stat-svg"
                        >
                          <path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
                        </svg>
                      ) : stat.icon === "award" || stat.icon === "star" ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="wb-campaign-stat-svg"
                        >
                          <circle cx="12" cy="8" r="7" />
                          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                        </svg>
                      ) : (
                        <span className="wb-campaign-stat-custom-icon">
                          {stat.icon || "👥"}
                        </span>
                      )}
                    </div>
                    <div className="wb-campaign-stat-info">
                      <span className="wb-campaign-stat-label">
                        {stat.label}
                      </span>
                      <span className="wb-campaign-stat-value">
                        {stat.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Card 2: Campaign Target / Raised Widget */}
              <div className="wb-campaign-progress-card">
                <div className="wb-campaign-progress-header">
                  <div className="wb-campaign-raised-amount">
                    <span className="wb-campaign-currency">
                      {progress.currency ?? "€"}
                    </span>
                    <span className="wb-campaign-raised-val">
                      {progress.raisedAmount ?? "279,585"}
                    </span>
                    <span className="wb-campaign-raised-label">
                      {progress.raisedLabel ?? "raised"}
                    </span>
                  </div>
                  <div className="wb-campaign-target-val">
                    {progress.targetLabel ??
                      `of ${progress.currency ?? "€"}${progress.targetAmount ?? "300,000"} target`}
                  </div>
                </div>

                {/* Animated Progress Bar */}
                <div className="wb-campaign-progress-track">
                  <div
                    className="wb-campaign-progress-fill"
                    style={{
                      width: `${Math.min(100, Math.max(4, percentage))}%`,
                    }}
                  />
                </div>

                {/* Action Buttons Row */}
                <div className="wb-campaign-progress-actions">
                  {progress.donateButton && (
                    <SiteLink
                      link={progress.donateButton}
                      className="wb-campaign-btn-donate"
                    >
                      <span>{progress.donateButton.label}</span>
                    </SiteLink>
                  )}
                  {progress.registerButton && (
                    <SiteLink
                      link={progress.registerButton}
                      className="wb-campaign-btn-register"
                    >
                      <span>{progress.registerButton.label}</span>
                    </SiteLink>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Adjustable Bottom Edge Divider Shape */}
          {bottomShape !== "none" && curveDepth > 0 && (
            <div
              className={`wb-campaign-bottom-divider wb-shape-${bottomShape}`}
              style={{
                color: bottomColor,
                height: `${curveDepth}px`,
              }}
              aria-hidden="true"
            >
              {bottomShape === "curved" && (
                <svg
                  viewBox="0 0 1440 120"
                  preserveAspectRatio="none"
                  className="wb-campaign-bottom-svg"
                >
                  <path
                    d="M0,0 C480,120 960,120 1440,0 L1440,120 L0,120 Z"
                    fill="currentColor"
                  />
                </svg>
              )}
              {bottomShape === "arch" && (
                <svg
                  viewBox="0 0 1440 120"
                  preserveAspectRatio="none"
                  className="wb-campaign-bottom-svg"
                >
                  <path
                    d="M0,120 C480,0 960,0 1440,120 L1440,120 L0,120 Z"
                    fill="currentColor"
                  />
                </svg>
              )}
              {bottomShape === "wave" && (
                <svg
                  viewBox="0 0 1440 120"
                  preserveAspectRatio="none"
                  className="wb-campaign-bottom-svg"
                >
                  <path
                    d="M0,35 C360,110 720,-10 1080,75 C1260,115 1380,45 1440,35 L1440,120 L0,120 Z"
                    fill="currentColor"
                  />
                </svg>
              )}
              {bottomShape === "slant" && (
                <svg
                  viewBox="0 0 1440 120"
                  preserveAspectRatio="none"
                  className="wb-campaign-bottom-svg"
                >
                  <path d="M0,0 L1440,120 L0,120 Z" fill="currentColor" />
                </svg>
              )}
              {bottomShape === "tilt" && (
                <svg
                  viewBox="0 0 1440 120"
                  preserveAspectRatio="none"
                  className="wb-campaign-bottom-svg"
                >
                  <path d="M1440,0 L0,120 L1440,120 Z" fill="currentColor" />
                </svg>
              )}
            </div>
          )}
        </div>
      </SectionShell>
    );
  }

  const copy = (
    <div
      className="wb-hero-copy"
      {...(baseAlign ? { "data-wb-content-align": baseAlign } : {})}
    >
      {(data.eyebrow || data.badgeIcon) && (
        <div className="wb-hero-badge" {...alignAttr(alignOf("badge"))}>
          {data.badgeIcon && <span>{data.badgeIcon}</span>}
          {data.eyebrow && <span>{data.eyebrow}</span>}
        </div>
      )}

      {data.heading
        ? renderHighlightedHeading(
            data.heading,
            data.highlightText,
            Boolean(
              section.settings.customColors?.gradientFrom ||
              section.settings.customColors?.gradientTo,
            ),
            alignOf("heading"),
          )
        : null}

      {data.subheading && (
        <p
          className="wb-hero-sub wb-muted"
          {...alignAttr(alignOf("subheading"))}
        >
          {parseRichText(data.subheading)}
        </p>
      )}
      {data.description && (
        <p
          className="wb-hero-desc wb-muted"
          {...alignAttr(alignOf("description"))}
        >
          {parseRichText(data.description)}
        </p>
      )}

      {actions}

      <TrustedByStrip trustedBy={data.trustedBy} align={alignOf("trustedBy")} />
    </div>
  );

  const isBgMediaMode =
    data.imagePosition === "background" ||
    data.variant === "background-image" ||
    data.variant === "video-bg";

  const contextDescription = `${data.heading ?? ""} ${data.subheading ?? ""} ${data.eyebrow ?? ""} ${data.description ?? ""}`;

  const rawBgImage =
    data.backgroundImage ||
    (isBgMediaMode && data.image ? data.image : undefined);

  // If in background media mode and no image was specified, intelligently select a context-aware fallback image
  const resolvedBgUrl = rawBgImage?.url
    ? normalizeImageUrl(rawBgImage.url, contextDescription)
    : isBgMediaMode && data.variant !== "video-bg"
      ? getCuratedFallbackImage(contextDescription)
      : undefined;

  const bgImage = resolvedBgUrl
    ? { url: resolvedBgUrl, alt: rawBgImage?.alt ?? "Hero background" }
    : undefined;

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

  const isFloatingCards = data.variant === "floating-cards";
  const floatingCards = data.floatingCards?.slice(0, 3) ?? [];

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
          <SiteImage image={data.image} contextText={contextDescription} />
        ) : (
          <HeroMockupPlaceholder />
        )}
        {isFloatingCards && floatingCards.length > 0 && (
          <ul className="wb-hero-floating-cards-list">
            {floatingCards.map((card, index) => (
              <li key={`${card.title}-${index}`} className={`wb-hero-floating-card wb-hero-floating-card-${index + 1}`}>
                {card.icon && (
                  <span className="wb-hero-floating-card-icon">
                    <SiteIcon name={card.icon} />
                  </span>
                )}
                <span className="wb-hero-floating-card-text">
                  <strong>{card.title}</strong>
                  {card.subtitle && <span>{card.subtitle}</span>}
                </span>
                {card.badge && <span className="wb-hero-floating-card-badge">{card.badge}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  const isLeft = data.variant === "split-left" || data.imagePosition === "left";

  const isSplit =
    data.variant === "split" ||
    data.variant === "split-left" ||
    data.imagePosition === "left" ||
    data.imagePosition === "right" ||
    data.variant === "asymmetric" ||
    isFloatingCards;

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
    (hasBgMedia &&
      (overlayType === "dark" || (overlayType as string) === "default")) ||
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
      } ${isDarkOverlay ? "wb-hero-dark-overlay" : ""} ${buttonShape.className}`}
      style={buttonShape.style}
      label="Hero"
    >
      {/* Full Background Image / Video media layer */}
      {hasBgMedia && (
        <>
          <HeroBackgroundMedia
            bgImage={bgImage}
            bgVideoUrl={bgVideoUrl}
            bgEmbedUrl={bgEmbedUrl}
            bgPosClass={bgPosClass}
            contextDescription={contextDescription}
          />
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
