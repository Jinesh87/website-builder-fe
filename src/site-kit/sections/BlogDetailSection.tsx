import { Fragment, useState, type CSSProperties } from "react";
import { Check, Copy, Mail, Sparkles, User } from "lucide-react";
import { mailtoHref, safeHref } from "../links.ts";
import { parseRichText, SectionShell, SiteImage, SocialIcon } from "../primitives.tsx";
import {
  DEFAULT_BLOG_SHARE_PLATFORMS,
  type BlogContentSection,
  type BlogDetailData,
  type BlogSharePlatform,
  type BlogSocialLink,
  type BlogSocialPlatform,
  type ImageRef,
  type SectionOf,
} from "../types.ts";

type BlogAuthor = {
  name?: string;
  role?: string;
  avatar?: ImageRef;
  bio?: string;
  socialLinks?: BlogSocialLink[];
};

type ShareConfig = { title: string; platforms: readonly BlogSharePlatform[] };
type FollowConfig = { title: string; links: BlogSocialLink[] };

const PLATFORM_LABELS: Record<BlogSocialPlatform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  twitter: "X / Twitter",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  tiktok: "TikTok",
  threads: "Threads",
  pinterest: "Pinterest",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  github: "GitHub",
  website: "Website",
  email: "Email",
};

/** Where a bare handle ("@jane" or "jane") points for each platform. */
const HANDLE_PROFILE_BASE: Partial<Record<BlogSocialPlatform, string>> = {
  linkedin: "https://www.linkedin.com/in/",
  twitter: "https://x.com/",
  instagram: "https://www.instagram.com/",
  facebook: "https://www.facebook.com/",
  youtube: "https://www.youtube.com/@",
  tiktok: "https://www.tiktok.com/@",
  threads: "https://www.threads.net/@",
  pinterest: "https://www.pinterest.com/",
  telegram: "https://t.me/",
  github: "https://github.com/",
};

const PHONE = /^\+?[0-9][0-9 ()-]{5,}$/;

function socialHref({ platform, url }: BlogSocialLink): string | null {
  const value = url?.trim() ?? "";
  if (!value) return null;
  if (/^mailto:/i.test(value)) return value;
  if (platform === "email") return mailtoHref(value);
  if (/^https?:\/\//i.test(value)) return value;
  if (platform === "whatsapp" && PHONE.test(value)) return `https://wa.me/${value.replace(/\D/g, "")}`;
  if (value.includes(":")) return null;

  const base = HANDLE_PROFILE_BASE[platform];
  const isHandle = value.startsWith("@") || (!value.includes(".") && !value.includes("/"));
  if (base && isHandle) return base + value.replace(/^@/, "");
  return `https://${value.replace(/^\/+/, "")}`;
}

function hasText(value: string | undefined): value is string {
  return Boolean(value?.trim());
}

function hasAuthorDetails(author: BlogAuthor): boolean {
  return (
    hasText(author.name) ||
    hasText(author.role) ||
    hasText(author.bio) ||
    Boolean(author.avatar?.url) ||
    (author.socialLinks ?? []).some((link) => socialHref(link))
  );
}

/** Non-empty values joined with "•", so missing fields never leave stray separators. */
function MetaList({ items }: { items: (string | false | undefined)[] }) {
  const parts = items.filter((item): item is string => typeof item === "string" && hasText(item));
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {i > 0 && <span aria-hidden="true">•</span>}
          <span>{part}</span>
        </Fragment>
      ))}
    </>
  );
}

function hasMeta(items: (string | false | undefined)[]): boolean {
  return items.some((item) => typeof item === "string" && hasText(item));
}

/** Brand marks missing from `SocialIcon`; everything else falls through to it. */
const EXTRA_BRAND_PATHS: Partial<Record<BlogSocialPlatform, string>> = {
  tiktok:
    "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  threads:
    "M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z",
  whatsapp:
    "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z",
  telegram:
    "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z",
};

function BrandIcon({ platform }: { platform: BlogSocialPlatform }) {
  if (platform === "email") return <Mail aria-hidden="true" />;
  const path = EXTRA_BRAND_PATHS[platform];
  if (path) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d={path} />
      </svg>
    );
  }
  return <SocialIcon platform={platform} />;
}

/** Clickable profile buttons; links without a usable address are skipped. */
function SocialLinks({
  links,
  className,
  label = "Social links",
}: {
  links?: BlogSocialLink[];
  className?: string;
  label?: string;
}) {
  const resolved = (links ?? [])
    .map((link) => ({ link, href: socialHref(link) }))
    .filter((entry): entry is { link: BlogSocialLink; href: string } => Boolean(entry.href));
  if (resolved.length === 0) return null;

  return (
    <div className={`wb-blog-author-socials ${className ?? ""}`} aria-label={label}>
      {resolved.map(({ link, href }, i) => {
        const name = PLATFORM_LABELS[link.platform] ?? link.platform;
        const isMail = href.startsWith("mailto:");
        return (
          <a
            key={i}
            href={safeHref(href)}
            target={isMail ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="wb-blog-author-social-btn"
            aria-label={name}
            title={name}
          >
            <BrandIcon platform={link.platform} />
          </a>
        );
      })}
    </div>
  );
}

function hasSocialLinks(links: BlogSocialLink[] | undefined): links is BlogSocialLink[] {
  return (links ?? []).some((link) => socialHref(link));
}

const SHARE_LABELS: Record<BlogSharePlatform, string> = {
  twitter: "Share on X / Twitter",
  linkedin: "Share on LinkedIn",
  facebook: "Share on Facebook",
  whatsapp: "Share on WhatsApp",
  telegram: "Share on Telegram",
  pinterest: "Share on Pinterest",
  email: "Share by email",
  copy: "Copy link to article",
};

function shareHref(platform: Exclude<BlogSharePlatform, "copy">, title: string, pageUrl: string): string {
  const url = encodeURIComponent(pageUrl);
  const text = encodeURIComponent(title);
  switch (platform) {
    case "twitter":
      return `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    case "whatsapp":
      return `https://wa.me/?text=${encodeURIComponent(`${title} ${pageUrl}`.trim())}`;
    case "telegram":
      return `https://t.me/share/url?url=${url}&text=${text}`;
    case "pinterest":
      return `https://pinterest.com/pin/create/button/?url=${url}&description=${text}`;
    case "email":
      return `mailto:?subject=${text}&body=${url}`;
  }
}

function ShareBar({
  title,
  platforms,
  direction = "column",
}: ShareConfig & { direction?: "column" | "row" }) {
  const [copied, setCopied] = useState(false);
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`wb-blog-share-dock${direction === "row" ? " is-row" : ""}`} aria-label="Share article">
      {platforms.map((platform) =>
        platform === "copy" ? (
          <button
            key={platform}
            type="button"
            onClick={handleCopy}
            aria-label={SHARE_LABELS.copy}
            title={SHARE_LABELS.copy}
            className="wb-blog-share-btn"
          >
            {copied ? <Check className="text-emerald-600" /> : <Copy />}
          </button>
        ) : (
          <a
            key={platform}
            href={shareHref(platform, title, pageUrl)}
            target={platform === "email" ? undefined : "_blank"}
            rel="noopener noreferrer"
            aria-label={SHARE_LABELS[platform]}
            title={SHARE_LABELS[platform]}
            className="wb-blog-share-btn"
          >
            <BrandIcon platform={platform} />
          </a>
        ),
      )}
    </div>
  );
}

const AVATAR_PLACEHOLDER = {
  sm: { box: "size-10", icon: "size-5" },
  md: { box: "size-11", icon: "size-5" },
  lg: { box: "size-12", icon: "size-6" },
  xl: { box: "size-16", icon: "size-8" },
} as const;

function AuthorAvatar({
  author,
  className,
  size,
}: {
  author: BlogAuthor;
  className: string;
  size: keyof typeof AVATAR_PLACEHOLDER;
}) {
  const placeholder = AVATAR_PLACEHOLDER[size];
  return author.avatar?.url ? (
    <SiteImage image={author.avatar} className={className} />
  ) : (
    <div className={`grid shrink-0 place-items-center rounded-full bg-zinc-200 text-zinc-500 ${placeholder.box}`}>
      <User className={placeholder.icon} />
    </div>
  );
}

function ArticleProse({
  content,
  tags,
  author,
  showAuthorBio,
  share,
  follow,
}: {
  content: BlogContentSection[];
  tags?: string[];
  author: BlogAuthor;
  showAuthorBio: boolean;
  /** Renders a share row after the article; leave unset when the layout places its own share bar. */
  share?: ShareConfig;
  /** Renders the profile links row after the article; leave unset when the layout shows them elsewhere. */
  follow?: FollowConfig;
}) {
  const visibleTags = (tags ?? []).filter(hasText);

  return (
    <div className="wb-blog-prose">
      {content.map((sec, idx) => (
        <div key={idx} className="mb-8">
          {sec.heading && <h2>{parseRichText(sec.heading)}</h2>}
          {sec.subheading && <h3>{parseRichText(sec.subheading)}</h3>}

          {(sec.paragraphs ?? []).filter(hasText).map((p, pIdx) => (
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

      {visibleTags.length > 0 && (
        <div className="wb-blog-tags">
          {visibleTags.map((tag, i) => (
            <span key={i} className="wb-blog-tag">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {share && (
        <div className="wb-blog-share-row">
          <span className="wb-blog-share-row-label">Share this article</span>
          <ShareBar {...share} direction="row" />
        </div>
      )}

      {follow && (
        <div className="wb-blog-share-row">
          <span className="wb-blog-share-row-label">{follow.title}</span>
          <SocialLinks links={follow.links} label={follow.title} />
        </div>
      )}

      {showAuthorBio && hasAuthorDetails(author) && (
        <div className="wb-blog-author-box">
          <AuthorAvatar author={author} className="wb-blog-author-box-avatar" size="xl" />
          <div className="min-w-0">
            {author.name && <h4 className="wb-blog-author-box-name">{author.name}</h4>}
            {author.role && <div className="wb-blog-author-box-role">{author.role}</div>}
            {author.bio && <p className="wb-blog-author-box-bio">{author.bio}</p>}
            <SocialLinks links={author.socialLinks} label="Author social links" className="wb-blog-socials-spaced" />
          </div>
        </div>
      )}
    </div>
  );
}

export default function BlogDetailSection({ section }: { section: SectionOf<"blog_detail"> }) {
  const data = section.data as BlogDetailData;
  const design = data.design || "minimalist-editorial";
  const title = data.title ?? "";
  const share: ShareConfig = {
    title,
    platforms: data.sharePlatforms ?? DEFAULT_BLOG_SHARE_PLATFORMS,
  };
  const showShare = data.showShareButtons !== false && share.platforms.length > 0;
  const showAuthorBio = data.showAuthorBio !== false;
  const follow: FollowConfig | undefined = hasSocialLinks(data.socialLinks)
    ? { title: data.socialLinksTitle?.trim() || "Follow us", links: data.socialLinks }
    : undefined;

  const author: BlogAuthor = {
    name: data.authorName,
    role: data.authorRole,
    avatar: data.authorAvatar,
    bio: data.authorBio,
    socialLinks: data.authorSocialLinks,
  };

  const proseProps = {
    content: data.content || [],
    tags: data.tags,
    author,
    showAuthorBio,
    follow,
  };
  /** For layouts without their own share bar, the share row goes after the article. */
  const proseShare = showShare ? share : undefined;

  const byline = (prefix?: string) => hasText(data.authorName) && (prefix ? `${prefix} ${data.authorName}` : data.authorName);

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
              <h1 className="wb-blog-minimalist-title">{parseRichText(title)}</h1>
              {data.subtitle && <p className="wb-blog-minimalist-deck">{parseRichText(data.subtitle)}</p>}

              {hasMeta([data.date, data.authorName, data.readTime]) && (
                <div className="wb-blog-minimalist-meta">
                  {hasText(data.date) && (
                    <div className="wb-blog-meta-item">
                      <span className="wb-blog-meta-label">Date</span>
                      <span className="wb-blog-meta-val">{data.date}</span>
                    </div>
                  )}
                  {hasText(data.authorName) && (
                    <div className="wb-blog-meta-item">
                      <span className="wb-blog-meta-label">Author</span>
                      <span className="wb-blog-meta-val">{data.authorName}</span>
                    </div>
                  )}
                  {hasText(data.readTime) && (
                    <div className="wb-blog-meta-item">
                      <span className="wb-blog-meta-label">Read</span>
                      <span className="wb-blog-meta-val">{data.readTime}</span>
                    </div>
                  )}
                </div>
              )}
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
              {showShare ? <ShareBar {...share} /> : <div />}
              <ArticleProse {...proseProps} />
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
                <h1 className="wb-blog-split-title">{parseRichText(title)}</h1>
                {data.subtitle && <p className="wb-blog-split-deck">{parseRichText(data.subtitle)}</p>}

                {hasMeta([data.authorName, data.date, data.readTime]) && (
                  <div className="wb-blog-split-author-bar">
                    <AuthorAvatar author={author} className="wb-blog-split-author-avatar" size="md" />
                    <div>
                      {hasText(data.authorName) && (
                        <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{data.authorName}</div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <MetaList items={[data.date, data.readTime]} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {data.coverImage?.url && (
                <div className="wb-blog-split-img-frame">
                  <SiteImage image={data.coverImage} className="wb-blog-split-img" />
                </div>
              )}
            </div>

            <div className="wb-blog-split-body">
              <ArticleProse {...proseProps} share={proseShare} />
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
                <h1 className="wb-blog-immersive-title">{parseRichText(title)}</h1>
                {data.subtitle && <p className="wb-blog-immersive-deck">{parseRichText(data.subtitle)}</p>}

                {hasMeta([data.authorName, data.date, data.readTime]) && (
                  <div className="wb-blog-immersive-meta-pill">
                    <MetaList items={[byline("By"), data.date, data.readTime]} />
                  </div>
                )}
              </div>
            </header>

            {data.coverImage?.url && (
              <div className="wb-blog-immersive-featured-wrap">
                <SiteImage image={data.coverImage} className="wb-blog-immersive-featured-img" />
              </div>
            )}

            <div className="wb-blog-immersive-body">
              <ArticleProse {...proseProps} share={proseShare} />
            </div>
          </div>
        )}

        {/* ====================================================================
            DESIGN 4: MAGAZINE / GAZETTE CLASSIC (PRINT EDITORIAL)
            The sidebar byline card is this layout's author box.
            ==================================================================== */}
        {design === "magazine-classic" &&
          (() => {
            const showByline = showAuthorBio && hasAuthorDetails(author);
            const showMeta = hasMeta([data.date, data.readTime]);
            const hasSidebar = showByline || showMeta || showShare || Boolean(follow);

            return (
              <div className="wb-blog-magazine-classic">
                {data.category && <div className="wb-blog-magazine-kicker">{data.category}</div>}
                <h1 className="wb-blog-magazine-title">{parseRichText(title)}</h1>
                {data.subtitle && <p className="wb-blog-magazine-deck">{parseRichText(data.subtitle)}</p>}
                <div className="wb-blog-magazine-rule" />

                <div className={`wb-blog-magazine-layout${hasSidebar ? "" : " is-full"}`}>
                  {hasSidebar && (
                    <aside className="wb-blog-magazine-sidebar">
                      {(showByline || showMeta) && (
                        <div className="wb-blog-magazine-author-card">
                          {showByline && (
                            <>
                              <div className="wb-blog-side-title">Byline</div>
                              {author.avatar?.url && (
                                <SiteImage image={author.avatar} className="wb-blog-byline-avatar" />
                              )}
                              {hasText(author.name) && <div className="wb-blog-byline-name">{author.name}</div>}
                              {author.role && <div className="wb-blog-byline-role">{author.role}</div>}
                              {author.bio && <p className="wb-blog-byline-bio">{author.bio}</p>}
                              <SocialLinks
                                links={author.socialLinks}
                                label="Author social links"
                                className="wb-blog-socials-spaced"
                              />
                            </>
                          )}
                          {showMeta && (
                            <div className={`wb-blog-byline-meta${showByline ? " has-divider" : ""}`}>
                              {hasText(data.date) && <div>Published: {data.date}</div>}
                              {hasText(data.readTime) && <div>Reading time: {data.readTime}</div>}
                            </div>
                          )}
                        </div>
                      )}

                      {showShare && (
                        <div className="wb-blog-side-box">
                          <div className="wb-blog-side-title">Share Story</div>
                          <ShareBar {...share} direction="row" />
                        </div>
                      )}

                      {follow && (
                        <div className="wb-blog-side-box">
                          <div className="wb-blog-side-title">{follow.title}</div>
                          <SocialLinks links={follow.links} label={follow.title} />
                        </div>
                      )}
                    </aside>
                  )}

                  <main className="wb-blog-magazine-main">
                    {data.coverImage?.url && (
                      <div className="mb-8 overflow-hidden rounded-xl">
                        <SiteImage image={data.coverImage} className="w-full object-cover max-h-[460px]" />
                      </div>
                    )}
                    <ArticleProse {...proseProps} showAuthorBio={false} follow={undefined} />
                  </main>
                </div>
              </div>
            );
          })()}

        {/* ====================================================================
            DESIGN 5: NEWSLETTER / SUBSTACK TECH STYLE
            ==================================================================== */}
        {design === "newsletter-tech" && (
          <div className="wb-blog-newsletter-tech">
            <div className="wb-blog-tech-container">
              {data.category && <span className="wb-blog-pill mb-3">{data.category}</span>}
              <h1 className="wb-blog-tech-title">{parseRichText(title)}</h1>
              {data.subtitle && <p className="wb-blog-tech-deck">{parseRichText(data.subtitle)}</p>}

              {(hasMeta([data.authorName, data.date, data.readTime]) || showShare) && (
                <div className="wb-blog-tech-author-bar">
                  {hasMeta([data.authorName, data.date, data.readTime]) ? (
                    <div className="wb-blog-tech-author-left">
                      <AuthorAvatar author={author} className="wb-blog-tech-avatar" size="lg" />
                      <div>
                        {hasText(data.authorName) && <div className="wb-blog-tech-name">{data.authorName}</div>}
                        <div className="wb-blog-tech-meta">
                          <MetaList items={[data.date, data.readTime]} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div />
                  )}

                  {showShare && <ShareBar {...share} direction="row" />}
                </div>
              )}

              {data.coverImage?.url && (
                <div className="wb-blog-tech-img-wrap">
                  <SiteImage image={data.coverImage} className="wb-blog-tech-img" />
                  {data.coverImageCaption && (
                    <p className="wb-blog-tech-caption">{data.coverImageCaption}</p>
                  )}
                </div>
              )}

              <ArticleProse {...proseProps} />
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
              <h1 className="wb-blog-floating-title">{parseRichText(title)}</h1>
              {data.subtitle && <p className="text-zinc-600 text-base dark:text-zinc-400">{parseRichText(data.subtitle)}</p>}

              {hasMeta([data.authorName, data.date, data.readTime]) && (
                <div className="mt-4 flex items-center justify-center gap-3 text-xs text-zinc-500">
                  <MetaList items={[byline("By"), data.date, data.readTime]} />
                </div>
              )}
            </div>

            <div className="wb-blog-floating-body">
              <ArticleProse {...proseProps} share={proseShare} />
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
                {parseRichText(title)}
              </h1>
              {data.subtitle && <p className="text-lg text-zinc-500 mb-4">{parseRichText(data.subtitle)}</p>}
              {hasMeta([data.authorName, data.date, data.readTime]) && (
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <MetaList items={[data.authorName, data.date, data.readTime]} />
                </div>
              )}
            </header>

            <div className="wb-blog-sticky-grid">
              <div>
                {data.coverImage?.url && (
                  <div className="mb-8 overflow-hidden rounded-2xl">
                    <SiteImage image={data.coverImage} className="w-full object-cover max-h-[480px]" />
                  </div>
                )}
                <ArticleProse {...proseProps} follow={undefined} />
              </div>

              <aside className="wb-blog-sticky-side">
                {(data.content || []).some((sec) => hasText(sec.heading)) && (
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
                )}

                {showAuthorBio && hasAuthorDetails(author) && (
                  <div className="wb-blog-toc-widget">
                    <div className="wb-blog-toc-title">Author</div>
                    <div className="flex items-center gap-3">
                      <AuthorAvatar author={author} className="size-10 rounded-full object-cover" size="sm" />
                      <div className="min-w-0">
                        {hasText(author.name) && (
                          <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{author.name}</div>
                        )}
                        {author.role && <div className="text-xs text-primary">{author.role}</div>}
                      </div>
                    </div>
                    <SocialLinks links={author.socialLinks} label="Author social links" className="wb-blog-socials-spaced" />
                  </div>
                )}

                {showShare && (
                  <div className="wb-blog-toc-widget">
                    <div className="wb-blog-toc-title">Share Article</div>
                    <ShareBar {...share} direction="row" />
                  </div>
                )}

                {follow && (
                  <div className="wb-blog-toc-widget">
                    <div className="wb-blog-toc-title">{follow.title}</div>
                    <SocialLinks links={follow.links} label={follow.title} />
                  </div>
                )}
              </aside>
            </div>
          </div>
        )}

        {/* ====================================================================
            DESIGN 8: SWISS BRUTALIST (HIGH CONTRAST GRID)
            ==================================================================== */}
        {design === "swiss-brutalist" &&
          (() => {
            const cells = [
              { label: "CATEGORY", value: data.category },
              { label: "DATE", value: data.date },
              { label: "AUTHOR", value: data.authorName },
              { label: "READ TIME", value: data.readTime },
            ].filter((cell) => hasText(cell.value));

            return (
              <div className="wb-blog-swiss-brutalist">
                <div className="wb-blog-swiss-frame">
                  <div className="wb-blog-swiss-top">
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
                      [{data.category || "ARTICLE"}]
                    </span>
                    <h1 className="wb-blog-swiss-title">{parseRichText(title)}</h1>
                    {data.subtitle && <p className="font-mono text-sm text-zinc-600 dark:text-zinc-400">{parseRichText(data.subtitle)}</p>}
                  </div>

                  {cells.length > 0 && (
                    <div
                      className="wb-blog-swiss-table-meta"
                      style={{ "--wb-swiss-cols": cells.length } as CSSProperties}
                    >
                      {cells.map((cell) => (
                        <div key={cell.label} className="wb-blog-swiss-cell">
                          <span className="wb-blog-swiss-cell-lbl">{cell.label}</span>
                          <div className="wb-blog-swiss-cell-val">{cell.value}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {data.coverImage?.url && (
                    <div className="wb-blog-swiss-img-wrap">
                      <SiteImage image={data.coverImage} className="wb-blog-swiss-img" />
                    </div>
                  )}

                  <div className="wb-blog-swiss-body">
                    <ArticleProse {...proseProps} share={proseShare} />
                  </div>
                </div>
              </div>
            );
          })()}

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
                <h1 className="wb-blog-visual-title">{parseRichText(title)}</h1>
                {hasMeta([data.authorName, data.date, data.readTime]) && (
                  <div className="flex items-center gap-3 text-xs text-white/80">
                    <MetaList items={[byline("Photo & Story by"), data.date, data.readTime]} />
                  </div>
                )}
              </div>
            </div>

            <div className="wb-blog-visual-body">
              {data.subtitle && (
                <div className="wb-blog-visual-quote-breakout">
                  "{parseRichText(data.subtitle)}"
                </div>
              )}

              <ArticleProse {...proseProps} share={proseShare} />
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
                <h1 className="wb-blog-glass-title">{parseRichText(title)}</h1>
                {data.subtitle && (
                  <p className="text-zinc-600 text-lg dark:text-zinc-400 max-w-xl mx-auto">
                    {parseRichText(data.subtitle)}
                  </p>
                )}

                {hasMeta([data.authorName, data.date, data.readTime]) && (
                  <div className="mt-4 flex items-center justify-center gap-3 text-xs text-zinc-500">
                    <MetaList items={[byline("Written by"), data.date, data.readTime]} />
                  </div>
                )}
              </div>

              {data.coverImage?.url && (
                <SiteImage image={data.coverImage} className="wb-blog-glass-featured-img" />
              )}

              <div className="max-w-2xl mx-auto">
                <ArticleProse {...proseProps} share={proseShare} />
              </div>
            </div>
          </div>
        )}
      </article>
    </SectionShell>
  );
}
