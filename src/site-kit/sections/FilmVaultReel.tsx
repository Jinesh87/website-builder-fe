import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SectionShell, SiteImage, SiteLink } from "../primitives.tsx";
import { useStaticRender } from "../render-mode.tsx";
import type { CardItem, CardsData, SectionSettings } from "../types.ts";
import { parseVideoUrl } from "../VideoModal.tsx";

const DEFAULT_FILM_VIDEOS: Record<string, string> = {
  "MUSIC VIDEOS": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "BRAND FILMS": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "WEDDINGS & EVENTS": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "SHORT FILMS": "/bannervid.mp4",
};

export function getFilmVideoUrl(item: Partial<CardItem>): string {
  if (item.videoUrl && item.videoUrl.trim()) return item.videoUrl.trim();
  const sub = (item.subtitle || "").toUpperCase();
  if (DEFAULT_FILM_VIDEOS[sub]) return DEFAULT_FILM_VIDEOS[sub];
  const cat = (item.category || "").toUpperCase();
  if (DEFAULT_FILM_VIDEOS[cat]) return DEFAULT_FILM_VIDEOS[cat];
  const badge = (item.badge || "").toUpperCase();
  if (badge.includes("MUSIC")) return DEFAULT_FILM_VIDEOS["MUSIC VIDEOS"];
  if (badge.includes("BRAND")) return DEFAULT_FILM_VIDEOS["BRAND FILMS"];
  if (badge.includes("WEDDING") || badge.includes("EVENT")) return DEFAULT_FILM_VIDEOS["WEDDINGS & EVENTS"];
  return "/bannervid.mp4";
}

export default function FilmVaultReel({
  sectionId,
  settings,
  data,
}: {
  sectionId: string;
  settings: SectionSettings;
  data: CardsData;
}) {
  const isStatic = useStaticRender();
  const reelRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [selectedFilm, setSelectedFilm] = useState<CardItem | null>(null);

  // Timecode configuration
  const timecodeMode = data.timecodeMode ?? "live";
  const initialTimecode = data.timecode || "00:00:45:14";
  const [timecode, setTimecode] = useState<string>(initialTimecode);

  // Close modal on Escape key
  useEffect(() => {
    if (!selectedFilm) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedFilm(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedFilm]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!selectedFilm || typeof document === "undefined") return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [selectedFilm]);

  useEffect(() => {
    setTimecode(initialTimecode);
  }, [initialTimecode]);

  useEffect(() => {
    if (isStatic || timecodeMode === "static") return;
    const parts = initialTimecode.split(":");
    let sec = parts.length >= 2 ? parseInt(parts[parts.length - 2], 10) || 45 : 45;
    let frame = parts.length >= 1 ? parseInt(parts[parts.length - 1], 10) || 14 : 14;

    const interval = setInterval(() => {
      frame++;
      if (frame >= 24) {
        frame = 0;
        sec = (sec + 1) % 60;
      }
      const s = String(sec).padStart(2, "0");
      const f = String(frame).padStart(2, "0");
      setTimecode(`00:00:${s}:${f}`);
    }, 100);

    return () => clearInterval(interval);
  }, [isStatic, timecodeMode, initialTimecode]);

  // Categories configuration
  const showCategories = data.showCategories !== false;
  const categories =
    data.categories && data.categories.length > 0
      ? data.categories
      : ["ALL", "MUSIC VIDEOS", "BRAND FILMS", "WEDDINGS & EVENTS", "SHORT FILMS"];

  const items = data.items ?? [];

  const filteredItems = items.filter((item) => {
    if (activeCategory === "ALL") return true;
    const cat = activeCategory.toUpperCase();
    if (item.subtitle && item.subtitle.toUpperCase() === cat) return true;
    if (item.category && item.category.toUpperCase() === cat) return true;
    if (item.badge && item.badge.toUpperCase().includes(cat.replace(/S$/, ""))) return true;
    if (cat === "MUSIC VIDEOS" && item.badge?.toUpperCase().includes("MUSIC VIDEO")) return true;
    if (cat === "BRAND FILMS" && item.badge?.toUpperCase().includes("BRAND FILM")) return true;
    if (
      cat === "WEDDINGS & EVENTS" &&
      (item.badge?.toUpperCase().includes("WEDDING") || item.badge?.toUpperCase().includes("EVENT"))
    )
      return true;
    if (
      cat === "SHORT FILMS" &&
      (item.badge?.toUpperCase().includes("SHORT FILM") ||
        item.badge?.toUpperCase().includes("DOCUMENTARY"))
    )
      return true;
    return false;
  });

  const scrollReel = (direction: "left" | "right") => {
    if (!reelRef.current) return;
    const step = data.filmCardWidth ? data.filmCardWidth + 20 : 400;
    const amount = direction === "left" ? -step : step;
    reelRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  // Typography heading resolution
  const headingWords = (data.heading || "OUR WORK").trim().split(/\s+/);
  const solidWord = data.solidHeading !== undefined ? data.solidHeading : headingWords[0] || "OUR";
  const outlineWord =
    data.outlineHeading !== undefined
      ? data.outlineHeading
      : headingWords.slice(1).join(" ") || "WORK";

  // REC Status HUD
  const showRec = data.showRecBadge !== false;
  const recText = data.recText || "REC - NOW SHOWING";
  const recColor = data.recColor || "#FF3333";

  // Timecode styling
  const timecodeColor = data.timecodeColor || "#FF3333";

  // Sprockets
  const showSprockets = data.showSprockets !== false;

  // Filmstrip counter & arrows
  const rawCounter = data.filmCounterText || "{count} FILMS - SWIPE OR USE ARROWS";
  const counterText = rawCounter.replace("{count}", String(filteredItems.length));
  const showArrows = data.showFilmArrows !== false;

  // Film frame dimensions
  const cardWidthStyle = data.filmCardWidth ? `${data.filmCardWidth}px` : undefined;
  const cardHeightStyle = data.filmCardHeight ? `${data.filmCardHeight}px` : undefined;

  // Video parsing for selected modal film with dynamic fallback
  const activeVideoUrl = selectedFilm ? getFilmVideoUrl(selectedFilm) : "";
  const parsedVideo = activeVideoUrl ? parseVideoUrl(activeVideoUrl) : null;

  const modalContent = selectedFilm && (
    <div
      className="wb-film-modal-overlay"
      onClick={() => setSelectedFilm(null)}
      role="dialog"
      aria-modal="true"
      aria-label={selectedFilm.title}
    >
      <div className="wb-film-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="wb-film-modal-header">
          <div className="wb-film-modal-title-wrap">
            {selectedFilm.badge && (
              <span className="wb-film-modal-badge">{selectedFilm.badge}</span>
            )}
            <h3 className="wb-film-modal-title">{selectedFilm.title}</h3>
          </div>
          <button
            type="button"
            className="wb-film-modal-close"
            onClick={() => setSelectedFilm(null)}
            aria-label="Close preview"
          >
            ✕
          </button>
        </div>
        <div className="wb-film-modal-player">
          {parsedVideo && (parsedVideo.type === "youtube" || parsedVideo.type === "vimeo") && parsedVideo.embedUrl ? (
            <iframe
              src={parsedVideo.embedUrl}
              title={selectedFilm.title}
              className="wb-film-modal-video-frame"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <video
              src={parsedVideo?.directUrl || activeVideoUrl}
              controls
              autoPlay
              playsInline
              className="wb-film-modal-video-frame"
            />
          )}
        </div>
        {(selectedFilm.description || selectedFilm.link) && (
          <div className="wb-film-modal-footer">
            {selectedFilm.description && (
              <p className="wb-film-modal-desc">{selectedFilm.description}</p>
            )}
            {selectedFilm.link && (
              <SiteLink link={selectedFilm.link} className="wb-film-modal-cta">
                {selectedFilm.link.label || "View Project"} →
              </SiteLink>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <SectionShell
      sectionId={sectionId}
      settings={settings}
      className="wb-film-vault-wrap"
      label={data.heading || "Our Work"}
      fullWidth
    >
      <div className="wb-container wb-film-vault-container">
        {/* Top meta row */}
        <div className="wb-vr-work-meta-row">
          <span className="wb-vr-work-meta-left">{data.eyebrow ?? "PORTFOLIO"}</span>
          {showRec && (
            <span className="wb-vr-work-rec">
              <span
                className="wb-vr-rec-dot"
                style={{
                  backgroundColor: recColor,
                  boxShadow: `0 0 10px ${recColor}`,
                }}
                aria-hidden="true"
              />
              <span className="wb-vr-rec-text" style={{ color: recColor }}>
                {recText}
              </span>
            </span>
          )}
        </div>

        {/* Display Title: Solid first word + Outlined second word */}
        <div className="wb-vr-work-title">
          {solidWord && <span className="wb-vr-work-solid">{solidWord}</span>}
          {outlineWord && <span className="wb-vr-work-outline">{outlineWord}</span>}
        </div>

        {/* Subrow: typewriter paragraph on left, red digital timecode on right */}
        <div className="wb-vr-work-subrow">
          <p className="wb-vr-work-desc">
            {data.intro ??
              "Music videos, brand films, weddings and short films. Swipe the strip and press play on any frame."}
          </p>
          <div
            className="wb-vr-timecode"
            style={{
              color: timecodeColor,
              textShadow: `0 0 16px ${timecodeColor}aa`,
            }}
            aria-label="Digital timecode"
          >
            {timecode}
          </div>
        </div>

        {/* Category filter pills */}
        {showCategories && (
          <div className="wb-vr-filter-row" role="tablist" aria-label="Filter portfolio categories">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`wb-vr-filter-btn ${activeCategory === cat ? "wb-vr-filter-active" : ""}`}
                onClick={() => setActiveCategory(cat)}
                role="tab"
                aria-selected={activeCategory === cat}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 35mm Celluloid Filmstrip Carousel */}
      <div className="wb-filmstrip-outer">
        {/* Top sprocket holes row */}
        {showSprockets && (
          <div className="wb-sprockets-strip wb-sprockets-top" aria-hidden="true">
            {Array.from({ length: 120 }).map((_, i) => (
              <span key={i} className="wb-sprocket-hole" />
            ))}
          </div>
        )}

        {/* Horizontal scrollable film reel */}
        <div ref={reelRef} className="wb-film-reel-track">
          {filteredItems.map((item, index) => {
            const itemVideoUrl = getFilmVideoUrl(item);
            return (
              <div
                key={index}
                className="wb-film-strip-card"
                style={{
                  width: cardWidthStyle,
                  height: cardHeightStyle,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFilm(item);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedFilm(item);
                  }
                }}
                aria-label={`Play ${item.title}`}
                data-wb-video-modal="true"
                data-wb-video-url={itemVideoUrl}
                data-wb-video-title={item.title}
              >
                <div className="wb-film-card-image-wrap">
                  {item.image && (
                    <SiteImage
                      image={item.image}
                      className="wb-film-strip-img"
                      contextText={item.title}
                    />
                  )}
                  <div className="wb-film-vignette" />
                </div>

                {/* Duration / category badge top-right */}
                {item.badge && <span className="wb-film-tag-badge">{item.badge}</span>}

                {/* Centered circular play button */}
                <button
                  type="button"
                  className="wb-film-play-btn"
                  aria-label={`Play ${item.title}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFilm(item);
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>

                {/* Film Title bottom-left */}
                <div className="wb-film-title-label">{item.title}</div>
              </div>
            );
          })}
        </div>

        {/* Bottom sprocket holes row */}
        {showSprockets && (
          <div className="wb-sprockets-strip wb-sprockets-bottom" aria-hidden="true">
            {Array.from({ length: 120 }).map((_, i) => (
              <span key={i} className="wb-sprocket-hole" />
            ))}
          </div>
        )}
      </div>

      {/* Slider controls bar under filmstrip */}
      <div className="wb-container">
        <div className="wb-film-controls-bar">
          <span className="wb-film-counter">{counterText}</span>
          {showArrows && (
            <div className="wb-film-arrows">
              <button
                type="button"
                className="wb-film-arrow-btn"
                onClick={() => scrollReel("left")}
                aria-label="Previous films"
              >
                ←
              </button>
              <button
                type="button"
                className="wb-film-arrow-btn"
                onClick={() => scrollReel("right")}
                aria-label="Next films"
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Video Preview Modal rendered via Portal to root document */}
      {modalContent && (typeof document !== "undefined" ? createPortal(modalContent, document.body) : modalContent)}
    </SectionShell>
  );
}
