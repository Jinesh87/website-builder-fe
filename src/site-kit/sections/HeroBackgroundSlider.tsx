import { useEffect, useRef, useState } from "react";
import { StaticStates, useStaticRender } from "../render-mode.tsx";
import type { HeroData, ImageRef } from "../types.ts";

/** Background slides with a picture; the slider runs only when there are at least two. */
export function heroBackgroundSlides(data: HeroData): ImageRef[] {
  return (data.backgroundSlides ?? []).filter((slide) => slide.url?.trim());
}

const DEFAULT_INTERVAL = 5;

function Arrow({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={direction === "prev" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
    </svg>
  );
}

/**
 * Crossfading background photos behind a hero's text, with arrows and dots. On the live site the
 * slides are static states switched by the site runtime; in the builder React drives them.
 */
export default function HeroBackgroundSlider({
  slides,
  interval,
  bgPosClass,
}: {
  slides: ImageRef[];
  /** Seconds per slide; 0 turns autoplay off. */
  interval?: number;
  bgPosClass: string;
}) {
  const isStatic = useStaticRender();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const dotsRef = useRef<HTMLDivElement>(null);
  const seconds = interval ?? DEFAULT_INTERVAL;
  const count = slides.length;

  // Pause while the pointer is over the hero, like the live runtime does.
  useEffect(() => {
    const hero = isStatic ? null : dotsRef.current?.closest(".wb-hero");
    if (!hero) return;
    const pause = () => setPaused(true);
    const resume = () => setPaused(false);
    hero.addEventListener("mouseenter", pause);
    hero.addEventListener("mouseleave", resume);
    return () => {
      hero.removeEventListener("mouseenter", pause);
      hero.removeEventListener("mouseleave", resume);
    };
  }, [isStatic]);

  // A timeout per slide, so a click on an arrow or dot restarts the countdown.
  useEffect(() => {
    if (isStatic || paused || seconds <= 0 || count < 2) return;
    const timer = window.setTimeout(() => setActive((index) => (index + 1) % count), seconds * 1000);
    return () => window.clearTimeout(timer);
  }, [isStatic, paused, seconds, count, active]);

  const go = (target: number | "prev" | "next") =>
    setActive((index) => (target === "prev" ? (index - 1 + count) % count : target === "next" ? (index + 1) % count : target));

  // In static output the runtime handles clicks through data-wb-go; in the builder React does.
  const control = (target: number | "prev" | "next") =>
    isStatic ? { "data-wb-go": String(target) } : { onClick: () => go(target) };

  const render = (index: number) => {
    const slide = slides[index] ?? slides[0]!;
    return (
      <>
        <div className={`wb-hero-bg-media wb-hero-slide-bg ${bgPosClass}`} key={index}>
          <img
            src={slide.url}
            alt={slide.alt || ""}
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={index === 0 ? "high" : "auto"}
          />
        </div>
        <button type="button" className="wb-hero-slider-arrow wb-hero-slider-prev" aria-label="Previous slide" {...control("prev")}>
          <Arrow direction="prev" />
        </button>
        <button type="button" className="wb-hero-slider-arrow wb-hero-slider-next" aria-label="Next slide" {...control("next")}>
          <Arrow direction="next" />
        </button>
        <div className="wb-hero-slider-dots" ref={dotsRef}>
          {slides.map((_, dot) => (
            <button
              key={dot}
              type="button"
              className={`wb-hero-slider-dot${dot === index ? " wb-hero-slider-dot-active" : ""}`}
              aria-label={`Show slide ${dot + 1}`}
              aria-current={dot === index ? "true" : undefined}
              {...control(dot)}
            />
          ))}
        </div>
      </>
    );
  };

  return isStatic ? (
    <StaticStates
      states={slides.map((_, index) => index)}
      initial={0}
      render={render}
      autoplaySeconds={seconds > 0 ? seconds : undefined}
      pauseOnHover
    />
  ) : (
    render(Math.min(active, count - 1))
  );
}
