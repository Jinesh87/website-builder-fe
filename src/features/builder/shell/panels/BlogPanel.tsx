import { useState, type FormEvent } from "react";
import {
  BookOpen,
  Check,
  ChevronDown,
  Copy,
  Grid,
  Layout,
  LayoutTemplate,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  createSection,
  type BlogDetailData,
  type BlogDetailDesign,
} from "../../../../site-kit/index.ts";
import { useEditor } from "../../editor-context.ts";
import { insertSections, useBuilderPuck } from "../../puck/puck-api.ts";
import { PanelHeader, SearchField, ToolButton } from "../ui.tsx";

const BLOG_DESIGNS: {
  id: BlogDetailDesign;
  label: string;
  badge: string;
  description: string;
}[] = [
  {
    id: "minimalist-editorial",
    label: "Minimalist Editorial",
    badge: "Design 1 · Arkitect",
    description: "Centered modern header, large rounded hero image, sticky social share, clean typography.",
  },
  {
    id: "split-hero",
    label: "Split Hero Banner",
    badge: "Design 2 · Split",
    description: "Dual-column hero header with title & author on left and featured image frame on right.",
  },
  {
    id: "immersive-dark",
    label: "Immersive Dark Hero",
    badge: "Design 3 · Midnight",
    description: "Dramatic full-width dark hero with atmospheric ambient glow, white typography & reading column.",
  },
  {
    id: "magazine-classic",
    label: "Magazine Classic Gazette",
    badge: "Design 4 · Editorial",
    description: "Refined print editorial aesthetic with author sidebar and structured two-column layout.",
  },
  {
    id: "newsletter-tech",
    label: "Newsletter / Substack Style",
    badge: "Design 5 · Creator",
    description: "Creator profile header, read time, callout boxes, and bottom newsletter subscribe box.",
  },
  {
    id: "floating-card",
    label: "Modernist Floating Card",
    badge: "Design 6 · Overlap",
    description: "Wide cover image hero with the article header card floating and overlapping upward.",
  },
  {
    id: "sticky-sidebar",
    label: "Sticky Table of Contents",
    badge: "Design 7 · Outline",
    description: "Modern publication layout with sticky outline TOC, author bio widget, and share widget.",
  },
  {
    id: "swiss-brutalist",
    label: "Swiss Brutalist Grid",
    badge: "Design 8 · Brutalist",
    description: "High-contrast 1px border grid, tabular metadata, clean typography, and numbered blocks.",
  },
  {
    id: "visual-story",
    label: "Cinematic Photo Essay",
    badge: "Design 9 · Story",
    description: "Panoramic media hero with overlay, oversized statement quotes, and storytelling rhythm.",
  },
  {
    id: "glassmorphism-deck",
    label: "Glassmorphism Card Deck",
    badge: "Design 10 · Glass",
    description: "Translucent frosted glass card container with subtle ambient glow and sleek floating elements.",
  },
];

const PRESET_COVERS = [
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
];

function slugify(text: string): string {
  const clean = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `/blog/${clean || "post"}`;
}

export default function BlogPanel() {
  const { draft, page: current, editDraft, selectPage, setSiteArea, notify } = useEditor();
  const dispatch = useBuilderPuck((state) => state.dispatch);

  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [designPickerOpenId, setDesignPickerOpenId] = useState<string | null>(null);

  // New post form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Design");
  const [authorName, setAuthorName] = useState("Editorial Team");
  const [excerpt, setExcerpt] = useState("");
  const [coverUrl, setCoverUrl] = useState(PRESET_COVERS[0]!);
  const [selectedDesign, setSelectedDesign] = useState<BlogDetailDesign>("minimalist-editorial");

  // Identify all blog post pages
  const blogPages = draft.pages.filter(
    (p) => p.pageType === "BLOG" || p.slug.startsWith("/blog/") || p.slug === "/blog",
  );

  const filteredPages = blogPages.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      p.sections.some((s) => {
        if (s.type === "blog_detail") {
          const d = s.data as BlogDetailData;
          return (
            d.category?.toLowerCase().includes(q) ||
            d.title?.toLowerCase().includes(q)
          );
        }
        return false;
      })
    );
  });

  const count = useBuilderPuck((state) => state.appState.data.content.length);

  // Insert blog grid onto current page
  function handleInsertBlogGrid() {
    const section = createSection("blog");
    insertSections(dispatch, [section], count);
    notify("Blog cards section added to page");
  }

  // Create a new blog post page
  function handleCreatePost(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const postSlug = slugify(title);
    // Ensure slug uniqueness
    const takenSlugs = new Set(draft.pages.map((p) => p.slug));
    let uniqueSlug = postSlug;
    let counter = 2;
    while (takenSlugs.has(uniqueSlug)) {
      uniqueSlug = `${postSlug}-${counter}`;
      counter++;
    }

    const detailSection = createSection("blog_detail", {
      data: {
        design: selectedDesign,
        title: title.trim(),
        subtitle: excerpt.trim() || undefined,
        category: category.trim() || "General",
        date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        authorName: authorName.trim() || "Author",
        authorRole: "Contributor",
        readTime: "5 Min",
        coverImage: {
          url: coverUrl,
          alt: title.trim(),
        },
        content: [
          {
            heading: "Introduction",
            paragraphs: [
              excerpt.trim() ||
                "Write your article introduction here. Elaborate on the core premise and provide compelling context for the reader.",
              "Expand on key observations, background insights, and real-world examples that bring this topic to life.",
            ],
            quote: "Clarity of vision yields clarity of structure.",
          },
          {
            heading: "Key perspectives",
            paragraphs: [
              "Continue exploring your narrative with structured sub-points, evidence, and actionable takeaways.",
            ],
            callout: "Highlight pivotal learnings or essential tips in dedicated callout boxes for readers skimming the piece.",
          },
        ],
        tags: [category.trim() || "Blog", "Article"],
      },
    });

    const newPage = {
      id: crypto.randomUUID(),
      name: title.trim(),
      slug: uniqueSlug,
      pageType: "BLOG" as const,
      visible: true,
      showInNav: false,
      seoTitle: `${title.trim()} | Blog`,
      seoDescription: excerpt.trim() || `Read ${title.trim()} on our blog.`,
      seoKeywords: [category.trim()],
      sections: [detailSection],
    };

    editDraft((d) => ({
      ...d,
      pages: [...d.pages, newPage],
    }));

    // Reset and select
    setTitle("");
    setExcerpt("");
    setCreating(false);
    selectPage(newPage.id);
    setSiteArea("page");
    notify(`Created blog post: ${newPage.name}`);
  }

  // Switch a blog page's design
  function handleSwitchDesign(pageId: string, newDesign: BlogDetailDesign) {
    editDraft((d) => ({
      ...d,
      pages: d.pages.map((p) => {
        if (p.id !== pageId) return p;
        const nextSections = p.sections.map((s) => {
          if (s.type === "blog_detail") {
            const data = s.data as BlogDetailData;
            return {
              ...s,
              data: {
                ...data,
                design: newDesign,
              },
            };
          }
          return s;
        });
        return { ...p, sections: nextSections };
      }),
    }));
    setDesignPickerOpenId(null);
    notify(`Layout switched to ${BLOG_DESIGNS.find((d) => d.id === newDesign)?.label}`);
  }

  // Duplicate a blog post
  function handleDuplicate(pageId: string) {
    const target = draft.pages.find((p) => p.id === pageId);
    if (!target) return;

    const copySlug = `${target.slug}-copy`;
    const cloned = {
      ...structuredClone(target),
      id: crypto.randomUUID(),
      name: `${target.name} (Copy)`,
      slug: copySlug,
    };

    editDraft((d) => ({
      ...d,
      pages: [...d.pages, cloned],
    }));
    selectPage(cloned.id);
    notify(`Duplicated post: ${cloned.name}`);
  }

  // Delete a blog post
  function handleDelete(pageId: string) {
    const target = draft.pages.find((p) => p.id === pageId);
    if (!target) return;
    if (confirm(`Delete blog post "${target.name}"?`)) {
      editDraft((d) => ({
        ...d,
        pages: d.pages.filter((p) => p.id !== pageId),
      }));
      if (current.id === pageId) {
        const fallback = draft.pages.find((p) => p.id !== pageId) ?? draft.pages[0];
        if (fallback) selectPage(fallback.id);
      }
      notify(`Deleted "${target.name}"`);
    }
  }

  // Generate 3 sample blog posts if list is empty
  function handleGenerateStarterPosts() {
    const p1 = {
      id: crypto.randomUUID(),
      name: "The influence of modern architecture",
      slug: "/blog/influence-of-modern-architecture",
      pageType: "BLOG" as const,
      visible: true,
      showInNav: false,
      seoTitle: "The influence of modern architecture",
      seoDescription: "An exploration into modern minimalist architecture and design principles.",
      seoKeywords: ["Design", "Architecture"],
      sections: [
        createSection("blog_detail", {
          data: {
            design: "minimalist-editorial",
            title: "The influence of modern architecture",
            subtitle: "Nibh sed pulvinar proin gravida hendrerit lectus a. Consequat mauris nunc congue nisi vitae suscipit tellus mauris a. Cursus metus aliquam.",
            category: "DESIGN",
            date: "July 21, 2024",
            authorName: "Jakob Gronberg",
            authorRole: "Lead Architectural Designer",
            authorBio: "Jakob Gronberg explores tectonic expression, geometric clarity, and material permanence in contemporary urban design.",
            readTime: "12 Min",
            coverImage: {
              url: PRESET_COVERS[0]!,
              alt: "The influence of modern architecture",
            },
            coverImageCaption: "Skyscrapers rising against a clear horizon in Copenhagen.",
            content: [
              {
                heading: "Elit ullamcorper dignissim",
                paragraphs: [
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Elit ullamcorper dignissim cras tincidunt. Enim neque volutpat ac tincidunt vitae.",
                  "Nunc sed blandit libero volutpat sed. Tristique sollicitudin nibh sit amet commodo. Sit amet justo donec enim diam vulputate ut pharetra. Quis imperdiet massa tincidunt nunc pulvinar sapien et ligula ullamcorper.",
                ],
                quote: "Architecture is the learned game, correct and magnificent, of forms assembled in the light.",
                quoteAuthor: "Le Corbusier",
              },
              {
                heading: "Hendrerit dolor magna",
                paragraphs: [
                  "Tristique sollicitudin nibh sit amet commodo. Sit amet justo donec enim diam vulputate ut pharetra. Quis imperdiet massa tincidunt nunc pulvinar sapien et ligula ullamcorper. Massa vitae tortor condimentum lacinia quis vel.",
                ],
                callout: "Simplicity in architectural geometry often requires the most complex structural precision behind the facade.",
              },
            ],
            tags: ["Architecture", "Design Systems", "Urbanism"],
          },
        }),
      ],
    };

    const p2 = {
      id: crypto.randomUUID(),
      name: "How to write a sponsorship letter",
      slug: "/blog/how-to-write-a-sponsorship-letter",
      pageType: "BLOG" as const,
      visible: true,
      showInNav: false,
      seoTitle: "How to write a sponsorship letter",
      seoDescription: "A practical guide to securing sponsorships with high-converting outreach.",
      seoKeywords: ["Partnerships", "Sponsorship"],
      sections: [
        createSection("blog_detail", {
          data: {
            design: "split-hero",
            title: "How to write a sponsorship letter that converts",
            subtitle: "Turn cold sponsor inquiries into enthusiastic partners with this structured blueprint.",
            category: "TIPS",
            date: "June 14, 2024",
            authorName: "Maya Lin",
            authorRole: "Partnerships Lead",
            readTime: "8 Min",
            coverImage: {
              url: PRESET_COVERS[1]!,
              alt: "Writing sponsorship letter",
            },
            content: [
              {
                heading: "Know your audience before writing",
                paragraphs: [
                  "Corporate partners evaluate sponsorship proposals based on alignment, audience engagement, and tangible ROI.",
                  "Lead with what the sponsor gains, rather than merely requesting monetary assistance.",
                ],
                callout: "Personalize the first two sentences to demonstrate you know the sponsor's current quarterly objectives.",
              },
            ],
            tags: ["Outreach", "Sponsorship", "Strategy"],
          },
        }),
      ],
    };

    const p3 = {
      id: crypto.randomUUID(),
      name: "Donor pyramid strategies",
      slug: "/blog/donor-pyramid-strategies",
      pageType: "BLOG" as const,
      visible: true,
      showInNav: false,
      seoTitle: "Donor pyramid strategies",
      seoDescription: "How to maximize retention and contribution levels across donor segments.",
      seoKeywords: ["Fundraising", "Retention"],
      sections: [
        createSection("blog_detail", {
          data: {
            design: "magazine-classic",
            title: "How to use your donor pyramid to build donation strategies",
            subtitle: "Segmenting contributions to build resilient, recurring funding models.",
            category: "GROWTH",
            date: "May 29, 2024",
            authorName: "Alex Rivera",
            authorRole: "Development Strategist",
            readTime: "10 Min",
            coverImage: {
              url: PRESET_COVERS[2]!,
              alt: "Donor pyramid strategy",
            },
            content: [
              {
                heading: "The anatomy of an active pyramid",
                paragraphs: [
                  "At the base are your grassroots one-time givers. The goal of your communication strategy is gradual upward mobility.",
                ],
              },
            ],
            tags: ["Fundraising", "Nonprofit", "Donors"],
          },
        }),
      ],
    };

    editDraft((d) => ({
      ...d,
      pages: [...d.pages, p1, p2, p3],
    }));
    selectPage(p1.id);
    notify("Added 3 starter blog posts!");
  }

  return (
    <>
      <PanelHeader
        title="Blog"
        description={`${blogPages.length} blog ${blogPages.length === 1 ? "page" : "pages"}`}
        actions={
          <ToolButton label="Create new blog post" size="sm" onClick={() => setCreating(true)}>
            <Plus className="size-4" aria-hidden />
          </ToolButton>
        }
      />

      <div className="flex flex-col gap-2 p-2 border-b border-ed-border bg-ed-panel">
        <button
          type="button"
          onClick={handleInsertBlogGrid}
          className="flex w-full items-center justify-center gap-2 rounded-ed border border-ed-accent/30 bg-ed-accent/10 px-3 py-2 text-ed-xs font-semibold text-ed-accent hover:bg-ed-accent hover:text-white transition-colors"
        >
          <Grid className="size-3.5" />
          Insert Blog Grid onto page
        </button>

        <SearchField value={query} onChange={setQuery} placeholder="Search blog posts…" />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
        {/* Create Post Form */}
        {creating && (
          <form
            onSubmit={handleCreatePost}
            className="mb-3 flex flex-col gap-2.5 rounded-ed border border-ed-accent/40 bg-ed-subtle p-3 shadow-ed-pop"
          >
            <div className="flex items-center justify-between border-b border-ed-border pb-1.5">
              <span className="text-ed-xs font-bold text-ed-text">New blog post</span>
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="text-ed-xs text-ed-muted hover:text-ed-text"
              >
                Cancel
              </button>
            </div>

            <div>
              <label htmlFor="post-title" className="block text-[11px] font-semibold text-ed-text mb-1">
                Post Title *
              </label>
              <input
                id="post-title"
                autoFocus
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The influence of modern architecture"
                className="w-full h-8 rounded-ed border border-ed-border bg-ed-panel px-2.5 text-ed-sm focus:border-ed-accent focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="post-category" className="block text-[11px] font-semibold text-ed-text mb-1">
                  Category
                </label>
                <input
                  id="post-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Design, Tips"
                  className="w-full h-7 rounded-ed border border-ed-border bg-ed-panel px-2 text-ed-xs focus:border-ed-accent focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="post-author" className="block text-[11px] font-semibold text-ed-text mb-1">
                  Author
                </label>
                <input
                  id="post-author"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Jakob Gronberg"
                  className="w-full h-7 rounded-ed border border-ed-border bg-ed-panel px-2 text-ed-xs focus:border-ed-accent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="post-excerpt" className="block text-[11px] font-semibold text-ed-text mb-1">
                Short Excerpt / Deck
              </label>
              <textarea
                id="post-excerpt"
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief summary introducing the article…"
                className="w-full rounded-ed border border-ed-border bg-ed-panel p-2 text-ed-xs focus:border-ed-accent focus:outline-none resize-none"
              />
            </div>

            {/* Layout Design Selection */}
            <div>
              <label className="block text-[11px] font-semibold text-ed-text mb-1">
                Select Layout Design (1 of 10)
              </label>
              <select
                value={selectedDesign}
                onChange={(e) => setSelectedDesign(e.target.value as BlogDetailDesign)}
                className="w-full h-8 rounded-ed border border-ed-border bg-ed-panel px-2 text-ed-xs focus:border-ed-accent focus:outline-none font-medium text-ed-text"
              >
                {BLOG_DESIGNS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.badge} — {d.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[10.5px] text-ed-muted">
                {BLOG_DESIGNS.find((d) => d.id === selectedDesign)?.description}
              </p>
            </div>

            {/* Cover image picker */}
            <div>
              <label className="block text-[11px] font-semibold text-ed-text mb-1">Featured Cover Image</label>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {PRESET_COVERS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCoverUrl(url)}
                    className={`relative size-12 shrink-0 rounded-ed overflow-hidden border-2 transition-all ${
                      coverUrl === url ? "border-ed-accent scale-105" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={url} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1 border-t border-ed-border">
              <button
                type="submit"
                disabled={!title.trim()}
                className="flex-1 h-7 rounded-ed bg-ed-accent text-ed-xs font-semibold text-white hover:bg-ed-accent-hover disabled:opacity-50"
              >
                Create Blog Post
              </button>
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="h-7 px-3 rounded-ed border border-ed-border text-ed-xs text-ed-muted hover:bg-ed-hover"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Empty State */}
        {filteredPages.length === 0 && !creating && (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="grid size-12 place-items-center rounded-full bg-ed-subtle text-ed-muted mb-3">
              <BookOpen className="size-6" />
            </div>
            <h3 className="text-ed-sm font-semibold text-ed-text mb-1">No blog posts yet</h3>
            <p className="text-ed-xs text-ed-muted mb-4 max-w-xs">
              Create articles with 10 distinct, modern layouts, or add starter posts with 1 click.
            </p>
            <div className="flex flex-col gap-2 w-full">
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="flex items-center justify-center gap-1.5 rounded-ed bg-ed-accent px-3 py-2 text-ed-xs font-semibold text-white hover:bg-ed-accent-hover"
              >
                <Plus className="size-3.5" />
                Create New Post
              </button>
              <button
                type="button"
                onClick={handleGenerateStarterPosts}
                className="flex items-center justify-center gap-1.5 rounded-ed border border-ed-border px-3 py-2 text-ed-xs font-medium text-ed-text hover:bg-ed-hover"
              >
                <Sparkles className="size-3.5 text-ed-accent" />
                Add 3 Starter Posts
              </button>
            </div>
          </div>
        )}

        {/* Blog Post Cards List */}
        <div className="flex flex-col gap-2">
          {filteredPages.map((p) => {
            const isActive = p.id === current.id;
            const detailSec = p.sections.find((s) => s.type === "blog_detail");
            const data = (detailSec?.data as BlogDetailData) || {};
            const currentDesign = data.design || "minimalist-editorial";
            const designObj = BLOG_DESIGNS.find((d) => d.id === currentDesign);
            const coverImage = data.coverImage?.url || PRESET_COVERS[0];

            return (
              <div
                key={p.id}
                className={`group relative flex flex-col rounded-ed-lg border transition-all ${
                  isActive
                    ? "border-ed-accent bg-ed-accent/5 shadow-xs"
                    : "border-ed-border bg-ed-panel hover:border-ed-border-hover hover:bg-ed-subtle"
                }`}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    selectPage(p.id);
                    setSiteArea("page");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      selectPage(p.id);
                      setSiteArea("page");
                    }
                  }}
                  className="flex items-start gap-3 p-2.5 text-left cursor-pointer"
                >
                  {/* Thumbnail */}
                  <div className="relative size-14 shrink-0 rounded-ed overflow-hidden bg-zinc-200 dark:bg-zinc-800 border border-ed-border">
                    <img src={coverImage} alt="" className="size-full object-cover" />
                    {isActive && (
                      <span className="absolute inset-0 bg-ed-accent/20 flex items-center justify-center">
                        <Check className="size-4 text-white drop-shadow" />
                      </span>
                    )}
                  </div>

                  {/* Title & Metadata */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {data.category && (
                        <span className="rounded-full bg-ed-accent/15 px-1.5 py-0.2 text-[9.5px] font-bold uppercase tracking-wider text-ed-accent">
                          {data.category}
                        </span>
                      )}
                      <span className="text-[10px] text-ed-faint font-mono truncate">{p.slug}</span>
                    </div>

                    <h4
                      className={`truncate text-ed-sm font-semibold ${
                        isActive ? "text-ed-accent" : "text-ed-text"
                      }`}
                    >
                      {p.name}
                    </h4>

                    {/* Layout Design Tag */}
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-ed-muted">
                      <Layout className="size-3 text-ed-accent" />
                      <span className="font-medium text-ed-text truncate">{designObj?.label}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Design Switcher & Actions Row */}
                <div className="flex items-center justify-between border-t border-ed-border/70 px-2.5 py-1.5 bg-ed-subtle/50 text-ed-xs">
                  {/* Design selector dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDesignPickerOpenId(designPickerOpenId === p.id ? null : p.id);
                      }}
                      className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-ed-accent hover:bg-ed-accent/10 transition-colors"
                    >
                      <LayoutTemplate className="size-3" />
                      <span>Switch Layout (10)</span>
                      <ChevronDown className="size-2.5" />
                    </button>

                    {designPickerOpenId === p.id && (
                      <div className="absolute left-0 bottom-full mb-1 z-50 w-64 rounded-ed-lg border border-ed-border bg-ed-panel p-1.5 shadow-ed-pop">
                        <div className="px-2 py-1 text-[10.5px] font-bold text-ed-muted uppercase tracking-wider border-b border-ed-border mb-1">
                          Choose Blog Detail Layout
                        </div>
                        <div className="max-h-56 overflow-y-auto flex flex-col gap-0.5">
                          {BLOG_DESIGNS.map((d) => (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => handleSwitchDesign(p.id, d.id)}
                              className={`flex flex-col items-start rounded p-1.5 text-left transition-colors ${
                                currentDesign === d.id
                                  ? "bg-ed-accent-soft text-ed-accent font-semibold"
                                  : "hover:bg-ed-hover text-ed-text"
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="text-ed-xs">{d.label}</span>
                                <span className="text-[9.5px] text-ed-faint">{d.badge}</span>
                              </div>
                              <span className="text-[10px] text-ed-muted line-clamp-1">{d.description}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-0.5">
                    <ToolButton label="Duplicate post" size="sm" onClick={() => handleDuplicate(p.id)}>
                      <Copy className="size-3" />
                    </ToolButton>
                    <ToolButton label="Delete post" size="sm" tone="danger" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="size-3" />
                    </ToolButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
