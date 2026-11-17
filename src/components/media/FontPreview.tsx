import { useEffect, useState } from "react";

/** Loaded faces by file URL, so a font shown in several places is fetched once. */
const loaded = new Map<string, Promise<string | null>>();

function loadFont(url: string, id: string): Promise<string | null> {
  const cached = loaded.get(url);
  if (cached) return cached;
  const family = `wb-media-font-${id}`;
  const promise =
    typeof FontFace === "undefined"
      ? Promise.resolve(null)
      : new FontFace(family, `url("${url.replace(/"/g, "%22")}")`)
          .load()
          .then((face) => {
            document.fonts.add(face);
            return family;
          })
          .catch(() => null);
  loaded.set(url, promise);
  return promise;
}

/** "Aa" (or `text`) drawn in a media-library font file; falls back to the UI font if it can't load. */
export default function FontPreview({
  url,
  id,
  text = "Aa",
  className,
}: {
  url: string;
  id: string;
  text?: string;
  className?: string;
}) {
  const [family, setFamily] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    void loadFont(url, id).then((name) => active && setFamily(name));
    return () => {
      active = false;
    };
  }, [url, id]);
  return (
    <span className={className} style={family ? { fontFamily: `"${family}"` } : undefined}>
      {text}
    </span>
  );
}
