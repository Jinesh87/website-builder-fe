import { useLayoutEffect, useRef, useState } from "react";
import { SitePage, type PageData, type SiteData } from "../../site-kit/index.ts";
import { useSiteStylesheet } from "./use-site-stylesheet.ts";

const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 800;

type SiteThumbnailProps = {
  site: SiteData;
  /** Defaults to the home page. */
  page?: PageData;
  className?: string;
};

/** The first screen of a page rendered at desktop width, scaled to exactly fill its 16:10 box. */
export default function SiteThumbnail({ site, page, className = "" }: SiteThumbnailProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const target = page ?? site.pages.find((candidate) => candidate.slug === "/") ?? site.pages[0];
  useSiteStylesheet();

  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const update = () => setScale(box.clientWidth / VIEWPORT_WIDTH);
    const observer = new ResizeObserver(update);
    observer.observe(box);
    update();
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={boxRef} className={`relative aspect-[16/10] w-full overflow-hidden bg-white ${className}`} aria-hidden inert>
      {target && scale > 0 && (
        <div
          className="pointer-events-none absolute left-0 top-0 origin-top-left select-none overflow-hidden"
          style={{ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT, transform: `scale(${scale})` }}
        >
          <SitePage site={site} page={target} />
        </div>
      )}
    </div>
  );
}
