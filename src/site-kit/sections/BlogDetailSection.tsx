import { useState } from "react";
import { Check, Copy, Sparkles, User } from "lucide-react";
import { parseRichText, SectionShell, SiteImage } from "../primitives.tsx";
import type { BlogContentSection, BlogDetailData, SectionOf } from "../types.ts";

function ShareBar({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`;

  return (
    <div className="wb-blog-share-dock" aria-label="Share article">
      <a
        href={tweetUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X / Twitter"
        className="wb-blog-share-btn"
      >
        <svg className="size-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className="wb-blog-share-btn"
      >
        <svg className="size-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v7.6h2.79v-7.6H6.46M7.86 6.88a1.45 1.45 0 0 0-1.45 1.45 1.45 1.45 0 0 0 1.45 1.45 1.45 1.45 0 0 0 1.45-1.45c0-.8-.65-1.45-1.45-1.45" />
        </svg>
      </a>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy link to article"
        className="wb-blog-share-btn"
      >
        {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
      </button>
    </div>
  );
}

function ArticleProse({
  content,
  tags,
  author,
  showAuthorBio,
}: {
  content: BlogContentSection[];
  tags?: string[];
  author?: {
    name: string;
    role?: string;
    avatar?: { url: string; alt: string };
    bio?: string;
  };
  showAuthorBio?: boolean;
}) {
  return (
    <div className="wb-blog-prose">
      {content.map((sec, idx) => (
        <div key={idx} className="mb-8">
          {sec.heading && <h2>{parseRichText(sec.heading)}</h2>}
          {sec.subheading && <h3>{parseRichText(sec.subheading)}</h3>}

          {sec.paragraphs.map((p, pIdx) => (
            <p key={pIdx}>{parseRichText(p)}</p>
          ))}

          {sec.quote && (
            <blockquote className="wb-blog-blockquote">
              <p>"{parseRichText(sec.quote)}"</p>
              {sec.quoteAuthor && (
                <footer className="mt-2 text-sm font-semibold not-italic text-zinc-600 dark:text-zinc-400">
                  — {sec.quoteAuthor}
                </footer>
              )}
            </blockquote>
          )}

          {sec.callout && (
            <div className="wb-blog-callout">
              <div className="wb-blog-callout-title">
                <Sparkles className="size-4" /> Key Takeaway
              </div>
              <p className="m-0 text-sm">{parseRichText(sec.callout)}</p>
            </div>
          )}

          {sec.image?.url && (
            <div className="my-6 overflow-hidden rounded-xl">
              <SiteImage image={sec.image} className="w-full object-cover" />
            </div>
          )}
        </div>
      ))}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="wb-blog-tags">
          {tags.map((tag, i) => (
            <span key={i} className="wb-blog-tag">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Author Bio Box */}
      {showAuthorBio && author && (
        <div className="wb-blog-author-box">
          {author.avatar?.url ? (
            <SiteImage image={author.avatar} className="wb-blog-author-box-avatar" />
          ) : (
            <div className="grid size-16 place-items-center rounded-full bg-zinc-200 text-zinc-500">
              <User className="size-8" />
            </div>
          )}
          <div>
            <h4 className="wb-blog-author-box-name">{author.name}</h4>
            {author.role && <div className="wb-blog-author-box-role">{author.role}</div>}
            {author.bio && <p className="wb-blog-author-box-bio">{author.bio}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BlogDetailSection({ section }: { section: SectionOf<"blog_detail"> }) {
  const data = section.data as BlogDetailData;
  const design = data.design || "minimalist-editorial";

  const authorObj = {
    name: data.authorName,
    role: data.authorRole,
    avatar: data.authorAvatar,
    bio: data.authorBio,
  };

  return (
    <SectionShell sectionId={section.id} settings={section.settings}>
      <article className="wb-blog-detail">
        {/* ====================================================================
            DESIGN 1: MINIMALIST EDITORIAL (ARKITECT / SCREENSHOT 2 STYLE)
            ==================================================================== */}
        {design === "minimalist-editorial" && (
          <div className="wb-blog-minimalist-editorial">
            <header className="wb-blog-minimalist-header">
              {data.category && <span className="wb-blog-pill">{data.category}</span>}
              <h1 className="wb-blog-minimalist-title">{parseRichText(data.title)}</h1>
              {data.subtitle && <p className="wb-blog-minimalist-deck">{parseRichText(data.subtitle)}</p>}

              <div className="wb-blog-minimalist-meta">
                <div className="wb-blog-meta-item">
                  <span className="wb-blog-meta-label">Date</span>
                  <span className="wb-blog-meta-val">{data.date}</span>
                </div>
                <div className="wb-blog-meta-item">
                  <span className="wb-blog-meta-label">Author</span>
                  <span className="wb-blog-meta-val">{data.authorName}</span>
                </div>
                <div className="wb-blog-meta-item">
                  <span className="wb-blog-meta-label">Read</span>
                  <span className="wb-blog-meta-val">{data.readTime}</span>
                </div>
              </div>
            </header>

            {data.coverImage?.url && (
              <figure className="wb-blog-minimalist-hero-img-wrap">
                <SiteImage image={data.coverImage} className="wb-blog-minimalist-hero-img" />
                {data.coverImageCaption && (
                  <figcaption className="p-3 text-center text-xs text-zinc-500 italic">
                    {data.coverImageCaption}
                  </figcaption>
                )}
              </figure>
            )}

            <div className="wb-blog-minimalist-body-wrap">
              {data.showShareButtons !== false ? <ShareBar title={data.title} /> : <div />}
              <ArticleProse
                content={data.content || []}
                tags={data.tags}
                author={authorObj}
                showAuthorBio={data.showAuthorBio !== false}
              />
            </div>
          </div>
        )}

        {/* ====================================================================
            DESIGN 2: SPLIT HERO HEADER
            ==================================================================== */}
        {design === "split-hero" && (
          <div className="wb-blog-split-hero">
            <div className="wb-blog-split-banner">
              <div>
                {data.category && <span className="wb-blog-pill mb-3">{data.category}</span>}
                <h1 className="wb-blog-split-title">{parseRichText(data.title)}</h1>
                {data.subtitle && <p className="wb-blog-split-deck">{parseRichText(data.subtitle)}</p>}

                <div className="wb-blog-split-author-bar">
                  {data.authorAvatar?.url ? (
                    <SiteImage image={data.authorAvatar} className="wb-blog-split-author-avatar" />
                  ) : (
                    <div className="grid size-11 place-items-center rounded-full bg-zinc-200 text-zinc-600">
                      <User className="size-5" />
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{data.authorName}</div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span>{data.date}</span>
                      <span>•</span>
                      <span>{data.readTime}</span>
                    </div>
                  </div>
                </div>
              </div>

              {data.coverImage?.url && (
                <div className="wb-blog-split-img-frame">
                  <SiteImage image={data.coverImage} className="wb-blog-split-img" />
                </div>
              )}
            </div>

            <div className="wb-blog-split-body">
              <ArticleProse
                content={data.content || []}
                tags={data.tags}
                author={authorObj}
                showAuthorBio={data.showAuthorBio !== false}
              />
            </div>
          </div>
        )}

        {/* ====================================================================
            DESIGN 3: IMMERSIVE DARK FULL-BLEED HERO
            ==================================================================== */}
        {design === "immersive-dark" && (
          <div className="wb-blog-immersive-dark">
            <header className="wb-blog-immersive-hero">
              {data.coverImage?.url && (
                <img src={data.coverImage.url} alt="" className="wb-blog-immersive-hero-bg" aria-hidden />
              )}
              <div className="wb-blog-immersive-hero-gradient" />

              <div className="wb-blog-immersive-hero-content">
                {data.category && <span className="wb-blog-pill bg-white/20 text-white">{data.category}</span>}
                <h1 className="wb-blog-immersive-title">{parseRichText(data.title)}</h1>
                {data.subtitle && <p className="wb-blog-immersive-deck">{parseRichText(data.subtitle)}</p>}

                <div className="wb-blog-immersive-meta-pill">
                  <span>By {data.authorName}</span>
                  <span>•</span>
                  <span>{data.date}</span>
                  <span>•</span>
                  <span>{data.readTime}</span>
                </div>
              </div>
            </header>

            {data.coverImage?.url && (
              <div className="wb-blog-immersive-featured-wrap">
                <SiteImage image={data.coverImage} className="wb-blog-immersive-featured-img" />
              </div>
            )}

            <div className="wb-blog-immersive-body">
              <ArticleProse
                content={data.content || []}
                tags={data.tags}
                author={authorObj}
                showAuthorBio={data.showAuthorBio !== false}
              />
            </div>
          </div>
        )}

        {/* ====================================================================
            DESIGN 4: MAGAZINE / GAZETTE CLASSIC (PRINT EDITORIAL)
            ==================================================================== */}
        {design === "magazine-classic" && (
          <div className="wb-blog-magazine-classic">
            {data.category && <div className="wb-blog-magazine-kicker">{data.category}</div>}
            <h1 className="wb-blog-magazine-title">{parseRichText(data.title)}</h1>
            {data.subtitle && <p className="wb-blog-magazine-deck">{parseRichText(data.subtitle)}</p>}
            <div className="wb-blog-magazine-rule" />

            <div className="wb-blog-magazine-layout">
              <aside className="wb-blog-magazine-sidebar">
                <div className="wb-blog-magazine-author-card">
                  <div className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">Byline</div>
                  <div className="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100">{data.authorName}</div>
                  {data.authorRole && <div className="text-xs text-primary">{data.authorRole}</div>}
                  <div className="mt-3 border-t border-zinc-200 pt-3 text-xs text-zinc-500 dark:border-zinc-800">
                    <div>Published: {data.date}</div>
                    <div>Reading time: {data.readTime}</div>
                  </div>
                </div>

                {data.showShareButtons !== false && (
                  <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <div className="mb-2 text-xs font-bold uppercase text-zinc-500">Share Story</div>
                    <ShareBar title={data.title} />
                  </div>
                )}
              </aside>

              <main className="wb-blog-magazine-main">
                {data.coverImage?.url && (
                  <div className="mb-8 overflow-hidden rounded-xl">
                    <SiteImage image={data.coverImage} className="w-full object-cover max-h-[460px]" />
                  </div>
                )}
                <ArticleProse
                  content={data.content || []}
                  tags={data.tags}
                  author={authorObj}
                  showAuthorBio={false}
                />
              </main>
            </div>
          </div>
        )}

        {/* ====================================================================
            DESIGN 5: NEWSLETTER / SUBSTACK TECH STYLE
            ==================================================================== */}
        {design === "newsletter-tech" && (
          <div className="wb-blog-newsletter-tech">
            <div className="wb-blog-tech-container">
              {data.category && <span className="wb-blog-pill mb-3">{data.category}</span>}
              <h1 className="wb-blog-tech-title">{parseRichText(data.title)}</h1>
              {data.subtitle && <p className="wb-blog-tech-deck">{parseRichText(data.subtitle)}</p>}

              <div className="wb-blog-tech-author-bar">
                <div className="wb-blog-tech-author-left">
                  {data.authorAvatar?.url ? (
                    <SiteImage image={data.authorAvatar} className="wb-blog-tech-avatar" />
                  ) : (
                    <div className="grid size-12 place-items-center rounded-full bg-zinc-200 text-zinc-600">
                      <User className="size-6" />
                    </div>
                  )}
                  <div>
                    <div className="wb-blog-tech-name">{data.authorName}</div>
                    <div className="wb-blog-tech-meta">
                      {data.date} • {data.readTime}
                    </div>
                  </div>
                </div>

                {data.showShareButtons !== false && <ShareBar title={data.title} />}
              </div>

              {data.coverImage?.url && (
                <div className="wb-blog-tech-img-wrap">
                  <SiteImage image={data.coverImage} className="wb-blog-tech-img" />
                  {data.coverImageCaption && (
                    <p className="wb-blog-tech-caption">{data.coverImageCaption}</p>
                  )}
                </div>
              )}

              <ArticleProse
                content={data.content || []}
                tags={data.tags}
                author={authorObj}
                showAuthorBio={data.showAuthorBio !== false}
              />
            </div>
          </div>
        )}

        {/* ====================================================================
            DESIGN 6: FLOATING OVERLAPPING CARD
            ==================================================================== */}
        {design === "floating-card" && (
          <div className="wb-blog-floating-card">
            <div className="wb-blog-floating-hero">
              {data.coverImage?.url && (
                <SiteImage image={data.coverImage} className="wb-blog-floating-hero-img" />
              )}
            </div>

            <div className="wb-blog-floating-card-box">
              {data.category && <span className="wb-blog-pill">{data.category}</span>}
              <h1 className="wb-blog-floating-title">{parseRichText(data.title)}</h1>
              {data.subtitle && <p className="text-zinc-600 text-base dark:text-zinc-400">{parseRichText(data.subtitle)}</p>}

              <div className="mt-4 flex items-center justify-center gap-3 text-xs text-zinc-500">
                <span>By {data.authorName}</span>
                <span>•</span>
                <span>{data.date}</span>
                <span>•</span>
                <span>{data.readTime}</span>
              </div>
            </div>

            <div className="wb-blog-floating-body">
              <ArticleProse
                content={data.content || []}
                tags={data.tags}
                author={authorObj}
                showAuthorBio={data.showAuthorBio !== false}
              />
            </div>
          </div>
        )}

        {/* ====================================================================
            DESIGN 7: STICKY SIDEBAR (TABLE OF CONTENTS)
            ==================================================================== */}
        {design === "sticky-sidebar" && (
          <div className="wb-blog-sticky-sidebar">
            <header className="wb-blog-sticky-header">
              {data.category && <span className="wb-blog-pill mb-2">{data.category}</span>}
              <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mb-3">
                {parseRichText(data.title)}
              </h1>
              {data.subtitle && <p className="text-lg text-zinc-500 mb-4">{parseRichText(data.subtitle)}</p>}
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <span>{data.authorName}</span>
                <span>•</span>
                <span>{data.date}</span>
                <span>•</span>
                <span>{data.readTime}</span>
              </div>
            </header>

            <div className="wb-blog-sticky-grid">
              <div>
                {data.coverImage?.url && (
                  <div className="mb-8 overflow-hidden rounded-2xl">
                    <SiteImage image={data.coverImage} className="w-full object-cover max-h-[480px]" />
                  </div>
                )}
                <ArticleProse
                  content={data.content || []}
                  tags={data.tags}
                  author={authorObj}
                  showAuthorBio={data.showAuthorBio !== false}
                />
              </div>

              <aside className="wb-blog-sticky-side">
                {/* Outline */}
                <div className="wb-blog-toc-widget">
                  <div className="wb-blog-toc-title">Article Outline</div>
                  <div className="wb-blog-toc-list">
                    {(data.content || []).map((sec, i) =>
                      sec.heading ? (
                        <div key={i} className="wb-blog-toc-item">
                          • {sec.heading}
                        </div>
                      ) : null,
                    )}
                  </div>
                </div>

                {/* Author Card */}
                {authorObj.name && (
                  <div className="wb-blog-toc-widget">
                    <div className="wb-blog-toc-title">Author</div>
                    <div className="flex items-center gap-3">
                      {authorObj.avatar?.url ? (
                        <SiteImage image={authorObj.avatar} className="size-10 rounded-full object-cover" />
                      ) : (
                        <div className="grid size-10 place-items-center rounded-full bg-zinc-200">
                          <User className="size-5" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{authorObj.name}</div>
                        {authorObj.role && <div className="text-xs text-primary">{authorObj.role}</div>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Share */}
                {data.showShareButtons !== false && (
                  <div className="wb-blog-toc-widget">
                    <div className="wb-blog-toc-title">Share Article</div>
                    <ShareBar title={data.title} />
                  </div>
                )}
              </aside>
            </div>
          </div>
        )}

        {/* ====================================================================
            DESIGN 8: SWISS BRUTALIST (HIGH CONTRAST GRID)
            ==================================================================== */}
        {design === "swiss-brutalist" && (
          <div className="wb-blog-swiss-brutalist">
            <div className="wb-blog-swiss-frame">
              <div className="wb-blog-swiss-top">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
                  [{data.category || "ARTICLE"}]
                </span>
                <h1 className="wb-blog-swiss-title">{parseRichText(data.title)}</h1>
                {data.subtitle && <p className="font-mono text-sm text-zinc-600 dark:text-zinc-400">{parseRichText(data.subtitle)}</p>}
              </div>

              <div className="wb-blog-swiss-table-meta">
                <div className="wb-blog-swiss-cell">
                  <span className="wb-blog-swiss-cell-lbl">CATEGORY</span>
                  <div className="wb-blog-swiss-cell-val">{data.category}</div>
                </div>
                <div className="wb-blog-swiss-cell">
                  <span className="wb-blog-swiss-cell-lbl">DATE</span>
                  <div className="wb-blog-swiss-cell-val">{data.date}</div>
                </div>
                <div className="wb-blog-swiss-cell">
                  <span className="wb-blog-swiss-cell-lbl">AUTHOR</span>
                  <div className="wb-blog-swiss-cell-val">{data.authorName}</div>
                </div>
                <div className="wb-blog-swiss-cell">
                  <span className="wb-blog-swiss-cell-lbl">READ TIME</span>
                  <div className="wb-blog-swiss-cell-val">{data.readTime}</div>
                </div>
              </div>

              {data.coverImage?.url && (
                <div className="wb-blog-swiss-img-wrap">
                  <SiteImage image={data.coverImage} className="wb-blog-swiss-img" />
                </div>
              )}

              <div className="wb-blog-swiss-body">
                <ArticleProse
                  content={data.content || []}
                  tags={data.tags}
                  author={authorObj}
                  showAuthorBio={data.showAuthorBio !== false}
                />
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            DESIGN 9: CINEMATIC VISUAL STORY / PHOTO ESSAY
            ==================================================================== */}
        {design === "visual-story" && (
          <div className="wb-blog-visual-story">
            <div className="wb-blog-visual-hero">
              {data.coverImage?.url && (
                <SiteImage image={data.coverImage} className="wb-blog-visual-hero-img" />
              )}
              <div className="wb-blog-visual-hero-overlay">
                {data.category && (
                  <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-white/25 backdrop-blur-md mb-2">
                    {data.category}
                  </span>
                )}
                <h1 className="wb-blog-visual-title">{parseRichText(data.title)}</h1>
                <div className="flex items-center gap-3 text-xs text-white/80">
                  <span>Photo & Story by {data.authorName}</span>
                  <span>•</span>
                  <span>{data.date}</span>
                  <span>•</span>
                  <span>{data.readTime}</span>
                </div>
              </div>
            </div>

            <div className="wb-blog-visual-body">
              {data.subtitle && (
                <div className="wb-blog-visual-quote-breakout">
                  "{parseRichText(data.subtitle)}"
                </div>
              )}

              <ArticleProse
                content={data.content || []}
                tags={data.tags}
                author={authorObj}
                showAuthorBio={data.showAuthorBio !== false}
              />
            </div>
          </div>
        )}

        {/* ====================================================================
            DESIGN 10: CREATIVE GLASSMORPHISM DECK
            ==================================================================== */}
        {design === "glassmorphism-deck" && (
          <div className="wb-blog-glassmorphism-deck">
            <div className="wb-blog-glass-card">
              <div className="text-center">
                {data.category && <span className="wb-blog-pill mb-3">{data.category}</span>}
                <h1 className="wb-blog-glass-title">{parseRichText(data.title)}</h1>
                {data.subtitle && (
                  <p className="text-zinc-600 text-lg dark:text-zinc-400 max-w-xl mx-auto">
                    {parseRichText(data.subtitle)}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-center gap-3 text-xs text-zinc-500">
                  <span>Written by {data.authorName}</span>
                  <span>•</span>
                  <span>{data.date}</span>
                  <span>•</span>
                  <span>{data.readTime}</span>
                </div>
              </div>

              {data.coverImage?.url && (
                <SiteImage image={data.coverImage} className="wb-blog-glass-featured-img" />
              )}

              <div className="max-w-2xl mx-auto">
                <ArticleProse
                  content={data.content || []}
                  tags={data.tags}
                  author={authorObj}
                  showAuthorBio={data.showAuthorBio !== false}
                />
              </div>
            </div>
          </div>
        )}
      </article>
    </SectionShell>
  );
}
