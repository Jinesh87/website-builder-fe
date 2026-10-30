import { parseRichText } from "../rich-text.tsx";
import { videoEmbedUrl } from "../links.ts";
import { SectionShell, SiteImage } from "../primitives.tsx";
import type { MediaAspect, SectionOf } from "../types.ts";

const ASPECT_CLASS: Record<MediaAspect, string> = {
  "16:9": "wb-aspect-video",
  "4:3": "wb-aspect-classic",
  "1:1": "wb-aspect-square",
};

export default function MediaSection({ section }: { section: SectionOf<"media"> }) {
  const { data } = section;
  const embed = data.kind === "video" ? videoEmbedUrl(data.videoUrl) : null;
  const frameClass = `wb-media-frame ${ASPECT_CLASS[data.aspect]}`;

  let media;
  if (data.kind === "video" && embed) {
    media = (
      <div className={frameClass}>
        <iframe
          src={embed}
          title={data.heading || data.caption || "Video"}
          loading="lazy"
          allow="encrypted-media; picture-in-picture; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation"
        />
      </div>
    );
  } else if (data.kind === "image" && data.image) {
    media = (
      <div className={frameClass}>
        <SiteImage image={data.image} />
      </div>
    );
  } else {
    media = (
      <div className={`${frameClass} wb-media-placeholder`}>
        <p className="wb-empty">{data.kind === "video" ? "Add a YouTube or Vimeo link." : "Add an image."}</p>
      </div>
    );
  }

  const align = data.align || section.settings.align || "center";

  return (
    <SectionShell
      sectionId={section.id}
      settings={section.settings}
      className={`wb-media wb-media-${data.width} wb-align-${align}`}
      label={data.heading || "Media"}
    >
      {data.heading && <h2 className={`wb-media-head wb-align-${align}`}>{parseRichText(data.heading)}</h2>}
      <figure>
        {media}
        {data.caption && <figcaption className={`wb-muted wb-align-${align}`}>{parseRichText(data.caption)}</figcaption>}
      </figure>
    </SectionShell>
  );
}
