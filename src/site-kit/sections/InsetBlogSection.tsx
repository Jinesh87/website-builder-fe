import { useMemo, useState } from "react";
import { ArrowRight, ImageIcon } from "lucide-react";
import { parseRichText, SectionShell, SiteImage } from "../primitives.tsx";
import { toPlainText } from "../rich-text-core.ts";
import type { BlogData, SectionOf } from "../types.ts";
import { formatBlogHref } from "./blog-href.ts";

/**
 * Blog "Inset cards": soft tinted cards with the cover photo inset at the top, an accent category
 * label, a bold title, a short excerpt and a "Read article →" link. No author row.
 */
export default function InsetBlogSection({ section }: { section: SectionOf<"blog"> }) {
  const data = section.data as BlogData;
  const align = data.align || section.settings.align || "left";
  const [active, setActive] = useState("All");

  const categories = useMemo(() => {
    const list = (data.categories ?? []).filter((c) => c.trim() && c.toLowerCase() !== "all");
    return list.length > 0 ? ["All", ...list] : [];
  }, [data.categories]);

  const posts = useMemo(() => {
    const all = data.posts ?? [];
    if (active === "All") return all;
    return all.filter((post) => post.category?.toLowerCase() === active.toLowerCase());
  }, [data.posts, active]);

  const hasHeader = Boolean(data.eyebrow || data.title || data.subtitle || categories.length > 0);

  return (
    <SectionShell sectionId={section.id} settings={section.settings} className={`wb-align-${align}`}>
      <div className="wb-blog-inset">
        {hasHeader && (
          <div className={`wb-blog-inset-header wb-align-${align}`}>
            {data.eyebrow && <span className="wb-blog-inset-eyebrow">{parseRichText(data.eyebrow)}</span>}
            {data.title && <h2 className="wb-blog-inset-heading">{parseRichText(data.title)}</h2>}
            {data.subtitle && <p className="wb-blog-inset-subtitle">{parseRichText(data.subtitle)}</p>}
            {categories.length > 0 && (
              <div className="wb-blog-inset-filters" role="tablist" aria-label="Blog categories">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={active === category}
                    onClick={() => setActive(category)}
                    className={`wb-blog-inset-filter${active === category ? " active" : ""}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className={`wb-blog-inset-grid${data.layout === "grid-2" ? " cols-2" : ""}`}>
          {posts.map((post) => {
            const href = formatBlogHref(post.slug);
            return (
              <article key={post.id} className="wb-blog-inset-card" data-href={href}>
                <a href={href} className="wb-blog-inset-media" aria-label={toPlainText(post.title)} tabIndex={-1}>
                  {post.coverImage?.url ? (
                    <SiteImage image={post.coverImage} className="wb-blog-inset-img" />
                  ) : (
                    <span className="wb-blog-inset-placeholder">
                      <ImageIcon aria-hidden />
                    </span>
                  )}
                </a>
                <div className="wb-blog-inset-body">
                  {post.category && <span className="wb-blog-inset-category">{post.category}</span>}
                  <h3 className="wb-blog-inset-title">
                    <a href={href}>{parseRichText(post.title)}</a>
                  </h3>
                  {post.excerpt && <p className="wb-blog-inset-excerpt">{parseRichText(post.excerpt)}</p>}
                  <a href={href} className="wb-blog-inset-link">
                    <span>{post.readMoreLabel || "Read article"}</span>
                    <ArrowRight aria-hidden />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}
