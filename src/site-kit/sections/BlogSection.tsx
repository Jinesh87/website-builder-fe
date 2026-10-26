import { useMemo, useState } from "react";
import { ArrowRight, User } from "lucide-react";
import { parseRichText, SectionShell, SiteImage } from "../primitives.tsx";
import type { BlogData, SectionOf } from "../types.ts";

function formatBlogHref(slug?: string): string {
  if (!slug || slug.trim() === "" || slug === "#") return "#";
  const trimmed = slug.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:") ||
    trimmed.startsWith("#")
  ) {
    return trimmed;
  }
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export default function BlogSection({ section }: { section: SectionOf<"blog"> }) {
  const data = section.data as BlogData;
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(() => {
    const list = data.categories && data.categories.length > 0 ? data.categories : ["All"];
    if (!list.includes("All")) return ["All", ...list];
    return list;
  }, [data.categories]);

  const posts = data.posts || [];

  const filteredPosts = useMemo(() => {
    if (activeCategory === "All") return posts;
    return posts.filter(
      (p) => p.category?.toLowerCase() === activeCategory.toLowerCase(),
    );
  }, [posts, activeCategory]);

  const layoutColsClass = data.layout === "grid-2" ? "cols-2" : "";

  const align = data.align || section.settings.align || "center";

  return (
    <SectionShell sectionId={section.id} settings={section.settings} className={`wb-align-${align}`}>
      <div className="wb-blog-section">
        {/* Header */}
        <div className={`wb-blog-header wb-align-${align}`}>
          {data.eyebrow && <span className="wb-blog-eyebrow">{parseRichText(data.eyebrow)}</span>}
          {data.title && <h2 className="wb-blog-title">{parseRichText(data.title)}</h2>}
          {data.subtitle && <p className="wb-blog-subtitle">{parseRichText(data.subtitle)}</p>}

          {/* Filter Pills */}
          {categories.length > 1 && (
            <div className={`wb-blog-filters wb-align-${align}`} role="tablist" aria-label="Blog categories">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`wb-blog-filter-btn ${activeCategory === cat ? "active" : ""}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Blog Cards Grid */}
        <div className={`wb-blog-grid ${layoutColsClass}`}>
          {filteredPosts.map((post) => {
            const href = formatBlogHref(post.slug);
            return (
              <article key={post.id} className="wb-blog-card" data-href={href}>
                <a href={href} className="wb-blog-card-media" aria-label={post.title}>
                  {post.coverImage?.url ? (
                    <SiteImage image={post.coverImage} className="wb-blog-card-img" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
                      <span className="text-xs font-medium">Cover Image</span>
                    </div>
                  )}
                  {post.category && <span className="wb-blog-card-badge">{post.category}</span>}
                </a>

                <div className="wb-blog-card-body">
                  {post.category && <span className="wb-blog-card-category">{post.category}</span>}
                  <a href={href} className="wb-blog-card-title-link">
                    <h3 className="wb-blog-card-title">{parseRichText(post.title)}</h3>
                  </a>
                  {post.excerpt && <p className="wb-blog-card-excerpt">{parseRichText(post.excerpt)}</p>}

                  <div className="wb-blog-card-footer">
                    <div className="wb-blog-card-author-row">
                      {post.authorAvatar?.url ? (
                        <SiteImage image={post.authorAvatar} className="wb-blog-card-author-avatar" />
                      ) : (
                        <span className="grid size-6 place-items-center rounded-full bg-zinc-200 text-zinc-600 text-xs">
                          <User className="size-3" />
                        </span>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <span>{post.authorName || "Author"}</span>
                        {post.date && (
                          <>
                            <span>•</span>
                            <span>{post.date}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <a href={href} className="wb-blog-card-read-more">
                      <span>{post.readMoreLabel || "Read More"}</span>
                      <ArrowRight className="size-3.5" aria-hidden />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}
