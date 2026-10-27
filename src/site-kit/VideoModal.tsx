import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type VideoModalData = {
  url: string;
  title?: string;
};

export type VideoEmbedType = "youtube" | "vimeo" | "direct" | "unknown";

export type ParsedVideo = {
  type: VideoEmbedType;
  embedUrl?: string;
  directUrl?: string;
  videoId?: string;
};

/**
 * Extracts video provider, embed URL, or direct media link.
 */
export function parseVideoUrl(rawUrl: string): ParsedVideo {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { type: "unknown" };
  }

  const url = rawUrl.trim();

  // YouTube detection: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/shorts/ID, youtube.com/live/ID
  const ytMatch =
    url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live|shorts)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/i);

  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: "youtube",
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`,
    };
  }

  // Vimeo detection: vimeo.com/ID, player.vimeo.com/video/ID
  const vimeoMatch = url.match(/(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|))(\d+)/i);
  if (vimeoMatch && vimeoMatch[3]) {
    const videoId = vimeoMatch[3];
    return {
      type: "vimeo",
      videoId,
      embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0`,
    };
  }

  // Direct video files or Linode/API uploads: mp4, webm, mov, m4v, ogg
  const isDirect =
    /\.(mp4|webm|mov|m4v|ogg)($|\?)/i.test(url) ||
    url.includes("/api/media/") ||
    url.includes("/media/") ||
    url.includes("blob:") ||
    url.includes("linodeobjects.com");

  if (isDirect || url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) {
    return {
      type: "direct",
      directUrl: url,
    };
  }

  return { type: "unknown", directUrl: url };
}

type VideoModalContextValue = {
  activeVideo: VideoModalData | null;
  openVideo: (data: VideoModalData | string, title?: string) => void;
  closeVideo: () => void;
};

const VideoModalContext = createContext<VideoModalContextValue>({
  activeVideo: null,
  openVideo: () => undefined,
  closeVideo: () => undefined,
});

export function useVideoModal() {
  return useContext(VideoModalContext);
}

/**
 * Global helper to trigger the video modal from anywhere (inside or outside React context).
 */
export function openVideoModal(urlOrData: string | VideoModalData, title?: string) {
  if (typeof window === "undefined") return;
  const data: VideoModalData =
    typeof urlOrData === "string"
      ? { url: urlOrData, title }
      : urlOrData;

  if (!data.url) return;

  window.dispatchEvent(
    new CustomEvent("wb-open-video", {
      detail: data,
    }),
  );
}

export function VideoModalProvider({ children }: { children: ReactNode }) {
  const [activeVideo, setActiveVideo] = useState<VideoModalData | null>(null);

  const openVideo = useCallback((data: VideoModalData | string, title?: string) => {
    if (typeof data === "string") {
      setActiveVideo({ url: data, title });
    } else {
      setActiveVideo(data);
    }
  }, []);

  const closeVideo = useCallback(() => {
    setActiveVideo(null);
  }, []);

  // Listen to global window event so any anchor or button can trigger the modal
  useEffect(() => {
    const handleGlobalOpen = (e: Event) => {
      const customEvent = e as CustomEvent<VideoModalData>;
      if (customEvent.detail && customEvent.detail.url) {
        setActiveVideo(customEvent.detail);
      }
    };

    window.addEventListener("wb-open-video", handleGlobalOpen as EventListener);
    return () => {
      window.removeEventListener("wb-open-video", handleGlobalOpen as EventListener);
    };
  }, []);

  const value = useMemo(
    () => ({ activeVideo, openVideo, closeVideo }),
    [activeVideo, openVideo, closeVideo],
  );

  return (
    <VideoModalContext.Provider value={value}>
      {children}
      <VideoModal />
    </VideoModalContext.Provider>
  );
}

export type VideoModalProps = {
  isOpen?: boolean;
  onClose?: () => void;
  videoUrl?: string;
  title?: string;
};

export function VideoModal(props?: VideoModalProps) {
  const context = useContext(VideoModalContext);
  const isControlled = props?.isOpen !== undefined;

  const isOpen = isControlled ? Boolean(props.isOpen) : Boolean(context.activeVideo);
  const videoUrl = (isControlled ? props.videoUrl : context.activeVideo?.url) || "";
  const title = (isControlled ? props.title : context.activeVideo?.title) || "Video Demo";

  const handleClose = useCallback(() => {
    if (isControlled) {
      props.onClose?.();
    } else {
      context.closeVideo();
    }
  }, [isControlled, props, context]);

  const parsed = useMemo(() => parseVideoUrl(videoUrl), [videoUrl]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Reset state when videoUrl changes
  useEffect(() => {
    setIsVideoLoading(true);
    setHasError(false);
  }, [videoUrl]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !videoUrl) return null;

  return (
    <div
      className="wb-video-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={title || "Video player"}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="wb-video-modal-dialog">
        {/* Top bar with title and close button */}
        <div className="wb-video-modal-header">
          <div className="wb-video-modal-title-group">
            <span className="wb-video-modal-badge">
              <svg viewBox="0 0 24 24" fill="currentColor" className="wb-video-modal-badge-icon" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>Demo</span>
            </span>
            <span className="wb-video-modal-title">{title}</span>
          </div>

          <div className="wb-video-modal-actions">
            <button
              type="button"
              onClick={handleClose}
              className="wb-video-modal-close-btn"
              aria-label="Close video (Press Esc)"
              title="Close (Esc)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <span className="wb-video-modal-esc-hint">ESC</span>
            </button>
          </div>
        </div>

        {/* Video Player Container */}
        <div className="wb-video-modal-player-container">
          {parsed.type === "youtube" && parsed.embedUrl && (
            <iframe
              src={parsed.embedUrl}
              title={title}
              className="wb-video-modal-iframe"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}

          {parsed.type === "vimeo" && parsed.embedUrl && (
            <iframe
              src={parsed.embedUrl}
              title={title}
              className="wb-video-modal-iframe"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          )}

          {(parsed.type === "direct" || parsed.type === "unknown") && (
            <div className="wb-video-modal-video-wrap">
              {isVideoLoading && !hasError && (
                <div className="wb-video-modal-loader" aria-hidden="true">
                  <div className="wb-video-modal-spinner" />
                  <span>Loading demo…</span>
                </div>
              )}

              {hasError ? (
                <div className="wb-video-modal-error">
                  <p>Unable to stream video demo directly.</p>
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="wb-video-modal-error-btn"
                  >
                    Open video link in new tab
                  </a>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  src={parsed.directUrl || videoUrl}
                  controls
                  autoPlay
                  playsInline
                  preload="auto"
                  className="wb-video-modal-video"
                  onCanPlay={() => setIsVideoLoading(false)}
                  onError={() => {
                    setIsVideoLoading(false);
                    setHasError(true);
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
