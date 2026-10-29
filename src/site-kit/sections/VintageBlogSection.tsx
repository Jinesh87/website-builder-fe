import { useState, useMemo, type FormEvent } from "react";
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

function matchCategory(postCategory?: string, selected?: string): boolean {
  if (!selected || selected.toUpperCase() === "ALL") return true;
  if (!postCategory) return false;
  const p = postCategory.toUpperCase();
  const s = selected.toUpperCase();
  if (p === s) return true;
  const stemS = s.endsWith("S") ? s.slice(0, -1) : s;
  const stemP = p.endsWith("S") ? p.slice(0, -1) : p;
  return p.includes(stemS) || s.includes(stemP);
}

function renderVintageBlogTitle(title: string, italicTitle?: string) {
  if (italicTitle && italicTitle.trim()) {
    const raw = title.replace(italicTitle, "").trim();
    return (
      <>
        {raw} <em className="wb-vr-blog-title-accent">{italicTitle}</em>
      </>
    );
  }
  if (title.includes("<em>") || title.includes("</em>")) {
    return parseRichText(title);
  }
  const lower = title.toLowerCase();
  const target = "cutting room";
  const idx = lower.indexOf(target);
  if (idx !== -1) {
    const before = title.slice(0, idx);
    const matched = title.slice(idx, idx + target.length);
    const after = title.slice(idx + target.length);
    return (
      <>
        {before}
        <em className="wb-vr-blog-title-accent">{matched}</em>
        {after}
      </>
    );
  }
  return parseRichText(title);
}

export default function VintageBlogSection({
  section,
}: {
  section: SectionOf<"blog">;
}) {
  const data = section.data as BlogData;
  const posts = data.posts || [];

  const categories = useMemo(() => {
    const raw = data.categories && data.categories.length > 0
      ? data.categories
      : ["ALL", "TRENDS", "GUIDES", "CRAFT"];
    const hasAll = raw.some((c) => c.toUpperCase() === "ALL");
    return hasAll ? raw : ["ALL", ...raw];
  }, [data.categories]);

  const [activeCategory, setActiveCategory] = useState<string>(categories[0] || "ALL");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const filteredPosts = useMemo(() => {
    if (activeCategory.toUpperCase() === "ALL") return posts;
    return posts.filter((p) => matchCategory(p.category, activeCategory));
  }, [posts, activeCategory]);

  // Featured post: explicit featured flag, or first post if layout has > 3 posts
  const featuredPost = useMemo(() => {
    const explicit = posts.find((p) => p.featured);
    if (explicit) return explicit;
    // Default to first post as featured hero banner if there are 4+ posts
    if (posts.length >= 4) return posts[0];
    return undefined;
  }, [posts]);

  // Grid posts: if a post is marked featured and also duplicated in grid, show distinct grid items
  const gridPosts = useMemo(() => {
    if (!featuredPost) return filteredPosts;
    // If the explicit featured post is in filteredPosts and we have other posts,
    // only exclude if posts list has more than 6 items or explicitly flagged
    const hasExplicitFlag = posts.some((p) => p.featured);
    if (hasExplicitFlag && posts.length > 6) {
      return filteredPosts.filter((p) => p.id !== featuredPost.id);
    }
    return filteredPosts;
  }, [filteredPosts, featuredPost, posts]);

  const handleNewsletterSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
    }
  };

  const showNewsletter = data.showNewsletterCard !== false;

  return (
    <SectionShell
      sectionId={section.id}
      settings={section.settings}
      className="wb-blog-vintage-journal"
      label={data.title || data.eyebrow || "Blog"}
      fullWidth
    >
      <div className="wb-container wb-vr-blog-container">
        {/* Section Header */}
        <header className="wb-vr-blog-header">
          {data.eyebrow && (
            <span className="wb-vr-blog-eyebrow">
              {parseRichText(data.eyebrow)}
            </span>
          )}

          <h1 className="wb-vr-blog-title">
            {renderVintageBlogTitle(data.title || "Notes from the cutting room", data.italicTitle)}
          </h1>

          {data.subtitle && (
            <p className="wb-vr-blog-subtitle">{parseRichText(data.subtitle)}</p>
          )}

          {/* Category Filter Pills */}
          {categories.length > 1 && (
            <div className="wb-vr-blog-filters" role="tablist" aria-label="Blog categories">
              {categories.map((cat) => {
                const isActive = activeCategory.toUpperCase() === cat.toUpperCase();
                return (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveCategory(cat)}
                    className={`wb-vr-blog-filter-btn ${isActive ? "active" : ""}`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}
        </header>

        {/* Featured Hero Banner Card */}
        {featuredPost && (
          <a
            href={formatBlogHref(featuredPost.slug)}
            className="wb-vr-blog-featured-card"
            aria-label={featuredPost.title}
          >
            <div className="wb-vr-blog-featured-media">
              {featuredPost.coverImage?.url && (
                <SiteImage
                  image={featuredPost.coverImage}
                  className="wb-vr-blog-featured-img"
                  contextText={featuredPost.title}
                />
              )}
              <div className="wb-vr-blog-featured-overlay" aria-hidden="true" />
              <div className="wb-vr-blog-featured-content">
                <span className="wb-vr-blog-featured-tag">
                  FEATURED • {featuredPost.category || "TRENDS"} • {featuredPost.readTime || "4 MIN READ"}
                </span>
                <h2 className="wb-vr-blog-featured-title">
                  {featuredPost.title}
                </h2>
              </div>
            </div>
          </a>
        )}

        {/* 3-Column Articles Grid */}
        <div className="wb-vr-blog-grid">
          {gridPosts.map((post) => {
            const href = formatBlogHref(post.slug);
            return (
              <article key={post.id} className="wb-vr-blog-card">
                <a href={href} className="wb-vr-blog-card-link" aria-label={post.title}>
                  <div className="wb-vr-blog-card-media">
                    {post.coverImage?.url ? (
                      <SiteImage
                        image={post.coverImage}
                        className="wb-vr-blog-card-img"
                        contextText={post.title}
                      />
                    ) : (
                      <div className="wb-vr-blog-card-placeholder" aria-hidden="true" />
                    )}
                  </div>
                  <div className="wb-vr-blog-card-body">
                    <span className="wb-vr-blog-card-tag">
                      {post.category || "CRAFT"} • {post.readTime || "4 MIN"}
                    </span>
                    <h3 className="wb-vr-blog-card-title">{post.title}</h3>
                    {post.excerpt && (
                      <p className="wb-vr-blog-card-excerpt">{post.excerpt}</p>
                    )}
                  </div>
                </a>
              </article>
            );
          })}
        </div>

        {/* Newsletter Subscription Strip */}
        {showNewsletter && (
          <div className="wb-vr-blog-newsletter">
            <h3 className="wb-vr-newsletter-title">
              {data.newsletterTitle || "Get new articles in your inbox"}
            </h3>

            {newsletterSubscribed ? (
              <div className="wb-vr-newsletter-success">
                <span>✓ Thanks for subscribing! You're on the list.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="wb-vr-newsletter-form">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder={data.newsletterPlaceholder || "Your email address"}
                  className="wb-vr-newsletter-input"
                  aria-label="Email address for newsletter"
                />
                <button type="submit" className="wb-vr-newsletter-btn">
                  {data.newsletterButtonText || "SUBSCRIBE"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </SectionShell>
  );
}
